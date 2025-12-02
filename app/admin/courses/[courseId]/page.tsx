"use client"

import React, { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
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
  Avatar
} from "@mui/material"
import { 
  ArrowLeftIcon,
  BookOpenIcon, 
  UsersIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { useCourses } from "@/lib/domains/courses/hooks"
import { useAcademicStructure } from "@/lib/domains/academic/hooks"
import { useAuth } from "@/lib/domains/auth/hooks"
import { SectionEnrollmentWithJoins, CourseAssignmentWithJoins, EnrolledStudent } from "@/lib/types/joined-data"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import ErrorAlert from "@/components/admin/ErrorAlert"
import CourseForm from "@/components/admin/forms/CourseForm"

// Tab components
import CourseInformationTab from "./components/CourseInformationTab"
import AssignLecturerTab from "./components/AssignLecturerTab"
import ProgramAssignmentsTab from "./components/ProgramAssignmentsTab"
import EnrolledStudentsTab from "./components/EnrolledStudentsTab"

interface CourseDetailProps {
  params: Promise<{
    courseId: string
  }>
}

export default function CourseDetailPage({ params }: CourseDetailProps) {
  const router = useRouter()
  const { courseId } = use(params)
  
  // Hooks
  const courses = useCourses()
  const academic = useAcademicStructure()
  const auth = useAuth()
  
  const { state: coursesState } = courses
  const { state: academicState } = academic
  
  const [activeTab, setActiveTab] = useState(0)
  const [isEditOpen, setEditOpen] = useState(false)
  const [isAddAssignmentOpen, setAddAssignmentOpen] = useState(false)
  const [isEditAssignmentOpen, setEditAssignmentOpen] = useState(false)
  const [isAssignLecturerOpen, setAssignLecturerOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [lecturerAssignmentMode, setLecturerAssignmentMode] = useState<'create' | 'edit'>('create')
  const [selectedLecturerAssignment, setSelectedLecturerAssignment] = useState<any>(null)
  
  const [filters, setFilters] = useState({
    search: '',
    program: 'all',
    year: 'all',
    semester: 'all',
    academicYear: 'all',
    status: 'all'
  })

  const academicData = useMemo(() => ({
    academicYears: academicState.academicYears || [],
    semesters: academicState.semesters || [],
    programs: academicState.programs || [],
    sections: academicState.sections || []
  }), [academicState])

  // Get course
  const course = useMemo(() => {
    return coursesState.courses.find(c => c.id === courseId) || null
  }, [coursesState.courses, courseId])

  // Get course assignments
  const courseAssignments = useMemo(() => {
    const assignments = coursesState.courseAssignments.filter(a => a.course_id === courseId)
    return assignments.map(assignment => {
      const assignmentWithJoins = assignment as CourseAssignmentWithJoins
      return {
        ...assignment,
        programs: assignmentWithJoins.programs || academicState.programs?.find(p => p.id === assignment.program_id),
        academic_years: assignmentWithJoins.academic_years || academicState.academicYears?.find(ay => ay.id === assignment.academic_year_id),
        semesters: assignmentWithJoins.semesters || academicState.semesters?.find(s => s.id === assignment.semester_id)
      }
    })
  }, [coursesState.courseAssignments, academicState, courseId])

  // Get enrolled students
  const enrolledStudents = useMemo((): EnrolledStudent[] => {
    if (courseAssignments.length === 0) return []
    
    const inheritedStudents = new Map<string, EnrolledStudent>()
    
    courseAssignments.forEach(assignment => {
      const assignmentWithJoins = assignment as CourseAssignmentWithJoins
      const studentsInProgram = academicState.sectionEnrollments?.filter(enrollment => 
        enrollment.program_id === assignment.program_id &&
        enrollment.semester_id === assignment.semester_id &&
        enrollment.academic_year_id === assignment.academic_year_id &&
        enrollment.year === assignment.year &&
        enrollment.status === 'active'
      ) || []
      
      studentsInProgram.forEach(enrollment => {
        const enrollmentWithJoins = enrollment as SectionEnrollmentWithJoins
        const studentKey = `${enrollment.student_id}-${assignment.program_id}-${assignment.semester_id}-${assignment.academic_year_id}`
        
        if (!inheritedStudents.has(studentKey)) {
          const studentProfile = academicState.studentProfiles?.find(sp => sp.user_id === enrollment.student_id)
          
          inheritedStudents.set(studentKey, {
            id: enrollment.id,
            student_id: enrollment.student_id,
            student_name: enrollmentWithJoins.users?.full_name || enrollment.student_name || 'N/A',
            student_id_number: studentProfile?.student_id || enrollmentWithJoins.users?.student_id || enrollment.student_id_number || 'N/A',
            program: assignmentWithJoins.programs?.program_name || 'N/A',
            program_code: assignmentWithJoins.programs?.program_code || 'N/A',
            year: assignment.year || enrollment.year || 1,
            semester: assignmentWithJoins.semesters?.semester_name || 'N/A',
            academic_year: assignmentWithJoins.academic_years?.year_name || 'N/A',
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
            section: enrollment.section_code || 'N/A',
            sections: [enrollment.section_code].filter(Boolean) as string[],
            program_id: assignment.program_id || '',
            semester_id: assignment.semester_id,
            academic_year_id: assignment.academic_year_id
          })
        } else {
          const existingStudent = inheritedStudents.get(studentKey)
          if (existingStudent && enrollment.section_code && !existingStudent.sections.includes(enrollment.section_code)) {
            existingStudent.sections.push(enrollment.section_code)
          }
        }
      })
    })
    
    return Array.from(inheritedStudents.values())
  }, [courseAssignments, academicState.sectionEnrollments, academicState.studentProfiles])

  // Filtered data
  const filteredAssignments = useMemo(() => {
    let filtered = courseAssignments

    if (filters.program !== 'all') {
      filtered = filtered.filter(a => a.programs?.program_name === filters.program)
    }
    if (filters.year !== 'all') {
      filtered = filtered.filter(a => a.year === parseInt(filters.year))
    }
    if (filters.semester !== 'all') {
      filtered = filtered.filter(a => a.semesters?.semester_name === filters.semester)
    }
    if (filters.academicYear !== 'all') {
      filtered = filtered.filter(a => a.academic_years?.year_name === filters.academicYear)
    }

    return filtered
  }, [courseAssignments, filters])

  const filteredStudents = useMemo(() => {
    let filtered = enrolledStudents

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(s => 
        s.student_name?.toLowerCase().includes(searchLower) ||
        s.student_id_number?.toLowerCase().includes(searchLower) ||
        s.program?.toLowerCase().includes(searchLower)
      )
    }
    if (filters.program !== 'all') {
      filtered = filtered.filter(s => s.program === filters.program)
    }
    if (filters.year !== 'all') {
      filtered = filtered.filter(s => s.year === parseInt(filters.year))
    }
    if (filters.semester !== 'all') {
      filtered = filtered.filter(s => s.semester === filters.semester)
    }
    if (filters.academicYear !== 'all') {
      filtered = filtered.filter(s => s.academic_year === filters.academicYear)
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status)
    }

    return filtered
  }, [enrolledStudents, filters])

  // Stats
  const stats = useMemo(() => ({
    totalAssignments: courseAssignments.length,
    totalStudents: enrolledStudents.length,
    activeAssignments: courseAssignments.filter(a => a.is_mandatory).length,
    totalPrograms: new Set(courseAssignments.map(a => a.program_id)).size
  }), [courseAssignments, enrolledStudents])

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

  // Filter options
  const filterOptions = useMemo(() => {
    const programs = [...new Set(courseAssignments.map(a => a.programs?.program_name).filter(Boolean))] as string[]
    const years = [...new Set(courseAssignments.map(a => a.year).filter(Boolean))].sort()
    const semesters = [...new Set(courseAssignments.map(a => a.semesters?.semester_name).filter(Boolean))] as string[]
    const academicYears = [...new Set(courseAssignments.map(a => a.academic_years?.year_name).filter(Boolean))] as string[]

    return {
      programs: [
        { value: 'all', label: 'All Programs' },
        ...programs.map(p => ({ value: p as string, label: p as string }))
      ],
      years: [
        { value: 'all', label: 'All Years' },
        ...years.map(y => ({ value: y.toString(), label: `Year ${y}` }))
      ],
      semesters: [
        { value: 'all', label: 'All Semesters' },
        ...semesters.map(s => ({ value: s as string, label: s as string }))
      ],
      academicYears: [
        { value: 'all', label: 'All Academic Years' },
        ...academicYears.map(y => ({ value: y as string, label: y as string }))
      ],
      status: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  }, [courseAssignments])

  // Columns
  const assignmentColumns = [
    {
      key: 'program',
      label: 'Program',
      render: (_value: string, row: any) => (
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
      render: (_value: string, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.academic_years?.year_name || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (_value: string, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.semesters?.semester_name || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Type',
      render: (_value: string, row: any) => (
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
      render: (_value: string, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.max_students || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'created',
      label: 'Created',
      render: (_value: string, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.created_at)}
        </Typography>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: string, row: any) => (
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

  const studentColumns = [
    {
      key: 'student',
      label: 'Student',
      render: (_value: string, row: any) => (
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
      render: (_value: string, row: any) => (
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
      render: (_value: string, row: any) => (
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
      render: (_value: string, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.academic_year || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'sections',
      label: 'Sections',
      render: (_value: string, row: any) => {
        const sections = row.sections || []
        if (sections.length === 0) {
          return <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>No sections</Typography>
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
      render: (_value: string, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.enrollment_date || row.created_at)}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: string, row: any) => (
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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await Promise.allSettled([
        courses.fetchCourses(),
        courses.fetchCourseAssignments(),
        courses.fetchLecturerAssignments(),
        academic.fetchLecturerProfiles(),
        academic.fetchStudentProfiles(),
        academic.fetchSectionEnrollments(),
        academic.fetchPrograms(),
        academic.fetchAcademicYears(),
        academic.fetchSemesters(),
        academic.fetchSections(),
        auth.fetchUsers()
      ])
    }
    loadData()
  }, [])

  // Handlers
  const handleBack = () => router.push('/admin/courses')
  const handleEdit = () => setEditOpen(true)
  
  const handleSaveCourse = async (courseData: any) => {
    await courses.updateCourse(courseId, courseData)
    setEditOpen(false)
    await courses.fetchCourses()
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course?')) {
      await courses.deleteCourse(courseId)
      router.push('/admin/courses')
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleAddAssignment = () => {
    setSelectedAssignment(null)
    setAddAssignmentOpen(true)
  }

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment)
    setEditAssignmentOpen(true)
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      await courses.deleteCourseAssignment(assignmentId)
      await courses.fetchCourseAssignments()
    }
  }

  const handleSaveAssignment = async (assignmentData: any) => {
    if (selectedAssignment) {
      await courses.updateCourseAssignment(selectedAssignment.id, assignmentData)
    } else {
      await courses.createCourseAssignment(assignmentData)
    }
    setAddAssignmentOpen(false)
    setEditAssignmentOpen(false)
    setSelectedAssignment(null)
    await courses.fetchCourseAssignments()
  }

  const handleCloseAssignmentForm = () => {
    setAddAssignmentOpen(false)
    setEditAssignmentOpen(false)
    setSelectedAssignment(null)
  }

  const handleAssignLecturer = () => {
    setSelectedLecturerAssignment(null)
    setLecturerAssignmentMode('create')
    setAssignLecturerOpen(true)
  }

  const handleEditLecturerAssignment = (assignment: any) => {
    setSelectedLecturerAssignment(assignment)
    setLecturerAssignmentMode('edit')
    setAssignLecturerOpen(true)
  }

  const handleSaveLecturerAssignment = async (assignmentData: any) => {
    if (lecturerAssignmentMode === 'create') {
      await courses.createTeacherAssignment(assignmentData)
    } else {
      await courses.updateTeacherAssignment(selectedLecturerAssignment.id, assignmentData)
    }
    setAssignLecturerOpen(false)
    setSelectedLecturerAssignment(null)
    await courses.fetchLecturerAssignments()
  }

  const handleCloseLecturerForm = () => {
    setAssignLecturerOpen(false)
    setSelectedLecturerAssignment(null)
  }

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
  if (coursesState.loading || academicState.loading) {
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
  if (coursesState.error || academicState.error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Course Details"
          subtitle="Error loading course information"
          actions={null}
        />
        <ErrorAlert error={coursesState.error || academicState.error || 'Unknown error'} />
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
          <Button variant="contained" onClick={handleBack} sx={BUTTON_STYLES.primary}>
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={`${course.course_code} - ${course.course_name}`}
        subtitle={`${course.credits} Credits • ${course.department || 'General'}`}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={handleBack}
              sx={BUTTON_STYLES.outlined}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<PencilIcon className="h-4 w-4" />}
              onClick={handleEdit}
              sx={BUTTON_STYLES.outlined}
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
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BookOpenIcon className="h-4 w-4" />Course Information</Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><UsersIcon className="h-4 w-4" />Assign Lecturer</Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BookOpenIcon className="h-4 w-4" />Program Assignments</Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><UsersIcon className="h-4 w-4" />Enrolled Students</Box>} />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {activeTab === 0 && (
              <CourseInformationTab
                course={course}
                courseId={courseId}
                getLecturersByCourse={courses.getLecturersByCourse}
              />
            )}

            {activeTab === 1 && (
              <AssignLecturerTab
                course={course}
                courseId={courseId}
                getLecturersByCourse={courses.getLecturersByCourse}
                isAssignLecturerOpen={isAssignLecturerOpen}
                selectedLecturerAssignment={selectedLecturerAssignment}
                lecturerAssignmentMode={lecturerAssignmentMode}
                handleAssignLecturer={handleAssignLecturer}
                handleEditLecturerAssignment={handleEditLecturerAssignment}
                handleSaveLecturerAssignment={handleSaveLecturerAssignment}
                handleCloseLecturerForm={handleCloseLecturerForm}
                lecturerProfiles={academicState.lecturerProfiles || []}
                academicYears={academicState.academicYears}
                semesters={academicState.semesters}
                programs={academicState.programs}
                sections={academicState.sections}
              />
            )}

            {activeTab === 2 && (
              <ProgramAssignmentsTab
                course={course}
                filters={filters}
                filteredAssignments={filteredAssignments}
                assignmentColumns={assignmentColumns}
                filterOptions={filterOptions}
                isAddAssignmentOpen={isAddAssignmentOpen}
                isEditAssignmentOpen={isEditAssignmentOpen}
                selectedAssignment={selectedAssignment}
                academicData={academicData}
                handleAddAssignment={handleAddAssignment}
                handleEditAssignment={handleEditAssignment}
                handleSaveAssignment={handleSaveAssignment}
                handleCloseAssignmentForm={handleCloseAssignmentForm}
                handleFilterChange={handleFilterChange}
                clearFilters={clearFilters}
              />
            )}

            {activeTab === 3 && (
              <EnrolledStudentsTab
                filters={filters}
                filteredStudents={filteredStudents}
                studentColumns={studentColumns}
                filterOptions={filterOptions}
                handleFilterChange={handleFilterChange}
                handleSearchChange={handleSearchChange}
                clearFilters={clearFilters}
                onStudentClick={(studentId) => router.push(`/admin/users/${studentId}`)}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Course Form */}
      <CourseForm
        open={isEditOpen}
        onOpenChange={setEditOpen}
        course={course}
        onSave={handleSaveCourse}
        mode="edit"
        users={auth.state.users}
      />
    </Box>
  )
}
