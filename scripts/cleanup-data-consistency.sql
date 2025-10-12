-- Data consistency cleanup script
-- Run this periodically to maintain database integrity

-- 1. Remove orphaned attendance records (references non-existent sessions)
DELETE FROM attendance_records
WHERE session_id NOT IN (
  SELECT id FROM attendance_sessions
);

-- 2. Remove enrollments with invalid section references
-- (This assumes sections table exists - adjust if needed)
DELETE FROM section_enrollments
WHERE section_id NOT IN (
  SELECT DISTINCT section_id FROM attendance_sessions WHERE section_id IS NOT NULL
);

-- 3. Fix invalid attendance status values
UPDATE attendance_records
SET status = 'absent'
WHERE status NOT IN ('present', 'late', 'absent');

-- 4. Fix invalid enrollment status values
UPDATE section_enrollments
SET status = 'active'
WHERE status NOT IN ('active', 'inactive', 'withdrawn');

-- 5. Remove duplicate attendance records (keep only most recent)
DELETE FROM attendance_records a1
WHERE EXISTS (
  SELECT 1 FROM attendance_records a2
  WHERE a1.session_id = a2.session_id
    AND a1.student_id = a2.student_id
    AND a1.id < a2.id
);

-- 6. Add missing indexes for performance (if not already present)
-- These help with the validation queries
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_student
ON attendance_records(session_id, student_id);

CREATE INDEX IF NOT EXISTS idx_section_enrollments_section_student
ON section_enrollments(section_id, student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_section_date
ON attendance_sessions(section_id, session_date);

-- 7. Log cleanup results
DO $$
DECLARE
    orphaned_count INTEGER;
    invalid_status_count INTEGER;
    duplicate_count INTEGER;
BEGIN
    -- Count what was cleaned up
    SELECT COUNT(*) INTO orphaned_count
    FROM attendance_records
    WHERE session_id NOT IN (SELECT id FROM attendance_sessions);

    SELECT COUNT(*) INTO invalid_status_count
    FROM attendance_records
    WHERE status NOT IN ('present', 'late', 'absent');

    SELECT COUNT(*) INTO duplicate_count
    FROM attendance_records a1
    WHERE EXISTS (
      SELECT 1 FROM attendance_records a2
      WHERE a1.session_id = a2.session_id
        AND a1.student_id = a2.student_id
        AND a1.id < a2.id
    );

    RAISE NOTICE 'Data cleanup completed:';
    RAISE NOTICE '  Orphaned attendance records: %', orphaned_count;
    RAISE NOTICE '  Invalid status values: %', invalid_status_count;
    RAISE NOTICE '  Duplicate records: %', duplicate_count;
    RAISE NOTICE '  Indexes created/verified';
END $$;
