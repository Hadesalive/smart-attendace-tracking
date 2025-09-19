"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Course, 
  Class, 
  Student, 
  Assignment, 
  Submission, 
  AttendanceSession, 
  AttendanceRecord,
  GradeCategory,
  StudentGrade,
  CourseGradeSummary,
  Material,
  Enrollment,
  LecturerAssignment,
  CourseStats,
  StudentStats
} from '@/lib/types/shared'

// ============================================================================
// DATA CONTEXT TYPES
// ============================================================================

interface DataState {
  // Auth
  currentUser: User | null
  // Core entities
  users: User[]
  courses: Course[]
  courseAssignments: any[]
  classes: Class[]
  students: Student[]
  enrollments: Enrollment[]
  lecturerAssignments: LecturerAssignment[]
  
  // Academic content
  assignments: Assignment[]
  submissions: Submission[]
  materials: Material[]
  
  // Attendance
  attendanceSessions: AttendanceSession[]
  attendanceRecords: AttendanceRecord[]
  
  // Grades
  gradeCategories: GradeCategory[]
  studentGrades: StudentGrade[]
  courseGradeSummaries: CourseGradeSummary[]
  
  // Academic structure
  academicYears: any[]
  semesters: any[]
  departments: any[]
  programs: any[]
  classrooms: any[]
  sections: any[]
  studentProfiles: any[]
  lecturerProfiles: any[]
  adminProfiles: any[]
  
  // Statistics
  courseStats: { [courseId: string]: CourseStats }
  studentStats: { [studentId: string]: StudentStats }
  
  // UI state
  loading: boolean
  error: string | null
  lastUpdated: number
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_COURSE_ASSIGNMENTS'; payload: any[] }
  | { type: 'SET_CLASSES'; payload: Class[] }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_ENROLLMENTS'; payload: Enrollment[] }
  | { type: 'SET_LECTURER_ASSIGNMENTS'; payload: LecturerAssignment[] }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'SET_SUBMISSIONS'; payload: Submission[] }
  | { type: 'UPDATE_SUBMISSION'; payload: Submission }
  | { type: 'SET_ATTENDANCE_SESSIONS'; payload: AttendanceSession[] }
  | { type: 'ADD_ATTENDANCE_SESSION'; payload: AttendanceSession }
  | { type: 'UPDATE_ATTENDANCE_SESSION'; payload: AttendanceSession }
  | { type: 'SET_ATTENDANCE_RECORDS'; payload: AttendanceRecord[] }
  | { type: 'UPDATE_ATTENDANCE_RECORD'; payload: AttendanceRecord }
  | { type: 'SET_GRADE_CATEGORIES'; payload: GradeCategory[] }
  | { type: 'UPDATE_GRADE_CATEGORIES'; payload: GradeCategory[] }
  | { type: 'SET_STUDENT_GRADES'; payload: StudentGrade[] }
  | { type: 'ADD_STUDENT_GRADE'; payload: StudentGrade }
  | { type: 'UPDATE_STUDENT_GRADE'; payload: StudentGrade }
  | { type: 'SET_COURSE_GRADE_SUMMARIES'; payload: CourseGradeSummary[] }
  | { type: 'UPDATE_COURSE_GRADE_SUMMARY'; payload: CourseGradeSummary }
  | { type: 'SET_MATERIALS'; payload: Material[] }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'SET_ACADEMIC_YEARS'; payload: any[] }
  | { type: 'SET_SEMESTERS'; payload: any[] }
  | { type: 'SET_DEPARTMENTS'; payload: any[] }
  | { type: 'SET_PROGRAMS'; payload: any[] }
  | { type: 'SET_CLASSROOMS'; payload: any[] }
  | { type: 'SET_SECTIONS'; payload: any[] }
  | { type: 'SET_STUDENT_PROFILES'; payload: any[] }
  | { type: 'SET_LECTURER_PROFILES'; payload: any[] }
  | { type: 'SET_ADMIN_PROFILES'; payload: any[] }
  | { type: 'REFRESH_DATA' }

interface DataContextType {
  state: DataState
  dispatch: React.Dispatch<DataAction>
  // Auth actions
  loadCurrentUser: () => Promise<void>
  
  // Data getters
  getCoursesByLecturer: (lecturerId: string) => Course[]
  getStudentsByCourse: (courseId: string) => Student[]
  getAssignmentsByCourse: (courseId: string) => Assignment[]
  getSubmissionsByAssignment: (assignmentId: string) => Submission[]
  getAttendanceSessionsByCourse: (courseId: string) => AttendanceSession[]
  getAttendanceRecordsBySession: (sessionId: string) => AttendanceRecord[]
  getStudentGradesByCourse: (studentId: string, courseId: string) => StudentGrade[]
  getCourseGradeSummary: (studentId: string, courseId: string) => CourseGradeSummary | null
  
