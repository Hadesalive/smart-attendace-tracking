"use client"

import React, { useState, useEffect, useMemo, useCallback, use } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  Box, 
  Typography,  
  Button, 
  Chip,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { 
  ArrowLeftIcon,
  BookOpenIcon, 
  UsersIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  UserPlusIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import ErrorAlert from "@/components/admin/ErrorAlert"
import FilterBar from "@/components/admin/FilterBar"
import { useCourses, useAttendance, useGrades, useMaterials, useAuth, useAcademicStructure } from "@/lib/domains"
import { Course, Assignment, Submission, AttendanceSession } from "@/lib/types/shared"
import { mapSessionStatus, mapAttendanceStatus } from "@/lib/utils/statusMapping"

interface CourseDetailProps {
  params: Promise<{
    courseId: string
  }>
}

export default function LecturerCourseDetailPage({ params }: CourseDetailProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const courseId = resolvedParams.courseId
  
  // Data Context
  const coursesHook = useCourses()
  const attendance = useAttendance()
  const grades = useGrades()
  const materials = useMaterials()
  const auth = useAuth()
  const academic = useAcademicStructure()
  
  // Extract state and methods
  const { state: coursesState, getCoursesByLecturer, getStudentsByCourse, fetchLecturerAssignments } = coursesHook
  const { getAttendanceSessionsByCourse, getAttendanceRecordsBySession } = attendance
  const { getAssignmentsByCourse, getSubmissionsByAssignment, getStudentGradesByCourse, calculateFinalGrade } = grades
  const { state: materialsState } = materials
  const { state: authState } = auth
  const { state: academicState } = academic
  
  // Direct state access - NO STATE MERGING

  const [activeTab, setActiveTab] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const lecturerId = authState.currentUser?.id || "user_2"

  // Function to get enrolled students using inheritance logic
  const getEnrolledStudentsByCourse = useCallback((courseId: string) => {
    // Early return if data is not loaded
    if (!coursesState.lecturerAssignments || !academicState.sectionEnrollments) {
      return []
    }
    
    // Get course assignments for this specific course
    const courseAssignments = coursesState.lecturerAssignments?.filter((assignment: any) => 
      assignment.course_id === courseId && assignment.lecturer_id === lecturerId
    ) || []
    
    if (courseAssignments.length === 0) {
      return []
    }
    
    const inheritedStudents = new Map()
    
    // For each course assignment, find students enrolled in that program/semester/year
    courseAssignments.forEach((assignment: any) => {
      const studentsInProgram = academicState.sectionEnrollments?.filter((enrollment: any) => 
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
            year: assignment.year || enrollment.year,
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
  }, [coursesState.lecturerAssignments, academicState.sectionEnrollments, lecturerId])

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
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
        
      } catch (error) {
        console.error('Error fetching course details data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Get course details
  const course = useMemo(() => {
    return coursesState.courses.find((c: Course) => c.id === courseId)
  }, [coursesState.courses, courseId])

  // Check if lecturer is assigned to this course
  const isAssigned = useMemo(() => {
    if (!course) return false
    // Check if lecturer is assigned to this course through lecturer_assignments
    return coursesState.lecturerAssignments?.some((assignment: any) => 
      assignment.course_id === courseId && assignment.lecturer_id === lecturerId
    ) || false
  }, [course, courseId, lecturerId, coursesState.lecturerAssignments])

  // Get enrolled students using inheritance logic
  const enrolledStudents = useMemo(() => {
    return getEnrolledStudentsByCourse(courseId)
  }, [getEnrolledStudentsByCourse, courseId])

  // Get course assignments
  const assignments = useMemo(() => {
    return getAssignmentsByCourse(courseId)
  }, [getAssignmentsByCourse, courseId])

  // Get all submissions for assignments
  const allSubmissions = useMemo(() => {
    return assignments.flatMap(assignment => 
      getSubmissionsByAssignment(assignment.id)
    )
  }, [assignments, getSubmissionsByAssignment])

  // Get attendance sessions
  const sessions = useMemo(() => {
    return getAttendanceSessionsByCourse(courseId)
  }, [getAttendanceSessionsByCourse, courseId])

  // Get all attendance records
  const allAttendanceRecords = useMemo(() => {
    return sessions.flatMap(session => 
      getAttendanceRecordsBySession(session.id)
    )
  }, [sessions, getAttendanceRecordsBySession])

  // Get course materials
  const courseMaterials = useMemo(() => {
    return materialsState.materials.filter((material: any) => material.course_id === courseId)
  }, [materialsState.materials, courseId])

  // Calculate stats
  const stats = useMemo(() => {
    const totalAssignments = assignments.length
    const totalSubmissions = allSubmissions.length
    const gradedSubmissions = allSubmissions.filter(sub => sub.grade !== null).length
    const gradingProgress = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0
    
    const presentRecords = allAttendanceRecords.filter(record => {
      const mappedStatus = mapAttendanceStatus(record.status, 'lecturer')
      return mappedStatus === 'present' || mappedStatus === 'late'
    }).length
    const attendanceRate = allAttendanceRecords.length > 0 ? Math.round((presentRecords / allAttendanceRecords.length) * 100) : 0

    return { 
      enrolledStudents: enrolledStudents.length,
      totalAssignments, 
      totalSubmissions,
      gradedSubmissions,
      gradingProgress,
      attendanceRate,
      materialsCount: courseMaterials.length,
      sessionsCount: sessions.length
    }
  }, [enrolledStudents, assignments, allSubmissions, allAttendanceRecords, courseMaterials, sessions])

  // Handlers
  const handleBack = () => {
    router.push('/lecturer/courses')
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Define table columns for students
  const studentColumns = [
    {
      key: 'student',
      label: 'Student',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {row.student_name?.charAt(0) || 'S'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
              {row.student_name || 'Unknown Student'}
            </Typography>
            <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
              {row.student_id_number || 'No ID'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'program',
      label: 'Program',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.program || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.program_code || ''}
          </Typography>
        </Box>
      )
    },
    {
      key: 'year_semester',
      label: 'Year & Semester',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            Year {row.year || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.semester || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'academic_year',
      label: 'Academic Year',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.academic_year || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'sections',
      label: 'Sections',
      render: (value: any, row: any) => {
        const sections = row.sections || []
        if (sections.length === 0) {
          return (
            <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
              No sections
            </Typography>
          )
        }
        
        return (
          <Box>
            {sections.length === 1 ? (
              <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
                {sections[0]}
              </Typography>
            ) : (
              <Box>
                <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
                  {sections[0]}
                </Typography>
                <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
                  +{sections.length - 1} more
                </Typography>
              </Box>
            )}
          </Box>
        )
      }
    },
    {
      key: 'enrollment_date',
      label: 'Enrolled',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.enrollment_date || row.created_at)}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status || 'Active'} 
          size="small"
          sx={{ 
            backgroundColor: row.status === 'active' ? "#00000020" : "#66666620",
            color: row.status === 'active' ? "#000000" : "#666666",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    }
  ]

  // Define table columns for assignments
  const assignmentColumns = [
    {
      key: 'title',
      label: 'Assignment',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.title || 'Untitled Assignment'}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.type || 'Assignment'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.due_date)}
        </Typography>
      )
    },
    {
      key: 'points',
      label: 'Points',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.points || 0}
        </Typography>
      )
    },
    {
      key: 'submissions',
      label: 'Submissions',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.submissions?.length || 0} total
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.graded_count || 0} graded
          </Typography>
        </Box>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.created_at)}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status || 'Active'} 
          size="small"
          sx={{ 
            backgroundColor: row.status === 'active' ? "#00000020" : "#66666620",
            color: row.status === 'active' ? "#000000" : "#666666",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    }
  ]

  // Define table columns for attendance sessions
  const sessionColumns = [
    {
      key: 'session_name',
      label: 'Session',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.session_name || 'Untitled Session'}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.session_type || 'Regular'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'session_date',
      label: 'Date',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.session_date)}
        </Typography>
      )
    },
    {
      key: 'time',
      label: 'Time',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.start_time} - {row.end_time}
        </Typography>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.present_count || 0} present
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.attendance_rate || 0}% rate
          </Typography>
        </Box>
      )
    },
    {
      key: 'total_students',
      label: 'Total Students',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.attendance_records?.length || 0}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status || 'Scheduled'} 
          size="small"
          sx={{ 
            backgroundColor: row.status === 'completed' ? "#00000020" : "#66666620",
            color: row.status === 'completed' ? "#000000" : "#666666",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    }
  ]

  // Define table columns for course materials
  const materialColumns = [
    {
      key: 'title',
      label: 'Material',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1.5, 
            backgroundColor: '#f9f9f9',
            border: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DocumentTextIcon className="h-4 w-4" style={{ color: '#666666' }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
              {row.title || 'Untitled Material'}
            </Typography>
            <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
              {row.type || 'Document'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.description || 'No description'}
        </Typography>
      )
    },
    {
      key: 'file_size',
      label: 'Size',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.file_size || 'Unknown'}
        </Typography>
      )
    },
    {
      key: 'downloads',
      label: 'Downloads',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.download_count || 0}
        </Typography>
      )
    },
    {
      key: 'created_at',
      label: 'Uploaded',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.created_at)}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status || 'Active'} 
          size="small"
          sx={{ 
            backgroundColor: row.status === 'active' ? "#00000020" : "#66666620",
            color: row.status === 'active' ? "#000000" : "#666666",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    }
  ]

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Course Details"
          subtitle="Loading course information..."
          actions={null}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography variant="body1">Loading course details...</Typography>
        </Box>
      </Box>
    )
  }

  // Course not found
  if (!course) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Course Not Found"
          subtitle="The requested course could not be found"
          actions={
        <Button
              variant="outlined"
              startIcon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={handleBack}
              sx={BUTTON_STYLES.outlined}
        >
          Back to Courses
        </Button>
          }
        />
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '2px dashed #e5e5e5',
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            Course Not Found
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            The course you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={BUTTON_STYLES.primary}
          >
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  // Not assigned
  if (!isAssigned) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Not Assigned"
          subtitle="You are not assigned to teach this course"
          actions={
        <Button
              variant="outlined"
              startIcon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={handleBack}
              sx={BUTTON_STYLES.outlined}
        >
          Back to Courses
        </Button>
          }
        />
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '2px dashed #e5e5e5',
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            Not Assigned
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            You are not assigned to teach this course. Contact your department head for course assignments.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={BUTTON_STYLES.primary}
          >
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  const statsCards = [
    { 
      title: "Enrolled Students", 
      value: stats.enrolledStudents, 
      icon: UsersIcon, 
      color: "#000000",
      subtitle: "Total enrolled",
      change: "Active students"
    },
    { 
      title: "Assignments", 
      value: `${stats.gradedSubmissions}/${stats.totalSubmissions}`, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Graded",
      change: `${stats.gradingProgress}% complete`
    },
    { 
      title: "Attendance Rate", 
      value: `${stats.attendanceRate}%`, 
      icon: CalendarDaysIcon, 
      color: "#000000",
      subtitle: "Overall",
      change: `${stats.sessionsCount} sessions`
    },
    { 
      title: "Materials", 
      value: stats.materialsCount, 
      icon: DocumentTextIcon, 
      color: "#000000",
      subtitle: "Uploaded",
      change: "Course resources"
    }
  ]

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={`${course.course_code} - ${course.course_name}`}
        subtitle={`${course.credits} Credits • ${course.department || 'General'}`}
        actions={null}
      />

      <StatsGrid stats={statsCards} />

      {/* Course Content */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: '#e5e5e5',
              px: 3,
              pt: 2,
              '& .MuiTabs-indicator': {
                backgroundColor: '#000000',
                height: 3,
                borderRadius: '2px 2px 0 0'
              },
              '& .MuiTab-root': {
                color: '#666666',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.875rem',
                minHeight: 56,
                px: 3,
                py: 1.5,
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  color: '#000000',
                  fontWeight: 600,
                  backgroundColor: '#f9f9f9'
                },
                '&:hover': {
                  color: '#000000',
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-1px)'
                }
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BookOpenIcon className="h-4 w-4" />
                  Course Information
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UserGroupIcon className="h-4 w-4" />
                  Enrolled Students
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpenIcon className="h-4 w-4" />
                  Assignments
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarDaysIcon className="h-4 w-4" />
                  Attendance
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocumentTextIcon className="h-4 w-4" />
                  Materials
                </Box>
              } 
            />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>

            {activeTab === 0 && (
              <Box sx={{ space: 3 }}>
                {/* Enhanced Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    color: '#000000',
                    mb: 0.5
                  }}>
                    Course Information
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'DM Sans, sans-serif',
                    color: '#666666',
                    fontSize: '0.875rem'
                  }}>
                    View detailed information about this course
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
                  gap: { xs: 2, sm: 3 },
                  alignItems: 'start'
                }}>
                  <Box sx={{ 
                    p: { xs: 2, sm: 3 },
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    border: '1px solid #e5e5e5'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: '#666666', 
                      mb: 1.5, 
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem'
                    }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      mb: 3, 
                      lineHeight: 1.6,
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#333333'
                    }}>
                      {(course as any).description || 'No description available for this course.'}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    backgroundColor: '#f9f9f9', 
                    p: { xs: 2, sm: 3 }, 
                    borderRadius: 2,
                    border: '1px solid #e5e5e5'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: '#666666', 
                      mb: 2, 
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem'
                    }}>
                      Course Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: { xs: 1, sm: 1.5 },
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#666666'
                        }}>
                          Course Code:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#000000'
                        }}>
                          {course.course_code}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: { xs: 1, sm: 1.5 },
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#666666'
                        }}>
                          Credits:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#000000'
                        }}>
                          {course.credits}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: { xs: 1, sm: 1.5 },
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#666666'
                        }}>
                          Department:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#000000',
                          textAlign: 'right',
                          maxWidth: '60%'
                        }}>
                          {course.department || 'General'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: { xs: 1, sm: 1.5 },
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#666666'
                        }}>
                          Status:
                        </Typography>
                        <Chip 
                          label="Active" 
                          size="small"
                          sx={{ 
                            backgroundColor: '#00000020',
                            color: '#000000',
                            fontFamily: "DM Sans",
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: { xs: 1, sm: 1.5 }
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#666666'
                        }}>
                          Created:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#000000'
                        }}>
                          {formatDate(course.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {/* Enhanced Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    color: '#000000',
                    mb: 0.5
                  }}>
                    Enrolled Students
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'DM Sans, sans-serif',
                    color: '#666666',
                    fontSize: '0.875rem'
                  }}>
                    View and manage students enrolled in this course
                  </Typography>
                </Box>
              
                {enrolledStudents.length === 0 ? (
                  <Box sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 3,
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      backgroundColor: '#00000020', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mx: 'auto', 
                      mb: 3 
                    }}>
                      <UserGroupIcon className="h-8 w-8" style={{ color: '#666666' }} />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#000000',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }}>
                      No Students Enrolled
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 4, 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif',
                      maxWidth: 400,
                      mx: 'auto'
                    }}>
                      No students are currently enrolled in this course. Students will appear here once they are enrolled through program assignments.
                    </Typography>
                  </Box>
                ) : (
                  <DataTable
                    title=""
                    subtitle=""
                    columns={studentColumns}
                    data={enrolledStudents}
                    onRowClick={(student) => router.push(`/lecturer/students/${student.student_id}`)}
                  />
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                {/* Enhanced Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      color: '#000000',
                      mb: 0.5
                    }}>
                      Assignments
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#666666',
                      fontSize: '0.875rem'
                    }}>
                      Manage course assignments and submissions
                    </Typography>
                  </Box>
                <Button
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                  onClick={() => router.push(`/lecturer/homework?course=${courseId}`)}
                    sx={{
                      ...BUTTON_STYLES.primary,
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                  Manage Assignments
                </Button>
                </Box>
              
                {assignments.length === 0 ? (
                  <Box sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 3,
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      backgroundColor: '#00000020', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mx: 'auto', 
                      mb: 3 
                    }}>
                      <BookOpenIcon className="h-8 w-8" style={{ color: '#666666' }} />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#000000',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }}>
                      No Assignments
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 4, 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif',
                      maxWidth: 400,
                      mx: 'auto'
                    }}>
                      No assignments have been created for this course yet. Create your first assignment to get started.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/lecturer/homework?course=${courseId}`)}
                      sx={{
                        ...BUTTON_STYLES.primary,
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      Create First Assignment
                    </Button>
                  </Box>
                ) : (
                  <DataTable
                    title=""
                    subtitle=""
                    columns={assignmentColumns}
                    data={assignments}
                    onRowClick={(assignment) => router.push(`/lecturer/homework/${assignment.id}`)}
                  />
                )}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                {/* Enhanced Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      color: '#000000',
                      mb: 0.5
                    }}>
                      Attendance Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#666666',
                      fontSize: '0.875rem'
                    }}>
                      Manage attendance tracking and sessions
                    </Typography>
                  </Box>
                <Button
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                  onClick={() => router.push(`/lecturer/attendance?course=${courseId}`)}
                    sx={{
                      ...BUTTON_STYLES.primary,
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                  Manage Attendance
                </Button>
                </Box>
              
                {sessions.length === 0 ? (
                  <Box sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 3,
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      backgroundColor: '#00000020', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mx: 'auto', 
                      mb: 3 
                    }}>
                      <CalendarDaysIcon className="h-8 w-8" style={{ color: '#666666' }} />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#000000',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }}>
                      No Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 4, 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif',
                      maxWidth: 400,
                      mx: 'auto'
                    }}>
                      No attendance sessions have been created for this course yet. Create your first session to start tracking attendance.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/lecturer/attendance?course=${courseId}`)}
                      sx={{
                        ...BUTTON_STYLES.primary,
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      Create First Session
                    </Button>
                  </Box>
                ) : (
                  <DataTable
                    title=""
                    subtitle=""
                    columns={sessionColumns}
                    data={sessions}
                    onRowClick={(session) => router.push(`/lecturer/attendance/${session.id}`)}
                  />
                )}
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                {/* Enhanced Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      color: '#000000',
                      mb: 0.5
                    }}>
                      Course Materials
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#666666',
                      fontSize: '0.875rem'
                    }}>
                      Manage course materials and resources
                    </Typography>
                  </Box>
                <Button
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                  onClick={() => router.push(`/lecturer/materials?course=${courseId}`)}
                    sx={{
                      ...BUTTON_STYLES.primary,
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                  Manage Materials
                </Button>
                </Box>
              
                {courseMaterials.length === 0 ? (
                  <Box sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 3,
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      backgroundColor: '#00000020', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mx: 'auto', 
                      mb: 3 
                    }}>
                      <DocumentTextIcon className="h-8 w-8" style={{ color: '#666666' }} />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#000000',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }}>
                      No Materials
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 4, 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif',
                      maxWidth: 400,
                      mx: 'auto'
                    }}>
                      No materials have been uploaded for this course yet. Upload your first material to share resources with students.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/lecturer/materials?course=${courseId}`)}
                      sx={{
                        ...BUTTON_STYLES.primary,
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      Upload First Material
                    </Button>
                  </Box>
                ) : (
                  <DataTable
                    title=""
                    subtitle=""
                    columns={materialColumns}
                    data={courseMaterials}
                    onRowClick={(material) => router.push(`/lecturer/materials/${material.id}`)}
                  />
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

    </Box>
  )
}