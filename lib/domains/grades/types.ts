import { Assignment, Submission, GradeCategory, StudentGrade, CourseGradeSummary } from '@/lib/types/shared'

export interface GradesState {
  assignments: Assignment[]
  submissions: Submission[]
  gradeCategories: GradeCategory[]
  studentGrades: StudentGrade[]
  courseGradeSummaries: CourseGradeSummary[]
  loading: boolean
  error: string | null
}

export interface GradesContextType {
  state: GradesState
  // Assignments
  getAssignmentsByCourse: (courseId: string) => Assignment[]
  createAssignment: (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => void
  updateAssignment: (assignment: Assignment) => void
  // Submissions
  getSubmissionsByAssignment: (assignmentId: string) => Submission[]
  createSubmission: (submission: Omit<Submission, 'id'>) => void
  gradeSubmission: (submissionId: string, grade: number, comments?: string) => void
  // Grade Categories
  fetchGradeCategoriesForCourse: (courseId: string) => Promise<void>
  saveGradeCategoriesForCourse: (courseId: string, categories: GradeCategory[]) => Promise<void>
  updateGradeCategory: (courseId: string, categories: GradeCategory[]) => void
  // Student Grades
  fetchStudentGradesForCourse: (courseId: string) => Promise<void>
  getStudentGradesByCourse: (studentId: string, courseId: string) => StudentGrade[]
  getCourseGradeSummary: (studentId: string, courseId: string) => CourseGradeSummary | null
  calculateFinalGrade: (studentId: string, courseId: string) => number
}
