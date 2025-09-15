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
  LinearProgress
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
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

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
  courseCode: string
  courseName: string
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
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Mock data
  const courses: StudentCourse[] = [
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
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
      courseCode: "MATH201",
      courseName: "Calculus II",
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
      courseCode: "ENG101",
      courseName: "English Composition",
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
    if (!searchQuery.trim()) return courses
    const query = searchQuery.toLowerCase()
    return courses.filter(course => 
      course.courseCode.toLowerCase().includes(query) ||
      course.courseName.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const stats = useMemo(() => {
    const activeCourses = courses.filter(c => c.status === 'active').length
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)
    const overallAttendanceRate = courses.length > 0 
      ? courses.reduce((sum, c) => sum + c.attendanceRate, 0) / courses.length : 0
    const overallGrade = courses.length > 0
      ? courses.reduce((sum, c) => sum + c.averageGrade, 0) / courses.length : 0

    return { activeCourses, totalCredits, overallAttendanceRate, overallGrade }
  }, [courses])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => setSearchQuery("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

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

      {/* Courses List */}
      <div className="space-y-4">
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
          filteredCourses.map((course) => (
            <MUICard key={course.id} sx={CARD_SX}>
              <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                {/* Header */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
                  mb: 2,
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: { xs: 1, sm: 2 }, 
                      mb: 1 
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        fontWeight: 600,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' }
                      }}>
                        {course.courseCode} - {course.courseName}
                      </Typography>
                      {getStatusBadge(course.status)}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.instructor}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                          {course.credits} Credits • {course.semester}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      fontWeight: 700,
                      className: getGradeColor(course.averageGrade)
                    }}>
                      {Math.round(course.averageGrade)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Average Grade
                    </Typography>
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" sx={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  mb: 3, 
                  lineHeight: 1.6
                }}>
                  {course.description}
                </Typography>

                {/* Stats */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
                  gap: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'hsl(var(--muted) / 0.3)',
                  borderRadius: 2,
                  border: '1px solid #000'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.attendanceRate}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Attendance
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.submittedAssignments}/{course.totalAssignments}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Assignments
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.materialsCount}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Materials
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {course.progress}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Progress
                    </Typography>
                  </Box>
                </Box>

                {/* Schedule & Next Session */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 3,
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      Schedule
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.schedule.days.join(', ')} • {course.schedule.time}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                      {course.schedule.location}
                    </Typography>
                  </Box>
                  {course.nextSession && (
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                        Next Session
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {course.nextSession.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                        {formatDate(course.nextSession.date)} • {course.nextSession.time}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Course Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                      {course.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'hsl(var(--muted))',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'hsl(var(--foreground))',
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>

                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1.5, sm: 2 }, 
                  pt: 1 
                }}>
                  <MUIButton 
                    variant="contained"
                    size="small" 
                    onClick={() => router.push(`/student/materials?course=${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.primary,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    View Materials
                  </MUIButton>
                  <MUIButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => router.push(`/student/homework?course=${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.outlined,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Assignments
                  </MUIButton>
                  <MUIButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => router.push(`/student/sessions?course=${course.id}`)}
                    sx={{
                      ...BUTTON_STYLES.outlined,
                      width: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Sessions
                  </MUIButton>
                </Box>
              </MUICardContent>
            </MUICard>
          ))
        )}
      </div>
    </div>
  )
}
