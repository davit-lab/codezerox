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

    // Get user from auth header
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

    const { attemptId, answers } = await req.json();

    if (!attemptId || !answers || typeof answers !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("*, certification_exams(*)")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .is("completed_at", null)
      .single();

    if (attemptError || !attempt) {
      return new Response(JSON.stringify({ error: "Attempt not found or already completed" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get questions for this exam
    const { data: questions } = await supabase
      .from("exam_questions")
      .select("id, correct_option")
      .eq("exam_id", attempt.exam_id)
      .order("sort_order", { ascending: true });

    if (!questions) {
      return new Response(JSON.stringify({ error: "Questions not found" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate score (case-insensitive option compare)
    let score = 0;
    const correctAnswers: Record<string, string> = {};
    for (const q of questions) {
      const user_ans = String(answers[q.id] ?? "").trim().toLowerCase();
      const correct = String(q.correct_option ?? "").trim().toLowerCase();
      correctAnswers[q.id] = q.correct_option;
      if (user_ans && user_ans === correct) score++;
    }

    const exam = attempt.certification_exams;
    const passed = score >= exam.pass_threshold;

    // Update attempt
    await supabase
      .from("exam_attempts")
      .update({
        score,
        passed,
        answers,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    let certificateNumber = null;
    let certificateId = null;

    // If passed, create certificate
    if (passed) {
      // Check if already has certificate for this exam
      const { data: existing } = await supabase
        .from("certificates")
        .select("id, certificate_number")
        .eq("user_id", user.id)
        .eq("exam_id", attempt.exam_id)
        .maybeSingle();

      if (!existing) {
        const certNum = `CZ-${exam.slug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const { data: newCert } = await supabase
          .from("certificates")
          .insert({
            user_id: user.id,
            exam_id: attempt.exam_id,
            attempt_id: attemptId,
            certificate_number: certNum,
          })
          .select('id')
          .single();
        certificateNumber = certNum;
        certificateId = newCert?.id || null;
      } else {
        certificateNumber = existing.certificate_number;
        certificateId = existing.id;
      }

      // Award XP
      await supabase.rpc("award_xp", {
        _user_id: user.id,
        _amount: 100,
        _action: "certification_pass",
        _ref: attempt.exam_id,
      });
    }

    // Return correct answers for debugging (remove in production)
    return new Response(JSON.stringify({
      score,
      totalQuestions: questions.length,
      passThreshold: exam.pass_threshold,
      passed,
      certificateNumber,
      certificateId,
      correctAnswers,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
