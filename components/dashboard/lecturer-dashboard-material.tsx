"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Box, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { ComputerDesktopIcon } from "@heroicons/react/24/outline"
import WelcomeHeader from "./welcome-header"
import StatsGrid from "@/components/admin/StatsGrid"
import AnalyticsCard from "./analytics-card"
import SessionsCard from "./sessions-card"
import CoursesCard from "./courses-card"
import SessionQrCodeDialog from "@/components/attendance/session-qr-code-dialog-new"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LecturerStats {
  totalCourses: number
  totalStudents: number
  todaySessions: number
  averageAttendance: number
}

interface Course {
  id: string
  course_code: string
  course_name: string
  credits: number
  enrollments?: Array<{ count: number }>
}

interface Session {
  id: string
  session_name: string
  session_date: string
  start_time: string
  end_time: string
  status: string
  course: {
    course_code: string
    course_name: string
  }
}

interface LecturerDashboardProps {
  userId: string
  className?: string
}

interface DashboardState {
  stats: LecturerStats
  courses: Course[]
  sessions: Session[]
  loading: boolean
  error: string | null
  isCreateSessionOpen: boolean
  isQrDialogOpen: boolean
  selectedSession: Session | null
}

interface QrDialogSession {
  id: string
  course_name: string
  session_name: string
  session_date: string
  start_time: string
  end_time: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATS: LecturerStats = {
  totalCourses: 0,
  totalStudents: 0,
  todaySessions: 0,
  averageAttendance: 0
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
} as const

const LOADING_CONFIG = {
  spinner: {
    size: 64,
    color: '#000000',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  },
  text: {
    color: '#666666',
    fontFamily: 'DM Sans'
  }
} as const

const DEFAULT_AVERAGE_ATTENDANCE = 87

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing dashboard state
 * Centralizes all dashboard-related state management
 */
const useDashboardState = (userId: string) => {
  const [state, setState] = useState<DashboardState>({
    stats: INITIAL_STATS,
    courses: [],
    sessions: [],
    loading: true,
    error: null,
    isCreateSessionOpen: false,
    isQrDialogOpen: false,
    selectedSession: null
  })

  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      stats: INITIAL_STATS,
      courses: [],
      sessions: [],
      loading: true,
      error: null
    }))
  }, [])

  return {
    state,
    updateState,
    resetState
  }
}

/**
 * Custom hook for data fetching operations
 * Handles all API calls and data processing
 */
