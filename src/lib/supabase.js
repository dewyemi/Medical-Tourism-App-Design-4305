import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://swmekhbbpbznussstafv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWVraGJicGJ6bnVzc3N0YWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDY4MjYsImV4cCI6MjA2NzA4MjgyNn0.BDOzJkJbqRJdLq_BFUyWjky8k6CRusmrucvVYbwIA8Q'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>' ){
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'emirafrik-medical-tourism'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Add connection health check
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    console.warn('Supabase connection check failed:', error.message);
    return { connected: false, error: error.message };
  }
};

export default supabase;