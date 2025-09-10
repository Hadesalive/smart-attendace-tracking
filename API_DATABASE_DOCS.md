# API & Database Documentation

This document provides comprehensive documentation for the Smart Attendance Tracking System's API endpoints, database schema, and data relationships.

## 🗄️ Database Schema

### Core Tables

#### `users` Table
Stores user information for all roles (admin, lecturer, student).

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'lecturer', 'student')) NOT NULL,
  student_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  profile_image_url TEXT,
  face_encoding TEXT, -- For facial recognition data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key (UUID)
- `email`: User's email address (unique)
- `full_name`: User's full name
- `role`: User role (admin/lecturer/student)
- `student_id`: Student ID (only for students, unique)
- `department`: Academic department
- `profile_image_url`: Profile image URL
- `face_encoding`: Facial recognition data (JSON/text)
- `created_at`/`updated_at`: Timestamps

#### `courses` Table
Stores course information.

```sql
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  lecturer_id UUID REFERENCES users(id),
  department VARCHAR(100),
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key (UUID)
- `course_code`: Course code (e.g., "CS101") - unique
- `course_name`: Full course name
- `lecturer_id`: Reference to lecturer (users.id)
- `department`: Academic department
- `credits`: Course credits (default: 3)
- `created_at`: Creation timestamp

#### `enrollments` Table
Junction table for student-course relationships.

```sql
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
```

**Fields:**
- `id`: Primary key (UUID)
- `student_id`: Reference to student (users.id)
- `course_id`: Reference to course (courses.id)
- `enrolled_at`: Enrollment timestamp
- **Unique constraint**: One enrollment per student-course pair

#### `attendance_sessions` Table
Stores attendance session information.

```sql
CREATE TABLE attendance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  lecturer_id UUID REFERENCES users(id),
  session_name VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  qr_code TEXT, -- QR code data
  is_active BOOLEAN DEFAULT true,
  attendance_method VARCHAR(20) CHECK (attendance_method IN ('qr_code', 'facial_recognition', 'hybrid')) DEFAULT 'hybrid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key (UUID)
- `course_id`: Reference to course (courses.id)
- `lecturer_id`: Reference to lecturer (users.id)
- `session_name`: Session description
- `session_date`: Session date
- `start_time`/`end_time`: Session time boundaries
- `qr_code`: QR code data for attendance
- `is_active`: Whether session is currently active
- `attendance_method`: Method (qr_code/facial_recognition/hybrid)
- `created_at`: Creation timestamp

#### `attendance_records` Table
Stores individual attendance markings.

```sql
CREATE TABLE attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES attendance_sessions(id),
  student_id UUID REFERENCES users(id),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  method_used VARCHAR(20) CHECK (method_used IN ('qr_code', 'facial_recognition')) NOT NULL,
  location_data JSONB, -- For storing location if needed
  confidence_score DECIMAL(3,2), -- For facial recognition confidence
  UNIQUE(session_id, student_id)
);
```

**Fields:**
- `id`: Primary key (UUID)
- `session_id`: Reference to session (attendance_sessions.id)
- `student_id`: Reference to student (users.id)
- `marked_at`: When attendance was marked
- `method_used`: How attendance was marked (qr_code/facial_recognition)
- `location_data`: Optional location data (JSONB)
- `confidence_score`: Facial recognition confidence (0.00-1.00)
- **Unique constraint**: One record per student-session pair

## 🔗 Database Relationships

```
users (1) ──── (many) enrollments (many) ──── (1) courses
   │                                              │
   │                                              │
   └── (1) lecturer ──────────────────────────────┘
               │
               └── (many) attendance_sessions
                              │
                              └── (many) attendance_records
                                             │
                                             └── (1) student
```

### Relationship Details

