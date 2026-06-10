import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

async function sha1(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function buildSignature(secretKey: string, params: Record<string, any>): Promise<string> {
  const ignore = new Set(["signature", "response_signature_string"]);
  const keys = Object.keys(params)
    .filter((k) => !ignore.has(k) && params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();
  return await sha1([secretKey, ...keys.map((k) => String(params[k]))].join("|"));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const admin = createClient(supabaseUrl, service);

    const ct = req.headers.get("content-type") || "";
    let payload: Record<string, any> = {};
    if (ct.includes("application/json")) {
      payload = await req.json();
    } else {
      const text = await req.text();
      try { payload = JSON.parse(text); }
      catch { new URLSearchParams(text).forEach((v, k) => { payload[k] = v; }); }
    }
    console.log("Flitt callback received:", JSON.stringify(payload));

    const { data: settings } = await admin
      .from("payment_settings")
      .select("setting_key, setting_value")
      .eq("provider", "flitt");
    const conf: Record<string, string> = {};
    (settings || []).forEach((s: any) => { conf[s.setting_key] = s.setting_value; });

    if (payload.signature) {
      const keysToTry = [conf.credit_secret_key, conf.secret_key].filter(Boolean);
      let valid = false;
      for (const key of keysToTry) {
        const expected = await buildSignature(key, payload);
        if (expected === payload.signature) { valid = true; break; }
      }
      if (!valid) {
        console.error("Bad signature", { received: payload.signature });
        return new Response("bad signature", { status: 400, headers: corsHeaders });
      }
    }

    const transactionId = payload.order_id;
    const orderStatus = payload.order_status;
    const finalStatus = orderStatus === "approved" ? "completed"
      : orderStatus === "declined" ? "failed"
      : orderStatus === "reversed" ? "cancelled"
      : "processing";

    const { data: txn } = await admin.from("bank_transactions").select("*").eq("id", transactionId).maybeSingle();
    if (!txn) return new Response("not found", { status: 404, headers: corsHeaders });

    const wasCompleted = txn.status === "completed";

    await admin.from("bank_transactions").update({
      status: finalStatus,
      bank_status: orderStatus,
      bank_order_id: String(payload.payment_id || txn.bank_order_id || ""),
      callback_received_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", transactionId);

    if (finalStatus === "completed" && !wasCompleted && txn.items) {
      for (const item of txn.items as any[]) {
        const t = item.type;
        if (t === "site_credits" && Number(item.amount || 0) > 0) {
          await admin.from("site_credits_wallet").upsert({
            user_id: txn.user_id,
            balance: 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          const { data: wallet } = await admin
            .from("site_credits_wallet")
            .select("balance")
            .eq("user_id", txn.user_id)
            .maybeSingle();

          if (!wallet || Number(wallet.balance) < Number(item.amount)) {
            throw new Error("Insufficient site credits at callback");
          }

          await admin
            .from("site_credits_wallet")
            .update({
              balance: Number(wallet.balance) - Number(item.amount),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", txn.user_id);

          await admin.from("site_credits_transactions").insert({
            user_id: txn.user_id,
            amount: -Number(item.amount),
            type: "spend",
            reason: `Checkout (${txn.provider})`,
            ref_id: String(transactionId),
            created_by: txn.user_id,
          });
        } else 
        if (t === "book" && item.book_id) {
          await admin.from("purchases").insert({ user_id: txn.user_id, book_id: item.book_id });
        } else if (t === "credit_package" && item.package_id) {
          await admin.from("credit_purchases").insert({
            user_id: txn.user_id, package_id: item.package_id,
            credits: item.credits || 0, amount_gel: item.price || 0, status: "completed",
          });
          await admin.rpc("add_user_credits", { _user_id: txn.user_id, _amount: item.credits || 0 });
        } else if (t === "exam" && item.exam_id) {
          await admin.from("exam_purchases").insert({
            user_id: txn.user_id,
            exam_id: item.exam_id,
            transaction_id: transactionId,
            amount_gel: item.price || 10,
          });
        } else if (t === "course" && item.course_id) {

          const expires = new Date(); expires.setMonth(expires.getMonth() + 1);
          await admin.from("course_subscriptions").insert({
            user_id: txn.user_id, course_id: item.course_id,
            status: "active", expires_at: expires.toISOString(),
          });
        } else if (t === "vacancy_package") {
          // Mark transaction with package metadata; vacancy is created by client after redirect.
          // Nothing extra to grant server-side — bank_transactions completion is the proof.
        } else if (t === "project_upload") {
          // Same — client uploads project after returning from payment.
        } else if (t === "freelancer_subscription") {
          const now = new Date();
          const expires = new Date(now); expires.setDate(expires.getDate() + 30);
          await admin.from("freelancer_subscriptions").upsert({
            user_id: txn.user_id, status: "active",
            started_at: now.toISOString(), expires_at: expires.toISOString(),
            amount_gel: item.price || 10, updated_at: now.toISOString(),
          }, { onConflict: "user_id" });
        } else if (t === "kids_activation" && item.child_id) {
          const now = new Date();
          const expires = new Date(now); expires.setDate(expires.getDate() + 30);
          await admin.from("kids_subscriptions").insert({
            child_id: item.child_id, parent_id: txn.user_id,
            status: "active", amount_gel: item.price || 50,
            started_at: now.toISOString(), expires_at: expires.toISOString(),
          });
          // In-app notification to parent
          await admin.from("notifications").insert({
            user_id: txn.user_id,
            title: "საბავშვო ანგარიში გააქტიურდა",
            body: `ანგარიში აქტიურია 30 დღით (${expires.toLocaleDateString('ka-GE')}-მდე).`,
            type: "success",
            link: "/parent",
          });
          // Try to send confirmation email (best-effort)
          try {
            const { data: parent } = await admin.auth.admin.getUserById(txn.user_id);
            const email = parent?.user?.email;
            if (email) {
              await admin.functions.invoke('send-transactional-email', {
                body: {
                  templateName: 'kids-subscription-activated',
                  recipientEmail: email,
                  idempotencyKey: `kids-activated-${transactionId}`,
                  templateData: { expiresAt: expires.toISOString() },
                },
              });
            }
          } catch (e) { console.warn("kids email send failed", e); }
        } else if (t === "mentoring" && item.package_id) {
          // package_id here is the mentoring_registrations row id
          await admin.from("mentoring_registrations").update({
            status: "paid", payment_reference: transactionId, updated_at: new Date().toISOString(),
          }).eq("id", item.package_id);
        } else if (t === "video_course" && item.course_id) {
          await admin.from("video_enrollments").upsert({
            user_id: txn.user_id,
            course_id: item.course_id,
            enrolled_at: new Date().toISOString(),
            expires_at: null,
          }, { onConflict: "user_id,course_id" });
          await admin.from("notifications").insert({
            user_id: txn.user_id,
            title: "ვიდეო კურსი გახსნილია",
            body: `კურსი "${item.name || ''}" ხელმისაწვდომია. ისწავლე ნებისმიერ დროს!`,
            type: "success",
            link: `/video-courses/${item.course_id}`,
          });
        }
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error("Callback error:", e);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
