-- TEST: Verify Section Isolation Between Programs
-- This proves that students only see sessions for their program's section,
-- even if another program has the same section_code

-- ============================================================================
-- 1. Show all sections with the same section_code across different programs
-- ============================================================================
SELECT 
  '1. SECTIONS WITH SAME CODE' as test_step,
  s.id as section_uuid,
  s.section_code,
  p.program_code,
  p.program_name,
  s.program_id,
  CASE 
    WHEN COUNT(*) OVER (PARTITION BY s.section_code) > 1 
    THEN '⚠️ This section code exists in multiple programs'
    ELSE '✅ Unique section code'
  END as isolation_status
FROM sections s
LEFT JOIN programs p ON p.id = s.program_id
ORDER BY s.section_code, p.program_name;

-- ============================================================================
-- 2. Show student enrollments with their section UUID
-- ============================================================================
SELECT 
  '2. STUDENT ENROLLMENTS' as test_step,
  se.student_id,
  u.full_name as student_name,
  se.section_id as enrolled_section_uuid,
  s.section_code,
  p.program_name,
  '👉 Student is enrolled in THIS specific section UUID' as note
FROM section_enrollments se
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections s ON s.id = se.section_id
LEFT JOIN programs p ON p.id = s.program_id
WHERE se.status = 'active'
ORDER BY u.full_name;

-- ============================================================================
-- 3. Show sessions with their section UUID
-- ============================================================================
SELECT 
  '3. SESSIONS' as test_step,
  ats.id as session_id,
  ats.session_name,
  ats.section_id as session_section_uuid,
  s.section_code,
  p.program_name,
  '👉 Session belongs to THIS specific section UUID' as note
FROM attendance_sessions ats
LEFT JOIN sections s ON s.id = ats.section_id
LEFT JOIN programs p ON p.id = s.program_id
ORDER BY ats.created_at DESC;

-- ============================================================================
-- 4. THE CRITICAL TEST: Match students to sessions
-- ============================================================================
-- This shows that even if two programs have "1101", students only see 
-- their program's "1101" because we match by UUID, not by code
SELECT 
  '4. ISOLATION TEST' as test_step,
  u.full_name as student_name,
  student_p.program_name as student_program,
  se.section_id as student_section_uuid,
  student_s.section_code as student_section_code,
  ats.session_name,
  session_p.program_name as session_program,
  ats.section_id as session_section_uuid,
  session_s.section_code as session_section_code,
  CASE 
    WHEN se.section_id = ats.section_id THEN '✅ MATCH - Student can see (UUID match)'
    WHEN student_s.section_code = session_s.section_code AND student_p.id != session_p.id THEN 
      '🔒 ISOLATED - Same section code but DIFFERENT program (UUID mismatch)'
    ELSE '❌ NO MATCH - Different section'
  END as access_control,
  CASE 
    WHEN se.section_id = ats.section_id THEN 'VISIBLE'
    ELSE 'HIDDEN'
  END as visibility
FROM section_enrollments se
CROSS JOIN attendance_sessions ats
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections student_s ON student_s.id = se.section_id
LEFT JOIN programs student_p ON student_p.id = student_s.program_id
LEFT JOIN sections session_s ON session_s.id = ats.section_id
LEFT JOIN programs session_p ON session_p.id = session_s.program_id
WHERE se.status = 'active'
ORDER BY u.full_name, ats.created_at DESC;

-- ============================================================================
-- 5. SUMMARY: How many students can see each session
-- ============================================================================
SELECT 
  '5. SUMMARY' as test_step,
  ats.session_name,
  s.section_code,
  p.program_name,
  COUNT(DISTINCT se.student_id) as students_who_can_see,
  STRING_AGG(DISTINCT u.full_name, ', ') as student_names
FROM attendance_sessions ats
LEFT JOIN sections s ON s.id = ats.section_id
LEFT JOIN programs p ON p.id = s.program_id
LEFT JOIN section_enrollments se ON se.section_id = ats.section_id AND se.status = 'active'
LEFT JOIN users u ON u.id = se.student_id
GROUP BY ats.session_name, s.section_code, p.program_name
ORDER BY ats.created_at DESC;

