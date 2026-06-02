import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const data = JSON.parse(readFileSync(join(__dirname, '../src/data.json'), 'utf8'));

// Insert in batches of 100 to avoid timeouts
const BATCH_SIZE = 100;

async function migrate() {
  console.log(`📦 Migrating ${data.length} use cases to Supabase...`);
  
  let inserted = 0;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE).map(item => ({
      company: item.company || '',
      industry: item.industry || '',
      category: item.category || '',
      description: item.description || ''
    }));

    const { error } = await supabase.from('use_cases').insert(batch);
    
    if (error) {
      console.error(`❌ Error at batch ${i}-${i + BATCH_SIZE}:`, error.message);
      process.exit(1);
    }
    
    inserted += batch.length;
    console.log(`✅ ${inserted}/${data.length} inserted...`);
  }

  console.log(`\n🎉 Migration complete! ${inserted} use cases now live on Supabase.`);
}

migrate();
