import { createClient } from '@supabase/supabase-js';

// Placeholders let `next build` succeed before you add real keys.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(url, key);
