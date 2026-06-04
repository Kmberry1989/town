import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL!
const key = import.meta.env.VITE_SUPABASE_ANON_KEY!

console.log(url)
console.log(key.slice(0, 10) + '...')

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false,      // <-- no localStorage, no locks
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: { eventsPerSecond: 20 }
  }
})