
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if the development@automationaid.eu user exists
    const { data: existingAdmin, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", (await supabaseAdmin.auth.admin.listUsers({ filter: { email: "development@automationaid.eu" } })).data.users[0]?.id)
      .single();

    if (adminError) {
      console.error("Error checking admin user:", adminError);
    }

    // Ensure admin role for the development@automationaid.eu user if exists
    if (existingAdmin && existingAdmin.id) {
      await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", existingAdmin.id);
    }

    // Check if support@automationaid.eu exists
    const { data: existingSupportUsers } = await supabaseAdmin.auth.admin.listUsers({ 
      filter: { email: "support@automationaid.eu" }
    });

    // Create support user if it doesn't exist
    if (!existingSupportUsers.users.length) {
      const { data: supportUser, error: supportUserError } = await supabaseAdmin.auth.admin.createUser({
        email: "support@automationaid.eu",
        password: "Savata619",
        email_confirm: true,
        user_metadata: {
          first_name: "Support",
          last_name: "Team"
        }
      });

      if (supportUserError) {
        throw supportUserError;
      }

      // Set admin role for support user
      if (supportUser?.user) {
        await supabaseAdmin
          .from("profiles")
          .upsert({
            id: supportUser.user.id,
            role: "admin",
            first_name: "Support",
            last_name: "Team"
          });
      }
    } else {
      // Update existing support user to have admin role
      await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", existingSupportUsers.users[0].id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
