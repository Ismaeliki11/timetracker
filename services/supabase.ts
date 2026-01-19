import { createClient } from '@supabase/supabase-js';

// NOTE: Ideally these should be in a .env.local file as:
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("WARNING: Supabase Environment Variables are missing! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Fallback to avoid immediate crash during build/render effectively preventing "White Screen of Death"
// but backend calls will fail.
const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
    isConfigured ? supabaseAnonKey : 'placeholder'
);

export const isSupabaseConfigured = isConfigured;
