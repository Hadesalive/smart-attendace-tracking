// ============================================================================
// SHARED TYPE DEFINITIONS
// ============================================================================
// These types ensure consistency across all admin, lecturer, and student pages

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'lecturer' | 'student'
  student_id?: string
  department?: string
  profile_image_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  status: string
  id: string
  course_code: string
  course_name: string
  lecturer_id: string
  lecturer_name?: string
  department?: string
  credits: number
  created_at: string
}

export interface Class {
  id: string
  name: string
  level: string
  year: number
  semester: number
  program: string
  section: string
}

export interface Student {
  id: string
  full_name: string
  student_id: string
  email: string
  class_id?: string
}

// ============================================================================
// HOMEWORK & ASSIGNMENTS
// ============================================================================

export interface Assignment {
  id: string
  title: string
  description: string
  course_id: string
  course_code: string
  course_name: string
  class_id: string
  class_name: string
  due_date: string
  total_points: number
  late_penalty_enabled: boolean
  late_penalty_percent: number
  late_penalty_interval: 'day' | 'week'
  category_id: string // Links to gradebook category
  status: 'draft' | 'published' | 'closed'
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  student_name: string
  student_email: string
  submitted_at: string
  grade: number | null
  max_grade: number
  status: 'pending' | 'submitted' | 'late' | 'graded'
  late_penalty_applied: number
  final_grade: number | null
  comments: string
  submission_text?: string
  submission_files?: string[]
}

// ============================================================================
// SESSIONS & ATTENDANCE
// ============================================================================

export interface AttendanceSession {
  id: string
  course_id: string
  section_id?: string // Added section_id for section-based sessions
  lecturer_id?: string // Added to match database schema
  course_code: string
  course_name: string
  class_id: string
  class_name: string
  session_name: string
  session_date: string
  start_time: string
  end_time: string
  location?: string
  qr_code?: string
  is_active: boolean
  attendance_method: 'qr_code' | 'facial_recognition' | 'hybrid'
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  created_at: string
  // Additional fields for UI compatibility
  lecturer_name?: string
  type?: 'lecture' | 'tutorial' | 'lab' | 'quiz' | 'exam' | 'seminar'
  capacity?: number
  enrolled?: number
  description?: string
}

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  student_name: string
  student_email: string
  marked_at: string
  method_used: 'qr_code' | 'facial_recognition'
  status: 'present' | 'late' | 'absent'
  check_in_time?: string
  location_data?: any
  confidence_score?: number
}

// ============================================================================
// GRADES & GRADEBOOK
// ============================================================================

export interface GradeCategory {
  id: string
  name: string
  percentage: number
  is_default: boolean
  course_id?: string
}

export interface GradeScale {
  id: string
  letter: string
  min_percentage: number
  max_percentage: number
  description?: string
}

export interface StudentGrade {
  id: string
  student_id: string
  course_id: string
  category_id: string
  assignment_id?: string
  session_id?: string
  points: number
  max_points: number
  percentage: number
  letter_grade: string
  is_late: boolean
  late_penalty: number
  final_points: number
  comments?: string
  created_at: string
  updated_at: string
  // Additional fields for UI compatibility
  assignment_title?: string
  course_code?: string
  course_name?: string
  category?: string
  graded_at?: string
  feedback?: string
}

export interface CourseGradeSummary {
  course_id: string
  course_code: string
  course_name: string
  student_id: string
  student_name: string
  category_grades: { [categoryId: string]: number }
  final_grade: number
  final_letter_grade: string
  attendance_rate: number
  total_assignments: number
  submitted_assignments: number
}

// ============================================================================
// MATERIALS & RESOURCES
// ============================================================================

export interface Material {
  id: string
  title: string
  description: string
  course_id: string
  course_code: string
  session_id?: string
  material_type: 'document' | 'video' | 'image' | 'link' | 'presentation'
  file_url?: string
  file_size?: number
  file_type?: string
  external_url?: string
  is_public: boolean
  download_count?: number
  author_id?: string
  author_name?: string
  file_name?: string
  category?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// ENROLLMENTS & RELATIONSHIPS
// ============================================================================

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  class_id: string
  enrolled_at: string
  status: 'active' | 'dropped' | 'completed'
}

export interface LecturerAssignment {
  id: string
  lecturer_id: string
  course_id: string
  class_id: string
  assigned_at: string
  status: 'active' | 'inactive'
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export interface CourseStats {
  total_students: number
  active_students: number
  total_assignments: number
  pending_assignments: number
  average_attendance: number
  average_grade: number
  completion_rate: number
}

export interface StudentStats {
  total_courses: number
  active_courses: number
  completed_courses: number
  overall_attendance_rate: number
  average_grade: number
  total_assignments: number
  submitted_assignments: number
  pending_assignments: number
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface FilterState {
  search_query: string
  selected_course: string
  selected_class: string
  selected_status: string
  date_range?: {
    start: string
    end: string
  }
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  has_next: boolean
  has_prev: boolean
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: PaginationState
}

export interface ApiError {
  message: string
  code: string
  details?: any
}
