-- Simple SQL seed data with password "123" for all users
-- This creates users in auth.users and public.users tables
-- Note: Passwords must be set through Supabase Auth API, not direct SQL

-- Sample users data (for reference - actual auth users created via API)
-- Admin: admin@university.edu / 123
-- Lecturer: john.lecturer@university.edu / 123
-- Lecturer: jane.lecturer@university.edu / 123
-- Student: alice.student@university.edu / 123
-- Student: bob.student@university.edu / 123
-- Student: charlie.student@university.edu / 123

-- Insert users into public.users table
-- Note: You'll need to create auth users first, then use their IDs here
-- For now, we'll use placeholder UUIDs - replace with actual auth user IDs

INSERT INTO users (id, email, full_name, role, student_id, department) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@university.edu', 'System Administrator', 'admin', NULL, 'IT'),
('550e8400-e29b-41d4-a716-446655440001', 'john.lecturer@university.edu', 'Dr. John Smith', 'lecturer', NULL, 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.lecturer@university.edu', 'Prof. Jane Doe', 'lecturer', NULL, 'Mathematics'),
('550e8400-e29b-41d4-a716-446655440003', 'alice.student@university.edu', 'Alice Johnson', 'student', 'CS2021001', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440004', 'bob.student@university.edu', 'Bob Wilson', 'student', 'CS2021002', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440005', 'charlie.student@university.edu', 'Charlie Brown', 'student', 'MT2021001', 'Mathematics');

-- Insert sample courses
INSERT INTO courses (course_code, course_name, lecturer_id, department) VALUES
('CS101', 'Introduction to Programming', '550e8400-e29b-41d4-a716-446655440001', 'Computer Science'),
('CS201', 'Data Structures', '550e8400-e29b-41d4-a716-446655440001', 'Computer Science'),
('MT101', 'Calculus I', '550e8400-e29b-41d4-a716-446655440002', 'Mathematics');

-- Insert sample enrollments
INSERT INTO enrollments (student_id, course_id) VALUES
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM courses WHERE course_code = 'CS101')),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM courses WHERE course_code = 'CS201')),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM courses WHERE course_code = 'CS101')),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM courses WHERE course_code = 'MT101'));

-- Insert sample attendance sessions
INSERT INTO attendance_sessions (course_id, lecturer_id, session_name, session_date, start_time, end_time, qr_code) VALUES
((SELECT id FROM courses WHERE course_code = 'CS101'), '550e8400-e29b-41d4-a716-446655440001', 'Week 1 - Introduction', CURRENT_DATE, '09:00:00', '10:30:00', 'QR_CS101_W1_' || EXTRACT(EPOCH FROM NOW())),
((SELECT id FROM courses WHERE course_code = 'CS201'), '550e8400-e29b-41d4-a716-446655440001', 'Week 1 - Arrays and Lists', CURRENT_DATE, '11:00:00', '12:30:00', 'QR_CS201_W1_' || EXTRACT(EPOCH FROM NOW()));
