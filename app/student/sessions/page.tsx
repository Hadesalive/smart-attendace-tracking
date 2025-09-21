"use client"

import React, { useState, useMemo } from "react"
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
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  UsersIcon, 
  QrCodeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  XMarkIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useAttendance, useCourses, useAuth } from "@/lib/domains"
import { useMockData } from "@/lib/hooks/useMockData"
import { AttendanceSession, Course } from "@/lib/types/shared"
import { mapSessionStatus } from "@/lib/utils/statusMapping"

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

// Using shared types from DataContext
// StudentSession is mapped from AttendanceSession
// Course is imported from shared types

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentSessionsPage() {
  const router = useRouter()
  
  // ============================================================================
  // DATA CONTEXT
  // ============================================================================
  
  const attendance = useAttendance()
  const coursesHook = useCourses()
  const auth = useAuth()
  
  // Extract state and methods
  const { 
    state: attendanceState,
    getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession,
    fetchAttendanceSessions,
    fetchAttendanceRecords
  } = attendance
  
  const { 
    state: coursesState,
    getCoursesByLecturer, 
    fetchCourses,
    fetchEnrollments
  } = coursesHook
  
  const { state: authState } = auth
  
  // Create legacy state object for compatibility
  const state = {
    ...attendanceState,
    ...coursesState,
    currentUser: authState.currentUser
  }
  const { isInitialized } = useMockData()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [statusTab, setStatusTab] = useState<"all" | "upcoming" | "active" | "completed">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load data on component mount
  React.useEffect(() => {
    fetchCourses()
    fetchEnrollments()
    fetchAttendanceSessions()
    fetchAttendanceRecords()
  }, [fetchCourses, fetchEnrollments, fetchAttendanceSessions, fetchAttendanceRecords])

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Get student's courses (based on authenticated user)
  const courses = useMemo(() => {
    console.log('Student Sessions - State data:', {
      courses: state.courses.length,
      enrollments: state.enrollments.length,
      attendanceSessions: state.attendanceSessions.length
    })
    
    const filteredCourses = state.courses.filter(course => 
      state.enrollments.some(enrollment => 
        (!!state.currentUser?.id && enrollment.student_id === state.currentUser.id) && enrollment.course_id === course.id
      )
    )
    
    console.log('Student Sessions - Filtered courses:', filteredCourses.length)
    return filteredCourses
  }, [state.courses, state.enrollments, state.currentUser?.id])

  // Get student's sessions from shared data
  const sessions = useMemo(() => {
    const allSessions: AttendanceSession[] = []
    
    courses.forEach(course => {
      const courseSessions = getAttendanceSessionsByCourse(course.id)
      console.log(`Student Sessions - Course ${course.course_code} sessions:`, courseSessions.length)
      allSessions.push(...courseSessions)
    })
    
    console.log('Student Sessions - Total sessions:', allSessions.length)
    return allSessions
  }, [courses, getAttendanceSessionsByCourse])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSessions = useMemo(() => {
    let filtered = sessions
    
    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(session => session.course_code === selectedCourse)
    }
    
    // Filter by status (map shared status to student display status)
    if (statusTab !== "all") {
      filtered = filtered.filter(session => {
        const studentStatus = mapSessionStatus(session.status, 'student')
        return studentStatus === statusTab
      })
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(session => 
        session.session_name.toLowerCase().includes(query) ||
        session.course_code.toLowerCase().includes(query) ||
        session.course_name.toLowerCase().includes(query) ||
        (session.lecturer_name || '').toLowerCase().includes(query)
      )
    }
    
    // Sort by date (most recent first for completed, soonest first for upcoming)
    return filtered.sort((a, b) => {
      if (mapSessionStatus(a.status, 'student') === 'upcoming' || mapSessionStatus(a.status, 'student') === 'active') {
        return new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
      }
      return new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    })
  }, [selectedCourse, statusTab, searchQuery, sessions])

  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const upcomingSessions = sessions.filter(s => mapSessionStatus(s.status, 'student') === "upcoming").length
    const activeSessions = sessions.filter(s => mapSessionStatus(s.status, 'student') === "active").length
    const completedSessions = sessions.filter(s => mapSessionStatus(s.status, 'student') === "completed").length
    
    // Calculate attendance rate from attendance records
    const completedSessionsWithRecords = sessions.filter(s => mapSessionStatus(s.status, 'student') === "completed")
    let attendedSessions = 0
    
    completedSessionsWithRecords.forEach(session => {
      const records = getAttendanceRecordsBySession(session.id)
      const studentRecord = records.find(r => !!state.currentUser?.id && r.student_id === state.currentUser.id)
      if (studentRecord && (studentRecord.status === "present" || studentRecord.status === "late")) {
        attendedSessions++
      }
    })
    
    const attendanceRate = completedSessions > 0 ? (attendedSessions / completedSessions) * 100 : 0

    return {
      totalSessions,
      upcomingSessions,
      activeSessions,
      completedSessions,
      attendanceRate: Math.round(attendanceRate)
    }
  }, [sessions, getAttendanceRecordsBySession])

  const urgentSessions = useMemo(() => {
    const now = new Date()
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
    
    const dueSoon = sessions.filter(session => {
      const sessionDate = new Date(session.session_date)
      return sessionDate <= nextHour && mapSessionStatus(session.status, 'student') === 'upcoming'
    })
    
    const active = sessions.filter(s => mapSessionStatus(s.status, 'student') === "active")
    
    // Calculate missed sessions
    const completedSessionsWithRecords = sessions.filter(s => mapSessionStatus(s.status, 'student') === "completed")
    let missed = 0
    
    completedSessionsWithRecords.forEach(session => {
      const records = getAttendanceRecordsBySession(session.id)
      const studentRecord = records.find(r => !!state.currentUser?.id && r.student_id === state.currentUser.id)
      if (studentRecord && studentRecord.status === "absent") {
        missed++
      }
    })
    
    return {
      dueSoon: dueSoon.slice(0, 3),
      active: active.slice(0, 3),
      missed
    }
  }, [sessions, getAttendanceRecordsBySession])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewSession = (sessionId: string) => {
    router.push(`/student/sessions/${sessionId}`)
  }

  const handleJoinSession = (session: AttendanceSession) => {
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
        return <Chip label="Upcoming" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "active":
        return <Chip label="Active" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "completed":
        return <Chip label="Completed" sx={{ bgcolor: '#333333', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "missed":
        return <Chip label="Missed" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
    }
  }

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Chip label="Present" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "late":
        return <Chip label="Late" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "absent":
        return <Chip label="Absent" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "pending":
        return <Chip label="Pending" sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
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
                  const courseSessions = sessions.filter(s => s.course_code === course.course_code)
                  return (
                    <option key={course.id} value={course.course_code}>
                      {course.course_code} • {course.course_name} ({courseSessions.length} sessions)
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
            <Tab label={`Upcoming (${filteredSessions.filter(s => mapSessionStatus(s.status, 'student') === 'upcoming').length})`} value="upcoming" />
            <Tab label={`Active (${filteredSessions.filter(s => mapSessionStatus(s.status, 'student') === 'active').length})`} value="active" />
            <Tab label={`Completed (${filteredSessions.filter(s => mapSessionStatus(s.status, 'student') === 'completed').length})`} value="completed" />
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
                        {getSessionTypeIcon(session.type || 'lecture')} {session.session_name}
                      </Typography>
                      {mapSessionStatus(session.status, 'student') === 'active' && (
                        <Chip label="LIVE NOW" size="small" sx={{ bgcolor: 'hsl(var(--success))', color: 'white', fontSize: '0.75rem', fontWeight: 600 }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))', 
                      mb: 0.5,
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}>
                      {session.course_code} - {session.course_name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))', 
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}>
                      {session.lecturer_name || 'TBD'}
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
                    {getStatusBadge(mapSessionStatus(session.status, 'student'))}
                    {mapSessionStatus(session.status, 'student') === 'completed' && (() => {
                      const records = getAttendanceRecordsBySession(session.id)
                      const studentRecord = records.find(r => !!state.currentUser?.id && r.student_id === state.currentUser.id)
                      return studentRecord ? getAttendanceBadge(studentRecord.status) : null
                    })()}
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
                        {formatDate(session.session_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      <Typography variant="body2" sx={{ 
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                      }}>
                        {session.start_time} - {session.end_time}
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
                        {session.enrolled || 0}/{session.capacity || 0} students
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
                  {(mapSessionStatus(session.status, 'student') === 'upcoming' || mapSessionStatus(session.status, 'student') === 'active') && (
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
