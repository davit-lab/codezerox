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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;

    // Delete user data in order (foreign key constraints)
    const tables = [
      { table: "user_roles", column: "user_id" },
      { table: "user_credits", column: "user_id" },
      { table: "user_xp", column: "user_id" },
      { table: "xp_transactions", column: "user_id" },
      { table: "purchases", column: "user_id" },
      { table: "reading_progress", column: "user_id" },
      { table: "book_bookmarks", column: "user_id" },
      { table: "book_reviews", column: "user_id" },
      { table: "community_messages", column: "user_id" },
      { table: "message_reactions", column: "user_id" },
      { table: "chat_messages", column: "sender_id" },
      { table: "chat_rooms", column: "user_id" },
      { table: "ai_chat_messages", column: "user_id" },
      { table: "ai_conversations", column: "user_id" },
      { table: "credit_purchases", column: "user_id" },
      { table: "user_notifications", column: "user_id" },
      { table: "exam_attempts", column: "user_id" },
      { table: "exam_assignment_submissions", column: "user_id" },
      { table: "certificates", column: "user_id" },
      { table: "course_purchases", column: "user_id" },
      { table: "user_course_progress", column: "user_id" },
      { table: "course_chapter_reads", column: "user_id" },
      { table: "course_subscriptions", column: "user_id" },
      { table: "hub_project_comments", column: "user_id" },
      { table: "hub_project_likes", column: "user_id" },
      { table: "hub_projects", column: "user_id" },
      { table: "code_snippets", column: "user_id" },
      { table: "blog_comments", column: "user_id" },
      { table: "gifts", column: "sender_id" },
      { table: "gifts", column: "recipient_id" },
      { table: "direct_messages", column: "sender_id" },
      { table: "bank_transactions", column: "user_id" },
      { table: "payments", column: "user_id" },
      { table: "freelancer_profiles", column: "user_id" },
      { table: "profiles", column: "user_id" },
    ];

    for (const { table, column } of tables) {
      await adminClient.from(table).delete().eq(column, userId);
    }

    // Delete from auth.users
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
