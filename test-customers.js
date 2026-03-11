import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log("Testing customers query...");
  const { data, error } = await supabase
    .from('customers')
    .select(`
        *,
        sales (
            id,
            total_amount,
            created_at,
            status
        )
    `)
    .order('name');
    
  console.log("Error:", error);
  console.log("Data length:", data?.length);
}
test();
