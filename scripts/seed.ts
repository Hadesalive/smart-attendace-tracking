// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
}

// Use the service role key for admin-level access
const supabase = createClient(supabaseUrl, serviceRoleKey);

const users = [
  { email: 'admin@university.edu', password: 'password123', full_name: 'System Administrator', role: 'admin', department: 'IT' },
  { email: 'john.lecturer@university.edu', password: 'password123', full_name: 'Dr. John Smith', role: 'lecturer', department: 'Computer Science' },
  { email: 'jane.lecturer@university.edu', password: 'password123', full_name: 'Prof. Jane Doe', role: 'lecturer', department: 'Mathematics' },
  { email: 'alice.student@university.edu', password: 'password123', full_name: 'Alice Johnson', role: 'student', student_id: 'CS2021001', department: 'Computer Science' },
  { email: 'bob.student@university.edu', password: 'password123', full_name: 'Bob Wilson', role: 'student', student_id: 'CS2021002', department: 'Computer Science' },
  { email: 'charlie.student@university.edu', password: 'password123', full_name: 'Charlie Brown', role: 'student', student_id: 'MT2021001', department: 'Mathematics' },
];

async function main() {
  console.log('Starting to seed the database...');

  for (const user of users) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      console.error(`Error creating auth user for ${user.email}:`, authError.message);
    } else if (authData.user) {
      console.log(`Successfully created auth user for ${user.email}`);
      // Now insert into the public.users table
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        student_id: 'student_id' in user ? user.student_id : null,
        department: user.department,
      });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      }
    }
  }

  console.log('Finished seeding users.');
  // You can add the logic for courses and enrollments here if needed
}

main().catch((err) => {
  console.error('An error occurred during seeding:', err);
});
