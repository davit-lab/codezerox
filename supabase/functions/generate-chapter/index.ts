import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY") ?? "";
const AGENT_ID = Deno.env.get("MISTRAL_AGENT_ID") ?? "ag_019d35f6f06f753d9e0e64ebe3bdecf3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { chapterId, courseId } = await req.json();
    if (!chapterId || !courseId) {
      return new Response(JSON.stringify({ error: "Missing chapterId or courseId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check subscription
    const { data: sub } = await supabaseAdmin
      .from("course_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (!sub || new Date(sub.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "აქტიური გამოწერა არ გაქვთ" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    if (sub.last_chapter_generated_at === today) {
      return new Response(JSON.stringify({ error: "დღევანდელი ლიმიტი ამოიწურა" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get chapter info
    const { data: chapter } = await supabaseAdmin
      .from("course_chapters")
      .select("*")
      .eq("id", chapterId)
      .single();

    if (!chapter) {
      return new Response(JSON.stringify({ error: "თავი ვერ მოიძებნა" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return existing content
    if (chapter.content && chapter.content.trim().length > 100) {
      return new Response(JSON.stringify({ content: chapter.content, fromCache: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get course info
    const { data: course } = await supabaseAdmin
      .from("courses")
      .select("title, description")
      .eq("id", courseId)
      .single();

    // Get chapter list
    const { data: nearbyChapters } = await supabaseAdmin
      .from("course_chapters")
      .select("chapter_number, title")
      .eq("course_id", courseId)
      .order("chapter_number", { ascending: true });

    const chapterList = nearbyChapters?.map(c => `${c.chapter_number}. ${c.title}`).join("\n") || "";

    // Shorter prompt for faster generation
    const userPrompt = `დაწერე თავი "${chapter.title}" კურსიდან "${course?.title || "კიბერუსაფრთხოება"}".

სილაბუსი:
${chapterList}

მოთხოვნები:
- წერე ქართულად, აკადემიურად
- 2000-3000 სიტყვა
- Markdown: სათაურები, სიები, კოდის ბლოკები
- Python/Bash მაგალითები
- საკვანძო ტერმინები (10)
- პრაქტიკული სავარჯიშოები (3-5)
- შეჯამება ბოლოს

${chapter.description ? `თავის აღწერა: ${chapter.description}` : ""}`;

    // API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 sec

    const response = await fetch("https://api.mistral.ai/v1/conversations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
        agent_version: 0,
        inputs: [{ role: "user", content: userPrompt }]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "გენერაცია ვერ მოხერხდა" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data?.outputs?.[0]?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "კონტენტი ცარიელია" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save content
    await supabaseAdmin
      .from("course_chapters")
      .update({ content })
      .eq("id", chapterId);

    // Update limit
    await supabaseAdmin
      .from("course_subscriptions")
      .update({ last_chapter_generated_at: today })
      .eq("id", sub.id);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "სერვერის შეცდომა" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
