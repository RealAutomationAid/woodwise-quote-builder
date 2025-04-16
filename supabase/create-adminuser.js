import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://frfplhezrpppfzfungwk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZnBsaGV6cnBwcGZ6ZnVuZ3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTQwMzMsImV4cCI6MjA2MDM3MDAzM30.yG0_Hcd7LLlGrU7GNon_jyG9dumO1jkM-mh4SEJxdi0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const email = 'dotasava@abv.bg';
  const password = 'Savata619';

  // 1. Create the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'Dota',
        last_name: 'Sava'
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }

  console.log('User created:', data.user);

  // 2. Print the user ID for the next step
  if (data.user) {
    console.log('User ID:', data.user.id);
    console.log('Now update this user\'s role to admin in the "profiles" table.');
  }
}

main();