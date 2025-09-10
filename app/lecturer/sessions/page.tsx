"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  ClockIcon, 
  UsersIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { 
  Box, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Typography, 
  Button as MUIButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Tooltip,
  Paper,
  ClickAwayListener
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import CreateSessionModal from "@/components/attendance/session-creation-modal"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SessionStatus = "draft" | "scheduled" | "active" | "completed" | "cancelled"
type SessionType = "lecture" | "tutorial" | "lab" | "quiz" | "exam" | "seminar"
type ViewMode = "calendar" | "list" | "grid"

interface Session {
  id: string
  title: string
  courseCode: string
  courseName: string
  type: SessionType
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  enrolled: number
  status: SessionStatus
  description?: string
  materials?: string[]
  recurring?: {
    frequency: "weekly" | "biweekly" | "monthly"
    endDate: string
  }
  template?: string
  createdAt: string
  updatedAt: string
}

interface SessionTemplate {
  id: string
  name: string
  type: SessionType
  duration: number
  defaultLocation: string
  description: string
  isDefault: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SESSION_TYPES: { value: SessionType; label: string; color: string }[] = [
  { value: "lecture", label: "Lecture", color: "#8b5cf6" },
  { value: "tutorial", label: "Tutorial", color: "#06b6d4" },
  { value: "lab", label: "Lab", color: "#f59e0b" },
  { value: "quiz", label: "Quiz", color: "#ef4444" },
  { value: "exam", label: "Exam", color: "#6366f1" },
  { value: "seminar", label: "Seminar", color: "#10b981" }
]

const BUTTON_STYLES = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { bgcolor: '#111' }
  },
  secondary: {
    borderColor: '#000',
    color: '#000',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { 
      borderColor: '#000',
      bgcolor: 'rgba(0,0,0,0.04)'
    }
  }
} as const

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSessions: Session[] = [
  // Current week sessions
    {
      id: "1",
    title: "Data Structures & Algorithms",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
    type: "lecture",
      date: "2024-01-20",
      startTime: "09:00",
      endTime: "10:30",
      location: "Room 201",
    capacity: 50,
    enrolled: 45,
    status: "scheduled",
    description: "Introduction to fundamental data structures",
    materials: ["slides.pdf", "assignment1.pdf"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
    title: "Integration Techniques",
      courseCode: "MATH201", 
      courseName: "Calculus II",
    type: "tutorial",
      date: "2024-01-21",
      startTime: "14:00",
      endTime: "15:30",
      location: "Room 105",
    capacity: 30,
    enrolled: 28,
    status: "scheduled",
    description: "Practice session on integration methods",
    createdAt: "2024-01-16T14:00:00Z",
    updatedAt: "2024-01-16T14:00:00Z"
  },
    {
      id: "3",
    title: "Programming Lab - Python",
      courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    type: "lab",
    date: "2024-01-22",
    startTime: "10:00",
    endTime: "12:00",
    location: "Lab 3",
    capacity: 25,
    enrolled: 22,
    status: "draft",
    description: "Hands-on Python programming exercises",
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-17T09:00:00Z"
    },
    {
      id: "4",
    title: "Midterm Exam",
    courseCode: "MATH201",
    courseName: "Calculus II",
    type: "exam",
    date: "2024-01-25",
    startTime: "09:00",
    endTime: "11:00",
    location: "Hall A",
    capacity: 100,
    enrolled: 95,
    status: "scheduled",
    description: "Comprehensive midterm examination",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  // Next week sessions
  {
    id: "5",
    title: "Object-Oriented Programming",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    type: "lecture",
    date: "2024-01-27",
      startTime: "09:00",
      endTime: "10:30",
    location: "Room 201",
    capacity: 50,
    enrolled: 45,
    status: "scheduled",
    description: "Classes, objects, and inheritance concepts",
    materials: ["oop-slides.pdf"],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  },
  {
    id: "6",
    title: "Database Design Lab",
    courseCode: "CS201",
    courseName: "Database Systems",
    type: "lab",
    date: "2024-01-28",
    startTime: "14:00",
    endTime: "16:00",
    location: "Lab 5",
    capacity: 20,
    enrolled: 18,
    status: "scheduled",
    description: "Hands-on database design and SQL",
    materials: ["lab-exercise.pdf"],
    createdAt: "2024-01-21T14:00:00Z",
    updatedAt: "2024-01-21T14:00:00Z"
  },
  {
    id: "7",
    title: "Linear Algebra Tutorial",
    courseCode: "MATH301",
    courseName: "Linear Algebra",
    type: "tutorial",
    date: "2024-01-29",
    startTime: "11:00",
    endTime: "12:30",
    location: "Room 108",
    capacity: 25,
    enrolled: 23,
    status: "scheduled",
    description: "Matrix operations and vector spaces",
    createdAt: "2024-01-22T11:00:00Z",
    updatedAt: "2024-01-22T11:00:00Z"
  },
  {
    id: "8",
    title: "Web Development Workshop",
    courseCode: "CS301",
    courseName: "Web Technologies",
    type: "seminar",
    date: "2024-01-30",
    startTime: "15:00",
    endTime: "17:00",
    location: "Conference Room B",
    capacity: 40,
    enrolled: 35,
    status: "scheduled",
    description: "Modern web development practices",
    materials: ["workshop-materials.zip"],
    createdAt: "2024-01-23T15:00:00Z",
    updatedAt: "2024-01-23T15:00:00Z"
  },
  // Previous week sessions (completed)
  {
    id: "9",
    title: "Introduction to Algorithms",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    type: "lecture",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 201",
    capacity: 50,
    enrolled: 45,
    status: "completed",
    description: "Basic algorithm concepts and complexity",
    materials: ["algorithms-slides.pdf"],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "10",
    title: "Calculus Review Session",
      courseCode: "MATH201",
    courseName: "Calculus II",
    type: "tutorial",
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "15:30",
    location: "Room 105",
    capacity: 30,
    enrolled: 28,
    status: "completed",
    description: "Review of differentiation and integration",
    createdAt: "2024-01-11T14:00:00Z",
    updatedAt: "2024-01-16T15:30:00Z"
  },
  {
    id: "11",
    title: "Programming Fundamentals Lab",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    type: "lab",
      date: "2024-01-17",
    startTime: "10:00",
    endTime: "12:00",
    location: "Lab 3",
    capacity: 25,
    enrolled: 22,
    status: "completed",
    description: "Basic programming concepts in Python",
    materials: ["lab-solutions.pdf"],
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-17T12:00:00Z"
  },
  // Future sessions (next month)
  {
    id: "12",
    title: "Machine Learning Basics",
    courseCode: "CS401",
    courseName: "Artificial Intelligence",
    type: "lecture",
    date: "2024-02-05",
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 301",
    capacity: 60,
    enrolled: 55,
    status: "scheduled",
    description: "Introduction to machine learning concepts",
    materials: ["ml-intro.pdf"],
    createdAt: "2024-01-25T09:00:00Z",
    updatedAt: "2024-01-25T09:00:00Z"
  },
  {
    id: "13",
    title: "Data Visualization Workshop",
    courseCode: "CS301",
    courseName: "Data Science",
    type: "seminar",
    date: "2024-02-07",
      startTime: "14:00",
    endTime: "16:00",
    location: "Lab 7",
    capacity: 30,
    enrolled: 28,
    status: "scheduled",
    description: "Creating effective data visualizations",
    materials: ["viz-tools.pdf"],
    createdAt: "2024-01-26T14:00:00Z",
    updatedAt: "2024-01-26T14:00:00Z"
  },
  {
    id: "14",
    title: "Statistics Quiz",
    courseCode: "MATH301",
    courseName: "Statistics",
    type: "quiz",
    date: "2024-02-10",
    startTime: "10:00",
    endTime: "11:00",
    location: "Room 108",
    capacity: 25,
    enrolled: 24,
    status: "scheduled",
    description: "Probability and statistical inference",
    createdAt: "2024-01-27T10:00:00Z",
    updatedAt: "2024-01-27T10:00:00Z"
  },
  // Multiple sessions on same day
  {
    id: "15",
    title: "Software Engineering Principles",
    courseCode: "CS301",
    courseName: "Software Engineering",
    type: "lecture",
    date: "2024-01-24",
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 205",
    capacity: 40,
    enrolled: 38,
    status: "scheduled",
    description: "Software development methodologies",
    materials: ["se-principles.pdf"],
    createdAt: "2024-01-19T09:00:00Z",
    updatedAt: "2024-01-19T09:00:00Z"
  },
  {
    id: "16",
    title: "Software Testing Lab",
    courseCode: "CS301",
    courseName: "Software Engineering",
    type: "lab",
    date: "2024-01-24",
      startTime: "14:00",
    endTime: "16:00",
    location: "Lab 4",
    capacity: 20,
    enrolled: 18,
    status: "scheduled",
    description: "Unit testing and test-driven development",
    materials: ["testing-framework.pdf"],
    createdAt: "2024-01-19T14:00:00Z",
    updatedAt: "2024-01-19T14:00:00Z"
  },
  {
    id: "17",
    title: "Project Management Seminar",
    courseCode: "CS301",
    courseName: "Software Engineering",
    type: "seminar",
    date: "2024-01-24",
    startTime: "16:30",
    endTime: "18:00",
    location: "Conference Room A",
    capacity: 35,
    enrolled: 32,
    status: "scheduled",
    description: "Agile methodologies and project planning",
    materials: ["agile-guide.pdf"],
    createdAt: "2024-01-19T16:30:00Z",
    updatedAt: "2024-01-19T16:30:00Z"
  },
  // Active session
  {
    id: "18",
    title: "Current Active Session",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    type: "lecture",
    date: new Date().toISOString().split('T')[0], // Today
    startTime: "10:00",
    endTime: "11:30",
    location: "Room 201",
    capacity: 50,
    enrolled: 45,
    status: "active",
    description: "Currently running session",
    materials: ["live-notes.pdf"],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  }
]

const mockTemplates: SessionTemplate[] = [
  {
    id: "t1",
    name: "Standard Lecture",
    type: "lecture",
    duration: 90,
    defaultLocation: "Room 201",
    description: "90-minute lecture with Q&A",
    isDefault: true
  },
  {
    id: "t2",
    name: "Tutorial Session",
    type: "tutorial",
    duration: 90,
    defaultLocation: "Room 105",
    description: "Interactive tutorial with exercises",
    isDefault: true
  },
  {
    id: "t3",
    name: "Programming Lab",
    type: "lab",
    duration: 120,
    defaultLocation: "Lab 3",
    description: "Hands-on programming session",
    isDefault: false
  }
]

// ============================================================================
// COMPONENTS
// ============================================================================

function SessionCard({ session, onEdit, onStart, onDelete, onView }: {
  session: Session
  onEdit: (session: Session) => void
  onStart: (session: Session) => void
  onDelete: (session: Session) => void
  onView: (session: Session) => void
}) {
  const sessionType = SESSION_TYPES.find(t => t.value === session.type)
  
  return (
    <MUICard
      sx={{
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'border',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%', // Ensure all cards have same height
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
        }
      }}
    >
      <MUICardContent sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        flex: 1
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                color: '#000',
                mb: 0.5
              }}
            >
              {session.title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#666',
                mb: 1
              }}
            >
              {session.courseCode} • {session.courseName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={sessionType?.label}
                size="small"
                sx={{ 
                  bgcolor: sessionType?.color,
                  color: 'white',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip 
                label={session.status}
                size="small"
                variant="outlined"
                sx={{ 
                  textTransform: 'capitalize',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Session">
              <IconButton size="small" onClick={() => onEdit(session)}>
                <PencilIcon style={{ width: 16, height: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Session">
              <IconButton size="small" onClick={() => onDelete(session)}>
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Details - This section will grow to fill available space */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3, flex: 1 }}>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#999',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Date & Time
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#333',
                fontWeight: 500
              }}
            >
              {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#999',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Location
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#333',
                fontWeight: 500
              }}
            >
              {session.location}
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#999',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Enrollment
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#333',
                fontWeight: 500
              }}
            >
              {session.enrolled} / {session.capacity}
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#999',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Duration
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#333',
                fontWeight: 500
              }}
            >
              {Math.abs(new Date(`2000-01-01T${session.endTime}`).getTime() - new Date(`2000-01-01T${session.startTime}`).getTime()) / (1000 * 60)} min
            </Typography>
          </Box>
        </Box>

        {/* Actions - Always positioned at the bottom */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          {session.status === 'scheduled' && (
            <MUIButton 
              variant="contained" 
              onClick={() => onStart(session)}
              sx={{
                ...BUTTON_STYLES.primary,
                flex: 1,
                py: 1.5
              }}
            >
              Start Session
            </MUIButton>
          )}
          <MUIButton 
            variant="outlined" 
            onClick={() => onView(session)}
            sx={{
              ...BUTTON_STYLES.secondary,
              flex: 1,
              py: 1.5
            }}
            startIcon={<EyeIcon className="h-4 w-4" />}
          >
            View
          </MUIButton>
          <MUIButton 
            variant="outlined" 
            onClick={() => onEdit(session)}
            sx={{
              ...BUTTON_STYLES.secondary,
              flex: 1,
              py: 1.5
            }}
          >
            Edit
          </MUIButton>
        </Box>
      </MUICardContent>
    </MUICard>
  )
}

