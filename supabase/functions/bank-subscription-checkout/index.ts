import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bank of Georgia API configuration
const BOG_API_KEY = Deno.env.get("BOG_API_KEY") || "";
const BOG_API_URL = "https://api.bankofgeorgia.ge";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, total, user_id, payment_method } = await req.json();

    // Validate request
    if (!items || !total || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this is a subscription purchase
    const subscriptionItem = items.find((item: any) => item.type === 'book_subscription');
    
    // Create order in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabase
      .from('bank_transactions')
      .insert({
        id: orderId,
        user_id,
        amount: total,
        currency: 'GEL',
        status: 'pending',
        provider: 'bank_of_georgia',
        items: items,
      });

    if (orderError) {
      throw new Error('Failed to create order');
    }

    // If subscription, create pending subscription record
    if (subscriptionItem) {
      const { error: subError } = await supabase
        .from('book_subscriptions')
        .insert({
          user_id,
          plan_id: subscriptionItem.plan_id,
          status: 'pending',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_reference: orderId,
        });

      if (subError) {
        throw new Error('Failed to create subscription record');
      }
    }

    // Create Bank of Georgia payment session
    const paymentData = {
      order_id: orderId,
      amount: total,
      currency: 'GEL',
      description: subscriptionItem ? 'Book Subscription' : 'Book Purchase',
      return_url: `${Deno.env.get("SITE_URL")}/payment/success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/payment/cancel`,
      callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/bank-subscription-callback`,
    };

    const response = await fetch(`${BOG_API_URL}/payment/v1/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Bank payment creation failed');
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        redirect_url: data.payment_url,
        order_id: orderId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
