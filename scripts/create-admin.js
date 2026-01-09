const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odyhpykufdkrjptcuoaw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keWhweWt1ZmRrcmpwdGN1b2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYxMjY5MywiZXhwIjoyMDgzMTg4NjkzfQ.1OVTDEuUVMssFm9kqlUk5TAPd4R9uoU6En-romq9ETw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@jog.com.vn';
  const password = 'AdminPassword123!';
  
  console.log('Creating admin user...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'System Admin', role: 'admin' }
  });

  if (error) {
    console.error('Error creating admin auth user:', error.message);
    // If user already exists, we might just want to update the profile
    if (error.message.includes('already registered')) {
        console.log('User already exists, checking profiles...');
    } else {
        return;
    }
  }

  const userId = data?.user?.id;
  if (!userId) {
      // Try to find the user by email if they already exist
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === email);
      if (existingUser) {
          console.log('Found existing user:', existingUser.id);
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: existingUser.id,
            email,
            full_name: 'System Admin',
            role: 'admin'
          });
          if (profileError) console.error('Error updating profile:', profileError.message);
          else console.log('Admin profile updated.');
      }
      return;
  }

  console.log('Admin auth user created:', userId);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: 'System Admin',
    role: 'admin'
  });

  if (profileError) {
    console.error('Error creating admin profile:', profileError.message);
  } else {
    console.log('Admin profile created successfully.');
  }
}

createAdmin();