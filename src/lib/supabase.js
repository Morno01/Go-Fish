import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lavpljnapesswjzgdpln.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Wc5OKe6vPgp0LJg7zuKvTw_zUr4WFgJ'

export const supabaseMissing = false

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
