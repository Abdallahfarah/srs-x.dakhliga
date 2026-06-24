import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function investigateSchema() {
  console.log('--- Database Connection Check ---');
  console.log('Project URL:', supabaseUrl);
  
  // 1. Try to fetch one row from information_schema via RPC if available, 
  // or just try to select * from shops and catch error
  console.log('\n--- Checking shops table structure ---');
  
  // We can't directly query information_schema via PostgREST unless there's a view/function
  // But we can try a select with an intentional error or use the system columns
  
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching shops:', error);
    } else {
      console.log('Successfully fetched from shops.');
      if (data && data.length > 0) {
        console.log('Keys in shop record:', Object.keys(data[0]));
        if (Object.keys(data[0]).includes('t_number')) {
          console.log('✅ Found t_number in shops table.');
        } else {
          console.log('❌ t_number NOT found in shops table.');
        }
      } else {
        console.log('No shops found to inspect keys.');
      }
    }
  } catch (err) {
    console.error('Exception during select:', err);
  }

  // 2. Try to fetch specifically t_number
  console.log('\n--- Attempting direct t_number select ---');
  const { data: tData, error: tError } = await supabase
    .from('shops')
    .select('t_number')
    .limit(1);
    
  if (tError) {
    console.error('Error selecting t_number:', tError.message);
  } else {
    console.log('✅ Direct selection of t_number succeeded.');
  }
}

await investigateSchema();
