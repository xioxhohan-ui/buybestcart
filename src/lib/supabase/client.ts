import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqydjbdzwmttbnubgtbx.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeWRqYmR6d210dGJudWJndGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTk3ODksImV4cCI6MjEwMjYzNTc4OX0.hVss9w0qqIMw_NK1FJjQU16wW3tIqFUrMCDUZb3gKyQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
