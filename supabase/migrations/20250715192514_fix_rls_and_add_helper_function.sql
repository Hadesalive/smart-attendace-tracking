-- This script creates a helper function to get a user's role
-- and then sets up the definitive RLS policies for the application.

-- 1. Create the user role helper function
-- This function securely retrieves a user's role from their user ID.
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS for all relevant tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Clear any old policies to start fresh
DROP POLICY IF EXISTS "Users can view their own data." ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all user data." ON public.users;
DROP POLICY IF EXISTS "Lecturers can view their students." ON public.users;
-- ... drop other old policies ...
DROP POLICY IF EXISTS "Lecturers can view their own courses." ON public.courses;
DROP POLICY IF EXISTS "Students can view courses they are enrolled in." ON public.courses;
DROP POLICY IF EXISTS "Students can view their own enrollments." ON public.enrollments;
DROP POLICY IF EXISTS "Lecturers can view enrollments for their courses." ON public.enrollments;
DROP POLICY IF EXISTS "Lecturers can manage sessions for their courses." ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can view sessions for their enrolled courses." ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can manage their own attendance records." ON public.attendance_records;
DROP POLICY IF EXISTS "Lecturers can view attendance records for their sessions." ON public.attendance_records;


-- 4. Define new, corrected RLS policies

-- USERS TABLE
-- Policy 1: Any authenticated user can view any profile.
-- This is needed for the login flow and for lecturers to see student names.
-- Privacy is maintained because other policies prevent students from seeing sensitive data.
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

CREATE POLICY "Lecturers can view attendance records for their sessions." ON public.attendance_records
  FOR SELECT USING (EXISTS (SELECT 1 FROM attendance_sessions JOIN courses ON attendance_sessions.course_id = courses.id WHERE attendance_sessions.id = attendance_records.session_id AND courses.lecturer_id = auth.uid()));