  // Data actions
  createAssignment: (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => void
  updateAssignment: (assignment: Assignment) => void
  createSubmission: (submission: Omit<Submission, 'id'>) => void
  gradeSubmission: (submissionId: string, grade: number, comments?: string) => void
  createAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'created_at'>) => void
  markAttendance: (sessionId: string, studentId: string, status: 'present' | 'late' | 'absent', method: 'qr_code' | 'facial_recognition') => void
  updateGradeCategory: (courseId: string, categories: GradeCategory[]) => void
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

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DataState = {
  currentUser: null,
  users: [],
  courses: [],
  classes: [],
  students: [],
  enrollments: [],
  lecturerAssignments: [],
  assignments: [],
  submissions: [],
  materials: [],
  attendanceSessions: [],
  attendanceRecords: [],
  gradeCategories: [],
  studentGrades: [],
  courseGradeSummaries: [],
  academicYears: [],
  semesters: [],
  departments: [],
  programs: [],
  classrooms: [],
  sections: [],
  studentProfiles: [],
  lecturerProfiles: [],
  adminProfiles: [],
  courseStats: {},
  studentStats: {},
  loading: false,
  error: null,
  lastUpdated: 0,
  courseAssignments: []
}

// ============================================================================
// REDUCER
// ============================================================================

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload }
    
    case 'SET_USERS':
      return { ...state, users: action.payload, lastUpdated: Date.now() }
    
    case 'SET_COURSES':
      return { ...state, courses: action.payload, lastUpdated: Date.now() }
    
    case 'SET_COURSE_ASSIGNMENTS':
      return { ...state, courseAssignments: action.payload, lastUpdated: Date.now() }
    
    case 'SET_CLASSES':
      return { ...state, classes: action.payload, lastUpdated: Date.now() }
    
    case 'SET_STUDENTS':
      return { ...state, students: action.payload, lastUpdated: Date.now() }
    
    case 'SET_ENROLLMENTS':
      return { ...state, enrollments: action.payload, lastUpdated: Date.now() }
    
    case 'SET_LECTURER_ASSIGNMENTS':
      return { ...state, lecturerAssignments: action.payload, lastUpdated: Date.now() }
    
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload, lastUpdated: Date.now() }
    
    case 'ADD_ASSIGNMENT':
      return { 
        ...state, 
        assignments: [...state.assignments, action.payload],
        lastUpdated: Date.now()
      }
    
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(a => 
          a.id === action.payload.id ? action.payload : a
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.payload, lastUpdated: Date.now() }
    
    case 'UPDATE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map(s => 
          s.id === action.payload.id ? action.payload : s
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_ATTENDANCE_SESSIONS':
      return { ...state, attendanceSessions: action.payload, lastUpdated: Date.now() }
    
    case 'ADD_ATTENDANCE_SESSION':
      return {
        ...state,
        attendanceSessions: [...state.attendanceSessions, action.payload],
        lastUpdated: Date.now()
      }
    
    case 'UPDATE_ATTENDANCE_SESSION':
      return {
        ...state,
        attendanceSessions: state.attendanceSessions.map(s => 
          s.id === action.payload.id ? action.payload : s
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_ATTENDANCE_RECORDS':
      return { ...state, attendanceRecords: action.payload, lastUpdated: Date.now() }
    
    case 'UPDATE_ATTENDANCE_RECORD':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(r => 
          r.id === action.payload.id ? action.payload : r
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_GRADE_CATEGORIES':
      return { ...state, gradeCategories: action.payload, lastUpdated: Date.now() }
    
    case 'UPDATE_GRADE_CATEGORIES':
      return { ...state, gradeCategories: action.payload, lastUpdated: Date.now() }
    
    case 'SET_STUDENT_GRADES':
      return { ...state, studentGrades: action.payload, lastUpdated: Date.now() }
    
    case 'ADD_STUDENT_GRADE':
      return {
        ...state,
        studentGrades: [...state.studentGrades, action.payload],
        lastUpdated: Date.now()
      }
    
    case 'UPDATE_STUDENT_GRADE':
      return {
        ...state,
        studentGrades: state.studentGrades.map(g => 
          g.id === action.payload.id ? action.payload : g
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_COURSE_GRADE_SUMMARIES':
      return { ...state, courseGradeSummaries: action.payload, lastUpdated: Date.now() }
    
    case 'UPDATE_COURSE_GRADE_SUMMARY':
      return {
        ...state,
        courseGradeSummaries: state.courseGradeSummaries.map(s => 
          s.student_id === action.payload.student_id && s.course_id === action.payload.course_id 
            ? action.payload : s
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_MATERIALS':
      return { ...state, materials: action.payload, lastUpdated: Date.now() }
    
    case 'ADD_MATERIAL':
      return {
        ...state,
        materials: [...state.materials, action.payload],
        lastUpdated: Date.now()
      }
    
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map(m => 
          m.id === action.payload.id ? action.payload : m
        ),
        lastUpdated: Date.now()
      }
    
    case 'SET_ACADEMIC_YEARS':
      return { ...state, academicYears: action.payload, lastUpdated: Date.now() }
    
    case 'SET_SEMESTERS':
      return { ...state, semesters: action.payload, lastUpdated: Date.now() }
    
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload, lastUpdated: Date.now() }
    
    case 'SET_PROGRAMS':
      return { ...state, programs: action.payload, lastUpdated: Date.now() }
    
    case 'SET_CLASSROOMS':
      return { ...state, classrooms: action.payload, lastUpdated: Date.now() }
    
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload, lastUpdated: Date.now() }
    
    case 'SET_STUDENT_PROFILES':
      return { ...state, studentProfiles: action.payload, lastUpdated: Date.now() }
    
    case 'SET_LECTURER_PROFILES':
      return { ...state, lecturerProfiles: action.payload, lastUpdated: Date.now() }
    
    case 'SET_ADMIN_PROFILES':
      return { ...state, adminProfiles: action.payload, lastUpdated: Date.now() }
    
    case 'REFRESH_DATA':
      return { ...state, lastUpdated: Date.now() }
    
    default:
      return state
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const DataContext = createContext<DataContextType | undefined>(undefined)

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  // ============================================================================
  // DATA GETTERS
  // ============================================================================

  const getCoursesByLecturer = useCallback((lecturerId: string): Course[] => {
    return state.courses.filter(course => course.lecturer_id === lecturerId)
  }, [state.courses])

  const getStudentsByCourse = useCallback((courseId: string): Student[] => {
    const enrollmentIds = state.enrollments
      .filter(e => e.course_id === courseId && e.status === 'active')
      .map(e => e.student_id)
    
    return state.students.filter(student => enrollmentIds.includes(student.id))
  }, [state.students, state.enrollments])

  const getAssignmentsByCourse = useCallback((courseId: string): Assignment[] => {
    return state.assignments.filter(assignment => assignment.course_id === courseId)
  }, [state.assignments])

  const getSubmissionsByAssignment = useCallback((assignmentId: string): Submission[] => {
    return state.submissions.filter(submission => submission.assignment_id === assignmentId)
  }, [state.submissions])

  const getAttendanceSessionsByCourse = useCallback((courseId: string): AttendanceSession[] => {
    return state.attendanceSessions.filter(session => session.course_id === courseId)
  }, [state.attendanceSessions])

  const getAttendanceRecordsBySession = useCallback((sessionId: string): AttendanceRecord[] => {
    return state.attendanceRecords.filter(record => record.session_id === sessionId)
  }, [state.attendanceRecords])

  const getStudentGradesByCourse = useCallback((studentId: string, courseId: string): StudentGrade[] => {
    return state.studentGrades.filter(grade => 
      grade.student_id === studentId && grade.course_id === courseId
    )
  }, [state.studentGrades])

  const getCourseGradeSummary = useCallback((studentId: string, courseId: string): CourseGradeSummary | null => {
    return state.courseGradeSummaries.find(summary => 
      summary.student_id === studentId && summary.course_id === courseId
    ) || null
  }, [state.courseGradeSummaries])

  // ============================================================================
  // DATA ACTIONS
  // ============================================================================

  const createAssignment = useCallback((assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `assignment_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ASSIGNMENT', payload: newAssignment })
  }, [])

  const updateAssignment = useCallback((assignment: Assignment) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: assignment })
  }, [])

  const createSubmission = useCallback((submission: Omit<Submission, 'id'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: `submission_${Date.now()}`
    }
    dispatch({ type: 'UPDATE_SUBMISSION', payload: newSubmission })
  }, [])

  const gradeSubmission = useCallback((submissionId: string, grade: number, comments?: string) => {
    const submission = state.submissions.find(s => s.id === submissionId)
    if (!submission) return

    const updatedSubmission: Submission = {
      ...submission,
      grade,
      final_grade: grade,
      status: 'graded',
      comments: comments || submission.comments
    }

    dispatch({ type: 'UPDATE_SUBMISSION', payload: updatedSubmission })

    // Create grade record for gradebook
    const assignment = state.assignments.find(a => a.id === submission.assignment_id)
    if (assignment) {
      const studentGrade: StudentGrade = {
        id: `grade_${Date.now()}`,
        student_id: submission.student_id,
        course_id: assignment.course_id,
        category_id: assignment.category_id,
        assignment_id: assignment.id,
        points: grade,
        max_points: assignment.total_points,
        percentage: (grade / assignment.total_points) * 100,
        letter_grade: getLetterGrade((grade / assignment.total_points) * 100),
        is_late: submission.status === 'late',
        late_penalty: submission.late_penalty_applied,
        final_points: grade - submission.late_penalty_applied,
        comments: comments || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      dispatch({ type: 'ADD_STUDENT_GRADE', payload: studentGrade })
    }
  }, [state.submissions, state.assignments])

  const createAttendanceSession = useCallback((session: Omit<AttendanceSession, 'id' | 'created_at'>) => {
    const newSession: AttendanceSession = {
      ...session,
      id: `session_${Date.now()}`,
      created_at: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ATTENDANCE_SESSION', payload: newSession })
  }, [])

  const markAttendance = useCallback((sessionId: string, studentId: string, status: 'present' | 'late' | 'absent', method: 'qr_code' | 'facial_recognition') => {
    const existingRecord = state.attendanceRecords.find(r => 
      r.session_id === sessionId && r.student_id === studentId
    )

    const student = state.students.find(s => s.id === studentId)
    if (!student) return

    const attendanceRecord: AttendanceRecord = {
      id: existingRecord?.id || `attendance_${Date.now()}`,
      session_id: sessionId,
      student_id: studentId,
      student_name: student.full_name,
      student_email: student.email,
      marked_at: new Date().toISOString(),
      method_used: method,
      status,
      check_in_time: status !== 'absent' ? new Date().toISOString() : undefined
    }

    if (existingRecord) {
      dispatch({ type: 'UPDATE_ATTENDANCE_RECORD', payload: attendanceRecord })
    } else {
      dispatch({ type: 'UPDATE_ATTENDANCE_RECORD', payload: attendanceRecord })
    }

    // Update attendance grade in gradebook
    const session = state.attendanceSessions.find(s => s.id === sessionId)
    if (session) {
      const attendanceCategory = state.gradeCategories.find(c => c.name === 'Attendance')
      if (attendanceCategory) {
        const attendanceGrade: StudentGrade = {
          id: `attendance_grade_${Date.now()}`,
          student_id: studentId,
          course_id: session.course_id,
          category_id: attendanceCategory.id,
          session_id: sessionId,
          points: status === 'present' ? 1 : status === 'late' ? 0.5 : 0,
          max_points: 1,
          percentage: status === 'present' ? 100 : status === 'late' ? 50 : 0,
          letter_grade: status === 'present' ? 'A' : status === 'late' ? 'C' : 'F',
          is_late: false,
          late_penalty: 0,
          final_points: status === 'present' ? 1 : status === 'late' ? 0.5 : 0,
          comments: `Attendance marked via ${method}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        dispatch({ type: 'ADD_STUDENT_GRADE', payload: attendanceGrade })
      }
    }
  }, [state.attendanceRecords, state.students, state.attendanceSessions, state.gradeCategories])

  const updateGradeCategory = useCallback((courseId: string, categories: GradeCategory[]) => {
    dispatch({ type: 'UPDATE_GRADE_CATEGORIES', payload: categories })
  }, [])

  const calculateFinalGrade = useCallback((studentId: string, courseId: string): number => {
    const grades = getStudentGradesByCourse(studentId, courseId)
    const categories = state.gradeCategories

    let totalWeightedGrade = 0
    let totalWeight = 0

    categories.forEach(category => {
      const categoryGrades = grades.filter(g => g.category_id === category.id)
      if (categoryGrades.length > 0) {
        const averageGrade = categoryGrades.reduce((sum, g) => sum + g.percentage, 0) / categoryGrades.length
        totalWeightedGrade += (averageGrade * category.percentage) / 100
        totalWeight += category.percentage
      }
    })

    return totalWeight > 0 ? totalWeightedGrade : 0
  }, [getStudentGradesByCourse, state.gradeCategories])

  const refreshData = useCallback(() => {
    dispatch({ type: 'REFRESH_DATA' })
  }, [])

  // ============================================================================
  // SUPABASE DATA FETCHING
  // ============================================================================

  // Auth: load current user profile
  const loadCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        dispatch({ type: 'SET_CURRENT_USER', payload: null })
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      if (error) throw error
      dispatch({ type: 'SET_CURRENT_USER', payload: profile as unknown as User })
    } catch (e) {
      console.error('Error loading current user:', e)
      dispatch({ type: 'SET_CURRENT_USER', payload: null })
    }
  }, [])

  // Load current user on app start
  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const fetchUsers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      dispatch({ type: 'SET_USERS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching users:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch users' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Subscribe to auth state changes
  useEffect(() => {
    // Initial load
    loadCurrentUser()
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Reload profile on any auth state change
      loadCurrentUser()
    })
    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [loadCurrentUser])

  const fetchCourses = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          users!courses_lecturer_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our interface
      const transformedCourses = (data || []).map(course => ({
        ...course,
        lecturer_name: course.users?.full_name,
        lecturer_email: course.users?.email
      }))
      
      dispatch({ type: 'SET_COURSES', payload: transformedCourses })
    } catch (error) {
      console.error('Error fetching courses:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch courses' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const createCourse = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('course_name', data.course_name || '')
      formData.append('course_code', data.course_code || '')
      formData.append('credits', data.credits?.toString() || '3')
      if (data.department && data.department !== '') {
        formData.append('department', data.department)
      }
      if (data.lecturer_id && data.lecturer_id !== '') {
        formData.append('lecturer_id', data.lecturer_id)
      }

      console.log('Creating course with data:', data)

      // Import and call server action
      const { createCourse: serverCreateCourse } = await import('@/lib/actions/admin')
      const result = await serverCreateCourse({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchCourses() // Refresh data
    } catch (error) {
      console.error('Error creating course:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create course' })
      throw error
    }
  }, [fetchCourses])

  const updateCourse = useCallback(async (id: string, data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('courseId', id)
      formData.append('course_name', data.course_name || '')
      formData.append('course_code', data.course_code || '')
      formData.append('credits', data.credits?.toString() || '3')
      if (data.department && data.department !== '') {
        formData.append('department', data.department)
      }
      if (data.lecturer_id && data.lecturer_id !== '') {
        formData.append('lecturer_id', data.lecturer_id)
      }

      console.log('Updating course with data:', data)

      // Import and call server action
      const { updateCourse: serverUpdateCourse } = await import('@/lib/actions/admin')
      const result = await serverUpdateCourse({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchCourses() // Refresh data
    } catch (error) {
      console.error('Error updating course:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update course' })
      throw error
    }
  }, [fetchCourses])

  const deleteCourse = useCallback(async (id: string) => {
    try {
      // Import and call server action
      const { deleteCourse: serverDeleteCourse } = await import('@/lib/actions/admin')
      const result = await serverDeleteCourse(id)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchCourses() // Refresh data
    } catch (error) {
      console.error('Error deleting course:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete course' })
      throw error
    }
  }, [fetchCourses])

  const fetchCourseAssignments = useCallback(async () => {
    try {
      console.log('DataContext: Starting to fetch course assignments...')
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const { data, error } = await supabase
        .from('course_sections')
        .select(`
          *,
          courses!course_sections_course_id_fkey (
            course_code,
            course_name,
            credits,
            department
          ),
          sections!course_sections_section_id_fkey (
            section_code,
            year,
            max_capacity
          ),
          academic_years!course_sections_academic_year_id_fkey (
            year_name
          ),
          semesters!course_sections_semester_id_fkey (
            semester_name
          )
        `)
        .order('created_at', { ascending: false })

      console.log('DataContext: Course assignments fetch result:', { data, error })

      if (error) {
        console.error('DataContext: Supabase error:', error)
        throw error
      }
      
      console.log('DataContext: Setting course assignments data:', data)
      dispatch({ type: 'SET_COURSE_ASSIGNMENTS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching course assignments:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch course assignments' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Course Assignment CRUD operations
  const createCourseAssignment = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('course_id', data.course_id || '')
      formData.append('section_id', data.section_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('is_mandatory', data.is_mandatory ? 'true' : 'false')
      if (data.max_students) {
        formData.append('max_students', data.max_students.toString())
      }

      console.log('Creating course assignment with data:', data)

      // Import and call server action
      const { createCourseAssignment: serverCreateCourseAssignment } = await import('@/lib/actions/admin')
      const result = await serverCreateCourseAssignment({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh course assignments data
      await fetchCourseAssignments()
    } catch (error) {
      console.error('Error creating course assignment:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create course assignment' })
      throw error
    }
  }, [fetchCourseAssignments])

  const updateCourseAssignment = useCallback(async (id: string, data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('course_id', data.course_id || '')
      formData.append('section_id', data.section_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('is_mandatory', data.is_mandatory ? 'true' : 'false')
      if (data.max_students) {
        formData.append('max_students', data.max_students.toString())
      }

      console.log('Updating course assignment with data:', data)

      // Import and call server action
      const { updateCourseAssignment: serverUpdateCourseAssignment } = await import('@/lib/actions/admin')
      const result = await serverUpdateCourseAssignment(id, {}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh course assignments data
      await fetchCourseAssignments()
    } catch (error) {
      console.error('Error updating course assignment:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update course assignment' })
      throw error
    }
  }, [fetchCourseAssignments])

  const deleteCourseAssignment = useCallback(async (id: string) => {
    try {
      // Import and call server action
      const { deleteCourseAssignment: serverDeleteCourseAssignment } = await import('@/lib/actions/admin')
      const result = await serverDeleteCourseAssignment(id)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh course assignments data
      await fetchCourseAssignments()
    } catch (error) {
      console.error('Error deleting course assignment:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete course assignment' })
      throw error
    }
  }, [fetchCourseAssignments])

  const fetchEnrollments = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false })

      if (error) throw error
      dispatch({ type: 'SET_ENROLLMENTS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch enrollments' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

    const fetchAttendanceSessions = useCallback(async () => {
      try {
        console.log('DataContext: Starting to fetch attendance sessions...')
        dispatch({ type: 'SET_LOADING', payload: true })
        const { data, error } = await supabase
          .from('attendance_sessions')
          .select(`
            *,
            courses!attendance_sessions_course_id_fkey(course_code, course_name),
            users!attendance_sessions_lecturer_id_fkey(full_name)
          `)
          .order('session_date', { ascending: false })
          .order('start_time', { ascending: false })

        console.log('DataContext: Fetch result:', { data, error })
        if (error) throw error
        
        // Transform the data to match our interface
        const transformedSessions = (data || []).map(session => {
          // Calculate time-based status
          const now = new Date()
          const startTime = new Date(`${session.session_date}T${session.start_time}`)
          const endTime = new Date(`${session.session_date}T${session.end_time}`)
          
          let timeBasedStatus: 'scheduled' | 'active' | 'completed' = 'scheduled'
          if (now < startTime) {
            timeBasedStatus = 'scheduled'
          } else if (now >= startTime && now <= endTime) {
            timeBasedStatus = 'active'
          } else {
            timeBasedStatus = 'completed'
          }

          return {
            ...session,
            course_code: session.courses?.course_code || `COURSE_${session.course_id}`,
            course_name: session.courses?.course_name || `Course ${session.course_id}`,
            class_id: `class_${session.course_id}`, // Mock class_id
            class_name: session.courses?.course_name || `Class ${session.course_id}`,
            lecturer_name: session.users?.full_name || `Lecturer ${session.lecturer_id}`,
            type: 'lecture' as const,
            capacity: 50, // Mock capacity
            enrolled: 25, // Mock enrolled count
            description: `Attendance session for ${session.courses?.course_name || 'course'}`,
            // Use time-based status instead of just is_active
            status: timeBasedStatus,
            // Update is_active based on time-based status
            is_active: timeBasedStatus === 'active'
          }
        })
        
        console.log('DataContext: Transformed sessions:', transformedSessions)
        dispatch({ type: 'SET_ATTENDANCE_SESSIONS', payload: transformedSessions })
      } catch (error) {
        console.error('Error fetching attendance sessions:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch attendance sessions' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }, [])

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          users!attendance_records_student_id_fkey(full_name, email)
        `)
        .order('marked_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our interface
      const transformedRecords = (data || []).map(record => ({
        ...record,
        student_name: record.users?.full_name,
        student_email: record.users?.email,
        status: 'present' as const, // Default status
        check_in_time: record.marked_at
      }))
      
      dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: transformedRecords })
    } catch (error) {
      console.error('Error fetching attendance records:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch attendance records' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchLecturerAssignments = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      // For now, derive lecturer assignments from courses
      // In a real implementation, this would be a separate table
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id, lecturer_id, course_code, course_name, department')

      if (error) throw error
      
      const assignments = (courses || []).map(course => ({
        id: `assignment_${course.id}`,
        lecturer_id: course.lecturer_id,
        course_id: course.id,
        class_id: `class_${course.id}`,
        assigned_at: new Date().toISOString(),
        status: 'active' as const
      }))
      
      dispatch({ type: 'SET_LECTURER_ASSIGNMENTS', payload: assignments })
    } catch (error) {
      console.error('Error fetching lecturer assignments:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch lecturer assignments' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Gradebook: Fetch grade categories for a course
  const fetchGradeCategoriesForCourse = useCallback(async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('grade_categories')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_GRADE_CATEGORIES', payload: (data || []) as unknown as GradeCategory[] })
    } catch (e) {
      console.error('Error fetching grade categories:', e)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch grade categories' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Gradebook: Save grade categories (replace strategy)
  const saveGradeCategoriesForCourse = useCallback(async (courseId: string, categories: GradeCategory[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { error: delErr } = await supabase
        .from('grade_categories')
        .delete()
        .eq('course_id', courseId)
      if (delErr) throw delErr

      if (categories.length > 0) {
        const payload = categories.map(c => ({
          name: c.name,
          percentage: c.percentage,
          is_default: !!c.is_default,
          course_id: courseId
        }))
        const { error: insErr } = await supabase.from('grade_categories').insert(payload)
        if (insErr) throw insErr
      }

      await fetchGradeCategoriesForCourse(courseId)
    } catch (e) {
      console.error('Error saving grade categories:', e)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save grade categories' })
      throw e
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [fetchGradeCategoriesForCourse])

  // Gradebook: Fetch student grades for a course
  const fetchStudentGradesForCourse = useCallback(async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_STUDENT_GRADES', payload: (data || []) as unknown as StudentGrade[] })
    } catch (e) {
      console.error('Error fetching student grades:', e)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch student grades' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // ============================================================================
  // ACADEMIC STRUCTURE DATA FETCHING
  // ============================================================================

  const fetchAcademicYears = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      dispatch({ type: 'SET_ACADEMIC_YEARS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching academic years:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch academic years' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchSemesters = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('semesters')
        .select(`
          *,
          academic_years!semesters_academic_year_id_fkey(year_name)
        `)
        .order('start_date', { ascending: false })

      if (error) throw error
      dispatch({ type: 'SET_SEMESTERS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching semesters:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch semesters' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchDepartments = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          users!departments_head_id_fkey(full_name, email)
        `)
        .order('department_name', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_DEPARTMENTS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching departments:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch departments' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchPrograms = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          departments!programs_department_id_fkey(department_code, department_name)
        `)
        .order('program_name', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_PROGRAMS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching programs:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch programs' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchClassrooms = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('building', { ascending: true })
        .order('room_number', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_CLASSROOMS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching classrooms:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch classrooms' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchSections = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('sections')
        .select(`
          *,
          programs!sections_program_id_fkey(program_code, program_name),
          academic_years!sections_academic_year_id_fkey(year_name),
          semesters!sections_semester_id_fkey(semester_name),
          classrooms!sections_classroom_id_fkey(building, room_number)
        `)
        .order('section_code', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_SECTIONS', payload: data || [] })
    } catch (error) {
      console.error('Error fetching sections:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch sections' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchStudentProfiles = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          users!student_profiles_user_id_fkey(full_name, email),
          programs!student_profiles_program_id_fkey(program_code, program_name),
          sections!student_profiles_section_id_fkey(section_code),
          academic_years!student_profiles_academic_year_id_fkey(year_name)
        `)
        .order('student_id', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_STUDENT_PROFILES', payload: data || [] })
    } catch (error) {
      console.error('Error fetching student profiles:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch student profiles' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchLecturerProfiles = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('lecturer_profiles')
        .select(`
          *,
          users!lecturer_profiles_user_id_fkey(full_name, email),
          departments!lecturer_profiles_department_id_fkey(department_code, department_name)
        `)
        .order('employee_id', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_LECTURER_PROFILES', payload: data || [] })
    } catch (error) {
      console.error('Error fetching lecturer profiles:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch lecturer profiles' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchAdminProfiles = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('admin_profiles')
        .select(`
          *,
          users!admin_profiles_user_id_fkey(full_name, email),
          departments!admin_profiles_department_id_fkey(department_code, department_name)
        `)
        .order('employee_id', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_ADMIN_PROFILES', payload: data || [] })
    } catch (error) {
      console.error('Error fetching admin profiles:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch admin profiles' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // ============================================================================
  // ACADEMIC STRUCTURE CRUD OPERATIONS
  // ============================================================================

  const createAcademicYear = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('year_name', data.year_name)
      formData.append('start_date', data.start_date)
      formData.append('end_date', data.end_date)
      formData.append('is_current', data.is_current ? 'true' : 'false')
      if (data.description) formData.append('description', data.description)

      // Import and call server action
      const { createAcademicYear: serverCreateAcademicYear } = await import('@/lib/actions/admin')
      const result = await serverCreateAcademicYear({}, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchAcademicYears() // Refresh data
    } catch (error) {
      console.error('Error creating academic year:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create academic year' })
      throw error
    }
  }, [fetchAcademicYears])

  const updateAcademicYear = useCallback(async (id: string, data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('year_name', data.year_name)
      formData.append('start_date', data.start_date)
      formData.append('end_date', data.end_date)
      formData.append('is_current', data.is_current ? 'true' : 'false')
      if (data.description) formData.append('description', data.description)

      // Import and call server action
      const { updateAcademicYear: serverUpdateAcademicYear } = await import('@/lib/actions/admin')
      const result = await serverUpdateAcademicYear(id, {}, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchAcademicYears() // Refresh data
    } catch (error) {
      console.error('Error updating academic year:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update academic year' })
      throw error
    }
  }, [fetchAcademicYears])

  const deleteAcademicYear = useCallback(async (id: string) => {
    try {
      // Import and call server action
      const { deleteAcademicYear: serverDeleteAcademicYear } = await import('@/lib/actions/admin')
      const result = await serverDeleteAcademicYear(id)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchAcademicYears() // Refresh data
    } catch (error) {
      console.error('Error deleting academic year:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete academic year' })
      throw error
    }
  }, [fetchAcademicYears])

  const createSemester = useCallback(async (data: any) => {
    try {
      const { error } = await supabase
        .from('semesters')
        .insert([data])

      if (error) throw error
      await fetchSemesters() // Refresh data
    } catch (error) {
      console.error('Error creating semester:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create semester' })
      throw error
    }
  }, [fetchSemesters])

  const updateSemester = useCallback(async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('semesters')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchSemesters() // Refresh data
    } catch (error) {
      console.error('Error updating semester:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update semester' })
      throw error
    }
  }, [fetchSemesters])

  const deleteSemester = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchSemesters() // Refresh data
    } catch (error) {
      console.error('Error deleting semester:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete semester' })
      throw error
    }
  }, [fetchSemesters])

  const createDepartment = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('department_code', data.department_code || '')
      formData.append('department_name', data.department_name || '')
      if (data.head_id) {
        formData.append('head_id', data.head_id)
      }
      if (data.description) {
        formData.append('description', data.description)
      }
      formData.append('is_active', data.is_active ? 'true' : 'false')

      console.log('Creating department with data:', {
        department_code: data.department_code,
        department_name: data.department_name,
        head_id: data.head_id,
        description: data.description,
        is_active: data.is_active
      })

      // Import and call server action
      const { createDepartment: serverCreateDepartment } = await import('@/lib/actions/admin')
      const result = await serverCreateDepartment({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchDepartments() // Refresh data
    } catch (error) {
      console.error('Error creating department:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create department' })
      throw error
    }
  }, [fetchDepartments])

  const updateDepartment = useCallback(async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchDepartments() // Refresh data
    } catch (error) {
      console.error('Error updating department:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update department' })
      throw error
    }
  }, [fetchDepartments])

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchDepartments() // Refresh data
    } catch (error) {
      console.error('Error deleting department:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete department' })
      throw error
    }
  }, [fetchDepartments])

  const createProgram = useCallback(async (data: any) => {
    try {
      const { error } = await supabase
        .from('programs')
        .insert([data])

      if (error) throw error
      await fetchPrograms() // Refresh data
    } catch (error) {
      console.error('Error creating program:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create program' })
      throw error
    }
  }, [fetchPrograms])

  const updateProgram = useCallback(async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchPrograms() // Refresh data
    } catch (error) {
      console.error('Error updating program:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update program' })
      throw error
    }
  }, [fetchPrograms])

  const deleteProgram = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchPrograms() // Refresh data
    } catch (error) {
      console.error('Error deleting program:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete program' })
      throw error
    }
  }, [fetchPrograms])

  const createClassroom = useCallback(async (data: any) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .insert([data])

      if (error) throw error
      await fetchClassrooms() // Refresh data
    } catch (error) {
      console.error('Error creating classroom:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create classroom' })
      throw error
    }
  }, [fetchClassrooms])

  const updateClassroom = useCallback(async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchClassrooms() // Refresh data
    } catch (error) {
      console.error('Error updating classroom:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update classroom' })
      throw error
    }
  }, [fetchClassrooms])

  const deleteClassroom = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchClassrooms() // Refresh data
    } catch (error) {
      console.error('Error deleting classroom:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete classroom' })
      throw error
    }
  }, [fetchClassrooms])

  const createSection = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('section_code', data.section_code || '')
      formData.append('program_id', data.program_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('year', data.year?.toString() || '1')
      if (data.classroom_id && data.classroom_id !== '') {
        formData.append('classroom_id', data.classroom_id)
      }
      formData.append('max_capacity', (data.max_students || data.max_capacity || 30).toString())
      formData.append('current_enrollment', data.current_enrollment?.toString() || '0')
      if (data.description) {
        formData.append('description', data.description)
      }
      formData.append('is_active', data.is_active ? 'true' : 'false')

      console.log('Creating section with data:', data)

      // Import and call server action
      const { createSection: serverCreateSection } = await import('@/lib/actions/admin')
      const result = await serverCreateSection({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchSections() // Refresh data
    } catch (error) {
      console.error('Error creating section:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create section' })
      throw error
    }
  }, [fetchSections])

  const updateSection = useCallback(async (id: string, data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('section_code', data.section_code || '')
      formData.append('program_id', data.program_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('year', data.year?.toString() || '1')
      if (data.classroom_id && data.classroom_id !== '') {
        formData.append('classroom_id', data.classroom_id)
      }
      formData.append('max_capacity', (data.max_students || data.max_capacity || 30).toString())
      formData.append('current_enrollment', data.current_enrollment?.toString() || '0')
      if (data.description) {
        formData.append('description', data.description)
      }
      formData.append('is_active', data.is_active ? 'true' : 'false')

      console.log('Updating section with data:', data)

      // Import and call server action
      const { updateSection: serverUpdateSection } = await import('@/lib/actions/admin')
      const result = await serverUpdateSection(id, {}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchSections() // Refresh data
    } catch (error) {
      console.error('Error updating section:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update section' })
      throw error
    }
  }, [fetchSections])

  const deleteSection = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchSections() // Refresh data
    } catch (error) {
      console.error('Error deleting section:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete section' })
      throw error
    }
  }, [fetchSections])

  const createUser = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('email', data.email || '')
      formData.append('password', data.password || '')
      formData.append('fullName', data.full_name || data.fullName || '')
      formData.append('role', data.role || 'lecturer')

      console.log('Creating user with data:', data)

      // Import and call server action
      const { createUser: serverCreateUser } = await import('@/lib/actions/admin')
      const result = await serverCreateUser({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh users data
      await fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create user' })
      throw error
    }
  }, [fetchUsers])

  const updateUser = useCallback(async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchUsers() // Refresh data
    } catch (error) {
      console.error('Error updating user:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user' })
      throw error
    }
  }, [fetchUsers])

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchUsers() // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete user' })
      throw error
    }
  }, [fetchUsers])

  // ============================================================================
  // SUPABASE CRUD OPERATIONS
  // ============================================================================

  const createAttendanceSessionSupabase = useCallback(async (session: Omit<AttendanceSession, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert([{
          course_id: session.course_id,
          lecturer_id: session.lecturer_id,
          session_name: session.session_name,
          session_date: session.session_date,
          start_time: session.start_time,
          end_time: session.end_time,
          qr_code: session.qr_code,
          is_active: session.is_active,
          attendance_method: session.attendance_method,
          // Newly persisted optional fields per schema
          location: session.location ?? null,
          capacity: session.capacity ?? null,
          enrolled: session.enrolled ?? 0,
          description: session.description ?? null,
          status: session.status ?? 'scheduled',
          type: session.type ?? 'lecture'
        }])
        .select()
        .single()

      if (error) throw error

      // Transform the response to match our interface
      const newSession: AttendanceSession = {
        ...data,
        course_code: session.course_code,
        course_name: session.course_name,
        class_id: session.class_id,
        class_name: session.class_name,
        lecturer_name: session.lecturer_name,
        type: data.type ?? session.type,
        capacity: data.capacity ?? session.capacity,
        enrolled: data.enrolled ?? session.enrolled,
        description: data.description ?? session.description,
        location: data.location ?? session.location,
        status: data.status ?? session.status
      }

      dispatch({ type: 'ADD_ATTENDANCE_SESSION', payload: newSession })
      return newSession
    } catch (error) {
      console.error('Error creating attendance session:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create attendance session' })
      throw error
    }
  }, [])

  const updateAttendanceSessionSupabase = useCallback(async (sessionId: string, updates: Partial<AttendanceSession>) => {
    try {
      console.log('DataContext: Starting to update session:', sessionId, 'with updates:', updates)
      
      const { error } = await supabase
        .from('attendance_sessions')
        .update({
          session_name: updates.session_name,
          session_date: updates.session_date,
          start_time: updates.start_time,
          end_time: updates.end_time,
          is_active: updates.is_active,
          attendance_method: updates.attendance_method,
          // Persist extended fields when provided
          location: updates.location,
          capacity: updates.capacity,
          enrolled: updates.enrolled,
          description: updates.description,
          status: updates.status,
          type: updates.type
        })
        .eq('id', sessionId)

      if (error) {
        console.error('DataContext: Error updating session:', error)
        throw error
      }
      console.log('DataContext: Session updated successfully in database')

      // Update local state
      console.log('DataContext: Updating local state for session:', sessionId)
      const updatedSession = state.attendanceSessions.find(s => s.id === sessionId)
      if (updatedSession) {
        const newSession = { ...updatedSession, ...updates }
        console.log('DataContext: New session data:', newSession)
        dispatch({ type: 'UPDATE_ATTENDANCE_SESSION', payload: newSession })
        console.log('DataContext: Local state updated successfully')
      } else {
        console.warn('DataContext: Session not found in local state:', sessionId)
      }
    } catch (error) {
      console.error('DataContext: Error updating attendance session:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update attendance session' })
      throw error
    }
  }, [state.attendanceSessions])

  const deleteAttendanceSessionSupabase = useCallback(async (sessionId: string) => {
    try {
      console.log('DataContext: Starting to delete session:', sessionId)
      
      // First delete all attendance records for this session
      console.log('DataContext: Deleting attendance records for session:', sessionId)
      const { error: recordsError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('session_id', sessionId)

      if (recordsError) {
        console.error('DataContext: Error deleting attendance records:', recordsError)
        throw recordsError
      }
      console.log('DataContext: Attendance records deleted successfully')

      // Then delete the session
      console.log('DataContext: Deleting session from database:', sessionId)
      const { error } = await supabase
        .from('attendance_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) {
        console.error('DataContext: Error deleting session:', error)
        throw error
      }
      console.log('DataContext: Session deleted successfully from database')

      // Update local state - remove the session
      console.log('DataContext: Updating local state, removing session:', sessionId)
      dispatch({
        type: 'SET_ATTENDANCE_SESSIONS',
        payload: state.attendanceSessions.filter(s => s.id !== sessionId)
      })
      console.log('DataContext: Local state updated successfully')
      
    } catch (error) {
      console.error('DataContext: Error deleting attendance session:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete attendance session' })
      throw error
    }
  }, [state.attendanceSessions])

  const markAttendanceSupabase = useCallback(async (sessionId: string, studentId: string, method: 'qr_code' | 'facial_recognition') => {
    try {
      console.log('Calling mark-attendance function with:', { sessionId, studentId, method })
      
      // Call the edge function to mark attendance
      const { data, error } = await supabase.functions.invoke('mark-attendance', {
        body: {
          session_id: sessionId,
          student_id: studentId
        }
      })

      console.log('Function response:', { data, error })

      if (error) {
        console.error('Supabase function error:', error)
        // Try to extract error message from context
        let errorMessage = error.message
        if (error.context) {
          try {
            const context = JSON.parse(error.context)
            if (context.error) {
              errorMessage = context.error
            }
          } catch (e) {
            // Ignore parsing error, use original message
          }
        }
        throw new Error(errorMessage)
      }

      // Refresh attendance records to get the latest data
      await fetchAttendanceRecords()
    } catch (error) {
      console.error('Error marking attendance:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark attendance' })
      throw error
    }
  }, [fetchAttendanceRecords])

  // ============================================================================
  // TIME-BASED STATUS UTILITIES
  // ============================================================================

  const getSessionTimeStatus = useCallback((session: AttendanceSession): 'upcoming' | 'active' | 'completed' => {
    const now = new Date()
    const sessionDate = new Date(session.session_date)
    const startTime = new Date(`${session.session_date}T${session.start_time}`)
    const endTime = new Date(`${session.session_date}T${session.end_time}`)

    if (now < startTime) {
      return 'upcoming'
    } else if (now >= startTime && now <= endTime) {
      return 'active'
    } else {
      return 'completed'
    }
  }, [])

  const updateSessionStatusBasedOnTime = useCallback(async (sessionId: string) => {
    try {
      const session = state.attendanceSessions.find(s => s.id === sessionId)
      if (!session) return

      const timeStatus = getSessionTimeStatus(session)
      const isActive = timeStatus === 'active'
      
      // Only update if the status has changed
      if (session.is_active !== isActive) {
        await updateAttendanceSessionSupabase(sessionId, { is_active: isActive })
      }
    } catch (error) {
      console.error('Error updating session status based on time:', error)
    }
  }, [state.attendanceSessions, getSessionTimeStatus, updateAttendanceSessionSupabase])

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  const subscribeToAttendanceSessions = useCallback((courseId?: string) => {
    let subscription = supabase
      .channel('attendance_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_sessions',
          ...(courseId && { filter: `course_id=eq.${courseId}` })
        },
        (payload) => {
          console.log('Attendance session change:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newSession = payload.new as any
            // Transform and add to state
            const transformedSession: AttendanceSession = {
              ...newSession,
              course_code: newSession.course_code || '',
              course_name: newSession.course_name || '',
              class_id: `class_${newSession.course_id}`,
              class_name: newSession.course_name || '',
              lecturer_name: newSession.lecturer_name || '',
              type: 'lecture' as const,
              capacity: 50,
              enrolled: 25,
              description: `Attendance session for ${newSession.course_name || ''}`
            }
            dispatch({ type: 'ADD_ATTENDANCE_SESSION', payload: transformedSession })
          } else if (payload.eventType === 'UPDATE') {
            const updatedSession = payload.new as any
            const transformedSession: AttendanceSession = {
              ...updatedSession,
              course_code: updatedSession.course_code || '',
              course_name: updatedSession.course_name || '',
              class_id: `class_${updatedSession.course_id}`,
              class_name: updatedSession.course_name || '',
              lecturer_name: updatedSession.lecturer_name || '',
              type: 'lecture' as const,
              capacity: 50,
              enrolled: 25,
              description: `Attendance session for ${updatedSession.course_name || ''}`
            }
            dispatch({ type: 'UPDATE_ATTENDANCE_SESSION', payload: transformedSession })
          }
        }
      )
      .subscribe()

    return subscription
  }, [])

  const subscribeToAttendanceRecords = useCallback((sessionId?: string) => {
    let subscription = supabase
      .channel('attendance_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          ...(sessionId && { filter: `session_id=eq.${sessionId}` })
        },
        (payload) => {
          console.log('Attendance record change:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as any
            const transformedRecord: AttendanceRecord = {
              ...newRecord,
              student_name: newRecord.student_name || '',
              student_email: newRecord.student_email || '',
              status: 'present' as const,
              check_in_time: newRecord.marked_at
            }
            dispatch({ type: 'UPDATE_ATTENDANCE_RECORD', payload: transformedRecord })
          }
        }
      )
      .subscribe()

    return subscription
  }, [])

  const unsubscribeAll = useCallback(() => {
    supabase.removeAllChannels()
  }, [])

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 63) return 'D'
    if (percentage >= 60) return 'D-'
    return 'F'
  }

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: DataContextType = {
    state,
    dispatch,
    loadCurrentUser,
    getCoursesByLecturer,
    getStudentsByCourse,
    getAssignmentsByCourse,
    getSubmissionsByAssignment,
    getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession,
    getStudentGradesByCourse,
    getCourseGradeSummary,
    createAssignment,
    updateAssignment,
    createSubmission,
    gradeSubmission,
    createAttendanceSession,
    markAttendance,
    updateGradeCategory,
    calculateFinalGrade,
    refreshData,
    
    // Supabase data fetching
    fetchUsers,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    createCourseAssignment,
    updateCourseAssignment,
    deleteCourseAssignment,
    fetchCourseAssignments,
    fetchEnrollments,
    fetchAttendanceSessions,
    fetchAttendanceRecords,
    fetchLecturerAssignments,
    // Gradebook fetching
    // @ts-ignore - extend context type in follow-up pass if needed
    fetchGradeCategoriesForCourse,
    // @ts-ignore
    saveGradeCategoriesForCourse,
    // @ts-ignore
    fetchStudentGradesForCourse,
    
    // Academic structure data fetching
    fetchAcademicYears,
    fetchSemesters,
    fetchDepartments,
    fetchPrograms,
    fetchClassrooms,
    fetchSections,
    fetchStudentProfiles,
    fetchLecturerProfiles,
    fetchAdminProfiles,
    
    // Academic structure CRUD operations
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    createSemester,
    updateSemester,
    deleteSemester,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createProgram,
    updateProgram,
    deleteProgram,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    createSection,
    updateSection,
    deleteSection,
    createUser,
    updateUser,
    deleteUser,
    
    // Supabase CRUD operations
    createAttendanceSessionSupabase,
    updateAttendanceSessionSupabase,
    deleteAttendanceSessionSupabase,
    markAttendanceSupabase,
    
    // Time-based status utilities
    getSessionTimeStatus,
    updateSessionStatusBasedOnTime,
    
    // Real-time subscriptions
    subscribeToAttendanceSessions,
    subscribeToAttendanceRecords,
    unsubscribeAll
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
