"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Box, Typography, Card, CardContent, Button, Alert, Chip } from "@mui/material"
import { QrCodeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAttendance } from "@/lib/domains"
import { supabase } from "@/lib/supabase"

interface AttendanceResult {
  success: boolean
  message: string
  sessionId?: string
  courseName?: string
}

export default function AttendSessionPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const attendance = useAttendance()
  const { markAttendanceSupabase, state, getSessionTimeStatus } = attendance
  const sessionId = params.sessionId as string
  const token = searchParams.get('token') // ✅ Extract token from URL
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AttendanceResult | null>(null)
  const [session, setSession] = useState<any>(null)
  const [sessionStatus, setSessionStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming')

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return

      try {
        // Fetch session data directly from database
        const { data: sessionData, error } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (error || !sessionData) {
          console.error('Error fetching session:', error)
          setResult({
            success: false,
            message: 'Session not found or no longer active'
          })
          return
        }

        // Fetch course information separately
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('course_code, course_name, lecturer_id')
          .eq('id', sessionData.course_id)
          .single()

        // Fetch lecturer information separately
        let lecturerName = 'Unknown Lecturer'
        if (courseData?.lecturer_id) {
          const { data: lecturerData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', courseData.lecturer_id)
            .single()
          lecturerName = lecturerData?.full_name || 'Unknown Lecturer'
        }

        // Transform the data to match expected format
        const transformedSession = {
          id: sessionData.id,
          course_id: sessionData.course_id,
          section_id: sessionData.section_id, // ✅ FIXED: Include section_id
          course_code: courseData?.course_code || 'Unknown',
          course_name: courseData?.course_name || 'Unknown Course',
          session_name: sessionData.session_name,
          session_date: sessionData.session_date,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          lecturer_name: lecturerName,
          attendance_method: sessionData.attendance_method,
          status: sessionData.status,
          is_active: sessionData.is_active
        }

        setSession(transformedSession)
        
        // Calculate session status based on time
        const now = new Date()
        const startTime = new Date(`${sessionData.session_date}T${sessionData.start_time}`)
        const endTime = new Date(`${sessionData.session_date}T${sessionData.end_time}`)
        
        if (now > endTime) {
          setSessionStatus('completed')
        } else if (now >= startTime && now <= endTime) {
          setSessionStatus('active')
        } else {
          setSessionStatus('upcoming')
        }

      } catch (error) {
        console.error('Error fetching session:', error)
        setResult({
          success: false,
          message: 'Failed to load session data'
        })
      }
    }

    fetchSession()
  }, [sessionId])

  const handleMarkAttendance = async () => {
    if (!session) {
      setResult({
        success: false,
        message: 'Session not found'
      })
      return
    }

    if (sessionStatus !== 'active') {
      setResult({
        success: false,
        message: `Attendance can only be marked during active sessions. Current status: ${sessionStatus}`
      })
      return
    }

    setLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('You must be logged in to mark attendance. Please log in and try again.')
      }

      // ✅ IMPROVED: Use edge function for consistent validation (includes token validation)
      console.log('Marking attendance via edge function:', { 
        sessionId, 
        userId: user.id, 
        hasToken: !!token 
      })
      
      await markAttendanceSupabase(sessionId, user.id, 'qr_code', token || undefined)
      
      setResult({
        success: true,
        message: 'Attendance marked successfully!',
        sessionId: sessionId,
        courseName: session.course_name
      })
      
      toast.success('Attendance marked successfully!')
      
    } catch (error: any) {
      console.error('Error marking attendance:', error)
      
      // Extract error message from various formats
      let errorMessage = 'Failed to mark attendance'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        if (error.error) {
          errorMessage = error.error
        } else if (error.message) {
          errorMessage = error.message
        }
      }
      
      setResult({
        success: false,
        message: errorMessage
      })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'upcoming': return 'info'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-5 w-5" />
      case 'upcoming': return <ClockIcon className="h-5 w-5" />
      case 'completed': return <XCircleIcon className="h-5 w-5" />
      default: return <ClockIcon className="h-5 w-5" />
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 500 }}
      >
        <Card sx={{ 
          border: '2px solid #000',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <QrCodeIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <Typography variant="h4" sx={{ 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                mb: 1
              }}>
                Mark Attendance
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Scan QR code to mark your attendance
              </Typography>
            </Box>

            {/* Session Info */}
            {session && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  mb: 2
                }}>
                  {session.course_code} - {session.course_name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {session.session_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {new Date(session.session_date).toLocaleDateString()} • {session.start_time} - {session.end_time}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  {getStatusIcon(sessionStatus)}
                  <Chip 
                    label={sessionStatus.charAt(0).toUpperCase() + sessionStatus.slice(1)}
                    color={getStatusColor(sessionStatus) as any}
                    size="small"
                  />
                </Box>
              </Box>
            )}

            {/* Result Display */}
            {result && (
              <Alert 
                severity={result.success ? 'success' : 'error'} 
                sx={{ mb: 3 }}
                icon={result.success ? <CheckCircleIcon /> : <XCircleIcon />}
              >
                {result.message}
              </Alert>
            )}

            {/* Action Button */}
            {session && !result && (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleMarkAttendance}
                  disabled={loading || sessionStatus !== 'active'}
                  sx={{
                    bgcolor: sessionStatus === 'active' ? 'success.main' : 'grey.400',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: sessionStatus === 'active' ? 'success.dark' : 'grey.500'
                    }
                  }}
                >
                  {loading ? 'Marking Attendance...' : 
                   sessionStatus === 'active' ? 'Mark Attendance' :
                   sessionStatus === 'upcoming' ? 'Session Not Started' :
                   'Session Ended'}
                </Button>
              </Box>
            )}

            {/* Instructions */}
            {sessionStatus === 'active' && !result && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Click the button above to mark your attendance for this session.
                </Typography>
              </Box>
            )}

            {/* Back Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{
                  borderColor: '#000',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#000',
                    bgcolor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Go Back
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  )
}