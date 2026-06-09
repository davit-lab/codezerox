import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// Manual payment confirmation endpoint.
// Security: the receiving user_id is taken from the link's intended_user_id (set by admin),
// not from caller-supplied query params, to prevent privilege assignment to arbitrary users.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const admin = createClient(supabaseUrl, service);

    const url = new URL(req.url);
    let token = url.searchParams.get("token");

    if (!token && (req.method === "POST")) {
      try {
        const body = await req.json();
        token = token || body.token;
      } catch {}
    }

    if (!token) {
      return new Response(JSON.stringify({ error: "token required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: link } = await admin
      .from("manual_payment_links")
      .select("*")
      .eq("callback_token", token)
      .eq("is_active", true)
      .maybeSingle();

    if (!link) {
      return new Response(JSON.stringify({ error: "invalid token" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine recipient user:
    // 1. Prefer link.intended_user_id (set at link creation, server-side)
    // 2. Fallback to the authenticated caller's auth.uid()
    let userId: string | null = link.intended_user_id ?? null;
    if (!userId) {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (authHeader.startsWith("Bearer ")) {
        const user = createClient(supabaseUrl, anon, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: authUser } } = await user.auth.getUser();
        userId = authUser?.id ?? null;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "no recipient user — sign in or set intended_user_id" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Grant access
    if (link.book_id) {
      const { data: existing } = await admin
        .from("purchases").select("id")
        .eq("user_id", userId).eq("book_id", link.book_id).maybeSingle();
      if (!existing) {
        await admin.from("purchases").insert({ user_id: userId, book_id: link.book_id });
      }
    }

    // Log transaction
    await admin.from("bank_transactions").insert({
      user_id: userId,
      provider: "manual",
      amount: link.amount || 0,
      currency: link.currency,
      status: "completed",
      bank_order_id: link.id,
      items: [{ type: link.book_id ? "book" : "manual", book_id: link.book_id, price: link.amount }],
      callback_received_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true, granted: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
