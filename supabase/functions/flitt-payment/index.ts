import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLITT_URL = "https://pay.flitt.com/api/checkout/url";

async function sha1(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Flitt signature: sha1 of secret_key + all non-empty params (alphabetical) joined by '|'
async function buildSignature(secretKey: string, params: Record<string, any>): Promise<string> {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();
  const parts = [secretKey, ...keys.map((k) => String(params[k]))];
  return await sha1(parts.join("|"));
}

async function getSettings(admin: any): Promise<Record<string, string>> {
  const { data } = await admin
    .from("payment_settings")
    .select("setting_key, setting_value, is_active")
    .eq("provider", "flitt");
  if (!data?.length) throw new Error("Flitt არ არის კონფიგურირებული");
  const active = data.some((s: any) => s.is_active);
  if (!active) throw new Error("Flitt გადახდა გამორთულია");
  const out: Record<string, string> = {};
  for (const s of data) out[s.setting_key] = s.setting_value;
  if (!out.merchant_id || !out.secret_key) throw new Error("Flitt: merchant_id ან secret_key არ არის");
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const admin = createClient(supabaseUrl, service);

    const body = await req.json();
    const { action } = body;

    // ===== CALLBACK from Flitt (no auth) =====
    if (action === "callback") {
      const payload = body.payload || body;
      console.log("Flitt callback:", JSON.stringify(payload));

      const settings = await getSettings(admin);
      const { signature, response_signature_string, ...rest } = payload;

      // Verify signature
      const computed = await buildSignature(settings.secret_key, rest);
      if (signature && computed !== signature) {
        console.error("Signature mismatch", { computed, received: signature });
        return new Response(JSON.stringify({ error: "bad signature" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const transactionId = payload.order_id;
      const orderStatus = payload.order_status;
      const finalStatus = orderStatus === "approved" ? "completed"
        : orderStatus === "declined" ? "failed"
        : orderStatus === "reversed" ? "cancelled"
        : "processing";

      const { data: txn } = await admin.from("bank_transactions").select("*").eq("id", transactionId).maybeSingle();
      if (!txn) return new Response(JSON.stringify({ error: "txn not found" }), { status: 404, headers: corsHeaders });

      await admin.from("bank_transactions").update({
        status: finalStatus,
        bank_status: orderStatus,
        bank_order_id: String(payload.payment_id || ""),
        callback_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", transactionId);

      // Process purchases on success
      if (finalStatus === "completed" && txn.items && txn.status !== "completed") {
        for (const item of txn.items as any[]) {
          if (item.type === "book" && item.book_id) {
            await admin.from("purchases").insert({ user_id: txn.user_id, book_id: item.book_id });
          } else if (item.type === "credit_package" && item.package_id) {
            await admin.from("credit_purchases").insert({
              user_id: txn.user_id, package_id: item.package_id,
              credits: item.credits || 0, amount_gel: item.price || 0, status: "completed",
            });
            await admin.rpc("add_user_credits", { _user_id: txn.user_id, _amount: item.credits || 0 });
          }
        }
      }

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ===== Authenticated actions =====
    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    if (action === "initiate") {
      const { items, discount, site_credits_used } = body;
      let totalAmount = (items || []).reduce((s: number, i: any) => s + (i.price || 0), 0);
      const creditsUsed = Math.max(0, Number(site_credits_used) || 0);
      if (creditsUsed > 0) {
        const { data: wallet } = await admin
          .from("site_credits_wallet")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!wallet || Number(wallet.balance) < creditsUsed) {
          return new Response(JSON.stringify({ error: "არასაკმარისი საიტის კრედიტი" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Deduct credits
        console.log("Deducting credits:", { userId: user.id, creditsUsed });
        const { data: spendResult, error: spendError } = await admin.rpc("spend_site_credits", {
          _user_id: user.id,
          _amount: creditsUsed,
          _reason: "გადახდა (ნაწილობრივი)",
          _ref_id: `payment_${Date.now()}`,
        });
        console.log("Spend credits result:", { spendResult, spendError });
        if (spendError) {
          console.error("Failed to spend credits:", spendError);
          return new Response(JSON.stringify({ error: "კრედიტის ჩამოჭრა ვერ მოხერხდა: " + spendError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (discount && discount > 0) totalAmount = Math.max(0, totalAmount - discount);
      if (creditsUsed > 0) totalAmount = Math.max(0, totalAmount - creditsUsed);
      if (totalAmount <= 0) return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400, headers: corsHeaders });

      const settings = await getSettings(admin);

      const txnItems = creditsUsed > 0
        ? [...(items || []), { type: "site_credits", amount: creditsUsed }]
        : items;

      const { data: txn, error: txnErr } = await admin.from("bank_transactions").insert({
        user_id: user.id, provider: "flitt", amount: totalAmount, currency: "GEL",
        status: "pending", items: txnItems, discount_amount: (discount || 0) + creditsUsed,
      }).select("id").single();
      if (txnErr || !txn) throw new Error("ტრანზაქცია ვერ შეიქმნა");

      const transactionId = txn.id;
      const siteUrl = (req.headers.get("origin") || "https://codezero.ge").replace(/\/$/, "");
      const responseUrl = `${siteUrl}/payment-status?order_id=${transactionId}`;
      const callbackUrl = `${supabaseUrl}/functions/v1/flitt-payment-callback`;

      const params: Record<string, any> = {
        order_id: transactionId,
        merchant_id: Number(settings.merchant_id),
        order_desc: `CodeZero შეკვეთა #${transactionId.slice(0, 8)}`,
        amount: Math.round(totalAmount * 100), // tetri
        currency: "GEL",
        response_url: responseUrl,
        server_callback_url: callbackUrl,
      };
      const signature = await buildSignature(settings.secret_key, params);

      const flittRes = await fetch(FLITT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: { ...params, signature } }),
      });
      const flittData = await flittRes.json();
      console.log("Flitt response:", JSON.stringify(flittData));

      if (flittData?.response?.response_status !== "success") {
        const msg = flittData?.response?.error_message || "Flitt გადახდის შექმნა ვერ მოხერხდა";
        await admin.from("bank_transactions").update({ status: "failed", error_message: msg }).eq("id", transactionId);
        throw new Error(msg);
      }

      await admin.from("bank_transactions").update({
        status: "processing",
        bank_order_id: String(flittData.response.payment_id || ""),
      }).eq("id", transactionId);

      return new Response(JSON.stringify({
        success: true,
        payment_url: flittData.response.checkout_url,
        transaction_id: transactionId,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "check_status") {
      const { transaction_id } = body;
      const { data: txn } = await userClient.from("bank_transactions").select("*").eq("id", transaction_id).maybeSingle();
      if (!txn) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify({ status: txn.status, amount: txn.amount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (e) {
    console.error("Flitt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
