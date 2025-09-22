"use client"

import React, { useState, useMemo } from "react"
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
  Chip
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
interface StudentCourse {
  id: string
  course_code: string
  course_name: string
  instructor: string
  credits: number
  semester: string
  status: "active" | "completed" | "dropped"
  attendanceRate: number
  averageGrade: number
  materialsCount: number
  totalAssignments: number
  submittedAssignments: number
  progress: number
  description: string
  schedule: {
    days: string[]
    time: string
    location: string
  }
  nextSession?: {
    title: string
    date: string
    time: string
  }
}

export default function StudentCoursesPage() {
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
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    department: 'all',
    program: 'all',
    academicYear: 'all',
    semester: 'all',
    status: 'all',
    grade: 'all',
    year: 'all'
  })

  // Get student's courses from shared data
  const studentId = state.currentUser?.id || "user_1" // Use actual current user ID
  
  const courses = useMemo(() => {
    // Get student's program and semester from their profile
    const studentProfile = state.studentProfiles?.find((profile: any) => profile.user_id === studentId)
    if (!studentProfile) return []
    
    // Get student's section enrollment
    const sectionEnrollment = state.sectionEnrollments?.find((enrollment: any) => 
      enrollment.student_id === studentId && enrollment.status === 'active'
    )
    if (!sectionEnrollment) return []
    
    // Get section details
    const section = state.sections?.find((s: any) => s.id === sectionEnrollment.section_id)
    if (!section) return []
    
    // Get courses assigned to the student's program and semester
    const programCourses = state.courseAssignments
      ?.filter((assignment: any) => 
        assignment.program_id === section.program_id &&
        assignment.semester_id === section.semester_id &&
        assignment.academic_year_id === section.academic_year_id
      )
      .map((assignment: any) => {
        const course = state.courses?.find((c: any) => c.id === assignment.course_id)
        if (!course) return null
      // Calculate course-specific stats
      const assignments = getAssignmentsByCourse(course.id)
      const submittedAssignments = assignments.filter((assignment: Assignment) => {
        const submissions = getSubmissionsByAssignment(assignment.id)
        return submissions.some((s: Submission) => s.student_id === studentId)
      }).length
      
      // Calculate attendance rate
      let totalSessions = 0
      let presentSessions = 0
      const courseSessions = getAttendanceSessionsByCourse(course.id)
      courseSessions.forEach(session => {
        const records = getAttendanceRecordsBySession(session.id)
        const studentRecord = records.find(r => r.student_id === studentId)
        if (studentRecord) {
          totalSessions++
          const mappedStatus = mapAttendanceStatus(studentRecord.status, 'student')
          if (mappedStatus === 'present' || mappedStatus === 'late') {
            presentSessions++
          }
        }
      })
      const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0
      
      // Calculate average grade
      const grades = getStudentGradesByCourse(studentId, course.id)
      const averageGrade = grades.length > 0 ? Math.round(calculateFinalGrade(studentId, course.id)) : 0
      
      // Get next session
      const futureSessions = courseSessions.filter(session => 
        new Date(session.session_date || '') >= new Date()
      ).sort((a, b) => new Date(a.session_date || '').getTime() - new Date(b.session_date || '').getTime())
      
      const nextSession = futureSessions[0]
      
        // Get lecturer information
        const lecturer = state.lecturerProfiles?.find((l: any) => l.id === course.lecturer_id)
        const instructor = lecturer ? `${(lecturer as any).full_name || 'Lecturer'}` : 'TBA'
        
        // Get semester information
        const semester = state.semesters?.find((s: any) => s.id === section.semester_id)
        const academicYear = state.academicYears?.find((ay: any) => ay.id === section.academic_year_id)
        const semesterName = semester ? `${(academicYear as any)?.year || 'Current'} - ${semester.semester_name}` : 'Current Semester'
        
        // Get year information from section
        const year = section.year || 1
        const yearLabel = `Year ${year}`
        const yearDescription = year === 1 ? 'First Year' : 
                               year === 2 ? 'Second Year' : 
                               year === 3 ? 'Third Year' : 'Fourth Year'
        
      return {
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
          instructor,
        credits: course.credits || 3,
          semester: semesterName,
          year,
          yearLabel,
          yearDescription,
        status: "active" as const,
        attendanceRate,
        averageGrade,
          materialsCount: state.materials?.filter((m: any) => m.course_id === course.id).length || 0,
        totalAssignments: assignments.length,
        submittedAssignments,
        progress: assignments.length > 0 ? Math.round((submittedAssignments / assignments.length) * 100) : 0,
          description: (course as any).description || 'No description available',
        schedule: {
            days: ["Monday", "Wednesday", "Friday"], // This should come from course schedule data
            time: "10:00 - 11:30", // This should come from course schedule data
            location: "Room 101" // This should come from course schedule data
        },
        nextSession: nextSession ? {
          title: nextSession.session_name,
          date: nextSession.session_date || new Date().toISOString(),
          time: `${nextSession.start_time || 'TBD'} - ${nextSession.end_time || 'TBD'}`
        } : undefined
      }
    })
      .filter(Boolean)
    
    return programCourses || []
  }, [state.courses, state.courseAssignments, state.sections, state.sectionEnrollments, state.studentProfiles, state.materials, state.lecturerProfiles, state.semesters, state.academicYears, getAssignmentsByCourse, getSubmissionsByAssignment, getAttendanceSessionsByCourse, getAttendanceRecordsBySession, getStudentGradesByCourse, calculateFinalGrade, studentId])

  // Legacy mock data for reference
  const legacyCourses: StudentCourse[] = [
    {
      id: "1",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      credits: 3,
      semester: "Fall 2024",
      status: "active",
      attendanceRate: 92,
      averageGrade: 87,
      materialsCount: 15,
      totalAssignments: 8,
      submittedAssignments: 7,
      progress: 75,
      description: "An introduction to the fundamental concepts of computer science including programming, data structures, and algorithms.",
      schedule: {
        days: ["Monday", "Wednesday", "Friday"],
        time: "10:00 - 11:30",
        location: "Room 101"
      },
      nextSession: {
        title: "Object-Oriented Programming",
        date: "2024-01-24T10:00:00",
        time: "10:00 - 11:30"
      }
    },
    {
      id: "2",
      course_code: "MATH201",
      course_name: "Calculus II",
      instructor: "Prof. Johnson",
      credits: 4,
      semester: "Fall 2024",
      status: "active",
      attendanceRate: 93,
      averageGrade: 82,
      materialsCount: 20,
      totalAssignments: 12,
      submittedAssignments: 11,
      progress: 68,
      description: "Advanced calculus covering integration techniques, sequences, series, and multivariable calculus.",
      schedule: {
        days: ["Tuesday", "Thursday"],
        time: "09:00 - 10:30",
        location: "Room 301"
      },
      nextSession: {
        title: "Integration by Parts",
        date: "2024-01-23T09:00:00",
        time: "09:00 - 10:30"
      }
    },
    {
      id: "3",
      course_code: "ENG101",
      course_name: "English Composition",
      instructor: "Dr. Brown",
      credits: 3,
      semester: "Fall 2024",
      status: "active",
      attendanceRate: 90,
      averageGrade: 91,
      materialsCount: 12,
      totalAssignments: 6,
      submittedAssignments: 5,
      progress: 80,
      description: "Fundamentals of academic writing including essay structure, research methods, and citation styles.",
      schedule: {
        days: ["Monday", "Wednesday"],
        time: "13:00 - 14:30",
        location: "Room 205"
      },
      nextSession: {
        title: "Research Paper Workshop",
        date: "2024-01-24T13:00:00",
        time: "13:00 - 14:30"
      }
    }
  ]

  // Computed values
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Filter by search term
    if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
      filtered = filtered.filter((course: any) => 
      course.course_code.toLowerCase().includes(query) ||
      course.course_name.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query)
    )
    }

    // Advanced filters
    if (filters.status !== 'all') {
      filtered = filtered.filter((course: any) => course.status === filters.status)
    }

    if (filters.grade !== 'all') {
      filtered = filtered.filter((course: any) => {
        switch (filters.grade) {
          case 'excellent': return course.averageGrade >= 90
          case 'good': return course.averageGrade >= 80 && course.averageGrade < 90
          case 'satisfactory': return course.averageGrade >= 70 && course.averageGrade < 80
          case 'needs_improvement': return course.averageGrade < 70
          default: return true
        }
      })
    }

    if (filters.year !== 'all') {
      filtered = filtered.filter((course: any) => course.year === parseInt(filters.year))
    }

    return filtered
  }, [courses, searchQuery, filters])

  const stats = useMemo(() => {
    const activeCourses = courses.filter((c: any) => c.status === 'active').length
    const totalCredits = courses.reduce((sum: number, c: any) => sum + c.credits, 0)
    const overallAttendanceRate = courses.length > 0 
      ? courses.reduce((sum: number, c: any) => sum + c.attendanceRate, 0) / courses.length : 0
    const overallGrade = courses.length > 0
      ? courses.reduce((sum: number, c: any) => sum + c.averageGrade, 0) / courses.length : 0

    // Year-based statistics
    const yearStats = {
      year1: courses.filter((c: any) => c.year === 1).length,
      year2: courses.filter((c: any) => c.year === 2).length,
      year3: courses.filter((c: any) => c.year === 3).length,
      year4: courses.filter((c: any) => c.year === 4).length
    }

    return { activeCourses, totalCredits, overallAttendanceRate, overallGrade, yearStats }
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
      case "dropped":
        return <Chip label="Dropped" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
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
      key: 'instructor',
      label: 'Instructor',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.instructor || 'TBA'}
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
      key: 'attendance',
      label: 'Attendance',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.attendanceRate}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Rate
          </Typography>
        </Box>
      )
    },
    {
      key: 'grade',
      label: 'Average Grade',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={{ 
            ...TYPOGRAPHY_STYLES.tableBody, 
            color: getGradeColor(row.averageGrade),
            fontWeight: 600
          }}>
            {Math.round(row.averageGrade)}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Overall
          </Typography>
        </Box>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.progress}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.submittedAssignments}/{row.totalAssignments} assignments
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status === 'active' ? "Active" : row.status === 'completed' ? "Completed" : "Dropped"} 
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
            onClick={() => router.push(`/student/courses/${row.id}`)}
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
          <p className="text-muted-foreground font-dm-sans">Manage your enrolled courses and track your progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined" 
            startIcon={<ChartBarIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
          >
            Academic Report
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
        <StatCard title="Total Credits" value={formatNumber(stats.totalCredits)} icon={AcademicCapIcon} color="#000000" change="Enrolled" />
        <StatCard title="Attendance Rate" value={`${Math.round(stats.overallAttendanceRate)}%`} icon={CheckCircleIcon} color="#000000" change="Overall" />
        <StatCard title="Average Grade" value={`${Math.round(stats.overallGrade)}%`} icon={ChartBarIcon} color="#000000" change="All courses" />
      </Box>

      {/* Search */}
      <MUICard sx={{ ...CARD_SX, '&:hover': {} }}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Search Courses
            </Typography>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="Search by course code, name, or instructor..."
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
              { value: 'dropped', label: 'Dropped' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Grade Range', 
            value: filters.grade, 
            onChange: (v) => setFilters(prev => ({ ...prev, grade: v })), 
            options: [
              { value: 'all', label: 'All Grades' },
              { value: 'excellent', label: '90% and above' },
              { value: 'good', label: '80-89%' },
              { value: 'satisfactory', label: '70-79%' },
              { value: 'needs_improvement', label: 'Below 70%' }
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
          }
        ]}
      />

      {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <MUICard sx={{ ...CARD_SX, '&:hover': {} }}>
            <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              <BookOpenIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                {searchQuery ? 'No Courses Found' : 'No Courses Enrolled'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', mb: 4, maxWidth: 400, mx: 'auto' }}>
                {searchQuery 
                  ? `No courses match "${searchQuery}". Try adjusting your search terms.`
                  : 'You are not enrolled in any courses yet. Contact your academic advisor for enrollment assistance.'
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
          subtitle="View and manage your enrolled courses"
          columns={columns}
          data={filteredCourses}
          onRowClick={(course) => router.push(`/student/courses/${course.id}`)}
        />
      )}
    </div>
  )
}
