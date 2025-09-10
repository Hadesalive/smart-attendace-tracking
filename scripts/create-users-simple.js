// Simple script to create users with password "123"
// Run this with: node scripts/create-users-simple.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const users = [
  { email: 'admin@university.edu', password: '123', full_name: 'System Administrator', role: 'admin', department: 'IT' },
  { email: 'john.lecturer@university.edu', password: '123', full_name: 'Dr. John Smith', role: 'lecturer', department: 'Computer Science' },
  { email: 'jane.lecturer@university.edu', password: '123', full_name: 'Prof. Jane Doe', role: 'lecturer', department: 'Mathematics' },
  { email: 'alice.student@university.edu', password: '123', full_name: 'Alice Johnson', role: 'student', student_id: 'CS2021001', department: 'Computer Science' },
  { email: 'bob.student@university.edu', password: '123', full_name: 'Bob Wilson', role: 'student', student_id: 'CS2021002', department: 'Computer Science' },
  { email: 'charlie.student@university.edu', password: '123', full_name: 'Charlie Brown', role: 'student', student_id: 'MT2021001', department: 'Mathematics' },
];

async function createUsers() {
  console.log('🚀 Creating users with password "123"...\n');

  for (const user of users) {
    try {
      console.log(`📧 Creating: ${user.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`❌ Auth error for ${user.email}:`, authError.message);
        continue;
      }

      if (authData.user) {
        console.log(`✅ Auth user created: ${user.email}`);

        // Create profile in public.users table
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          student_id: user.student_id || null,
          department: user.department,
        });

        if (profileError) {
          console.error(`❌ Profile error for ${user.email}:`, profileError.message);
        } else {
          console.log(`✅ Profile created: ${user.full_name}\n`);
        }
      }
    } catch (error) {
      console.error(`💥 Error creating ${user.email}:`, error.message);
    }
  }

  console.log('🎉 User creation complete!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@university.edu / 123');
  console.log('Lecturer: john.lecturer@university.edu / 123');
  console.log('Lecturer: jane.lecturer@university.edu / 123');
  console.log('Student: alice.student@university.edu / 123');
  console.log('Student: bob.student@university.edu / 123');
  console.log('Student: charlie.student@university.edu / 123');
}

createUsers().catch(console.error);
