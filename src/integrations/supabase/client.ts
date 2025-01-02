import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvdtxlrdkimynkfwfupo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZHR4bHJka2lteW5rZndmdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjk5NzAsImV4cCI6MjAxOTY0NTk3MH0.PzqFyqKqQqQsJYp9hEHtQw2zRPJNGUl_LN0kKDLNHtI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});