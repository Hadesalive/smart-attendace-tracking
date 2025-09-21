"use client"

import React, { useState, useEffect } from "react"
import { Box, Typography, Card, CardContent, Button, Alert, Chip } from "@mui/material"
import { QrCodeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { toast } from "sonner"
import MobileQrScanner from "@/components/attendance/mobile-qr-scanner-new"
import { useAttendance, useAuth } from "@/lib/domains"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function StudentScanAttendancePage() {
  const attendance = useAttendance()
  const auth = useAuth()
  const { markAttendanceSupabase, state } = attendance
  const { state: authState } = auth
  const searchParams = useSearchParams()
  const sessionIdFromUrl = searchParams.get('sessionId')
  
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    sessionId?: string
    courseName?: string
  } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleQrScan = async (data: string) => {
    console.log('QR Code scanned:', data)
    setLoading(true)
    
    try {
      let sessionId: string
      let sessionData: any = null
      
      // Handle URL format QR codes (like /attend/session123)
      if (data.includes('/attend/')) {
        const url = new URL(data, window.location.origin)
        const pathParts = url.pathname.split('/')
        const sessionIdIndex = pathParts.indexOf('attend') + 1
        sessionId = pathParts[sessionIdIndex]
        
        if (!sessionId) {
          throw new Error('Invalid QR code - session ID not found in URL')
        }
      } 
      // Handle JSON format QR codes (legacy support)
      else if (data.startsWith('{')) {
        sessionData = JSON.parse(data)
        
        if (!sessionData.session_id || sessionData.type !== 'attendance') {
          throw new Error('Invalid attendance QR code')
        }
        
        sessionId = sessionData.session_id
      } else {
        throw new Error('Invalid QR code format - expected URL or JSON data')
      }
      
      // Fetch session directly from database instead of relying on local state
      console.log('Fetching session from database:', sessionId)
      
      const { data: dbSessionData, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select(`
          id,
          course_id,
          session_name,
          session_date,
          start_time,
          end_time,
          status,
          is_active
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError || !dbSessionData) {
        console.error('Session not found in database:', { sessionId, error: sessionError })
        throw new Error('Session not found or no longer active')
      }
      
      console.log('Found session in database:', dbSessionData)
      
      // Fetch course information separately
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('course_code, course_name')
        .eq('id', dbSessionData.course_id)
        .single()

      console.log('Course data:', { courseData, courseError })
      
      // Check if user is enrolled in this course
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', authState.currentUser?.id)
        .eq('course_id', dbSessionData.course_id)
        .single()

      console.log('Enrollment check:', { 
        courseId: dbSessionData.course_id, 
        userId: authState.currentUser?.id, 
        enrollment,
        enrollmentError
      })
      
      if (enrollmentError || !enrollment) {
        throw new Error('You are not enrolled in this course')
      }
      
      // Mark attendance using Supabase
      if (!authState.currentUser?.id) {
        throw new Error('User not authenticated')
      }
      
      console.log('About to call markAttendanceSupabase with:', {
        sessionId,
        studentId: authState.currentUser.id,
        method: 'qr_code'
      })
      
      await markAttendanceSupabase(sessionId, authState.currentUser.id, 'qr_code')
      
      setScanResult({
        success: true,
        message: 'Attendance marked successfully!',
        sessionId: sessionId,
        courseName: courseData?.course_name || 'Unknown Course'
      })
      
      toast.success('Attendance marked successfully!')
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setScanResult(null)
      }, 3000)
      
    } catch (error) {
      console.error('Error marking attendance:', error)
      
      // Extract more detailed error message
      let errorMessage = 'Failed to mark attendance. Please try again.'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase function errors
        const errorObj = error as any
        if (errorObj.error) {
          errorMessage = errorObj.error
        } else if (errorObj.message) {
          errorMessage = errorObj.message
        }
      }
      
      setScanResult({
        success: false,
        message: errorMessage
      })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanResult(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <QrCodeIcon style={{ width: 64, height: 64, color: '#000', margin: '0 auto 16px' }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 700, 
                color: '#000',
                mb: 1
              }}
            >
              Mark Attendance
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif', 
                color: '#666',
                maxWidth: 400,
                mx: 'auto'
              }}
            >
              Scan the QR code displayed by your lecturer to mark your attendance
            </Typography>
          </Box>
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ 
            bgcolor: 'white', 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 600, 
                  mb: 2,
                  color: '#000'
                }}
              >
                How to mark attendance:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#000', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    1
                  </Box>
                  <Typography sx={{ fontFamily: 'DM Sans, sans-serif', color: '#333' }}>
                    Wait for your lecturer to display the QR code
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#000', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    2
                  </Box>
                  <Typography sx={{ fontFamily: 'DM Sans, sans-serif', color: '#333' }}>
                    Tap the "Scan QR Code" button below
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#000', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    3
                  </Box>
                  <Typography sx={{ fontFamily: 'DM Sans, sans-serif', color: '#333' }}>
                    Point your camera at the QR code
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scan Result */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity={scanResult.success ? "success" : "error"}
              sx={{ 
                borderRadius: 3,
                '& .MuiAlert-message': {
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500
                }
              }}
              icon={scanResult.success ? <CheckCircleIcon style={{ width: 20, height: 20 }} /> : <XCircleIcon style={{ width: 20, height: 20 }} />}
            >
              {scanResult.message}
              {scanResult.courseName && (
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={scanResult.courseName} 
                    size="small" 
                    sx={{ 
                      bgcolor: scanResult.success ? '#000000' : '#666666',
                      color: 'white',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      border: '1px solid #000000'
                    }} 
                  />
                </Box>
              )}
            </Alert>
          </motion.div>
        )}

        {/* Scan Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={startScanning}
              disabled={isScanning}
              sx={{
                bgcolor: '#000',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                minWidth: 200,
                minHeight: 56,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#111'
                },
                '&:disabled': {
                  bgcolor: '#ccc',
                  color: '#666'
                }
              }}
            >
              {isScanning ? 'Scanning...' : 'Scan QR Code'}
            </Button>
          </Box>
        </motion.div>

        {/* Mobile QR Scanner */}
        <MobileQrScanner
          isOpen={isScanning}
          onClose={stopScanning}
          onScan={handleQrScan}
          loading={loading}
          scanResult={scanResult}
        />
      </div>
    </div>
  )
}
