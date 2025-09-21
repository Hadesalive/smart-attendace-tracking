"use client"

import React, { useState, useMemo } from "react"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Skeleton,
  Alert,
  AlertTitle
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  UserIcon,
  AcademicCapIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  CameraIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useAuth, useCourses, useAcademicStructure, useGrades } from "@/lib/domains"
import { useMockData } from "@/lib/hooks/useMockData"

// Constants
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
}

// Types
interface StudentProfile {
  // Personal Information
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  nationality: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  avatar?: string
  
  // Academic Information
  program: string
  major: string
  minor?: string
  academicYear: string
  semester: string
  enrollmentDate: string
  expectedGraduation: string
  gpa: number
  credits: {
    completed: number
    total: number
    required: number
  }
  
  // Statistics
  stats: {
    totalCourses: number
    activeCourses: number
    completedCourses: number
    overallAttendanceRate: number
    averageGrade: number
    totalAssignments: number
    submittedAssignments: number
    achievements: number
  }
  
  // Settings
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      assignments: boolean
      attendance: boolean
      grades: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends'
      showGrades: boolean
      showAttendance: boolean
    }
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'system'
  }
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  dateEarned: string
  category: 'academic' | 'attendance' | 'participation' | 'special'
}

interface RecentActivity {
  id: string
  type: 'assignment' | 'attendance' | 'grade' | 'course'
  title: string
  description: string
  date: string
  status: 'success' | 'warning' | 'info'
}

