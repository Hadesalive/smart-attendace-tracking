-- Complete Schema Migration for Smart Attendance Tracking System
-- This migration fixes current issues and adds all missing tables for the complete feature set

-- ============================================================================
-- 1. FIX CURRENT SCHEMA ISSUES
-- ============================================================================

-- Fix attendance_records table - add missing status column (id already exists)
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('present', 'late', 'absent')) DEFAULT 'present';

-- ============================================================================
-- 2. CREATE HOMEWORK & ASSIGNMENTS TABLES
-- ============================================================================

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_points DECIMAL(10,2) NOT NULL DEFAULT 100,
  late_penalty_enabled BOOLEAN DEFAULT false,
  late_penalty_percent DECIMAL(5,2) DEFAULT 0,
  late_penalty_interval VARCHAR(10) CHECK (late_penalty_interval IN ('day', 'week')) DEFAULT 'day',
  category_id UUID, -- Will reference grade_categories table (added constraint below)
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'closed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  grade DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('pending', 'submitted', 'late', 'graded')) DEFAULT 'submitted',
  late_penalty_applied DECIMAL(5,2) DEFAULT 0,
  final_grade DECIMAL(10,2),
  comments TEXT,
  submission_text TEXT,
  submission_files JSONB, -- Array of file URLs
  UNIQUE(assignment_id, student_id)
);

-- ============================================================================
-- 3. CREATE GRADEBOOK TABLES
-- ============================================================================

-- Create grade_categories table
CREATE TABLE IF NOT EXISTS grade_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  is_default BOOLEAN DEFAULT false,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_grades table
CREATE TABLE IF NOT EXISTS student_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES grade_categories(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE SET NULL,
  points DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_points DECIMAL(10,2) NOT NULL DEFAULT 100,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN max_points > 0 THEN (points / max_points * 100) ELSE 0 END) STORED,
  letter_grade VARCHAR(5) GENERATED ALWAYS AS (
    CASE 
      WHEN (points / max_points * 100) >= 97 THEN 'A+'
      WHEN (points / max_points * 100) >= 93 THEN 'A'
      WHEN (points / max_points * 100) >= 90 THEN 'A-'
      WHEN (points / max_points * 100) >= 87 THEN 'B+'
      WHEN (points / max_points * 100) >= 83 THEN 'B'
      WHEN (points / max_points * 100) >= 80 THEN 'B-'
      WHEN (points / max_points * 100) >= 77 THEN 'C+'
      WHEN (points / max_points * 100) >= 73 THEN 'C'
      WHEN (points / max_points * 100) >= 70 THEN 'C-'
      WHEN (points / max_points * 100) >= 67 THEN 'D+'
      WHEN (points / max_points * 100) >= 63 THEN 'D'
      WHEN (points / max_points * 100) >= 60 THEN 'D-'
      ELSE 'F'
    END
  ) STORED,
  is_late BOOLEAN DEFAULT false,
  late_penalty DECIMAL(5,2) DEFAULT 0,
  final_points DECIMAL(10,2) GENERATED ALWAYS AS (points - late_penalty) STORED,
  comments TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE MATERIALS & RESOURCES TABLES
-- ============================================================================

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE SET NULL,
  material_type VARCHAR(20) CHECK (material_type IN ('document', 'video', 'image', 'link', 'presentation')) NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  file_type VARCHAR(100),
  external_url TEXT,
  is_public BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CREATE LECTURER ASSIGNMENTS TABLE
-- ============================================================================

-- Create lecturer_assignments table (which courses a lecturer teaches)
CREATE TABLE IF NOT EXISTS lecturer_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT true, -- Primary lecturer vs teaching assistant
  UNIQUE(lecturer_id, course_id)
);

-- ============================================================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add missing columns to attendance_sessions
ALTER TABLE attendance_sessions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS type VARCHAR(20) CHECK (type IN ('lecture', 'lab', 'tutorial', 'exam')) DEFAULT 'lecture',
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS enrolled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add missing columns to materials table
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) CHECK (category IN ('lecture', 'assignment', 'reading', 'reference', 'lab')) DEFAULT 'lecture';

-- ============================================================================
-- 7. ADD MISSING FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key constraint for assignments.category_id
ALTER TABLE assignments 
ADD CONSTRAINT fk_assignments_category 
FOREIGN KEY (category_id) REFERENCES grade_categories(id) ON DELETE SET NULL;

-- ============================================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Assignment indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- Submission indexes
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Grade indexes
CREATE INDEX IF NOT EXISTS idx_grade_categories_course ON grade_categories(course_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_student ON student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_course ON student_grades(course_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_assignment ON student_grades(assignment_id);

-- Material indexes
CREATE INDEX IF NOT EXISTS idx_materials_course ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_materials_uploaded_by ON materials(uploaded_by);

-- Lecturer assignment indexes
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_lecturer ON lecturer_assignments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_course ON lecturer_assignments(course_id);

-- ============================================================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS for new tables
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Assignments policies
CREATE POLICY "Lecturers can manage assignments for their courses." ON assignments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = assignments.course_id 
    AND courses.lecturer_id = auth.uid()
  ));

