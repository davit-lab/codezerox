import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const enc = new TextEncoder();

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

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

    const { challengeId, flag, hintsUsed = 0 } = await req.json();
    if (!challengeId || !flag || typeof flag !== "string") {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(url, service);

    // Rate limit: max 10 attempts/min per user/challenge
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count: recent } = await admin.from("cyberrange_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id).eq("challenge_id", challengeId).gte("submitted_at", since);
    if ((recent ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: chal } = await admin.from("cyberrange_challenges")
      .select("id, base_points, flag_hash, status, solves_count")
      .eq("id", challengeId).maybeSingle();
    if (!chal || chal.status !== "published") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "";
    const ipHash = ip ? await sha256(ip) : null;

    const submitted = await sha256(flag.trim());
    const ok = constantTimeEqual(submitted, chal.flag_hash);

    await admin.from("cyberrange_attempts").insert({
      user_id: user.id, challenge_id: chal.id, ip_hash: ipHash, success: ok,
    });

    if (!ok) {
      return new Response(JSON.stringify({ success: false, message: "არასწორი flag-ი" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Already solved?
    const { data: existing } = await admin.from("cyberrange_solves")
      .select("id").eq("user_id", user.id).eq("challenge_id", chal.id).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ success: true, alreadySolved: true, message: "უკვე ამოხსნილია" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Server-side hint count — never trust client. Counts revealed hints for this user/challenge.
    const { count: revealedHints } = await admin.from("cyberrange_hint_reveals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id).eq("challenge_id", chal.id);
    const actualHints = revealedHints ?? 0;
    const penalty = Math.min(60, Math.max(0, actualHints * 15));
    const points = Math.round(chal.base_points * (1 - penalty / 100));

    const firstBlood = (chal.solves_count ?? 0) === 0;
    const finalPoints = firstBlood ? Math.round(points * 1.25) : points;

    await admin.from("cyberrange_solves").insert({
      user_id: user.id, challenge_id: chal.id,
      points_awarded: finalPoints, hints_used: actualHints, first_blood: firstBlood,
    });

    await admin.from("cyberrange_challenges").update({ solves_count: (chal.solves_count ?? 0) + 1 }).eq("id", chal.id);

    // Update user stats
    const { data: stats } = await admin.from("cyberrange_user_stats").select("*").eq("user_id", user.id).maybeSingle();
    const newTotal = (stats?.total_points ?? 0) + finalPoints;
    const { data: rankRow } = await admin.rpc("cyberrange_rank_for_points", { _points: newTotal });
    await admin.from("cyberrange_user_stats").upsert({
      user_id: user.id,
      total_points: newTotal,
      solves_count: (stats?.solves_count ?? 0) + 1,
      rank_slug: (rankRow as any) ?? "script_kiddie",
      last_solve_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // Reward XP via existing system (Easy 50 / Med 150 / Hard 400 / Insane 800 / Flagship 1500 — base_points proxy)
    const xpAmount = finalPoints * 2;
    await admin.rpc("award_xp", { _user_id: user.id, _amount: xpAmount, _action: "cyberrange_solve", _ref: chal.id });

    return new Response(JSON.stringify({
      success: true, points: finalPoints, firstBlood, totalPoints: newTotal, rank: rankRow,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("submit-flag error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
