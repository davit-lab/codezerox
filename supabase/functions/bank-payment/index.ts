import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// BOG iPay API endpoints
const BOG_API = "https://ipay.ge/opay/api";
// TBC E-Commerce API endpoints  
const TBC_API = "https://api.tbcbank.ge/v1/tpay";

interface PaymentSettings {
  provider: string;
  setting_key: string;
  setting_value: string;
  is_active: boolean;
}

async function getProviderSettings(supabaseAdmin: any, provider: string): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from("payment_settings")
    .select("setting_key, setting_value, is_active")
    .eq("provider", provider);

  if (error || !data?.length) throw new Error(`${provider} პარამეტრები არ მოიძებნა`);
  
  const isActive = data.some((s: PaymentSettings) => s.is_active);
  if (!isActive) throw new Error(`${provider} გადახდა გამორთულია`);

  const settings: Record<string, string> = {};
  for (const s of data) {
    settings[s.setting_key] = s.setting_value;
  }
  return settings;
}

// ==================== BOG iPay ====================
async function initBogPayment(settings: Record<string, string>, amount: number, transactionId: string, callbackUrl: string) {
  const clientId = settings.client_id;
  const secretKey = settings.secret_key;

  if (!clientId || !secretKey) {
    throw new Error("BOG: Client ID ან Secret Key არ არის კონფიგურირებული");
  }

  // Step 1: Get auth token
  const authRes = await fetch("https://ipay.ge/opay/api/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: secretKey,
    }),
  });

  if (!authRes.ok) {
    const errText = await authRes.text();
    console.error("BOG auth error:", errText);
    throw new Error("BOG ავტორიზაცია ვერ მოხერხდა");
  }

  const authData = await authRes.json();
  const accessToken = authData.access_token;

  // Step 2: Create order
  const orderRes = await fetch("https://ipay.ge/opay/api/v1/checkout/orders", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      items: [{
        amount: amount.toFixed(2),
        description: "შეკვეთა",
        quantity: "1",
        product_id: transactionId,
      }],
      locale: "ka",
      shop_order_id: transactionId,
      redirect_url: callbackUrl,
      show_shop_order_id_on_extract: true,
      capture_method: "AUTOMATIC",
      purchase_units: [{
        amount: {
          currency_code: "GEL",
          value: amount.toFixed(2),
        },
      }],
    }),
  });

  if (!orderRes.ok) {
    const errText = await orderRes.text();
    console.error("BOG order error:", errText);
    throw new Error("BOG შეკვეთის შექმნა ვერ მოხერხდა");
  }

  const orderData = await orderRes.json();
  console.log("BOG order created:", orderData);

  return {
    bank_order_id: orderData.order_id,
    payment_url: orderData.links?.redirect || orderData.redirect_url || `https://ipay.ge/opay/api/v1/checkout/orders/${orderData.order_id}/payment`,
  };
}

