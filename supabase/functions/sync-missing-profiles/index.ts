import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // List all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    
    if (usersError) throw usersError;

    const results: string[] = [];

    for (const user of users || []) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        // Create missing profile
        const { error: insertError } = await supabase.from("profiles").insert({
          user_id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
        });

        if (insertError) {
          results.push(`❌ ${user.email}: ${insertError.message}`);
        } else {
          results.push(`✅ ${user.email}: profile created`);
        }

        // Also ensure user_roles exists
        const { data: role } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!role) {
          await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "user",
          });
          results.push(`  ↳ role created for ${user.email}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        total_auth_users: users?.length || 0,
        synced: results.length > 0 ? results : ["All profiles already in sync"] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
