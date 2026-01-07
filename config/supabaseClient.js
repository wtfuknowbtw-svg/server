const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-url');

if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase is in MOCK MODE. Database features will be simulated.');
}

// Using Service Role Key for backend admin privileges if available, otherwise Anon key
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = supabase;
