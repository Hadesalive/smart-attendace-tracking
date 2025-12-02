import { Course, LecturerAssignment, Enrollment } from '@/lib/types/shared'

export interface CourseAssignment {
  id: string
  course_id: string
  program_id: string
  academic_year_id: string
  semester_id: string
  year: number
  is_mandatory: boolean
  max_students?: number
  created_at: string
  updated_at: string
}

export interface CoursesState {
  courses: Course[]
  courseAssignments: CourseAssignment[]
  enrollments: Enrollment[]
  lecturerAssignments: LecturerAssignment[]
  loading: boolean
  error: string | null
}

export interface CoursesContextType {
  state: CoursesState
  fetchCourses: () => Promise<void>
  createCourse: (data: any) => Promise<void>
  updateCourse: (id: string, data: any) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  fetchCourseAssignments: () => Promise<void>
  createCourseAssignment: (data: any) => Promise<void>
  updateCourseAssignment: (id: string, data: any) => Promise<void>
  deleteCourseAssignment: (id: string) => Promise<void>
  fetchEnrollments: () => Promise<void>
  fetchLecturerAssignments: () => Promise<void>
  getCoursesByLecturer: (lecturerId: string) => Course[]
  getStudentsByCourse: (courseId: string) => any[]
}

export type { Course, LecturerAssignment, Enrollment }
