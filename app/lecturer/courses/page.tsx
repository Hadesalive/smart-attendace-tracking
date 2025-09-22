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
import { useAcademicStructure } from "@/lib/domains/academic/hooks"
import { useData } from "@/lib/contexts/DataContext"
import { useMockData } from "@/lib/hooks/useMockData"
import { Course, Student, Assignment, Submission, AttendanceSession } from "@/lib/types/shared"
import { mapSessionStatus, mapAttendanceStatus } from "@/lib/utils/statusMapping"
import FilterBar from "@/components/admin/FilterBar"
import DataTable from "@/components/admin/DataTable"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

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
  const academic = useAcademicStructure()
  const { state: dataState } = useData()
  
  // Extract state and methods
  const { state: coursesState, getCoursesByLecturer, getStudentsByCourse } = coursesHook
  const { getAttendanceSessionsByCourse, getAttendanceRecordsBySession } = attendance
  const { getAssignmentsByCourse, getSubmissionsByAssignment, getStudentGradesByCourse, calculateFinalGrade } = grades
  const { state: materialsState } = materials
  const { state: authState } = auth
  
  // Create merged state object with academic data
  const state = {
    ...coursesState,
    ...attendance.state,
    ...grades.state,
    ...academic.state,
    ...dataState,
    materials: materialsState.materials,
    currentUser: authState.currentUser
  }
  const { isInitialized } = useMockData()

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    status: 'all',
    semester: 'all',
    year: 'all',
    department: 'all'
  })

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
      
      // Get year information from course assignments
      const courseAssignments = state.courseAssignments?.filter((ca: any) => ca.course_id === course.id) || []
      const sections = courseAssignments.map((ca: any) => 
        state.sections?.find((s: any) => s.id === ca.section_id)
      ).filter(Boolean)
      
      // Get unique years from sections
      const years = [...new Set(sections.map((s: any) => s.year).filter(Boolean))]
      const primaryYear = years.length > 0 ? Math.min(...years) : 1
      
      // Get semester and academic year information
      const section = sections[0] // Use first section for semester/year info
      const semester = state.semesters?.find((s: any) => s.id === section?.semester_id)
      const academicYear = state.academicYears?.find((ay: any) => ay.id === section?.academic_year_id)
      
      return {
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits || 3,
        department: course.department || 'General',
        semester: semester ? `${(academicYear as any)?.year || 'Current'} - ${semester.semester_name}` : "Current Semester",
        academic_year: (academicYear as any)?.year || "Current",
        year: primaryYear,
        yearLabel: `Year ${primaryYear}`,
        years: years,
        status: "active" as const,
        enrolled_students: students.length,
        max_students: (course as any).max_students || 50,
        attendance_rate: attendanceRate,
        average_grade: averageGrade,
        materials_count: state.materials.filter((m: any) => m.course_id === course.id).length,
        assignments_count: assignments.length,
        sessions_count: courseSessions.length,
        description: (course as any).description || "Course description not available",
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
    if (filters.status !== "all") {
      filtered = filtered.filter(course => course.status === filters.status)
    }

    // Filter by semester
    if (filters.semester !== "all") {
      filtered = filtered.filter(course => course.semester === filters.semester)
    }

    // Filter by year
    if (filters.year !== "all") {
      filtered = filtered.filter(course => course.year === parseInt(filters.year))
    }

    // Filter by department
    if (filters.department !== "all") {
      filtered = filtered.filter(course => course.department === filters.department)
    }

    return filtered
  }, [courses, searchQuery, filters])

  const stats = useMemo(() => {
    const activeCourses = courses.filter(c => c.status === 'active').length
    const totalStudents = courses.reduce((sum, c) => sum + c.enrolled_students, 0)
    const overallAttendanceRate = courses.length > 0 
      ? courses.reduce((sum, c) => sum + c.attendance_rate, 0) / courses.length : 0
    const overallGrade = courses.length > 0
      ? courses.reduce((sum, c) => sum + c.average_grade, 0) / courses.length : 0

    // Year-based statistics
    const yearStats = {
      year1: courses.filter(c => c.year === 1).length,
      year2: courses.filter(c => c.year === 2).length,
      year3: courses.filter(c => c.year === 3).length,
      year4: courses.filter(c => c.year === 4).length
    }

    return { activeCourses, totalStudents, overallAttendanceRate, overallGrade, yearStats }
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

  // Define table columns for courses
  const columns = [
    {
      key: 'course',
      label: 'Course',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.course_code || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.course_name || 'No course name'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.department || 'General'}
        </Typography>
      )
    },
    {
      key: 'year',
      label: 'Year Level',
      render: (value: any, row: any) => (
        <Chip 
          label={row.yearLabel || 'N/A'} 
          size="small"
          sx={{ 
            backgroundColor: "#000000",
            color: "white",
            fontFamily: "DM Sans",
            fontWeight: 500,
            fontSize: '0.75rem'
          }}
        />
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.credits || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.semester || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'students',
      label: 'Students',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.enrolled_students}/{row.max_students}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Enrolled
          </Typography>
        </Box>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.attendance_rate}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Rate
          </Typography>
        </Box>
      )
    },
    {
      key: 'grade',
      label: 'Avg Grade',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={{ 
            ...TYPOGRAPHY_STYLES.tableBody, 
            color: getGradeColor(row.average_grade),
            fontWeight: 600
          }}>
            {Math.round(row.average_grade)}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Overall
          </Typography>
        </Box>
      )
    },
    {
      key: 'assignments',
      label: 'Assignments',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.assignments_count}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Total
          </Typography>
        </Box>
      )
    },
    {
      key: 'sessions',
      label: 'Sessions',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.sessions_count}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Total
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status === 'active' ? "Active" : row.status === 'completed' ? "Completed" : "Upcoming"} 
          size="small"
          sx={{ 
            backgroundColor: row.status === 'active' ? "#00000020" : row.status === 'completed' ? "#66666620" : "#99999920",
            color: row.status === 'active' ? "#000000" : row.status === 'completed' ? "#666666" : "#999999",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <MUIButton
            size="small"
            variant="contained"
            onClick={() => router.push(`/lecturer/courses/${row.id}`)}
            sx={{
              ...BUTTON_STYLES.primary,
              fontSize: '0.75rem',
              px: 2,
              py: 0.5
            }}
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            View
          </MUIButton>
        </Box>
      )
    }
  ]

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

      {/* Advanced Filters */}
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.status, 
            onChange: (v) => setFilters(prev => ({ ...prev, status: v })), 
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'upcoming', label: 'Upcoming' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Semester', 
            value: filters.semester, 
            onChange: (v) => setFilters(prev => ({ ...prev, semester: v })), 
            options: [
              { value: 'all', label: 'All Semesters' },
              { value: 'Fall 2024', label: 'Fall 2024' },
              { value: 'Spring 2024', label: 'Spring 2024' },
              { value: 'Summer 2024', label: 'Summer 2024' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Year Level', 
            value: filters.year, 
            onChange: (v) => setFilters(prev => ({ ...prev, year: v })), 
            options: [
              { value: 'all', label: 'All Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Department', 
            value: filters.department, 
            onChange: (v) => setFilters(prev => ({ ...prev, department: v })), 
            options: [
              { value: 'all', label: 'All Departments' },
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Mathematics', label: 'Mathematics' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Business', label: 'Business' }
            ], 
            span: 2 
          }
        ]}
      />

      {/* Courses List */}
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
        <DataTable
          title="My Courses"
          subtitle="Manage your assigned courses and track student progress"
          columns={columns}
          data={filteredCourses}
          onRowClick={(course) => router.push(`/lecturer/courses/${course.id}`)}
        />
      )}
    </div>
  )
}
