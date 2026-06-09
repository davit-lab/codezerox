import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const MAX_CONTEXT_MESSAGES = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Check purchases OR book subscription
    const { data: purchases } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);
    
    // Also check for active book subscription
    const { data: bookSub } = await supabase
      .from("book_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("current_period_end", new Date().toISOString())
      .limit(1);

    if ((!purchases || purchases.length === 0) && (!bookSub || bookSub.length === 0)) {
      return new Response(JSON.stringify({ error: "AI ტუტორი ხელმისაწვდომია მხოლოდ წიგნის შეძენის ან საბსქრიფშენის შემდეგ" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check credits
    const { data: credits } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const currentCredits = credits?.credits ?? 0;
    if (currentCredits < 1) {
      return new Response(JSON.stringify({ error: "არ გაქვთ საკმარისი კრედიტი" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { messages, conversationId } = await req.json();

    // Get conversation context from DB
    let contextMessages: any[] = [];
    if (conversationId) {
      const { data: dbMessages } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(MAX_CONTEXT_MESSAGES);

      if (dbMessages && dbMessages.length > 0) {
        contextMessages = dbMessages.map(m => ({ role: m.role, content: m.content }));
      }
    }

    if (messages && messages.length > 0) {
      contextMessages.push(messages[messages.length - 1]);
    }

    // Keep only last 10 messages for speed
    if (contextMessages.length > MAX_CONTEXT_MESSAGES) {
      contextMessages = contextMessages.slice(-MAX_CONTEXT_MESSAGES);
    }

    // Convert to Gemini contents format (user/model roles)
    const geminiContents = contextMessages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Gemini 2.5 Flash API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: {
            parts: [{ text: "შენ ხარ CodeZero AI — პროფესიონალი პროგრამირების AI ტუტორი. პასუხობ ქართულად. ეხმარები მომხმარებელს პროგრამირების სწავლაში, კოდის წერასა და შეცდომების გასწორებაში. იყავი მოკლე, ნათელი და მეგობრული." }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: "AI API error", details: err }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await resp.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "პასუხი ვერ მივიღე";

    // Deduct credit
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await admin.from("user_credits").update({ credits: currentCredits - 1 }).eq("user_id", user.id);

    // Return as streaming format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 30;
        let position = 0;
        
        const sendChunk = () => {
          if (position >= content.length) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
          
          const chunk = content.slice(position, position + chunkSize);
          const sseData = { choices: [{ delta: { content: chunk } }] };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`));
          position += chunkSize;
          
          setTimeout(sendChunk, 5);
        };
        
        sendChunk();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
