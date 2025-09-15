"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  UsersIcon, 
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  ChartBarIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

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

const LIST_CARD_SX = {
  ...CARD_SX,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderColor: '#000',
  }
}

const BUTTON_STYLES = {
  primary: {
    backgroundColor: 'hsl(var(--foreground))',
    color: 'hsl(var(--background))',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { 
      backgroundColor: 'hsl(var(--foreground) / 0.9)' 
    }
  },
  outlined: {
    borderColor: '#000',
    color: 'hsl(var(--foreground))',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': {
      borderColor: '#000',
      backgroundColor: 'hsl(var(--muted))',
    }
  }
}

const INPUT_STYLES = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'hsl(var(--border))' },
    '&:hover fieldset': { borderColor: '#000' },
    '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
  },
  '& .MuiInputLabel-root': {
    color: 'hsl(var(--muted-foreground))',
    '&.Mui-focused': { color: '#000' },
  },
  '& .MuiSelect-select': {
    color: 'hsl(var(--foreground))',
    padding: '12px 14px',
    lineHeight: '1.5',
  },
}

// ============================================================================
// TYPES
// ============================================================================

interface StudentSession {
  id: string
  title: string
  courseCode: string
  courseName: string
  type: "lecture" | "tutorial" | "lab" | "quiz" | "exam" | "seminar"
  date: string
  startTime: string
  endTime: string
  location: string
  instructor: string
  status: "upcoming" | "active" | "completed" | "missed"
  attendanceStatus: "present" | "absent" | "late" | "pending"
  sessionCode?: string
  materials?: string[]
  description?: string
  capacity: number
  enrolled: number
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  instructor: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentSessionsPage() {
  const router = useRouter()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [statusTab, setStatusTab] = useState<"all" | "upcoming" | "active" | "completed">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<StudentSession | null>(null)

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const courses: Course[] = [
    { id: "1", courseCode: "CS101", courseName: "Introduction to Computer Science", instructor: "Dr. Smith" },
    { id: "2", courseCode: "MATH201", courseName: "Calculus II", instructor: "Prof. Johnson" },
    { id: "3", courseCode: "ENG101", courseName: "English Composition", instructor: "Dr. Brown" },
    { id: "4", courseCode: "PHYS101", courseName: "Physics I", instructor: "Dr. Wilson" },
  ]

  const sessions: StudentSession[] = [
    {
      id: "1",
      title: "Introduction to Programming",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      type: "lecture",
      date: "2024-01-22T10:00:00",
      startTime: "10:00",
      endTime: "11:30",
      location: "Room 101",
      instructor: "Dr. Smith",
      status: "upcoming",
      attendanceStatus: "pending",
      sessionCode: "CS101-001",
      capacity: 50,
      enrolled: 45,
      description: "Basic programming concepts and syntax"
    },
    {
      id: "2",
      title: "Data Structures Lab",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      type: "lab",
      date: "2024-01-22T14:00:00",
      startTime: "14:00",
      endTime: "16:00",
      location: "Lab 201",
      instructor: "Dr. Smith",
      status: "active",
      attendanceStatus: "pending",
      sessionCode: "CS101-LAB-002",
      capacity: 25,
      enrolled: 23
    },
    {
      id: "3",
      title: "Derivatives and Applications",
      courseCode: "MATH201",
      courseName: "Calculus II",
      type: "lecture",
      date: "2024-01-21T09:00:00",
      startTime: "09:00",
      endTime: "10:30",
      location: "Room 301",
      instructor: "Prof. Johnson",
      status: "completed",
      attendanceStatus: "present",
      capacity: 60,
      enrolled: 55
    },
    {
      id: "4",
      title: "Integration Techniques",
      courseCode: "MATH201",
      courseName: "Calculus II",
      type: "tutorial",
      date: "2024-01-20T11:00:00",
      startTime: "11:00",
      endTime: "12:00",
      location: "Room 302",
      instructor: "Prof. Johnson",
      status: "completed",
      attendanceStatus: "late",
      capacity: 30,
      enrolled: 28
    },
    {
      id: "5",
      title: "Essay Writing Workshop",
      courseCode: "ENG101",
      courseName: "English Composition",
      type: "seminar",
      date: "2024-01-19T13:00:00",
      startTime: "13:00",
      endTime: "15:00",
      location: "Room 205",
      instructor: "Dr. Brown",
      status: "completed",
      attendanceStatus: "absent",
      capacity: 20,
      enrolled: 18
    },
    {
      id: "6",
      title: "Mechanics Quiz",
      courseCode: "PHYS101",
      courseName: "Physics I",
      type: "quiz",
      date: "2024-01-23T15:00:00",
      startTime: "15:00",
      endTime: "16:00",
      location: "Room 401",
      instructor: "Dr. Wilson",
      status: "upcoming",
      attendanceStatus: "pending",
      sessionCode: "PHYS101-QUIZ-001",
      capacity: 40,
      enrolled: 38
    }
  ]

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSessions = useMemo(() => {
    let filtered = sessions
    
    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(session => session.courseCode === selectedCourse)
    }
    
    // Filter by status
    if (statusTab !== "all") {
      filtered = filtered.filter(session => session.status === statusTab)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.courseCode.toLowerCase().includes(query) ||
        session.courseName.toLowerCase().includes(query) ||
        session.instructor.toLowerCase().includes(query)
      )
    }
    
    // Sort by date (most recent first for completed, soonest first for upcoming)
    return filtered.sort((a, b) => {
      if (a.status === 'upcoming' || a.status === 'active') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [selectedCourse, statusTab, searchQuery])

  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const upcomingSessions = sessions.filter(s => s.status === "upcoming").length
    const activeSessions = sessions.filter(s => s.status === "active").length
    const completedSessions = sessions.filter(s => s.status === "completed").length
    
    const attendedSessions = sessions.filter(s => s.attendanceStatus === "present" || s.attendanceStatus === "late").length
    const attendanceRate = completedSessions > 0 ? (attendedSessions / completedSessions) * 100 : 0

    return {
      totalSessions,
      upcomingSessions,
      activeSessions,
      attendanceRate
    }
  }, [sessions])