- **Users → Enrollments**: One-to-many (students enroll in multiple courses)
- **Courses → Enrollments**: One-to-many (courses have multiple enrolled students)
- **Users → Courses**: One-to-many (lecturers teach multiple courses)
- **Courses → Attendance Sessions**: One-to-many (courses have multiple sessions)
- **Users → Attendance Sessions**: One-to-many (lecturers create multiple sessions)
- **Attendance Sessions → Attendance Records**: One-to-many (sessions have multiple attendance records)
- **Users → Attendance Records**: One-to-many (students have multiple attendance records)

## 🔐 Row Level Security (RLS) Policies

### Users Table
```sql
CREATE POLICY "Authenticated users can view all user data." ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');
```
- All authenticated users can view user profiles
- Required for displaying names instead of IDs

### Courses Table
```sql
-- Lecturers can view their own courses
CREATE POLICY "Lecturers can view their own courses." ON public.courses
  FOR SELECT USING (auth.uid() = lecturer_id);

-- Students can view courses they are enrolled in
CREATE POLICY "Students can view courses they are enrolled in." ON public.courses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = courses.id
    AND enrollments.student_id = auth.uid()
  ));
```

### Enrollments Table
```sql
-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments." ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- Lecturers can view enrollments for their courses
CREATE POLICY "Lecturers can view enrollments for their courses." ON public.enrollments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.lecturer_id = auth.uid()
  ));
```

### Attendance Sessions Table
```sql
-- Lecturers can manage sessions for their courses
CREATE POLICY "Lecturers can manage sessions for their courses." ON public.attendance_sessions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = attendance_sessions.course_id
    AND courses.lecturer_id = auth.uid()
  ));

-- Students can view sessions for their enrolled courses
CREATE POLICY "Students can view sessions for their enrolled courses." ON public.attendance_sessions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = attendance_sessions.course_id
    AND enrollments.student_id = auth.uid()
  ));
```

### Attendance Records Table
```sql
-- Students can manage their own attendance records
CREATE POLICY "Students can manage their own attendance records." ON public.attendance_records
  FOR SELECT USING (auth.uid() = student_id);

-- Lecturers can view attendance records for their sessions
CREATE POLICY "Lecturers can view attendance records for their sessions." ON public.attendance_records
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.attendance_sessions s
    JOIN public.courses c ON s.course_id = c.id
    WHERE s.id = attendance_records.session_id
    AND c.lecturer_id = auth.uid()
  ));
```

## 🚀 API Endpoints

### Next.js API Routes

#### `/api/check-env`
**Method:** GET
**Purpose:** Check if environment variables are properly configured
**Response:**
```json
{
  "message": "Checking for SUPABASE_SERVICE_ROLE_KEY...",
  "keyExists": true
}
```

### Supabase Edge Functions

#### `mark-attendance` Function
**URL:** `https://your-project.supabase.co/functions/v1/mark-attendance`
**Method:** POST
**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "uuid",
  "student_id": "uuid"
}
```

**Success Response (200):**
```json
{
  "message": "Attendance marked successfully!"
}
```

**Error Response (400):**
```json
{
  "error": "Error message describing what went wrong"
}
```

**Validation Logic:**
1. ✅ Session exists and is valid
2. ✅ Current time is within session boundaries
3. ✅ Student is enrolled in the course
4. ✅ No duplicate attendance for this session
5. ✅ Insert attendance record

## 📊 Common Database Queries

### Get User's Courses (Student)
```sql
SELECT c.*
FROM courses c
JOIN enrollments e ON c.id = e.course_id
WHERE e.student_id = $1;
```

### Get Lecturer's Courses
```sql
SELECT * FROM courses WHERE lecturer_id = $1;
```

### Get Active Sessions for Course
```sql
SELECT * FROM attendance_sessions
WHERE course_id = $1
AND is_active = true
AND session_date = CURRENT_DATE
AND CURRENT_TIME BETWEEN start_time AND end_time;
```

### Get Attendance Statistics for Student
```sql
SELECT
  c.course_name,
  COUNT(ar.id) as attended_sessions,
  COUNT(DISTINCT s.id) as total_sessions,
  ROUND(COUNT(ar.id)::decimal / COUNT(DISTINCT s.id) * 100, 2) as attendance_percentage
