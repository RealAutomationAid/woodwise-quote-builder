import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request payload
    const { record, type } = await req.json()

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    if (!record || !record.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Handle quote status changes
    if (type === 'UPDATE' && record.status) {
      // Fetch the original quote to get more details
      const { data: quote, error: quoteError } = await supabaseClient
        .from('quotes')
        .select('id, user_id, quote_number')
        .eq('id', record.id)
        .single()

      if (quoteError) {
        console.error('Error fetching quote details:', quoteError)
        throw quoteError
      }

      // Notify the quote owner
      if (quote.user_id) {
        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: quote.user_id,
            type: 'quote_status_change',
            message: `Оферта ${quote.quote_number} е със статус: ${record.status}`,
            quote_id: record.id,
          })

        if (notificationError) {
          console.error('Error inserting owner notification:', notificationError)
          throw notificationError
        }
      }

      // Notify admins if the status is new or changed to something important
      if (record.status === 'pending' || record.status === 'ready' || record.status === 'completed') {
        // Get all admin users
        const { data: admins, error: adminsError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('role', 'admin')

        if (adminsError) {
          console.error('Error fetching admin profiles:', adminsError)
          throw adminsError
        }

        // Send notification to each admin
        for (const admin of admins || []) {
          // Skip if admin is the quote owner
          if (admin.id === quote.user_id) continue

          const { error: adminNotificationError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: admin.id,
              type: 'quote_status_change',
              message: `Оферта ${quote.quote_number} е със статус: ${record.status}`,
              quote_id: record.id,
            })

          if (adminNotificationError) {
            console.error(`Error inserting admin notification for ${admin.id}:`, adminNotificationError)
            // Continue with other admins even if one fails
          }
        }
      }
    }

    // Return a success response
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}) 