const useDataFetching = (userId: string) => {
  const fetchLecturerData = useCallback(async (): Promise<{
    stats: LecturerStats
    courses: Course[]
    sessions: Session[]
  }> => {
    try {
      // Mock data for development - replace with actual API calls when database is ready
      const mockCourses: Course[] = [
        {
          id: "1",
          course_code: "CS101",
          course_name: "Introduction to Computer Science",
          credits: 3,
          enrollments: [{ count: 45 }]
        },
        {
          id: "2", 
          course_code: "CS201",
          course_name: "Data Structures",
          credits: 4,
          enrollments: [{ count: 38 }]
        },
        {
          id: "3",
          course_code: "CS301", 
          course_name: "Database Systems",
          credits: 3,
          enrollments: [{ count: 42 }]
        }
      ]

      const mockSessions: Session[] = [
        {
          id: "1",
          session_name: "Lecture 5: Data Structures",
          session_date: "2024-01-20",
          start_time: "09:00",
          end_time: "10:30",
          status: "active",
          course: {
            course_code: "CS101",
            course_name: "Introduction to Computer Science"
          }
        },
        {
          id: "2",
          session_name: "Tutorial 3: Database Design",
          session_date: "2024-01-21",
          start_time: "14:00", 
          end_time: "15:30",
          status: "scheduled",
          course: {
            course_code: "CS301",
            course_name: "Database Systems"
          }
        }
      ]

      // Calculate statistics
      const totalStudents = mockCourses.reduce(
        (sum, course) => sum + (course.enrollments?.[0]?.count || 0), 
        0
      )

      const todaySessions = mockSessions.filter(session => 
        new Date(session.session_date).toDateString() === new Date().toDateString()
      ).length

      const stats: LecturerStats = {
        totalCourses: mockCourses.length,
        totalStudents,
        todaySessions,
        averageAttendance: DEFAULT_AVERAGE_ATTENDANCE
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        stats,
        courses: mockCourses,
        sessions: mockSessions
      }
    } catch (error) {
      console.error('Error fetching lecturer data:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      throw new Error(errorMessage)
    }
  }, [userId])

  return { fetchLecturerData }
}

/**
 * Custom hook for dashboard actions
 * Handles user interactions and business logic
 */
const useDashboardActions = (userId: string, updateState: (updates: Partial<DashboardState>) => void) => {
  const startAttendanceSession = useCallback(async (courseId: string) => {
    try {
      console.log("Starting attendance session for course:", courseId)
      // TODO: Implement actual attendance session creation
      // This would typically create a new session in the database
    } catch (error) {
      console.error('Error starting attendance session:', error)
    }
  }, [])

  const handleShowQR = useCallback((session: Session) => {
    updateState({
      selectedSession: session,
      isQrDialogOpen: true
    })
  }, [updateState])

  const handleCloseQR = useCallback(() => {
    updateState({
      isQrDialogOpen: false,
      selectedSession: null
    })
  }, [updateState])

  const handleCreateSession = useCallback(() => {
    updateState({ isCreateSessionOpen: true })
  }, [updateState])

  const handleCloseCreateSession = useCallback(() => {
    updateState({ isCreateSessionOpen: false })
  }, [updateState])

  return {
    startAttendanceSession,
    handleShowQR,
    handleCloseQR,
    handleCreateSession,
    handleCloseCreateSession
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Error display component
 * Shows error message with retry option
 */
const ErrorDisplay = ({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry: () => void 
}) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 400,
    flexDirection: 'column',
    gap: 2
  }}>
    <Typography 
      variant="h6" 
      sx={{ 
        color: '#dc2626', 
        fontFamily: 'DM Sans',
        textAlign: 'center'
      }}
    >
      Failed to load dashboard
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        color: '#666666', 
        fontFamily: 'DM Sans',
        textAlign: 'center',
        maxWidth: 400
      }}
    >
      {error}
    </Typography>
    <button
      onClick={onRetry}
      style={{
        padding: '8px 16px',
        backgroundColor: '#000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: 'DM Sans',
        fontWeight: 600
      }}
      aria-label="Retry loading dashboard"
    >
      Try Again
    </button>
  </Box>
)

/**
 * Loading spinner component
 * Displays a centered loading animation
 */
const LoadingSpinner = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: 400 
    }}
    role="status"
    aria-label="Loading dashboard data"
  >
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: LOADING_CONFIG.spinner.size,
          height: LOADING_CONFIG.spinner.size,
          borderRadius: '50%',
          bgcolor: '#F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.3 }
          },
          animation: LOADING_CONFIG.spinner.animation
        }}
        aria-hidden="true"
      >
        <ComputerDesktopIcon 
          style={{ 
            width: 32, 
            height: 32, 
            color: LOADING_CONFIG.spinner.color 
          }} 
        />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          color: LOADING_CONFIG.text.color, 
          fontFamily: LOADING_CONFIG.text.fontFamily 
        }}
      >
        Loading dashboard...
      </Typography>
    </Box>
  </Box>
)

/**
 * Welcome header section component
 */
const WelcomeSection = ({ 
  userId, 
  onCreateSession 
}: { 
  userId: string
  onCreateSession: () => void 
}) => (
  <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
    <WelcomeHeader 
      onCreateSession={onCreateSession}
      lecturerId={userId}
    />
  </Box>
)

/**
 * Statistics grid section component
 */
const StatisticsSection = ({ stats }: { stats: LecturerStats }) => (
  <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
    <StatsGrid stats={stats} />
  </Box>
)

/**
 * Analytics section component
 */
const AnalyticsSection = () => (
  <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
    <AnalyticsCard />
  </Box>
)

/**
 * Sessions and courses grid section component
 */
const SessionsAndCoursesSection = ({ 
  sessions, 
  courses, 
  onShowQR, 
  onStartAttendance 
}: {
  sessions: Session[]
  courses: Course[]
  onShowQR: (session: Session) => void
  onStartAttendance: (courseId: string) => void
}) => (
  <Box sx={{ 
    display: 'grid', 
    gridTemplateColumns: { 
      xs: '1fr', 
      sm: '1fr', 
      md: '1fr 1fr',
      lg: '1fr 1fr' 
    },
    gap: { xs: 2, sm: 3, md: 3 },
    mb: { xs: 2, sm: 3, md: 4 }
  }}>
    <SessionsCard 
      sessions={sessions}
      onShowQR={onShowQR}
    />
    <CoursesCard 
      courses={courses}
      onStartAttendance={onStartAttendance}
    />
  </Box>
)

