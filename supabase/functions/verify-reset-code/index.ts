import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find valid code
    const { data: resetCode, error: codeError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (codeError || !resetCode) {
      return new Response(JSON.stringify({ error: "არასწორი ან ვადაგასული კოდი" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Mark code as used
    await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("id", resetCode.id);

    // Find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "მომხმარებელი ვერ მოიძებნა" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return new Response(JSON.stringify({ error: "პაროლის განახლება ვერ მოხერხდა" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
