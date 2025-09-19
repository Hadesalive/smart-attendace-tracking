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

      console.log('Creating user with data:', data)

      // Import and call server action
      const { createUser: serverCreateUser } = await import('./actions')
      const result = await serverCreateUser({}, formData)
      
      console.log('Server action result:', result)
      
      if (result.type === 'error') {
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

  return {
    state,
    loadCurrentUser,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
