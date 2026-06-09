import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ valid: false, reason: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ valid: false, reason: "Invalid email format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract domain
    const domain = email.split("@")[1].toLowerCase();

    // Check for common disposable email domains
    const disposableDomains = [
      "tempmail.com", "throwaway.email", "guerrillamail.com", "10minutemail.com",
      "mailinator.com", "yopmail.com", "tempail.com", "fakeinbox.com", 
      "trashmail.com", "getnada.com", "temp-mail.org", "disposablemail.com"
    ];

    if (disposableDomains.includes(domain)) {
      return new Response(
        JSON.stringify({ valid: false, reason: "Disposable email addresses are not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check MX records using DNS lookup
    try {
      const dnsResponse = await fetch(
        `https://dns.google/resolve?name=${domain}&type=MX`
      );
      const dnsData = await dnsResponse.json();

      // Check if MX records exist
      if (!dnsData.Answer || dnsData.Answer.length === 0) {
        // Try A record as fallback (some domains accept email without MX)
        const aResponse = await fetch(
          `https://dns.google/resolve?name=${domain}&type=A`
        );
        const aData = await aResponse.json();

        if (!aData.Answer || aData.Answer.length === 0) {
          return new Response(
            JSON.stringify({ valid: false, reason: "Email domain does not exist" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (dnsError) {
      console.error("DNS lookup error:", dnsError);
      // If DNS lookup fails, allow the email (fail open for better UX)
      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Email validation error:", error);
    return new Response(
      JSON.stringify({ valid: false, reason: "Validation failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
