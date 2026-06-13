import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Disabled: one-time migration endpoint removed for security.
// Previously exposed full user lists without authentication.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: "This endpoint has been disabled." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
