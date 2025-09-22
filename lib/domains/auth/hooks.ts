"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types/shared'
import { AuthState, AuthContextType } from './types'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  })

  // Auth: load current user profile
  const loadCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState(prev => ({ ...prev, currentUser: null }))
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      if (error) throw error
      setState(prev => ({ ...prev, currentUser: profile as unknown as User }))
    } catch (e) {
      console.error('Error loading current user:', e)
      setState(prev => ({ ...prev, currentUser: null }))
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setState(prev => ({ ...prev, users: data || [], loading: false }))
    } catch (error) {
      console.error('Error fetching users:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch users', 
        loading: false 
      }))
    }
  }, [])

  const createUser = useCallback(async (data: any) => {
    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('email', data.email || '')
      formData.append('password', data.password || '')
      formData.append('fullName', data.full_name || data.fullName || '')
      formData.append('role', data.role || 'lecturer')
      
      // Add student-specific fields (only if they exist and are not null/undefined)
      if (data.student_id && data.student_id !== null && data.student_id !== undefined) formData.append('student_id', data.student_id)
      if (data.program_id && data.program_id !== null && data.program_id !== undefined) formData.append('program_id', data.program_id)
      if (data.academic_year_id && data.academic_year_id !== null && data.academic_year_id !== undefined) formData.append('academic_year_id', data.academic_year_id)
      if (data.semester_id && data.semester_id !== null && data.semester_id !== undefined) formData.append('semester_id', data.semester_id)
      if (data.section_id && data.section_id !== null && data.section_id !== undefined) formData.append('section_id', data.section_id) // Physical class section
      if (data.year_level && data.year_level !== null && data.year_level !== undefined) formData.append('year_level', data.year_level.toString())
      if (data.gpa && data.gpa !== null && data.gpa !== undefined) formData.append('gpa', data.gpa.toString())
      if (data.enrollment_date && data.enrollment_date !== null && data.enrollment_date !== undefined) formData.append('enrollment_date', data.enrollment_date)
      if (data.graduation_date && data.graduation_date !== null && data.graduation_date !== undefined) formData.append('graduation_date', data.graduation_date)
      
      // Add lecturer-specific fields (only if they exist and are not null/undefined)
      if (data.employee_id && data.employee_id !== null && data.employee_id !== undefined) formData.append('employee_id', data.employee_id)
      if (data.department_id && data.department_id !== null && data.department_id !== undefined) formData.append('department_id', data.department_id)
      if (data.position && data.position !== null && data.position !== undefined) formData.append('position', data.position)
      if (data.hire_date && data.hire_date !== null && data.hire_date !== undefined) formData.append('hire_date', data.hire_date)
      if (data.specialization && data.specialization !== null && data.specialization !== undefined) formData.append('specialization', data.specialization)
      if (data.qualification && data.qualification !== null && data.qualification !== undefined) formData.append('qualification', data.qualification)
      if (data.experience_years && data.experience_years !== null && data.experience_years !== undefined) formData.append('experience_years', data.experience_years.toString())
      if (data.bio && data.bio !== null && data.bio !== undefined) formData.append('bio', data.bio)
      if (data.research_interests && data.research_interests !== null && data.research_interests !== undefined) formData.append('research_interests', data.research_interests)
      
      // Add admin-specific fields (only if they exist and are not null/undefined)
      if (data.admin_level && data.admin_level !== null && data.admin_level !== undefined) formData.append('admin_level', data.admin_level)
      if (data.permissions && data.permissions !== null && data.permissions !== undefined) formData.append('permissions', JSON.stringify(data.permissions))

      console.log('Creating user with data:', data)
      console.log('FormData entries:', Array.from(formData.entries()))

      // Import and call server action
      const { createUser: serverCreateUser } = await import('./actions')
      const result = await serverCreateUser({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
        console.error('Validation errors:', result.errors)
        throw new Error(result.message)
      }
      
      // Refresh users data
      await fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      setState(prev => ({ ...prev, error: 'Failed to create user' }))
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
      setState(prev => ({ ...prev, error: 'Failed to update user' }))
      throw error
    }
  }, [fetchUsers])

  const updateUserProfile = useCallback(async (userId: string, userData: any) => {
    try {
      const { updateUserProfile: serverUpdateProfile } = await import('./actions')
      const result = await serverUpdateProfile(userId, userData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user profile')
      }
      
      await fetchUsers() // Refresh data
      return result
    } catch (error) {
      console.error('Error updating user profile:', error)
      setState(prev => ({ ...prev, error: 'Failed to update user profile' }))
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
      setState(prev => ({ ...prev, error: 'Failed to delete user' }))
      throw error
    }
  }, [fetchUsers])

  const resetUserPassword = useCallback(async (userId: string, newPassword: string) => {
    try {
      const { resetUserPassword: serverResetPassword } = await import('./actions')
      const result = await serverResetPassword(userId, newPassword)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      return result
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }, [])

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      const { updateUserStatus: serverUpdateStatus } = await import('./actions')
      const result = await serverUpdateStatus(userId, isActive)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      return result
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }, [])

  const getUserAuthStatus = useCallback(async (userId: string) => {
    try {
      const { getUserAuthStatus: serverGetStatus } = await import('./actions')
      const result = await serverGetStatus(userId)
      
      if (result.type === 'error') {
        throw new Error(result.message)
      }
      
      return result.data
    } catch (error) {
      console.error('Error getting user auth status:', error)
      throw error
    }
  }, [])

  return {
    state,
    loadCurrentUser,
    fetchUsers,
    createUser,
    updateUser,
    updateUserProfile,
    deleteUser,
    resetUserPassword,
    updateUserStatus,
    getUserAuthStatus
  }
}