function CalendarView({ 
  sessions, 
  onEdit, 
  onStart, 
  onDelete, 
  onCreateSession,
  onView
}: {
  sessions: Session[]
  onEdit: (session: Session) => void
  onStart: (session: Session) => void
  onDelete: (session: Session) => void
  onCreateSession: () => void
  onView: (session: Session) => void
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the starting date (first Sunday of the calendar grid)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Generate 42 days (6 weeks) for the calendar grid
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }, [currentDate])

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: { [key: string]: Session[] } = {}
    sessions.forEach(session => {
      const dateKey = session.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(session)
    })
    return grouped
  }, [sessions])

  // Format date for display
  const formatDateKey = useCallback((date: Date) => {
    return date.toISOString().split('T')[0]
  }, [])

  // Navigate months
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }, [])

  // Handle date selection
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  // Get sessions for a specific date
  const getSessionsForDate = useCallback((date: Date) => {
    const dateKey = formatDateKey(date)
    return sessionsByDate[dateKey] || []
  }, [sessionsByDate, formatDateKey])

  // Get today's sessions
  const todaysSessions = useMemo(() => {
    const today = new Date()
    return getSessionsForDate(today)
  }, [getSessionsForDate])

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = useMemo(() => {
    const upcoming = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const sessions = getSessionsForDate(date)
      if (sessions.length > 0) {
        upcoming.push({ date, sessions })
      }
    }
    return upcoming
  }, [getSessionsForDate])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Calendar Header */}
      <MUICard sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
        <MUICardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            gap: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => navigateMonth('prev')}
                  size="small"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                  }}
                >
                  <ChevronLeftIcon style={{ width: 18, height: 18 }} />
                </IconButton>
                <IconButton 
                  onClick={() => navigateMonth('next')}
                  size="small"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                  }}
                >
                  <ChevronRightIcon style={{ width: 18, height: 18 }} />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <MUIButton
                variant="contained"
                onClick={onCreateSession}
                sx={{
                  ...BUTTON_STYLES.primary,
                  fontSize: '0.9rem'
                }}
              >
                Create Session
              </MUIButton>
            </Box>
          </Box>

          {/* Calendar Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1,
            width: '100%'
          }}>
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Typography 
                key={day}
                variant="body2" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 600, 
                  textAlign: 'center',
                  color: '#666',
                  py: 1,
                  fontSize: '0.875rem'
                }}
              >
                {day}
              </Typography>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              const daySessions = getSessionsForDate(date)

              return (
                <Box
                  key={index}
                  onClick={() => handleDateClick(date)}
                  sx={{
                    minHeight: 120,
                    p: 1,
                    border: '1px solid',
                    borderColor: isSelected ? '#000' : 'divider',
                    borderRadius: 2,
                    bgcolor: isSelected 
                      ? '#f0f0f0' 
                      : isCurrentMonth 
                        ? 'white' 
                        : '#f8f9fa',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isSelected 
                        ? '#e0e0e0' 
                        : isCurrentMonth 
                          ? '#f8f9fa' 
                          : '#f0f0f0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {/* Date Number */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: isToday ? 700 : isSelected ? 600 : 500,
                      color: isCurrentMonth 
                        ? (isToday ? '#000' : isSelected ? '#000' : '#333') 
                        : '#999',
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    {date.getDate()}
                  </Typography>

                  {/* Sessions for this day */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 0.5,
                    maxHeight: 80,
                    overflowY: 'auto'
                  }}>
                    {daySessions.slice(0, 3).map((session) => {
                      const sessionType = SESSION_TYPES.find(t => t.value === session.type)
                      return (
                        <Box
                          key={session.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(session)
                          }}
                          sx={{
                            p: 0.5,
                            bgcolor: sessionType?.color || '#666',
                            color: 'white',
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              opacity: 0.8,
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'DM Sans, sans-serif',
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.1
                            }}
                            title={session.title}
                          >
                            {session.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'DM Sans, sans-serif',
                              fontSize: '0.6rem',
                              opacity: 0.9,
                              display: 'block',
                              lineHeight: 1.1
                            }}
                          >
                            {session.startTime}
                          </Typography>
                        </Box>
                      )
                    })}
                    {daySessions.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'DM Sans, sans-serif',
                          color: '#666',
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          fontStyle: 'italic'
                        }}
                      >
                        +{daySessions.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <MUICard sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
          <MUICardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600, 
                mb: 2
              }}
            >
              Sessions for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            {getSessionsForDate(selectedDate).length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {getSessionsForDate(selectedDate).map((session) => {
                  const sessionType = SESSION_TYPES.find(t => t.value === session.type)
                  return (
                    <Box
                      key={session.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#000',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontFamily: 'Poppins, sans-serif', 
                              fontWeight: 700, 
                              mb: 0.5
                            }}
                          >
                            {session.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'DM Sans, sans-serif', 
                              color: '#666', 
                              mb: 1
                            }}
                          >
                            {session.courseCode} • {session.courseName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={sessionType?.label}
                              size="small"
                              sx={{ 
                                bgcolor: sessionType?.color,
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                            />
                            <Chip 
                              label={session.status}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                textTransform: 'capitalize',
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {session.status === 'scheduled' && (
                            <MUIButton 
                              variant="contained" 
                              size="small"
                              onClick={() => onStart(session)}
                              sx={BUTTON_STYLES.primary}
                            >
                              Start
                            </MUIButton>
                          )}
                          <MUIButton 
                            variant="outlined" 
                            size="small"
                            onClick={() => onView(session)}
                            sx={BUTTON_STYLES.secondary}
                          >
                            View
                          </MUIButton>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#999', fontSize: '0.75rem', mb: 0.5 }}>
                            Time
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                            {session.startTime} - {session.endTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#999', fontSize: '0.75rem', mb: 0.5 }}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                            {session.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'DM Sans, sans-serif', 
                    color: '#999',
                    mb: 2
                  }}
                >
                  No sessions scheduled for this date
                </Typography>
                <MUIButton
                  variant="outlined"
                  onClick={onCreateSession}
                  sx={BUTTON_STYLES.secondary}
                >
                  Create Session
                </MUIButton>
              </Box>
            )}
          </MUICardContent>
        </MUICard>
      )}
    </Box>
  )
}

