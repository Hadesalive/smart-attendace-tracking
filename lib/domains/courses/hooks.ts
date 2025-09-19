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
      console.error('Error fetching courses:', error)
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
      console.log('DataContext: Starting to fetch course assignments...')
      setState(prev => ({ ...prev, loading: true }))
      
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
      formData.append('section_id', data.section_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('is_mandatory', data.is_mandatory ? 'true' : 'false')
      if (data.max_students) {
        formData.append('max_students', data.max_students.toString())
      }

      console.log('Creating course assignment with data:', data)

      // Import and call server action
      const { createCourseAssignment: serverCreateCourseAssignment } = await import('./actions')
      const result = await serverCreateCourseAssignment({}, formData)
      
      console.log('Server action result:', result)
      
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
      formData.append('section_id', data.section_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
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
      
      setState(prev => ({ ...prev, lecturerAssignments: assignments, loading: false }))
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

  const getStudentsByCourse = useCallback((courseId: string) => {
    const enrollmentIds = state.enrollments
      .filter(e => e.course_id === courseId && e.status === 'active')
      .map(e => e.student_id)
    
    // This would need to be implemented with actual student data
    return []
  }, [state.enrollments])

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
    getStudentsByCourse
  }
}
