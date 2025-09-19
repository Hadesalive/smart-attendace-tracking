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
import { useData } from "@/lib/contexts/DataContext"
import { useMockData } from "@/lib/hooks/useMockData"
import { Course, StudentGrade, CourseGradeSummary, GradeCategory } from "@/lib/types/shared"
import { mapSubmissionStatus } from "@/lib/utils/statusMapping"

// ============================================================================
// TYPES
// ============================================================================

// Using shared types from DataContext
// Grade is mapped from StudentGrade
// CourseGrade is mapped from CourseGradeSummary
// GradeStats is computed from shared data

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
  { name: 'Class Work', weight: 20, color: '#000000' },
  { name: 'Homework', weight: 30, color: '#333333' },
  { name: 'Group Projects', weight: 20, color: '#666666' },
  { name: 'Tests', weight: 15, color: '#999999' },
  { name: 'Exams', weight: 10, color: '#cccccc' },
  { name: 'Attendance', weight: 5, color: '#000000' }
]

const LETTER_GRADES = [
  { letter: 'A+', min: 97, max: 100, points: 4.0, color: '#000000' },
  { letter: 'A', min: 93, max: 96, points: 4.0, color: '#000000' },
  { letter: 'A-', min: 90, max: 92, points: 3.7, color: '#000000' },
  { letter: 'B+', min: 87, max: 89, points: 3.3, color: '#333333' },
  { letter: 'B', min: 83, max: 86, points: 3.0, color: '#333333' },
  { letter: 'B-', min: 80, max: 82, points: 2.7, color: '#333333' },
  { letter: 'C+', min: 77, max: 79, points: 2.3, color: '#666666' },
  { letter: 'C', min: 73, max: 76, points: 2.0, color: '#666666' },
  { letter: 'C-', min: 70, max: 72, points: 1.7, color: '#666666' },
  { letter: 'D+', min: 67, max: 69, points: 1.3, color: '#999999' },
  { letter: 'D', min: 63, max: 66, points: 1.0, color: '#999999' },
  { letter: 'D-', min: 60, max: 62, points: 0.7, color: '#999999' },
  { letter: 'F', min: 0, max: 59, points: 0.0, color: '#cccccc' }
]

// ============================================================================
// MOCK DATA (REMOVED - USING SHARED DATA CONTEXT)
// ============================================================================

