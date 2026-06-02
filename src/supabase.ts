import { createClient } from '@supabase/supabase-js'
import { get, set } from 'idb-keyval'
import { useStore } from './store'
import { Placeable } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON as string
export const supabase = createClient(url, anon)

let lastSync = new Date(0).toISOString()

export async function hydrate() {
  const cached = await get<Placeable[]>('placeables-cache')
  if (cached) useStore.getState().setMany(cached)
  const { data, error } = await supabase.from('placeables').select('*').limit(5000)
  if (!error && data) {
    useStore.getState().setMany(data as Placeable[])
    await set('placeables-cache', data)
    lastSync = new Date().toISOString()
  }
}

export function subscribeChanges(onChange: () => void) {
  const channel = supabase.channel('placeables')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'placeables' }, (payload) => {
      const state = useStore.getState()
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        state.upsert(payload.new as Placeable)
      } else if (payload.eventType === 'DELETE') {
        const old = payload.old as Placeable
        state.remove(`${old.x},${old.y},${old.z}`)
      }
      onChange()
    })
    .subscribe()
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const { data } = await supabase.from('placeables').select('*').gt('updated_at', lastSync).limit(5000)
      if (data) {
        useStore.getState().setMany(data as Placeable[])
        lastSync = new Date().toISOString()
        onChange()
      }
    }
  })
  return () => { supabase.removeChannel(channel) }
}

export async function placeIntent(item_id: string, x: number, y: number, z: number, rotation_index = 0, client_req_id = crypto.randomUUID()) {
  const { data, error } = await supabase.functions.invoke('place_item', {
    body: { item_id, x, y, z, rotation_index, client_req_id }
  })
  return { data, error }
}

export async function removeIntent(x: number, y: number, z: number) {
  const { data, error } = await supabase.functions.invoke('remove_item', {
    body: { x, y, z }
  })
  return { data, error }
}
