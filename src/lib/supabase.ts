import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_KEY environment variable')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)
