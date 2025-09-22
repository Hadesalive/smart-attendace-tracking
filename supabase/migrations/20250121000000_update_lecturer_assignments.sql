-- ============================================================================
-- UPDATE LECTURER ASSIGNMENTS TABLE
-- ============================================================================
-- This migration adds the missing columns to the lecturer_assignments table
-- to support the TeacherAssignmentForm functionality

-- Add missing columns to lecturer_assignments table
ALTER TABLE lecturer_assignments 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS teaching_hours_per_week INTEGER CHECK (teaching_hours_per_week >= 1 AND teaching_hours_per_week <= 20),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update the unique constraint to include the new columns
-- Drop the old constraint first
ALTER TABLE lecturer_assignments DROP CONSTRAINT IF EXISTS lecturer_assignments_lecturer_id_course_id_key;

-- Add new unique constraint
ALTER TABLE lecturer_assignments 
ADD CONSTRAINT lecturer_assignments_unique_assignment 
UNIQUE (lecturer_id, course_id, academic_year_id, semester_id, program_id, section_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_academic_year ON lecturer_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_semester ON lecturer_assignments(semester_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_program ON lecturer_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_section ON lecturer_assignments(section_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_dates ON lecturer_assignments(start_date, end_date);

-- Update RLS policies to include the new columns
-- Drop existing policies
DROP POLICY IF EXISTS "Lecturers can view their own assignments." ON lecturer_assignments;
DROP POLICY IF EXISTS "Admins can manage lecturer assignments." ON lecturer_assignments;

-- Create updated policies
CREATE POLICY "Lecturers can view their own assignments." ON lecturer_assignments
  FOR SELECT USING (auth.uid() = lecturer_id);

CREATE POLICY "Admins can manage lecturer assignments." ON lecturer_assignments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Add policy for lecturers to view assignments for their sections
CREATE POLICY "Lecturers can view assignments for their sections." ON lecturer_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sections s
      WHERE s.id = lecturer_assignments.section_id
      AND EXISTS (
        SELECT 1 FROM lecturer_assignments la2
        WHERE la2.section_id = s.id
        AND la2.lecturer_id = auth.uid()
      )
    )
  );

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Lecturer assignments table updated successfully!';
  RAISE NOTICE 'Added columns: academic_year_id, semester_id, program_id, section_id, teaching_hours_per_week, start_date, end_date';
  RAISE NOTICE 'Updated unique constraint and indexes';
  RAISE NOTICE 'Updated RLS policies for new functionality';
END $$;
