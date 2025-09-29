"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  AcademicState, 
  AcademicContextType,
  AcademicYear,
  Semester,
  Department,
  Program,
  Classroom,
  Section,
  StudentProfile,
  LecturerProfile,
  AdminProfile,
  SectionEnrollment
} from './types'

export function useAcademicStructure() {
  const [state, setState] = useState<AcademicState>({
    academicYears: [],
    semesters: [],
    departments: [],
    programs: [],
    classrooms: [],
    sections: [],
    studentProfiles: [],
    lecturerProfiles: [],
    adminProfiles: [],
    sectionEnrollments: [],
    loading: false,
    error: null
  })

  // Academic Years
  const fetchAcademicYears = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, academicYears: data || [], loading: false }))
    } catch (error) {
      console.error('❌ Error fetching academic years:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch academic years', 
        loading: false 
      }))
    }
  }, [])

  const createAcademicYear = useCallback(async (data: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('year_name', data.year_name)
      formData.append('start_date', data.start_date)
      formData.append('end_date', data.end_date)
      formData.append('is_current', data.is_current ? 'true' : 'false')
      if (data.description) formData.append('description', data.description)

      // Import and call server action
      const { createAcademicYear: serverCreateAcademicYear } = await import('./actions')
      const result = await serverCreateAcademicYear({ message: '' }, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchAcademicYears() // Refresh data
    } catch (error) {
      console.error('Error creating academic year:', error)
      setState(prev => ({ ...prev, error: 'Failed to create academic year' }))
      throw error
    }
  }, [fetchAcademicYears])

  const updateAcademicYear = useCallback(async (id: string, data: Partial<AcademicYear>) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('year_name', data.year_name ?? '')
      formData.append('start_date', data.start_date ?? '')
      formData.append('end_date', data.end_date ?? '')
      formData.append('is_current', (data.is_current ?? false).toString())
      if (data.description) formData.append('description', data.description)

      // Import and call server action
      const { updateAcademicYear: serverUpdateAcademicYear } = await import('./actions')
      const result = await serverUpdateAcademicYear(id, { message: '' }, formData)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchAcademicYears() // Refresh data
    } catch (error) {
      console.error('Error updating academic year:', error)
      setState(prev => ({ ...prev, error: 'Failed to update academic year' }))
      throw error
    }
  }, [fetchAcademicYears])

  const deleteAcademicYear = useCallback(async (id: string) => {
    try {
      // Import and call server action
      const { deleteAcademicYear: serverDeleteAcademicYear } = await import('./actions')
      const result = await serverDeleteAcademicYear(id)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchAcademicYears() // Refresh data
    } catch (error) {
      console.error('Error deleting academic year:', error)
      setState(prev => ({ ...prev, error: 'Failed to delete academic year' }))
      throw error
    }
  }, [fetchAcademicYears])

  // Semesters
  const fetchSemesters = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('semesters')
        .select(`
          *,
          academic_years!semesters_academic_year_id_fkey(year_name)
        `)
        .order('start_date', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, semesters: data || [], loading: false }))
    } catch (error) {
      console.error('❌ Error fetching semesters:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch semesters', 
        loading: false 
      }))
    }
  }, [])

  const createSemester = useCallback(async (data: Omit<Semester, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('semesters')
        .insert([data])

      if (error) throw error
      await fetchSemesters() // Refresh data
    } catch (error) {
      console.error('Error creating semester:', error)
      setState(prev => ({ ...prev, error: 'Failed to create semester' }))
      throw error
    }
  }, [fetchSemesters])

  const updateSemester = useCallback(async (id: string, data: Partial<Semester>) => {
    try {
      const { error } = await supabase
        .from('semesters')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchSemesters() // Refresh data
    } catch (error) {
      console.error('Error updating semester:', error)
      setState(prev => ({ ...prev, error: 'Failed to update semester' }))
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
      setState(prev => ({ ...prev, error: 'Failed to delete semester' }))
      throw error
    }
  }, [fetchSemesters])

  // Departments
  const fetchDepartments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          users!departments_head_id_fkey(full_name, email)
        `)
        .order('department_name', { ascending: true })

      if (error) throw error
      setState(prev => ({ ...prev, departments: data || [], loading: false }))
    } catch (error) {
      console.error('❌ Error fetching departments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch departments', 
        loading: false 
      }))
    }
  }, [])

  const createDepartment = useCallback(async (data: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
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


      // Import and call server action
      const { createDepartment: serverCreateDepartment } = await import('./actions')
      const result = await serverCreateDepartment({ message: '' }, formData)
      
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchDepartments() // Refresh data
    } catch (error) {
      console.error('Error creating department:', error)
      setState(prev => ({ ...prev, error: 'Failed to create department' }))
      throw error
    }
  }, [fetchDepartments])

  const updateDepartment = useCallback(async (id: string, data: Partial<Department>) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchDepartments() // Refresh data
    } catch (error) {
      console.error('Error updating department:', error)
      setState(prev => ({ ...prev, error: 'Failed to update department' }))
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
      setState(prev => ({ ...prev, error: 'Failed to delete department' }))
      throw error
    }
  }, [fetchDepartments])

  // Programs
  const fetchPrograms = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          departments!programs_department_id_fkey(department_code, department_name)
        `)
        .order('program_name', { ascending: true })

      if (error) throw error
      setState(prev => ({ ...prev, programs: data || [], loading: false }))
    } catch (error) {
      console.error('❌ Error fetching programs:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch programs', 
        loading: false 
      }))
    }
  }, [])

  const createProgram = useCallback(async (data: Omit<Program, 'id' | 'program_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('programs')
        .insert([data])

      if (error) throw error
      await fetchPrograms() // Refresh data
    } catch (error) {
      console.error('Error creating program:', error)
      setState(prev => ({ ...prev, error: 'Failed to create program' }))
      throw error
    }
  }, [fetchPrograms])

  const updateProgram = useCallback(async (id: string, data: Partial<Program>) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchPrograms() // Refresh data
    } catch (error) {
      console.error('Error updating program:', error)
      setState(prev => ({ ...prev, error: 'Failed to update program' }))
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
      setState(prev => ({ ...prev, error: 'Failed to delete program' }))
      throw error
    }
  }, [fetchPrograms])

  // Classrooms
  const fetchClassrooms = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('building', { ascending: true })
        .order('room_number', { ascending: true })

      if (error) throw error
      setState(prev => ({ ...prev, classrooms: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching classrooms:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch classrooms', 
        loading: false 
      }))
    }
  }, [])

  const createClassroom = useCallback(async (data: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .insert([data])

      if (error) throw error
      await fetchClassrooms() // Refresh data
    } catch (error) {
      console.error('Error creating classroom:', error)
      setState(prev => ({ ...prev, error: 'Failed to create classroom' }))
      throw error
    }
  }, [fetchClassrooms])

  const updateClassroom = useCallback(async (id: string, data: Partial<Classroom>) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchClassrooms() // Refresh data
    } catch (error) {
      console.error('Error updating classroom:', error)
      setState(prev => ({ ...prev, error: 'Failed to update classroom' }))
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
      setState(prev => ({ ...prev, error: 'Failed to delete classroom' }))
      throw error
    }
  }, [fetchClassrooms])

  // Sections
  const fetchSections = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('sections')
        .select(`
          *,
          programs!sections_program_id_fkey(
            program_code, 
            program_name,
            departments!programs_department_id_fkey(department_name, department_code)
          ),
          academic_years!sections_academic_year_id_fkey(year_name),
          semesters!sections_semester_id_fkey(semester_name),
          classrooms!sections_classroom_id_fkey(building, room_number)
        `)
        .order('section_code', { ascending: true })

      if (error) throw error
      setState(prev => ({ ...prev, sections: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching sections:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch sections', 
        loading: false 
      }))
    }
  }, [])

  const createSection = useCallback(async (data: Omit<Section, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('section_code', data.section_code || '')
      formData.append('program_id', data.program_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('year', data.year?.toString() || '1')
      formData.append('classroom_id', data.classroom_id || '')
      formData.append('max_capacity', (data.max_capacity || 30).toString())
      formData.append('current_enrollment', data.current_enrollment?.toString() || '0')
      formData.append('description', data.description || '')
      formData.append('is_active', data.is_active ? 'true' : 'false')


      // Import and call server action
      const { createSection: serverCreateSection } = await import('./actions')
      const result = await serverCreateSection({ message: '' }, formData)
      
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchSections() // Refresh data
    } catch (error) {
      console.error('Error creating section:', error)
      setState(prev => ({ ...prev, error: 'Failed to create section' }))
      throw error
    }
  }, [fetchSections])

  const updateSection = useCallback(async (id: string, data: Partial<Section>) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('section_code', data.section_code || '')
      formData.append('program_id', data.program_id || '')
      formData.append('academic_year_id', data.academic_year_id || '')
      formData.append('semester_id', data.semester_id || '')
      formData.append('year', data.year?.toString() || '1')
      formData.append('classroom_id', data.classroom_id || '')
      formData.append('max_capacity', (data.max_capacity || 30).toString())
      formData.append('current_enrollment', data.current_enrollment?.toString() || '0')
      formData.append('description', data.description || '')
      formData.append('is_active', data.is_active ? 'true' : 'false')


      // Import and call server action
      const { updateSection: serverUpdateSection } = await import('./actions')
      const result = await serverUpdateSection(id, { message: '' }, formData)
      
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      await fetchSections() // Refresh data
    } catch (error) {
      console.error('Error updating section:', error)
      setState(prev => ({ ...prev, error: 'Failed to update section' }))
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
      setState(prev => ({ ...prev, error: 'Failed to delete section' }))
      throw error
    }
  }, [fetchSections])

  // Profiles
  const fetchStudentProfiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          users!student_profiles_user_id_fkey(full_name, email),
          programs!student_profiles_program_id_fkey(
            program_code, 
            program_name, 
            degree_type, 
            duration_years,
            departments!programs_department_id_fkey(department_name, department_code)
          ),
          sections!student_profiles_section_id_fkey(section_code, year),
          academic_years!student_profiles_academic_year_id_fkey(year_name, start_date, end_date)
        `)
        .order('student_id', { ascending: true })

      if (error) {
        console.error('❌ Error fetching student profiles:', error)
        throw error
      }
      
      setState(prev => ({ ...prev, studentProfiles: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching student profiles:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch student profiles', 
        loading: false 
      }))
    }
  }, [])

  const fetchLecturerProfiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('lecturer_profiles')
        .select(`
          *,
          users!lecturer_profiles_user_id_fkey(full_name, email, role),
          departments!lecturer_profiles_department_id_fkey(department_code, department_name)
        `)
        .order('employee_id', { ascending: true })

      if (error) throw error
      setState(prev => ({ ...prev, lecturerProfiles: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching lecturer profiles:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch lecturer profiles', 
        loading: false 
      }))
    }
  }, [])

  const fetchAdminProfiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('admin_profiles')
        .select(`
          *,
          users!admin_profiles_user_id_fkey(full_name, email),
          departments!admin_profiles_department_id_fkey(department_code, department_name)
        `)
        .order('employee_id', { ascending: true })

      if (error) throw error
      setState(prev => ({ ...prev, adminProfiles: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching admin profiles:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch admin profiles', 
        loading: false 
      }))
    }
  }, [])

  // Calculate total credits for a student
  const calculateStudentTotalCredits = useCallback(async (studentId: string) => {
    try {
      // Get all section enrollments for this student
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('section_enrollments')
        .select(`
          *,
          sections!section_enrollments_section_id_fkey(
            *,
            course_assignments!sections_course_assignments_section_id_fkey(
              *,
              courses!course_assignments_course_id_fkey(credits)
            )
          )
        `)
        .eq('student_id', studentId)

      if (enrollmentError) throw enrollmentError

      // Calculate total credits from all enrolled courses
      const totalCredits = enrollments?.reduce((sum, enrollment) => {
        const courseAssignments = enrollment.sections?.course_assignments || []
        const credits = courseAssignments.reduce((courseSum: number, assignment: any) => {
          return courseSum + (assignment.courses?.credits || 0)
        }, 0)
        return sum + credits
      }, 0) || 0

      return totalCredits
    } catch (error) {
      console.error('Error calculating student total credits:', error)
      return 0
    }
  }, [])

  // Section Enrollments
  const fetchSectionEnrollments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('section_enrollments')
        .select(`
          *,
          users!section_enrollments_student_id_fkey(full_name, student_id),
          sections!section_enrollments_section_id_fkey(
            section_code,
            year,
            programs!sections_program_id_fkey(id, program_name, program_code),
            academic_years!sections_academic_year_id_fkey(id, year_name),
            semesters!sections_semester_id_fkey(id, semester_name)
          )
        `)
        .order('enrollment_date', { ascending: false })

      if (error) throw error
      
      
      // Transform the data to include joined information
      const transformedData = (data || []).map((enrollment: any) => {
        
        return {
          ...enrollment,
          student_name: enrollment.users?.full_name,
          student_id_number: enrollment.users?.student_id,
          section_code: enrollment.sections?.section_code,
          year: enrollment.sections?.year,
          program_name: enrollment.sections?.programs?.program_name,
          program_code: enrollment.sections?.programs?.program_code,
          academic_year: enrollment.sections?.academic_years?.year_name,
          semester_name: enrollment.sections?.semesters?.semester_name,
          // Add ID properties for filtering - these are the critical ones
          program_id: enrollment.sections?.programs?.id,
          semester_id: enrollment.sections?.semesters?.id,
          academic_year_id: enrollment.sections?.academic_years?.id
        }
      })
      
      setState(prev => ({ ...prev, sectionEnrollments: transformedData, loading: false }))
    } catch (error) {
      console.error('Error fetching section enrollments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch section enrollments', 
        loading: false 
      }))
    }
  }, [])

  return {
    state,
    // Academic Years
    fetchAcademicYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    // Semesters
    fetchSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
    // Departments
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    // Programs
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    // Classrooms
    fetchClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    // Sections
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    // Section Enrollments
    fetchSectionEnrollments,
    // Profiles
    fetchStudentProfiles,
    fetchLecturerProfiles,
    fetchAdminProfiles,
    // Utilities
    calculateStudentTotalCredits
  }
}
