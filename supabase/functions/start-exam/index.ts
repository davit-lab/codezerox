import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { examId } = await req.json();

    // Get exam details
    const { data: exam } = await supabase
      .from("certification_exams")
      .select("*")
      .eq("id", examId)
      .eq("is_active", true)
      .single();

    if (!exam) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find an unconsumed paid attempt for this exam
    const { data: purchase } = await supabase
      .from("exam_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("exam_id", examId)
      .is("consumed_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!purchase) {
      return new Response(JSON.stringify({ error: "გადახდა საჭიროა გამოცდის დასაწყებად", needs_payment: true }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        exam_id: examId,
        total_questions: exam.total_questions,
      })
      .select()
      .single();

    if (attemptError) {
      return new Response(JSON.stringify({ error: "Failed to start exam" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark purchase consumed
    await supabase.from("exam_purchases")
      .update({ consumed_at: new Date().toISOString(), attempt_id: attempt.id })
      .eq("id", purchase.id);


    // Get questions (without correct answers) and shuffle randomly
    const { data: questions } = await supabase
      .from("exam_questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, difficulty")
      .eq("exam_id", examId);

    // Fisher-Yates shuffle for random order each attempt
    const shuffled = [...(questions || [])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return new Response(JSON.stringify({
      attemptId: attempt.id,
      examName: exam.name,
      timeLimit: exam.time_limit_minutes,
      passThreshold: exam.pass_threshold,
      questions: shuffled,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
