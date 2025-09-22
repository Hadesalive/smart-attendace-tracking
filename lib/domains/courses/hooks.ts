"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Course, LecturerAssignment, Enrollment } from '@/lib/types/shared'
import { CoursesState, CoursesContextType, CourseAssignment } from './types'

export function useCourses() {
  const [state, setState] = useState<CoursesState>({
    courses: [],
    courseAssignments: [],
    enrollments: [],
    lecturerAssignments: [],
    loading: false,
    error: null
  })

  const fetchCourses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
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
      
      setState(prev => ({ ...prev, courses: transformedCourses, loading: false }))
    } catch (error) {
      console.error('❌ Error fetching courses:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch courses', 
        loading: false 
      }))
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
      const { createCourse: serverCreateCourse } = await import('./actions')
      const result = await serverCreateCourse({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchCourses() // Refresh data
    } catch (error) {
      console.error('Error creating course:', error)
      setState(prev => ({ ...prev, error: 'Failed to create course' }))
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
      const { updateCourse: serverUpdateCourse } = await import('./actions')
      const result = await serverUpdateCourse({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchCourses() // Refresh data
    } catch (error) {
      console.error('Error updating course:', error)
      setState(prev => ({ ...prev, error: 'Failed to update course' }))
      throw error
    }
  }, [fetchCourses])

  const deleteCourse = useCallback(async (id: string) => {
    try {
      // Import and call server action
      const { deleteCourse: serverDeleteCourse } = await import('./actions')
      const result = await serverDeleteCourse(id)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchCourses() // Refresh data
    } catch (error) {
      console.error('Error deleting course:', error)
      setState(prev => ({ ...prev, error: 'Failed to delete course' }))
      throw error
    }
  }, [fetchCourses])

  const fetchCourseAssignments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { data, error } = await supabase
        .from('course_assignments')
        .select(`
          *,
          courses!course_assignments_course_id_fkey (
            course_code,
            course_name,
            credits,
            department
          ),
          programs!course_assignments_program_id_fkey (
            program_name,
            program_code
          ),
          academic_years!course_assignments_academic_year_id_fkey (
            year_name
          ),
          semesters!course_assignments_semester_id_fkey (
            semester_name,
            semester_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      
      setState(prev => ({ ...prev, courseAssignments: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching course assignments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch course assignments', 
        loading: false 
      }))
    }
  }, [])

  const createCourseAssignment = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('course_id', data.course_id || '')
      formData.append('program_id', data.program_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('year', (data.year || 1).toString())
      formData.append('is_mandatory', data.is_mandatory ? 'true' : 'false')
      if (data.max_students) {
        formData.append('max_students', data.max_students.toString())
      }


      // Import and call server action
      const { createCourseAssignment: serverCreateCourseAssignment } = await import('./actions')
      const result = await serverCreateCourseAssignment({}, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh course assignments data
      await fetchCourseAssignments()
    } catch (error) {
      console.error('Error creating course assignment:', error)
      setState(prev => ({ ...prev, error: 'Failed to create course assignment' }))
      throw error
    }
  }, [fetchCourseAssignments])

  const updateCourseAssignment = useCallback(async (id: string, data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('course_id', data.course_id || '')
      formData.append('program_id', data.program_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('year', (data.year || 1).toString())
      formData.append('is_mandatory', data.is_mandatory ? 'true' : 'false')
      if (data.max_students) {
        formData.append('max_students', data.max_students.toString())
      }

      console.log('Updating course assignment with data:', data)

      // Import and call server action
      const { updateCourseAssignment: serverUpdateCourseAssignment } = await import('./actions')
      const result = await serverUpdateCourseAssignment(id, {}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh course assignments data
      await fetchCourseAssignments()
    } catch (error) {
      console.error('Error updating course assignment:', error)
      setState(prev => ({ ...prev, error: 'Failed to update course assignment' }))
      throw error
    }
  }, [fetchCourseAssignments])

  const deleteCourseAssignment = useCallback(async (id: string) => {
    try {
      // Import and call server action
      const { deleteCourseAssignment: serverDeleteCourseAssignment } = await import('./actions')
      const result = await serverDeleteCourseAssignment(id)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh course assignments data
      await fetchCourseAssignments()
    } catch (error) {
      console.error('Error deleting course assignment:', error)
      setState(prev => ({ ...prev, error: 'Failed to delete course assignment' }))
      throw error
    }
  }, [fetchCourseAssignments])

  const fetchEnrollments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, enrollments: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch enrollments', 
        loading: false 
      }))
    }
  }, [])

  const fetchLecturerAssignments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('lecturer_assignments')
        .select(`
          *,
          users!lecturer_assignments_lecturer_id_fkey(full_name, email, role),
          courses!lecturer_assignments_course_id_fkey(course_name, course_code, credits),
          academic_years!lecturer_assignments_academic_year_id_fkey(year_name, is_current),
          semesters!lecturer_assignments_semester_id_fkey(semester_name, semester_number),
          programs!lecturer_assignments_program_id_fkey(program_name, program_code),
          sections!lecturer_assignments_section_id_fkey(section_code, year)
        `)
        .order('assigned_at', { ascending: false })

      if (error) throw error
      
      setState(prev => ({ ...prev, lecturerAssignments: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching lecturer assignments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch lecturer assignments', 
        loading: false 
      }))
    }
  }, [])

  const getCoursesByLecturer = useCallback((lecturerId: string): Course[] => {
    return state.courses.filter(course => course.lecturer_id === lecturerId)
  }, [state.courses])

  const getLecturersByCourse = useCallback((courseId: string) => {
    return state.lecturerAssignments.filter(assignment => assignment.course_id === courseId)
  }, [state.lecturerAssignments])

  const getStudentsByCourse = useCallback((courseId: string) => {
    const enrollmentIds = state.enrollments
      .filter(e => e.course_id === courseId && e.status === 'active')
      .map(e => e.student_id)
    
    // This would need to be implemented with actual student data
    return []
  }, [state.enrollments])

  const createTeacherAssignment = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('lecturer_id', data.lecturer_id)
      formData.append('course_id', data.course_id)
      formData.append('academic_year_id', data.academic_year_id)
      formData.append('semester_id', data.semester_id)
      formData.append('program_id', data.program_id)
      formData.append('section_id', data.section_id)
      formData.append('is_primary', data.is_primary.toString())
      if (data.teaching_hours_per_week) {
        formData.append('teaching_hours_per_week', data.teaching_hours_per_week.toString())
      }
      if (data.start_date) {
        formData.append('start_date', data.start_date)
      }
      if (data.end_date) {
        formData.append('end_date', data.end_date)
      }

      // Import and call server action
      const { createLecturerAssignment } = await import('./actions')
      const result = await createLecturerAssignment({}, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh data after creation
      await fetchLecturerAssignments()
    } catch (error) {
      console.error('❌ Error creating teacher assignment:', error)
      throw error
    }
  }, [fetchLecturerAssignments])

  const updateTeacherAssignment = useCallback(async (id: string, data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('id', id)
      formData.append('lecturer_id', data.lecturer_id)
      formData.append('course_id', data.course_id)
      formData.append('academic_year_id', data.academic_year_id)
      formData.append('semester_id', data.semester_id)
      formData.append('program_id', data.program_id)
      formData.append('section_id', data.section_id)
      formData.append('is_primary', data.is_primary.toString())
      if (data.teaching_hours_per_week) {
        formData.append('teaching_hours_per_week', data.teaching_hours_per_week.toString())
      }
      if (data.start_date) {
        formData.append('start_date', data.start_date)
      }
      if (data.end_date) {
        formData.append('end_date', data.end_date)
      }

      // Import and call server action
      const { updateLecturerAssignment } = await import('./actions')
      const result = await updateLecturerAssignment({}, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      // Refresh data after update
      await fetchLecturerAssignments()
    } catch (error) {
      console.error('❌ Error updating teacher assignment:', error)
      throw error
    }
  }, [fetchLecturerAssignments])

  return {
    state,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchCourseAssignments,
    createCourseAssignment,
    updateCourseAssignment,
    deleteCourseAssignment,
    fetchEnrollments,
    fetchLecturerAssignments,
    getCoursesByLecturer,
    getLecturersByCourse,
    getStudentsByCourse,
    createTeacherAssignment,
    updateTeacherAssignment
  }
}
