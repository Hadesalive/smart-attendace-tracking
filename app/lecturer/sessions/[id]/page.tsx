"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Box,
  Typography,
  Card as MUICard,
  CardContent as MUICardContent,
  Button as MUIButton,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  LinearProgress
} from "@mui/material"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatTime, formatNumber } from "@/lib/utils"
import { QRCodeCanvas } from 'qrcode.react'
import { useAttendance, useCourses, useAcademicStructure } from "@/lib/domains"
import SessionQrCodeDialog from "@/components/attendance/session-qr-code-dialog-new"
// Mock data removed - using DataContext
import { AttendanceSession, AttendanceRecord } from "@/lib/types/shared"
import { mapSessionStatus, mapAttendanceStatus } from "@/lib/utils/statusMapping"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Using shared types from DataContext

// ============================================================================
// CONSTANTS
// ============================================================================

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

const SESSION_TYPES = {
  lecture: { label: "Lecture", color: "#000000", icon: "📚" },
  tutorial: { label: "Tutorial", color: "#000000", icon: "👥" },
  lab: { label: "Lab", color: "#000000", icon: "🔬" },
  quiz: { label: "Quiz", color: "#000000", icon: "📝" },
  exam: { label: "Exam", color: "#000000", icon: "📋" },
  seminar: { label: "Seminar", color: "#000000", icon: "🎯" }
}

const STATUS_COLORS = {
  draft: "#666666",
  scheduled: "#333333",
  active: "#000000", 
  completed: "#000000",
  cancelled: "#999999"
}

// ============================================================================
// MOCK DATA
// ============================================================================