FROM courses c
JOIN enrollments e ON c.id = e.course_id
LEFT JOIN attendance_sessions s ON c.id = s.course_id
LEFT JOIN attendance_records ar ON s.id = ar.session_id AND ar.student_id = e.student_id
WHERE e.student_id = $1
GROUP BY c.id, c.course_name;
```

### Get Session Attendance Summary
```sql
SELECT
  s.session_name,
  COUNT(ar.id) as present_count,
  COUNT(DISTINCT e.student_id) as enrolled_count,
  ROUND(COUNT(ar.id)::decimal / COUNT(DISTINCT e.student_id) * 100, 2) as attendance_rate
FROM attendance_sessions s
JOIN courses c ON s.course_id = c.id
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN attendance_records ar ON s.id = ar.session_id
WHERE s.id = $1
GROUP BY s.id, s.session_name;
```

## 🔍 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date);
```

## 🌱 Sample Data

### Default Users
```sql
-- Admin
INSERT INTO users (email, full_name, role, department)
VALUES ('admin@university.edu', 'System Administrator', 'admin', 'IT');

-- Lecturers
INSERT INTO users (email, full_name, role, department)
VALUES
  ('john.lecturer@university.edu', 'Dr. John Smith', 'lecturer', 'Computer Science'),
  ('jane.lecturer@university.edu', 'Prof. Jane Doe', 'lecturer', 'Mathematics');

-- Students
INSERT INTO users (email, full_name, role, student_id, department)
VALUES
  ('alice.student@university.edu', 'Alice Johnson', 'student', 'CS2021001', 'Computer Science'),
  ('bob.student@university.edu', 'Bob Wilson', 'student', 'CS2021002', 'Computer Science'),
  ('charlie.student@university.edu', 'Charlie Brown', 'student', 'MT2021001', 'Mathematics');
```

### Sample Courses
```sql
INSERT INTO courses (course_code, course_name, lecturer_id, department) VALUES
  ('CS101', 'Introduction to Programming', lecturer_id_1, 'Computer Science'),
  ('CS201', 'Data Structures', lecturer_id_1, 'Computer Science'),
  ('MT101', 'Calculus I', lecturer_id_2, 'Mathematics');
```

## 🔄 Data Flow Examples

### Student Attendance Marking Flow
1. Student scans QR code → Gets `session_id`
2. App calls `mark-attendance` function with `session_id` and `student_id`
3. Function validates session time, enrollment, and duplicates
4. Attendance record is inserted
5. Success/error response returned
6. Dashboard updates in real-time via Supabase subscriptions

### Session Creation Flow
1. Lecturer creates session via form
2. QR code is generated and stored
3. Session is inserted into database
4. Students can view and attend session
5. Real-time updates show attendance progress

## 🚨 Error Handling

### Common Error Scenarios
- **Invalid Session**: Session doesn't exist or is expired
- **Time Outside Bounds**: Attendance marked outside session time
- **Not Enrolled**: Student not enrolled in course
- **Duplicate Attendance**: Student already marked for session
- **Authentication Failed**: Invalid or missing JWT token

### Error Response Format
```json
{
  "error": "Descriptive error message"
}
```

## 🔧 Maintenance & Operations

### Database Cleanup
```sql
-- Remove old attendance sessions (older than 1 year)
DELETE FROM attendance_sessions
WHERE created_at < NOW() - INTERVAL '1 year';

-- Remove orphaned attendance records
DELETE FROM attendance_records
WHERE session_id NOT IN (SELECT id FROM attendance_sessions);
```

### Performance Monitoring
- Monitor query execution times
- Check index usage and effectiveness
- Monitor database connection pool usage
- Track RLS policy performance

### Backup Strategy
- Daily automated backups via Supabase
- Point-in-time recovery capability
- Test restore procedures regularly

This documentation provides a complete reference for the system's data architecture and API interfaces.


