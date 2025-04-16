
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the Auth context of the function
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  {
    global: {
      headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
    },
  }
);

interface RequestBody {
  quoteId: string;
  userEmail: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId, userEmail, totalAmount, items } = await req.json() as RequestBody;

    // Fetch admin email addresses
    const { data: admins, error: adminsError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Error fetching admin users:", adminsError);
      throw new Error("Failed to fetch admin users");
    }

    // For a real production app, you would send actual emails here
    // using services like SendGrid, AWS SES, or Resend
    console.log(`New quote notification would be sent to admins for quote ${quoteId}`);
    console.log(`Customer email: ${userEmail}`);
    console.log(`Quote total: $${totalAmount}`);
    console.log(`Items: ${JSON.stringify(items)}`);

    return new Response(
      JSON.stringify({ success: true, message: "Quote notification processed" }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  } catch (error) {
    console.error("Error processing quote notification:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }
});
