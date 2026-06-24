import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dgflkqkoipoqepzwvxcq.supabase.co',
  'sb_publishable_ekyj2-rNM5J4sP2Ezkoe7A_OgVKi90M'
);

async function diagnose() {
  console.log("Checking profiles table...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  
  if (pError) {
    console.error("Error fetching profiles:", pError.message);
  } else {
    console.log("Profiles found:", profiles?.length);
    profiles?.forEach(p => console.log(`- ${p.email} (${p.role})`));
  }

  console.log("\nAttempting login with abdallaha.f1572@gmail.com...");
  const { data: authData, error: aError } = await supabase.auth.signInWithPassword({
    email: 'abdallaha.f1572@gmail.com',
    password: 'Password123!'
  });

  if (aError) {
    console.error("Auth Error:", aError.message);
  } else {
    console.log("Auth Success. User UUID:", authData.user?.id);
    
    console.log("Checking specific profile for this user...");
    const { data: profile, error: spError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (spError) {
      console.error("Profile Fetch Error:", spError.message);
    } else {
      console.log("Profile Found:", profile.full_name, profile.role);
    }
  }
}

diagnose();
