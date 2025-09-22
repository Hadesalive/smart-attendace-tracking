-- Create student profiles for existing student users
-- This script assumes you have programs, academic_years, semesters, and sections data

-- First, let's see what data we have
SELECT 'Users with student role:' as info, count(*) as count FROM users WHERE role = 'student';
SELECT 'Available programs:' as info, count(*) as count FROM programs;
SELECT 'Available academic years:' as info, count(*) as count FROM academic_years;
SELECT 'Available semesters:' as info, count(*) as count FROM semesters;
SELECT 'Available sections:' as info, count(*) as count FROM sections;

-- Get the first program, academic year, semester, and section for assignment
WITH sample_data AS (
  SELECT 
    (SELECT id FROM programs LIMIT 1) as program_id,
    (SELECT id FROM academic_years LIMIT 1) as academic_year_id,
    (SELECT id FROM semesters LIMIT 1) as semester_id,
    (SELECT id FROM sections LIMIT 1) as section_id
)
INSERT INTO student_profiles (
  user_id,
  student_id,
  program_id,
  section_id,
  academic_year_id,
  enrollment_date,
  expected_graduation,
  academic_status,
  gpa,
  credits_completed,
  credits_required
)
SELECT 
  u.id as user_id,
  u.student_id,
  sd.program_id,
  sd.section_id,
  sd.academic_year_id,
  CURRENT_DATE as enrollment_date,
  CURRENT_DATE + INTERVAL '4 years' as expected_graduation,
  'active' as academic_status,
  ROUND((RANDOM() * 2 + 2)::numeric, 2) as gpa, -- Random GPA between 2.0 and 4.0
  FLOOR(RANDOM() * 60 + 15) as credits_completed, -- Random credits between 15 and 75
  120 as credits_required
FROM users u
CROSS JOIN sample_data sd
WHERE u.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM student_profiles sp 
    WHERE sp.user_id = u.id
  );

-- Verify the created profiles
SELECT 
  sp.id,
  u.full_name,
  u.email,
  sp.student_id,
  p.program_name,
  ay.year_name,
  s.semester_name,
  sp.gpa,
  sp.credits_completed
FROM student_profiles sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN programs p ON sp.program_id = p.id
LEFT JOIN academic_years ay ON sp.academic_year_id = ay.id
LEFT JOIN semesters s ON sp.semester_id = s.id
ORDER BY u.full_name;
