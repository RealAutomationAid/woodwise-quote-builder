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
    const {
      searchTerm,
      categoryIds,
      materialTypes,
      minLength,
      maxLength,
      isPlaned,
      minPrice,
      maxPrice,
      inStock,
      sortField = "created_at",
      sortDirection = "desc",
    } = await req.json();

    // Build the query
    const { data, error, count } = await supabaseClient.rpc(
      'search_products',
      {
        search_term: searchTerm,
        category_ids: categoryIds,
        material_types: materialTypes,
        min_length: minLength,
        max_length: maxLength,
        is_planed: isPlaned,
        min_price: minPrice,
        max_price: maxPrice,
        in_stock: inStock,
        sort_field: sortField,
        sort_direction: sortDirection
      },
      { count: 'exact' }
    );

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ data, count }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error("Error in advanced-search-products function:", error);
    
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