// ==================== TBC E-Commerce ====================
async function initTbcPayment(settings: Record<string, string>, amount: number, transactionId: string, callbackUrl: string) {
  const apiKey = settings.api_key;
  const clientId = settings.client_id;
  const secretKey = settings.secret_key;

  if (!apiKey || !clientId || !secretKey) {
    throw new Error("TBC: API Key, Client ID ან Secret Key არ არის კონფიგურირებული");
  }

  // Step 1: Get auth token
  const authRes = await fetch("https://api.tbcbank.ge/v1/tpay/access-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "apikey": apiKey,
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: secretKey,
    }),
  });

  if (!authRes.ok) {
    const errText = await authRes.text();
    console.error("TBC auth error:", errText);
    throw new Error("TBC ავტორიზაცია ვერ მოხერხდა");
  }

  const authData = await authRes.json();
  const accessToken = authData.access_token;

  // Step 2: Create payment
  const paymentRes = await fetch("https://api.tbcbank.ge/v1/tpay/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "apikey": apiKey,
    },
    body: JSON.stringify({
      amount: {
        currency: "GEL",
        total: amount,
        subTotal: amount,
        tax: 0,
        shipping: 0,
      },
      returnurl: callbackUrl,
      extra: transactionId,
      methods: [5], // 5 = card payment
      installmentProducts: [],
    }),
  });

  if (!paymentRes.ok) {
    const errText = await paymentRes.text();
    console.error("TBC payment error:", errText);
    throw new Error("TBC გადახდის შექმნა ვერ მოხერხდა");
  }

  const paymentData = await paymentRes.json();
  console.log("TBC payment created:", paymentData);

  return {
    bank_order_id: paymentData.payId,
    payment_url: paymentData.links?.find((l: any) => l.rel === "approve")?.uri || paymentData.uri,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Auth client (user context)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // Admin client (for reading payment_settings)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const body = await req.json();
    const { action } = body;

    // ===== INITIATE PAYMENT =====
    if (action === "initiate") {
      const { provider, items, discount, site_credits_used } = body;

      if (!provider || !["bog", "tbc"].includes(provider)) {
        return new Response(JSON.stringify({ error: "Invalid provider" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // SERVER-SIDE PRICE VALIDATION — never trust client-supplied prices.
      // Resolve canonical prices from DB for known item types.
      const validatedItems: any[] = [];
      let totalAmount = 0;
      for (const item of (items || [])) {
        let canonicalPrice = 0;
        if (item.type === "book" && item.book_id) {
          const { data: book } = await supabaseAdmin
            .from("books").select("price").eq("id", item.book_id).maybeSingle();
          if (!book) {
            return new Response(JSON.stringify({ error: `Book not found: ${item.book_id}` }), {
              status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          canonicalPrice = Number(book.price) || 0;
        } else if (item.type === "credit_package" && item.package_id) {
          const { data: pkg } = await supabaseAdmin
            .from("credit_packages").select("price_gel, credits").eq("id", item.package_id).maybeSingle();
          if (!pkg) {
            return new Response(JSON.stringify({ error: `Package not found: ${item.package_id}` }), {
              status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          canonicalPrice = Number(pkg.price_gel) || 0;
          item.credits = pkg.credits;
        } else if (item.type === "exam" && item.exam_id) {
          const { data: exam } = await supabaseAdmin
            .from("certification_exams").select("id, price_gel, is_active").eq("id", item.exam_id).maybeSingle();
          if (!exam || !exam.is_active) {
            return new Response(JSON.stringify({ error: `Exam not found: ${item.exam_id}` }), {
              status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          const { data: cfg } = await supabaseAdmin
            .from("pricing_config").select("amount_gel").eq("key", "certification_exam").maybeSingle();
          canonicalPrice = Number(cfg?.amount_gel ?? exam.price_gel) || 10;
        } else if (typeof item.pricing_key === "string") {
          const { data: cfg } = await supabaseAdmin
            .from("pricing_config").select("amount_gel").eq("key", item.pricing_key).maybeSingle();
          canonicalPrice = Number(cfg?.amount_gel) || 0;
        } else {
          return new Response(JSON.stringify({ error: "Unknown item type" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        validatedItems.push({ ...item, price: canonicalPrice });
        totalAmount += canonicalPrice;
      }


      // Validate promo code server-side
      let appliedDiscount = 0;
      if (typeof discount === "string" && discount.trim()) {
        const { data: promo } = await supabaseAdmin.rpc("validate_promo_code", { _code: discount });
        const promoRow = Array.isArray(promo) ? promo[0] : promo;
        if (promoRow) {
          appliedDiscount = promoRow.discount_type === "percentage"
            ? Math.round((totalAmount * Number(promoRow.discount_value) / 100) * 100) / 100
            : Number(promoRow.discount_value);
        }
      } else if (typeof discount === "number" && discount > 0) {
        // Numeric discount accepted only if explicit; ignored otherwise
        appliedDiscount = 0;
      }

      const creditsUsed = Math.max(0, Number(site_credits_used) || 0);
      if (creditsUsed > 0) {
        const { data: wallet } = await supabaseAdmin
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
        const { data: spendResult, error: spendError } = await supabaseAdmin.rpc("spend_site_credits", {
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

      totalAmount = Math.max(0, totalAmount - appliedDiscount - creditsUsed);

      if (totalAmount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get provider settings
      const settings = await getProviderSettings(supabaseAdmin, provider);

      // Create transaction record
      const txnItems = creditsUsed > 0
        ? [...validatedItems, { type: "site_credits", amount: creditsUsed }]
        : validatedItems;

      const { data: txn, error: txnError } = await supabaseAdmin
        .from("bank_transactions")
        .insert({
          user_id: user.id,
          provider,
          amount: totalAmount,
          currency: "GEL",
          status: "pending",
          items: txnItems,
          discount_amount: appliedDiscount + creditsUsed,
        })
        .select("id")
        .single();

      if (txnError || !txn) {
        console.error("Transaction insert error:", txnError);
        throw new Error("ტრანზაქციის შექმნა ვერ მოხერხდა");
      }

      const transactionId = txn.id;
      const siteUrl = Deno.env.get("SITE_URL") || "https://codezero.ge";
      const callbackBase = `${supabaseUrl}/functions/v1/bank-callback`;
      const callbackUrl = `${siteUrl}/payment-status?order_id=${transactionId}`;

      let result;
      if (provider === "bog") {
        result = await initBogPayment(settings, totalAmount, transactionId, callbackUrl);
      } else {
        result = await initTbcPayment(settings, totalAmount, transactionId, callbackUrl);
      }

      // Update transaction with bank order ID
      await supabaseAdmin
        .from("bank_transactions")
        .update({
          bank_order_id: result.bank_order_id,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      return new Response(JSON.stringify({
        success: true,
        payment_url: result.payment_url,
        transaction_id: transactionId,
        bank_order_id: result.bank_order_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== CHECK PAYMENT STATUS =====
    if (action === "check_status") {
      const { transaction_id } = body;

      const { data: txn, error } = await supabaseClient
        .from("bank_transactions")
        .select("*")
        .eq("id", transaction_id)
        .single();

      if (error || !txn) {
        return new Response(JSON.stringify({ error: "Transaction not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        status: txn.status,
        provider: txn.provider,
        amount: txn.amount,
        bank_order_id: txn.bank_order_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== GET ACTIVE PROVIDERS =====
    if (action === "get_providers") {
      const { data: settings } = await supabaseAdmin
        .from("payment_settings")
        .select("provider, is_active")
        .eq("is_active", true);

      const providers = [...new Set((settings || []).map((s: any) => s.provider))];

      return new Response(JSON.stringify({ providers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Bank payment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
