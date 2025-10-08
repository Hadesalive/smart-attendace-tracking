"use client"

import React, { useState, useMemo, useEffect } from "react"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Skeleton
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDaysIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useAttendance, useCourses, useAuth, useAcademicStructure } from "@/lib/domains"
import { AttendanceRecord, Course } from "@/lib/types/shared"
import { mapAttendanceStatus } from "@/lib/utils/statusMapping"
import FilterBar from "@/components/admin/FilterBar"

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

// Types
// Using shared types from DataContext

export default function StudentAttendancePage() {
  const attendance = useAttendance()
  const coursesHook = useCourses()
  const auth = useAuth()
  
  // Extract state and methods
  const { 
    state: attendanceState, 
    getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession,
    markAttendanceSupabase,
    subscribeToAttendanceRecords,
    unsubscribeAll,
    fetchAttendanceSessions,
    fetchStudentAttendanceSessions, // New section-based function
    fetchAttendanceRecords
  } = attendance
  
  const { 
    state: coursesState,
    getCoursesByLecturer, 
    getStudentsByCourse,
    fetchCourses,
    fetchEnrollments
  } = coursesHook
  
  const { state: authState } = auth
  const academic = useAcademicStructure()
  const { state: academicState } = academic
  
  // Create legacy state object for compatibility
  const state = {
    ...attendanceState,
    ...coursesState,
    ...academicState,
    currentUser: authState.currentUser
  }

  // Load all data on component mount (same pattern as lecturer sessions page)
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Student Attendance Page: Loading all data...')
        await Promise.all([
          auth.loadCurrentUser(), // Load the current user first
          fetchCourses(),
          coursesHook.fetchCourseAssignments(), // Load course assignments for course inheritance
          academic.fetchSectionEnrollments(), // Use section enrollments instead of old enrollments
          fetchAttendanceRecords()
        ])
        console.log('Student Attendance Page: Data loaded successfully')
      } catch (error) {
        console.error('Error loading student attendance page data:', error)
      }
    }
    
    fetchData()
  }, [auth.loadCurrentUser, fetchCourses, coursesHook.fetchCourseAssignments, academic.fetchSectionEnrollments, fetchAttendanceRecords])

  // Load section-based sessions after user is available
  useEffect(() => {
    if (authState.currentUser?.id) {
      console.log('Loading student sessions for user:', authState.currentUser.id)
      fetchStudentAttendanceSessions(authState.currentUser.id)
    }
  }, [authState.currentUser?.id, fetchStudentAttendanceSessions])

  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [statusTab, setStatusTab] = useState<"all" | "present" | "late" | "absent">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Get student's courses (inherited from program/academic year/semester/year level)
  const courses = useMemo(() => {
    console.log('Student Attendance - State data:', {
      courses: state.courses.length,
      sectionEnrollments: state.sectionEnrollments.length,
      courseAssignments: state.courseAssignments?.length || 0,
      attendanceSessions: state.attendanceSessions.length,
      attendanceRecords: state.attendanceRecords.length,
      currentUserId: state.currentUser?.id
    })
    
    // Get student's enrolled section
    const studentSectionEnrollment = state.sectionEnrollments.find(
      (enrollment: any) => enrollment.student_id === state.currentUser?.id
    )
    
    console.log('Student Attendance - Student section enrollment:', studentSectionEnrollment)
    
    if (!(studentSectionEnrollment as any)?.sections) {
      console.log('Student Attendance - No section enrollment found')
      return []
    }
    
    const section = (studentSectionEnrollment as any).sections
    console.log('Student Attendance - Student section details:', section)
    
    // Get course assignments for this student's program/academic year/semester/year level
    const relevantCourseAssignments = state.courseAssignments?.filter((assignment: any) => 
      assignment.program_id === section.program_id &&
      assignment.academic_year_id === section.academic_year_id &&
      assignment.semester_id === section.semester_id &&
      assignment.year === section.year
    ) || []
    
    console.log('Student Attendance - Relevant course assignments:', relevantCourseAssignments)
    
    // Get courses from these assignments
    const studentCourses = relevantCourseAssignments
      .map((assignment: any) => state.courses.find(course => course?.id === assignment.course_id))
      .filter((course): course is Course => Boolean(course))
    
    console.log('Student Attendance - Student courses (inherited from program):', studentCourses.length)
    console.log('Student Attendance - Student courses details:', studentCourses)
    return studentCourses
  }, [state.courses, state.sectionEnrollments, state.courseAssignments, state.currentUser?.id])

  // Get student's attendance records from shared data
  // ✅ FIXED: Iterate through sessions directly (already filtered by fetchStudentAttendanceSessions)
  const attendanceRecords = useMemo(() => {
    const studentId = state.currentUser?.id
    const allRecords: any[] = []
    
    console.log('📊 Student attendance records calculation:', {
      studentId,
      coursesCount: courses.length,
      sessionsCount: state.attendanceSessions.length,
      recordsCount: state.attendanceRecords.length
    })
    
    // Iterate through sessions directly instead of through courses
    // fetchStudentAttendanceSessions already filtered by student's section enrollment
    state.attendanceSessions.forEach(session => {
      const records = getAttendanceRecordsBySession(session.id)
      const studentRecord = records.find(r => !!studentId && r.student_id === studentId)
      
      console.log(`🎯 Session ${session.session_name}: ${records.length} records, student record:`, !!studentRecord)
      
      // Only include sessions where student has an attendance record
      // This is correct behavior - students only see their own attendance history
      if (studentRecord) {
        allRecords.push({
          id: studentRecord.id,
          sessionTitle: session.session_name,
          courseCode: session.course_code,
          courseName: session.course_name,
          date: session.session_date,
          startTime: session.start_time,
          endTime: session.end_time,
          status: studentRecord.status,
          checkInTime: studentRecord.check_in_time,
          instructor: session.lecturer_name || "Instructor",
          location: session.location
        })
      }
    })
    
    console.log('📋 Final attendance records:', allRecords.length)
    return allRecords
  }, [getAttendanceRecordsBySession, state.currentUser?.id, state.attendanceSessions, state.attendanceRecords])

  // Computed values
  const filteredRecords = useMemo(() => {
    let filtered = attendanceRecords
    
    if (selectedCourse) {
      filtered = filtered.filter(record => record.courseCode === selectedCourse)
    }
    
    if (statusTab !== "all") {
      filtered = filtered.filter(record => {
        const mappedStatus = mapAttendanceStatus(record.status, 'student')
        return mappedStatus === statusTab
      })
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(record => 
        record.sessionTitle.toLowerCase().includes(query) ||
        record.courseCode.toLowerCase().includes(query) ||
        record.courseName.toLowerCase().includes(query) ||
        record.instructor.toLowerCase().includes(query)
      )
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedCourse, statusTab, searchQuery])

  // Subscribe to real-time attendance record updates
  useEffect(() => {
    // Subscribe to attendance record changes for the current student
    subscribeToAttendanceRecords()
    
    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAll()
    }
  }, [subscribeToAttendanceRecords, unsubscribeAll])

  const stats = useMemo(() => {
    const totalSessions = attendanceRecords.length
    const presentSessions = attendanceRecords.filter(r => mapAttendanceStatus(r.status, 'student') === 'present').length
    const lateSessions = attendanceRecords.filter(r => mapAttendanceStatus(r.status, 'student') === 'late').length
    const attendanceRate = totalSessions > 0 ? ((presentSessions + lateSessions) / totalSessions) * 100 : 0

    return { totalSessions, presentSessions, lateSessions, attendanceRate }
  }, [attendanceRecords])

  const courseStats = useMemo(() => {
    const courseStatsMap = new Map()
    
    state.courses.forEach(course => {
      if (course) {
        const courseRecords = attendanceRecords.filter(r => r.courseCode === course!.course_code)
        const present = courseRecords.filter(r => {
          const mappedStatus = mapAttendanceStatus(r.status, 'student')
          return mappedStatus === 'present' || mappedStatus === 'late'
        }).length
        const total = courseRecords.length
        const rate = total > 0 ? (present / total) * 100 : 0
        
        courseStatsMap.set(course!.course_code, {
          courseName: course!.course_name,
          present,
          total,
          rate
        })
      }
    })
    
    return courseStatsMap
  }, [attendanceRecords, courses])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Chip label="Present" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "late":
        return <Chip label="Late" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "absent":
        return <Chip label="Absent" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon className="h-4 w-4 text-gray-600" />
      case "late":
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />
      case "absent":
        return <XCircleIcon className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  // Loading state - removed mock data dependency

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Attendance</h1>
          <p className="text-muted-foreground font-dm-sans">Track your attendance history and statistics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined" 
            startIcon={<ChartBarIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
          >
            Export Report
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
        <StatCard title="Total Sessions" value={formatNumber(stats.totalSessions)} icon={CalendarDaysIcon} color="#000000" change="All courses" />
        <StatCard title="Present" value={formatNumber(stats.presentSessions)} icon={CheckCircleIcon} color="#000000" change="On time" />
        <StatCard title="Late" value={formatNumber(stats.lateSessions)} icon={ExclamationTriangleIcon} color="#000000" change="Tardy" />
        <StatCard title="Attendance Rate" value={`${Math.round(stats.attendanceRate)}%`} icon={ChartBarIcon} color="#000000" change="Overall" />
      </Box>

      {/* Course Performance */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <PresentationChartLineIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'hsl(var(--card-foreground))' }}>
              Course Performance
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: { xs: 2, sm: 3 } 
          }}>
            {Array.from(courseStats.entries()).map(([courseCode, stats]) => (
              <Box key={courseCode} sx={{ 
                p: 2, 
                border: '1px solid #000', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 1 }}>
                  {courseCode}
                </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1, fontSize: '0.875rem' }}>
                  {stats.courseName}
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 0.5 }}>
                  {Math.round(stats.rate)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                  {stats.present}/{stats.total} sessions
                </Typography>
              </Box>
            ))}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Filter Bar */}
      <FilterBar
        fields={[
          {
            type: 'text',
            label: 'Search',
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: 'Search by session, course, or instructor...',
            span: 4
          },
          {
            type: 'native-select',
            label: 'Course',
            value: selectedCourse,
            onChange: setSelectedCourse,
            options: [
              { value: '', label: 'All Courses' },
              ...courses.filter(course => course).map(course => ({
                value: course!.course_code,
                label: `${course!.course_code} - ${course!.course_name}`
              }))
            ],
            span: 4
          },
          {
            type: 'native-select',
            label: 'Status',
            value: statusTab,
            onChange: (value) => setStatusTab(value as "all" | "present" | "late" | "absent"),
            options: [
              { value: 'all', label: `All (${attendanceRecords.length})` },
              { value: 'present', label: `Present (${attendanceRecords.filter(r => mapAttendanceStatus(r.status, 'student') === 'present').length})` },
              { value: 'late', label: `Late (${attendanceRecords.filter(r => mapAttendanceStatus(r.status, 'student') === 'late').length})` },
              { value: 'absent', label: `Absent (${attendanceRecords.filter(r => mapAttendanceStatus(r.status, 'student') === 'absent').length})` }
            ],
            span: 3
          },
          {
            type: 'clear-button',
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('')
              setSelectedCourse('')
              setStatusTab('all')
            },
            span: 1
          }
        ]}
      />


      {/* Records Table */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          {filteredRecords.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CalendarDaysIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                No Records Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                Your attendance records will appear here once you start attending sessions.
              </Typography>
            </Box>
          ) : (
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
                  <TableCell>Check-in</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} sx={{ 
                    '& .MuiTableCell-root': { borderColor: '#000' }
                  }}>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      {record.sessionTitle}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {record.courseCode}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {record.courseName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(record.date)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {record.startTime} - {record.endTime}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(mapAttendanceStatus(record.status, 'student'))}
                        {getStatusBadge(mapAttendanceStatus(record.status, 'student'))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.checkInTime ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {record.checkInTime}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{record.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </MUICardContent>
      </MUICard>
    </div>
  )
}
