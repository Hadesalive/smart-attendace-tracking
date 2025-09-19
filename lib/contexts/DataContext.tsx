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
  fetchEnrollments: () => Promise<void>
  fetchAttendanceSessions: () => Promise<void>
  fetchAttendanceRecords: () => Promise<void>
  fetchLecturerAssignments: () => Promise<void>
  
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
  courseStats: {},
  studentStats: {},
  loading: false,
  error: null,
  lastUpdated: 0
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
          attendance_method: session.attendance_method
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
        type: session.type,
        capacity: session.capacity,
        enrolled: session.enrolled,
        description: session.description
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
          attendance_method: updates.attendance_method
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
      // Call the edge function to mark attendance
      const { data, error } = await supabase.functions.invoke('mark-attendance', {
        body: {
          session_id: sessionId,
          student_id: studentId
        }
      })

      if (error) throw error

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
    fetchEnrollments,
    fetchAttendanceSessions,
    fetchAttendanceRecords,
    fetchLecturerAssignments,
    
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
