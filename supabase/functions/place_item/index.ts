import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase = createClient(supabaseUrl, serviceKey)

serve(async (req) => {
  try {
    const { item_id, x, y, z, rotation_index } = await req.json()
    const { data, error } = await supabase.from('placeables')
      .insert({ item_id, x, y, z, rotation_index })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'GRID_OCCUPIED' }), { status: 409 })
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true, row: data }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
