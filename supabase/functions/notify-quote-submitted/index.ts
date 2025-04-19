// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the Auth context of the function
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use service role key for admin operations
  {
    global: {
      headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
    },
  }
);

interface NewQuoteRequestBody {
  type: 'new_quote';
  quoteId: string;
  userEmail: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface StatusChangeRequestBody {
  type: 'status_change';
  quoteId: string;
  userId: string;
  status: string;
  quoteNumber: string;
}

type RequestBody = NewQuoteRequestBody | StatusChangeRequestBody;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json() as RequestBody;
    
    // Fetch admin users
    const { data: admins, error: adminsError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Error fetching admin users:", adminsError);
      throw new Error("Failed to fetch admin users");
    }

    // Handle different notification types
    if (requestBody.type === 'new_quote') {
      const { quoteId, userEmail, totalAmount, items } = requestBody;
      
      // For a real production app, you would send actual emails here
      console.log(`New quote notification would be sent to admins for quote ${quoteId}`);
      console.log(`Customer email: ${userEmail}`);
      console.log(`Quote total: $${totalAmount}`);
      
      // In-app notifications: Notify admins of new quote
      for (const admin of admins || []) {
        try {
          await supabaseClient.from('notifications').insert({ 
            user_id: admin.id,
            type: 'new_quote',
            message: `Нова оферта получена`,
            quote_id: quoteId
          });
        } catch (error) {
          console.error(`Failed to notify admin ${admin.id}:`, error);
          // Continue with other admins even if one fails
        }
      }
      
      // Notify submitting user
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
        
      if (!profileError && userProfile) {
        try {
          await supabaseClient.from('notifications').insert({ 
            user_id: userProfile.id,
            type: 'quote_submitted',
            message: `Вашата оферта е получена`,
            quote_id: quoteId
          });
        } catch (error) {
          console.error('Failed to notify user:', error);
        }
      }
    } 
    // Handle status change notifications
    else if (requestBody.type === 'status_change') {
      const { quoteId, userId, status, quoteNumber } = requestBody;
      
      // Notify the quote owner
      if (userId) {
        try {
          await supabaseClient.from('notifications').insert({ 
            user_id: userId,
            type: 'quote_status_change',
            message: `Оферта ${quoteNumber} е със статус: ${status}`,
            quote_id: quoteId
          });
        } catch (error) {
          console.error('Failed to notify quote owner:', error);
        }
      }
      
      // Notify admins about important status changes
      if (['pending', 'completed', 'ready'].includes(status)) {
        for (const admin of admins || []) {
          // Skip if admin is the quote owner
          if (admin.id === userId) continue;
          
          try {
            await supabaseClient.from('notifications').insert({ 
              user_id: admin.id,
              type: 'quote_status_change',
              message: `Оферта ${quoteNumber} е със статус: ${status}`,
              quote_id: quoteId
            });
          } catch (error) {
            console.error(`Failed to notify admin ${admin.id}:`, error);
            // Continue with other admins even if one fails
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed successfully" }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    
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
