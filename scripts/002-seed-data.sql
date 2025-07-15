-- Insert sample users
INSERT INTO users (email, full_name, role, student_id, department) VALUES
('admin@university.edu', 'System Administrator', 'admin', NULL, 'IT'),
('john.lecturer@university.edu', 'Dr. John Smith', 'lecturer', NULL, 'Computer Science'),
('jane.lecturer@university.edu', 'Prof. Jane Doe', 'lecturer', NULL, 'Mathematics'),
('alice.student@university.edu', 'Alice Johnson', 'student', 'CS2021001', 'Computer Science'),
('bob.student@university.edu', 'Bob Wilson', 'student', 'CS2021002', 'Computer Science'),
('charlie.student@university.edu', 'Charlie Brown', 'student', 'MT2021001', 'Mathematics');

-- Insert sample courses
INSERT INTO courses (course_code, course_name, lecturer_id, department) VALUES
('CS101', 'Introduction to Programming', (SELECT id FROM users WHERE email = 'john.lecturer@university.edu'), 'Computer Science'),
('CS201', 'Data Structures', (SELECT id FROM users WHERE email = 'john.lecturer@university.edu'), 'Computer Science'),
('MT101', 'Calculus I', (SELECT id FROM users WHERE email = 'jane.lecturer@university.edu'), 'Mathematics');

-- Insert sample enrollments
INSERT INTO enrollments (student_id, course_id) VALUES
((SELECT id FROM users WHERE email = 'alice.student@university.edu'), (SELECT id FROM courses WHERE course_code = 'CS101')),
((SELECT id FROM users WHERE email = 'alice.student@university.edu'), (SELECT id FROM courses WHERE course_code = 'CS201')),
((SELECT id FROM users WHERE email = 'bob.student@university.edu'), (SELECT id FROM courses WHERE course_code = 'CS101')),
((SELECT id FROM users WHERE email = 'charlie.student@university.edu'), (SELECT id FROM courses WHERE course_code = 'MT101'));

-- Insert sample attendance sessions
INSERT INTO attendance_sessions (course_id, lecturer_id, session_name, session_date, start_time, end_time, qr_code) VALUES
((SELECT id FROM courses WHERE course_code = 'CS101'), (SELECT id FROM users WHERE email = 'john.lecturer@university.edu'), 'Week 1 - Introduction', CURRENT_DATE, '09:00:00', '10:30:00', 'QR_CS101_W1_' || EXTRACT(EPOCH FROM NOW())),
((SELECT id FROM courses WHERE course_code = 'CS201'), (SELECT id FROM users WHERE email = 'john.lecturer@university.edu'), 'Week 1 - Arrays and Lists', CURRENT_DATE, '11:00:00', '12:30:00', 'QR_CS201_W1_' || EXTRACT(EPOCH FROM NOW()));
