"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton, 
  Chip,
  LinearProgress,
  Divider,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  StarIcon,
  BookOpenIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useGrades, useCourses, useAcademicStructure } from "@/lib/domains"
import { useMockData } from "@/lib/hooks/useMockData"
import { Course, Student, Assignment, Submission, AttendanceSession } from "@/lib/types/shared"
import { mapAssignmentStatus, mapSubmissionStatus } from "@/lib/utils/statusMapping"

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

interface StudentAssignment {
  id: string
  title: string
  description: string
  course_id: string
  course_code: string
  course_name: string
  due_date: string
  total_points: number
  status: "pending" | "submitted" | "graded" | "late" | "overdue"
  submitted_at?: string
  grade?: number
  final_grade?: number
  feedback?: string
  attachments?: string[]
  submission_type: "file" | "text" | "both"
  allow_late_submission: boolean
  created_at: string
}

// Using shared Course type from DataContext

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentHomeworkPage() {
  const grades = useGrades()
  const coursesHook = useCourses()
  const academic = useAcademicStructure()
  
  // Extract state and methods
  const { 
    state: gradesState,
    getAssignmentsByCourse,
    getSubmissionsByAssignment,
    createSubmission
  } = grades
  
  const { 
    state: coursesState,
    getCoursesByLecturer, 
    getStudentsByCourse
  } = coursesHook
  
  const { state: academicState } = academic
  
  // Create legacy state object for compatibility
  const state = {
    ...gradesState,
    ...coursesState,
    ...academicState
  }
  const { isInitialized } = useMockData()

  const router = useRouter()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "submitted" | "graded">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  const studentId = "user_1" // Assuming current user is student with ID "user_1"
  
  // Get student's courses
  const courses = useMemo(() => {
    return state.courses.filter(course => 
      state.enrollments.some(enrollment => 
        enrollment.student_id === studentId && enrollment.course_id === course.id
      )
    )
  }, [state.courses, state.enrollments, studentId])

  // Get student's assignments from shared data
  const assignments = useMemo(() => {
    const allAssignments: StudentAssignment[] = []
    
    state.courses.forEach(course => {
      const courseAssignments = getAssignmentsByCourse(course.id)
      courseAssignments.forEach(assignment => {
        const submissions = getSubmissionsByAssignment(assignment.id)
        const studentSubmission = submissions.find(s => s.student_id === studentId)
        
        // Use shared submission status logic for consistency with lecturer view
        let status: "pending" | "submitted" | "graded" = "pending"
        if (studentSubmission) {
          // Use the actual submission status from shared data
          status = mapSubmissionStatus(studentSubmission.status, 'student') as "pending" | "submitted" | "graded"
        }
        
        allAssignments.push({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          course_id: assignment.course_id,
          course_code: assignment.course_code,
          course_name: assignment.course_name,
          due_date: assignment.due_date,
          total_points: assignment.total_points,
          status,
          submitted_at: studentSubmission?.submitted_at,
          grade: studentSubmission?.grade || undefined,
          final_grade: studentSubmission?.final_grade || undefined,
          feedback: studentSubmission?.comments || undefined,
          submission_type: "both" as const, // Would need to get from assignment data
          allow_late_submission: assignment.late_penalty_enabled,
          created_at: assignment.created_at || new Date().toISOString()
        })
      })
    })
    
    return allAssignments
  }, [courses, getAssignmentsByCourse, getSubmissionsByAssignment, studentId])

  // Legacy mock data for reference
  const legacyAssignments: StudentAssignment[] = [
    {
      id: "1",
      title: "Data Structures Implementation",
      description: "Implement basic data structures including arrays, linked lists, and stacks. Submit your code with proper documentation and test cases.",
      course_id: "1",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      due_date: "2024-01-25T23:59:00",
      total_points: 100,
      status: "pending",
      submission_type: "both",
      allow_late_submission: true,
      created_at: "2024-01-15"
    },
    {
      id: "2",
      title: "Calculus Problem Set 3",
      description: "Solve integration problems using various techniques. Show all work and explain your reasoning.",
      course_id: "2",
      course_code: "MATH201",
      course_name: "Calculus II", 
      due_date: "2024-01-22T23:59:00",
      total_points: 50,
      status: "graded",
      submitted_at: "2024-01-19T16:45:00",
      grade: 43,
      final_grade: 43,
      feedback: "Good work overall! Minor errors in problem 3 and 5. Review integration by parts technique.",
      submission_type: "file",
      allow_late_submission: false,
      created_at: "2024-01-10"
    },
    {
      id: "3",
      title: "Research Paper Outline",
      description: "Create a detailed outline for your research paper topic. Include thesis statement, main points, and supporting evidence.",
      course_id: "3",
      course_code: "ENG101",
      course_name: "English Composition",
      due_date: "2024-01-30T23:59:00",
      total_points: 25,
      status: "submitted",
      submitted_at: "2024-01-28T14:30:00",
      submission_type: "text",
      allow_late_submission: true,
      created_at: "2024-01-20"
    },
    {
      id: "4",
      title: "Algorithm Analysis Report",
      description: "Analyze time and space complexity of sorting algorithms.",
      course_id: "1",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      due_date: "2024-01-20T23:59:00",
      total_points: 75,
      status: "overdue",
      submission_type: "file",
      allow_late_submission: true,
      created_at: "2024-01-10"
    },
    {
      id: "5",
      title: "Physics Lab Report - Motion",
      description: "Write a comprehensive lab report analyzing the motion of objects in free fall. Include data analysis, graphs, and conclusions.",
      course_id: "4",
      course_code: "PHYS101",
      course_name: "Physics I",
      due_date: "2024-01-28T23:59:00",
      total_points: 80,
      status: "pending",
      submission_type: "both",
      allow_late_submission: true,
      created_at: "2024-01-18"
    },
    {
      id: "6",
      title: "Organic Chemistry Problem Set",
      description: "Solve problems related to organic reactions, mechanisms, and synthesis. Show detailed mechanisms.",
      course_id: "5",
      course_code: "CHEM201",
      course_name: "Organic Chemistry",
      due_date: "2024-01-26T23:59:00",
      total_points: 60,
      status: "graded",
      submitted_at: "2024-01-24T10:15:00",
      grade: 52,
      final_grade: 52,
      feedback: "Excellent work on mechanisms! Review stereochemistry concepts.",
      submission_type: "file",
      allow_late_submission: false,
      created_at: "2024-01-12"
    },
    {
      id: "7",
      title: "Creative Writing Assignment",
      description: "Write a short story (1000-1500 words) exploring themes of identity and belonging.",
      course_id: "3",
      course_code: "ENG101",
      course_name: "English Composition",
      due_date: "2024-02-05T23:59:00",
      total_points: 40,
      status: "pending",
      submission_type: "text",
      allow_late_submission: true,
      created_at: "2024-01-22"
    },
    {
      id: "8",
      title: "Database Design Project",
      description: "Design and implement a database schema for a library management system. Include ER diagrams and SQL queries.",
      course_id: "1",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      due_date: "2024-02-01T23:59:00",
      total_points: 120,
      status: "submitted",
      submitted_at: "2024-01-29T16:20:00",
      submission_type: "both",
      allow_late_submission: true,
      created_at: "2024-01-15"
    }
  ]

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredAssignments = useMemo(() => {
    let filtered = assignments
    
    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(assignment => assignment.course_id === selectedCourse)
    }
    
    // Filter by status (using status mapping for consistency)
    if (statusTab !== "all") {
      filtered = filtered.filter(assignment => {
        const mappedStatus = mapSubmissionStatus(assignment.status as any, 'student')
        return mappedStatus === statusTab
      })
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(query) ||
        assignment.description.toLowerCase().includes(query) ||
        assignment.course_code.toLowerCase().includes(query) ||
        assignment.course_name.toLowerCase().includes(query)
      )
    }
    
    // Sort by due date (most urgent first)
    return filtered.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [selectedCourse, statusTab, searchQuery, assignments])

  const stats = useMemo(() => {
    const totalAssignments = assignments.length
    const pendingAssignments = assignments.filter(a => a.status === "pending").length
    const submittedAssignments = assignments.filter(a => a.status === "submitted" || a.status === "graded").length
    const gradedAssignments = assignments.filter(a => a.status === "graded")
    const averageGrade = gradedAssignments.length > 0 
      ? gradedAssignments.reduce((sum, a) => sum + (a.final_grade || 0), 0) / gradedAssignments.length
      : 0
    const overdueCount = assignments.filter(a => a.status === "overdue").length

    return {
      totalAssignments,
      pendingAssignments,
      submittedAssignments,
      averageGrade,
      overdueCount
    }
  }, [assignments])


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmitAssignment = (assignment: StudentAssignment) => {
    setSelectedAssignment(assignment)
    setSubmissionText("")
    setSubmissionFiles([])
    setSubmissionDialogOpen(true)
  }

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/student/homework/${assignmentId}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleSaveSubmission = () => {
    if (!selectedAssignment) return
    
    // Here you would save the submission to database
    console.log('Submitting assignment:', {
      assignmentId: selectedAssignment.id,
      text: submissionText,
      files: submissionFiles
    })
    
    setSubmissionDialogOpen(false)
    setSelectedAssignment(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Chip label="Pending" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "submitted":
        return <Chip label="Submitted" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "graded":
        return <Chip label="Graded" sx={{ bgcolor: '#333333', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "late":
        return <Chip label="Late" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "overdue":
        return <Chip label="Overdue" sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
    }
  }

  const getGradeColor = (grade: number, total: number) => {
    const percentage = (grade / total) * 100
    if (percentage >= 90) return "#000000"
    if (percentage >= 80) return "#333333"
    if (percentage >= 70) return "#666666"
    return "#999999"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Assignments</h1>
          <p className="text-muted-foreground font-dm-sans">Track your homework, submissions, and grades</p>
        </div>
      </div>


      {/* KPI Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: 1
      }}>
        <StatCard title="Total Assignments" value={formatNumber(stats.totalAssignments)} icon={BookOpenIcon} color="#000000" change="All courses" />
        <StatCard title="Pending" value={formatNumber(stats.pendingAssignments)} icon={ClockIcon} color="#000000" change="To submit" />
        <StatCard title="Submitted" value={formatNumber(stats.submittedAssignments)} icon={CheckCircleIcon} color="#000000" change="Completed" />
        <StatCard title="Average Grade" value={stats.averageGrade > 0 ? `${formatNumber(stats.averageGrade)}%` : "N/A"} icon={StarIcon} color="#000000" change="Across graded work" />
      </Box>

      {/* Search Section */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'hsl(var(--card-foreground))' }}>
              Search Assignments
            </Typography>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="Search by title, description, course code, or course name..."
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
                Found {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} matching "{searchQuery}"
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
                <option value="">All Courses ({assignments.length} assignments)</option>
                {state.courses.map(course => {
                  const courseAssignments = assignments.filter(a => a.course_id === course.id)
                  return (
                    <option key={course.id} value={course.id}>
                      {course.course_code} • {course.course_name} ({courseAssignments.length} assignments)
                    </option>
                  )
                })}
              </Select>
            </FormControl>
            
            {selectedCourse && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Typography variant="body2" sx={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}>
                  Showing assignments for:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={state.courses.find(c => c.id === selectedCourse)?.course_code || ''}
                    size="small"
                    sx={{ 
                      bgcolor: 'hsl(var(--muted))', 
                      color: 'hsl(var(--muted-foreground))',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  <MUIButton 
                    size="small" 
                    onClick={() => setSelectedCourse("")}
                    sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1,
                      '&:hover': { backgroundColor: 'hsl(var(--muted))' }
                    }}
                  >
                    Clear
                  </MUIButton>
                </Box>
              </Box>
            )}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Course Summary (when course is selected) */}
      {selectedCourse && (
        <MUICard sx={{ 
          ...CARD_SX,
          bgcolor: 'hsl(var(--muted) / 0.3)'
        }}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            {(() => {
              const selectedCourseData = state.courses.find(c => c.id === selectedCourse)
              const courseAssignments = filteredAssignments
              const courseStats = {
                total: courseAssignments.length,
                pending: courseAssignments.filter(a => mapSubmissionStatus(a.status as any, 'student') === 'pending').length,
                submitted: courseAssignments.filter(a => {
                  const mappedStatus = mapSubmissionStatus(a.status as any, 'student')
                  return mappedStatus === 'submitted' || mappedStatus === 'graded'
                }).length,
                graded: courseAssignments.filter(a => mapSubmissionStatus(a.status as any, 'student') === 'graded').length,
                overdue: courseAssignments.filter(a => mapSubmissionStatus(a.status as any, 'student') === 'late').length
              }
              
              return (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <BookOpenIcon className="h-6 w-6 text-primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'hsl(var(--card-foreground))' }}>
                        {selectedCourseData?.course_code} - {selectedCourseData?.course_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif' }}>
                        Instructor: {selectedCourseData?.lecturer_name || "TBD"}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' }, 
                    gap: { xs: 1.5, sm: 2 } 
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--card-foreground))' }}>
                        {courseStats.total}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}>
                        Total
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--warning))' }}>
                        {courseStats.pending}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}>
                        Pending
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                        {courseStats.submitted}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}>
                        Submitted
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--success))' }}>
                        {courseStats.graded}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}>
                        Graded
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--destructive))' }}>
                        {courseStats.overdue}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}>
                        Overdue
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )
            })()}
          </MUICardContent>
        </MUICard>
      )}

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
            <Tab label={`All (${filteredAssignments.length})`} value="all" />
            <Tab label={`Pending (${filteredAssignments.filter(a => a.status === 'pending').length})`} value="pending" />
            <Tab label={`Submitted (${filteredAssignments.filter(a => a.status === 'submitted').length})`} value="submitted" />
            <Tab label={`Graded (${filteredAssignments.filter(a => a.status === 'graded').length})`} value="graded" />
          </Tabs>
        </MUICardContent>
      </MUICard>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              {(() => {
                // Determine the type of empty state
                const hasSearchQuery = searchQuery.trim() !== ""
                const hasFilters = selectedCourse || statusTab !== "all"
                
                if (hasSearchQuery) {
                  return (
                    <>
                      <MagnifyingGlassIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2, color: 'hsl(var(--card-foreground))' }}>
                        No Results Found
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', mb: 3, maxWidth: 400, mx: 'auto' }}>
                        We couldn't find any assignments matching <strong>"{searchQuery}"</strong>
                        {hasFilters && " with your current filters"}.
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <MUIButton 
                          variant="outlined" 
                          onClick={handleClearSearch}
                          sx={BUTTON_STYLES.outlined}
                          startIcon={<XMarkIcon className="h-4 w-4" />}
                        >
                          Clear Search
                        </MUIButton>
                        {(selectedCourse || statusTab !== "all") && (
                          <MUIButton 
                            variant="outlined" 
                            onClick={() => {
                              setSelectedCourse("")
                              setStatusTab("all")
                            }}
                            sx={BUTTON_STYLES.outlined}
                          >
                            Clear All Filters
                          </MUIButton>
                        )}
                      </Box>
                    </>
                  )
                } else if (hasFilters) {
                  return (
                    <>
                      <DocumentTextIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2, color: 'hsl(var(--card-foreground))' }}>
                        No Assignments Match Your Filters
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', mb: 3, maxWidth: 400, mx: 'auto' }}>
                        Try adjusting your course selection or status filter to see more assignments.
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
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
                      <BookOpenIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2, color: 'hsl(var(--card-foreground))' }}>
                        No Assignments Yet
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif', mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                        It looks like you don't have any assignments at the moment. New assignments will appear here when your instructors create them.
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2, 
                        alignItems: 'center',
                        p: 3,
                        bgcolor: 'hsl(var(--muted) / 0.3)',
                        borderRadius: 2,
                        border: '1px solid hsl(var(--border))',
                        maxWidth: 300,
                        mx: 'auto'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                          💡 Pro Tips:
                        </Typography>
                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                          <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1, fontSize: '0.875rem' }}>
                            • Check back regularly for new assignments
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1, fontSize: '0.875rem' }}>
                            • Contact your instructors if you expect assignments
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                            • Use the search and filters to organize your work
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )
                }
              })()}
            </MUICardContent>
          </MUICard>
        ) : (
          filteredAssignments.map((assignment) => (
          <MUICard key={assignment.id} sx={{ 
            ...LIST_CARD_SX,
            borderColor: mapSubmissionStatus(assignment.status as any, 'student') === 'late' ? '1px solid hsl(var(--destructive))' : '#000',
            '&:hover': {
              ...LIST_CARD_SX['&:hover'],
              borderColor: '#000',
            }
          }}>
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
                      {assignment.title}
                    </Typography>
                    {(() => {
                      const daysUntilDue = Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      const mappedStatus = mapSubmissionStatus(assignment.status as any, 'student')
                      if (mappedStatus === 'late') {
                        return <Chip label="OVERDUE" size="small" sx={{ bgcolor: 'hsl(var(--destructive))', color: 'white', fontSize: '0.75rem' }} />
                      } else if (daysUntilDue <= 1 && mappedStatus === 'pending') {
                        return <Chip label="Due Tomorrow" size="small" sx={{ bgcolor: 'hsl(var(--warning))', color: 'white', fontSize: '0.75rem' }} />
                      } else if (daysUntilDue <= 3 && mappedStatus === 'pending') {
                        return <Chip label={`${daysUntilDue}d left`} size="small" sx={{ bgcolor: 'hsl(var(--warning))', color: 'white', fontSize: '0.75rem' }} />
                      }
                      return null
                    })()}
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: 'hsl(var(--muted-foreground))', 
                    mb: 0.5,
                    fontSize: { xs: '0.875rem', sm: '0.875rem' }
                  }}>
                    {assignment.course_code} - {assignment.course_name}
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
                  {getStatusBadge(assignment.status)}
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    color: 'hsl(var(--card-foreground))',
                    fontSize: { xs: '0.875rem', sm: '0.875rem' }
                  }}>
                    {formatNumber(assignment.total_points)} pts
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ 
                color: 'hsl(var(--muted-foreground))', 
                mb: 3, 
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}>
                {assignment.description}
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                mb: 2,
                gap: { xs: 2, sm: 0 }
              }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>Due Date</Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    color: 'hsl(var(--card-foreground))',
                    fontSize: { xs: '0.875rem', sm: '0.875rem' }
                  }}>
                    {formatDate(assignment.due_date)}
                  </Typography>
                </Box>
                {mapSubmissionStatus(assignment.status as any, 'student') === 'graded' && assignment.grade !== undefined && (
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>Your Grade</Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: getGradeColor(assignment.grade, assignment.total_points),
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}>
                      {formatNumber(assignment.grade)}/{formatNumber(assignment.total_points)}
                    </Typography>
                  </Box>
                )}
                {assignment.submitted_at && mapSubmissionStatus(assignment.status as any, 'student') !== 'graded' && (
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>Submitted</Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: 'hsl(var(--card-foreground))',
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}>
                      {formatDate(assignment.submitted_at)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {assignment.feedback && (
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: 'hsl(var(--muted) / 0.5)', 
                  borderRadius: 2, 
                  mb: 2 
                }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: 'hsl(var(--card-foreground))',
                    fontSize: { xs: '0.875rem', sm: '0.875rem' }
                  }}>Instructor Feedback:</Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'hsl(var(--muted-foreground))', 
                    fontStyle: 'italic',
                    fontSize: { xs: '0.875rem', sm: '0.875rem' }
                  }}>
                    "{assignment.feedback}"
                  </Typography>
                </Box>
              )}

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.5, sm: 2 }, 
                pt: 1 
              }}>
                {mapSubmissionStatus(assignment.status as any, 'student') === 'pending' && (
                  <MUIButton 
                    variant="contained"
                    size="small" 
                    onClick={() => handleSubmitAssignment(assignment)}
                    sx={{
                      ...BUTTON_STYLES.primary,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </MUIButton>
                )}
                <MUIButton 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleViewDetails(assignment.id)}
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

      {/* Submission Dialog */}
      <Dialog 
        open={submissionDialogOpen} 
        onClose={() => setSubmissionDialogOpen(false)} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            border: '2px solid #000',
            borderRadius: 3,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
          Submit Assignment: {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{
            borderColor: '#000',
            borderWidth: '1px'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" sx={{ color: 'muted-foreground' }}>
              {selectedAssignment?.description}
            </Typography>
            
            {selectedAssignment?.submission_type !== 'file' && (
              <TextField 
                label="Assignment Text" 
                value={submissionText} 
                onChange={(e) => setSubmissionText(e.target.value)} 
                multiline 
                rows={6} 
                fullWidth 
                placeholder="Type your assignment response here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                    '&:hover fieldset': { borderColor: '#000' },
                    '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))',
                    '&.Mui-focused': { color: '#000' },
                  },
                }}
              />
            )}
            
            {selectedAssignment?.submission_type !== 'text' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Attach Files
                </Typography>
                <Box sx={{
                  border: '2px dashed #000',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'hsl(var(--primary))',
                    backgroundColor: 'hsl(var(--muted) / 0.5)',
                  },
                }}>
                  <ArrowUpTrayIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    Drop files here or click to browse
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontSize: '0.875rem' }}>
                    Supports: PDF, DOC, DOCX, TXT, ZIP (Max 10MB each)
                  </Typography>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                    style={{ display: 'none' }}
                  />
                </Box>
                {submissionFiles.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {submissionFiles.map((file, index) => (
                      <Chip 
                        key={index} 
                        label={file.name} 
                        size="small" 
                        sx={{ 
                          mr: 1, 
                          mb: 1,
                          border: '1px solid #000',
                          backgroundColor: 'hsl(var(--muted) / 0.3)'
                        }}
                        icon={<PaperClipIcon className="h-3 w-3" />}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <MUIButton 
            onClick={() => setSubmissionDialogOpen(false)}
            sx={{
              color: 'hsl(var(--muted-foreground))',
              '&:hover': { backgroundColor: 'hsl(var(--muted))' }
            }}
          >
            Cancel
          </MUIButton>
          <MUIButton 
            variant="contained" 
            onClick={handleSaveSubmission}
            sx={BUTTON_STYLES.primary}
          >
            Submit Assignment
          </MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
