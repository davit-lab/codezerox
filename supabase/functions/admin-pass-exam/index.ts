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

    // Verify caller is admin
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

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, examId } = await req.json();

    if (!userId || !examId) {
      return new Response(JSON.stringify({ error: "userId and examId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get exam info
    const { data: exam, error: examError } = await supabase
      .from("certification_exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a passed attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: userId,
        exam_id: examId,
        score: exam.total_questions,
        total_questions: exam.total_questions,
        passed: true,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (attemptError) {
      return new Response(JSON.stringify({ error: attemptError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("exam_id", examId)
      .maybeSingle();

    let certificateNumber = null;

    if (!existing) {
      const certNum = `CZ-${exam.slug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      await supabase.from("certificates").insert({
        user_id: userId,
        exam_id: examId,
        attempt_id: attempt.id,
        certificate_number: certNum,
      });
      certificateNumber = certNum;

      // Award XP
      await supabase.rpc("award_xp", {
        _user_id: userId,
        _amount: 100,
        _action: "certification_pass",
        _ref: examId,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      attemptId: attempt.id,
      certificateNumber,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