// Mock attendance data removed - using shared data from DataContext

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string

  // ============================================================================
  // DATA CONTEXT
  // ============================================================================
  
  const attendanceHook = useAttendance()
  const courses = useCourses()
  const academic = useAcademicStructure()
  
  // Extract state and methods
  const { 
    state: attendanceState,
    getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession,
    updateAttendanceSessionSupabase,
    subscribeToAttendanceSessions,
    subscribeToAttendanceRecords,
    unsubscribeAll
  } = attendanceHook
  
  const { state: coursesState } = courses
  const { state: academicState } = academic
  
  // Direct state access - NO STATE MERGING

  // ============================================================================
  // STATE
  // ============================================================================
  
  const [session, setSession] = useState<AttendanceSession | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  const loadingRef = useRef(false)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId || loadingRef.current) return
      
      try {
        loadingRef.current = true
        setLoading(true)
        console.log('🔄 Loading lecturer session details for:', sessionId)
        
        // Load all required data first
        const results = await Promise.allSettled([
          attendanceHook.fetchAttendanceSessions(),
          attendanceHook.fetchAttendanceRecords(),
          courses.fetchCourses(),
          courses.fetchLecturerAssignments(),
          academic.fetchSectionEnrollments() // ✅ Load section enrollments for real count
        ])
        
        // Wait for state to be updated
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('📊 Loaded data:', {
          sessionsCount: attendanceState.attendanceSessions?.length || 0,
          recordsCount: attendanceState.attendanceRecords?.length || 0
        })
        
        // Find session from shared data
        const foundSession = attendanceState.attendanceSessions.find((s: any) => s.id === sessionId)
        console.log('🔍 Looking for session:', sessionId, 'Found:', !!foundSession)
        
        if (foundSession) {
          setSession(foundSession)
          
          // Get attendance records for this session
          const records = getAttendanceRecordsBySession(sessionId)
          setAttendanceRecords(records)
          console.log('📋 Attendance records found:', records.length)
        } else {
          console.warn('⚠️ Session not found:', sessionId)
        }
      } catch (error) {
        console.error('❌ Error loading session data:', error)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    }
    
    loadSessionData()
  }, [sessionId]) // Only depend on sessionId to prevent infinite loops

  // Separate effect to handle data updates when state changes
  useEffect(() => {
    if (attendanceState.attendanceSessions.length > 0 && sessionId && !session) {
      const foundSession = attendanceState.attendanceSessions.find((s: any) => s.id === sessionId)
      if (foundSession) {
        setSession(foundSession)
        
        // Get attendance records for this session
        const records = getAttendanceRecordsBySession(sessionId)
        setAttendanceRecords(records)
        console.log('📋 Session and records updated:', {
          session: foundSession.session_name,
          recordsCount: records.length
        })
      }
    }
  }, [attendanceState.attendanceSessions, sessionId, session, getAttendanceRecordsBySession])

  // Subscribe to real-time updates
  useEffect(() => {
    if (sessionId) {
      // Subscribe to session changes
      subscribeToAttendanceSessions()
      
      // Subscribe to attendance record changes for this session
      subscribeToAttendanceRecords(sessionId)
      
      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeAll()
      }
    }
  }, [sessionId]) // Removed function dependencies

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartSession = async () => {
    if (session) {
      try {
        await updateAttendanceSessionSupabase(session.id, { 
          status: "active",
          is_active: true 
        })
        setSession({ ...session, status: "active", is_active: true })
      } catch (error) {
        console.error("Error starting session:", error)
      }
    }
  }

  const handleEndSession = async () => {
    if (session) {
      try {
        await updateAttendanceSessionSupabase(session.id, { 
          status: "completed",
          is_active: false 
        })
        setSession({ ...session, status: "completed", is_active: false })
      } catch (error) {
        console.error("Error ending session:", error)
      }
    }
  }

  const handleEditSession = () => {
    setShowEditDialog(true)
  }

  const handleDeleteSession = () => {
    // Delete session logic
    router.push('/lecturer/sessions')
  }

  const handleShowQR = () => {
    setShowQRDialog(true)
  }

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280"
  }

  const getAttendanceStats = () => {
    const present = attendanceRecords.filter((a: any) => mapAttendanceStatus(a.status, 'lecturer') === 'present').length
    const late = attendanceRecords.filter((a: any) => mapAttendanceStatus(a.status, 'lecturer') === 'late').length
    const absent = attendanceRecords.filter((a: any) => mapAttendanceStatus(a.status, 'lecturer') === 'absent').length
    const total = attendanceRecords.length
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    
    return { present, late, absent, total, attendanceRate }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 400 
      }}>
        <Typography variant="h6">Loading session details...</Typography>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 400 
      }}>
        <Typography variant="h6">Session not found</Typography>
      </Box>
    )
  }

  const sessionType = SESSION_TYPES[session.type as keyof typeof SESSION_TYPES] || SESSION_TYPES.lecture
  const stats = getAttendanceStats()

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'transparent'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => router.back()}
            sx={{ mr: 2, border: '1px solid #000' }}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 700, 
                mb: 0.5
              }}
            >
              {session.session_name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              {session.course_code} • {session.course_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {mapSessionStatus(session.status, 'lecturer') === 'scheduled' && (
              <MUIButton
                variant="contained"
                startIcon={<PlayIcon className="h-4 w-4" />}
                onClick={handleStartSession}
                sx={BUTTON_STYLES.primary}
              >
                Start Session
              </MUIButton>
            )}
            {mapSessionStatus(session.status, 'lecturer') === 'active' && (
              <>
                <MUIButton
                  variant="contained"
                  startIcon={<QrCodeIcon className="h-4 w-4" />}
                  onClick={handleShowQR}
                  sx={BUTTON_STYLES.primary}
                >
                  Show QR Code
                </MUIButton>
                <MUIButton
                  variant="outlined"
                  startIcon={<StopIcon className="h-4 w-4" />}
                  onClick={handleEndSession}
                  sx={BUTTON_STYLES.outlined}
                >
                  End Session
                </MUIButton>
              </>
            )}
            <IconButton onClick={handleEditSession} sx={{ border: '1px solid #000' }}>
              <PencilIcon className="h-5 w-5" />
            </IconButton>
          </Box>
        </Box>

        {/* Session Info */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Main Info */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Chip 
                  label={sessionType.label}
                  sx={{ 
                    bgcolor: '#000000',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid #000000'
                  }}
                />
                <Chip 
                  label={mapSessionStatus(session.status, 'lecturer')?.charAt(0).toUpperCase() + mapSessionStatus(session.status, 'lecturer')?.slice(1) || 'Unknown'}
                  sx={{ 
                    bgcolor: getStatusColor(session.status),
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid #000000'
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                  <Typography variant="body1">
                    {formatDate(session.session_date)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <Typography variant="body1">
                    {session.start_time} - {session.end_time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MapPinIcon className="h-5 w-5 text-gray-500" />
                  <Typography variant="body1">
                    {session.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <UsersIcon className="h-5 w-5 text-gray-500" />
                  <Typography variant="body1">
                    {/* ✅ ENHANCED: Show real enrollment count from section_enrollments */}
                    {academicState.sectionEnrollments?.filter((e: any) => 
                      e.section_id === session.section_id && 
                      e.status === 'active'
                    ).length || 0} students enrolled • {attendanceRecords.length} checked in
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#000' }} />

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                  {session.description || "No description provided for this session."}
                </Typography>
              </Box>
            </MUICardContent>
          </MUICard>

          {/* Attendance Stats */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChartBarIcon className="h-5 w-5" />
                Attendance Overview
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Attendance Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.attendanceRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.attendanceRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'hsl(var(--muted))',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#000000'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#000000' }} />
                    <Typography variant="body2">Present</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.present}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#333333' }} />
                    <Typography variant="body2">Late</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.late}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#666666' }} />
                    <Typography variant="body2">Absent</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.absent}
                  </Typography>
                </Box>
              </Box>
            </MUICardContent>
          </MUICard>
        </Box>

        {/* Attendance Table */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Student Attendance
              </Typography>
            </Box>
            {attendanceRecords.length === 0 ? (
              <Box sx={{
                p: 6,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <QrCodeIcon className="h-16 w-16" style={{ color: 'hsl(var(--muted-foreground))' }} />
                <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  No attendance yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  Ask students to scan the session QR code to check in
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { borderColor: '#000' } }}>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-in Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record: any) => (
                    <TableRow 
                      key={record.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'hsl(var(--muted) / 0.3)' },
                        '& td': { borderColor: '#000' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: '#f0f0f0',
                            color: '#000000',
                            border: '1px solid #000000'
                          }}>
                            {record.student_name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.student_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {record.student_email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={mapAttendanceStatus(record.status, 'lecturer')?.charAt(0).toUpperCase() + mapAttendanceStatus(record.status, 'lecturer')?.slice(1) || 'Unknown'}
                          size="small"
                          sx={{ 
                            bgcolor: mapAttendanceStatus(record.status, 'lecturer') === 'present' ? '#000000' : 
                                     mapAttendanceStatus(record.status, 'lecturer') === 'late' ? '#333333' : '#666666',
                            color: 'white',
                            fontWeight: 600,
                            border: '1px solid #000000'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </MUICardContent>
        </MUICard>

        {/* QR Code Dialog */}
        <SessionQrCodeDialog
          isOpen={showQRDialog}
          onOpenChange={setShowQRDialog}
          session={session ? {
            id: session.id,
            course_name: session.course_name,
            session_name: session.session_name,
            session_date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time
          } : null}
        />
      </motion.div>
    </Box>
  )
}
