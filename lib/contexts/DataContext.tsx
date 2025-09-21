"use client"

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { 
  useAuth, 
  useCourses, 
  useAttendance, 
  useAcademicStructure, 
  useGrades, 
  useMaterials
} from '@/lib/domains'
import { 
  User, 
  Course, 
  Class, 
  Student, 
  Assignment, 
  Submission, 
  Material, 
  AttendanceSession, 
  AttendanceRecord, 
  GradeCategory, 
  CourseGradeSummary
} from '@/lib/types/shared'
import {
  AcademicYear,
  Semester,
  Department,
  Program,
  Classroom,
  Section,
  StudentProfile,
  LecturerProfile,
  AdminProfile
} from '@/lib/domains/academic/types'

// ============================================================================
// NEW DATA CONTEXT - Uses Domain Hooks
// ============================================================================

interface DataContextType {
  // Auth
  auth: ReturnType<typeof useAuth>
  
  // Courses
  courses: ReturnType<typeof useCourses>
  
  // Attendance
  attendance: ReturnType<typeof useAttendance>
  
  // Academic Structure
  academic: ReturnType<typeof useAcademicStructure>
  
  // Grades
  grades: ReturnType<typeof useGrades>
  
  // Materials
  materials: ReturnType<typeof useMaterials>
  
  // Global state
  global: {
    state: {
      currentUser: User | null
      loading: boolean
      error: string | null
      lastUpdated: number
    }
    setState: (state: { currentUser: User | null; loading: boolean; error: string | null; lastUpdated: number }) => void
    refreshData: () => void
  }
  
  // Legacy compatibility methods (for gradual migration)
  state: {
    currentUser: User | null
    users: User[]
    courses: Course[]
    courseAssignments: any[] // Will be typed when CourseAssignment is properly defined
    classes: Class[]
    students: Student[]
    enrollments: any[] // Will be typed when Enrollment is properly defined
    lecturerAssignments: any[] // Will be typed when LecturerAssignment is properly defined
    assignments: Assignment[]
    submissions: Submission[]
    materials: Material[]
    attendanceSessions: AttendanceSession[]
    attendanceRecords: AttendanceRecord[]
    gradeCategories: GradeCategory[]
    studentGrades: any[] // Will be typed when StudentGrade is properly defined
    courseGradeSummaries: CourseGradeSummary[]
    academicYears: AcademicYear[]
    semesters: Semester[]
    departments: Department[]
    programs: Program[]
    classrooms: Classroom[]
    sections: Section[]
    studentProfiles: StudentProfile[]
    lecturerProfiles: LecturerProfile[]
    adminProfiles: AdminProfile[]
    courseStats: Record<string, any> // Generic stats object
    studentStats: Record<string, any> // Generic stats object
    loading: boolean
    error: string | null
    lastUpdated: number
  }
  
