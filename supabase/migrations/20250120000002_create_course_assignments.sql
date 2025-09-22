-- Create course_assignments table
-- This table stores which courses are assigned to which programs
-- and in which academic year, semester, and year level

CREATE TABLE IF NOT EXISTS course_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  year INTEGER CHECK (year >= 1 AND year <= 4) NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  max_students INTEGER CHECK (max_students > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, program_id, academic_year_id, semester_id, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_assignments_course_id ON course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_program_id ON course_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_academic_year_id ON course_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_semester_id ON course_assignments(semester_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_year ON course_assignments(year);

-- Add RLS policies
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all course assignments
CREATE POLICY "Admins can manage all course assignments" ON course_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Policy: Lecturers can view course assignments for their courses
CREATE POLICY "Lecturers can view course assignments for their courses" ON course_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lecturer_assignments 
      WHERE lecturer_assignments.course_id = course_assignments.course_id 
      AND lecturer_assignments.lecturer_id = auth.uid()
    )
  );

-- Policy: Students can view course assignments for their enrolled programs
CREATE POLICY "Students can view course assignments for their enrolled programs" ON course_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM section_enrollments se
      JOIN sections s ON s.id = se.section_id
      WHERE s.program_id = course_assignments.program_id
      AND se.student_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_assignments_updated_at 
  BEFORE UPDATE ON course_assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
