import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store code
    await supabase.from("password_reset_codes").insert({
      email,
      code,
      expires_at: expiresAt,
    });

    const normalizedEmail = email.toLowerCase();
    let unsubscribeToken: string;

    const { data: existingToken } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token, used_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingToken && !existingToken.used_at) {
      unsubscribeToken = existingToken.token;
    } else {
      unsubscribeToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      await supabase
        .from("email_unsubscribe_tokens")
        .upsert({ token: unsubscribeToken, email: normalizedEmail }, { onConflict: "email" });
    }

    // Send email via Lovable Email
    const subject = "პაროლის აღდგენის კოდი - CodeZero";
    const text = [
      "პაროლის აღდგენა",
      "",
      "შეიყვანეთ ქვემოთ მოცემული კოდი პაროლის აღსადგენად:",
      code,
      "",
      "კოდი მოქმედებს 15 წუთის განმავლობაში.",
      "თუ თქვენ არ მოითხოვეთ პაროლის აღდგენა, უგულებელყოთ ეს შეტყობინება.",
      "",
      `© ${new Date().getFullYear()} CodeZero · codezero.ge`,
    ].join("\n");

    const html = `
      <div style="font-family: 'Noto Sans Georgian', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <h2 style="color: #5F13CA; font-size: 22px; margin-bottom: 16px; text-align: center;">პაროლის აღდგენა</h2>
        <p style="color: #55575d; font-size: 14px; text-align: center; margin-bottom: 24px;">შეიყვანეთ ქვემოთ მოცემული კოდი პაროლის აღსადგენად:</p>
        <div style="background: #f8f5ff; border: 1px solid rgba(95,19,202,0.2); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #5F13CA; font-family: monospace;">${code}</div>
        </div>
        <p style="color: #999999; font-size: 12px; text-align: center;">კოდი მოქმედებს 15 წუთის განმავლობაში.</p>
        <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 8px;">თუ თქვენ არ მოითხოვეთ პაროლის აღდგენა, უგულებელყოფეთ ეს შეტყობინება.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #cccccc; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} CodeZero · codezero.ge</p>
      </div>
    `;

    await sendEmail({
      to: email,
      from: "CodeZero Academy <academy@codezero.ge>",
      subject,
      html,
      text,
    });

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