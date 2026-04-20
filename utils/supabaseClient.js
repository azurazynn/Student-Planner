import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://snuiqkwcxhmiudmbxtat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudWlxa3djeGhtaXVkbWJ4dGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTU1NTMsImV4cCI6MjA5MDY5MTU1M30.es2w4Z1PJ63yyfuSZacngWy9A-25MMDsoNOz0rfP8TM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);