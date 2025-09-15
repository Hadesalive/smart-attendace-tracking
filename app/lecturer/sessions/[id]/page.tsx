"use client"

import React, { useState, useEffect } from "react"
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
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatTime } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Session {
  id: string
  title: string
  courseCode: string
  courseName: string
  type: "lecture" | "tutorial" | "lab" | "quiz" | "exam" | "seminar"
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  enrolled: number
  status: "draft" | "scheduled" | "active" | "completed" | "cancelled"
  description: string
  materials: string[]
  createdAt: string
  updatedAt: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  checkInTime: string
  status: "present" | "late" | "absent"
}

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
  lecture: { label: "Lecture", color: "#8b5cf6", icon: "📚" },
  tutorial: { label: "Tutorial", color: "#06b6d4", icon: "👥" },
  lab: { label: "Lab", color: "#f59e0b", icon: "🔬" },
  quiz: { label: "Quiz", color: "#ef4444", icon: "📝" },
  exam: { label: "Exam", color: "#6366f1", icon: "📋" },
  seminar: { label: "Seminar", color: "#10b981", icon: "🎯" }
}

const STATUS_COLORS = {
  draft: "#6b7280",
  scheduled: "#f59e0b",
  active: "#10b981", 
  completed: "#10b981",
  cancelled: "#ef4444"
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    studentId: "s1",
    studentName: "John Doe",
    studentEmail: "john.doe@student.edu",
    checkInTime: "2024-01-20T10:05:00Z",
    status: "present"
  },
  {
    id: "2",
    studentId: "s2",
    studentName: "Jane Smith",
    studentEmail: "jane.smith@student.edu",
    checkInTime: "2024-01-20T10:15:00Z",
    status: "late"
  },
  {
    id: "3",
    studentId: "s3",
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@student.edu",
    checkInTime: "",
    status: "absent"
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string

  // ============================================================================
  // STATE
  // ============================================================================
  
  const [session, setSession] = useState<Session | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance)
  const [loading, setLoading] = useState(true)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Mock session data - replace with actual API call
    const mockSession: Session = {
      id: sessionId,
      title: "Introduction to Database Design",
      courseCode: "CS301",
      courseName: "Database Systems",
      type: "lecture",
      date: "2024-01-20",
      startTime: "10:00",
      endTime: "11:30",
      location: "Room 201",
      capacity: 50,
      enrolled: 45,
      status: "scheduled",
      description: "This session covers advanced database design principles including normalization, indexing strategies, and query optimization techniques. Students will learn about entity-relationship modeling and best practices for database schema design.",
      materials: ["lecture-notes.pdf", "assignment-3.pdf", "sample-database.sql"],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    }
    
    setTimeout(() => {
      setSession(mockSession)
      setLoading(false)
    }, 500)
  }, [sessionId])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartSession = () => {
    if (session) {
      setSession({ ...session, status: "active" })
    }
  }

  const handleEndSession = () => {
    if (session) {
      setSession({ ...session, status: "completed" })
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
    const present = attendance.filter(a => a.status === 'present').length
    const late = attendance.filter(a => a.status === 'late').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const total = attendance.length
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

  const sessionType = SESSION_TYPES[session.type]
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
              {session.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              {session.courseCode} • {session.courseName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {session.status === 'scheduled' && (
              <MUIButton
                variant="contained"
                startIcon={<PlayIcon className="h-4 w-4" />}
                onClick={handleStartSession}
                sx={{ ...BUTTON_STYLES.primary, bgcolor: '#10b981' }}
              >
                Start Session
              </MUIButton>
            )}
            {session.status === 'active' && (
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
                    bgcolor: sessionType.color,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  sx={{ 
                    bgcolor: getStatusColor(session.status),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                  <Typography variant="body1">
                    {formatDate(session.date)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <Typography variant="body1">
                    {session.startTime} - {session.endTime}
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
                    {session.enrolled}/{session.capacity} students
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#000' }} />

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                  {session.description}
                </Typography>
              </Box>

              {session.materials.length > 0 && (
                <>
                  <Divider sx={{ my: 3, borderColor: '#000' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Session Materials
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {session.materials.map((material, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            p: 2,
                            border: '1px solid #000',
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'hsl(var(--muted) / 0.3)' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                            <Typography variant="body2">{material}</Typography>
                          </Box>
                          <IconButton size="small">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
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
                      bgcolor: stats.attendanceRate >= 80 ? '#10b981' : stats.attendanceRate >= 60 ? '#f59e0b' : '#ef4444'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography variant="body2">Present</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.present}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Typography variant="body2">Late</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.late}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
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
                {attendance.map((record) => (
                  <TableRow 
                    key={record.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'hsl(var(--muted) / 0.3)' },
                      '& td': { borderColor: '#000' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#f0f0f0' }}>
                          {record.studentName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {record.studentName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {record.studentEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        size="small"
                        sx={{ 
                          bgcolor: record.status === 'present' ? '#10b981' : 
                                   record.status === 'late' ? '#f59e0b' : '#ef4444',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MUICardContent>
        </MUICard>

        {/* QR Code Dialog */}
        <Dialog 
          open={showQRDialog} 
          onClose={() => setShowQRDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              border: '2px solid #000',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #000', textAlign: 'center' }}>
            QR Code for Attendance
          </DialogTitle>
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ 
              width: 200, 
              height: 200, 
              bgcolor: '#f0f0f0', 
              border: '2px solid #000',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <QrCodeIcon className="h-24 w-24 text-gray-400" />
            </Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {session.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              Students can scan this QR code to mark their attendance
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #000' }}>
            <MUIButton 
              onClick={() => setShowQRDialog(false)}
              sx={BUTTON_STYLES.outlined}
            >
              Close
            </MUIButton>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  )
}