export default function SessionsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return mockSessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || session.status === statusFilter
      const matchesType = typeFilter === "all" || session.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockSessions.length
    const scheduled = mockSessions.filter(s => s.status === 'scheduled').length
    const active = mockSessions.filter(s => s.status === 'active').length
    const completed = mockSessions.filter(s => s.status === 'completed').length
    const avgEnrollment = mockSessions.reduce((sum, s) => sum + s.enrolled, 0) / total

    return { total, scheduled, active, completed, avgEnrollment }
  }, [])

  const handleCreateSession = () => {
    setShowCreateDialog(true)
  }

  const handleEditSession = (session: Session) => {
    setSelectedSession(session)
    // Open edit dialog
  }

  const handleViewSession = (session: Session) => {
    router.push(`/lecturer/sessions/${session.id}`)
  }

  const handleStartSession = (session: Session) => {
    router.push(`/lecturer/attendance/${session.id}`)
  }

  const handleDeleteSession = (session: Session) => {
    // Show confirmation dialog
    console.log('Deleting session:', session)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Plan and manage your teaching sessions</p>
                    </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined" 
            startIcon={<CalendarDaysIcon style={{ width: 16, height: 16 }} />}
            sx={BUTTON_STYLES.secondary}
          >
            <span className="hidden xs:inline">Calendar View</span>
            <span className="xs:hidden">Calendar</span>
          </MUIButton>
          <MUIButton 
            variant="contained" 
            startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
            onClick={handleCreateSession}
            sx={BUTTON_STYLES.primary}
          >
            <span className="hidden xs:inline">Create Session</span>
            <span className="xs:hidden">Create</span>
          </MUIButton>
                      </div>
                    </div>

      {/* Stats Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 3 }
      }}>
        <StatCard
          title="Total Sessions"
          value={stats.total}
          subtitle="All sessions"
          icon={CalendarDaysIcon}
          color="#000000"
          change={`${stats.scheduled} scheduled`}
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          subtitle="Upcoming sessions"
          icon={ClockIcon}
          color="#f59e0b"
          change={`${stats.active} active now`}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle="Finished sessions"
          icon={CheckCircleIcon}
          color="#10b981"
          change="This month"
        />
        <StatCard
          title="Avg Enrollment"
          value={`${Math.round(stats.avgEnrollment)}`}
          subtitle="Students per session"
          icon={UsersIcon}
          color="#6366f1"
          change="Across all sessions"
        />
      </Box>

      {/* Filters and Search */}
      <MUICard sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
        <MUICardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <MagnifyingGlassIcon style={{ width: 20, height: 20, marginRight: 8, color: '#666' }} />
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {SESSION_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* View Mode Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={viewMode} 
              onChange={(e, value) => setViewMode(value)}
              sx={{ minHeight: 40 }}
            >
              <Tab 
                label="Grid View" 
                value="grid"
                sx={{ 
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  minHeight: 40
                }}
              />
              <Tab 
                label="List View" 
                value="list"
                sx={{ 
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  minHeight: 40
                }}
              />
              <Tab 
                label="Calendar View" 
                value="calendar"
                sx={{ 
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  minHeight: 40
                }}
              />
            </Tabs>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Sessions Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {viewMode === 'grid' && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: 3
          }}>
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onEdit={handleEditSession}
                onStart={handleStartSession}
                onDelete={handleDeleteSession}
                onView={handleViewSession}
              />
            ))}
          </Box>
        )}

        {viewMode === 'list' && (
          <MUICard sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
            <MUICardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {filteredSessions.map((session, index) => (
                  <Box
                    key={session.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'stretch', md: 'center' },
                      p: { xs: 2, sm: 3 },
                      borderBottom: index < filteredSessions.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      gap: { xs: 2, md: 0 },
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                    }}
                  >
                    <Box sx={{ flex: 1, mb: { xs: 1, md: 0 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'Poppins, sans-serif', 
                          fontWeight: 700, 
                          mb: 0.5,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {session.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'DM Sans, sans-serif', 
                          color: '#666', 
                          mb: 1,
                          fontSize: { xs: '0.875rem', sm: '0.9rem' }
                        }}
                      >
                        {session.courseCode} • {session.courseName}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip 
                          label={SESSION_TYPES.find(t => t.value === session.type)?.label}
                          size="small"
                          sx={{ 
                            bgcolor: SESSION_TYPES.find(t => t.value === session.type)?.color,
                            color: 'white',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        />
                        <Chip 
                          label={session.status}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            textTransform: 'capitalize', 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Desktop Layout */}
                    <Box sx={{ 
                      display: { xs: 'none', md: 'flex' }, 
                      alignItems: 'center', 
                      gap: 2, 
                      minWidth: 200 
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#999', fontSize: '0.75rem' }}>
                          Date & Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                          {new Date(session.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#666' }}>
                          {session.startTime} - {session.endTime}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#999', fontSize: '0.75rem' }}>
                          Location
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                          {session.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {session.status === 'scheduled' && (
                          <MUIButton 
                            variant="contained" 
                            size="small"
                            onClick={() => handleStartSession(session)}
                            sx={BUTTON_STYLES.primary}
                          >
                            Start
                          </MUIButton>
                        )}
                        <MUIButton 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewSession(session)}
                          sx={BUTTON_STYLES.secondary}
                        >
                          View
                        </MUIButton>
                        <MUIButton 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleEditSession(session)}
                          sx={BUTTON_STYLES.secondary}
                        >
                          Edit
                        </MUIButton>
                      </Box>
                    </Box>

                    {/* Mobile Layout */}
                    <Box sx={{ 
                      display: { xs: 'flex', md: 'none' }, 
                      flexDirection: 'column', 
                      gap: 2 
                    }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#999', fontSize: '0.75rem', mb: 0.5 }}>
                            Date & Time
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.875rem' }}>
                            {new Date(session.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#666', fontSize: '0.8rem' }}>
                            {session.startTime} - {session.endTime}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#999', fontSize: '0.75rem', mb: 0.5 }}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.875rem' }}>
                            {session.location}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        {session.status === 'scheduled' && (
                          <MUIButton 
                            variant="contained" 
                            size="small"
                            onClick={() => handleStartSession(session)}
                            sx={{
                              ...BUTTON_STYLES.primary,
                              flex: 1,
                              fontSize: '0.875rem'
                            }}
                          >
                            Start
                          </MUIButton>
                        )}
                        <MUIButton 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewSession(session)}
                          sx={{
                            ...BUTTON_STYLES.secondary,
                            flex: 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          View
                        </MUIButton>
                        <MUIButton 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleEditSession(session)}
                          sx={{
                            ...BUTTON_STYLES.secondary,
                            flex: 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          Edit
                        </MUIButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </MUICardContent>
          </MUICard>
        )}

        {viewMode === 'calendar' && (
          <CalendarView 
            sessions={filteredSessions}
            onEdit={handleEditSession}
            onStart={handleStartSession}
            onDelete={handleDeleteSession}
            onCreateSession={handleCreateSession}
            onView={handleViewSession}
          />
        )}
      </motion.div>

      {/* Create Session Modal */}
      <CreateSessionModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        lecturerId="lecturer-123" // Replace with actual lecturer ID
        onSessionCreated={() => {
          // Refresh sessions or update state
          console.log('Session created successfully')
        }}
      />
    </div>
  )
}