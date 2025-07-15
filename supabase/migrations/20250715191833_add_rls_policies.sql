-- This script enables Row Level Security (RLS) and creates policies
-- to ensure users can only access data they are permitted to see.

-- Enable RLS for all relevant tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clear any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data." ON public.users;
DROP POLICY IF EXISTS "Lecturers can view their own courses." ON public.courses;
DROP POLICY IF EXISTS "Students can view courses they are enrolled in." ON public.courses;
DROP POLICY IF EXISTS "Students can view their own enrollments." ON public.enrollments;
DROP POLICY IF EXISTS "Lecturers can view enrollments for their courses." ON public.enrollments;
DROP POLICY IF EXISTS "Lecturers can manage sessions for their courses." ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can view sessions for their enrolled courses." ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can manage their own attendance records." ON public.attendance_records;
DROP POLICY IF EXISTS "Lecturers can view attendance records for their sessions." ON public.attendance_records;

-- 1. Users Table Policies
-- Users can view their own profile.
CREATE POLICY "Users can view their own data." ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Lecturers can view the profiles of students enrolled in their courses.
CREATE POLICY "Lecturers can view their students." ON public.users
  FOR SELECT USING (
    (get_user_role(auth.uid()) = 'lecturer') AND
    EXISTS (
      SELECT 1
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.lecturer_id = auth.uid() AND e.student_id = users.id
    )
  );

-- 2. Courses Table Policies
-- Lecturers can see any course they are assigned to.
CREATE POLICY "Lecturers can view their own courses." ON public.courses
  FOR SELECT USING (auth.uid() = lecturer_id);

-- Students can see any course they are enrolled in.
CREATE POLICY "Students can view courses they are enrolled in." ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM enrollments
      WHERE enrollments.course_id = courses.id
        AND enrollments.student_id = auth.uid()
    )
  );

-- 3. Enrollments Table Policies
-- Students can see their own enrollment records.
CREATE POLICY "Students can view their own enrollments." ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- Lecturers can see all enrollments for the courses they teach.
CREATE POLICY "Lecturers can view enrollments for their courses." ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM courses
      WHERE courses.id = enrollments.course_id
        AND courses.lecturer_id = auth.uid()
    )
  );

-- 4. Attendance Sessions Table Policies
-- Lecturers can see all sessions for courses they teach.
CREATE POLICY "Lecturers can manage sessions for their courses." ON public.attendance_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM courses
      WHERE courses.id = attendance_sessions.course_id
        AND courses.lecturer_id = auth.uid()
    )
  );

-- Students can see sessions for courses they are enrolled in.
CREATE POLICY "Students can view sessions for their enrolled courses." ON public.attendance_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM enrollments
      WHERE enrollments.course_id = attendance_sessions.course_id
        AND enrollments.student_id = auth.uid()
    )
  );

-- 5. Attendance Records Table Policies
-- Students can see their own attendance records.
CREATE POLICY "Students can manage their own attendance records." ON public.attendance_records
  FOR SELECT USING (auth.uid() = student_id);

-- Lecturers can see all attendance records for sessions in their courses.
CREATE POLICY "Lecturers can view attendance records for their sessions." ON public.attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM attendance_sessions
      WHERE attendance_sessions.id = attendance_records.session_id
        AND EXISTS (
          SELECT 1
          FROM courses
          WHERE courses.id = attendance_sessions.course_id
            AND courses.lecturer_id = auth.uid()
        )
    )
  );
