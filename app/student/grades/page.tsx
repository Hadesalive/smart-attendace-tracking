"use client"

import React, { useState, useMemo } from "react"
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  StarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrophyIcon,
  BookOpenIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

interface Grade {
  id: string
  assignmentId: string
  assignmentTitle: string
  courseId: string
  courseCode: string
  courseName: string
  points: number
  maxPoints: number
  percentage: number
  letterGrade: string
  category: string
  submittedAt: string
  gradedAt: string
  feedback: string
  isLate: boolean
  latePenalty: number
}

interface CourseGrade {
  courseId: string
  courseCode: string
  courseName: string
  instructor: string
  credits: number
  currentGrade: number
  letterGrade: string
  categoryGrades: {
    [category: string]: {
      points: number
      maxPoints: number
      percentage: number
      weight: number
    }
  }
  assignments: Grade[]
  lastUpdated: string
}

interface GradeStats {
  totalCourses: number
  averageGrade: number
  gpa: number
  totalCredits: number
  completedCredits: number
  assignmentsGraded: number
  assignmentsPending: number
}

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

const GRADE_CATEGORIES = [
  { name: 'Class Work', weight: 20, color: '#3B82F6' },
  { name: 'Homework', weight: 30, color: '#10B981' },
  { name: 'Group Projects', weight: 20, color: '#F59E0B' },
  { name: 'Tests', weight: 15, color: '#EF4444' },
  { name: 'Exams', weight: 10, color: '#8B5CF6' },
  { name: 'Attendance', weight: 5, color: '#6B7280' }
]

const LETTER_GRADES = [
  { letter: 'A+', min: 97, max: 100, points: 4.0, color: '#10B981' },
  { letter: 'A', min: 93, max: 96, points: 4.0, color: '#10B981' },
  { letter: 'A-', min: 90, max: 92, points: 3.7, color: '#10B981' },
  { letter: 'B+', min: 87, max: 89, points: 3.3, color: '#3B82F6' },
  { letter: 'B', min: 83, max: 86, points: 3.0, color: '#3B82F6' },
  { letter: 'B-', min: 80, max: 82, points: 2.7, color: '#3B82F6' },
  { letter: 'C+', min: 77, max: 79, points: 2.3, color: '#F59E0B' },
  { letter: 'C', min: 73, max: 76, points: 2.0, color: '#F59E0B' },
  { letter: 'C-', min: 70, max: 72, points: 1.7, color: '#F59E0B' },
  { letter: 'D+', min: 67, max: 69, points: 1.3, color: '#EF4444' },
  { letter: 'D', min: 63, max: 66, points: 1.0, color: '#EF4444' },
  { letter: 'D-', min: 60, max: 62, points: 0.7, color: '#EF4444' },
  { letter: 'F', min: 0, max: 59, points: 0.0, color: '#6B7280' }
]

// ============================================================================
// MOCK DATA
// ============================================================================

const mockGrades: Grade[] = [
  {
    id: "1",
    assignmentId: "hw1",
    assignmentTitle: "Introduction to Programming",
    courseId: "CS101",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    points: 85,
    maxPoints: 100,
    percentage: 85,
    letterGrade: "B",
    category: "Homework",
    submittedAt: "2024-01-15T10:00:00Z",
    gradedAt: "2024-01-17T14:30:00Z",
    feedback: "Good work! Pay attention to variable naming conventions.",
    isLate: false,
    latePenalty: 0
  },
  {
    id: "2",
    assignmentId: "quiz1",
    assignmentTitle: "Data Types Quiz",
    courseId: "CS101",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    points: 92,
    maxPoints: 100,
    percentage: 92,
    letterGrade: "A-",
    category: "Tests",
    submittedAt: "2024-01-20T09:00:00Z",
    gradedAt: "2024-01-20T11:00:00Z",
    feedback: "Excellent understanding of data types!",
    isLate: false,
    latePenalty: 0
  },
  {
    id: "3",
    assignmentId: "project1",
    assignmentTitle: "Calculator Project",
    courseId: "CS101",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    points: 78,
    maxPoints: 100,
    percentage: 78,
    letterGrade: "C+",
    category: "Group Projects",
    submittedAt: "2024-01-25T23:45:00Z",
    gradedAt: "2024-01-28T16:20:00Z",
    feedback: "Good functionality but needs better error handling.",
    isLate: true,
    latePenalty: 5
  },
  {
    id: "4",
    assignmentId: "hw2",
    assignmentTitle: "Functions and Loops",
    courseId: "MATH201",
    courseCode: "MATH201",
    courseName: "Calculus II",
    points: 88,
    maxPoints: 100,
    percentage: 88,
    letterGrade: "B+",
    category: "Homework",
    submittedAt: "2024-01-18T14:30:00Z",
    gradedAt: "2024-01-20T10:15:00Z",
    feedback: "Well done! Clear step-by-step solutions.",
    isLate: false,
    latePenalty: 0
  },
  {
    id: "5",
    assignmentId: "midterm",
    assignmentTitle: "Midterm Exam",
    courseId: "MATH201",
    courseCode: "MATH201",
    courseName: "Calculus II",
    points: 76,
    maxPoints: 100,
    percentage: 76,
    letterGrade: "C",
    category: "Exams",
    submittedAt: "2024-01-30T10:00:00Z",
    gradedAt: "2024-02-02T09:30:00Z",
    feedback: "Good effort. Review integration techniques.",
    isLate: false,
    latePenalty: 0
  }
]

