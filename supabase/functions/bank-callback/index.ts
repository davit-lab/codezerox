import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Callbacks can come as POST (BOG/TBC) or GET (redirect)
    let params: Record<string, string> = {};

    if (req.method === "GET") {
      const url = new URL(req.url);
      url.searchParams.forEach((v, k) => { params[k] = v; });
    } else {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        params = await req.json();
      } else {
        const formData = await req.text();
        new URLSearchParams(formData).forEach((v, k) => { params[k] = v; });
      }
    }

    console.log("Bank callback received:", JSON.stringify(params));

    // Determine transaction ID and status from callback
    const transactionId = params.shop_order_id || params.extra || params.transaction_id || params.txn;
    const bankStatus = params.status || params.payment_status || params.result_code;
    const bankOrderId = params.order_id || params.payId || params.bank_order_id;

    if (!transactionId) {
      console.error("No transaction ID in callback");
      return new Response(JSON.stringify({ error: "Missing transaction ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get existing transaction
    const { data: txn, error: txnError } = await supabaseAdmin
      .from("bank_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txnError || !txn) {
      console.error("Transaction not found:", transactionId);
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine final status
    // BOG statuses: captured, rejected, error, timeout
    // TBC statuses: Succeeded, Failed, Expired
    let finalStatus = "failed";
    const statusLower = (bankStatus || "").toLowerCase();

    if (["captured", "succeeded", "completed", "success", "ok"].includes(statusLower)) {
      finalStatus = "completed";
    } else if (["rejected", "failed", "error", "declined"].includes(statusLower)) {
      finalStatus = "failed";
    } else if (["timeout", "expired", "cancelled"].includes(statusLower)) {
      finalStatus = "cancelled";
    }

    // Cross-check amount in callback against stored transaction amount (when present)
    const callbackAmount = parseFloat(params.amount || params.total || "");
    if (!isNaN(callbackAmount) && callbackAmount > 0) {
      const expected = Number(txn.amount);
      if (Math.abs(callbackAmount - expected) > 0.01) {
        console.error(`Amount mismatch for ${transactionId}: expected ${expected}, got ${callbackAmount}`);
        await supabaseAdmin.from("bank_transactions").update({
          status: "failed",
          error_message: `Amount mismatch: expected ${expected}, got ${callbackAmount}`,
          callback_received_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", transactionId);
        return new Response(JSON.stringify({ error: "Amount mismatch" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update transaction
    await supabaseAdmin
      .from("bank_transactions")
      .update({
        status: finalStatus,
        bank_status: bankStatus,
        bank_order_id: bankOrderId || txn.bank_order_id,
        callback_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    const wasCompleted = txn.status === "completed";

    // If completed, process the purchases
    if (finalStatus === "completed" && !wasCompleted && txn.items) {
      const items = txn.items as any[];
      for (const item of items) {
        if (item.type === "site_credits" && Number(item.amount || 0) > 0) {
          await supabaseAdmin.from("site_credits_wallet").upsert({
            user_id: txn.user_id,
            balance: 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          const { data: wallet } = await supabaseAdmin
            .from("site_credits_wallet")
            .select("balance")
            .eq("user_id", txn.user_id)
            .maybeSingle();

          if (!wallet || Number(wallet.balance) < Number(item.amount)) {
            throw new Error("Insufficient site credits at callback");
          }

          await supabaseAdmin
            .from("site_credits_wallet")
            .update({
              balance: Number(wallet.balance) - Number(item.amount),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", txn.user_id);

          await supabaseAdmin.from("site_credits_transactions").insert({
            user_id: txn.user_id,
            amount: -Number(item.amount),
            type: "spend",
            reason: `Checkout (${txn.provider})`,
            ref_id: String(transactionId),
            created_by: txn.user_id,
          });
        } else if (item.type === "book" && item.book_id) {
          // Create purchase record
          await supabaseAdmin
            .from("purchases")
            .insert({ user_id: txn.user_id, book_id: item.book_id })
            .single();
        } else if (item.type === "credit_package" && item.package_id) {
          // Handle credit purchase
          await supabaseAdmin
            .from("credit_purchases")
            .insert({
              user_id: txn.user_id,
              package_id: item.package_id,
              credits: item.credits || 0,
              amount_gel: item.price || 0,
              status: "completed",
            });
          // Add credits
          await supabaseAdmin.rpc("add_user_credits", {
            _user_id: txn.user_id,
            _amount: item.credits || 0,
          });
        } else if (item.type === "exam" && item.exam_id) {
          await supabaseAdmin.from("exam_purchases").insert({
            user_id: txn.user_id,
            exam_id: item.exam_id,
            transaction_id: transactionId,
            amount_gel: item.price || 10,
          });
        }

      }
    }

    console.log(`Transaction ${transactionId} updated to ${finalStatus}`);

    return new Response(JSON.stringify({ 
      success: true, 
      status: finalStatus,
      transaction_id: transactionId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Bank callback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
