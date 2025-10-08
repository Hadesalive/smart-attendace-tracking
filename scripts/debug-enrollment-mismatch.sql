-- Debug Script: Check Enrollment vs Session Section Match
-- Run this to see why a student can't scan a session

-- INSTRUCTIONS:
-- 1. Replace 'STUDENT_EMAIL_HERE' with the student's email
-- 2. Replace 'SESSION_ID_HERE' with the session ID from the QR code
-- 3. Run in Supabase SQL Editor

-- Step 1: Get student info
SELECT 
    'STUDENT INFO' as check_type,
    u.id as student_id,
    u.email,
    u.full_name,
    u.role
FROM users u
WHERE u.email = 'STUDENT_EMAIL_HERE';

-- Step 2: Get all student's enrollments
SELECT 
    'STUDENT ENROLLMENTS' as check_type,
    se.id as enrollment_id,
    se.section_id,
    s.section_code,
    s.program_id,
    p.program_name,
    se.status,
    se.created_at
FROM section_enrollments se
INNER JOIN sections s ON se.section_id = s.id
INNER JOIN programs p ON s.program_id = p.id
INNER JOIN users u ON se.student_id = u.id
WHERE u.email = 'STUDENT_EMAIL_HERE'
ORDER BY se.created_at DESC;

-- Step 3: Get session info
SELECT 
    'SESSION INFO' as check_type,
    asess.id as session_id,
    asess.session_name,
    asess.section_id,
    s.section_code,
    s.program_id,
    p.program_name,
    asess.course_id,
    c.course_code,
    c.course_name,
    asess.session_date,
    asess.start_time,
    asess.end_time,
    asess.status
FROM attendance_sessions asess
LEFT JOIN sections s ON asess.section_id = s.id
LEFT JOIN programs p ON s.program_id = p.id
LEFT JOIN courses c ON asess.course_id = c.id
WHERE asess.id = 'SESSION_ID_HERE';

-- Step 4: Check if there's a match
SELECT 
    'ENROLLMENT MATCH CHECK' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ STUDENT IS ENROLLED IN SESSION SECTION'
        ELSE '❌ STUDENT IS NOT ENROLLED IN SESSION SECTION'
    END as result,
    COUNT(*) as enrollment_count
FROM section_enrollments se
INNER JOIN users u ON se.student_id = u.id
INNER JOIN attendance_sessions asess ON se.section_id = asess.section_id
WHERE u.email = 'STUDENT_EMAIL_HERE'
  AND asess.id = 'SESSION_ID_HERE'
  AND se.status = 'active';

-- Step 5: Detailed mismatch analysis
SELECT 
    'MISMATCH DETAILS' as check_type,
    u.email as student_email,
    u.full_name as student_name,
    asess.session_name,
    asess.section_id as session_section_id,
    session_section.section_code as session_section_code,
    se.section_id as student_section_id,
    student_section.section_code as student_section_code,
    CASE 
        WHEN asess.section_id = se.section_id THEN '✅ SECTIONS MATCH'
        ELSE '❌ SECTION MISMATCH'
    END as match_status
FROM users u
CROSS JOIN attendance_sessions asess
LEFT JOIN section_enrollments se ON se.student_id = u.id AND se.status = 'active'
LEFT JOIN sections session_section ON asess.section_id = session_section.id
LEFT JOIN sections student_section ON se.section_id = student_section.id
WHERE u.email = 'STUDENT_EMAIL_HERE'
  AND asess.id = 'SESSION_ID_HERE';

-- Step 6: Check if session has no section assigned
SELECT 
    'SESSION SECTION CHECK' as check_type,
    asess.id,
    asess.session_name,
    asess.section_id,
    CASE 
        WHEN asess.section_id IS NULL THEN '❌ SESSION HAS NO SECTION ASSIGNED'
        ELSE '✅ SESSION HAS SECTION ASSIGNED'
    END as section_status
FROM attendance_sessions asess
WHERE asess.id = 'SESSION_ID_HERE';