CREATE POLICY "Students can view assignments for their enrolled courses." ON assignments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = assignments.course_id 
    AND enrollments.student_id = auth.uid()
  ));

-- Submissions policies
CREATE POLICY "Students can manage their own submissions." ON submissions
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Lecturers can view submissions for their course assignments." ON submissions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM assignments a
    JOIN courses c ON a.course_id = c.id
    WHERE a.id = submissions.assignment_id 
    AND c.lecturer_id = auth.uid()
  ));

-- Grade categories policies
CREATE POLICY "Lecturers can manage grade categories for their courses." ON grade_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = grade_categories.course_id 
    AND courses.lecturer_id = auth.uid()
  ));

CREATE POLICY "Students can view grade categories for their enrolled courses." ON grade_categories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = grade_categories.course_id 
    AND enrollments.student_id = auth.uid()
  ));

-- Student grades policies
CREATE POLICY "Students can view their own grades." ON student_grades
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Lecturers can manage grades for their course students." ON student_grades
  FOR ALL USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = student_grades.course_id 
    AND courses.lecturer_id = auth.uid()
  ));

-- Materials policies
CREATE POLICY "Lecturers can manage materials for their courses." ON materials
  FOR ALL USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = materials.course_id 
    AND courses.lecturer_id = auth.uid()
  ));

CREATE POLICY "Students can view materials for their enrolled courses." ON materials
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = materials.course_id 
    AND enrollments.student_id = auth.uid()
  ));

-- Lecturer assignments policies
CREATE POLICY "Lecturers can view their own assignments." ON lecturer_assignments
  FOR SELECT USING (auth.uid() = lecturer_id);

CREATE POLICY "Admins can manage lecturer assignments." ON lecturer_assignments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- ============================================================================
-- 11. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate final grade for a student in a course
CREATE OR REPLACE FUNCTION calculate_course_final_grade(
  p_student_id UUID,
  p_course_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  final_grade DECIMAL(5,2) := 0;
BEGIN
  SELECT COALESCE(SUM((sg.final_points / sg.max_points) * gc.percentage), 0)
  INTO final_grade
  FROM student_grades sg
  JOIN grade_categories gc ON sg.category_id = gc.id
  WHERE sg.student_id = p_student_id 
    AND sg.course_id = p_course_id;
  
  RETURN LEAST(final_grade, 100.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get attendance percentage for a student in a course
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
  p_student_id UUID,
  p_course_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  attendance_percentage DECIMAL(5,2) := 0;
  total_sessions INTEGER := 0;
  attended_sessions INTEGER := 0;
BEGIN
  -- Count total sessions for the course
  SELECT COUNT(*) INTO total_sessions
  FROM attendance_sessions 
  WHERE course_id = p_course_id;
  
  -- Count attended sessions
  SELECT COUNT(*) INTO attended_sessions
  FROM attendance_records ar
  JOIN attendance_sessions s ON ar.session_id = s.id
  WHERE ar.student_id = p_student_id 
    AND s.course_id = p_course_id
    AND ar.status = 'present';
  
  IF total_sessions > 0 THEN
    attendance_percentage := (attended_sessions::DECIMAL / total_sessions) * 100;
  END IF;
  
  RETURN attendance_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_assignments_updated_at 
  BEFORE UPDATE ON assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_grades_updated_at 
  BEFORE UPDATE ON student_grades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at 
  BEFORE UPDATE ON materials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. INSERT DEFAULT GRADE CATEGORIES
-- ============================================================================

-- Insert default grade categories for existing courses
INSERT INTO grade_categories (name, percentage, is_default, course_id)
SELECT 
  'Assignments',
  40.00,
  true,
  id
FROM courses
ON CONFLICT DO NOTHING;

INSERT INTO grade_categories (name, percentage, is_default, course_id)
SELECT 
  'Attendance',
  20.00,
  true,
  id
FROM courses
ON CONFLICT DO NOTHING;

INSERT INTO grade_categories (name, percentage, is_default, course_id)
SELECT 
  'Exams',
  30.00,
  true,
  id
FROM courses
ON CONFLICT DO NOTHING;

INSERT INTO grade_categories (name, percentage, is_default, course_id)
SELECT 
  'Participation',
  10.00,
  true,
  id
FROM courses
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Complete schema migration finished successfully!';
  RAISE NOTICE 'Added tables: assignments, submissions, grade_categories, student_grades, materials, lecturer_assignments';
  RAISE NOTICE 'Fixed attendance_records table with missing columns';
  RAISE NOTICE 'Created RLS policies for all new tables';
  RAISE NOTICE 'Added helper functions and triggers';
  RAISE NOTICE 'Inserted default grade categories for existing courses';
END $$;
