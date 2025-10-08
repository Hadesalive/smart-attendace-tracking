-- FOCUSED DEBUG: Check if session section_id matches student enrollment section_id

-- Step 1: Show the session with its section_id
SELECT 
    '1. SESSION INFO' as step,
    id as session_id,
    session_name,
    section_id as session_section_id,
    course_id,
    lecturer_id,
    session_date,
    created_at
FROM attendance_sessions
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Show student enrollments with their section_id
SELECT 
    '2. STUDENT ENROLLMENTS' as step,
    se.student_id,
    u.full_name as student_name,
    u.email as student_email,
    se.section_id as enrolled_section_id,
    s.section_code,
    p.program_name,
    se.status
FROM section_enrollments se
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections s ON s.id = se.section_id
LEFT JOIN programs p ON p.id = s.program_id
WHERE se.status = 'active'
ORDER BY se.created_at DESC;

-- Step 3: THE CRITICAL MATCH - Does session section_id = student section_id?
SELECT 
    '3. MATCH CHECK' as step,
    ats.id as session_id,
    ats.session_name,
    ats.section_id as session_section_id,
    se.student_id,
    u.full_name as student_name,
    se.section_id as student_section_id,
    s.section_code,
    CASE 
        WHEN ats.section_id = se.section_id THEN '✅ MATCH - Student SHOULD see this session'
        WHEN ats.section_id IS NULL THEN '❌ Session has NO section_id'
        WHEN se.section_id IS NULL THEN '❌ Student has NO section enrollment'
        ELSE '❌ NO MATCH - Different sections'
    END as match_result,
    CASE 
        WHEN ats.section_id = se.section_id THEN 'VISIBLE'
        ELSE 'HIDDEN'
    END as visibility
FROM attendance_sessions ats
CROSS JOIN section_enrollments se
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections s ON s.id = se.section_id
WHERE se.status = 'active'
ORDER BY ats.created_at DESC;

-- Step 4: Check lecturer assignment matches
SELECT 
    '4. LECTURER ASSIGNMENTS' as step,
    la.lecturer_id,
    u_lec.full_name as lecturer_name,
    la.course_id,
    c.course_code,
    la.section_id as lecturer_section_id,
    s.section_code,
    ats.id as matching_session_id,
    ats.session_name,
    CASE 
        WHEN ats.id IS NOT NULL THEN '✅ Has session for this assignment'
        ELSE '⚠️ No session yet'
    END as session_status
FROM lecturer_assignments la
LEFT JOIN users u_lec ON u_lec.id = la.lecturer_id
LEFT JOIN courses c ON c.id = la.course_id
LEFT JOIN sections s ON s.id = la.section_id
LEFT JOIN attendance_sessions ats ON ats.course_id = la.course_id AND ats.section_id = la.section_id
ORDER BY u_lec.full_name, c.course_code;

