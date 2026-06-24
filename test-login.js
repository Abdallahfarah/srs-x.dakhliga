import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dgflkqkoipoqepzwvxcq.supabase.co',
  'sb_publishable_ekyj2-rNM5J4sP2Ezkoe7A_OgVKi90M'
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'abdallaha.f1572@gmail.com',
    password: 'Password123!'
  });

  if (error) {
    console.error('SERVER ERROR:', error.message);
  } else {
    console.log('SERVER SUCCESS. User ID:', data.user?.id);
  }
}

testLogin();
