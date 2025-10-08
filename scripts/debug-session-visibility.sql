-- DEBUG SCRIPT: Check Session Visibility Issue
-- Run this in Supabase SQL Editor to debug why students can't see sessions

-- ============================================================================
-- 1. CHECK RECENTLY CREATED SESSIONS
-- ============================================================================
SELECT 
    'Recent Sessions' as check_type,
    id,
    session_name,
    course_id,
    section_id,
    lecturer_id,
    session_date,
    start_time,
    end_time,
    created_at,
    CASE 
        WHEN section_id IS NULL THEN '❌ MISSING section_id'
        ELSE '✅ Has section_id'
    END as section_status
FROM attendance_sessions
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 2. CHECK SECTION ENROLLMENTS
-- ============================================================================
SELECT 
    'Section Enrollments' as check_type,
    se.student_id,
    se.section_id,
    se.status,
    u.full_name as student_name,
    s.section_code,
    p.program_name
FROM section_enrollments se
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections s ON s.id = se.section_id
LEFT JOIN programs p ON p.id = s.program_id
WHERE se.status = 'active'
ORDER BY se.created_at DESC
LIMIT 20;

-- ============================================================================
-- 3. MATCH SESSIONS TO STUDENTS
-- ============================================================================
-- This shows which students SHOULD see which sessions
SELECT 
    'Session-Student Matches' as check_type,
    ats.session_name,
    ats.section_id as session_section_id,
    se.student_id,
    u.full_name as student_name,
    s.section_code,
    CASE 
        WHEN ats.section_id = se.section_id THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as match_status
FROM attendance_sessions ats
CROSS JOIN section_enrollments se
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections s ON s.id = se.section_id
WHERE se.status = 'active'
    AND ats.created_at > NOW() - INTERVAL '1 day' -- Only recent sessions
ORDER BY ats.created_at DESC, u.full_name;

-- ============================================================================
-- 4. CHECK LECTURER ASSIGNMENTS
-- ============================================================================
SELECT 
    'Lecturer Assignments' as check_type,
    la.lecturer_id,
    u.full_name as lecturer_name,
    la.course_id,
    c.course_code,
    c.course_name,
    la.section_id,
    s.section_code
FROM lecturer_assignments la
LEFT JOIN users u ON u.id = la.lecturer_id
LEFT JOIN courses c ON c.id = la.course_id
LEFT JOIN sections s ON s.id = la.section_id
ORDER BY u.full_name, c.course_code;

-- ============================================================================
-- 5. FIND ORPHANED SESSIONS (Sessions with invalid section_id)
-- ============================================================================
SELECT 
    'Orphaned Sessions' as check_type,
    ats.id,
    ats.session_name,
    ats.section_id,
    CASE 
        WHEN ats.section_id IS NULL THEN '❌ NULL section_id'
        WHEN s.id IS NULL THEN '❌ Invalid section_id (section does not exist)'
        ELSE '✅ Valid section_id'
    END as status
FROM attendance_sessions ats
LEFT JOIN sections s ON s.id = ats.section_id
WHERE ats.section_id IS NULL OR s.id IS NULL;

-- ============================================================================
-- 6. COUNT SUMMARY
-- ============================================================================
SELECT 
    'Summary Counts' as info,
    (SELECT COUNT(*) FROM attendance_sessions) as total_sessions,
    (SELECT COUNT(*) FROM attendance_sessions WHERE section_id IS NOT NULL) as sessions_with_section,
    (SELECT COUNT(*) FROM attendance_sessions WHERE section_id IS NULL) as sessions_without_section,
    (SELECT COUNT(*) FROM section_enrollments WHERE status = 'active') as active_enrollments,
    (SELECT COUNT(*) FROM sections) as total_sections,
    (SELECT COUNT(*) FROM lecturer_assignments) as total_lecturer_assignments;

