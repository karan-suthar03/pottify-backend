const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
  console.warn('⚠️  SUPABASE_URL not configured. Authentication features will not work.');
  console.log('📝 Please set up your Supabase credentials in the .env file');
}

if (!supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
  console.warn('⚠️  SUPABASE_ANON_KEY not configured. Authentication features will not work.');
}

// Only create clients if we have valid URLs
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here' && 
    supabaseKey && supabaseKey !== 'your_supabase_anon_key_here') {
  try {
    // Client for general operations
    supabase = createClient(supabaseUrl, supabaseKey);
    
    // Admin client for operations that require service role
    if (supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key_here') {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }
    
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);Ś
  }
}

module.exports = { supabase, supabaseAdmin };
