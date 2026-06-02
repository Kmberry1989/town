import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // for prod change to your domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { x, y, z, world_id = 'main', client_req_id } = await req.json()

    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      throw new Error('x, y, z required')
    }

    // verify user from Authorization header
    const auth = req.headers.get('Authorization') ?? ''
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!, // publishable key, used only to verify JWT
      { global: { headers: { Authorization: auth } } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error('unauthorized')

    // admin client bypasses RLS for the delete
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // owner-only delete, atomic
    const { data, error } = await admin
      .from('placeables')
      .delete()
      .match({ world_id, x, y, z, owner_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'not_found_or_not_owner', x, y, z }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // success returns deleted row, triggers Realtime DELETE for all clients
    return new Response(JSON.stringify({ ...data, client_req_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})