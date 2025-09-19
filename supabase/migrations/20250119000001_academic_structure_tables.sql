-- Academic Structure Tables Migration
-- This migration adds the missing academic structure tables needed for the academic management page

-- ============================================================================
-- 1. ACADEMIC CALENDAR TABLES
-- ============================================================================

-- Academic years table
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year_name VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_name VARCHAR(50) NOT NULL,
  semester_number INTEGER NOT NULL CHECK (semester_number IN (1, 2)),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(academic_year_id, semester_number)
);

-- ============================================================================
-- 2. DEPARTMENT AND PROGRAM STRUCTURE
-- ============================================================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_code VARCHAR(20) UNIQUE NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  description TEXT,
  head_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_code VARCHAR(20) UNIQUE NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  degree_type VARCHAR(50), -- Bachelor, Master, PhD, Certificate
  duration_years INTEGER,
  total_credits INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CLASSROOMS TABLE
-- ============================================================================

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building VARCHAR(100) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  room_name VARCHAR(255), -- Optional descriptive name
  capacity INTEGER,
  room_type VARCHAR(50) DEFAULT 'lecture', -- lecture, lab, computer_lab, seminar, conference
  equipment TEXT[], -- Array of available equipment
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building, room_number)
);

-- ============================================================================
-- 4. SECTIONS TABLE
-- ============================================================================

-- Sections table (classes)
CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_code VARCHAR(20) NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
  max_capacity INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_code, program_id, academic_year_id, semester_id)
);

-- ============================================================================
-- 5. ENHANCED USER PROFILE TABLES
-- ============================================================================

-- Student profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  enrollment_date DATE,
  expected_graduation DATE,
  academic_status VARCHAR(20) DEFAULT 'active' CHECK (academic_status IN ('active', 'graduated', 'suspended', 'withdrawn', 'on_leave')),
  gpa DECIMAL(3,2),
  credits_completed INTEGER DEFAULT 0,
  credits_required INTEGER,
  advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lecturer profiles table
CREATE TABLE IF NOT EXISTS lecturer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position VARCHAR(100), -- Professor, Associate Professor, Assistant Professor, Lecturer
  hire_date DATE,
  office_location VARCHAR(100),
  office_hours TEXT,
  research_interests TEXT[],
  qualifications TEXT[],
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  admin_level VARCHAR(50) DEFAULT 'admin', -- super_admin, admin, department_admin, system_admin
  permissions TEXT[], -- Array of permission strings
  last_system_access TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. UPDATE EXISTING TABLES
-- ============================================================================

-- Add department reference to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Add academic year and semester to attendance_sessions
ALTER TABLE attendance_sessions 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL;

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Academic years indexes
CREATE INDEX IF NOT EXISTS idx_academic_years_current ON academic_years(is_current);
CREATE INDEX IF NOT EXISTS idx_academic_years_dates ON academic_years(start_date, end_date);

-- Semesters indexes
CREATE INDEX IF NOT EXISTS idx_semesters_academic_year ON semesters(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_semesters_current ON semesters(is_current);

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(department_code);
CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(head_id);

-- Programs indexes
CREATE INDEX IF NOT EXISTS idx_programs_department ON programs(department_id);
CREATE INDEX IF NOT EXISTS idx_programs_code ON programs(program_code);

-- Classrooms indexes
CREATE INDEX IF NOT EXISTS idx_classrooms_building ON classrooms(building);
CREATE INDEX IF NOT EXISTS idx_classrooms_type ON classrooms(room_type);
CREATE INDEX IF NOT EXISTS idx_classrooms_active ON classrooms(is_active);

-- Sections indexes
CREATE INDEX IF NOT EXISTS idx_sections_program ON sections(program_id);
CREATE INDEX IF NOT EXISTS idx_sections_academic_year ON sections(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_sections_semester ON sections(semester_id);
CREATE INDEX IF NOT EXISTS idx_sections_classroom ON sections(classroom_id);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_program ON student_profiles(program_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_section ON student_profiles(section_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON student_profiles(academic_status);

CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_user ON lecturer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_employee_id ON lecturer_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_department ON lecturer_profiles(department_id);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_user ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_employee_id ON admin_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_level ON admin_profiles(admin_level);

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS for new tables
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. CREATE RLS POLICIES
-- ============================================================================

-- Academic years - all authenticated users can view
CREATE POLICY "Authenticated users can view academic years." ON academic_years
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage academic years
CREATE POLICY "Admins can manage academic years." ON academic_years
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Semesters - all authenticated users can view
CREATE POLICY "Authenticated users can view semesters." ON semesters
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage semesters
CREATE POLICY "Admins can manage semesters." ON semesters
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Departments - all authenticated users can view
CREATE POLICY "Authenticated users can view departments." ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage departments
CREATE POLICY "Admins can manage departments." ON departments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Programs - all authenticated users can view
CREATE POLICY "Authenticated users can view programs." ON programs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage programs
CREATE POLICY "Admins can manage programs." ON programs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Classrooms - all authenticated users can view
CREATE POLICY "Authenticated users can view classrooms." ON classrooms
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage classrooms
CREATE POLICY "Admins can manage classrooms." ON classrooms
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Sections - all authenticated users can view
CREATE POLICY "Authenticated users can view sections." ON sections
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage sections
CREATE POLICY "Admins can manage sections." ON sections
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Student profiles - students can view/edit their own
CREATE POLICY "Students can manage their own profile." ON student_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Lecturers can view student profiles in their courses
CREATE POLICY "Lecturers can view student profiles in their courses." ON student_profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    WHERE c.lecturer_id = auth.uid()
    AND e.student_id = student_profiles.user_id
  ));

-- Admins can manage all student profiles
CREATE POLICY "Admins can manage all student profiles." ON student_profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Lecturer profiles - lecturers can view/edit their own
CREATE POLICY "Lecturers can manage their own profile." ON lecturer_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Students can view lecturer profiles for their courses
CREATE POLICY "Students can view lecturer profiles for their courses." ON lecturer_profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    WHERE c.lecturer_id = lecturer_profiles.user_id
    AND e.student_id = auth.uid()
  ));

