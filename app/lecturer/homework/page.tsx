"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
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
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  AcademicCapIcon, 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useRouter } from "next/navigation"

// ============================================================================
// TYPES
// ============================================================================

interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseCode: string
  courseName: string
  classId: string
  className: string
  dueDate: string
  totalPoints: number
  submittedCount: number
  totalStudents: number
  status: "active" | "completed" | "upcoming"
  latePenaltyEnabled: boolean
  latePenaltyPercent: number
  latePenaltyInterval: "day" | "week"
  createdAt: string
}

interface Submission {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  assignmentTitle: string
  courseCode: string
  submittedAt: string
  grade: number | null
  maxGrade: number
  status: "graded" | "submitted" | "late"
  latePenaltyApplied: number
  finalGrade: number | null
  comments: string
}

interface Class {
  id: string
  name: string
  level: string
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  classId: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function HomeworkPage() {
  const router = useRouter()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [activeTab, setActiveTab] = useState(0)
  const [assignmentStatusTab, setAssignmentStatusTab] = useState<"all" | "active" | "upcoming" | "completed">("all")
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("")

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalPoints: 100,
    latePenaltyEnabled: true,
    latePenaltyPercent: 10,
    latePenaltyInterval: "week" as "day" | "week"
  })

  // Grading form state
  const [gradingForm, setGradingForm] = useState({
    grade: 0,
    comments: ""
  })

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const classes: Class[] = [
    { id: "1", name: "Computer Science 2024", level: "Level 2" },
    { id: "2", name: "Mathematics 2024", level: "Level 1" },
    { id: "3", name: "Engineering 2024", level: "Level 3" }
  ]

  const courses: Course[] = [
    { id: "1", courseCode: "CS101", courseName: "Introduction to Computer Science", classId: "1" },
    { id: "2", courseCode: "MATH201", courseName: "Calculus II", classId: "2" },
    { id: "3", courseCode: "ENG101", courseName: "English Composition", classId: "1" },
    { id: "4", courseCode: "CS201", courseName: "Data Structures", classId: "1" }
  ]

  const assignments: Assignment[] = [
    {
      id: "1",
      title: "Data Structures Implementation",
      description: "Implement basic data structures including arrays, linked lists, and stacks.",
      courseId: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      classId: "1",
      className: "Computer Science 2024",
      dueDate: "2024-01-25",
      totalPoints: 100,
      submittedCount: 42,
      totalStudents: 45,
      status: "active",
      latePenaltyEnabled: true,
      latePenaltyPercent: 10,
      latePenaltyInterval: "week",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      title: "Calculus Problem Set 3",
      description: "Solve integration problems using various techniques.",
      courseId: "2",
      courseCode: "MATH201",
      courseName: "Calculus II", 
      classId: "2",
      className: "Mathematics 2024",
      dueDate: "2024-01-22",
      totalPoints: 50,
      submittedCount: 38,
      totalStudents: 38,
      status: "completed",
      latePenaltyEnabled: true,
      latePenaltyPercent: 5,
      latePenaltyInterval: "day",
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      title: "Research Paper Outline",
      description: "Create a detailed outline for your research paper topic.",
      courseId: "3",
      courseCode: "ENG101",
      courseName: "English Composition",
      classId: "1",
      className: "Computer Science 2024",
      dueDate: "2024-01-30",
      totalPoints: 25,
      submittedCount: 0,
      totalStudents: 30,
      status: "upcoming",
      latePenaltyEnabled: false,
      latePenaltyPercent: 0,
      latePenaltyInterval: "week",
      createdAt: "2024-01-20"
    }
  ]

  const submissions: Submission[] = [
    {
      id: "1",
      studentId: "1",
      studentName: "John Doe",
      assignmentId: "1",
      assignmentTitle: "Data Structures Implementation",
      courseCode: "CS101",
      submittedAt: "2024-01-20T14:30:00",
      grade: 92,
      maxGrade: 100,
      status: "graded",
      latePenaltyApplied: 0,
      finalGrade: 92,
      comments: "Excellent implementation!"
    },
    {
      id: "2",
      studentId: "2",
      studentName: "Jane Smith",
      assignmentId: "2",
      assignmentTitle: "Calculus Problem Set 3",
      courseCode: "MATH201",
      submittedAt: "2024-01-19T16:45:00",
      grade: 87,
      maxGrade: 50,
      status: "graded",
      latePenaltyApplied: 0,
      finalGrade: 87,
      comments: "Good work, minor errors in integration."
    },
    {
      id: "3",
      studentId: "3",
      studentName: "Mike Johnson",
      assignmentId: "1",
      assignmentTitle: "Data Structures Implementation",
      courseCode: "CS101",
      submittedAt: "2024-01-26T09:15:00",
      grade: 85,
      maxGrade: 100,
      status: "late",
      latePenaltyApplied: 10,
      finalGrade: 75,
      comments: "Submitted 1 week late. Good work but late penalty applied."
    },
    {
      id: "4",
      studentId: "4",
      studentName: "Sarah Wilson",
      assignmentId: "1",
      assignmentTitle: "Data Structures Implementation",
      courseCode: "CS101", 
      submittedAt: "2024-01-21T10:30:00",
      grade: null,
      maxGrade: 100,
      status: "submitted",
      latePenaltyApplied: 0,
      finalGrade: null,
      comments: ""
    }
  ]

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const availableCourses = useMemo(() => {
    if (!selectedClass) return []
    return courses.filter(course => course.classId === selectedClass)
  }, [selectedClass, courses])

  const filteredAssignments = useMemo(() => {
    let filtered = assignments
    if (selectedClass) {
      filtered = filtered.filter(assignment => assignment.classId === selectedClass)
    }
    if (selectedCourse) {
      filtered = filtered.filter(assignment => assignment.courseId === selectedCourse)
    }
    if (assignmentStatusTab !== "all") {
      filtered = filtered.filter(assignment => assignment.status === assignmentStatusTab)
    }
    // Sort by due date (most urgent first)
    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [selectedClass, selectedCourse, assignmentStatusTab, assignments])

  const filteredSubmissions = useMemo(() => {
    if (!selectedAssignment) return []
    return submissions.filter(submission => submission.assignmentId === selectedAssignment.id)
  }, [selectedAssignment, submissions])

  const stats = useMemo(() => {
    const totalAssignments = filteredAssignments.length
    const pendingGrading = filteredSubmissions.filter(s => s.status === "submitted").length
    const gradedCount = filteredSubmissions.filter(s => s.status === "graded" || s.status === "late").length
    const averageGrade = gradedCount > 0 
      ? filteredSubmissions
          .filter(s => s.finalGrade !== null)
          .reduce((sum, s) => sum + (s.finalGrade || 0), 0) / gradedCount
      : 0
    const submissionRate = filteredAssignments.length > 0
      ? filteredAssignments.reduce((sum, a) => sum + (a.submittedCount / a.totalStudents), 0) / filteredAssignments.length * 100
      : 0

    return {
      totalAssignments,
      pendingGrading,
      averageGrade,
      submissionRate
    }
  }, [filteredAssignments, filteredSubmissions])

  const recentSubmissions = useMemo(() => {
    return submissions
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10)
  }, [submissions])


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateAssignment = () => {
    if (!selectedClass || !selectedCourse) {
      alert("Please select both class and course first")
      return
    }
    setAssignmentForm({
      title: "",
      description: "",
      dueDate: "",
      totalPoints: 100,
      latePenaltyEnabled: true,
      latePenaltyPercent: 10,
      latePenaltyInterval: "week"
    })
    setAssignmentDialogOpen(true)
  }

  const handleSaveAssignment = () => {
    // Here you would save to database
    console.log('Creating assignment:', assignmentForm)
    setAssignmentDialogOpen(false)
    // Reset form
    setAssignmentForm({
      title: "",
      description: "",
      dueDate: "",
      totalPoints: 100,
      latePenaltyEnabled: true,
      latePenaltyPercent: 10,
      latePenaltyInterval: "week"
    })
  }

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setGradingForm({
      grade: submission.grade || 0,
      comments: submission.comments
    })
    setGradingDialogOpen(true)
  }

  const handleSaveGrade = () => {
    if (!selectedSubmission) return
    
    // Calculate late penalty if applicable
    const assignment = assignments.find(a => a.id === selectedSubmission.assignmentId)
    let finalGrade = gradingForm.grade
    let latePenaltyApplied = 0
    
    if (assignment?.latePenaltyEnabled && selectedSubmission.status === "late") {
      const daysLate = Math.ceil((new Date(selectedSubmission.submittedAt).getTime() - new Date(assignment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      const penaltyIntervals = assignment.latePenaltyInterval === "week" ? Math.ceil(daysLate / 7) : daysLate
      latePenaltyApplied = penaltyIntervals * assignment.latePenaltyPercent
      finalGrade = Math.max(0, gradingForm.grade - latePenaltyApplied)
    }

    // Here you would save to database and sync to gradebook
    console.log('Grading submission:', {
      submissionId: selectedSubmission.id,
      grade: gradingForm.grade,
      finalGrade,
      latePenaltyApplied,
      comments: gradingForm.comments
    })
    
    setGradingDialogOpen(false)
    setSelectedSubmission(null)
  }

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setActiveTab(1) // Switch to submissions tab
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      case "graded":
        return <Badge variant="default">Graded</Badge>
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>
      case "late":
        return <Badge variant="destructive">Late</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSubmissionStatus = (status: string, grade: number | null) => {
    if (status === "graded" && grade !== null) {
      return grade >= 80 ? "Pass" : "Needs Review"
    }
    if (status === "late") {
      return "Late Submission"
    }
    return status === "submitted" ? "Pending Review" : "Not Submitted"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold">Homework</h1>
          <p className="text-muted-foreground">Manage assignments and track student submissions</p>
        </div>
        <div className="flex gap-2">
          <MUIButton 
            variant="outlined" 
            size="medium"
            sx={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              '&:hover': {
                borderColor: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--muted))',
              }
            }}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Templates
            </MUIButton>
          <MUIButton 
            variant="contained" 
            size="medium" 
            onClick={handleCreateAssignment}
            sx={{
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              '&:hover': {
                backgroundColor: 'hsl(var(--foreground) / 0.9)',
              }
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Assignment
            </MUIButton>
          </div>
        </div>


      {/* KPI Grid using shared StatCard for consistency */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: 16 / 4,
        '@media (min-width: 768px)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }
      }}>
        <StatCard title="Active Assignments" value={formatNumber(assignments.filter(a => a.status === 'active').length)} icon={AcademicCapIcon} color="#000000" change="Currently active" />
        <StatCard title="Due This Week" value={formatNumber(2)} icon={ClockIcon} color="#000000" change="Within 7 days" />
        <StatCard title="Avg Submission Rate" value={`${formatNumber(stats.submissionRate)}%`} icon={CheckCircleIcon} color="#000000" change="Across visible assignments" />
        <StatCard title="Pending Reviews" value={formatNumber(stats.pendingGrading)} icon={DocumentTextIcon} color="#000000" change="Awaiting grading" />
      </Box>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-3 w-full sm:w-auto">
          <FormControl size="small" sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'hsl(var(--border))',
              },
              '&:hover fieldset': {
                borderColor: 'hsl(var(--border))',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'hsl(var(--foreground))',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'hsl(var(--muted-foreground))',
              '&.Mui-focused': {
                color: 'hsl(var(--foreground))',
              },
            },
            '& .MuiSelect-select': {
              color: 'hsl(var(--foreground))',
              padding: '12px 14px',
              lineHeight: '1.5',
            },
          }}>
            <InputLabel>Class</InputLabel>
            <Select
              native
              value={selectedClass}
              onChange={(e) => setSelectedClass((e.target as HTMLSelectElement).value)}
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ 
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'hsl(var(--border))',
              },
              '&:hover fieldset': {
                borderColor: 'hsl(var(--border))',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'hsl(var(--foreground))',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'hsl(var(--muted-foreground))',
              '&.Mui-focused': {
                color: 'hsl(var(--foreground))',
              },
            },
            '& .MuiSelect-select': {
              color: 'hsl(var(--foreground))',
              padding: '12px 14px',
              lineHeight: '1.5',
            },
          }} disabled={!selectedClass}>
            <InputLabel>Course</InputLabel>
            <Select
              native
              value={selectedCourse}
              onChange={(e) => setSelectedCourse((e.target as HTMLSelectElement).value)}
            >
              <option value="">All Courses</option>
              {availableCourses.map(course => (
                <option key={course.id} value={course.id}>{course.courseCode} • {course.courseName}</option>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Assignment Status Tabs */}
      <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
        <MUICardContent sx={{ p: 0 }}>
          <Tabs 
            value={assignmentStatusTab} 
            onChange={(e, newValue) => setAssignmentStatusTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'hsl(var(--foreground))',
              },
              '& .MuiTab-root': {
                color: 'hsl(var(--muted-foreground))',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&.Mui-selected': {
                  color: 'hsl(var(--foreground))',
                  fontWeight: 600,
                },
                '&:hover': {
                  color: 'hsl(var(--foreground))',
                },
              },
            }}
          >
            <Tab 
              label={`All (${assignments.length})`} 
              value="all" 
            />
            <Tab 
              label={`Active (${assignments.filter(a => a.status === 'active').length})`} 
              value="active" 
            />
            <Tab 
              label={`Upcoming (${assignments.filter(a => a.status === 'upcoming').length})`} 
              value="upcoming" 
            />
            <Tab 
              label={`Completed (${assignments.filter(a => a.status === 'completed').length})`} 
              value="completed" 
            />
          </Tabs>
        </MUICardContent>
      </MUICard>

      {/* Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssignments.map((assignment) => (
          <MUICard key={assignment.id} sx={{ 
            bgcolor: 'card', 
            border: '1px solid', 
            borderColor: 'border', 
            borderRadius: 3,
            position: 'relative',
            '&:hover': {
              borderColor: 'hsl(var(--foreground) / 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s ease-in-out',
            }
          }}>
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              {/* Header with status and urgency */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                      {assignment.title}
                    </Typography>
                    {(() => {
                      const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      if (daysUntilDue < 0 && assignment.status === 'active') {
                        return <Chip label="OVERDUE" size="small" sx={{ bgcolor: 'hsl(var(--destructive))', color: 'white', fontSize: '0.75rem' }} />
                      } else if (daysUntilDue <= 2 && assignment.status === 'active') {
                        return <Chip label={`${daysUntilDue}d left`} size="small" sx={{ bgcolor: 'hsl(var(--warning))', color: 'white', fontSize: '0.75rem' }} />
                      } else if (daysUntilDue <= 7 && assignment.status === 'active') {
                        return <Chip label={`${daysUntilDue}d left`} size="small" sx={{ bgcolor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }} />
                      }
                      return null
                    })()}
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                    {assignment.courseCode} - {assignment.courseName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                {getStatusBadge(assignment.status)}
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, textAlign: 'right' }}>
                    {formatNumber(assignment.totalPoints)} pts
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif', mb: 3, lineHeight: 1.5 }}>
                {assignment.description}
              </Typography>

              {/* Progress section with circular progress */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <svg width={60} height={60}>
                      <circle
                        cx={30}
                        cy={30}
                        r={25}
                        stroke="hsl(var(--muted))"
                        strokeWidth={4}
                        fill="none"
                      />
                      <circle
                        cx={30}
                        cy={30}
                        r={25}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={4}
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 25}`}
                        strokeDashoffset={`${2 * Math.PI * 25 * (1 - (assignment.submittedCount / assignment.totalStudents))}`}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      bottom: 0, 
                      right: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.75rem' }}>
                        {Math.round((assignment.submittedCount / assignment.totalStudents) * 100)}%
                      </Typography>
                    </Box>
                </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      {formatNumber(assignment.submittedCount)} / {formatNumber(assignment.totalStudents)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                      submissions
                    </Typography>
                </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                    Due
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {formatDate(assignment.dueDate)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                <MUIButton 
                  variant="contained"
                  size="small" 
                  onClick={() => router.push(`/lecturer/homework/${assignment.id}`)}
                  sx={{
                    backgroundColor: 'hsl(var(--foreground))',
                    color: 'hsl(var(--background))',
                    flex: 1,
                    '&:hover': {
                      backgroundColor: 'hsl(var(--foreground) / 0.9)',
                    }
                  }}
                >
                  View Submissions
                </MUIButton>
                <MUIButton 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleViewSubmissions(assignment)}
                  sx={{
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    flex: 1,
                    '&:hover': {
                      borderColor: 'hsl(var(--foreground))',
                      backgroundColor: 'hsl(var(--muted))',
                    }
                  }}
                >
                  Quick Grade
                </MUIButton>
              </Box>
            </MUICardContent>
          </MUICard>
        ))}
      </div>

      {/* Recent Submissions */}
      <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'card-foreground', mb: 0.5 }}>Recent Submissions</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', mb: 2 }}>Latest student submissions and grades</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Assignment</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Course</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Grade</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{submission.studentName}</TableCell>
                  <TableCell sx={{ fontFamily: 'DM Sans, sans-serif' }}>{submission.assignmentTitle}</TableCell>
                  <TableCell sx={{ fontFamily: 'DM Sans, sans-serif' }}>{submission.courseCode}</TableCell>
                  <TableCell sx={{ fontFamily: 'DM Sans, sans-serif' }}>{formatDate(submission.submittedAt)}</TableCell>
                  <TableCell>
                    {submission.grade !== null ? (
                      <Box className="flex items-center gap-2">
                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{formatNumber(submission.grade)}</Typography>
                        <Typography sx={{ color: 'muted-foreground' }}>/ {formatNumber(submission.maxGrade)}</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ color: 'muted-foreground' }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={submission.status === 'graded' ? 'default' : submission.status === 'late' ? 'destructive' : 'secondary'}>
                      {getSubmissionStatus(submission.status, submission.grade)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <MUIButton 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleGradeSubmission(submission)}
                      sx={{
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        '&:hover': {
                          borderColor: 'hsl(var(--foreground))',
                          backgroundColor: 'hsl(var(--muted))',
                        }
                      }}
                    >
                      {submission.status === 'graded' ? 'View' : 'Grade'}
                    </MUIButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </MUICardContent>
      </MUICard>

      {/* Create Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Create Assignment</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" value={assignmentForm.title} onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))} fullWidth />
            <TextField label="Description" value={assignmentForm.description} onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))} multiline rows={3} fullWidth />
            <TextField label="Due Date" type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Total Points" type="number" value={assignmentForm.totalPoints} onChange={(e) => setAssignmentForm(prev => ({ ...prev, totalPoints: Number(e.target.value) }))} fullWidth />
            <FormControlLabel control={<Switch checked={assignmentForm.latePenaltyEnabled} onChange={(e) => setAssignmentForm(prev => ({ ...prev, latePenaltyEnabled: e.target.checked }))} />} label="Enable Late Submission Penalty" />
            {assignmentForm.latePenaltyEnabled && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Penalty (%) per interval" type="number" value={assignmentForm.latePenaltyPercent} onChange={(e) => setAssignmentForm(prev => ({ ...prev, latePenaltyPercent: Number(e.target.value) }))} fullWidth />
                <FormControl fullWidth>
                  <InputLabel id="penalty-interval-label">Interval</InputLabel>
                  <Select 
                    native 
                    labelId="penalty-interval-label" 
                    value={assignmentForm.latePenaltyInterval} 
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, latePenaltyInterval: (e.target as HTMLSelectElement).value as 'day' | 'week' }))}
                  >
                    <option value="day">Per day</option>
                    <option value="week">Per week</option>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <MUIButton 
            onClick={() => setAssignmentDialogOpen(false)}
            sx={{
              color: 'hsl(var(--muted-foreground))',
              '&:hover': {
                backgroundColor: 'hsl(var(--muted))',
              }
            }}
          >
            Cancel
          </MUIButton>
          <MUIButton 
            variant="contained" 
            onClick={handleSaveAssignment}
            sx={{
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              '&:hover': {
                backgroundColor: 'hsl(var(--foreground) / 0.9)',
              }
            }}
          >
            Save
          </MUIButton>
        </DialogActions>
      </Dialog>

      {/* Grading Dialog */}
      <Dialog open={gradingDialogOpen} onClose={() => setGradingDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Grade Submission</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Grade" type="number" value={gradingForm.grade} onChange={(e) => setGradingForm(prev => ({ ...prev, grade: Number(e.target.value) }))} fullWidth />
            <TextField label="Comments" value={gradingForm.comments} onChange={(e) => setGradingForm(prev => ({ ...prev, comments: e.target.value }))} multiline rows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <MUIButton 
            onClick={() => setGradingDialogOpen(false)}
            sx={{
              color: 'hsl(var(--muted-foreground))',
              '&:hover': {
                backgroundColor: 'hsl(var(--muted))',
              }
            }}
          >
            Cancel
          </MUIButton>
          <MUIButton 
            variant="contained" 
            onClick={handleSaveGrade}
            sx={{
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              '&:hover': {
                backgroundColor: 'hsl(var(--foreground) / 0.9)',
              }
            }}
          >
            Save
          </MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}