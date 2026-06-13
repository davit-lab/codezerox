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

    const { challengeId, stepId, answer } = await req.json();
    if (!challengeId || !stepId) {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(url, service);

    // Get challenge and step
    const { data: challenge } = await admin.from("cyberrange_challenges")
      .select("id, base_points, status, engine")
      .eq("id", challengeId).maybeSingle();
    if (!challenge || challenge.status !== "published" || challenge.engine !== "interactive") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: step } = await admin.from("cyberrange_interactive_steps")
      .select("*")
      .eq("id", stepId).maybeSingle();
    if (!step || step.challenge_id !== challengeId) {
      return new Response(JSON.stringify({ error: "step_not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate answer if expected_answer exists
    let correct = true;
    if (step.expected_answer && step.expected_answer.trim() !== "") {
      const userAns = String(answer ?? "").trim().toLowerCase();
      const expected = step.expected_answer.trim().toLowerCase();
      correct = userAns === expected;
    }

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
        status: "started",
        current_step_id: correct ? (step.next_step_on_success ?? stepId) : stepId,
        updated_at: new Date().toISOString(),
      });
    } else {
      await admin.from("cyberrange_user_progress").update({
        current_step_id: correct ? (step.next_step_on_success ?? stepId) : progress.current_step_id,
        updated_at: new Date().toISOString(),
      }).eq("id", progress.id);
    }

    // Check if this was the last step
    const { data: remainingSteps } = await admin.from("cyberrange_interactive_steps")
      .select("id")
      .eq("challenge_id", challengeId)
      .gt("step_order", step.step_order)
      .order("step_order", { ascending: true })
      .limit(1);

    const isLastStep = !remainingSteps || remainingSteps.length === 0;
    let completed = false;
    let points = 0;

    if (correct && isLastStep) {
      // Mark as completed if not already
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
        // Update stats
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
        completed = true;
      }
      await admin.from("cyberrange_user_progress").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        points_earned: points,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id).eq("challenge_id", challengeId);
    }

    return new Response(JSON.stringify({
      correct,
      completed,
      points,
      nextStepId: correct ? step.next_step_on_success : null,
      hint: step.hint_ka,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("submit-interactive error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
