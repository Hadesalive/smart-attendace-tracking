"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
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
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import { BUTTON_STYLES as ADMIN_BUTTON_STYLES } from "@/lib/constants/admin-constants"
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
  const { 
    state: coursesState, 
    getCoursesByLecturer, 
    getStudentsByCourse,
    fetchLecturerAssignments
  } = coursesHook
  const { getAttendanceSessionsByCourse, getAttendanceRecordsBySession } = attendance
  const { getAssignmentsByCourse, getSubmissionsByAssignment, getStudentGradesByCourse, calculateFinalGrade } = grades
  const { state: materialsState } = materials
  const { state: authState } = auth
  
  // Create merged state object with academic data
  const state = {
    ...dataState,
    ...attendance.state,
    ...grades.state,
    ...academic.state,
    ...coursesState, // Put coursesState last to ensure courses are not overridden
    materials: materialsState.materials,
    currentUser: authState.currentUser,
    lecturerAssignments: coursesState.lecturerAssignments || [],
    // Ensure academic data is properly accessible
    semesters: academic.state.semesters,
    departments: academic.state.departments,
    academicYears: academic.state.academicYears,
    programs: academic.state.programs,
    sectionEnrollments: academic.state.sectionEnrollments || []
  }

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [filtersLoading, setFiltersLoading] = useState(true)
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    status: 'all',
    semester: 'all',
    year: 'all',
    department: 'all'
  })

  // Get lecturer's courses from shared data
  const lecturerId = state.currentUser?.id || "user_2" // Use actual current user ID
  
  // Function to get enrolled students using inheritance logic
  const getEnrolledStudentsByCourse = useCallback((courseId: string) => {
    // Early return if data is not loaded
    if (!state.lecturerAssignments || !state.sectionEnrollments) {
      return []
    }
    
    // Get course assignments for this specific course
    const courseAssignments = state.lecturerAssignments?.filter((assignment: any) => 
      assignment.course_id === courseId && assignment.lecturer_id === lecturerId
    ) || []
    
    if (courseAssignments.length === 0) {
      return []
    }
    
    const inheritedStudents = new Map()
    
    // For each course assignment, find students enrolled in that program/semester/year
    courseAssignments.forEach((assignment: any) => {
      const studentsInProgram = state.sectionEnrollments?.filter((enrollment: any) => 
        enrollment.program_id === assignment.program_id &&
        enrollment.semester_id === assignment.semester_id &&
        enrollment.academic_year_id === assignment.academic_year_id &&
        (enrollment.year === assignment.year || assignment.year === undefined) && // Handle undefined year
        enrollment.status === 'active'
      ) || []
      
      // Add each student to the map with their program context
      studentsInProgram.forEach((enrollment: any) => {
        const studentKey = `${enrollment.student_id}-${assignment.program_id}-${assignment.semester_id}-${assignment.academic_year_id}`
        
        if (!inheritedStudents.has(studentKey)) {
          inheritedStudents.set(studentKey, {
            id: enrollment.id,
            student_id: enrollment.student_id,
            student_name: enrollment.student_name || 'N/A',
            student_id_number: enrollment.student_id_number || 'N/A',
            program: assignment.programs?.program_name || 'N/A',
            program_code: assignment.programs?.program_code || 'N/A',
            year: assignment.year,
            semester: assignment.semesters?.semester_name || 'N/A',
            academic_year: assignment.academic_years?.year_name || 'N/A',
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
            // Show which sections they're in
            sections: [enrollment.section_code].filter(Boolean),
            // Add assignment context
            assignment_id: assignment.id,
            is_mandatory: assignment.is_mandatory,
            max_students: assignment.max_students
          })
        } else {
          // Add section to existing student
          const existingStudent = inheritedStudents.get(studentKey)
          if (enrollment.section_code && !existingStudent.sections.includes(enrollment.section_code)) {
            existingStudent.sections.push(enrollment.section_code)
          }
        }
      })
    })
    
    return Array.from(inheritedStudents.values())
  }, [state.lecturerAssignments, state.sectionEnrollments, lecturerId])
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setFiltersLoading(true)
        await Promise.all([
          auth.loadCurrentUser(), // Load the current user first
          coursesHook.fetchCourses(),
          fetchLecturerAssignments(),
          attendance.fetchAttendanceSessions(),
          materials.fetchMaterials(),
          academic.fetchLecturerProfiles(),
          academic.fetchSections(),
          academic.fetchSectionEnrollments(),
          academic.fetchSemesters(),
          academic.fetchAcademicYears(),
          academic.fetchPrograms(),
          academic.fetchDepartments()
        ])
        
        // Wait for state to be updated
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Force state update by triggering a re-render
        setFiltersLoading(false)
        
        
      } catch (error) {
        console.error('Error fetching lecturer courses data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  const courses = useMemo(() => {
    
    // Get lecturer's assigned courses from lecturer_assignments table
    // Only show courses assigned to the current lecturer - no fallbacks
    const lecturerAssignments = state.lecturerAssignments?.filter((assignment: any) => 
      assignment.lecturer_id === lecturerId
    ) || []
    
    
    
    const lecturerCourses = lecturerAssignments.map((assignment: any) => {
      const course = state.courses?.find((c: any) => c.id === assignment.course_id)
      if (!course) return null
      
      // Calculate course-specific stats
      const assignments = getAssignmentsByCourse(course.id)
      const students = getEnrolledStudentsByCourse(course.id)
      
      // Calculate attendance rate
      const courseSessions = getAttendanceSessionsByCourse(course.id)
      let totalSessions = 0
      let presentSessions = 0
      
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
      
      // Get assignment information
      const section = state.sections?.find((s: any) => s.id === assignment?.section_id)
      const semester = state.semesters?.find((s: any) => s.id === assignment?.semester_id)
      const academicYear = state.academicYears?.find((ay: any) => ay.id === assignment?.academic_year_id)
      const program = state.programs?.find((p: any) => p.id === assignment?.program_id)
      
      // Get year information from section
      const year = section?.year || 1
      const years = [year]
      const primaryYear = year
      
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
        max_students: 50, // Default max students
        attendance_rate: attendanceRate,
        average_grade: averageGrade,
        materials_count: state.materials.filter((m: any) => m.course_id === course.id).length,
        assignments_count: assignments.length,
        sessions_count: courseSessions.length,
        description: (course as any).description || "Course description not available",
        schedule: {
          days: assignment?.teaching_days || ["TBD"], // Get from assignment data
          time: assignment?.teaching_time || "TBD", // Get from assignment data
          location: section?.classroom_id || "TBD" // Get from section data
        },
        next_session: nextSession ? {
          title: nextSession.session_name,
          date: nextSession.session_date || new Date().toISOString(),
          time: `${nextSession.start_time || 'TBD'} - ${nextSession.end_time || 'TBD'}`
        } : undefined
      }
    }).filter(Boolean)
    
    // Fallback: If no lecturer assignments, try to get courses directly assigned to lecturer
    if (lecturerCourses.length === 0) {
      const directCourses = state.courses?.filter((course: any) => course.lecturer_id === lecturerId) || []
      
      return directCourses.map(course => {
        if (!course) return null
        
        // Calculate course-specific stats for direct courses
        const assignments = getAssignmentsByCourse(course.id)
        const students = getEnrolledStudentsByCourse(course.id)
        
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
          semester: "Current Semester",
          academic_year: "Current",
          year: 1,
          yearLabel: "Year 1",
          years: [1],
          status: "active" as const,
          enrolled_students: students.length,
          max_students: 50,
          attendance_rate: attendanceRate,
          average_grade: averageGrade,
          materials_count: state.materials.filter((m: any) => m.course_id === course.id).length,
          assignments_count: assignments.length,
          sessions_count: courseSessions.length,
          description: (course as any).description || "Course description not available",
          schedule: {
            days: ["TBD"],
            time: "TBD",
            location: "TBD"
          },
          next_session: nextSession ? {
            title: nextSession.session_name,
            date: nextSession.session_date || new Date().toISOString(),
            time: `${nextSession.start_time || 'TBD'} - ${nextSession.end_time || 'TBD'}`
          } : undefined
        }
      }).filter(Boolean)
    }
    
    return lecturerCourses
  }, [lecturerId, state.lecturerAssignments, state.courses, state.sections, state.semesters, state.academicYears, state.programs, getStudentsByCourse, getAssignmentsByCourse, getAttendanceSessionsByCourse, getAttendanceRecordsBySession, getStudentGradesByCourse, calculateFinalGrade, state.materials])

  // Computed values
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((course): course is NonNullable<typeof course> => course !== null)

    // Filter by search term
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course => 
        course.course_code.toLowerCase().includes(query) ||
        course.course_name.toLowerCase().includes(query) ||
        (course as any).department?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(course => course.status === filters.status)
    }

    // Filter by semester
    if (filters.semester !== "all") {
      filtered = filtered.filter(course => (course as any).semester === filters.semester)
    }

    // Filter by year
    if (filters.year !== "all") {
      filtered = filtered.filter(course => (course as any).year === parseInt(filters.year))
    }

    // Filter by department
    if (filters.department !== "all") {
      filtered = filtered.filter(course => (course as any).department === filters.department)
    }

    return filtered
  }, [courses, searchQuery, filters])

  const stats = useMemo(() => {
    const validCourses = courses.filter((c): c is NonNullable<typeof c> => c !== null)
    const activeCourses = validCourses.filter(c => c.status === 'active').length
    const totalStudents = validCourses.reduce((sum, c) => sum + (c as any).enrolled_students, 0)
    const overallAttendanceRate = validCourses.length > 0 
      ? validCourses.reduce((sum, c) => sum + (c as any).attendance_rate, 0) / validCourses.length : 0
    const overallGrade = validCourses.length > 0
      ? validCourses.reduce((sum, c) => sum + (c as any).average_grade, 0) / validCourses.length : 0

    // Year-based statistics
    const yearStats = {
      year1: validCourses.filter(c => (c as any).year === 1).length,
      year2: validCourses.filter(c => (c as any).year === 2).length,
      year3: validCourses.filter(c => (c as any).year === 3).length,
      year4: validCourses.filter(c => (c as any).year === 4).length
    }

    return { activeCourses, totalStudents, overallAttendanceRate, overallGrade, yearStats }
  }, [courses])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => setSearchQuery("")

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      semester: 'all',
      year: 'all',
      department: 'all'
    })
  }

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

  const statsCards = [
    { 
      title: "Active Courses", 
      value: formatNumber(stats.activeCourses), 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "This semester",
      change: "Currently teaching"
    },
    { 
      title: "Total Students", 
      value: formatNumber(stats.totalStudents), 
      icon: UsersIcon, 
      color: "#000000",
      subtitle: "Enrolled",
      change: "Across all courses"
    },
    { 
      title: "Avg Attendance", 
      value: `${Math.round(stats.overallAttendanceRate)}%`, 
      icon: CheckCircleIcon, 
      color: "#000000",
      subtitle: "Overall rate",
      change: "All courses"
    },
    { 
      title: "Avg Grade", 
      value: `${Math.round(stats.overallGrade)}%`, 
      icon: ChartBarIcon, 
      color: "#000000",
      subtitle: "Overall average",
      change: "All courses"
    }
  ]

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="My Courses"
        subtitle="Manage your assigned courses and track student progress"
        actions={
          <MUIButton 
            variant="outlined" 
            startIcon={<ChartBarIcon className="h-4 w-4" />}
            sx={{
              ...ADMIN_BUTTON_STYLES.outlined,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none'
            }}
          >
            Course Analytics
          </MUIButton>
        }
      />

      <StatsGrid stats={statsCards} />

      {/* Search and Filters */}
      <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
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
            
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Advanced Filters - Only render when data is available */}
      {!filtersLoading && state.semesters && state.departments && (
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
              ...(state.semesters?.map((semester: any) => ({
                value: semester.semester_name,
                label: `${state.academicYears?.find((ay: any) => ay.id === semester.academic_year_id)?.year_name || 'Current'} - ${semester.semester_name}`
              })) || [])
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
              ...(state.departments?.map((dept: any) => ({
                value: dept.department_name,
                label: dept.department_name
              })) || [])
            ], 
            span: 2 
            },
            { 
              type: 'clear-button', 
              label: 'Clear Filters', 
              onClick: handleClearFilters, 
              span: 2 
          }
        ]}
      />
      )}

      {/* Loading state for filters */}
      {filtersLoading && (
        <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Loading Filters...
              </Typography>
            </Box>
            <LinearProgress sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              Preparing filter options...
            </Typography>
          </MUICardContent>
        </MUICard>
      )}

      {/* Courses List */}
      {isLoading ? (
        <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
          <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
              Loading your courses...
            </Typography>
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              Please wait while we fetch your course assignments.
            </Typography>
          </MUICardContent>
        </MUICard>
      ) : filteredCourses.length === 0 ? (
        <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
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
                sx={{
                  ...ADMIN_BUTTON_STYLES.outlined,
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none'
                }}
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
    </Box>
  )
}