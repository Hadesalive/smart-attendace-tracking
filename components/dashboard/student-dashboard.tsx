"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { 
  BookOpenIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  QrCodeIcon,
  CameraIcon,
  EllipsisVerticalIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatTime, formatNumber } from "@/lib/utils"
import QrScannerComponent from "@/components/attendance/qr-scanner"
import { supabase } from "@/lib/supabase"

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

const STATS_CARDS = [
  { label: "Enrolled Courses", value: 0, icon: BookOpenIcon, color: "#8b5cf6" },
  { label: "Total Sessions", value: 0, icon: CalendarDaysIcon, color: "#10b981" },
  { label: "Attended", value: 0, icon: CheckCircleIcon, color: "#f59e0b" },
  { label: "Attendance Rate", value: "0%", icon: TrophyIcon, color: "#06b6d4" }
] as const

const QUICK_ACTIONS = [
  { name: "Scan QR Code", description: "Mark attendance", icon: QrCodeIcon, color: "#8b5cf6" },
  { name: "View Schedule", description: "Upcoming sessions", icon: CalendarDaysIcon, color: "#10b981" },
  { name: "Course Materials", description: "Access resources", icon: BookOpenIcon, color: "#f59e0b" },
  { name: "Attendance History", description: "View records", icon: ChartBarIcon, color: "#06b6d4" }
] as const

