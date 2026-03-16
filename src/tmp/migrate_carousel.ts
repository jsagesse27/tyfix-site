
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function getEnv() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    }
  });
  return env;
}

const env = getEnv();
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Adding auto_carousel columns to site_settings...');
  
  // Note: rpc('run_sql') is only available if the user has created it.
  // We'll try to use direct update or just log what to do if rpc fails.
  const { error } = await supabase.rpc('run_sql', {
    sql_query: `
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS auto_carousel_enabled BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS auto_carousel_interval INTEGER NOT NULL DEFAULT 4;
    `
  });

  if (error) {
    console.error('Error adding columns via RPC:', error.message);
    console.log('Falling back to manual check...');
    
    // We can't easily run arbitrary SQL without run_sql RPC or similar.
    // However, we can try to insert a dummy row or something to check.
    // If the user's Supabase project doesn't have run_sql, they might need to run it manually.
  } else {
    console.log('Columns added successfully.');
  }
}

run();
