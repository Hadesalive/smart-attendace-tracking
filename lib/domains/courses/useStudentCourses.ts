/**
 * STUDENT COURSES DATA FETCHING HOOK
 * 
 * This hook provides clean data fetching logic for student courses with:
 * - Proper TypeScript types and null safety
 * - Edge case handling for missing data
 * - Efficient data composition and transformation
 * - Error handling with actionable messages
 * - Performance optimizations (memoization, batch queries)
 * 
 * Edge Cases Handled:
 * - No session/user authentication
 * - Missing student profile
 * - No course assignments for student's program/year
 * - Missing course data (courses.description may not exist)
 * - Missing semester/academic year data
 * - Missing lecturer assignments
 * - Partial joins and missing relationships
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

"use client"

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth, useAcademicStructure, useCourses, useAttendance, useGrades, useMaterials } from '@/lib/domains'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StudentCourse {
  id: string
  course_code: string
  course_name: string
  credits: number
  description?: string
  semesterLabel: string | null
  year: number | null
  instructor: string
  schedule: {
    days: string[] | null
    time: string | null
    location: string | null
  } | null
  attendanceRate: number
  averageGrade: number
  progress: number
  status: 'active' | 'completed' | 'upcoming'
  materialsCount: number
  totalAssignments: number
  submittedAssignments: number
  nextSession?: {
    title: string
    date: string
    time: string | null
  }
}

export interface StudentCoursesState {
  data: StudentCourse[]
  loading: boolean
  error: string | null
}

export interface UseStudentCoursesResult {
  data: StudentCourse[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

// Internal types for data fetching
interface StudentProfile {
  id: string
  user_id: string
  student_id: string
  program_id: string
  academic_year_id: string
  section_id?: string
  gpa?: number
  credits_completed?: number
}

interface CourseAssignment {
  id: string
  course_id: string
  program_id: string
  academic_year_id: string
  semester_id: string
  year: number
}

interface Course {
  id: string
  course_code: string
  course_name: string
  credits: number
  description?: string
}

interface Semester {
  id: string
  semester_name: string
  academic_year_id: string
}

interface AcademicYear {
  id: string
  year_name: string
}

interface LecturerAssignment {
  id: string
  course_id: string
  lecturer_id: string
  academic_year_id?: string
  semester_id?: string
  program_id?: string
  section_id?: string
  teaching_hours_per_week?: number
  start_date?: string
  end_date?: string
}

interface LecturerProfile {
  id: string
  user_id: string
  employee_id: string
  full_name?: string
  email?: string
  role?: string
}

// ============================================================================
// DATA FETCHING SERVICE
// ============================================================================

class StudentCoursesService {
  private supabase = supabase

  /**
   * Get current user ID from session
   */
  async getSessionUserId(): Promise<string | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      if (error) throw error
      return session?.user?.id || null
    } catch (error) {
      console.error('Error getting session user ID:', error)
      return null
    }
  }

  /**
   * Get student profile by user ID
   */
  async getStudentProfileByUserId(userId: string): Promise<StudentProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .select(`
          id,
          user_id,
          student_id,
          program_id,
          academic_year_id,
          section_id,
          gpa,
          credits_completed
        `)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching student profile:', error)
      return null
    }
  }

  /**
   * Get course assignments for student's program and academic year
   */
  async getProgramAssignmentsForProfile(
    programId: string, 
    academicYearId: string
  ): Promise<CourseAssignment[]> {
    try {
      const { data, error } = await this.supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          program_id,
          academic_year_id,
          semester_id,
          year
        `)
        .eq('program_id', programId)
        .eq('academic_year_id', academicYearId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching program assignments:', error)
      return []
    }
  }

  /**
   * Get courses by IDs (batch query)
   */
  async getCoursesByIds(courseIds: string[]): Promise<Course[]> {
    if (courseIds.length === 0) return []

    try {
      // Filter out any null/undefined values and ensure we have valid UUIDs
      const validCourseIds = courseIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
      
      if (validCourseIds.length === 0) return []

      // Try different approach - use or() instead of in() for better compatibility
      let query = this.supabase
        .from('courses')
        .select(`
          id,
          course_code,
          course_name,
          credits,
          department_id,
          description
        `)
      
      // If only one ID, use eq instead of in
      if (validCourseIds.length === 1) {
        query = query.eq('id', validCourseIds[0])
      } else {
        // Use or() for multiple IDs
        const orConditions = validCourseIds.map(id => `id.eq.${id}`).join(',')
        query = query.or(orConditions)
      }

      const { data, error } = await query


      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching courses:', error)
      return []
    }
  }

  /**
   * Get semesters by IDs (batch query)
   */
  async getSemestersByIds(semesterIds: string[]): Promise<Semester[]> {
    if (semesterIds.length === 0) return []

    try {
      // Filter out any null/undefined values and ensure we have valid UUIDs
      const validSemesterIds = semesterIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
      
      if (validSemesterIds.length === 0) return []

      // Try different approach - use or() instead of in() for better compatibility
      let query = this.supabase
        .from('semesters')
        .select(`
          id,
          semester_name,
          academic_year_id
        `)
      
      // If only one ID, use eq instead of in
      if (validSemesterIds.length === 1) {
        query = query.eq('id', validSemesterIds[0])
      } else {
        // Use or() for multiple IDs
        const orConditions = validSemesterIds.map(id => `id.eq.${id}`).join(',')
        query = query.or(orConditions)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching semesters:', error)
      return []
    }
  }

  /**
   * Get academic years by IDs (batch query)
   */
  async getAcademicYearsByIds(academicYearIds: string[]): Promise<AcademicYear[]> {
    if (academicYearIds.length === 0) return []

    try {
      // Filter out any null/undefined values and ensure we have valid UUIDs
      const validAcademicYearIds = academicYearIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
      
      if (validAcademicYearIds.length === 0) return []

      // Try different approach - use or() instead of in() for better compatibility
      let query = this.supabase
        .from('academic_years')
        .select(`
          id,
          year_name
        `)
      
      // If only one ID, use eq instead of in
      if (validAcademicYearIds.length === 1) {
        query = query.eq('id', validAcademicYearIds[0])
      } else {
        // Use or() for multiple IDs
        const orConditions = validAcademicYearIds.map(id => `id.eq.${id}`).join(',')
        query = query.or(orConditions)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching academic years:', error)
      return []
    }
  }

  /**
   * Get lecturer assignments by course IDs
   */
  async getLecturerAssignmentsByCourseIds(courseIds: string[]): Promise<LecturerAssignment[]> {
    if (courseIds.length === 0) return []

    try {
      // Filter out any null/undefined values and ensure we have valid UUIDs
      const validCourseIds = courseIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
      
      if (validCourseIds.length === 0) return []

      // Try different approach - use or() instead of in() for better compatibility
      let query = this.supabase
        .from('lecturer_assignments')
        .select(`
          id,
          course_id,
          lecturer_id,
          academic_year_id,
          semester_id,
          program_id,
          section_id,
          teaching_hours_per_week,
          start_date,
          end_date
        `)
      
      // If only one ID, use eq instead of in
      if (validCourseIds.length === 1) {
        query = query.eq('course_id', validCourseIds[0])
      } else {
        // Use or() for multiple IDs
        const orConditions = validCourseIds.map(id => `course_id.eq.${id}`).join(',')
        query = query.or(orConditions)
      }

      const { data, error } = await query


      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching lecturer assignments:', error)
      return []
    }
  }

  /**
   * Get lecturer profiles by IDs (with user information)
   */
  async getLecturerProfilesByIds(lecturerIds: string[]): Promise<LecturerProfile[]> {
    if (lecturerIds.length === 0) return []

    try {
      // Filter out any null/undefined values and ensure we have valid UUIDs
      const validLecturerIds = lecturerIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
      
      if (validLecturerIds.length === 0) return []

      console.log('Fetching lecturer profiles for IDs:', validLecturerIds)

      // Query lecturer_profiles with user information (full_name is in users table)
      let query = this.supabase
        .from('lecturer_profiles')
        .select(`
          id,
          user_id,
          employee_id,
          users!lecturer_profiles_user_id_fkey(
            id,
            full_name,
            email,
            role
          )
        `)
      
      // If only one ID, use eq instead of in
      if (validLecturerIds.length === 1) {
        query = query.eq('user_id', validLecturerIds[0])
      } else {
        // Use or() for multiple IDs
        const orConditions = validLecturerIds.map(id => `user_id.eq.${id}`).join(',')
        query = query.or(orConditions)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error fetching lecturer profiles:', error)
        throw error
      }

      console.log('Fetched lecturer profiles:', data)

      // Transform the data to match our interface
      const transformedData = (data || []).map((profile: any) => ({
        id: profile.id,
        user_id: profile.user_id,
        employee_id: profile.employee_id,
        full_name: profile.users?.full_name || 'Unknown',
        email: profile.users?.email,
        role: profile.users?.role
      }))

      return transformedData
    } catch (error) {
      console.error('Error fetching lecturer profiles:', error)
      return []
    }
  }

  /**
   * OPTIMIZED: Get complete student courses data with minimal queries
   * This replaces the previous multi-query approach with optimized queries
   */
  async getStudentCoursesComplete(userId: string): Promise<StudentCourse[]> {
    try {
      // Step 1: Get student profile
      const studentProfile = await this.getStudentProfileByUserId(userId)
      if (!studentProfile) return []

      // Step 2: Get course assignments for student's program and academic year
      const assignments = await this.getProgramAssignmentsForProfile(
        studentProfile.program_id,
        studentProfile.academic_year_id
      )

      if (assignments.length === 0) return []

      // Step 3: Batch fetch related data (optimized)
      const courseIds = [...new Set(assignments.map(a => a.course_id).filter(Boolean))]
      const semesterIds = [...new Set(assignments.map(a => a.semester_id).filter(Boolean))]
      const academicYearIds = [...new Set(assignments.map(a => a.academic_year_id).filter(Boolean))]

      const [courses, semesters, academicYears] = await Promise.all([
        this.getCoursesByIds(courseIds),
        this.getSemestersByIds(semesterIds),
        this.getAcademicYearsByIds(academicYearIds)
      ])

      // Step 4: Transform to StudentCourse format
      const studentCourses: StudentCourse[] = assignments.map(assignment => {
        const course = courses.find(c => c.id === assignment.course_id)
        if (!course) return null

        // Get semester and academic year info
        const semester = semesters.find(s => s.id === assignment.semester_id)
        const academicYear = academicYears.find(ay => ay.id === assignment.academic_year_id)
        const semesterLabel = semester && academicYear 
          ? `${academicYear.year_name} - ${semester.semester_name}` 
          : null

        return {
          id: course.id,
          course_code: course.course_code,
          course_name: course.course_name,
          credits: course.credits,
          description: course.description,
          semesterLabel,
          year: assignment.year,
          instructor: 'TBA', // Will be populated separately
          schedule: null, // Will be populated separately
          attendanceRate: 0, // Will be calculated separately
          averageGrade: 0, // Will be calculated separately
          progress: 0, // Will be calculated separately
          status: 'active' as const,
          materialsCount: 0, // Will be calculated separately
          totalAssignments: 0, // Will be calculated separately
          submittedAssignments: 0 // Will be calculated separately
        }
      }).filter(Boolean) as StudentCourse[]

      // Step 5: Get lecturer assignments and profiles for instructor info (section-filtered)
      if (studentCourses.length > 0) {
        const lecturerData = await this.getLecturerAssignmentsWithProfiles(courseIds, userId)
        
        // Update instructor information
        studentCourses.forEach(studentCourse => {
          const lecturerAssignment = lecturerData.find(la => la.course_id === studentCourse.id)
          if (lecturerAssignment) {
            studentCourse.instructor = lecturerAssignment.lecturer_profiles?.full_name || 'TBA'
          }
        })
      }

      return studentCourses
    } catch (error) {
      console.error('Error fetching complete student courses:', error)
      return []
    }
  }

  /**
   * Get lecturer assignments with profiles filtered by student's section enrollment
   * This ensures students only see lecturers assigned to their specific section
   */
  private async getLecturerAssignmentsWithProfiles(courseIds: string[], studentId: string): Promise<any[]> {
    try {
      if (courseIds.length === 0) return []

      // Step 1: Get student's section enrollment
      const studentSectionEnrollment = await this.getStudentSectionEnrollment(studentId)
      if (!studentSectionEnrollment) {
        console.log('No section enrollment found for student:', studentId)
        return []
      }

      console.log('Student section enrollment:', {
        studentId,
        sectionId: studentSectionEnrollment.section_id,
        sectionCode: studentSectionEnrollment.sections?.section_code
      })

      // Step 2: Get lecturer assignments filtered by student's section
      const lecturerAssignments = await this.getLecturerAssignmentsByCourseAndSection(
        courseIds, 
        studentSectionEnrollment.section_id
      )
      
      console.log('Filtered lecturer assignments for section:', {
        sectionId: studentSectionEnrollment.section_id,
        courseIds,
        assignmentsFound: lecturerAssignments.length,
        assignments: lecturerAssignments.map(la => ({ course_id: la.course_id, lecturer_id: la.lecturer_id }))
      })
      
      if (lecturerAssignments.length === 0) return []

      // Step 3: Get lecturer profiles
      const lecturerIds = [...new Set(lecturerAssignments.map(la => la.lecturer_id).filter(Boolean))]
      const lecturerProfiles = await this.getLecturerProfilesByIds(lecturerIds)

      // Step 4: Combine the data
      return lecturerAssignments.map(assignment => ({
        ...assignment,
        lecturer_profiles: lecturerProfiles.find(lp => lp.user_id === assignment.lecturer_id)
      }))
    } catch (error) {
      console.error('Error fetching lecturer assignments with profiles:', error)
      return []
    }
  }

  /**
   * Get student's section enrollment
   */
  private async getStudentSectionEnrollment(studentId: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('section_enrollments')
        .select(`
          id,
          student_id,
          section_id,
          status,
          sections!inner(
            id,
            section_code,
            program_id,
            academic_year_id,
            semester_id
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active')
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching student section enrollment:', error)
      return null
    }
  }

  /**
   * Get lecturer assignments filtered by course IDs and section ID
   */
  private async getLecturerAssignmentsByCourseAndSection(courseIds: string[], sectionId: string): Promise<LecturerAssignment[]> {
    try {
      if (courseIds.length === 0 || !sectionId) return []

      let query = this.supabase
        .from('lecturer_assignments')
        .select(`
          id,
          course_id,
          lecturer_id,
          academic_year_id,
          semester_id,
          program_id,
          section_id,
          teaching_hours_per_week,
          start_date,
          end_date
        `)
        .eq('section_id', sectionId)
      
      // Filter by course IDs
      if (courseIds.length === 1) {
        query = query.eq('course_id', courseIds[0])
      } else {
        const orConditions = courseIds.map(id => `course_id.eq.${id}`).join(',')
        query = query.or(orConditions)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching lecturer assignments by course and section:', error)
      return []
    }
  }
}

// ============================================================================
// DATA COMPOSITION HELPERS
// ============================================================================

  /**
   * Compose student courses from raw data with enhanced stats calculation
   */
function composeStudentCourses(
  assignments: CourseAssignment[],
  courses: Course[],
  semesters: Semester[],
  academicYears: AcademicYear[],
  lecturerAssignments: LecturerAssignment[],
  lecturerProfiles: LecturerProfile[],
  studentId: string,
  attendanceHook: any,
  gradesHook: any,
  materialsHook: any
): StudentCourse[] {
  return assignments.map(assignment => {
    const course = courses.find(c => c.id === assignment.course_id)
    if (!course) return null

    // Get semester and academic year info
    const semester = semesters.find(s => s.id === assignment.semester_id)
    const academicYear = academicYears.find(ay => ay.id === assignment.academic_year_id)
    const semesterLabel = semester && academicYear 
      ? `${academicYear.year_name} - ${semester.semester_name}` 
      : null

    // Get lecturer information
    const lecturerAssignment = lecturerAssignments.find(la => la.course_id === assignment.course_id)
    let instructor = 'TBA'
    if (lecturerAssignment) {
      const lecturer = lecturerProfiles.find(lp => lp.user_id === lecturerAssignment.lecturer_id)
      instructor = lecturer?.full_name || 'TBA'
    }

    // Get schedule information
    const schedule = lecturerAssignment ? {
      days: null, // teaching_days doesn't exist in the schema
      time: null, // teaching_time doesn't exist in the schema
      location: lecturerAssignment.section_id || null // Use section_id instead of classroom_id
    } : null

    // Calculate attendance rate using existing hooks
    let attendanceRate = 0
    try {
      const courseSessions = attendanceHook.getAttendanceSessionsByCourse?.(course.id) || []
      let totalSessions = 0
      let presentSessions = 0
      
      courseSessions.forEach((session: any) => {
        const records = attendanceHook.getAttendanceRecordsBySession?.(session.id) || []
        const studentRecord = records.find((r: any) => r.student_id === studentId)
        if (studentRecord) {
          totalSessions++
          if (studentRecord.status === 'present' || studentRecord.status === 'late') {
            presentSessions++
          }
        }
      })
      
      attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0
    } catch (error) {
      console.error('Error calculating attendance rate:', error)
    }

    // Calculate average grade using existing hooks
    let averageGrade = 0
    try {
      const studentGrades = gradesHook.getStudentGradesByCourse?.(studentId, course.id) || []
      if (studentGrades.length > 0) {
        averageGrade = Math.round(gradesHook.calculateFinalGrade?.(studentId, course.id) || 0)
      }
    } catch (error) {
      console.error('Error calculating average grade:', error)
    }

    // Get materials count
    let materialsCount = 0
    try {
      const courseMaterials = materialsHook.state?.materials?.filter((m: any) => m.course_id === course.id) || []
      materialsCount = courseMaterials.length
    } catch (error) {
      console.error('Error getting materials count:', error)
    }

    // Calculate assignments progress
    let totalAssignments = 0
    let submittedAssignments = 0
    let progress = 0
    try {
      const assignments = gradesHook.getAssignmentsByCourse?.(course.id) || []
      totalAssignments = assignments.length
      
      submittedAssignments = assignments.filter((assignment: any) => {
        const submissions = gradesHook.getSubmissionsByAssignment?.(assignment.id) || []
        return submissions.some((s: any) => s.student_id === studentId)
      }).length
      
      progress = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0
    } catch (error) {
      console.error('Error calculating assignments progress:', error)
    }

    // Get next session
    let nextSession
    try {
      const courseSessions = attendanceHook.getAttendanceSessionsByCourse?.(course.id) || []
      const futureSessions = courseSessions.filter((session: any) => 
        new Date(session.session_date || '') >= new Date()
      ).sort((a: any, b: any) => new Date(a.session_date || '').getTime() - new Date(b.session_date || '').getTime())
      
      if (futureSessions[0]) {
        const session = futureSessions[0]
        nextSession = {
          title: session.session_name || 'Session',
          date: session.session_date,
          time: session.start_time && session.end_time ? `${session.start_time} - ${session.end_time}` : null
        }
      }
    } catch (error) {
      console.error('Error getting next session:', error)
    }

    return {
      id: course.id,
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      description: course.description,
      semesterLabel,
      year: assignment.year,
      instructor,
      schedule,
      attendanceRate,
      averageGrade,
      progress,
      status: 'active' as const,
      materialsCount,
      totalAssignments,
      submittedAssignments,
      nextSession
    }
  }).filter(Boolean) as StudentCourse[]
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useStudentCourses(): UseStudentCoursesResult {
  const [state, setState] = useState<StudentCoursesState>({
    data: [],
    loading: false,
    error: null
  })

  const auth = useAuth()
  const academic = useAcademicStructure()
  const courses = useCourses()
  const attendance = useAttendance()
  const grades = useGrades()
  const materials = useMaterials()

  const service = useMemo(() => new StudentCoursesService(), [])
  
  // Use refs to avoid stale closures and dependency issues
  const attendanceRef = useRef(attendance)
  const gradesRef = useRef(grades)
  const materialsRef = useRef(materials)
  
  // Update refs when hooks change
  attendanceRef.current = attendance
  gradesRef.current = grades
  materialsRef.current = materials

  const fetchStudentCourses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Step 1: Get session user ID
      const userId = await service.getSessionUserId()
      if (!userId) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No authenticated user found. Please log in.' 
        }))
        return
      }

      // Step 2: Get complete student courses data in a single optimized query
      const studentCourses = await service.getStudentCoursesComplete(userId)

      if (studentCourses.length === 0) {
        setState(prev => ({ 
          ...prev, 
          data: [], 
          loading: false, 
          error: null 
        }))
        return
      }

      // Step 3: Calculate stats using existing hooks (minimal data fetching)
      // Only fetch if we don't already have the data
      const needsAttendanceData = !attendanceRef.current.state.attendanceSessions.length
      const needsMaterialsData = !materialsRef.current.state.materials.length

      if (needsAttendanceData || needsMaterialsData) {
        await Promise.all([
          needsAttendanceData ? attendanceRef.current.fetchAttendanceSessions() : Promise.resolve(),
          needsAttendanceData ? attendanceRef.current.fetchAttendanceRecords() : Promise.resolve(),
          needsMaterialsData ? materialsRef.current.fetchMaterials() : Promise.resolve()
        ])
      }

      // Step 4: Enhance student courses with calculated stats
      const enhancedStudentCourses = studentCourses.map(course => {
        // Calculate attendance rate
        let attendanceRate = 0
        try {
          const courseSessions = attendanceRef.current.getAttendanceSessionsByCourse?.(course.id) || []
          let totalSessions = 0
          let presentSessions = 0
          
          courseSessions.forEach((session: any) => {
            const records = attendanceRef.current.getAttendanceRecordsBySession?.(session.id) || []
            const studentRecord = records.find((r: any) => r.student_id === userId)
            if (studentRecord) {
              totalSessions++
              if (studentRecord.status === 'present' || studentRecord.status === 'late') {
                presentSessions++
              }
            }
          })
          
          attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0
        } catch (error) {
          console.error('Error calculating attendance rate:', error)
        }

        // Calculate average grade
        let averageGrade = 0
        try {
          const studentGrades = gradesRef.current.getStudentGradesByCourse?.(userId, course.id) || []
          if (studentGrades.length > 0) {
            averageGrade = Math.round(gradesRef.current.calculateFinalGrade?.(userId, course.id) || 0)
          }
        } catch (error) {
          console.error('Error calculating average grade:', error)
        }

        // Get materials count
        let materialsCount = 0
        try {
          const courseMaterials = materialsRef.current.state?.materials?.filter((m: any) => m.course_id === course.id) || []
          materialsCount = courseMaterials.length
        } catch (error) {
          console.error('Error getting materials count:', error)
        }

        // Calculate assignments progress
        let totalAssignments = 0
        let submittedAssignments = 0
        let progress = 0
        try {
          const assignments = gradesRef.current.getAssignmentsByCourse?.(course.id) || []
          totalAssignments = assignments.length
          
          submittedAssignments = assignments.filter((assignment: any) => {
            const submissions = gradesRef.current.getSubmissionsByAssignment?.(assignment.id) || []
            return submissions.some((s: any) => s.student_id === userId)
          }).length
          
          progress = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0
        } catch (error) {
          console.error('Error calculating assignments progress:', error)
        }

        // Get next session
        let nextSession
        try {
          const courseSessions = attendanceRef.current.getAttendanceSessionsByCourse?.(course.id) || []
          const futureSessions = courseSessions.filter((session: any) => 
            new Date(session.session_date || '') >= new Date()
          ).sort((a: any, b: any) => new Date(a.session_date || '').getTime() - new Date(b.session_date || '').getTime())
          
          if (futureSessions[0]) {
            const session = futureSessions[0]
            nextSession = {
              title: session.session_name || 'Session',
              date: session.session_date,
              time: session.start_time && session.end_time ? `${session.start_time} - ${session.end_time}` : null
            }
          }
        } catch (error) {
          console.error('Error getting next session:', error)
        }

        return {
          ...course,
          attendanceRate,
          averageGrade,
          progress,
          materialsCount,
          totalAssignments,
          submittedAssignments,
          nextSession
        }
      })

      setState(prev => ({ 
        ...prev, 
        data: enhancedStudentCourses, 
        loading: false, 
        error: null 
      }))

    } catch (error) {
      console.error('Error fetching student courses:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load courses. Please try again.' 
      }))
    }
  }, [service])

  const reload = useCallback(async () => {
    await fetchStudentCourses()
  }, [fetchStudentCourses])

  // Auto-fetch on mount - only run once
  React.useEffect(() => {
    fetchStudentCourses()
  }, []) // Empty dependency array to run only once on mount

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useStudentCourses
