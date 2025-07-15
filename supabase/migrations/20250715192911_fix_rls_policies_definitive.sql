-- This script sets up the definitive and corrected Row Level Security (RLS) policies for the application.
-- It resolves previous errors and ensures data is secure and accessible to the correct roles.

-- 1. Enable RLS for all relevant tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Clear any old policies to start fresh
-- This ensures a clean slate and avoids conflicts from previous attempts.
DROP POLICY IF EXISTS "Users can view their own data." ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all user data." ON public.users;
DROP POLICY IF EXISTS "Lecturers can view their students." ON public.users;
DROP POLICY IF EXISTS "Lecturers can view their own courses." ON public.courses;
DROP POLICY IF EXISTS "Students can view courses they are enrolled in." ON public.courses;
DROP POLICY IF EXISTS "Students can view their own enrollments." ON public.enrollments;
DROP POLICY IF EXISTS "Lecturers can view enrollments for their courses." ON public.enrollments;
DROP POLICY IF EXISTS "Lecturers can manage sessions for their courses." ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can view sessions for their enrolled courses." ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can manage their own attendance records." ON public.attendance_records;
DROP POLICY IF EXISTS "Lecturers can view attendance records for their sessions." ON public.attendance_records;

-- 3. Define new, corrected RLS policies

-- USERS TABLE
-- Any authenticated user can view any user's profile information.
-- This is required for the login flow and for users to see names instead of IDs.
-- Privacy is maintained by other policies that restrict access to sensitive linked data.
CREATE POLICY "Authenticated users can view all user data." ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

-- COURSES TABLE
CREATE POLICY "Lecturers can view their own courses." ON public.courses
  FOR SELECT USING (auth.uid() = lecturer_id);

CREATE POLICY "Students can view courses they are enrolled in." ON public.courses
  FOR SELECT USING (EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = courses.id AND enrollments.student_id = auth.uid()));

-- ENROLLMENTS TABLE
CREATE POLICY "Students can view their own enrollments." ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Lecturers can view enrollments for their courses." ON public.enrollments
  FOR SELECT USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.lecturer_id = auth.uid()));

-- ATTENDANCE SESSIONS TABLE
CREATE POLICY "Lecturers can manage sessions for their courses." ON public.attendance_sessions
  FOR SELECT USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = attendance_sessions.course_id AND courses.lecturer_id = auth.uid()));

CREATE POLICY "Students can view sessions for their enrolled courses." ON public.attendance_sessions
  FOR SELECT USING (EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = attendance_sessions.course_id AND enrollments.student_id = auth.uid()));

-- ATTENDANCE RECORDS TABLE
CREATE POLICY "Students can manage their own attendance records." ON public.attendance_records
  FOR SELECT USING (auth.uid() = student_id);

-- CORRECTED POLICY: Lecturers can view attendance records for sessions in their courses.
CREATE POLICY "Lecturers can view attendance records for their sessions." ON public.attendance_records
  FOR SELECT USING (EXISTS (
    SELECT 1
    FROM public.attendance_sessions s
    JOIN public.courses c ON s.course_id = c.id
    WHERE s.id = attendance_records.session_id AND c.lecturer_id = auth.uid()
  ));
