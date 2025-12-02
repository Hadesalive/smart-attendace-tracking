"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Alert
} from "@mui/material"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useAttendance, useCourses, useAuth, useAcademicStructure } from "@/lib/domains"
import { AttendanceSession, AttendanceRecord } from "@/lib/types/shared"
import { mapAttendanceStatus } from "@/lib/utils/statusMapping"

// Constants
const CARD_SX = {
  bgcolor: 'card',
  border: '1px solid',
  borderColor: '#000',
  borderRadius: 3,
  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  position: 'relative' as const,
  overflow: 'hidden' as const
}

const BUTTON_STYLES = {
  primary: {
    backgroundColor: 'hsl(var(--foreground))',
    color: 'hsl(var(--background))',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
  },
  outlined: {
    borderColor: '#000',
    color: 'hsl(var(--foreground))',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
  }
}

// Types
interface StudentAttendanceDetails {
  session: AttendanceSession | null
  studentRecord: AttendanceRecord | null
  loading: boolean
  error: string | null
}

export default function StudentAttendanceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string

  const attendance = useAttendance()
  const courses = useCourses()
  const auth = useAuth()
  const academic = useAcademicStructure()

  // Extract state and methods
  const {
    state: attendanceState,
    fetchAttendanceSessions,
    fetchStudentAttendanceSessions,
    fetchAttendanceRecords,
    getAttendanceRecordsBySession
  } = attendance

  const {
    state: coursesState,
    fetchCourses,
    fetchEnrollments
  } = courses

  const { state: authState } = auth
  const { state: academicState } = academic


  const [details, setDetails] = useState<StudentAttendanceDetails>({
    session: null,
    studentRecord: null,
    loading: true,
    error: null
  })
  
  const loadingRef = useRef(false)

  // Load required data and resolve session + student record
  useEffect(() => {
    const load = async () => {
      // Prevent multiple simultaneous loads
      if (loadingRef.current) return
      
      try {
        loadingRef.current = true
        setDetails(prev => ({ ...prev, loading: true, error: null }))
        
        console.log('🔄 Loading student attendance details for session:', sessionId)
        
        // Load current user first
        await auth.loadCurrentUser()
        
        // Wait for user to be loaded
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Load all required data with user ID
        const results = await Promise.allSettled([
          fetchCourses(),
          fetchEnrollments(),
          // Use section-based session fetching for students (only if user is logged in)
          authState.currentUser?.id ? fetchStudentAttendanceSessions(authState.currentUser.id) : Promise.resolve(),
          fetchAttendanceRecords()
        ])

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Failed to load student attendance detail data (${index}):`, result.reason)
          }
        })
        
        // Wait for state to be updated
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('📊 Loaded data:', {
          currentUser: authState.currentUser?.id,
          sessionsCount: attendanceState.attendanceSessions?.length || 0,
          recordsCount: attendanceState.attendanceRecords?.length || 0
        })

        const session = attendanceState.attendanceSessions.find((s: any) => s.id === sessionId)
        console.log('🔍 Looking for session:', sessionId, 'Found:', !!session)
        
        if (!session) {
          console.warn('⚠️ Session not found:', sessionId)
          setDetails(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Session not found' 
          }))
          return
        }

        const records = getAttendanceRecordsBySession(sessionId)
        const studentRecord = records.find((r: any) =>
          !!authState.currentUser?.id && r.student_id === authState.currentUser.id
        )

        console.log('📋 Student record found:', !!studentRecord)

        // ✅ ENHANCED: Calculate real enrolled count from section_enrollments
        const enrolledCount = academicState.sectionEnrollments?.filter((enrollment: any) =>
          enrollment.section_id === session.section_id &&
          enrollment.status === 'active'
        ).length || 0

        // Create session with real enrollment data
        const sessionWithRealData = {
          ...session,
          enrolled: enrolledCount, // ✅ Replace mock data with real count
          capacity: session.capacity || 50
        }

        setDetails({
          session: sessionWithRealData,
          studentRecord: studentRecord || null,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('❌ Error loading attendance details:', error)
        setDetails(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load attendance details' 
        }))
      } finally {
        loadingRef.current = false
      }
    }
    
    if (sessionId) {
      load()
    }
  }, [sessionId]) // Only depend on sessionId to prevent infinite loops

  // Separate effect to handle data updates when state changes
  useEffect(() => {
    if (attendanceState.attendanceSessions.length > 0 && sessionId) {
      const session = attendanceState.attendanceSessions.find((s: any) => s.id === sessionId)
      if (session && session !== details.session) {
        const records = getAttendanceRecordsBySession(sessionId)
        const studentRecord = records.find((r: any) => 
          !!authState.currentUser?.id && r.student_id === authState.currentUser.id
        )
        
        setDetails({
          session,
          studentRecord: studentRecord || null,
          loading: false,
          error: null
        })
      }
    }
  }, [attendanceState.attendanceSessions, authState.currentUser?.id, sessionId, details.session, getAttendanceRecordsBySession])

  const statusInfo = useMemo(() => {
    if (!details.studentRecord) return null
    
    const statuses = {
      present: { label: "Present", color: "#000000", icon: CheckCircleIcon },
      late: { label: "Late", color: "#333333", icon: ExclamationTriangleIcon },
      absent: { label: "Absent", color: "#666666", icon: XCircleIcon }
    }
    return statuses[details.studentRecord.status as keyof typeof statuses]
  }, [details.studentRecord])

  const sessionStatusInfo = useMemo(() => {
    if (!details.session) return null
    
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const todayDate = now.toISOString().split('T')[0]
    
    if (details.session.session_date < todayDate || 
        (details.session.session_date === todayDate && details.session.end_time < currentTime)) {
      return { label: "Completed", color: "#000000", icon: CheckCircleIcon }
    } else if (details.session.session_date === todayDate && 
               details.session.start_time <= currentTime && 
               details.session.end_time >= currentTime) {
      return { label: "Active", color: "#000000", icon: CheckCircleIcon }
    } else {
      return { label: "Upcoming", color: "#333333", icon: ClockIcon }
    }
  }, [details.session])

  const handleMarkAttendance = () => {
    router.push(`/student/scan-attendance?sessionId=${sessionId}`)
  }

  const handleBack = () => {
    router.push('/student/attendance')
  }

  if (details.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (details.error || !details.session) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 2 }}>
            {details.error || 'Session Not Found'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', mb: 4 }}>
            {details.error || 'The session you\'re looking for could not be found.'}
          </Typography>
          <MUIButton 
            variant="outlined"
            onClick={handleBack}
            sx={BUTTON_STYLES.outlined}
            startIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Attendance
          </MUIButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">{details.session.session_name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif' }}>
              {details.session.course_code} - {details.session.course_name}
            </Typography>
            {sessionStatusInfo && (
              <Chip 
                label={sessionStatusInfo.label}
                sx={{ 
                  bgcolor: sessionStatusInfo.color,
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid #000000'
                }}
              />
            )}
            {statusInfo && (
              <Chip 
                label={statusInfo.label}
                sx={{ 
                  bgcolor: statusInfo.color,
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid #000000'
                }}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined"
            onClick={handleBack}
            sx={BUTTON_STYLES.outlined}
            startIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back
          </MUIButton>
          {sessionStatusInfo?.label === "Active" && !details.studentRecord && (
            <MUIButton 
              variant="contained"
              startIcon={<QrCodeIcon className="h-4 w-4" />}
              onClick={handleMarkAttendance}
              sx={BUTTON_STYLES.primary}
            >
              Mark Attendance
            </MUIButton>
          )}
        </div>
      </div>

      {/* Session Info Card */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CalendarDaysIcon className="h-5 w-5" />
            Session Information
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3,
            mb: 3
          }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Date & Time
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {formatDate(details.session.session_date)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {details.session.start_time} - {details.session.end_time}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Location
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPinIcon className="h-4 w-4" />
                {(details.session as any).location || 'TBA'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Instructor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {details.session.lecturer_name || 'Instructor'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Capacity
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {details.session.enrolled || 0}/{details.session.capacity || 0} students
              </Typography>
            </Box>

            {statusInfo && (
              <Box>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                  Your Attendance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {React.createElement(statusInfo.icon, { 
                    className: "h-4 w-4", 
                    style: { color: statusInfo.color } 
                  })}
                  <Typography variant="body1" sx={{ fontWeight: 600, color: statusInfo.color }}>
                    {statusInfo.label}
                  </Typography>
                </Box>
                {details.studentRecord?.check_in_time && (
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mt: 0.5 }}>
                    Checked in at {new Date(details.studentRecord.check_in_time).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Attendance Status Card */}
      {details.studentRecord ? (
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600, 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CheckCircleIcon className="h-5 w-5" />
              Your Attendance Record
            </Typography>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
              gap: 3
            }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {statusInfo && React.createElement(statusInfo.icon, { 
                    className: "h-4 w-4", 
                    style: { color: statusInfo.color } 
                  })}
                  <Typography variant="body1" sx={{ fontWeight: 600, color: statusInfo?.color }}>
                    {statusInfo?.label}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                  Check-in Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {details.studentRecord.check_in_time ? 
                    new Date(details.studentRecord.check_in_time).toLocaleString() : 
                    'Not recorded'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                  Method Used
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {details.studentRecord.method_used?.replace('_', ' ').toUpperCase() || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </MUICardContent>
        </MUICard>
      ) : (
        <Alert severity="info" sx={{ 
          border: '1px solid #000',
          backgroundColor: 'hsl(var(--info) / 0.1)',
          borderRadius: 2,
          '& .MuiAlert-icon': { color: 'hsl(var(--info))' }
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            No Attendance Record
          </Typography>
          <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
            You haven't marked your attendance for this session yet. 
            {sessionStatusInfo?.label === "Active" && " You can mark it now using the QR code scanner."}
          </Typography>
        </Alert>
      )}

      {/* Session Description */}
      {details.session.description && (
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600, 
              mb: 2 
            }}>
              Session Description
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'hsl(var(--muted-foreground))', 
              lineHeight: 1.6,
              fontFamily: 'DM Sans, sans-serif'
            }}>
              {details.session.description}
            </Typography>
          </MUICardContent>
        </MUICard>
      )}
    </div>
  )
}
