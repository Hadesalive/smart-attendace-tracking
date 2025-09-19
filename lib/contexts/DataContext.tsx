"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { 
  useAuth, 
  useCourses, 
  useAttendance, 
  useAcademicStructure, 
  useGrades, 
  useMaterials
} from '@/lib/domains'

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
      currentUser: any
      loading: boolean
      error: string | null
      lastUpdated: number
    }
    setState: (state: any) => void
    refreshData: () => void
  }
  
  // Legacy compatibility methods (for gradual migration)
  state: {
    currentUser: any
    users: any[]
    courses: any[]
    courseAssignments: any[]
    classes: any[]
    students: any[]
    enrollments: any[]
    lecturerAssignments: any[]
    assignments: any[]
    submissions: any[]
    materials: any[]
    attendanceSessions: any[]
    attendanceRecords: any[]
    gradeCategories: any[]
    studentGrades: any[]
    courseGradeSummaries: any[]
    academicYears: any[]
    semesters: any[]
    departments: any[]
    programs: any[]
    classrooms: any[]
    sections: any[]
    studentProfiles: any[]
    lecturerProfiles: any[]
    adminProfiles: any[]
    courseStats: any
    studentStats: any
    loading: boolean
    error: string | null
    lastUpdated: number
  }
  
  // Legacy methods (for gradual migration)
  loadCurrentUser: () => Promise<void>
  getCoursesByLecturer: (lecturerId: string) => any[]
  getStudentsByCourse: (courseId: string) => any[]
  getAssignmentsByCourse: (courseId: string) => any[]
  getSubmissionsByAssignment: (assignmentId: string) => any[]
  getAttendanceSessionsByCourse: (courseId: string) => any[]
  getAttendanceRecordsBySession: (sessionId: string) => any[]
  getStudentGradesByCourse: (studentId: string, courseId: string) => any[]
  getCourseGradeSummary: (studentId: string, courseId: string) => any
  createAssignment: (assignment: any) => void
  updateAssignment: (assignment: any) => void
  createSubmission: (submission: any) => void
  gradeSubmission: (submissionId: string, grade: number, comments?: string) => void
  createAttendanceSession: (session: any) => void
  markAttendance: (sessionId: string, studentId: string, status: 'present' | 'late' | 'absent', method: 'qr_code' | 'facial_recognition') => void
  updateGradeCategory: (courseId: string, categories: any[]) => void
  calculateFinalGrade: (studentId: string, courseId: string) => number
  refreshData: () => void
  
  // Supabase data fetching
  fetchUsers: () => Promise<void>
  fetchCourses: () => Promise<void>
  createCourse: (data: any) => Promise<void>
  updateCourse: (id: string, data: any) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  createCourseAssignment: (data: any) => Promise<void>
  updateCourseAssignment: (id: string, data: any) => Promise<void>
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
  createAcademicYear: (data: any) => Promise<void>
  updateAcademicYear: (id: string, data: any) => Promise<void>
  deleteAcademicYear: (id: string) => Promise<void>
  createSemester: (data: any) => Promise<void>
  updateSemester: (id: string, data: any) => Promise<void>
  deleteSemester: (id: string) => Promise<void>
  createDepartment: (data: any) => Promise<void>
  updateDepartment: (id: string, data: any) => Promise<void>
  deleteDepartment: (id: string) => Promise<void>
  createProgram: (data: any) => Promise<void>
  updateProgram: (id: string, data: any) => Promise<void>
  deleteProgram: (id: string) => Promise<void>
  createClassroom: (data: any) => Promise<void>
  updateClassroom: (id: string, data: any) => Promise<void>
  deleteClassroom: (id: string) => Promise<void>
  createSection: (data: any) => Promise<void>
  updateSection: (id: string, data: any) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  createUser: (data: any) => Promise<void>
  updateUser: (id: string, data: any) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  
  // Supabase CRUD operations
  createAttendanceSessionSupabase: (session: any) => Promise<any>
  updateAttendanceSessionSupabase: (sessionId: string, updates: any) => Promise<void>
  deleteAttendanceSessionSupabase: (sessionId: string) => Promise<void>
  markAttendanceSupabase: (sessionId: string, studentId: string, method: 'qr_code' | 'facial_recognition') => Promise<void>
  
  // Time-based status utilities
  getSessionTimeStatus: (session: any) => 'upcoming' | 'active' | 'completed'
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
  const global = {
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
  }

  // Load current user on mount
  useEffect(() => {
    auth.loadCurrentUser()
  }, [auth.loadCurrentUser])

  // Create legacy state object for backward compatibility
  const legacyState = {
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
  }

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
