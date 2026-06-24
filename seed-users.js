import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dgflkqkoipoqepzwvxcq.supabase.co',
  'sb_publishable_ekyj2-rNM5J4sP2Ezkoe7A_OgVKi90M'
);

async function seedUser(email, password, fullName, role) {
  console.log(`Attempting to create: ${email}`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  });

  if (error) {
    console.error(`Failed to create ${email}:`, error.message);
  } else {
    console.log(`Success! Created ${email}`);
    if (!data.session) {
      console.log(`Note: Email confirmation might still be required if you haven't turned it off.`);
    }
  }
}

async function run() {
  await seedUser('abdallaha.f1572@gmail.com', 'Password123!', 'Abdallah', 'SUPER_ADMIN');
  console.log('Script complete.');
  process.exit(0);
}

run();