// Mock data removed - now using shared DataContext

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentGradesPage() {
  // ============================================================================
  // DATA CONTEXT
  // ============================================================================
  
  const { 
    state, 
    getStudentGradesByCourse,
    getCourseGradeSummary,
    calculateFinalGrade
  } = useData()
  const { isInitialized } = useMockData()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState(0)
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Get student's courses (assuming current user is student with ID "user_1")
  const courses = useMemo(() => {
    return state.courses.filter(course => 
      state.enrollments.some(enrollment => 
        enrollment.student_id === "user_1" && enrollment.course_id === course.id
      )
    )
  }, [state.courses, state.enrollments])

  // Get all grades for the student
  const grades = useMemo(() => {
    const allGrades: StudentGrade[] = []
    
    courses.forEach(course => {
      const courseGrades = getStudentGradesByCourse("user_1", course.id)
      allGrades.push(...courseGrades)
    })
    
    return allGrades
  }, [courses, getStudentGradesByCourse])

  // Get course grade summaries
  const courseGrades = useMemo(() => {
    return courses.map(course => {
      const summary = getCourseGradeSummary("user_1", course.id)
      return {
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        instructor: course.lecturer_name || 'TBD',
        credits: course.credits,
        current_grade: summary?.final_grade || 0,
        letter_grade: summary?.final_letter_grade || 'N/A',
        category_grades: summary?.category_grades ? 
          Object.entries(summary.category_grades).map(([categoryId, percentage]) => {
            const category = state.gradeCategories.find(c => c.id === categoryId)
            return {
              category: category?.name || 'Unknown',
              points: percentage,
              max_points: 100,
              percentage: percentage,
              weight: category?.percentage || 0
            }
          }) : [],
        assignments: grades.filter(g => g.course_id === course.id),
        last_updated: new Date().toISOString()
      }
    })
  }, [courses, grades, getCourseGradeSummary])

  const gradeStats = useMemo(() => {
    const total_courses = courseGrades.length
    const average_grade = courseGrades.length > 0 ? 
      courseGrades.reduce((sum, course) => sum + course.current_grade, 0) / total_courses : 0
    
    const gpa = courseGrades.length > 0 ? 
      courseGrades.reduce((sum, course) => {
        const letter_grade = LETTER_GRADES.find(lg => lg.letter === course.letter_grade)
        return sum + (letter_grade?.points || 0) * course.credits
      }, 0) / courseGrades.reduce((sum, course) => sum + course.credits, 0) : 0
    
    const total_credits = courseGrades.reduce((sum, course) => sum + course.credits, 0)
    const completed_credits = total_credits // Assuming all courses are completed
    const assignments_graded = grades.length
    const assignments_pending = 0 // Mock data shows all graded

    return {
      total_courses,
      average_grade: Math.round(average_grade),
      gpa: Math.round(gpa * 100) / 100,
      total_credits,
      completed_credits,
      assignments_graded,
      assignments_pending
    }
  }, [courseGrades, grades])

  const filteredGrades = useMemo(() => {
    let filtered = grades

    if (selectedCourse !== "all") {
      filtered = filtered.filter(grade => grade.course_id === selectedCourse)
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(grade => grade.category_id === selectedCategory)
    }

    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [grades, selectedCourse, selectedCategory])

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#000000'
    if (percentage >= 80) return '#333333'
    if (percentage >= 70) return '#666666'
    if (percentage >= 60) return '#999999'
    return '#cccccc'
  }

  const getGradeIcon = (letter_grade: string) => {
    if (['A+', 'A', 'A-'].includes(letter_grade)) return TrophyIcon
    if (['B+', 'B', 'B-'].includes(letter_grade)) return CheckCircleIcon
    if (['C+', 'C', 'C-'].includes(letter_grade)) return ClockIcon
    return ExclamationTriangleIcon
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewGrade = (grade: StudentGrade) => {
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
          value={`${gradeStats.average_grade}%`} 
          icon={ChartBarIcon} 
          color="#000000" 
          change="Across all courses" 
        />
        <StatCard 
          title="Courses" 
          value={gradeStats.total_courses.toString()} 
          icon={BookOpenIcon} 
          color="#000000" 
          change="Enrolled" 
        />
        <StatCard 
          title="Credits" 
          value={`${gradeStats.completed_credits}/${gradeStats.total_credits}`} 
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
              {courseGrades.map((course) => (
                <MenuItem key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
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
              {state.gradeCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
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
                        const GradeIcon = getGradeIcon(grade.letter_grade)
                        return (
                          <TableRow key={grade.id} hover>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                                    {grade.assignment_title || 'Assignment'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                    {grade.points}/{grade.max_points} points
                                  </Typography>
                                </div>
                                {grade.is_late && (
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
                                {grade.course_code || 'N/A'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {grade.course_name || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={grade.category || 'N/A'} 
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
                                    {grade.letter_grade} ({grade.percentage}%)
                                  </Typography>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {formatDate(grade.updated_at)}
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
              {courseGrades.map((course) => (
                <MUICard key={course.course_id} sx={CARD_SX}>
                  <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 1 }}>
                          {course.course_code} - {course.course_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {course.instructor} • {course.credits} credits
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: getGradeColor(course.current_grade) }}>
                          {course.letter_grade}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {course.current_grade}%
                        </Typography>
                      </div>
                    </div>

                    <Divider sx={{ my: 2 }} />

                    <div className="space-y-3">
                      {Object.entries(course.category_grades).map(([category, grade]) => (
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
                              {grade.points}/{grade.max_points}
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
                      const count = grades.filter(g => g.letter_grade === grade.letter).length
                      const percentage = (count / grades.length) * 100
                      
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
              {selectedGrade.assignment_title || 'Assignment'}
            </DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Course
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedGrade.course_code || 'N/A'} - {selectedGrade.course_name || 'N/A'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Category
                    </Typography>
                    <Chip 
                      label={selectedGrade.category || 'N/A'} 
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
                        {selectedGrade.letter_grade}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        ({selectedGrade.percentage}%)
                      </Typography>
                    </div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      {selectedGrade.points}/{selectedGrade.max_points} points
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Graded On
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedGrade.updated_at)}
                    </Typography>
                  </div>
                </div>

                {(selectedGrade.feedback || selectedGrade.comments) && (
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
                      {selectedGrade.feedback || selectedGrade.comments}
                    </Typography>
                  </div>
                )}

                {selectedGrade.is_late && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                    <ExclamationTriangleIcon style={{ width: 20, height: 20, color: '#EF4444' }} />
                    <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 500 }}>
                      This assignment was submitted late. Late penalty: {selectedGrade.late_penalty}%
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
