-- Verify Student Enrollment
-- Check if the student enrollment actually has section_id

-- Replace with your student's email
-- STUDENT EMAIL: 

-- 1. Get student info
SELECT 
    'STUDENT INFO' as check_type,
    id,
    email,
    full_name,
    role
FROM users 
WHERE role = 'student'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check their enrollments
SELECT 
    'ENROLLMENT DATA' as check_type,
    se.id as enrollment_id,
    se.student_id,
    se.section_id,  -- ← THIS SHOULD NOT BE NULL!
    se.enrollment_date,
    se.status,
    se.created_at,
    u.email as student_email,
    u.full_name as student_name,
    s.section_code,
    s.program_id,
    p.program_name
FROM section_enrollments se
LEFT JOIN users u ON se.student_id = u.id
LEFT JOIN sections s ON se.section_id = s.id
LEFT JOIN programs p ON s.program_id = p.id
ORDER BY se.created_at DESC
LIMIT 10;

-- 3. Check if any enrollments have NULL section_id
SELECT 
    'ENROLLMENTS WITH NULL SECTION_ID' as check_type,
    COUNT(*) as null_section_count
FROM section_enrollments
WHERE section_id IS NULL;

-- 4. Show enrollments WITH section_id
SELECT 
    'ENROLLMENTS WITH SECTION_ID' as check_type,
    COUNT(*) as has_section_count
FROM section_enrollments
WHERE section_id IS NOT NULL;

