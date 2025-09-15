"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  BellIcon,
  DocumentTextIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

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
interface StudentStats {
  totalCourses: number
  activeCourses: number
  completedAssignments: number
  pendingAssignments: number
  overallAttendanceRate: number
  averageGrade: number
  totalCredits: number
  achievements: number
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  instructor: string
  credits: number
  attendanceRate: number
  averageGrade: number
  nextSession?: {
    title: string
    date: string
    time: string
    location: string
  }
}

interface UpcomingSession {
  id: string
  title: string
  courseCode: string
  courseName: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: 'upcoming' | 'active' | 'completed'
  instructor: string
}

interface RecentActivity {
  id: string
  type: 'assignment' | 'attendance' | 'grade' | 'announcement'
  title: string
  description: string
  date: string
  status: 'success' | 'warning' | 'info'
  courseCode?: string
}


export default function StudentDashboardPage() {
  const router = useRouter()
  const [qrScannerOpen, setQrScannerOpen] = useState(false)

  // Mock data
  const studentStats: StudentStats = {
    totalCourses: 5,
    activeCourses: 5,
    completedAssignments: 23,
    pendingAssignments: 4,
    overallAttendanceRate: 92,
    averageGrade: 87,
    totalCredits: 18,
    achievements: 8
  }

  const courses: Course[] = [
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      credits: 3,
      attendanceRate: 95,
      averageGrade: 89,
      nextSession: {
        title: "Object-Oriented Programming",
        date: "2024-01-24T10:00:00",
        time: "10:00 - 11:30",
        location: "Room 101"
      }
    },
    {
      id: "2",
      courseCode: "MATH201",
      courseName: "Calculus II",
      instructor: "Prof. Johnson",
      credits: 4,
      attendanceRate: 88,
      averageGrade: 82,
      nextSession: {
        title: "Integration Techniques",
        date: "2024-01-24T14:00:00",
        time: "14:00 - 15:30",
        location: "Room 301"
      }
    },
    {
      id: "3",
      courseCode: "ENG101",
      courseName: "English Composition",
      instructor: "Dr. Brown",
      credits: 3,
      attendanceRate: 92,
      averageGrade: 91,
      nextSession: {
        title: "Research Methods",
        date: "2024-01-25T09:00:00",
        time: "09:00 - 10:30",
        location: "Room 205"
      }
    }
  ]

  const upcomingSessions: UpcomingSession[] = [
    {
      id: "1",
      title: "Object-Oriented Programming",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      date: "2024-01-24T10:00:00",
      startTime: "10:00",
      endTime: "11:30",
      location: "Room 101",
      status: "upcoming",
      instructor: "Dr. Smith"
    },
    {
      id: "2",
      title: "Integration Techniques",
      courseCode: "MATH201",
      courseName: "Calculus II", 
      date: "2024-01-24T14:00:00",
      startTime: "14:00",
      endTime: "15:30",
      location: "Room 301",
      status: "upcoming",
      instructor: "Prof. Johnson"
    },
    {
      id: "3",
      title: "Research Methods",
      courseCode: "ENG101",
      courseName: "English Composition",
      date: "2024-01-25T09:00:00",
      startTime: "09:00",
      endTime: "10:30",
      location: "Room 205",
      status: "upcoming",
      instructor: "Dr. Brown"
    }
  ]

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "assignment",
      title: "Data Structures Assignment Submitted",
      description: "Successfully submitted Assignment 3 for CS101",
      date: "2024-01-22T14:30:00",
      status: "success",
      courseCode: "CS101"
    },
    {
      id: "2",
      type: "attendance",
      title: "Attendance Marked",
      description: "Present for Calculus II lecture",
      date: "2024-01-22T09:00:00",
      status: "success",
      courseCode: "MATH201"
    },
    {
      id: "3",
      type: "grade",
      title: "Grade Received",
      description: "Received A- on English Composition essay",
      date: "2024-01-21T16:00:00",
      status: "success",
      courseCode: "ENG101"
    },
    {
      id: "4",
      type: "announcement",
      title: "New Course Material",
      description: "Physics I lecture notes uploaded",
      date: "2024-01-21T11:00:00",
      status: "info",
      courseCode: "PHYS101"
    }
  ]


  // Handlers
  const handleQrScan = () => {
    setQrScannerOpen(true)
  }

  const handleCloseQrScanner = () => {
    setQrScannerOpen(false)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpenIcon className="h-4 w-4" />
      case 'attendance':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'grade':
        return <StarIcon className="h-4 w-4" />
      case 'announcement':
        return <BellIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default" className="bg-blue-500">Upcoming</Badge>
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Dashboard</h1>
          <p className="text-muted-foreground font-dm-sans">Welcome back! Here's your academic overview</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Quick Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 1.5 }, 
            alignItems: 'center',
            flexShrink: 0
          }}>
            {[
              { icon: CalendarDaysIcon, bgColor: '#404040', hoverColor: '#000000', onClick: () => handleNavigate('/student/sessions'), title: 'View Sessions' },
              { icon: BookOpenIcon, bgColor: '#666666', hoverColor: '#404040', onClick: () => handleNavigate('/student/homework'), title: 'View Homework' },
              { icon: DocumentTextIcon, bgColor: '#999999', hoverColor: '#666666', onClick: () => handleNavigate('/student/materials'), title: 'View Materials' },
              { icon: ChartBarIcon, bgColor: '#BBBBBB', hoverColor: '#999999', onClick: () => handleNavigate('/student/attendance'), title: 'View Attendance' }
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5 * (index % 2 === 0 ? 1 : -1)
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Box
                  onClick={action.onClick}
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: '50%',
                    bgcolor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: action.hoverColor,
                      transform: 'scale(1.05)',
                      '& .hover-tooltip': {
                        opacity: 1,
                        visibility: 'visible'
                      }
                    }
                  }}
                  title={action.title}
                >
                  <action.icon style={{ width: 18, height: 18, color: '#ffffff' }} />
                  
                  {/* Hover Tooltip */}
                  <Box
                    className="hover-tooltip"
                    sx={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      mb: 1,
                      px: 2,
                      py: 1,
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      visibility: 'hidden',
                      transition: 'all 0.2s ease-in-out',
                      zIndex: 1000,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '4px solid transparent',
                        borderTopColor: '#000000'
                      }
                    }}
                  >
                    {action.title}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
          
          <MUIButton 
            variant="contained"
            startIcon={<QrCodeIcon className="h-4 w-4" />}
            onClick={handleQrScan}
            sx={BUTTON_STYLES.primary}
          >
            Mark Attendance
          </MUIButton>
        </div>
      </div>


      {/* KPI Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: 1
      }}>
        <StatCard 
          title="Active Courses" 
          value={formatNumber(studentStats.activeCourses)} 
          icon={BookOpenIcon} 
          color="#000000" 
          change={`${studentStats.totalCredits} credits`} 
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${studentStats.overallAttendanceRate}%`} 
          icon={CheckCircleIcon} 
          color="#000000" 
          change="Overall" 
        />
        <StatCard 
          title="Average Grade" 
          value={`${studentStats.averageGrade}%`} 
          icon={ChartBarIcon} 
          color="#000000" 
          change="All courses" 
        />
        <StatCard 
          title="Pending Tasks" 
          value={formatNumber(studentStats.pendingAssignments)} 
          icon={ClockIcon} 
          color="#000000" 
          change="Assignments" 
        />
      </Box>


      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, alignItems: 'start' }}>
        {/* Left Column */}
        <div className="space-y-6">
          {/* My Courses */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <BookOpenIcon className="h-5 w-5" />
                  My Courses ({courses.length})
                </Typography>
                <MUIButton
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowRightIcon className="h-4 w-4" />}
                  onClick={() => handleNavigate('/student/courses')}
                  sx={BUTTON_STYLES.outlined}
                >
                  View All
                </MUIButton>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {courses.slice(0, 3).map((course) => (
                  <Box key={course.id} sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    p: 2,
                    border: '1px solid #000',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'hsl(var(--muted) / 0.1)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleNavigate('/student/courses')}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {course.courseCode} - {course.courseName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                        {course.instructor} • {course.credits} Credits
                      </Typography>
                      {course.nextSession && (
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Next: {course.nextSession.title} - {formatDate(course.nextSession.date)}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', sm: 'column' },
                      alignItems: 'center', 
                      gap: 1,
                      minWidth: 100
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                          {course.attendanceRate}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Attendance
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                          {course.averageGrade}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Grade
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </MUICardContent>
          </MUICard>

          {/* Upcoming Sessions */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CalendarDaysIcon className="h-5 w-5" />
                    Upcoming Sessions
                  </Typography>
                  <MUIButton
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowRightIcon className="h-4 w-4" />}
                    onClick={() => handleNavigate('/student/sessions')}
                    sx={BUTTON_STYLES.outlined}
                  >
                    View All
                  </MUIButton>
                </Box>
              </Box>
              
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    '& .MuiTableCell-root': { 
                      borderColor: '#000',
                      backgroundColor: 'hsl(var(--muted) / 0.3)',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }
                  }}>
                    <TableCell>Session</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <TableRow key={session.id} sx={{ 
                      '& .MuiTableCell-root': { borderColor: '#000' },
                      '&:hover': { 
                        backgroundColor: 'hsl(var(--muted) / 0.1)',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleNavigate(`/student/sessions/${session.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {session.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {session.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {session.courseCode}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {session.courseName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(session.date)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {session.startTime} - {session.endTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(session.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </MUICardContent>
          </MUICard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <ClockIcon className="h-5 w-5" />
                Recent Activity
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.slice(0, 5).map((activity) => (
                  <Box key={activity.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    p: 2,
                    border: '1px solid #000',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'hsl(var(--muted) / 0.1)'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'hsl(var(--muted))',
                      border: '1px solid #000'
                    }}>
                      <Box className={getActivityColor(activity.status)}>
                        {getActivityIcon(activity.type)}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'hsl(var(--muted-foreground))', 
                        display: 'block',
                        mb: 0.5
                      }}>
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {activity.courseCode && (
                          <Chip label={activity.courseCode} size="small" />
                        )}
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {formatDate(activity.date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </MUICardContent>
          </MUICard>

          {/* Academic Progress */}
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
                <TrophyIcon className="h-5 w-5" />
                Academic Progress
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 2,
                mb: 4,
                p: 2,
                bgcolor: 'hsl(var(--muted) / 0.3)',
                borderRadius: 2,
                border: '1px solid #000'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    {studentStats.averageGrade}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                    Avg Grade
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    {studentStats.overallAttendanceRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                    Attendance
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    {studentStats.completedAssignments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                    Completed
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    {studentStats.achievements}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                    Achievements
                  </Typography>
                </Box>
              </Box>

              <MUIButton
                variant="outlined"
                fullWidth
                endIcon={<ArrowRightIcon className="h-4 w-4" />}
                onClick={() => handleNavigate('/student/profile')}
                sx={BUTTON_STYLES.outlined}
              >
                View Full Profile
              </MUIButton>
            </MUICardContent>
          </MUICard>
        </div>
      </Box>

      {/* QR Scanner Dialog */}
      <Dialog 
        open={qrScannerOpen} 
        onClose={handleCloseQrScanner}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: '2px solid #000',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: 600,
          borderBottom: '1px solid #000'
        }}>
          Mark Attendance
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ 
            color: 'hsl(var(--muted-foreground))', 
            mb: 3,
            textAlign: 'center'
          }}>
            Position your camera towards the QR code displayed by your instructor to mark your attendance.
          </Typography>
          <Box sx={{ 
            height: 300, 
            bgcolor: 'hsl(var(--muted) / 0.3)', 
            borderRadius: 2,
            border: '2px dashed #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <QrCodeIcon className="h-16 w-16 text-muted-foreground opacity-50" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #000' }}>
          <MUIButton 
            onClick={handleCloseQrScanner}
            sx={BUTTON_STYLES.outlined}
          >
            Cancel
          </MUIButton>
          <MUIButton 
            variant="contained"
            onClick={() => {
              // Simulate successful scan
              handleCloseQrScanner()
              handleNavigate('/student/scan-attendance')
            }}
            sx={BUTTON_STYLES.primary}
          >
            Open Scanner
          </MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
