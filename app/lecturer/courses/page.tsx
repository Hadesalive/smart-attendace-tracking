"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  TextField,
  IconButton,
  Avatar,
  LinearProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UsersIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useCourses, useAttendance, useGrades, useMaterials, useAuth } from "@/lib/domains"
import { useMockData } from "@/lib/hooks/useMockData"
import { Course, Student, Assignment, Submission, AttendanceSession } from "@/lib/types/shared"
import { mapSessionStatus, mapAttendanceStatus } from "@/lib/utils/statusMapping"

// Constants
const CARD_SX = {
  bgcolor: 'card',
  border: '1px solid',
  borderColor: '#000',
  borderRadius: 3,
  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  position: 'relative' as const,
  overflow: 'hidden' as const,
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
interface LecturerCourse {
  id: string
  course_code: string
  course_name: string
  credits: number
  department: string
  semester: string
  academic_year: string
  status: "active" | "completed" | "upcoming"
  enrolled_students: number
  max_students?: number
  attendance_rate: number
  average_grade: number
  materials_count: number
  assignments_count: number
  sessions_count: number
  description: string
  schedule: {
    days: string[]
    time: string
    location: string
  }
  next_session?: {
    title: string
    date: string
    time: string
  }
}

export default function LecturerCoursesPage() {
  const coursesHook = useCourses()
  const attendance = useAttendance()
  const grades = useGrades()
  const materials = useMaterials()
  const auth = useAuth()
  
  // Extract state and methods
  const { state: coursesState, getCoursesByLecturer, getStudentsByCourse } = coursesHook
  const { getAttendanceSessionsByCourse, getAttendanceRecordsBySession } = attendance
  const { getAssignmentsByCourse, getSubmissionsByAssignment, getStudentGradesByCourse, calculateFinalGrade } = grades
  const { state: materialsState } = materials
  const { state: authState } = auth
  
  // Create legacy state object for compatibility
  const state = {
    ...coursesState,
    ...attendance.state,
    ...grades.state,
    materials: materialsState.materials,
    currentUser: authState.currentUser
  }
  const { isInitialized } = useMockData()

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")

  // Get lecturer's courses from shared data
  const lecturerId = state.currentUser?.id || "user_2" // Use actual current user ID
  
  const courses = useMemo(() => {
    const lecturerCourses = getCoursesByLecturer(lecturerId)
    
    return lecturerCourses.map(course => {
      // Calculate course-specific stats
      const assignments = getAssignmentsByCourse(course.id)
      const students = getStudentsByCourse(course.id)
      
      // Calculate attendance rate
      let totalSessions = 0
      let presentSessions = 0
      const courseSessions = getAttendanceSessionsByCourse(course.id)
      courseSessions.forEach(session => {
        const records = getAttendanceRecordsBySession(session.id)
        records.forEach(record => {
          totalSessions++
          const mappedStatus = mapAttendanceStatus(record.status, 'lecturer')
          if (mappedStatus === 'present' || mappedStatus === 'late') {
            presentSessions++
          }
        })
      })
      const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0
      
      // Calculate average grade
      const grades = getStudentGradesByCourse(lecturerId, course.id)
      const averageGrade = grades.length > 0 ? Math.round(calculateFinalGrade(lecturerId, course.id)) : 0
      
      // Get next session
      const futureSessions = courseSessions.filter(session => 
        new Date(session.session_date || '') >= new Date()
      ).sort((a, b) => new Date(a.session_date || '').getTime() - new Date(b.session_date || '').getTime())
      
      const nextSession = futureSessions[0]
      
      return {
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits || 3,
        department: course.department || 'General',
        semester: "Fall 2024", // Would need to get from enrollment data
        academic_year: "2024-2025", // Would need to get from enrollment data
        status: "active" as const,
        enrolled_students: students.length,
        max_students: course.max_students || 50,
        attendance_rate: attendanceRate,
        average_grade: averageGrade,
        materials_count: state.materials.filter((m: any) => m.course_id === course.id).length,
        assignments_count: assignments.length,
        sessions_count: courseSessions.length,
        description: course.description || "Course description not available",
        schedule: {
          days: ["Monday", "Wednesday", "Friday"], // Would need to get from course data
          time: "10:00 - 11:30", // Would need to get from course data
          location: "Room TBD" // Would need to get from course data
        },
        next_session: nextSession ? {
          title: nextSession.session_name,
          date: nextSession.session_date || new Date().toISOString(),
          time: `${nextSession.start_time || 'TBD'} - ${nextSession.end_time || 'TBD'}`
        } : undefined
      }
    })
  }, [lecturerId, getCoursesByLecturer, getStudentsByCourse, getAssignmentsByCourse, getAttendanceSessionsByCourse, getAttendanceRecordsBySession, getStudentGradesByCourse, calculateFinalGrade, state.materials])

  // Computed values
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Filter by search term
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course => 
        course.course_code.toLowerCase().includes(query) ||
        course.course_name.toLowerCase().includes(query) ||
        course.department.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    // Filter by semester
    if (semesterFilter !== "all") {
      filtered = filtered.filter(course => course.semester === semesterFilter)
    }

    return filtered
  }, [courses, searchQuery, statusFilter, semesterFilter])

  const stats = useMemo(() => {
    const activeCourses = courses.filter(c => c.status === 'active').length
    const totalStudents = courses.reduce((sum, c) => sum + c.enrolled_students, 0)
    const overallAttendanceRate = courses.length > 0 
      ? courses.reduce((sum, c) => sum + c.attendance_rate, 0) / courses.length : 0
    const overallGrade = courses.length > 0
      ? courses.reduce((sum, c) => sum + c.average_grade, 0) / courses.length : 0

    return { activeCourses, totalStudents, overallAttendanceRate, overallGrade }
  }, [courses])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => setSearchQuery("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Chip label="Active" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "completed":
        return <Chip label="Completed" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "upcoming":
        return <Chip label="Upcoming" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "#000000"
    if (grade >= 80) return "#333333"
    if (grade >= 70) return "#666666"
    return "#999999"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Courses</h1>
          <p className="text-muted-foreground font-dm-sans">Manage your assigned courses and track student progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined" 
            startIcon={<ChartBarIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
          >
            Course Analytics
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
        <StatCard title="Active Courses" value={formatNumber(stats.activeCourses)} icon={BookOpenIcon} color="#000000" change="This semester" />
        <StatCard title="Total Students" value={formatNumber(stats.totalStudents)} icon={UsersIcon} color="#000000" change="Enrolled" />
        <StatCard title="Avg Attendance" value={`${Math.round(stats.overallAttendanceRate)}%`} icon={CheckCircleIcon} color="#000000" change="Overall" />
        <StatCard title="Avg Grade" value={`${Math.round(stats.overallGrade)}%`} icon={ChartBarIcon} color="#000000" change="All courses" />
      </Box>

      {/* Search and Filters */}
      <MUICard sx={{ ...CARD_SX, '&:hover': {} }}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Search & Filter Courses
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Search by course code, name, or department..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                    '&:hover fieldset': { borderColor: '#000' },
                    '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
                    pr: searchQuery ? 5 : 1,
                  },
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))',
                    '&.Mui-focused': { color: '#000' },
                  },
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
            </Box>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' } }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                label="Semester"
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' } }}
              >
                <MenuItem value="all">All Semesters</MenuItem>
                <MenuItem value="Fall 2024">Fall 2024</MenuItem>
                <MenuItem value="Spring 2024">Spring 2024</MenuItem>
                <MenuItem value="Summer 2024">Summer 2024</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <MUICard sx={{ ...CARD_SX, '&:hover': {} }}>
            <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              <BookOpenIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                {searchQuery ? 'No Courses Found' : 'No Courses Assigned'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', mb: 4, maxWidth: 400, mx: 'auto' }}>
                {searchQuery 
                  ? `No courses match "${searchQuery}". Try adjusting your search terms.`
                  : 'You have not been assigned to any courses yet. Contact your department head for course assignments.'
                }
              </Typography>
              {searchQuery && (
                <MUIButton 
                  variant="outlined" 
                  onClick={handleClearSearch}
                  sx={BUTTON_STYLES.outlined}
                  startIcon={<XMarkIcon className="h-4 w-4" />}
                >
                  Clear Search
                </MUIButton>
              )}
            </MUICardContent>
          </MUICard>
        ) : (
          filteredCourses.map((course) => (
            <MUICard key={course.id} sx={CARD_SX}>
              <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                {/* Header */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
                  mb: 2,
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: { xs: 1, sm: 2 }, 
                      mb: 1 
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        fontWeight: 600,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' }
                      }}>
                        {course.course_code} - {course.course_name}
                      </Typography>
                      {getStatusBadge(course.status)}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.department}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                          {course.credits} Credits • {course.semester} • {course.academic_year}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      fontWeight: 700,
                      color: getGradeColor(course.average_grade)
                    }}>
                      {Math.round(course.average_grade)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Average Grade
                    </Typography>
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" sx={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  mb: 3, 
                  lineHeight: 1.6
                }}>
                  {course.description}
                </Typography>

                {/* Stats */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
                  gap: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'hsl(var(--muted) / 0.3)',
                  borderRadius: 2,
                  border: '1px solid #000'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.enrolled_students}/{course.max_students}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Students
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.attendance_rate}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Attendance
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.assignments_count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Assignments
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.sessions_count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Sessions
                    </Typography>
                  </Box>
                </Box>

                {/* Schedule & Next Session */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 3,
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Schedule
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.schedule.days.join(', ')} • {course.schedule.time}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      {course.schedule.location}
                    </Typography>
                  </Box>
                  {course.next_session && (
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                        Next Session
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {course.next_session.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                        {formatDate(course.next_session.date)} • {course.next_session.time}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1.5, sm: 2 }, 
                  pt: 1 
                }}>
                  <MUIButton 
                    variant="contained"
                    size="small" 
                    onClick={() => router.push(`/lecturer/courses/${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.primary,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </MUIButton>
                  <MUIButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => router.push(`/lecturer/homework?course=${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.outlined,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Assignments
                  </MUIButton>
                  <MUIButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => router.push(`/lecturer/attendance?course=${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.outlined,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Attendance
                  </MUIButton>
                  <MUIButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => router.push(`/lecturer/gradebook?course=${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.outlined,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Gradebook
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
