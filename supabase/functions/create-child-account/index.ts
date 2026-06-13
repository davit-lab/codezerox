import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "არ ხართ ავტორიზებული" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify parent's token
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: parent }, error: authError } = await userClient.auth.getUser();
    if (authError || !parent) {
      return new Response(JSON.stringify({ error: "ავტორიზაცია ვერ მოხერხდა" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, username, password, display_name, child_id } = await req.json();

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (action === "create") {
      // Validate inputs
      if (!username || username.length < 3 || username.length > 20) {
        return new Response(JSON.stringify({ error: "მომხმარებლის სახელი 3-20 სიმბოლო უნდა იყოს" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!password || password.length < 4) {
        return new Response(JSON.stringify({ error: "პაროლი მინიმუმ 4 სიმბოლო უნდა იყოს" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return new Response(JSON.stringify({ error: "მხოლოდ ლათინური ასოები, ციფრები და _ დაშვებულია" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check parent's child count (max 20)
      const { count } = await adminClient
        .from("parent_children")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", parent.id);

      if ((count ?? 0) >= 20) {
        return new Response(JSON.stringify({ error: "მაქსიმუმ 20 ბავშვის ანგარიში შეიძლება" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check username uniqueness
      const { data: existing } = await adminClient
        .from("parent_children")
        .select("id")
        .eq("child_username", username.toLowerCase())
        .single();

      if (existing) {
        return new Response(JSON.stringify({ error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth user with generated email
      const childEmail = `${username.toLowerCase()}@kids.codezero.internal`;
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: childEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: display_name || username, is_child: true },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: "ანგარიშის შექმნა ვერ მოხერხდა: " + createError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Assign 'child' role
      await adminClient.from("user_roles").upsert({
        user_id: newUser.user.id,
        role: "child",
      }, { onConflict: "user_id,role" });

      // Create parent-child link
      const { error: linkError } = await adminClient.from("parent_children").insert({
        parent_id: parent.id,
        child_id: newUser.user.id,
        child_username: username.toLowerCase(),
        child_display_name: display_name || username,
      });

      if (linkError) {
        // Cleanup: delete created user
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        return new Response(JSON.stringify({ error: "ბმულის შექმნა ვერ მოხერხდა" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        child: {
          id: newUser.user.id,
          username: username.toLowerCase(),
          display_name: display_name || username,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      if (!child_id) {
        return new Response(JSON.stringify({ error: "child_id საჭიროა" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify parent owns this child
      const { data: link } = await adminClient
        .from("parent_children")
        .select("id")
        .eq("parent_id", parent.id)
        .eq("child_id", child_id)
        .single();

      if (!link) {
        return new Response(JSON.stringify({ error: "ეს ბავშვის ანგარიში თქვენი არ არის" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete auth user (cascades to parent_children via FK)
      await adminClient.auth.admin.deleteUser(child_id);
      await adminClient.from("parent_children").delete().eq("child_id", child_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data: children } = await adminClient
        .from("parent_children")
        .select("*")
        .eq("parent_id", parent.id)
        .order("created_at", { ascending: true });

      // Get subscriptions for each child
      const childIds = (children || []).map((c: any) => c.child_id);
      const { data: subs } = await adminClient
        .from("kids_subscriptions")
        .select("*")
        .in("child_id", childIds.length > 0 ? childIds : ["00000000-0000-0000-0000-000000000000"]);

      return new Response(JSON.stringify({ children: children || [], subscriptions: subs || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "არასწორი action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
