  "use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AttendanceSession, AttendanceRecord } from '@/lib/types/shared'
import { AttendanceState, AttendanceContextType } from './types'

export function useAttendance() {
  const [state, setState] = useState<AttendanceState>({
    attendanceSessions: [],
    attendanceRecords: [],
    loading: false,
    error: null
  })

  const fetchAttendanceSessions = useCallback(async (studentId?: string) => {
    try {
      console.log('DataContext: Starting to fetch attendance sessions...', { studentId })
      setState(prev => ({ ...prev, loading: true }))
      
      let query = supabase
        .from('attendance_sessions')
        .select(`
          *,
          courses!attendance_sessions_course_id_fkey(course_code, course_name),
          users!attendance_sessions_lecturer_id_fkey(full_name),
          sections!attendance_sessions_section_id_fkey(
            id,
            section_code,
            program_id
          )
        `)

      // If studentId is provided, filter by student's section enrollment
      if (studentId) {
        console.log('DataContext: Filtering sessions by student section enrollment...')
        
        // First, get student's section enrollments
        const { data: sectionEnrollments, error: enrollmentError } = await supabase
          .from('section_enrollments')
          .select(`
            section_id,
            sections!inner(
              id,
              section_code,
              program_id
            )
          `)
          .eq('student_id', studentId)
          .eq('status', 'active')

        if (enrollmentError) {
          console.error('DataContext: Error fetching section enrollments:', enrollmentError)
          throw new Error(`Failed to fetch section enrollments: ${enrollmentError.message}`)
        }

        const sectionIds = sectionEnrollments?.map(se => se.section_id) || []
        console.log('DataContext: Student section enrollments:', { sectionIds, sectionEnrollments })

        if (sectionIds.length === 0) {
          console.log('DataContext: No active section enrollments found, returning empty sessions')
          setState(prev => ({ ...prev, attendanceSessions: [], loading: false }))
          return
        }

        // Filter sessions by student's enrolled sections
        query = query.in('section_id', sectionIds)
      }

      const { data, error } = await query
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
          section_code: session.sections?.section_code || 'Unknown Section',
          section_id: session.section_id,
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
      setState(prev => ({ ...prev, attendanceSessions: transformedSessions, loading: false }))
    } catch (error) {
      console.error('Error fetching attendance sessions:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch attendance sessions', 
        loading: false 
      }))
    }
  }, [])

  // New function specifically for fetching student sessions with section filtering
  const fetchStudentAttendanceSessions = useCallback(async (studentId: string) => {
    try {
      console.log('DataContext: Fetching student attendance sessions for:', studentId)
      setState(prev => ({ ...prev, loading: true }))
      
      // Get student's section enrollments first
      const { data: sectionEnrollments, error: enrollmentError } = await supabase
        .from('section_enrollments')
        .select(`
          section_id,
          sections!inner(
            id,
            section_code,
            program_id,
            programs!inner(
              id,
              program_name
            )
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active')

      if (enrollmentError) {
        console.error('DataContext: Error fetching section enrollments:', enrollmentError)
        throw new Error(`Failed to fetch section enrollments: ${enrollmentError.message}`)
      }

      const sectionIds = sectionEnrollments?.map(se => se.section_id) || []
      console.log('DataContext: Student section enrollments:', { sectionIds, sectionEnrollments })

      if (sectionIds.length === 0) {
        console.log('DataContext: No active section enrollments found')
        setState(prev => ({ ...prev, attendanceSessions: [], loading: false }))
        return []
      }

      // Fetch sessions for student's enrolled sections
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select(`
          *,
          courses!attendance_sessions_course_id_fkey(
            course_code, 
            course_name,
            department_id
          ),
          users!attendance_sessions_lecturer_id_fkey(full_name),
          sections!attendance_sessions_section_id_fkey(
            id,
            section_code,
            program_id,
            programs!inner(
              id,
              program_name
            )
          )
        `)
        .in('section_id', sectionIds)
        .order('session_date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) {
        console.error('DataContext: Error fetching student sessions:', error)
        throw error
      }

      // Transform sessions with section information
      const transformedSessions = (data || []).map(session => {
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
          class_id: `class_${session.course_id}`,
          class_name: session.courses?.course_name || `Class ${session.course_id}`,
          lecturer_name: session.users?.full_name || `Lecturer ${session.lecturer_id}`,
          section_code: session.sections?.section_code || 'Unknown Section',
          section_id: session.section_id,
          program_name: session.sections?.programs?.program_name || 'Unknown Program',
          type: 'lecture' as const,
          capacity: 50, // Mock capacity
          enrolled: 25, // Mock enrolled count
          description: `Attendance session for ${session.courses?.course_name || 'course'} - ${session.sections?.section_code || 'section'}`,
          status: timeBasedStatus,
          is_active: timeBasedStatus === 'active'
        }
      })

      console.log('DataContext: Student sessions transformed:', transformedSessions)
      setState(prev => ({ ...prev, attendanceSessions: transformedSessions, loading: false }))
      return transformedSessions
    } catch (error) {
      console.error('Error fetching student attendance sessions:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch student attendance sessions', 
        loading: false 
      }))
      return []
    }
  }, [])

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
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
      
      setState(prev => ({ ...prev, attendanceRecords: transformedRecords, loading: false }))
    } catch (error) {
      console.error('Error fetching attendance records:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch attendance records', 
        loading: false 
      }))
    }
  }, [])

  const createAttendanceSessionSupabase = useCallback(async (session: Omit<AttendanceSession, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert([{
          course_id: session.course_id,
          section_id: session.section_id, // ✅ FIXED: Added section_id
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

      setState(prev => ({ 
        ...prev, 
        attendanceSessions: [...prev.attendanceSessions, newSession] 
      }))
      return newSession
    } catch (error) {
      console.error('Error creating attendance session:', error)
      setState(prev => ({ ...prev, error: 'Failed to create attendance session' }))
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
          section_id: updates.section_id, // ✅ FIXED: Added section_id
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
        setState(prev => ({
          ...prev,
          attendanceSessions: prev.attendanceSessions.map(s => 
            s.id === sessionId ? newSession : s
          )
        }))
        console.log('DataContext: Local state updated successfully')
      } else {
        console.warn('DataContext: Session not found in local state:', sessionId)
      }
    } catch (error) {
      console.error('DataContext: Error updating attendance session:', error)
      setState(prev => ({ ...prev, error: 'Failed to update attendance session' }))
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
      setState(prev => ({
        ...prev,
        attendanceSessions: prev.attendanceSessions.filter(s => s.id !== sessionId)
      }))
      console.log('DataContext: Local state updated successfully')
      
    } catch (error) {
      console.error('DataContext: Error deleting attendance session:', error)
      setState(prev => ({ ...prev, error: 'Failed to delete attendance session' }))
      throw error
    }
  }, [])

  const markAttendanceSupabase = useCallback(async (sessionId: string, studentId: string, method: 'qr_code' | 'facial_recognition', token?: string) => {
    try {
      console.log('Calling mark-attendance function with:', { sessionId, studentId, method, hasToken: !!token })
      
      // Call the edge function to mark attendance
      const { data, error } = await supabase.functions.invoke('mark-attendance', {
        body: {
          session_id: sessionId,
          student_id: studentId,
          token: token // ✅ ENHANCED: Pass rotating QR token for validation
        }
      })

      console.log('Function response:', { data, error })
      console.log('Response data type:', typeof data)
      console.log('Response data keys:', data ? Object.keys(data) : 'null')
      console.log('Response error type:', typeof error)
      console.log('Response error keys:', error ? Object.keys(error) : 'null')

      if (error) {
        console.error('Supabase function error:', error)
        // Try to extract error message from various sources
        let errorMessage = error.message || 'Unknown error from edge function'
        
        // Check if data contains error message (common for 400 responses)
        if (data && typeof data === 'object' && 'error' in data) {
          errorMessage = (data as any).error
          console.log('✅ Found error in data.error:', errorMessage)
        }
        // Check error.context
        else if (error.context) {
          try {
            const context = JSON.parse(error.context)
            if (context.error) {
              errorMessage = context.error
              console.log('✅ Found error in error.context:', errorMessage)
            }
          } catch (e) {
            // Ignore parsing error, use original message
          }
        }
        
        console.log('📤 Final extracted error message:', errorMessage)
        throw new Error(errorMessage)
      }

      // Refresh attendance records to get the latest data
      await fetchAttendanceRecords()
    } catch (error) {
      console.error('Error marking attendance:', error)
      setState(prev => ({ ...prev, error: 'Failed to mark attendance' }))
      throw error
    }
  }, [fetchAttendanceRecords])

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
            setState(prev => ({
              ...prev,
              attendanceSessions: [...prev.attendanceSessions, transformedSession]
            }))
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
            setState(prev => ({
              ...prev,
              attendanceSessions: prev.attendanceSessions.map(s => 
                s.id === updatedSession.id ? transformedSession : s
              )
            }))
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
            setState(prev => ({
              ...prev,
              attendanceRecords: [...prev.attendanceRecords, transformedRecord]
            }))
          }
        }
      )
      .subscribe()

    return subscription
  }, [])

  const unsubscribeAll = useCallback(() => {
    supabase.removeAllChannels()
  }, [])

  const getAttendanceSessionsByCourse = useCallback((courseId: string): AttendanceSession[] => {
    return state.attendanceSessions.filter(session => session.course_id === courseId)
  }, [state.attendanceSessions])

  const getAttendanceRecordsBySession = useCallback((sessionId: string): AttendanceRecord[] => {
    return state.attendanceRecords.filter(record => record.session_id === sessionId)
  }, [state.attendanceRecords])

  // Legacy methods for backward compatibility
  const createAttendanceSession = useCallback((session: Omit<AttendanceSession, 'id' | 'created_at'>) => {
    // For now, just call the Supabase version
    createAttendanceSessionSupabase(session)
  }, [createAttendanceSessionSupabase])

  const markAttendance = useCallback((sessionId: string, studentId: string, status: 'present' | 'late' | 'absent', method: 'qr_code' | 'facial_recognition') => {
    // For now, just call the Supabase version with default status
    markAttendanceSupabase(sessionId, studentId, method)
  }, [markAttendanceSupabase])

  return {
    state,
    fetchAttendanceSessions,
    fetchStudentAttendanceSessions, // New function for section-based student sessions
    fetchAttendanceRecords,
    createAttendanceSession,
    createAttendanceSessionSupabase,
    updateAttendanceSessionSupabase,
    deleteAttendanceSessionSupabase,
    markAttendance,
    markAttendanceSupabase,
    getSessionTimeStatus,
    updateSessionStatusBasedOnTime,
    subscribeToAttendanceSessions,
    subscribeToAttendanceRecords,
    unsubscribeAll,
    getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession
  }
}
