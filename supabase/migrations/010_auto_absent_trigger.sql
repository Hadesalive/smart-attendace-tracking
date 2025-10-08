-- Auto-mark absent students when sessions expire
-- This trigger runs when a session's end_time is reached

-- Function to mark absent students
CREATE OR REPLACE FUNCTION mark_absent_students()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if session is ending (status change to completed or end_time reached)
    IF NEW.status = 'completed' OR (NEW.session_date || 'T' || NEW.end_time)::timestamp <= NOW() THEN
        INSERT INTO attendance_records (session_id, student_id, status, marked_at, method_used)
        SELECT
            NEW.id,
            se.student_id,
            'absent',
            NOW(),
            'auto'
        FROM section_enrollments se
        WHERE se.section_id = NEW.section_id
          AND se.status = 'active'
          -- Only students who haven't marked attendance
          AND NOT EXISTS (
              SELECT 1 FROM attendance_records ar
              WHERE ar.session_id = NEW.id
                AND ar.student_id = se.student_id
          );

        -- Update session status to completed if not already
        IF NEW.status != 'completed' THEN
            NEW.status := 'completed';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on attendance_sessions table
DROP TRIGGER IF EXISTS trigger_mark_absent_students ON attendance_sessions;
CREATE TRIGGER trigger_mark_absent_students
    AFTER UPDATE ON attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION mark_absent_students();

-- Also mark absents for existing expired sessions (one-time fix)
INSERT INTO attendance_records (session_id, student_id, status, marked_at, method_used)
SELECT
    s.id,
    se.student_id,
    'absent',
    NOW(),
    'auto'
FROM attendance_sessions s
JOIN section_enrollments se ON se.section_id = s.section_id
WHERE (s.session_date || 'T' || s.end_time)::timestamp <= NOW()
  AND s.status != 'completed'
  AND se.status = 'active'
  -- Only students who haven't marked attendance
  AND NOT EXISTS (
      SELECT 1 FROM attendance_records ar
      WHERE ar.session_id = s.id
        AND ar.student_id = se.student_id
  );
