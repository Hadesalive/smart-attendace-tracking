/**
 * JOINED DATA TYPES
 * 
 * TypeScript interfaces for database query results that include JOIN operations.
 * These types extend base types with optional joined relationships to maintain type safety
 * throughout the application while working with complex database queries.
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 */

import {
  SectionEnrollment,
  StudentProfile,
  LecturerProfile,
  AdminProfile,
  Department,
  Program,
  Section,
  AcademicYear,
  Semester,
  Classroom
} from '@/lib/domains/academic/types'
import { Course, CourseAssignment, LecturerAssignment } from '@/lib/domains/courses/types'
import { AttendanceSession, AttendanceRecord } from '@/lib/domains/attendance/types'

// ============================================================================
// USER PROFILE TYPES WITH JOINS
// ============================================================================

export interface UserWithProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'lecturer' | 'student'
  student_id?: string
  profile_image_url?: string
  created_at: string
  updated_at: string
  department?: string
}

export interface StudentProfileWithUser extends StudentProfile {
  users?: {
    full_name: string
    email: string
    student_id?: string
  }
}

export interface LecturerProfileWithUser extends LecturerProfile {
  users?: {
    full_name: string
    email: string
  }
  departments?: Department
}

export interface AdminProfileWithUser extends AdminProfile {
  users?: {
    full_name: string
    email: string
  }
  departments?: Department
}

// ============================================================================
// ACADEMIC STRUCTURE TYPES WITH JOINS
// ============================================================================

export interface ProgramWithDepartment extends Program {
  departments?: Department
}

export interface SectionWithJoins extends Section {
  programs?: ProgramWithDepartment
  academic_years?: AcademicYear
  semesters?: Semester
  classrooms?: Classroom
}

export interface SectionEnrollmentWithJoins extends SectionEnrollment {
  users?: {
    student_id?: string
    full_name: string
    email: string
  }
  sections?: {
    section_code: string
    year: number
    programs?: ProgramWithDepartment
    academic_years?: AcademicYear
    semesters?: Semester
  }
  // Transformed fields for display
  student_name?: string
  student_id_number?: string
  section_code?: string
  year?: number
  program_name?: string
  program_code?: string
  academic_year?: string
  semester_name?: string
  // Filtering IDs
  program_id?: string
  semester_id?: string
  academic_year_id?: string
}

// ============================================================================
// COURSE TYPES WITH JOINS
// ============================================================================

export interface CourseWithAssignments extends Course {
  courseAssignments?: CourseAssignment[]
  lecturerAssignments?: LecturerAssignment[]
}

export interface CourseAssignmentWithJoins extends CourseAssignment {
  courses?: Course
  programs?: ProgramWithDepartment
  academic_years?: AcademicYear
  semesters?: Semester
}

export interface LecturerAssignmentWithJoins extends LecturerAssignment {
  courses?: Course
  sections?: SectionWithJoins
  users?: UserWithProfile
}

// ============================================================================
// ATTENDANCE TYPES WITH JOINS
// ============================================================================

export interface AttendanceSessionWithJoins extends AttendanceSession {
  courses?: Course
  users?: UserWithProfile // Lecturer
  sections?: SectionWithJoins
}

export interface AttendanceRecordWithJoins extends AttendanceRecord {
  users?: UserWithProfile // Student
  attendance_sessions?: AttendanceSessionWithJoins
}

// ============================================================================
// TRANSFORMED DATA TYPES (for UI display)
// ============================================================================

export interface TransformedSection {
  id: string
  section_code: string
  year: number
  semester: string
  semester_number: number
  program: string
  program_code: string
  department: string
  department_code: string
  academic_year: string
  max_capacity: number
  current_enrollment: number
  classroom: string
  is_active: boolean
  // ID properties for filtering
  program_id: string
  semester_id: string
  academic_year_id: string
}

export interface TransformedCourse {
  id: string
  code: string
  name: string
  program: string
  course_code: string
  course_name: string
  credits: number
  department: string
  lecturer_id?: string
}

export interface TransformedAssignment {
  id: string
  course_id: string
  course_code: string
  course_name: string
  program: string
  program_code: string
  academic_year: string
  semester: string
  semester_number: number
  year: number
  is_mandatory: boolean
  max_students: number | null
  // ID properties for filtering
  program_id: string
  semester_id: string
  academic_year_id: string
}

export interface TransformedEnrollment {
  id: string
  student_name: string
  student_id_number: string
  program: string
  program_code: string
  year: number | string
  semester: string
  academic_year: string
  enrollment_date: string
  status: 'active' | 'dropped' | 'completed'
  inherited_courses: Array<{
    course_code: string
    course_name: string
    credits: number
    is_mandatory: boolean
  }>
  course_count: number
  sections: string[]
  section_count: number
  courses_display: string
  section?: string // Computed display field
  // ID properties for filtering
  student_id: string
  program_id: string
  semester_id: string
  academic_year_id: string
}

export interface EnrolledStudent {
  id: string
  student_id: string
  student_name: string
  student_id_number: string
  program: string
  program_code: string
  year: number
  semester: string
  academic_year: string
  section: string
  sections: string[]
  enrollment_date: string
  status: 'active' | 'dropped' | 'completed'
  // ID properties for filtering
  program_id: string
  semester_id: string
  academic_year_id: string
}

