"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import CreateSessionModal from "@/components/attendance/session-creation-modal-new"
import SessionQrCodeDialog from "@/components/attendance/session-qr-code-dialog-new"
import { 
  CalendarDaysIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  PlayIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline"
import { QRCodeCanvas } from 'qrcode.react'
import { formatDate, formatTime } from "@/lib/utils"
import { mapSessionStatus } from "@/lib/utils/statusMapping"
import { useAttendance, useCourses, useAcademicStructure } from "@/lib/domains"
import { toast } from "sonner"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SessionStatus = "draft" | "scheduled" | "active" | "completed" | "cancelled"
type SessionType = "lecture" | "tutorial" | "lab" | "quiz" | "exam" | "seminar"
type ViewMode = "list" | "grid"

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
  createdAt: string
  updatedAt: string
  qrCode?: string
}

interface SessionStats {
  totalSessions: number
  activeSessions: number
  scheduledSessions: number
  completedSessions: number
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

const LIST_CARD_SX = {
  ...CARD_SX,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
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
  '& .MuiMenuItem-root': {
    '&:hover': { backgroundColor: 'hsl(var(--muted))' },
    '&.Mui-selected': { 
      backgroundColor: 'hsl(var(--muted))', 
      '&:hover': { backgroundColor: 'hsl(var(--muted))' } 
    }
  }
}

const SESSION_TYPES: { value: SessionType; label: string; color: string }[] = [
  { value: "lecture", label: "Lecture", color: "#8b5cf6" },
  { value: "tutorial", label: "Tutorial", color: "#06b6d4" },
  { value: "lab", label: "Lab", color: "#f59e0b" },
  { value: "quiz", label: "Quiz", color: "#ef4444" },
  { value: "exam", label: "Exam", color: "#6366f1" },
  { value: "seminar", label: "Seminar", color: "#10b981" }
]

const STATUS_COLORS = {
  draft: "hsl(var(--muted-foreground))",
  scheduled: "hsl(var(--muted-foreground))",
  active: "hsl(var(--muted-foreground))", 
  completed: "hsl(var(--muted-foreground))",
  cancelled: "hsl(var(--muted-foreground))"
}

// Map local SessionStatus (which includes 'draft') to shared SessionStatus
const toSharedSessionStatus = (status: SessionStatus): 'scheduled' | 'active' | 'completed' | 'cancelled' => {
  return status === 'draft' ? 'scheduled' : status
}

// ============================================================================
// MOCK DATA
// ============================================================================

// Mock data removed - now using DataContext

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LecturerSessionsPage() {
  const router = useRouter()
  const attendance = useAttendance()
  const courses = useCourses()
  const academic = useAcademicStructure()
  
  // Extract state and methods
  const { state: attendanceState, fetchAttendanceSessions, deleteAttendanceSessionSupabase, updateAttendanceSessionSupabase } = attendance
  const { state: coursesState } = courses
  const { state: academicState } = academic
  
  // Create legacy state object for compatibility
  const state = {
    ...attendanceState,
    ...coursesState,
    ...academicState
  }
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<any>(null)

  // Load sessions data on component mount
  React.useEffect(() => {
    console.log('Lecturer Sessions Page: Loading attendance sessions...')
    fetchAttendanceSessions()
  }, [fetchAttendanceSessions])

  // Debug: Log current state
  React.useEffect(() => {
    console.log('Lecturer Sessions Page: Current state:', {
      attendanceSessions: state.attendanceSessions,
      attendanceSessionsCount: state.attendanceSessions.length,
      loading: state.loading,
      error: state.error
    })
  }, [state.attendanceSessions, state.loading, state.error])

  // Transform attendance sessions to match the Session interface
  const sessions = React.useMemo(() => {
    const now = new Date()
    const deriveStatus = (s: any): SessionStatus => {
      // Build JS Date objects from date and time strings
      const start = new Date(`${s.session_date}T${(s.start_time || '00:00').padStart(5, '0')}:00`)
      const end = new Date(`${s.session_date}T${(s.end_time || '23:59').padStart(5, '0')}:00`)

      if (now > end) return 'completed'
      if (now >= start && now <= end) return 'active'
      return (s.status as SessionStatus) || 'scheduled'
    }

    return state.attendanceSessions.map(session => ({
      id: session.id,
      title: session.session_name,
      courseCode: session.course_code,
      courseName: session.course_name,
      type: (session.type || 'lecture') as SessionType,
      date: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      location: session.location || 'TBA',
      capacity: session.capacity || 50,
      enrolled: session.enrolled || 0,
      status: deriveStatus(session),
      description: session.description,
      materials: [],
      createdAt: session.created_at,
      updatedAt: session.created_at,
      qrCode: session.qr_code
    }))
  }, [state.attendanceSessions])

  // Calculate stats from sessions
  const stats: SessionStats = useMemo(() => {
    const total = sessions.length
    const active = sessions.filter(s => s.status === "active").length
    const scheduled = sessions.filter(s => s.status === "scheduled").length
    const completed = sessions.filter(s => s.status === "completed").length

    return {
      totalSessions: total,
      activeSessions: active,
      scheduledSessions: scheduled,
      completedSessions: completed
    }
  }, [sessions])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSessions = useMemo(() => {
    let filtered = sessions

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.courseCode.toLowerCase().includes(query) ||
        session.courseName.toLowerCase().includes(query) ||
        session.location.toLowerCase().includes(query)
      )
    }

    // Filter by status (use centralized mapping for lecturer)
    if (statusFilter !== "all") {
      filtered = filtered.filter(session => mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(session => session.type === typeFilter)
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [sessions, searchQuery, statusFilter, typeFilter])

// ============================================================================
  // EVENT HANDLERS
// ============================================================================

  const handleTabChange = (_: React.SyntheticEvent, newValue: ViewMode) => {
    setViewMode(newValue)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleViewSession = (session: Session) => {
    router.push(`/lecturer/sessions/${session.id}`)
  }

  const handleEditSession = (session: Session) => {
    console.log('Edit button clicked for session:', session)
    // Find the original session data from the database (not the transformed UI data)
    const originalSession = state.attendanceSessions.find(s => s.id === session.id)
    if (originalSession) {
      console.log('Found original session data for editing:', originalSession)
      setEditingSession(originalSession)
      setEditModalOpen(true)
    } else {
      console.error('Original session not found for editing:', session.id)
      toast.error('Session data not found for editing')
    }
  }

  const handleStartSession = (session: Session) => {
    // Start the session - update status to active
    console.log('Starting session:', session.id)
  }

  const handleDeleteSession = async (sessionId: string) => {
    console.log('Delete button clicked for session:', sessionId)
    
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      console.log('Delete cancelled by user')
      return
    }
    
    // Show loading toast
    const loadingToast = toast.loading('Deleting session...')
    
    try {
      console.log('Deleting session:', sessionId)
      
      // Check if session exists
      const session = state.attendanceSessions.find(s => s.id === sessionId)
      if (!session) {
        throw new Error('Session not found')
      }
      
      console.log('Session found:', session)
      
      // Delete the session
      await deleteAttendanceSessionSupabase(sessionId)
      console.log('Session deleted successfully from database')
      
      // Refresh the sessions list
      console.log('Refreshing sessions list...')
      await fetchAttendanceSessions()
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`Session "${session.session_name}" deleted successfully!`)
      
    } catch (error: any) {
      console.error('Error deleting session:', error)
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error(`Failed to delete session: ${error.message || 'Unknown error'}`)
    }
  }

  const handleShowQR = (session: Session) => {
    setSelectedSession(session)
    setShowQRDialog(true)
  }

  const handleEditModalClose = () => {
    setEditModalOpen(false)
    setEditingSession(null)
  }

  const getStatusColor = (status: SessionStatus) => {
    return STATUS_COLORS[status]
  }

  const getTypeColor = (type: SessionType) => {
    return 'hsl(var(--muted-foreground))'
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const SessionCard = ({ session }: { session: Session }) => (
    <MUICard sx={{ ...LIST_CARD_SX, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <MUICardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                color: 'hsl(var(--foreground))',
                mb: 0.5
              }}
            >
              {session.title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'hsl(var(--muted-foreground))',
                mb: 1
              }}
            >
              {session.courseCode} • {session.courseName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={SESSION_TYPES.find(t => t.value === session.type)?.label}
                size="small"
                sx={{ 
                  bgcolor: getTypeColor(session.type),
                  color: 'white',
                  fontWeight: 600
                }}
              />
              {(() => {
                const displayStatus = mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') as 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
                return (
                  <Chip 
                    label={displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                    size="small"
                    sx={{ 
                      bgcolor: getStatusColor(displayStatus),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                )
              })()}
            </Box>
          </Box>
          <IconButton size="small">
            <EllipsisVerticalIcon style={{ width: 16, height: 16 }} />
              </IconButton>
        </Box>

        {/* Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarDaysIcon style={{ width: 16, height: 16, color: 'hsl(var(--muted-foreground))' }} />
            <Typography variant="body2">
              {formatDate(session.date)} • {session.startTime} - {session.endTime}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UsersIcon style={{ width: 16, height: 16, color: 'hsl(var(--muted-foreground))' }} />
            <Typography variant="body2">
              {session.enrolled}/{session.capacity} students • {session.location}
            </Typography>
          </Box>
          {session.materials && session.materials.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DocumentTextIcon style={{ width: 16, height: 16, color: 'hsl(var(--muted-foreground))' }} />
              <Typography variant="body2">
                {session.materials.length} material{session.materials.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
          <IconButton 
            size="small" 
            onClick={() => handleViewSession(session)}
            sx={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <EyeIcon style={{ width: 16, height: 16 }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleEditSession(session)}
            sx={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <PencilIcon style={{ width: 16, height: 16 }} />
          </IconButton>
          {(mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === 'active' || mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === 'scheduled') && (
            <IconButton 
              size="small" 
              onClick={() => handleShowQR(session)}
              sx={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <QrCodeIcon style={{ width: 16, height: 16 }} />
            </IconButton>
          )}
          {mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === 'scheduled' && (
                <IconButton 
                  size="small"
              onClick={() => handleStartSession(session)}
              sx={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <PlayIcon style={{ width: 16, height: 16 }} />
                </IconButton>
          )}
                <IconButton 
                  size="small"
            onClick={() => handleDeleteSession(session.id)}
            sx={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <TrashIcon style={{ width: 16, height: 16 }} />
                </IconButton>
              </Box>
      </MUICardContent>
    </MUICard>
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state while data is being fetched (but still allow modals to show)
  const showLoading = state.loading && !showCreateDialog && !editModalOpen
  if (showLoading) {
    return (
      <Box sx={{ 
        maxWidth: 1400, 
        mx: 'auto', 
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <Typography sx={{ fontSize: '1.2rem', color: '#666' }}>
          Loading sessions...
        </Typography>
      </Box>
    )
  }

  // Show error state if there's an error
  if (state.error) {
    return (
      <Box sx={{ 
        maxWidth: 1400, 
        mx: 'auto', 
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <Typography sx={{ fontSize: '1.2rem', color: 'red' }}>
          Error loading sessions: {state.error}
        </Typography>
      </Box>
    )
  }

  return (
          <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'transparent'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
                  <Box sx={{ 
                    display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4 
        }}>
          <Box>
                          <Typography
              variant="h4" 
                            sx={{ 
                              fontFamily: 'Poppins, sans-serif', 
                              fontWeight: 700, 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
                            }}
                          >
              <CalendarDaysIcon style={{ width: 32, height: 32 }} />
              Session Management
                          </Typography>
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              Create, manage, and monitor your class sessions
                          </Typography>
                          </Box>
                            <MUIButton 
                              variant="contained" 
            startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowCreateDialog(true)
            }}
                              sx={BUTTON_STYLES.primary}
                >
                  Create Session
                </MUIButton>
              </Box>

        {/* Stats Grid */}
      <Box sx={{
        display: 'grid',
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: 3, 
          mb: 4 
      }}>
        <StatCard
          title="Total Sessions"
            value={stats.totalSessions.toString()}
          icon={CalendarDaysIcon}
            color="hsl(var(--muted-foreground))"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Sessions"
            value={stats.activeSessions.toString()}
            icon={PlayIcon}
            color="hsl(var(--muted-foreground))"
            trend={{ value: 25, isPositive: true }}
        />
        <StatCard
          title="Scheduled"
            value={stats.scheduledSessions.toString()}
          icon={ClockIcon}
          color="hsl(var(--muted-foreground))"
            trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Completed"
            value={stats.completedSessions.toString()}
          icon={CheckCircleIcon}
          color="hsl(var(--muted-foreground))"
            trend={{ value: 15, isPositive: true }}
        />
      </Box>

        {/* Filters */}
        <MUICard sx={{ ...CARD_SX, mb: 4 }}>
          <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
              mb: 3
            }}>
              {/* Search */}
              <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField
                  fullWidth
              placeholder="Search sessions..."
              value={searchQuery}
                  onChange={handleSearchChange}
                  sx={INPUT_STYLES}
              InputProps={{
                    startAdornment: <MagnifyingGlassIcon style={{ width: 20, height: 20, marginRight: 8, color: 'hsl(var(--muted-foreground))' }} />,
                    endAdornment: searchQuery && (
                      <IconButton onClick={handleClearSearch} size="small">
                        <XMarkIcon style={{ width: 16, height: 16 }} />
                      </IconButton>
                    )
                  }}
                />
              </Box>

              {/* Status Filter */}
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={INPUT_STYLES}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

              {/* Type Filter */}
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={INPUT_STYLES}
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
            <Box sx={{ borderBottom: '1px solid hsl(var(--border))' }}>
            <Tabs 
              value={viewMode} 
                onChange={handleTabChange}
                sx={{ 
                  '& .MuiTab-root': {
                    textTransform: 'none',
                  fontWeight: 600,
                    color: 'hsl(var(--muted-foreground))',
                    '&.Mui-selected': {
                      color: 'hsl(var(--foreground))'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'hsl(var(--foreground))'
                  }
                }}
              >
                <Tab label="Grid View" value="grid" />
                <Tab label="List View" value="list" />
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
          {filteredSessions.length === 0 ? (
            <MUICard sx={CARD_SX}>
              <MUICardContent sx={{ 
                p: 6, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <CalendarDaysIcon style={{ width: 64, height: 64, color: 'hsl(var(--muted-foreground))' }} />
                <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all" 
                    ? 'No sessions found' 
                    : 'No sessions yet'
                  }
                </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? 'Try adjusting your search terms or filters'
                    : 'Create your first session to get started'
                  }
                </Typography>
                {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                  <MUIButton
                    variant="contained"
                    startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
                    onClick={() => setShowCreateDialog(true)}
                    sx={BUTTON_STYLES.primary}
                  >
                    Create Session
                  </MUIButton>
                )}
              </MUICardContent>
            </MUICard>
          ) : viewMode === 'grid' ? (
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
                <SessionCard key={session.id} session={session} />
            ))}
          </Box>
          ) : (
            <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { borderColor: '#000' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Session</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Attendance</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow 
                    key={session.id}
                    sx={{
                          '&:hover': { bgcolor: 'hsl(var(--muted) / 0.3)' },
                          '& td': { borderColor: '#000' }
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {session.title}
                      </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {SESSION_TYPES.find(t => t.value === session.type)?.label} • {session.location}
                      </Typography>
                      </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.courseCode}
                        </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {session.courseName}
                        </Typography>
                      </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatDate(session.date)}
                        </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {session.startTime} - {session.endTime}
                        </Typography>
                      </Box>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const displayStatus = mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') as 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
                            return (
                              <Chip 
                                label={displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                                size="small"
                                sx={{ 
                                  bgcolor: getStatusColor(displayStatus),
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )
                          })()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {session.enrolled}/{session.capacity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                          size="small"
                          onClick={() => handleViewSession(session)}
                              sx={{ color: 'hsl(var(--muted-foreground))' }}
                            >
                              <EyeIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                            <IconButton 
                          size="small"
                          onClick={() => handleEditSession(session)}
                              sx={{ color: 'hsl(var(--muted-foreground))' }}
                            >
                              <PencilIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                            {(mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === 'active' || mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === 'scheduled') && (
                              <IconButton 
                            size="small"
                                onClick={() => handleShowQR(session)}
                                sx={{ color: 'hsl(var(--muted-foreground))' }}
                              >
                                <QrCodeIcon style={{ width: 16, height: 16 }} />
                              </IconButton>
                            )}
                            {mapSessionStatus(toSharedSessionStatus(session.status), 'lecturer') === 'scheduled' && (
                              <IconButton 
                          size="small"
                            onClick={() => handleStartSession(session)}
                                sx={{ color: 'hsl(var(--muted-foreground))' }}
                              >
                                <PlayIcon style={{ width: 16, height: 16 }} />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteSession(session.id)}
                              sx={{ color: 'hsl(var(--muted-foreground))' }}
                            >
                              <TrashIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                      </Box>
                        </TableCell>
                      </TableRow>
                ))}
                  </TableBody>
                </Table>
            </MUICardContent>
          </MUICard>
        )}
      </motion.div>

      {/* Create Session Modal */}
      <CreateSessionModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        lecturerId="d541b573-003d-469c-bef0-fa392dcdbdbd" // Using a more realistic user ID - replace with actual auth
        onSessionCreated={(sessionId) => {
            setShowCreateDialog(false)
            fetchAttendanceSessions()
            // Don't redirect - we're already on the sessions page
            // Just refresh the data to show the new session
          }}
        />

        {/* QR Code Dialog */}
        <SessionQrCodeDialog
          isOpen={showQRDialog}
          onOpenChange={setShowQRDialog}
          session={selectedSession ? {
            id: selectedSession.id,
            course_name: selectedSession.courseName,
            session_name: selectedSession.title,
            session_date: selectedSession.date,
            start_time: selectedSession.startTime,
            end_time: selectedSession.endTime
          } : null}
        />
        
        {/* Edit Session Modal */}
        <CreateSessionModal 
          open={editModalOpen}
          onOpenChange={handleEditModalClose}
          lecturerId="d541b573-003d-469c-bef0-fa392dcdbdbd" // Using a more realistic user ID - replace with actual auth
          onSessionCreated={() => {}} // Not used in edit mode
          editSession={editingSession}
          onSessionUpdated={() => {
            // Modal handles its own refresh logic
            handleEditModalClose()
            fetchAttendanceSessions()
          }}
        />
      </motion.div>
    </Box>
  )
}
