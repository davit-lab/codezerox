import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { challengeId, answers } = await req.json();
    if (!challengeId || !answers || typeof answers !== "object") {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(url, service);

    const { data: challenge } = await admin.from("cyberrange_challenges")
      .select("id, base_points, status, engine")
      .eq("id", challengeId).maybeSingle();
    if (!challenge || challenge.status !== "published" || challenge.engine !== "quiz") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: questions } = await admin.from("cyberrange_quiz_questions")
      .select("id, correct_option_index, points")
      .eq("challenge_id", challengeId)
      .order("sort_order", { ascending: true });

    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ error: "no_questions" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let score = 0;
    let maxScore = 0;
    const detailed: { questionId: string; correct: boolean; userAnswer: number; correctAnswer: number }[] = [];

    for (const q of questions) {
      maxScore += q.points;
      const userAns = Number(answers[q.id] ?? -1);
      const correct = userAns === q.correct_option_index;
      if (correct) score += q.points;
      detailed.push({ questionId: q.id, correct, userAnswer: userAns, correctAnswer: q.correct_option_index });
    }

    const passed = score >= Math.round(maxScore * 0.6);
    let points = 0;

    // Get or create progress
    const { data: progress } = await admin.from("cyberrange_user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (!progress) {
      await admin.from("cyberrange_user_progress").insert({
        user_id: user.id,
        challenge_id: challengeId,
        status: passed ? "completed" : "failed",
        quiz_score: score,
        quiz_answers: answers,
        points_earned: passed ? challenge.base_points : 0,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else if (progress.status !== "completed") {
      await admin.from("cyberrange_user_progress").update({
        status: passed ? "completed" : "failed",
        quiz_score: score,
        quiz_answers: answers,
        points_earned: passed ? challenge.base_points : 0,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", progress.id);
    }

    if (passed) {
      const { data: existingSolve } = await admin.from("cyberrange_solves")
        .select("id").eq("user_id", user.id).eq("challenge_id", challengeId).maybeSingle();
      if (!existingSolve) {
        points = challenge.base_points;
        await admin.from("cyberrange_solves").insert({
          user_id: user.id,
          challenge_id: challengeId,
          points_awarded: points,
          solved_at: new Date().toISOString(),
        });
        await admin.from("cyberrange_challenges")
          .update({ solves_count: (challenge.solves_count ?? 0) + 1 })
          .eq("id", challengeId);
        const { data: stats } = await admin.from("cyberrange_user_stats")
          .select("*").eq("user_id", user.id).maybeSingle();
        const newTotal = (stats?.total_points ?? 0) + points;
        const { data: rankRow } = await admin.rpc("cyberrange_rank_for_points", { _points: newTotal });
        await admin.from("cyberrange_user_stats").upsert({
          user_id: user.id,
          total_points: newTotal,
          solves_count: (stats?.solves_count ?? 0) + 1,
          rank_slug: (rankRow as any) ?? "script_kiddie",
          last_solve_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        await admin.rpc("award_xp", { _user_id: user.id, _amount: points * 2, _action: "cyberrange_solve", _ref: challengeId });
      }
    }

    return new Response(JSON.stringify({
      score,
      maxScore,
      passed,
      points,
      detailed,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("submit-quiz error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