  // Legacy methods (for gradual migration)
  loadCurrentUser: () => Promise<void>
  getCoursesByLecturer: (lecturerId: string) => Course[]
  getStudentsByCourse: (courseId: string) => Student[]
  getAssignmentsByCourse: (courseId: string) => Assignment[]
  getSubmissionsByAssignment: (assignmentId: string) => Submission[]
  getAttendanceSessionsByCourse: (courseId: string) => AttendanceSession[]
  getAttendanceRecordsBySession: (sessionId: string) => AttendanceRecord[]
  getStudentGradesByCourse: (studentId: string, courseId: string) => any[] // Will be typed when StudentGrade is properly defined
  getCourseGradeSummary: (studentId: string, courseId: string) => CourseGradeSummary | null
  createAssignment: (assignment: Omit<Assignment, 'id' | 'created_at'>) => void
  updateAssignment: (assignment: Assignment) => void
  createSubmission: (submission: Omit<Submission, 'id' | 'created_at'>) => void
  gradeSubmission: (submissionId: string, grade: number, comments?: string) => void
  createAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'created_at'>) => void
  markAttendance: (sessionId: string, studentId: string, status: 'present' | 'late' | 'absent', method: 'qr_code' | 'facial_recognition') => void
  updateGradeCategory: (courseId: string, categories: GradeCategory[]) => void
  calculateFinalGrade: (studentId: string, courseId: string) => number
  refreshData: () => void
  
  // Supabase data fetching
  fetchUsers: () => Promise<void>
  fetchCourses: () => Promise<void>
  createCourse: (data: Omit<Course, 'id' | 'created_at'>) => Promise<void>
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  createCourseAssignment: (data: Record<string, any>) => Promise<void> // Will be typed when CourseAssignment is properly defined
  updateCourseAssignment: (id: string, data: Record<string, any>) => Promise<void>
  deleteCourseAssignment: (id: string) => Promise<void>
  fetchCourseAssignments: () => Promise<void>
  fetchEnrollments: () => Promise<void>
  fetchAttendanceSessions: () => Promise<void>
  fetchAttendanceRecords: () => Promise<void>
  fetchLecturerAssignments: () => Promise<void>
  
  // Academic structure data fetching
  fetchAcademicYears: () => Promise<void>
  fetchSemesters: () => Promise<void>
  fetchDepartments: () => Promise<void>
  fetchPrograms: () => Promise<void>
  fetchClassrooms: () => Promise<void>
  fetchSections: () => Promise<void>
  fetchStudentProfiles: () => Promise<void>
  fetchLecturerProfiles: () => Promise<void>
  fetchAdminProfiles: () => Promise<void>
  
  // Academic structure CRUD operations
  createAcademicYear: (data: Omit<AcademicYear, 'id' | 'created_at'>) => Promise<void>
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => Promise<void>
  deleteAcademicYear: (id: string) => Promise<void>
  createSemester: (data: Omit<Semester, 'id' | 'created_at'>) => Promise<void>
  updateSemester: (id: string, data: Partial<Semester>) => Promise<void>
  deleteSemester: (id: string) => Promise<void>
  createDepartment: (data: Omit<Department, 'id' | 'created_at'>) => Promise<void>
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>
  deleteDepartment: (id: string) => Promise<void>
  createProgram: (data: Omit<Program, 'id' | 'created_at'>) => Promise<void>
  updateProgram: (id: string, data: Partial<Program>) => Promise<void>
  deleteProgram: (id: string) => Promise<void>
  createClassroom: (data: Omit<Classroom, 'id' | 'created_at'>) => Promise<void>
  updateClassroom: (id: string, data: Partial<Classroom>) => Promise<void>
  deleteClassroom: (id: string) => Promise<void>
  createSection: (data: Omit<Section, 'id' | 'created_at'>) => Promise<void>
  updateSection: (id: string, data: Partial<Section>) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  createUser: (data: Omit<User, 'id' | 'created_at'>) => Promise<void>
  updateUser: (id: string, data: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  
  // Supabase CRUD operations
  createAttendanceSessionSupabase: (session: Omit<AttendanceSession, 'id' | 'created_at'>) => Promise<AttendanceSession>
  updateAttendanceSessionSupabase: (sessionId: string, updates: Partial<AttendanceSession>) => Promise<void>
  deleteAttendanceSessionSupabase: (sessionId: string) => Promise<void>
  markAttendanceSupabase: (sessionId: string, studentId: string, method: 'qr_code' | 'facial_recognition') => Promise<void>
  
  // Time-based status utilities
  getSessionTimeStatus: (session: AttendanceSession) => 'upcoming' | 'active' | 'completed'
  updateSessionStatusBasedOnTime: (sessionId: string) => Promise<void>
  
  // Real-time subscriptions
  subscribeToAttendanceSessions: (courseId?: string) => void
  subscribeToAttendanceRecords: (sessionId?: string) => void
  unsubscribeAll: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Initialize all domain hooks
  const auth = useAuth()
  const courses = useCourses()
  const attendance = useAttendance()
  const academic = useAcademicStructure()
  const grades = useGrades()
  const materials = useMaterials()
  
  // Create a simple global state
  const global = useMemo(() => ({
    state: {
      currentUser: auth.state.currentUser,
      loading: auth.state.loading || courses.state.loading || attendance.state.loading || academic.state.loading || grades.state.loading || materials.state.loading,
      error: auth.state.error || courses.state.error || attendance.state.error || academic.state.error || grades.state.error || materials.state.error,
      lastUpdated: Date.now()
    },
    setState: (newState: any) => {
      // Simple state update - in a real app you might want more sophisticated state management
      console.log('Global state update:', newState)
    },
    refreshData: () => {
      // Refresh all domain data
      auth.fetchUsers()
      courses.fetchCourses()
      attendance.fetchAttendanceSessions()
      academic.fetchAcademicYears()
      grades.fetchStudentGradesForCourse('')
      materials.fetchMaterials()
    }
  }), [
    auth.state.currentUser,
    auth.state.loading,
    courses.state.loading,
    attendance.state.loading,
    academic.state.loading,
    grades.state.loading,
    materials.state.loading,
    auth.state.error,
    courses.state.error,
    attendance.state.error,
    academic.state.error,
    grades.state.error,
    materials.state.error,
    auth.fetchUsers,
    courses.fetchCourses,
    attendance.fetchAttendanceSessions,
    academic.fetchAcademicYears,
    grades.fetchStudentGradesForCourse,
    materials.fetchMaterials
  ])

  // Load current user on mount
  useEffect(() => {
    auth.loadCurrentUser()
  }, [auth.loadCurrentUser])

  // Create legacy state object for backward compatibility
  const legacyState = useMemo(() => ({
    currentUser: auth.state.currentUser,
    users: auth.state.users,
    courses: courses.state.courses,
    courseAssignments: courses.state.courseAssignments,
    classes: [], // Not implemented in domains yet
    students: [], // Not implemented in domains yet
    enrollments: courses.state.enrollments,
    lecturerAssignments: courses.state.lecturerAssignments,
    assignments: grades.state.assignments,
    submissions: grades.state.submissions,
    materials: materials.state.materials,
    attendanceSessions: attendance.state.attendanceSessions,
    attendanceRecords: attendance.state.attendanceRecords,
    gradeCategories: grades.state.gradeCategories,
    studentGrades: grades.state.studentGrades,
    courseGradeSummaries: grades.state.courseGradeSummaries,
    academicYears: academic.state.academicYears,
    semesters: academic.state.semesters,
    departments: academic.state.departments,
    programs: academic.state.programs,
    classrooms: academic.state.classrooms,
    sections: academic.state.sections,
    studentProfiles: academic.state.studentProfiles,
    lecturerProfiles: academic.state.lecturerProfiles,
    adminProfiles: academic.state.adminProfiles,
    courseStats: {}, // Not implemented in domains yet
    studentStats: {}, // Not implemented in domains yet
    loading: auth.state.loading || courses.state.loading || attendance.state.loading || academic.state.loading || grades.state.loading || materials.state.loading,
    error: auth.state.error || courses.state.error || attendance.state.error || academic.state.error || grades.state.error || materials.state.error,
    lastUpdated: Date.now()
  }), [
    auth.state.currentUser,
    auth.state.users,
    courses.state.courses,
    courses.state.courseAssignments,
    courses.state.enrollments,
    courses.state.lecturerAssignments,
    grades.state.assignments,
    grades.state.submissions,
    materials.state.materials,
    attendance.state.attendanceSessions,
    attendance.state.attendanceRecords,
    grades.state.gradeCategories,
    grades.state.studentGrades,
    grades.state.courseGradeSummaries,
    academic.state.academicYears,
    academic.state.semesters,
    academic.state.departments,
    academic.state.programs,
    academic.state.classrooms,
    academic.state.sections,
    academic.state.studentProfiles,
    academic.state.lecturerProfiles,
    academic.state.adminProfiles,
    auth.state.loading,
    courses.state.loading,
    attendance.state.loading,
    academic.state.loading,
    grades.state.loading,
    materials.state.loading,
    auth.state.error,
    courses.state.error,
    attendance.state.error,
    academic.state.error,
    grades.state.error,
    materials.state.error
  ])

  // Create legacy methods for backward compatibility
  const legacyMethods = {
    loadCurrentUser: auth.loadCurrentUser,
    getCoursesByLecturer: courses.getCoursesByLecturer,
    getStudentsByCourse: courses.getStudentsByCourse,
    getAssignmentsByCourse: grades.getAssignmentsByCourse,
    getSubmissionsByAssignment: grades.getSubmissionsByAssignment,
    getAttendanceSessionsByCourse: attendance.getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession: attendance.getAttendanceRecordsBySession,
    getStudentGradesByCourse: grades.getStudentGradesByCourse,
    getCourseGradeSummary: grades.getCourseGradeSummary,
    createAssignment: grades.createAssignment,
    updateAssignment: grades.updateAssignment,
    createSubmission: grades.createSubmission,
    gradeSubmission: grades.gradeSubmission,
    createAttendanceSession: attendance.createAttendanceSessionSupabase,
    markAttendance: () => {}, // Not implemented in domains yet
    updateGradeCategory: grades.updateGradeCategory,
    calculateFinalGrade: grades.calculateFinalGrade,
    refreshData: global.refreshData,
    
    // Supabase data fetching
    fetchUsers: auth.fetchUsers,
    fetchCourses: courses.fetchCourses,
    createCourse: courses.createCourse,
    updateCourse: courses.updateCourse,
    deleteCourse: courses.deleteCourse,
    createCourseAssignment: courses.createCourseAssignment,
    updateCourseAssignment: courses.updateCourseAssignment,
    deleteCourseAssignment: courses.deleteCourseAssignment,
    fetchCourseAssignments: courses.fetchCourseAssignments,
    fetchEnrollments: courses.fetchEnrollments,
    fetchAttendanceSessions: attendance.fetchAttendanceSessions,
    fetchAttendanceRecords: attendance.fetchAttendanceRecords,
    fetchLecturerAssignments: courses.fetchLecturerAssignments,
    
    // Academic structure data fetching
    fetchAcademicYears: academic.fetchAcademicYears,
    fetchSemesters: academic.fetchSemesters,
    fetchDepartments: academic.fetchDepartments,
    fetchPrograms: academic.fetchPrograms,
    fetchClassrooms: academic.fetchClassrooms,
    fetchSections: academic.fetchSections,
    fetchStudentProfiles: academic.fetchStudentProfiles,
    fetchLecturerProfiles: academic.fetchLecturerProfiles,
    fetchAdminProfiles: academic.fetchAdminProfiles,
    
    // Academic structure CRUD operations
    createAcademicYear: academic.createAcademicYear,
    updateAcademicYear: academic.updateAcademicYear,
    deleteAcademicYear: academic.deleteAcademicYear,
    createSemester: academic.createSemester,
    updateSemester: academic.updateSemester,
    deleteSemester: academic.deleteSemester,
    createDepartment: academic.createDepartment,
    updateDepartment: academic.updateDepartment,
    deleteDepartment: academic.deleteDepartment,
    createProgram: academic.createProgram,
    updateProgram: academic.updateProgram,
    deleteProgram: academic.deleteProgram,
    createClassroom: academic.createClassroom,
    updateClassroom: academic.updateClassroom,
    deleteClassroom: academic.deleteClassroom,
    createSection: academic.createSection,
    updateSection: academic.updateSection,
    deleteSection: academic.deleteSection,
    createUser: auth.createUser,
    updateUser: auth.updateUser,
    deleteUser: auth.deleteUser,
    
    // Supabase CRUD operations
    createAttendanceSessionSupabase: attendance.createAttendanceSessionSupabase,
    updateAttendanceSessionSupabase: attendance.updateAttendanceSessionSupabase,
    deleteAttendanceSessionSupabase: attendance.deleteAttendanceSessionSupabase,
    markAttendanceSupabase: attendance.markAttendanceSupabase,
    
    // Time-based status utilities
    getSessionTimeStatus: attendance.getSessionTimeStatus,
    updateSessionStatusBasedOnTime: attendance.updateSessionStatusBasedOnTime,
    
    // Real-time subscriptions
    subscribeToAttendanceSessions: attendance.subscribeToAttendanceSessions,
    subscribeToAttendanceRecords: attendance.subscribeToAttendanceRecords,
    unsubscribeAll: attendance.unsubscribeAll
  }

  const contextValue: DataContextType = {
    // Domain hooks
    auth,
    courses,
    attendance,
    academic,
    grades,
    materials,
    global,
    
    // Legacy compatibility
    state: legacyState,
    ...legacyMethods
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
