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
  UserPlusIcon
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
import CourseAssignmentForm from "@/components/admin/forms/CourseAssignmentForm"
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
    fetchEnrollments
  } = courses
  const { fetchLecturerProfiles } = academic
  
  // Create legacy state object for compatibility
  const state = {
    ...coursesState,
    lecturerProfiles: academic.state.lecturerProfiles,
    users: auth.state.users,
    academicYears: academic.state.academicYears,
    semesters: academic.state.semesters,
    programs: academic.state.programs,
    sections: academic.state.sections
  } as any

  const [activeTab, setActiveTab] = useState(0)
  const [isEditOpen, setEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isAddAssignmentOpen, setAddAssignmentOpen] = useState(false)
  const [isEditAssignmentOpen, setEditAssignmentOpen] = useState(false)
  const [isAssignLecturerOpen, setAssignLecturerOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [selectedLecturer, setSelectedLecturer] = useState<string>("")

  // Get course details
  const course = useMemo(() => {
    return state.courses.find((c: Course) => c.id === courseId)
  }, [state.courses, courseId])

  // Get course assignments
  const courseAssignments = useMemo(() => {
    return state.courseAssignments.filter((assignment: any) => assignment.course_id === courseId)
  }, [state.courseAssignments, courseId])

  // Get enrolled students
  const enrolledStudents = useMemo(() => {
    return getStudentsByCourse(courseId)
  }, [getStudentsByCourse, courseId])

      // Calculate stats
  const stats = useMemo(() => {
    const totalAssignments = courseAssignments.length
    const totalStudents = enrolledStudents.length
    const activeAssignments = courseAssignments.filter((a: any) => a.is_mandatory).length
    
    // Count unique programs assigned to this course
    const totalPrograms = new Set(courseAssignments.map((a: any) => a.program_id)).size

    return { totalAssignments, totalStudents, activeAssignments, totalPrograms }
  }, [courseAssignments, enrolledStudents])

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
          fetchEnrollments()
        ])
      } catch (error) {
        console.error('Error loading course detail data:', error)
      }
    }
    
    loadData()
  }, [fetchCourses, fetchLecturerProfiles, fetchCourseAssignments, fetchEnrollments])

  // Handlers
  const handleBack = () => {
    router.push('/admin/courses')
  }

  const handleEdit = () => {
    setEditOpen(true)
  }

  const handleDelete = () => {
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!course) return

    try {
      await deleteCourse(course.id)
      router.push('/admin/courses')
    } catch (error) {
      console.error('Error deleting course:', error)
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
    setAssignLecturerOpen(true)
  }

  const handleSaveLecturerAssignment = async () => {
    try {
      await updateCourse(courseId, { lecturer_id: selectedLecturer })
      setAssignLecturerOpen(false)
      setSelectedLecturer("")
    } catch (error) {
      console.error('Error assigning lecturer:', error)
    }
  }

  const handleCloseLecturerForm = () => {
    setAssignLecturerOpen(false)
    setSelectedLecturer("")
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
            {row.full_name?.charAt(0) || 'S'}
          </Avatar>
          <Box>
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
              {row.full_name || 'Unknown Student'}
        </Typography>
            <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
              {row.email || 'No email'}
        </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'enrollment_date',
      label: 'Enrolled',
      render: (value: any, row: any) => (
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {formatDate(row.enrolled_at || row.created_at)}
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
              sx={{ ...BUTTON_STYLES.primary, backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
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
                height: 2
              },
              '& .MuiTab-root': {
                color: '#666666',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.875rem',
                minHeight: 48,
                '&.Mui-selected': {
                  color: '#000000',
                  fontWeight: 600
                },
                '&:hover': {
                  color: '#000000',
                  backgroundColor: '#f5f5f5'
                }
              }
            }}
          >
            <Tab label="Course Information" />
            <Tab label="Assign Lecturer" />
            <Tab label="Program Assignments" />
            <Tab label="Enrolled Students" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {activeTab === 0 && (
              <Box sx={{ space: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Course Details
                </Typography>
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
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    Assign Lecturer
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UserPlusIcon className="h-4 w-4" />}
                    onClick={handleAssignLecturer}
                    sx={BUTTON_STYLES.primary}
                  >
                    Assign Lecturer
                  </Button>
      </Box>

                {/* Current Lecturer */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Current Lecturer
                    </Typography>
                    {course?.lecturer_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {course.lecturer_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {course.lecturer_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {course.lecturer_email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No lecturer assigned to this course
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Lecturer Assignment Dialog */}
                <Dialog 
                  open={isAssignLecturerOpen} 
                  onClose={handleCloseLecturerForm}
                  maxWidth="sm"
                  PaperProps={{
                    sx: {
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      border: "1px solid #f3f4f6"
                    }
                  }}
                >
                  <DialogTitle sx={TYPOGRAPHY_STYLES.dialogTitle}>
                    Assign Lecturer
                  </DialogTitle>
                  <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                      Select a lecturer to assign to this course
                    </Typography>
                    <select
                      value={selectedLecturer}
                      onChange={(e) => setSelectedLecturer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                    >
                      <option value="">Select Lecturer</option>
                      {state.lecturerProfiles.map((lecturer: any) => (
                        <option key={lecturer.id} value={lecturer.user_id}>
                          {lecturer.full_name} - {lecturer.email}
                        </option>
                      ))}
                    </select>
                  </DialogContent>
                  <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      onClick={handleCloseLecturerForm}
                      sx={TYPOGRAPHY_STYLES.buttonText}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveLecturerAssignment}
                      variant="contained"
                      disabled={!selectedLecturer}
                      sx={TYPOGRAPHY_STYLES.buttonText}
                    >
                      Assign Lecturer
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    Program Assignments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    onClick={handleAddAssignment}
                    sx={BUTTON_STYLES.primary}
                  >
                    Assign to Program
                  </Button>
                </Box>

                {courseAssignments.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      No Assignments Found
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                      This course has not been assigned to any sections yet.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleAddAssignment}
                      sx={BUTTON_STYLES.primary}
                    >
                      Create Assignment
                    </Button>
                  </Box>
                ) : (
                  <DataTable
                    title=""
                    subtitle=""
                    columns={assignmentColumns}
                    data={courseAssignments}
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
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                  Enrolled Students
                </Typography>
                {enrolledStudents.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      No Students Enrolled
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                      No students are currently enrolled in this course.
                    </Typography>
                  </Box>
                ) : (
                  <DataTable
                    title=""
                    subtitle=""
                    columns={studentColumns}
                    data={enrolledStudents}
                    onRowClick={(student) => router.push(`/admin/users/${student.id}`)}
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