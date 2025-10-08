-- Check if attendance has already been marked for this session/student

SELECT 
  ar.id,
  ar.session_id,
  ar.student_id,
  ar.status,
  ar.marked_at,
  ar.method_used,
  u.email AS student_email,
  ats.session_name
FROM attendance_records ar
JOIN users u ON u.id = ar.student_id
JOIN attendance_sessions ats ON ats.id = ar.session_id
WHERE ar.session_id = 'a27cd36e-568c-45d5-bd98-427f4fb0508d'
  AND ar.student_id = '74aade6c-61bc-4164-a36c-fc5da41276e5';

-- If this returns rows, attendance was already marked (duplicate error)
-- If this returns no rows, the error is something else

