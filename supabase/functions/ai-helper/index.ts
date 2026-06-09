import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user to prevent anonymous abuse of paid AI API
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const userMessage = body.messages?.[body.messages.length - 1]?.content || "გამარჯობა";

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    // Real AI API call
    const apiUrl = Deno.env.get("GROQ_API_URL") || "https://api.groq.com/openai/v1/chat/completions";
    const model = Deno.env.get("GROQ_MODEL") || "llama-3.1-8b-instant";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "შენ ხარ CodeZero - ქართული პროგრამირების ასისტენტი codezero.academy-დან. პასხი მხოლოდ ქართულად." },
          { role: "user", content: userMessage }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: "API Error", 
        status: response.status,
        message: data.error?.message || "Unknown error"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = data.choices?.[0]?.message?.content || "უპასუხო";

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
