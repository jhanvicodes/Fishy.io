import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Clean URL: strip trailing /rest/v1 or trailing slash if present
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')

// Fallback dummy credentials to prevent fatal runtime initialization crashes
const supabaseUrl = cleanUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey || 'dummy-anon-key'

export const isSupabaseConfigured = Boolean(cleanUrl && rawKey && rawKey !== 'dummy-anon-key')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
