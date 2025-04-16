
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm, category, sortBy, filters } = await req.json();

    // Build the query
    let query = supabaseClient
      .from("products")
      .select(`
        *,
        categories:category_id (name, parent_id)
      `);

    // Apply search term if provided
    if (searchTerm && searchTerm.trim() !== "") {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    // Apply category filter if provided
    if (category) {
      query = query.eq("category_id", category);
    }

    // Apply additional filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply sorting if provided
    if (sortBy) {
      const [field, direction] = sortBy.split(":");
      query = query.order(field, { ascending: direction === "asc" });
    } else {
      // Default sorting
      query = query.order("created_at", { ascending: false });
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ data }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error("Error in search-products function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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