interface StudentStats {
  enrolledCourses: number
  totalSessions: number
  attendedSessions: number
  attendanceRate: number
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentDashboard({ userId }: { userId: string }) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    totalSessions: 0,
    attendedSessions: 0,
    attendanceRate: 0,
  })
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [isQrScannerOpen, setQrScannerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    if (userId) {
      fetchStudentData()
    }
  }, [userId])

  const fetchStudentData = useCallback(async () => {
    try {
      // Fetch enrolled courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses(*)
        `)
        // RLS policy handles filtering by student_id automatically

      // Fetch recent attendance records
      const { data: attendance } = await supabase
        .from("attendance_records")
        .select(`
          *,
          attendance_sessions(
            session_name,
            session_date,
            courses(course_code, course_name)
          )
        `)
        // RLS policy handles filtering by student_id automatically
        .order("marked_at", { ascending: false })
        .limit(10)

      // Fetch upcoming sessions for enrolled courses
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select(`
          *,
          courses(course_code, course_name, department)
        `)
        .gte("session_date", new Date().toISOString().split('T')[0])
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(5)

      // Calculate stats
      const totalSessions = 20 // This would be calculated from actual data
      const attendedSessions = attendance?.length || 0
      const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0

      setStats({
        enrolledCourses: enrollments?.length || 0,
        totalSessions,
        attendedSessions,
        attendanceRate: Math.min(attendanceRate, 100),
      })

      setEnrolledCourses(enrollments || [])
      setRecentAttendance(attendance || [])
      setUpcomingSessions(sessions || [])
    } catch (error) {
      console.error("Error fetching student data:", error)
    }
  }, [])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleQrScanSuccess = useCallback(() => {
    fetchStudentData()
    setQrScannerOpen(false)
  }, [fetchStudentData])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const statsCardsWithData = useMemo(() => {
    return STATS_CARDS.map(card => ({
      ...card,
      value: card.label === "Enrolled Courses" ? stats.enrolledCourses :
             card.label === "Total Sessions" ? stats.totalSessions :
             card.label === "Attended" ? stats.attendedSessions :
             `${stats.attendanceRate.toFixed(1)}%`
    }))
  }, [stats])

  const getSessionStatus = useCallback((session: any) => {
    const now = new Date()
    const sessionStart = new Date(`${session.session_date}T${session.start_time}`)
    const sessionEnd = new Date(`${session.session_date}T${session.end_time}`)
    
    if (now >= sessionStart && now <= sessionEnd) {
      return { label: 'Active', color: '#10b981' }
    } else if (now < sessionStart) {
      return { label: 'Upcoming', color: '#f59e0b' }
    } else {
      return { label: 'Completed', color: '#6b7280' }
    }
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ANIMATION_CONFIG.spring}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: "Poppins", 
                fontWeight: 700, 
                color: "#000",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                mb: 1
              }}
            >
              Student Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: "DM Sans", 
                color: "#6b7280",
                fontSize: "1rem"
              }}
            >
              Your academic progress and attendance overview
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<QrCodeIcon className="h-4 w-4" />}
            onClick={() => setQrScannerOpen(true)}
            sx={{
              backgroundColor: "#000",
              fontFamily: "DM Sans",
              textTransform: "none",
              "&:hover": { backgroundColor: "#1f2937" }
            }}
          >
            Scan QR Code
          </Button>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCardsWithData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 + (index * 0.05) }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: "8px", 
                          backgroundColor: `${stat.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <stat.icon style={{ width: 24, height: 24, color: stat.color }} />
                      </Box>
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 700, 
                        color: "#000",
                        mb: 0.5,
                        fontSize: "1.875rem"
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}
                    >
                      {stat.label}
                    </Typography>
                    {stat.label === "Attendance Rate" && (
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.attendanceRate} 
                        sx={{ 
                          mt: 2, 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: "#f3f4f6",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: stat.color
                          }
                        }} 
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "Poppins", 
            fontWeight: 600, 
            color: "#000",
            mb: 2
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {QUICK_ACTIONS.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={action.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 + (index * 0.1) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box 
                      sx={{ 
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: "12px", 
                          backgroundColor: `${action.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <action.icon style={{ width: 32, height: 32, color: action.color }} />
                      </Box>
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 600, 
                        color: "#000",
                        mb: 1,
                        fontSize: "1rem"
                      }}
                    >
                      {action.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}
                    >
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Enrolled Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "Poppins", 
            fontWeight: 600, 
            color: "#000",
            mb: 2
          }}
        >
          My Courses
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {enrolledCourses.map((enrollment, index) => (
            <Grid item xs={12} md={6} lg={4} key={enrollment.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: "8px", 
                          backgroundColor: "#8b5cf620",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <BookOpenIcon style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                      </Box>
                      <Chip 
                        label={`${enrollment.courses?.credits || 3} credits`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: "#f3f4f6", 
                          color: "#374151",
                          fontFamily: "DM Sans"
                        }} 
                      />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 600, 
                        color: "#000",
                        mb: 1,
                        fontSize: "1.125rem"
                      }}
                    >
                      {enrollment.courses?.course_code}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        mb: 3,
                        fontSize: "0.875rem"
                      }}
                    >
                      {enrollment.courses?.course_name}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          Department
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                          {enrollment.courses?.department}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          Attendance
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                          85%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: "#f3f4f6",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#10b981"
                        }
                      }} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Upcoming Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.4 }}
      >
        <Card sx={{ 
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: "Poppins", 
                  fontWeight: 600, 
                  color: "#000",
                  mb: 1
                }}
              >
                Upcoming Sessions
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans", 
                  color: "#6b7280",
                  mb: 2
                }}
              >
                Your scheduled classes and sessions
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Session
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Date & Time
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session, index) => {
                      const sessionStatus = getSessionStatus(session)
                      
                      return (
                        <motion.tr
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...ANIMATION_CONFIG.spring, delay: 0.4 + (index * 0.05) }}
                          component={TableRow}
                          sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}
                        >
                          <TableCell>
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: "DM Sans", 
                                  fontWeight: 600, 
                                  color: "#000",
                                  mb: 0.5
                                }}
                              >
                                {session.courses?.course_code}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontFamily: "DM Sans", 
                                  color: "#6b7280"
                                }}
                              >
                                {session.courses?.course_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                color: "#374151"
                              }}
                            >
                              {session.session_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: "DM Sans", 
                                  fontWeight: 600,
                                  color: "#000",
                                  mb: 0.5
                                }}
                              >
                                {formatDate(session.session_date)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontFamily: "DM Sans", 
                                  color: "#6b7280"
                                }}
                              >
                                {formatTime(`${session.session_date}T${session.start_time}`)} - {formatTime(`${session.session_date}T${session.end_time}`)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={sessionStatus.label} 
                              size="small"
                              sx={{ 
                                backgroundColor: `${sessionStatus.color}20`,
                                color: sessionStatus.color,
                                fontFamily: "DM Sans",
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                        </motion.tr>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans", 
                            color: "#6b7280"
                          }}
                        >
                          No upcoming sessions found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Scanner Dialog */}
      <Dialog 
        open={isQrScannerOpen} 
        onClose={() => setQrScannerOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#000" }}>
          Scan Attendance QR Code
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#6b7280",
              mb: 3
            }}
          >
            Point your camera at the QR code to mark your attendance.
          </Typography>
          <QrScannerComponent onScanSuccess={handleQrScanSuccess} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
