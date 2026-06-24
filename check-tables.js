import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dgflkqkoipoqepzwvxcq.supabase.co',
  'sb_publishable_ekyj2-rNM5J4sP2Ezkoe7A_OgVKi90M'
);

async function checkTables() {
  console.log("DIAGNOSTIC: Verifying Database Schema...");
  
  const tables = ['profiles', 'dagmos', 'seedkas', 'shops', 'payments', 'audit_logs'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
       console.log(`[MISSING] Table "${table}": ${error.message}`);
    } else {
       console.log(`[EXISTS] Table "${table}"`);
    }
  }
}

checkTables();
