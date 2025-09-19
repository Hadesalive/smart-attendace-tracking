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
  AdminProfile
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
      console.error('Error fetching academic years:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch academic years', 
        loading: false 
      }))
    }
  }, [])

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
      const { createAcademicYear: serverCreateAcademicYear } = await import('./actions')
      const result = await serverCreateAcademicYear({}, formData)
      
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
      const { updateAcademicYear: serverUpdateAcademicYear } = await import('./actions')
      const result = await serverUpdateAcademicYear(id, {}, formData)
      
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
      console.error('Error fetching semesters:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch semesters', 
        loading: false 
      }))
    }
  }, [])

  const createSemester = useCallback(async (data: any) => {
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
      console.error('Error fetching departments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch departments', 
        loading: false 
      }))
    }
  }, [])

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
      const { createDepartment: serverCreateDepartment } = await import('./actions')
      const result = await serverCreateDepartment({}, formData)
      
      console.log('Server action result:', result)
      
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
      console.error('Error fetching programs:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch programs', 
        loading: false 
      }))
    }
  }, [])

  const createProgram = useCallback(async (data: any) => {
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

  const createClassroom = useCallback(async (data: any) => {
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
          programs!sections_program_id_fkey(program_code, program_name),
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
      const { createSection: serverCreateSection } = await import('./actions')
      const result = await serverCreateSection({}, formData)
      
      console.log('Server action result:', result)
      
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
      const { updateSection: serverUpdateSection } = await import('./actions')
      const result = await serverUpdateSection(id, {}, formData)
      
      console.log('Server action result:', result)
      
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
          programs!student_profiles_program_id_fkey(program_code, program_name),
          sections!student_profiles_section_id_fkey(section_code),
          academic_years!student_profiles_academic_year_id_fkey(year_name)
        `)
        .order('student_id', { ascending: true })

      if (error) throw error
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
          users!lecturer_profiles_user_id_fkey(full_name, email),
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
    // Profiles
    fetchStudentProfiles,
    fetchLecturerProfiles,
    fetchAdminProfiles
  }
}