-- Admins can manage all lecturer profiles
CREATE POLICY "Admins can manage all lecturer profiles." ON lecturer_profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Admin profiles - admins can view/edit their own
CREATE POLICY "Admins can manage their own profile." ON admin_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 10. CREATE TRIGGERS FOR AUTOMATIC UPDATES
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
CREATE TRIGGER update_academic_years_updated_at 
  BEFORE UPDATE ON academic_years 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semesters_updated_at 
  BEFORE UPDATE ON semesters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at 
  BEFORE UPDATE ON programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at 
  BEFORE UPDATE ON classrooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at 
  BEFORE UPDATE ON sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at 
  BEFORE UPDATE ON student_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecturer_profiles_updated_at 
  BEFORE UPDATE ON lecturer_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at 
  BEFORE UPDATE ON admin_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. INSERT DEFAULT DATA
-- ============================================================================

-- Insert default academic year
INSERT INTO academic_years (year_name, start_date, end_date, is_current, description)
VALUES ('2024-2025', '2024-08-01', '2025-07-31', true, 'Academic Year 2024-2025')
ON CONFLICT (year_name) DO NOTHING;

-- Insert default semesters
INSERT INTO semesters (academic_year_id, semester_name, semester_number, start_date, end_date, is_current, description)
SELECT 
  ay.id,
  'Fall Semester 2024',
  1,
  '2024-08-01',
  '2024-12-31',
  true,
  'Fall Semester 2024'
FROM academic_years ay 
WHERE ay.year_name = '2024-2025'
ON CONFLICT (academic_year_id, semester_number) DO NOTHING;

INSERT INTO semesters (academic_year_id, semester_name, semester_number, start_date, end_date, is_current, description)
SELECT 
  ay.id,
  'Spring Semester 2025',
  2,
  '2025-01-01',
  '2025-05-31',
  false,
  'Spring Semester 2025'
FROM academic_years ay 
WHERE ay.year_name = '2024-2025'
ON CONFLICT (academic_year_id, semester_number) DO NOTHING;

-- Insert default departments
INSERT INTO departments (department_code, department_name, description)
VALUES 
  ('CS', 'Computer Science', 'Computer Science Department'),
  ('BSEM', 'Business and Entrepreneurship Management', 'Business and Entrepreneurship Management Department'),
  ('MT', 'Mathematics', 'Mathematics Department')
ON CONFLICT (department_code) DO NOTHING;

-- Insert default programs
INSERT INTO programs (program_code, program_name, department_id, degree_type, duration_years, total_credits)
SELECT 
  'CS101',
  'Computer Science',
  d.id,
  'Bachelor',
  4,
  120
FROM departments d 
WHERE d.department_code = 'CS'
ON CONFLICT (program_code) DO NOTHING;

INSERT INTO programs (program_code, program_name, department_id, degree_type, duration_years, total_credits)
SELECT 
  'BSEM101',
  'Business and Entrepreneurship Management',
  d.id,
  'Bachelor',
  4,
  120
FROM departments d 
WHERE d.department_code = 'BSEM'
ON CONFLICT (program_code) DO NOTHING;

-- Insert default classrooms
INSERT INTO classrooms (building, room_number, room_name, capacity, room_type, equipment)
VALUES 
  ('Main Block', 'MB-101', 'Main Lecture Hall', 60, 'lecture', ARRAY['Projector', 'Whiteboard', 'Audio System']),
  ('Main Block', 'MB-102', 'Conference Room', 30, 'seminar', ARRAY['Projector', 'Whiteboard']),
  ('Science Wing', 'SW-204', 'Computer Lab', 45, 'computer_lab', ARRAY['Computers', 'Projector', 'Network']),
  ('Science Wing', 'SW-205', 'Science Lab', 25, 'lab', ARRAY['Lab Equipment', 'Safety Equipment']),
  ('Business Block', 'BB-301', 'Business Lab', 40, 'lab', ARRAY['Business Software', 'Projector'])
ON CONFLICT (building, room_number) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Academic structure tables migration completed successfully!';
  RAISE NOTICE 'Added tables: academic_years, semesters, departments, programs, classrooms, sections';
  RAISE NOTICE 'Added profile tables: student_profiles, lecturer_profiles, admin_profiles';
  RAISE NOTICE 'Created RLS policies for all new tables';
  RAISE NOTICE 'Inserted default academic year, semesters, departments, programs, and classrooms';
  RAISE NOTICE 'Added triggers for automatic timestamp updates';
END $$;
