-- VERIFY: Students Only See Sessions for Their Enrolled Sections

-- Get a specific student's data
-- Replace '74aade6c-61bc-4164-a36c-fc5da41276e5' with your test student ID
WITH student_sections AS (
  SELECT section_id 
  FROM section_enrollments 
  WHERE student_id = '74aade6c-61bc-4164-a36c-fc5da41276e5' 
    AND status = 'active'
)
SELECT 
  'WHAT STUDENT SHOULD SEE' as check_type,
  ats.id,
  ats.session_name,
  ats.section_id,
  s.section_code,
  ats.course_id,
  c.course_code,
  CASE 
    WHEN ats.section_id IN (SELECT section_id FROM student_sections) 
    THEN '✅ VISIBLE - Student is enrolled in this section'
    ELSE '❌ HIDDEN - Student is NOT enrolled in this section'
  END as visibility_status
FROM attendance_sessions ats
LEFT JOIN sections s ON s.id = ats.section_id
LEFT JOIN courses c ON c.id = ats.course_id
ORDER BY ats.created_at DESC;

-- Show what section the student is enrolled in
SELECT 
  'STUDENT ENROLLMENT' as info,
  se.student_id,
  u.full_name as student_name,
  se.section_id,
  s.section_code,
  p.program_name,
  se.status
FROM section_enrollments se
LEFT JOIN users u ON u.id = se.student_id
LEFT JOIN sections s ON s.id = se.section_id
LEFT JOIN programs p ON p.id = s.program_id
WHERE se.student_id = '74aade6c-61bc-4164-a36c-fc5da41276e5';