  const urgentSessions = useMemo(() => {
    const now = new Date()
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
    
    const dueSoon = sessions.filter(session => {
      const sessionDate = new Date(session.date)
      return sessionDate <= nextHour && session.status === 'upcoming'
    })
    
    const active = sessions.filter(s => s.status === "active")
    const missed = sessions.filter(s => s.attendanceStatus === "absent").length
    
    return {
      dueSoon: dueSoon.slice(0, 3),
      active: active.slice(0, 3),
      missed
    }
  }, [sessions])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewSession = (sessionId: string) => {
    router.push(`/student/sessions/${sessionId}`)
  }

  const handleJoinSession = (session: StudentSession) => {
    // Always redirect to QR code scanning for attendance
    router.push(`/student/scan-attendance?sessionId=${session.id}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "missed":
        return <Badge variant="destructive">Missed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="bg-green-500">Present</Badge>
      case "late":
        return <Badge variant="default" className="bg-yellow-500">Late</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "lecture": return "📚"
      case "tutorial": return "👥"
      case "lab": return "🔬"
      case "quiz": return "📝"
      case "exam": return "📋"
      case "seminar": return "🎯"
      default: return "📖"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Sessions</h1>
          <p className="text-muted-foreground font-dm-sans">View session details, materials, and mark attendance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="contained" 
            startIcon={<QrCodeIcon className="h-4 w-4" />}
            onClick={() => router.push('/student/scan-attendance')}
            sx={BUTTON_STYLES.primary}
          >
            <span className="hidden xs:inline">Mark Attendance</span>
            <span className="xs:hidden">Attendance</span>
          </MUIButton>
          <MUIButton 
            variant="outlined" 
            startIcon={<CalendarDaysIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
          >
            <span className="hidden xs:inline">Calendar View</span>
            <span className="xs:hidden">Calendar</span>
          </MUIButton>
        </div>
      </div>

      {/* Urgent Sessions Alert */}
      {(urgentSessions.dueSoon.length > 0 || urgentSessions.active.length > 0) && (
        <Alert severity="warning" sx={{ 
          border: '1px solid #000',
          backgroundColor: 'hsl(var(--warning) / 0.1)',
          borderRadius: 2,
          '& .MuiAlert-icon': { color: 'hsl(var(--warning))' }
        }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              ⚡ Sessions Need Your Attention
            </Typography>
            {urgentSessions.active.length > 0 && (
              <Typography variant="body2" sx={{ color: 'hsl(var(--success))', mb: 0.5 }}>
                • {urgentSessions.active.length} session{urgentSessions.active.length > 1 ? 's' : ''} currently active
              </Typography>
            )}
            {urgentSessions.dueSoon.length > 0 && (
              <Typography variant="body2" sx={{ color: 'hsl(var(--warning))' }}>
                • {urgentSessions.dueSoon.length} session{urgentSessions.dueSoon.length > 1 ? 's' : ''} starting soon
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* KPI Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: 1
      }}>
        <StatCard title="Total Sessions" value={formatNumber(stats.totalSessions)} icon={CalendarDaysIcon} color="#000000" change="All courses" />
        <StatCard title="Upcoming" value={formatNumber(stats.upcomingSessions)} icon={ClockIcon} color="#000000" change="To attend" />
        <StatCard title="Active Now" value={formatNumber(stats.activeSessions)} icon={UsersIcon} color="#000000" change="Join now" />
        <StatCard title="Attendance Rate" value={`${Math.round(stats.attendanceRate)}%`} icon={ChartBarIcon} color="#000000" change="Overall" />
      </Box>

      {/* Search Section */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'hsl(var(--card-foreground))' }}>
              Search Sessions
            </Typography>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="Search by title, course, or instructor..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                ...INPUT_STYLES,
                '& .MuiOutlinedInput-root': {
                  ...INPUT_STYLES['& .MuiOutlinedInput-root'],
                  pr: searchQuery ? 5 : 1,
                }
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
                  </Box>
                ),
                endAdornment: searchQuery && (
                  <IconButton
                    onClick={handleClearSearch}
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      right: 8,
                      color: 'hsl(var(--muted-foreground))',
                      '&:hover': { 
                        color: 'hsl(var(--foreground))',
                        backgroundColor: 'hsl(var(--muted))' 
                      }
                    }}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </IconButton>
                )
              }}
            />
            {searchQuery && (
              <Typography variant="body2" sx={{ 
                mt: 1, 
                color: 'hsl(var(--muted-foreground))', 
                fontSize: '0.875rem',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                Found {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </Typography>
            )}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Course Filter Section */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'hsl(var(--card-foreground))' }}>
              Filter by Course
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 2, sm: 3 }, 
            alignItems: { xs: 'stretch', sm: 'center' } 
          }}>
            <FormControl sx={{ 
              minWidth: { xs: '100%', sm: 300 },
              ...INPUT_STYLES
            }}>
              <InputLabel>Select Course</InputLabel>
              <Select
                native
                value={selectedCourse}
                onChange={(e) => setSelectedCourse((e.target as HTMLSelectElement).value)}
              >
                <option value="">All Courses ({sessions.length} sessions)</option>
                {courses.map(course => {
                  const courseSessions = sessions.filter(s => s.courseCode === course.courseCode)
                  return (
                    <option key={course.id} value={course.courseCode}>
                      {course.courseCode} • {course.courseName} ({courseSessions.length} sessions)
                    </option>
                  )
                })}
              </Select>
            </FormControl>
            
            {selectedCourse && (
              <MUIButton 
                size="small" 
                onClick={() => setSelectedCourse("")}
                sx={{ 
                  color: 'hsl(var(--muted-foreground))',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  px: 2,
                  '&:hover': { backgroundColor: 'hsl(var(--muted))' }
                }}
              >
                Clear Filter
              </MUIButton>
            )}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Status Tabs */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          <Tabs 
            value={statusTab} 
            onChange={(e, newValue) => setStatusTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: 'hsl(var(--foreground))' },
              '& .MuiTab-root': {
                color: 'hsl(var(--muted-foreground))',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 },
                '&.Mui-selected': { color: 'hsl(var(--foreground))', fontWeight: 600 },
                '&:hover': { color: 'hsl(var(--foreground))' },
              },
            }}
          >
            <Tab label={`All (${filteredSessions.length})`} value="all" />
            <Tab label={`Upcoming (${filteredSessions.filter(s => s.status === 'upcoming').length})`} value="upcoming" />
            <Tab label={`Active (${filteredSessions.filter(s => s.status === 'active').length})`} value="active" />
            <Tab label={`Completed (${filteredSessions.filter(s => s.status === 'completed').length})`} value="completed" />
          </Tabs>
        </MUICardContent>
      </MUICard>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              {(() => {
                const hasSearchQuery = searchQuery.trim() !== ""
                const hasFilters = selectedCourse || statusTab !== "all"
                
                if (hasSearchQuery) {
                  return (
                    <>
                      <MagnifyingGlassIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2, color: 'hsl(var(--card-foreground))' }}>
                        No Sessions Found
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', mb: 3, maxWidth: 400, mx: 'auto' }}>
                        We couldn't find any sessions matching <strong>"{searchQuery}"</strong>
                        {hasFilters && " with your current filters"}.
                      </Typography>
                      <MUIButton 
                        variant="outlined" 
                        onClick={handleClearSearch}
                        sx={BUTTON_STYLES.outlined}
                        startIcon={<XMarkIcon className="h-4 w-4" />}
                      >
                        Clear Search
                      </MUIButton>
                    </>
                  )
                } else if (hasFilters) {
                  return (
                    <>
                      <CalendarDaysIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2, color: 'hsl(var(--card-foreground))' }}>
                        No Sessions Match Your Filters
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', mb: 3, maxWidth: 400, mx: 'auto' }}>
                        Try adjusting your course selection or status filter to see more sessions.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {selectedCourse && (
                          <MUIButton 
                            variant="outlined" 
                            onClick={() => setSelectedCourse("")}
                            sx={BUTTON_STYLES.outlined}
                          >
                            View All Courses
                          </MUIButton>
                        )}
                        {statusTab !== "all" && (
                          <MUIButton 
                            variant="outlined" 
                            onClick={() => setStatusTab("all")}
                            sx={BUTTON_STYLES.outlined}
                          >
                            Show All Status
                          </MUIButton>
                        )}
                      </Box>
                    </>
                  )
                } else {
                  return (
                    <>
                      <CalendarDaysIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2, color: 'hsl(var(--card-foreground))' }}>
                        No Sessions Yet
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                        Your class sessions will appear here once they're scheduled by your instructors.
                      </Typography>
                    </>
                  )
                }
              })()}
            </MUICardContent>
          </MUICard>
        ) : (
          filteredSessions.map((session) => (
            <MUICard key={session.id} sx={LIST_CARD_SX}>
              <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
                  mb: 2,
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: { xs: 1, sm: 2 }, 
                      mb: 1 
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        fontWeight: 600,
                        color: 'hsl(var(--card-foreground))',
                        fontSize: { xs: '1rem', sm: '1.125rem' }
                      }}>
                        {getSessionTypeIcon(session.type)} {session.title}
                      </Typography>
                      {session.status === 'active' && (
                        <Chip label="LIVE NOW" size="small" sx={{ bgcolor: 'hsl(var(--success))', color: 'white', fontSize: '0.75rem', fontWeight: 600 }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))', 
                      mb: 0.5,
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}>
                      {session.courseCode} - {session.courseName}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))', 
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}>
                      {session.instructor}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'row', sm: 'column' },
                    alignItems: { xs: 'center', sm: 'flex-end' }, 
                    gap: { xs: 2, sm: 1 },
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' }
                  }}>
                    {getStatusBadge(session.status)}
                    {session.status === 'completed' && getAttendanceBadge(session.attendanceStatus)}
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 2,
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                      <Typography variant="body2" sx={{ 
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                      }}>
                        {formatDate(session.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      <Typography variant="body2" sx={{ 
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                      }}>
                        {session.startTime} - {session.endTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <Typography variant="body2" sx={{ 
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                      }}>
                        {session.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <Typography variant="body2" sx={{ 
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                      }}>
                        {session.enrolled}/{session.capacity} students
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1.5, sm: 2 }, 
                  pt: 1 
                }}>
                  {(session.status === 'upcoming' || session.status === 'active') && (
                    <MUIButton 
                      variant="contained"
                      size="small" 
                      onClick={() => handleJoinSession(session)}
                      sx={{
                        ...BUTTON_STYLES.primary,
                        width: { xs: '100%', sm: 'auto' },
                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                      }}
                    >
                      <QrCodeIcon className="h-4 w-4 mr-2" />
                      {session.status === 'active' ? 'Mark Attendance' : 'Scan QR Code'}
                    </MUIButton>
                  )}
                  <MUIButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleViewSession(session.id)}
                    sx={{
                      ...BUTTON_STYLES.outlined,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </MUIButton>
                </Box>
              </MUICardContent>
            </MUICard>
          ))
        )}
      </div>

    </div>
  )
}
