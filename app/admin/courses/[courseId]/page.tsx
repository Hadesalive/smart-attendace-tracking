"use client"

import React, { useState, useEffect, useMemo, use } from "react"
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
import { useCourses } from "@/lib/domains/courses/hooks"
import { useAcademicStructure } from "@/lib/domains/academic/hooks"
import { useAuth } from "@/lib/domains/auth/hooks"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import ErrorAlert from "@/components/admin/ErrorAlert"
import FilterBar from "@/components/admin/FilterBar"
import CourseAssignmentForm from "@/components/admin/forms/CourseAssignmentForm"
import TeacherAssignmentForm from "@/components/admin/forms/TeacherAssignmentForm"
import CourseForm from "@/components/admin/forms/CourseForm"
import { Course } from "@/lib/types/shared"

interface CourseDetailProps {
  params: Promise<{
    courseId: string
  }>
}

export default function CourseDetailPage({ params }: CourseDetailProps) {
  const router = useRouter()
  const { courseId } = use(params)
  
  // Data Context
  const courses = useCourses()
  const academic = useAcademicStructure()
  const auth = useAuth()
  
  // Extract state and methods
  const { 
    state: coursesState, 
    fetchCourses, 
    updateCourse,
    deleteCourse,
    getStudentsByCourse,
    fetchCourseAssignments,
    createCourseAssignment,
    updateCourseAssignment,
    deleteCourseAssignment,
    fetchLecturerAssignments,
    getLecturersByCourse,
    createTeacherAssignment,
    updateTeacherAssignment
  } = courses
  const { 
    state: academicState,
    fetchLecturerProfiles,
    fetchSectionEnrollments,
    fetchPrograms,
    fetchAcademicYears,
    fetchSemesters,
    fetchSections
  } = academic
  
  // Create legacy state object for compatibility
  const state = {
    ...coursesState,
    lecturerProfiles: academicState.lecturerProfiles,
    lecturerAssignments: coursesState.lecturerAssignments,
    users: auth.state.users,
    academicYears: academicState.academicYears,
    semesters: academicState.semesters,
    programs: academicState.programs,
    sections: academicState.sections,
    sectionEnrollments: academicState.sectionEnrollments
  } as any

  const [activeTab, setActiveTab] = useState(0)
  const [isEditOpen, setEditOpen] = useState(false)
  const [isAddAssignmentOpen, setAddAssignmentOpen] = useState(false)
  const [isEditAssignmentOpen, setEditAssignmentOpen] = useState(false)
  const [isAssignLecturerOpen, setAssignLecturerOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [selectedLecturer, setSelectedLecturer] = useState<string>("")
  const [lecturerAssignmentMode, setLecturerAssignmentMode] = useState<'create' | 'edit'>('create')
  const [selectedLecturerAssignment, setSelectedLecturerAssignment] = useState<any>(null)
  
  // Filtering state
  const [filters, setFilters] = useState({
    search: '',
    program: 'all',
    year: 'all',
    semester: 'all',
    academicYear: 'all',
    status: 'all'
  })

  // Get course details
  const course = useMemo(() => {
    return state.courses.find((c: Course) => c.id === courseId)
  }, [state.courses, courseId])

  // Get course assignments with enriched data
  const courseAssignments = useMemo(() => {
    const assignments = state.courseAssignments.filter((assignment: any) => assignment.course_id === courseId)
    
    return assignments.map((assignment: any) => {
      // The data should already be joined from the database query
      // But we'll also check if we need to enrich it further
      const program = assignment.programs || state.programs?.find((p: any) => p.id === assignment.program_id)
      const academicYear = assignment.academic_years || state.academicYears?.find((ay: any) => ay.id === assignment.academic_year_id)
      const semester = assignment.semesters || state.semesters?.find((s: any) => s.id === assignment.semester_id)
      
      return {
        ...assignment,
        programs: program,
        academic_years: academicYear,
        semesters: semester
      }
    })
  }, [state.courseAssignments, state.programs, state.academicYears, state.semesters, courseId])

  // Get enrolled students using inheritance-based system
  const enrolledStudents = useMemo(() => {
    if (!courseAssignments || courseAssignments.length === 0) {
      return []
    }
    
    const inheritedStudents = new Map()
    
    // For each course assignment, find students enrolled in that program/semester/year
    courseAssignments.forEach((assignment: any) => {
      const studentsInProgram = state.sectionEnrollments?.filter((enrollment: any) => 
        enrollment.program_id === assignment.program_id &&
        enrollment.semester_id === assignment.semester_id &&
        enrollment.academic_year_id === assignment.academic_year_id &&
        enrollment.year === assignment.year &&
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
  }, [courseAssignments, state.sectionEnrollments])

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    let filtered = courseAssignments

    // Filter by program
    if (filters.program !== 'all') {
      filtered = filtered.filter((assignment: any) => 
        assignment.programs?.program_name === filters.program
      )
    }

    // Filter by year
    if (filters.year !== 'all') {
      filtered = filtered.filter((assignment: any) => 
        assignment.year === parseInt(filters.year)
      )
    }

    // Filter by semester
    if (filters.semester !== 'all') {
      filtered = filtered.filter((assignment: any) => 
        assignment.semesters?.semester_name === filters.semester
      )
    }

    // Filter by academic year
    if (filters.academicYear !== 'all') {
      filtered = filtered.filter((assignment: any) => 
        assignment.academic_years?.year_name === filters.academicYear
      )
    }

    return filtered
  }, [courseAssignments, filters])

  // Filtered students
  const filteredStudents = useMemo(() => {
    let filtered = enrolledStudents

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((student: any) => 
        student.student_name?.toLowerCase().includes(searchLower) ||
        student.student_id_number?.toLowerCase().includes(searchLower) ||
        student.program?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by program
    if (filters.program !== 'all') {
      filtered = filtered.filter((student: any) => 
        student.program === filters.program
      )
    }

    // Filter by year
    if (filters.year !== 'all') {
      filtered = filtered.filter((student: any) => 
        student.year === parseInt(filters.year)
      )
    }

    // Filter by semester
    if (filters.semester !== 'all') {
      filtered = filtered.filter((student: any) => 
        student.semester === filters.semester
      )
    }

    // Filter by academic year
    if (filters.academicYear !== 'all') {
      filtered = filtered.filter((student: any) => 
        student.academic_year === filters.academicYear
      )
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((student: any) => 
        student.status === filters.status
      )
    }

    return filtered
  }, [enrolledStudents, filters])

      // Calculate stats
  const stats = useMemo(() => {
    const totalAssignments = courseAssignments.length
    const totalStudents = enrolledStudents.length
    const activeAssignments = courseAssignments.filter((a: any) => a.is_mandatory).length
    
    // Count unique programs assigned to this course
    const totalPrograms = new Set(courseAssignments.map((a: any) => a.program_id)).size

    return { totalAssignments, totalStudents, activeAssignments, totalPrograms }
  }, [courseAssignments, enrolledStudents])

  // Filter options
  const filterOptions = useMemo(() => {
    const programs = [...new Set(courseAssignments.map((a: any) => a.programs?.program_name).filter(Boolean))]
    const years = [...new Set(courseAssignments.map((a: any) => a.year).filter(Boolean))].sort()
    const semesters = [...new Set(courseAssignments.map((a: any) => a.semesters?.semester_name).filter(Boolean))]
    const academicYears = [...new Set(courseAssignments.map((a: any) => a.academic_years?.year_name).filter(Boolean))]

    return {
      programs: [
        { value: 'all', label: 'All Programs' },
        ...programs.map((program: any) => ({ value: program, label: program }))
      ],
      years: [
        { value: 'all', label: 'All Years' },
        ...years.map((year: any) => ({ value: year.toString(), label: `Year ${year}` }))
      ],
      semesters: [
        { value: 'all', label: 'All Semesters' },
        ...semesters.map((semester: any) => ({ value: semester, label: semester }))
      ],
      academicYears: [
        { value: 'all', label: 'All Academic Years' },
        ...academicYears.map((year: any) => ({ value: year, label: year }))
      ],
      status: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  }, [courseAssignments])

  const statsCards = [
    { 
      title: "Program Assignments", 
      value: stats.totalAssignments, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Course assignments",
      change: `${stats.activeAssignments} mandatory`
    },
    { 
      title: "Enrolled Students", 
      value: stats.totalStudents, 
      icon: UsersIcon, 
      color: "#000000",
      subtitle: "Currently enrolled",
      change: "Active students"
    },
    { 
      title: "Programs", 
      value: stats.totalPrograms, 
      icon: AcademicCapIcon, 
      color: "#000000",
      subtitle: "Assigned programs",
      change: "Active programs"
    },
    { 
      title: "Course Status", 
      value: course?.status || "Active", 
      icon: CalendarDaysIcon, 
      color: "#000000",
      subtitle: "Current status",
      change: "Last updated"
    }
  ]

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCourses(),
          fetchLecturerProfiles(),
          fetchCourseAssignments(),
          fetchLecturerAssignments(),
          fetchSectionEnrollments(),
          fetchPrograms(),
          fetchAcademicYears(),
          fetchSemesters(),
          fetchSections(),
          auth.fetchUsers()
        ])
      } catch (error) {
        console.error('Error loading course detail data:', error)
      }
    }
    
    loadData()
  }, [fetchCourses, fetchLecturerProfiles, fetchCourseAssignments, fetchSectionEnrollments, fetchPrograms, fetchAcademicYears, fetchSemesters, fetchSections])

  // Handlers
  const handleBack = () => {
    router.push('/admin/courses')
  }

  const handleEdit = () => {
    setEditOpen(true)
  }

  const handleSaveCourse = async (courseData: any) => {
    try {
      await updateCourse(courseId, courseData)
      setEditOpen(false)
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const handleDelete = async () => {
    if (!course) return
    
    if (confirm(`Are you sure you want to delete course "${course.course_code} - ${course.course_name}"? This action cannot be undone.`)) {
      try {
        await deleteCourse(course.id)
        router.push('/admin/courses')
      } catch (error) {
        console.error('Error deleting course:', error)
      }
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Assignment handlers
  const handleAddAssignment = () => {
    setSelectedAssignment(null)
    setAddAssignmentOpen(true)
  }

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment)
    setEditAssignmentOpen(true)
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteCourseAssignment(assignmentId)
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  const handleSaveAssignment = async (assignmentData: any) => {
    try {
      if (selectedAssignment) {
        await updateCourseAssignment(selectedAssignment.id, assignmentData)
      } else {
        await createCourseAssignment(assignmentData)
      }
      setAddAssignmentOpen(false)
      setEditAssignmentOpen(false)
      setSelectedAssignment(null)
    } catch (error) {
      console.error('Error saving assignment:', error)
    }
  }

  const handleCloseAssignmentForm = () => {
    setAddAssignmentOpen(false)
    setEditAssignmentOpen(false)
    setSelectedAssignment(null)
  }

  // Lecturer assignment handlers
  const handleAssignLecturer = () => {
    setLecturerAssignmentMode('create')
    setSelectedLecturerAssignment({
      course_id: courseId,
      lecturer_id: '',
      academic_year_id: '',
      semester_id: '',
      program_id: '',
      section_id: '',
      is_primary: false,
      teaching_hours_per_week: 0,
      start_date: '',
      end_date: ''
    })
    setAssignLecturerOpen(true)
  }

  const handleEditLecturerAssignment = (assignment: any) => {
    setLecturerAssignmentMode('edit')
    setSelectedLecturerAssignment(assignment)
    setAssignLecturerOpen(true)
  }

  const handleSaveLecturerAssignment = async (assignmentData: any) => {
    try {
      if (lecturerAssignmentMode === 'create') {
        await createTeacherAssignment(assignmentData)
      } else {
        await updateTeacherAssignment(selectedLecturerAssignment.id, assignmentData)
      }
      setAssignLecturerOpen(false)
      setSelectedLecturerAssignment(null)
    } catch (error) {
      console.error('Error saving lecturer assignment:', error)
    }
  }

  const handleCloseLecturerForm = () => {
    setAssignLecturerOpen(false)
    setSelectedLecturerAssignment(null)
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      program: 'all',
      year: 'all',
      semester: 'all',
      academicYear: 'all',
      status: 'all'
    })
  }

  // Loading state
  if (state.loading) {
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

  // Error state
  if (state.error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Course Details"
          subtitle="Error loading course information"
          actions={null}
        />
        <ErrorAlert error={state.error} />
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

  // Define table columns for assignments
  const assignmentColumns = [
    {
      key: 'program',
      label: 'Program',
      render: (value: any, row: any) => (
          <Box>
            <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.programs?.program_name || 'N/A'}
            </Typography>
            <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.programs?.program_code || 'N/A'} - Year {row.year || 'N/A'}
            </Typography>
        </Box>
      )
    },
    {
      key: 'academic_year',
      label: 'Academic Year',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.academic_years?.year_name || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.semesters?.semester_name || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Type',
      render: (value: any, row: any) => (
        <Chip 
          label={row.is_mandatory ? "Mandatory" : "Optional"} 
          size="small"
          sx={{ 
            backgroundColor: row.is_mandatory ? "#00000020" : "#66666620",
            color: row.is_mandatory ? "#000000" : "#666666",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    },
    {
      key: 'capacity',
      label: 'Max Students',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.max_students || row.sections?.max_capacity || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'created',
      label: 'Created',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.created_at)}
        </Typography>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEditAssignment(row)}
            sx={{ color: "#6b7280" }}
          >
            <PencilIcon style={{ width: 16, height: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteAssignment(row.id)}
            sx={{ color: "#ef4444" }}
          >
            <TrashIcon style={{ width: 16, height: 16 }} />
          </IconButton>
        </Box>
      )
    }
  ]

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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={`${course.course_code} - ${course.course_name}`}
        subtitle={`${course.credits} Credits • ${course.department || 'General'}`}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<PencilIcon className="h-4 w-4" />}
              onClick={handleEdit}
              sx={{
                ...BUTTON_STYLES.outlined,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none'
              }}
            >
              Edit Course
            </Button>
            <Button
              variant="contained"
              startIcon={<TrashIcon className="h-4 w-4" />}
              onClick={handleDelete}
              sx={{ 
                ...BUTTON_STYLES.primary, 
                backgroundColor: '#ef4444', 
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#dc2626' } 
              }}
            >
              Delete
            </Button>
          </>
        }
      />

        <StatsGrid stats={statsCards} />


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
                  <UserPlusIcon className="h-4 w-4" />
                  Assign Lecturer
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpenIcon className="h-4 w-4" />
                  Program Assignments
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
                      {course.description || 'No description available for this course.'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#666666', 
                      mb: 1.5, 
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem'
                    }}>
                      Lecturer
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 3,
                      p: 2,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 2,
                      border: '1px solid #f0f0f0'
                    }}>
                      <Avatar sx={{ 
                        width: { xs: 36, sm: 40 }, 
                        height: { xs: 36, sm: 40 },
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600
                      }}>
                        {course.lecturer_name?.charAt(0) || 'L'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#000000',
                          mb: 0.5
                        }}>
                          {course.lecturer_name || 'Not Assigned'}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#666666',
                          fontFamily: 'DM Sans, sans-serif'
                        }}>
                          {course.lecturer_email || 'No email'}
                        </Typography>
                      </Box>
                    </Box>
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
                          label={course.status || 'Active'} 
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
                      Assign Lecturer
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#666666',
                      fontSize: '0.875rem'
                    }}>
                      Manage lecturer assignments for this course
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<UserPlusIcon className="h-4 w-4" />}
                    onClick={handleAssignLecturer}
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
                    Assign Lecturer
                  </Button>
                </Box>

                {/* Assigned Lecturers */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Assigned Lecturers
                    </Typography>
                    {(() => {
                      const assignedLecturers = getLecturersByCourse(courseId)
                      const primaryLecturer = assignedLecturers.find(l => (l as any).is_primary)
                      const additionalLecturers = assignedLecturers.filter(l => !(l as any).is_primary)
                      
                      if (assignedLecturers.length === 0) {
                        return (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            No lecturers assigned to this course
                          </Typography>
                        )
                      }
                      
                      return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {primaryLecturer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: '#000000' }}>
                                {(primaryLecturer as any).users?.full_name?.charAt(0) || 'L'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {(primaryLecturer as any).users?.full_name || 'Unknown Lecturer'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {(primaryLecturer as any).users?.email || 'No email'} • Primary Lecturer
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {(primaryLecturer as any).teaching_hours_per_week ? `${(primaryLecturer as any).teaching_hours_per_week} hours/week` : ''}
                                  {(primaryLecturer as any).sections?.section_code ? ` • Section: ${(primaryLecturer as any).sections.section_code}` : ''}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleEditLecturerAssignment(primaryLecturer)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>
                            </Box>
                          )}
                          
                          {additionalLecturers.length > 0 && (
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                                Additional Lecturers ({additionalLecturers.length})
                              </Typography>
                              {additionalLecturers.map((lecturer, index) => (
                                <Box key={lecturer.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid #f3f4f6', borderRadius: 1, mb: 1 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#6b7280' }}>
                                    {(lecturer as any).users?.full_name?.charAt(0) || 'L'}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {(lecturer as any).users?.full_name || 'Unknown Lecturer'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      {(lecturer as any).users?.email || 'No email'}
                                      {(lecturer as any).teaching_hours_per_week ? ` • ${(lecturer as any).teaching_hours_per_week} hours/week` : ''}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditLecturerAssignment(lecturer)}
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Teacher Assignment Form */}
                <TeacherAssignmentForm
                  open={isAssignLecturerOpen}
                  onOpenChange={handleCloseLecturerForm}
                  assignment={selectedLecturerAssignment}
                  mode={lecturerAssignmentMode}
                  onSave={handleSaveLecturerAssignment}
                  lecturers={state.lecturerProfiles}
                  courses={[course]}
                  academicYears={academicState.academicYears}
                  semesters={academicState.semesters}
                  programs={academicState.programs}
                  sections={academicState.sections}
                />
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
                      Program Assignments
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#666666',
                      fontSize: '0.875rem'
                    }}>
                      Manage course assignments to academic programs
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    onClick={handleAddAssignment}
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
                    Assign to Program
                  </Button>
                </Box>

                {/* Filter Bar for Assignments */}
                <Box sx={{ mb: 3 }}>
                  <FilterBar
                    fields={[
                      { 
                        type: 'native-select', 
                        label: 'Program', 
                        value: filters.program, 
                        onChange: (v) => handleFilterChange('program', v), 
                        options: filterOptions.programs, 
                        span: 3 
                      },
                      { 
                        type: 'native-select', 
                        label: 'Year Level', 
                        value: filters.year, 
                        onChange: (v) => handleFilterChange('year', v), 
                        options: filterOptions.years, 
                        span: 2 
                      },
                      { 
                        type: 'native-select', 
                        label: 'Semester', 
                        value: filters.semester, 
                        onChange: (v) => handleFilterChange('semester', v), 
                        options: filterOptions.semesters, 
                        span: 2 
                      },
                      { 
                        type: 'native-select', 
                        label: 'Academic Year', 
                        value: filters.academicYear, 
                        onChange: (v) => handleFilterChange('academicYear', v), 
                        options: filterOptions.academicYears, 
                        span: 3 
                      },
                      { 
                        type: 'clear-button', 
                        label: 'Clear', 
                        onClick: clearFilters,
                        span: 2 
                      }
                    ]}
                  />
                </Box>

                {filteredAssignments.length === 0 ? (
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
                      No Assignments Found
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 4, 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif',
                      maxWidth: 400,
                      mx: 'auto'
                    }}>
                      This course has not been assigned to any programs yet. Create your first assignment to get started.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleAddAssignment}
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
                    data={filteredAssignments}
                    onRowClick={(assignment) => handleEditAssignment(assignment)}
                  />
                )}

                {/* Course Assignment Form Dialog */}
                <CourseAssignmentForm
                  open={isAddAssignmentOpen || isEditAssignmentOpen}
                  onOpenChange={handleCloseAssignmentForm}
                  assignment={selectedAssignment}
                  onSave={handleSaveAssignment}
                  mode={isEditAssignmentOpen ? 'edit' : 'create'}
                  courses={[course].filter(Boolean)}
                  academicYears={state.academicYears}
                  semesters={state.semesters}
                  programs={state.programs}
                  sections={state.sections}
        />
      </Box>
            )}

            {activeTab === 3 && (
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

                {/* Filter Bar for Students */}
                <Box sx={{ mb: 3 }}>
                  <FilterBar
                    fields={[
                      { 
                        type: 'text', 
                        label: 'Search Students', 
                        value: filters.search, 
                        onChange: handleSearchChange, 
                        placeholder: 'Search by name, ID, or program...',
                        span: 4 
                      },
                      { 
                        type: 'native-select', 
                        label: 'Program', 
                        value: filters.program, 
                        onChange: (v) => handleFilterChange('program', v), 
                        options: filterOptions.programs, 
                        span: 2 
                      },
                      { 
                        type: 'native-select', 
                        label: 'Year Level', 
                        value: filters.year, 
                        onChange: (v) => handleFilterChange('year', v), 
                        options: filterOptions.years, 
                        span: 2 
                      },
                      { 
                        type: 'native-select', 
                        label: 'Status', 
                        value: filters.status, 
                        onChange: (v) => handleFilterChange('status', v), 
                        options: filterOptions.status, 
                        span: 2 
                      },
                      { 
                        type: 'clear-button', 
                        label: 'Clear', 
                        onClick: clearFilters,
                        span: 2 
                      }
                    ]}
                  />
                </Box>
                {filteredStudents.length === 0 ? (
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
                    data={filteredStudents}
                    onRowClick={(student) => router.push(`/admin/users/${student.id}`)}
                  />
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Course Form Dialog */}
      <CourseForm
        open={isEditOpen}
        onOpenChange={setEditOpen}
        course={course}
        onSave={handleSaveCourse}
        mode="edit"
        departments={academicState.departments}
        users={auth.state.users}
      />

    </Box>
  )
}