export default function StudentProfilePage() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'personal' | 'academic' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  // Data Context
  const auth = useAuth()
  const courses = useCourses()
  const academic = useAcademicStructure()
  const grades = useGrades()
  
  // Extract state and methods
  const { state: authState } = auth
  const { state: coursesState } = courses
  const { state: academicState } = academic
  const { 
    state: gradesState,
    getStudentGradesByCourse, 
    calculateFinalGrade 
  } = grades
  
  // Create legacy state object for compatibility
  const state = {
    ...authState,
    ...coursesState,
    ...academicState,
    ...gradesState,
    students: authState.users?.filter(user => user.role === 'student') || []
  }
  const { isInitialized } = useMockData()

  // Get student data from DataContext
  const studentId = "user_1" // Assuming current user is student with ID "user_1"
  const student = state.students.find(s => s.id === studentId)
  
  // Calculate stats from DataContext
  const studentStats = useMemo(() => {
    const courses = state.courses.filter(course => 
      state.enrollments.some(enrollment => 
        enrollment.student_id === studentId && enrollment.course_id === course.id
      )
    )
    
    const assignments = courses.flatMap(course => 
      state.assignments.filter(assignment => assignment.course_id === course.id)
    )
    
    const submissions = assignments.flatMap(assignment =>
      state.submissions.filter(submission => 
        submission.student_id === studentId && submission.assignment_id === assignment.id
      )
    )
    
    // Calculate attendance rate
    const sessions = courses.flatMap((course: any) =>
      state.attendanceSessions.filter((session: any) => session.course_id === course.id)
    )
    
    const attendanceRecords = sessions.flatMap((session: any) =>
      state.attendanceRecords.filter((record: any) => 
        record.student_id === studentId && record.session_id === session.id
      )
    )
    
    const presentRecords = attendanceRecords.filter(record => 
      record.status === 'present' || record.status === 'late'
    )
    
    const attendanceRate = attendanceRecords.length > 0 
      ? Math.round((presentRecords.length / attendanceRecords.length) * 100)
      : 0
    
    // Calculate average grade
    const grades = courses.flatMap(course => getStudentGradesByCourse(studentId, course.id))
    const averageGrade = grades.length > 0
      ? Math.round(grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length)
      : 0

    return {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.status === 'active').length,
      completedCourses: courses.filter(c => c.status === 'completed').length,
      overallAttendanceRate: attendanceRate,
      averageGrade,
      totalAssignments: assignments.length,
      submittedAssignments: submissions.length,
      achievements: 12 // Mock value for now
    }
  }, [state, getStudentGradesByCourse, studentId])

  // Create profile from DataContext data
  const profile: StudentProfile = {
    id: student?.id || "student-123",
    studentId: student?.student_id || "STU2024001",
    firstName: student?.first_name || "Alex",
    lastName: student?.last_name || "Johnson",
    email: student?.email || "alex.johnson@university.edu",
    phone: student?.phone || "+1 (555) 123-4567",
    dateOfBirth: student?.date_of_birth || "2002-03-15",
    gender: student?.gender || "Non-binary",
    nationality: student?.nationality || "American",
    address: {
      street: student?.address || "123 University Ave, Apt 4B",
      city: "College Town",
      state: "CA",
      zipCode: "90210",
      country: "United States"
    },
    avatar: "/placeholder-user.jpg",
    
    program: "Bachelor of Science",
    major: "Computer Science",
    minor: "Mathematics",
    academicYear: "Junior",
    semester: "Fall 2024",
    enrollmentDate: student?.created_at || "2022-08-15",
    expectedGraduation: "2026-05-15",
    gpa: 3.75,
    credits: {
      completed: 90,
      total: 120,
      required: 120
    },
    
    stats: studentStats,
    
    preferences: {
      notifications: {
        email: true,
        push: true,
        assignments: true,
        attendance: true,
        grades: true
      },
      privacy: {
        profileVisibility: 'public',
        showGrades: false,
        showAttendance: true
      },
      language: 'English',
      timezone: 'America/Los_Angeles',
      theme: 'system'
    }
  }

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "Perfect Attendance",
      description: "Maintained 100% attendance for a full semester",
      icon: "🎯",
      dateEarned: "2024-01-15",
      category: "attendance"
    },
    {
      id: "2", 
      title: "Dean's List",
      description: "Achieved GPA of 3.5 or higher",
      icon: "🏆",
      dateEarned: "2023-12-20",
      category: "academic"
    },
    {
      id: "3",
      title: "Early Submitter",
      description: "Submitted all assignments before deadline for 3 consecutive courses",
      icon: "⚡",
      dateEarned: "2023-11-10",
      category: "academic"
    },
    {
      id: "4",
      title: "Active Participant",
      description: "Participated in 90% of class discussions",
      icon: "💬",
      dateEarned: "2023-10-05",
      category: "participation"
    }
  ]

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "assignment",
      title: "Data Structures Assignment Submitted",
      description: "Successfully submitted Assignment 3 for CS101",
      date: "2024-01-22T14:30:00",
      status: "success"
    },
    {
      id: "2",
      type: "attendance", 
      title: "Attendance Marked",
      description: "Present for Calculus II lecture",
      date: "2024-01-22T09:00:00",
      status: "success"
    },
    {
      id: "3",
      type: "grade",
      title: "Grade Received",
      description: "Received A- on English Composition essay",
      date: "2024-01-21T16:00:00",
      status: "success"
    },
    {
      id: "4",
      type: "course",
      title: "New Material Available",
      description: "Physics I lecture notes uploaded",
      date: "2024-01-21T11:00:00",
      status: "info"
    }
  ]

  const handleEditSection = (section: string) => {
    setEditingSection(section)
    setIsEditing(true)
  }

  const handleSaveSection = () => {
    setEditingSection(null)
    setIsEditing(false)
    // Save logic here
  }

  const handleCancelEdit = () => {
    setEditingSection(null)
    setIsEditing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpenIcon className="h-4 w-4" />
      case 'attendance':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'grade':
        return <StarIcon className="h-4 w-4" />
      case 'course':
        return <AcademicCapIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-gray-600'
      case 'warning':
        return 'text-gray-600'
      case 'info':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      academic: "#000000",
      attendance: "#333333", 
      participation: "#666666",
      special: "#999999"
    }
    return (
      <Chip 
        label={category.charAt(0).toUpperCase() + category.slice(1)}
        sx={{ 
          bgcolor: colors[category as keyof typeof colors] || "#cccccc",
          color: 'white',
          fontWeight: 600,
          border: '1px solid #000000'
        }}
      />
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3 
          }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={profile.avatar}
                sx={{ 
                  width: { xs: 120, sm: 100 }, 
                  height: { xs: 120, sm: 100 },
                  border: '3px solid #000'
                }}
              />
              <MUIButton
                size="small"
                sx={{
                  ...BUTTON_STYLES.primary,
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  minWidth: 'auto',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  p: 0
                }}
              >
                <CameraIcon className="h-4 w-4" />
              </MUIButton>
            </Box>
            
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 700, 
                mb: 1 
              }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'hsl(var(--muted-foreground))', 
                mb: 2,
                fontFamily: 'DM Sans, sans-serif'
              }}>
                {profile.studentId} • {profile.major} • {profile.academicYear}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: 2,
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <Typography variant="body2">{profile.phone}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                gap: 1 
              }}>
                <Chip 
                  label={`GPA: ${profile.gpa}`} 
                  color="primary" 
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`${profile.credits.completed}/${profile.credits.total} Credits`} 
                  color="default" 
                  size="small"
                />
                <Chip 
                  label={`${profile.stats.achievements} Achievements`} 
                  color="default" 
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Academic Progress */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrophyIcon className="h-5 w-5" />
            Academic Progress
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Degree Progress
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {profile.credits.completed}/{profile.credits.total} Credits ({Math.round((profile.credits.completed / profile.credits.total) * 100)}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(profile.credits.completed / profile.credits.total) * 100} 
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

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
            gap: 2,
            p: 2,
            bgcolor: 'hsl(var(--muted) / 0.3)',
            borderRadius: 2,
            border: '1px solid #000'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {profile.gpa}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                GPA
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {profile.stats.overallAttendanceRate}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Attendance
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {profile.stats.averageGrade}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Avg Grade
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {profile.stats.activeCourses}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Active Courses
              </Typography>
            </Box>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 }
      }}>
        <StatCard 
          title="Total Courses" 
          value={formatNumber(profile.stats.totalCourses)} 
          icon={BookOpenIcon} 
          color="#000000" 
          change={`${profile.stats.completedCourses} completed`} 
        />
        <StatCard 
          title="Assignments" 
          value={formatNumber(profile.stats.submittedAssignments)} 
          icon={CheckCircleIcon} 
          color="#000000" 
          change={`${profile.stats.totalAssignments} total`} 
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${profile.stats.overallAttendanceRate}%`} 
          icon={CalendarDaysIcon} 
          color="#000000" 
          change="Overall" 
        />
        <StatCard 
          title="Achievements" 
          value={formatNumber(profile.stats.achievements)} 
          icon={TrophyIcon} 
          color="#000000" 
          change="Earned" 
        />
      </Box>

      {/* Recent Activity & Achievements */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Recent Activity */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600, 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <ClockIcon className="h-5 w-5" />
              Recent Activity
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivity.slice(0, 5).map((activity) => (
                <Box key={activity.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  p: 2,
                  border: '1px solid #000',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'hsl(var(--muted) / 0.1)'
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--muted))',
                    border: '1px solid #000'
                  }}>
                    <Box className={getActivityColor(activity.status)}>
                      {getActivityIcon(activity.type)}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'hsl(var(--muted-foreground))', 
                      display: 'block',
                      mb: 0.5
                    }}>
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      {formatDate(activity.date)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </MUICardContent>
        </MUICard>

        {/* Recent Achievements */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600, 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TrophyIcon className="h-5 w-5" />
              Recent Achievements
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {achievements.slice(0, 4).map((achievement) => (
                <Box key={achievement.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  p: 2,
                  border: '1px solid #000',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'hsl(var(--muted) / 0.1)'
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--muted))',
                    border: '1px solid #000',
                    fontSize: '1.25rem'
                  }}>
                    {achievement.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {achievement.title}
                      </Typography>
                      {getCategoryBadge(achievement.category)}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: 'hsl(var(--muted-foreground))', 
                      display: 'block',
                      mb: 0.5
                    }}>
                      {achievement.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      Earned {formatDate(achievement.dateEarned)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </MUICardContent>
        </MUICard>
      </Box>
    </div>
  )

  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <UserIcon className="h-5 w-5" />
              Personal Information
            </Typography>
            <MUIButton
              variant="outlined"
              size="small"
              startIcon={<PencilIcon className="h-4 w-4" />}
              onClick={() => handleEditSection('personal')}
              sx={BUTTON_STYLES.outlined}
            >
              Edit
            </MUIButton>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <TextField
              label="First Name"
              value={profile.firstName}
              disabled={editingSection !== 'personal'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="Last Name"
              value={profile.lastName}
              disabled={editingSection !== 'personal'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="Email"
              value={profile.email}
              disabled={editingSection !== 'personal'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="Phone"
              value={profile.phone}
              disabled={editingSection !== 'personal'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={profile.dateOfBirth}
              disabled={editingSection !== 'personal'}
              sx={INPUT_STYLES}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl sx={INPUT_STYLES} disabled={editingSection !== 'personal'}>
              <InputLabel>Gender</InputLabel>
              <Select value={profile.gender} label="Gender">
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Non-binary">Non-binary</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Nationality"
              value={profile.nationality}
              disabled={editingSection !== 'personal'}
              sx={INPUT_STYLES}
            />
          </Box>

          {editingSection === 'personal' && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <MUIButton
                variant="outlined"
                onClick={handleCancelEdit}
                sx={BUTTON_STYLES.outlined}
              >
                Cancel
              </MUIButton>
              <MUIButton
                variant="contained"
                onClick={handleSaveSection}
                sx={BUTTON_STYLES.primary}
              >
                Save Changes
              </MUIButton>
            </Box>
          )}
        </MUICardContent>
      </MUICard>

      {/* Address Information */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <MapPinIcon className="h-5 w-5" />
              Address Information
            </Typography>
            <MUIButton
              variant="outlined"
              size="small"
              startIcon={<PencilIcon className="h-4 w-4" />}
              onClick={() => handleEditSection('address')}
              sx={BUTTON_STYLES.outlined}
            >
              Edit
            </MUIButton>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <TextField
              label="Street Address"
              value={profile.address.street}
              disabled={editingSection !== 'address'}
              sx={{ ...INPUT_STYLES, gridColumn: { xs: '1', sm: '1 / -1' } }}
            />
            <TextField
              label="City"
              value={profile.address.city}
              disabled={editingSection !== 'address'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="State/Province"
              value={profile.address.state}
              disabled={editingSection !== 'address'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="ZIP/Postal Code"
              value={profile.address.zipCode}
              disabled={editingSection !== 'address'}
              sx={INPUT_STYLES}
            />
            <TextField
              label="Country"
              value={profile.address.country}
              disabled={editingSection !== 'address'}
              sx={INPUT_STYLES}
            />
          </Box>

          {editingSection === 'address' && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <MUIButton
                variant="outlined"
                onClick={handleCancelEdit}
                sx={BUTTON_STYLES.outlined}
              >
                Cancel
              </MUIButton>
              <MUIButton
                variant="contained"
                onClick={handleSaveSection}
                sx={BUTTON_STYLES.primary}
              >
                Save Changes
              </MUIButton>
            </Box>
          )}
        </MUICardContent>
      </MUICard>
    </div>
  )

  const renderAcademicTab = () => (
    <div className="space-y-6">
      {/* Academic Information */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AcademicCapIcon className="h-5 w-5" />
            Academic Information
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <TextField
              label="Student ID"
              value={profile.studentId}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Program"
              value={profile.program}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Major"
              value={profile.major}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Minor"
              value={profile.minor || 'None'}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Academic Year"
              value={profile.academicYear}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Current Semester"
              value={profile.semester}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Enrollment Date"
              value={formatDate(profile.enrollmentDate)}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              label="Expected Graduation"
              value={formatDate(profile.expectedGraduation)}
              disabled
              sx={INPUT_STYLES}
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Academic Performance */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ChartBarIcon className="h-5 w-5" />
            Academic Performance
          </Typography>

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
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                {profile.gpa}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Current GPA
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                {profile.credits.completed}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Credits Earned
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                {profile.stats.completedCourses}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Courses Completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                {Math.round((profile.credits.completed / profile.credits.total) * 100)}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                Degree Progress
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Degree Completion
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {profile.credits.completed}/{profile.credits.total} Credits
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(profile.credits.completed / profile.credits.total) * 100} 
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'hsl(var(--muted))',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'hsl(var(--foreground))',
                  borderRadius: 5,
                }
              }}
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* All Achievements */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrophyIcon className="h-5 w-5" />
            All Achievements ({achievements.length})
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 2 
          }}>
            {achievements.map((achievement) => (
              <Box key={achievement.id} sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 2,
                border: '1px solid #000',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'hsl(var(--muted) / 0.1)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--muted))',
                  border: '1px solid #000',
                  fontSize: '1.5rem'
                }}>
                  {achievement.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {achievement.title}
                    </Typography>
                    {getCategoryBadge(achievement.category)}
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: 'hsl(var(--muted-foreground))', 
                    mb: 0.5,
                    lineHeight: 1.4
                  }}>
                    {achievement.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                    Earned {formatDate(achievement.dateEarned)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </MUICardContent>
      </MUICard>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Notification Settings */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <BellIcon className="h-5 w-5" />
            Notification Preferences
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.notifications.email} />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.notifications.push} />}
              label="Push Notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.notifications.assignments} />}
              label="Assignment Reminders"
            />
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.notifications.attendance} />}
              label="Attendance Notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.notifications.grades} />}
              label="Grade Updates"
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Privacy Settings */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ShieldCheckIcon className="h-5 w-5" />
            Privacy Settings
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl sx={INPUT_STYLES}>
              <InputLabel>Profile Visibility</InputLabel>
              <Select value={profile.preferences.privacy.profileVisibility} label="Profile Visibility">
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="friends">Friends Only</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.privacy.showGrades} />}
              label="Show Grades to Others"
            />
            <FormControlLabel
              control={<Switch defaultChecked={profile.preferences.privacy.showAttendance} />}
              label="Show Attendance to Others"
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* System Preferences */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CogIcon className="h-5 w-5" />
            System Preferences
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <FormControl sx={INPUT_STYLES}>
              <InputLabel>Language</InputLabel>
              <Select value={profile.preferences.language} label="Language">
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="French">French</MenuItem>
                <MenuItem value="German">German</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={INPUT_STYLES}>
              <InputLabel>Timezone</InputLabel>
              <Select value={profile.preferences.timezone} label="Timezone">
                <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                <MenuItem value="America/Denver">Mountain Time</MenuItem>
                <MenuItem value="America/Chicago">Central Time</MenuItem>
                <MenuItem value="America/New_York">Eastern Time</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={INPUT_STYLES}>
              <InputLabel>Theme</InputLabel>
              <Select value={profile.preferences.theme} label="Theme">
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Account Actions */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ShieldCheckIcon className="h-5 w-5" />
            Account Actions
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MUIButton
              variant="outlined"
              sx={BUTTON_STYLES.outlined}
            >
              Change Password
            </MUIButton>
            <MUIButton
              variant="outlined"
              sx={BUTTON_STYLES.outlined}
            >
              Download My Data
            </MUIButton>
            <MUIButton
              variant="outlined"
              color="error"
              sx={{
                borderColor: 'hsl(var(--destructive))',
                color: 'hsl(var(--destructive))',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'hsl(var(--destructive))',
                  backgroundColor: 'hsl(var(--destructive) / 0.1)',
                }
              }}
            >
              Deactivate Account
            </MUIButton>
          </Box>
        </MUICardContent>
      </MUICard>
    </div>
  )

  // Loading state
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={400} height={20} />
          </div>
        </div>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress sx={{ color: '#000000' }} />
        </Box>
      </div>
    )
  }

  // Error state
  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Profile</h1>
            <p className="text-muted-foreground font-dm-sans">Manage your personal information and account settings</p>
          </div>
        </div>
        <Alert severity="error" sx={{ borderColor: '#000000', bgcolor: '#f5f5f5' }}>
          <AlertTitle>Profile Not Found</AlertTitle>
          Unable to load your profile information. Please try refreshing the page or contact support if the issue persists.
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Profile</h1>
          <p className="text-muted-foreground font-dm-sans">Manage your personal information and account settings</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: 'hsl(var(--foreground))' },
              '& .MuiTab-root': {
                color: 'hsl(var(--muted-foreground))',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                '&.Mui-selected': { color: 'hsl(var(--foreground))', fontWeight: 600 },
                '&:hover': { color: 'hsl(var(--foreground))' },
              },
            }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Personal Info" value="personal" />
            <Tab label="Academic" value="academic" />
            <Tab label="Settings" value="settings" />
          </Tabs>
        </MUICardContent>
      </MUICard>

      {/* Tab Content */}
      {currentTab === 'overview' && renderOverviewTab()}
      {currentTab === 'personal' && renderPersonalTab()}
      {currentTab === 'academic' && renderAcademicTab()}
      {currentTab === 'settings' && renderSettingsTab()}
    </div>
  )
}