const mockCourseGrades: CourseGrade[] = [
  {
    courseId: "CS101",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    instructor: "Dr. Smith",
    credits: 3,
    currentGrade: 85,
    letterGrade: "B",
    categoryGrades: {
      "Homework": { points: 85, maxPoints: 100, percentage: 85, weight: 30 },
      "Tests": { points: 92, maxPoints: 100, percentage: 92, weight: 15 },
      "Group Projects": { points: 78, maxPoints: 100, percentage: 78, weight: 20 },
      "Class Work": { points: 90, maxPoints: 100, percentage: 90, weight: 20 },
      "Attendance": { points: 95, maxPoints: 100, percentage: 95, weight: 5 }
    },
    assignments: mockGrades.filter(g => g.courseId === "CS101"),
    lastUpdated: "2024-02-02T09:30:00Z"
  },
  {
    courseId: "MATH201",
    courseCode: "MATH201",
    courseName: "Calculus II",
    instructor: "Prof. Johnson",
    credits: 4,
    currentGrade: 82,
    letterGrade: "B-",
    categoryGrades: {
      "Homework": { points: 88, maxPoints: 100, percentage: 88, weight: 30 },
      "Exams": { points: 76, maxPoints: 100, percentage: 76, weight: 10 },
      "Tests": { points: 85, maxPoints: 100, percentage: 85, weight: 15 },
      "Class Work": { points: 80, maxPoints: 100, percentage: 80, weight: 20 },
      "Attendance": { points: 100, maxPoints: 100, percentage: 100, weight: 5 }
    },
    assignments: mockGrades.filter(g => g.courseId === "MATH201"),
    lastUpdated: "2024-02-02T09:30:00Z"
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentGradesPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState(0)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const gradeStats: GradeStats = useMemo(() => {
    const totalCourses = mockCourseGrades.length
    const averageGrade = mockCourseGrades.reduce((sum, course) => sum + course.currentGrade, 0) / totalCourses
    const gpa = mockCourseGrades.reduce((sum, course) => {
      const letterGrade = LETTER_GRADES.find(lg => lg.letter === course.letterGrade)
      return sum + (letterGrade?.points || 0) * course.credits
    }, 0) / mockCourseGrades.reduce((sum, course) => sum + course.credits, 0)
    
    const totalCredits = mockCourseGrades.reduce((sum, course) => sum + course.credits, 0)
    const completedCredits = totalCredits // Assuming all courses are completed
    const assignmentsGraded = mockGrades.length
    const assignmentsPending = 0 // Mock data shows all graded

    return {
      totalCourses,
      averageGrade: Math.round(averageGrade),
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      completedCredits,
      assignmentsGraded,
      assignmentsPending
    }
  }, [])

  const filteredGrades = useMemo(() => {
    let filtered = mockGrades

    if (selectedCourse !== "all") {
      filtered = filtered.filter(grade => grade.courseId === selectedCourse)
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(grade => grade.category === selectedCategory)
    }

    return filtered.sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())
  }, [selectedCourse, selectedCategory])

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#10B981'
    if (percentage >= 80) return '#3B82F6'
    if (percentage >= 70) return '#F59E0B'
    if (percentage >= 60) return '#EF4444'
    return '#6B7280'
  }

  const getGradeIcon = (letterGrade: string) => {
    if (['A+', 'A', 'A-'].includes(letterGrade)) return TrophyIcon
    if (['B+', 'B', 'B-'].includes(letterGrade)) return CheckCircleIcon
    if (['C+', 'C', 'C-'].includes(letterGrade)) return ClockIcon
    return ExclamationTriangleIcon
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewGrade = (grade: Grade) => {
    setSelectedGrade(grade)
    setGradeDialogOpen(true)
  }

  const handleCloseGradeDialog = () => {
    setGradeDialogOpen(false)
    setSelectedGrade(null)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Grades</h1>
          <p className="text-muted-foreground font-dm-sans">Track your academic performance and progress</p>
        </div>
      </div>

      {/* KPI Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: 16 / 4,
        '@media (min-width: 768px)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }
      }}>
        <StatCard 
          title="GPA" 
          value={gradeStats.gpa.toString()} 
          icon={StarIcon} 
          color="#000000" 
          change="Current semester" 
        />
        <StatCard 
          title="Average Grade" 
          value={`${gradeStats.averageGrade}%`} 
          icon={ChartBarIcon} 
          color="#000000" 
          change="Across all courses" 
        />
        <StatCard 
          title="Courses" 
          value={gradeStats.totalCourses.toString()} 
          icon={BookOpenIcon} 
          color="#000000" 
          change="Enrolled" 
        />
        <StatCard 
          title="Credits" 
          value={`${gradeStats.completedCredits}/${gradeStats.totalCredits}`} 
          icon={AcademicCapIcon} 
          color="#000000" 
          change="Completed" 
        />
      </Box>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <FormControl size="small" sx={{ 
            minWidth: 220,
            width: '100%',
            maxWidth: 300,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'hsl(var(--border))' },
              '&:hover fieldset': { borderColor: 'hsl(var(--border))' },
              '&.Mui-focused fieldset': { borderColor: 'hsl(var(--foreground))', borderWidth: '1px' }
            },
            '& .MuiInputLabel-root': {
              color: 'hsl(var(--muted-foreground))',
              '&.Mui-focused': { color: 'hsl(var(--foreground))' }
            },
            '& .MuiSelect-select': {
              paddingRight: '32px !important',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <MenuItem value="all">All Courses</MenuItem>
              {mockCourseGrades.map((course) => (
                <MenuItem key={course.courseId} value={course.courseId}>
                  {course.courseCode} - {course.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ 
            minWidth: 180,
            width: '100%',
            maxWidth: 250,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'hsl(var(--border))' },
              '&:hover fieldset': { borderColor: 'hsl(var(--border))' },
              '&.Mui-focused fieldset': { borderColor: 'hsl(var(--foreground))', borderWidth: '1px' }
            },
            '& .MuiInputLabel-root': {
              color: 'hsl(var(--muted-foreground))',
              '&.Mui-focused': { color: 'hsl(var(--foreground))' }
            },
            '& .MuiSelect-select': {
              paddingRight: '32px !important',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {GRADE_CATEGORIES.map((category) => (
                <MenuItem key={category.name} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Tabs */}
      <MUICard sx={CARD_SX}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#000',
                height: 2
              }
            }}
          >
            <Tab label="All Grades" />
            <Tab label="Course Overview" />
            <Tab label="Grade Distribution" />
          </Tabs>
        </Box>

        <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* All Grades Tab */}
          {activeTab === 0 && (
            <div className="space-y-4">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-12">
                  <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                    No grades found
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                    Try adjusting your filters or check back later
                  </Typography>
                </div>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid hsl(var(--border))' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <TableCell sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Assignment</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Grade</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Graded</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredGrades.map((grade) => {
                        const GradeIcon = getGradeIcon(grade.letterGrade)
                        return (
                          <TableRow key={grade.id} hover>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                                    {grade.assignmentTitle}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                    {grade.points}/{grade.maxPoints} points
                                  </Typography>
                                </div>
                                {grade.isLate && (
                                  <Chip 
                                    label="Late" 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: 'hsl(var(--destructive) / 0.1)', 
                                      color: 'hsl(var(--destructive))',
                                      fontSize: '0.75rem'
                                    }} 
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {grade.courseCode}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {grade.courseName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={grade.category} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'hsl(var(--muted))',
                                  color: 'hsl(var(--muted-foreground))',
                                  fontSize: '0.75rem'
                                }} 
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GradeIcon 
                                  style={{ 
                                    width: 20, 
                                    height: 20, 
                                    color: getGradeColor(grade.percentage) 
                                  }} 
                                />
                                <div>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: getGradeColor(grade.percentage) }}>
                                    {grade.letterGrade} ({grade.percentage}%)
                                  </Typography>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {formatDate(grade.gradedAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <MUIButton
                                size="small"
                                onClick={() => handleViewGrade(grade)}
                                sx={{
                                  ...BUTTON_STYLES.outlined,
                                  minWidth: 'auto',
                                  px: 2
                                }}
                              >
                                <EyeIcon style={{ width: 16, height: 16, marginRight: 4 }} />
                                View
                              </MUIButton>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          )}

          {/* Course Overview Tab */}
          {activeTab === 1 && (
            <div className="space-y-6">
              {mockCourseGrades.map((course) => (
                <MUICard key={course.courseId} sx={CARD_SX}>
                  <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 1 }}>
                          {course.courseCode} - {course.courseName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {course.instructor} • {course.credits} credits
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: getGradeColor(course.currentGrade) }}>
                          {course.letterGrade}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {course.currentGrade}%
                        </Typography>
                      </div>
                    </div>

                    <Divider sx={{ my: 2 }} />

                    <div className="space-y-3">
                      {Object.entries(course.categoryGrades).map(([category, grade]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: GRADE_CATEGORIES.find(c => c.name === category)?.color || '#6B7280' }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-4">
                            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {grade.points}/{grade.maxPoints}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: getGradeColor(grade.percentage) }}>
                              {grade.percentage}%
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', minWidth: '3rem' }}>
                              ({grade.weight}%)
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  </MUICardContent>
                </MUICard>
              ))}
            </div>
          )}

          {/* Grade Distribution Tab */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <MUICard sx={CARD_SX}>
                <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3 }}>
                    Grade Distribution
                  </Typography>
                  <div className="space-y-4">
                    {LETTER_GRADES.map((grade) => {
                      const count = mockGrades.filter(g => g.letterGrade === grade.letter).length
                      const percentage = (count / mockGrades.length) * 100
                      
                      return (
                        <div key={grade.letter} className="flex items-center gap-4">
                          <div className="w-16 text-center">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: grade.color }}>
                              {grade.letter}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {grade.points}
                            </Typography>
                          </div>
                          <div className="flex-1">
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'hsl(var(--muted))',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: grade.color,
                                  borderRadius: 4
                                }
                              }}
                            />
                          </div>
                          <div className="w-12 text-right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {count}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {Math.round(percentage)}%
                            </Typography>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </MUICardContent>
              </MUICard>
            </div>
          )}
        </MUICardContent>
      </MUICard>

      {/* Grade Detail Dialog */}
      <Dialog
        open={gradeDialogOpen}
        onClose={handleCloseGradeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: CARD_SX }}
      >
        {selectedGrade && (
          <>
            <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, pb: 1 }}>
              {selectedGrade.assignmentTitle}
            </DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Course
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedGrade.courseCode} - {selectedGrade.courseName}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Category
                    </Typography>
                    <Chip 
                      label={selectedGrade.category} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))'
                      }} 
                    />
                  </div>
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Grade
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Typography variant="h5" sx={{ fontWeight: 700, color: getGradeColor(selectedGrade.percentage) }}>
                        {selectedGrade.letterGrade}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        ({selectedGrade.percentage}%)
                      </Typography>
                    </div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      {selectedGrade.points}/{selectedGrade.maxPoints} points
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Graded On
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedGrade.gradedAt)}
                    </Typography>
                  </div>
                </div>

                {selectedGrade.feedback && (
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Feedback
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      p: 2, 
                      backgroundColor: 'hsl(var(--muted) / 0.5)', 
                      borderRadius: 2,
                      border: '1px solid hsl(var(--border))'
                    }}>
                      {selectedGrade.feedback}
                    </Typography>
                  </div>
                )}

                {selectedGrade.isLate && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                    <ExclamationTriangleIcon style={{ width: 20, height: 20, color: '#EF4444' }} />
                    <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 500 }}>
                      This assignment was submitted late. Late penalty: {selectedGrade.latePenalty}%
                    </Typography>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <MUIButton onClick={handleCloseGradeDialog} sx={BUTTON_STYLES.outlined}>
                Close
              </MUIButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}
