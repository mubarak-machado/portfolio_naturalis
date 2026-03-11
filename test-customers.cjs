const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

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