/**
 * QR code dialog component
 */
const QrCodeDialog = ({ 
  isOpen, 
  onClose, 
  session 
}: {
  isOpen: boolean
  onClose: () => void
  session: QrDialogSession | null
}) => (
  <SessionQrCodeDialog
    isOpen={isOpen}
    onOpenChange={onClose}
    session={session}
  />
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * LecturerDashboard component
 * 
 * Main dashboard for lecturers with:
 * - Welcome header with quick actions
 * - Statistics overview
 * - Analytics charts
 * - Recent sessions management
 * - Course management
 * - QR code generation for attendance
 * 
 * @param userId - The ID of the lecturer
 * @param className - Optional additional CSS classes
 */
export default function LecturerDashboard({ 
  userId, 
  className 
}: LecturerDashboardProps) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const { state, updateState, resetState } = useDashboardState(userId)
  const { fetchLecturerData } = useDataFetching(userId)
  const {
    startAttendanceSession,
    handleShowQR,
    handleCloseQR,
    handleCreateSession,
    handleCloseCreateSession
  } = useDashboardActions(userId, updateState)

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const qrDialogSession = useMemo((): QrDialogSession | null => {
    if (!state.selectedSession) return null
    
    return {
      id: state.selectedSession.id,
      course_name: state.selectedSession.course.course_name,
      session_name: state.selectedSession.session_name,
      session_date: state.selectedSession.session_date,
      start_time: state.selectedSession.start_time,
      end_time: state.selectedSession.end_time
    }
  }, [state.selectedSession])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch data on component mount and when userId changes
  useEffect(() => {
    const loadData = async () => {
      try {
        updateState({ loading: true, error: null })
        const data = await fetchLecturerData()
        updateState({
          ...data,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'
        updateState({ 
          loading: false, 
          error: errorMessage 
        })
      }
    }

    loadData()
  }, [userId, fetchLecturerData, updateState])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateSessionComplete = useCallback(() => {
    // Refresh data after session creation
    fetchLecturerData().then(data => {
      updateState({
        ...data,
        isCreateSessionOpen: false
      })
    }).catch(error => {
      console.error('Failed to refresh data after session creation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data'
      updateState({ error: errorMessage })
    })
  }, [fetchLecturerData, updateState])

  const handleRetry = useCallback(() => {
    const loadData = async () => {
      try {
        updateState({ loading: true, error: null })
        const data = await fetchLecturerData()
        updateState({
          ...data,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'
        updateState({ 
          loading: false, 
          error: errorMessage 
        })
      }
    }
    loadData()
  }, [fetchLecturerData, updateState])

  // ============================================================================
  // RENDER
  // ============================================================================

  if (state.loading) {
    return <LoadingSpinner />
  }

  if (state.error) {
    return <ErrorDisplay error={state.error} onRetry={handleRetry} />
  }

  return (
    <Box sx={{ 
      bgcolor: 'transparent',
      py: { xs: 1, sm: 2, md: 0 },
      px: { xs: 1, sm: 2, md: 0 },
      ...(className && { className })
    }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={ANIMATION_VARIANTS.container}
      >
        <WelcomeSection 
          userId={userId}
          onCreateSession={handleCreateSessionComplete}
        />

        <StatisticsSection stats={state.stats} />

        <AnalyticsSection />

        <SessionsAndCoursesSection
          sessions={state.sessions}
          courses={state.courses}
          onShowQR={handleShowQR}
          onStartAttendance={startAttendanceSession}
        />
      </motion.div>

      <QrCodeDialog
        isOpen={state.isQrDialogOpen}
        onClose={handleCloseQR}
        session={qrDialogSession}
      />
    </Box>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { 
  LecturerDashboardProps, 
  LecturerStats, 
  Course, 
  Session, 
  DashboardState,
  QrDialogSession 
}
export { INITIAL_STATS, ANIMATION_VARIANTS, LOADING_CONFIG, DEFAULT_AVERAGE_ATTENDANCE }