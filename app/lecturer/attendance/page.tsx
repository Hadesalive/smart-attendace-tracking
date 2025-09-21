"use client"

import React, { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDaysIcon, PlusIcon, ClockIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import StatCard from "@/components/dashboard/stat-card"
import { Box, Card as MUICard, CardContent as MUICardContent, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button as MUIButton, Chip } from "@mui/material"
import SessionQrCodeDialog from "@/components/attendance/session-qr-code-dialog-new"
import CreateSessionModal from "@/components/attendance/session-creation-modal-new"
import { exportRowsToCsv } from "@/lib/utils"
import { useAttendance, useCourses, useAcademicStructure, useAuth } from "@/lib/domains"
import { AttendanceSession, AttendanceRecord, Course, Class } from "@/lib/types/shared"
import { mapSessionStatus } from "@/lib/utils/statusMapping"
import { toast } from "sonner"

// ============================================================================
// TYPES
// ============================================================================

// Using shared types from DataContext
type SessionStatus = "active" | "scheduled" | "completed"
type AttendanceStatus = "scheduled" | "completed"

// ============================================================================
// CONSTANTS
// ============================================================================

const BUTTON_STYLES = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { bgcolor: '#111' }
  }
} as const

const TIMETABLE_ROTATION_INTERVAL = 6000 // 6 seconds
const AVERAGE_ATTENDANCE_7D = 89.2
const TODAY_DATE = new Date().toISOString().split('T')[0]

// ============================================================================
// HELPERS
// ============================================================================

/** Apply all filters to the dataset */
const filterAttendance = (
  data: any[],
  course: string,
  clazz: string,
  date: string,
  start: string,
  end: string
) => {
  return data.filter(r => {
    const byCourse = course === 'all' || r.courseCode === course
    const byClass = clazz === 'all' || r.className === clazz
    const byDate = !date || r.date === date
    const byStart = !start || r.startTime >= start
    const byEnd = !end || r.endTime <= end
    return byCourse && byClass && byDate && byStart && byEnd
  })
}

export default function LecturerAttendancePage() {
  const attendance = useAttendance()
  const courses = useCourses()
  const academic = useAcademicStructure()
  const auth = useAuth()
  
  // Extract state and methods
  const { 
    state: attendanceState,
    getAttendanceSessionsByCourse,
    getAttendanceRecordsBySession,
    createAttendanceSession,
    markAttendance,
    fetchAttendanceSessions,
    fetchAttendanceRecords,
    deleteAttendanceSessionSupabase,
    updateAttendanceSessionSupabase
  } = attendance
  
  const { 
    state: coursesState,
    getCoursesByLecturer,
    fetchCourses
  } = courses
  
  const { state: academicState } = academic
  const { state: authState } = auth
  
  // Create legacy state object for compatibility
  const state = {
    ...attendanceState,
    ...coursesState,
    ...academicState,
    currentUser: authState.currentUser
  }

  // Load data on component mount
  useEffect(() => {
    fetchCourses()
    fetchAttendanceSessions()
    fetchAttendanceRecords()
  }, [fetchCourses, fetchAttendanceSessions, fetchAttendanceRecords])

  // ==========================================================================
  // COMPUTED DATA
  // ==========================================================================
  
  // Use all sessions from shared state (no hardcoded lecturer dependency)
  const sessions = useMemo(() => state.attendanceSessions, [state.attendanceSessions])

  // Legacy mock data removed - using real data from DataContext

  const sessionsToday = useMemo(() => sessions.filter(s => s.session_date === TODAY_DATE), [sessions, TODAY_DATE])

  // Build a prioritized list for timetable rotation: active first, then scheduled
  const timetable = useMemo(() => {
    const active = sessionsToday.filter(s => mapSessionStatus(s.status, 'lecturer') === 'active')
    const scheduled = sessionsToday.filter(s => mapSessionStatus(s.status, 'lecturer') === 'scheduled')
    return [...active, ...scheduled]
  }, [sessionsToday])

  // Rotate timetable every 6 seconds
  const [currentIdx, setCurrentIdx] = useState(0)
  useEffect(() => {
    if (timetable.length === 0) return
    const id = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % timetable.length)
    }, TIMETABLE_ROTATION_INTERVAL)
    return () => clearInterval(id)
  }, [timetable.length])

  const currentItem = timetable[currentIdx]

  const activeCount = useMemo(() => sessionsToday.filter(s => mapSessionStatus(s.status, 'lecturer') === 'active').length, [sessionsToday])

  // Compute attendance records from shared data
  const attendanceRecords = useMemo(() => {
    console.log('Computing attendance records from sessions:', sessions)
    return sessions.map(session => {
      const records = getAttendanceRecordsBySession(session.id)
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length
      const totalCount = records.length
      
      const record = {
        id: session.id,
        courseCode: session.course_code,
        courseName: session.course_name,
        className: session.class_name,
        sessionName: session.session_name,
        date: session.session_date,
        startTime: session.start_time,
        endTime: session.end_time,
        present: presentCount,
        total: totalCount,
        status: mapSessionStatus(session.status, 'lecturer')
      }
      console.log('Created attendance record:', record)
      return record
    })
  }, [sessions, getAttendanceRecordsBySession])

  // Filters
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [startTimeFilter, setStartTimeFilter] = useState<string>("")
  const [endTimeFilter, setEndTimeFilter] = useState<string>("")

  // ==========================================================================
  // DERIVED VALUES
  // ==========================================================================

  const courseOptions = useMemo(() => {
    const codes = Array.from(new Set(attendanceRecords.map(r => r.courseCode)))
    return codes
  }, [attendanceRecords])

  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(attendanceRecords.map(r => r.className)))
    return classes
  }, [attendanceRecords])

  const filteredAttendance = useMemo(
    () => filterAttendance(attendanceRecords, courseFilter, classFilter, dateFilter, startTimeFilter, endTimeFilter),
    [attendanceRecords, courseFilter, classFilter, dateFilter, startTimeFilter, endTimeFilter]
  )

  // QR Dialog state
  const [qrOpen, setQrOpen] = useState(false)
  const [qrSession, setQrSession] = useState<{ id: string; course_name: string; session_name: string; session_date: string; start_time: string; end_time: string } | null>(null)
  
  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null)
  
  const openQrFor = (record: any) => {
    setQrSession({ 
      id: record.id, 
      course_name: record.courseName, 
      session_name: record.sessionName || 'Session',
      session_date: record.date || new Date().toISOString().split('T')[0],
      start_time: record.startTime || '00:00',
      end_time: record.endTime || '00:00'
    })
    setQrOpen(true) // Always show QR code for teachers to display
  }

  const openEditModal = (record: any) => {
    console.log('Opening edit modal for record:', record)
    // Find the full session data from the sessions array
    const fullSession = state.attendanceSessions.find(s => s.id === record.id)
    if (fullSession) {
      console.log('Found full session data:', fullSession)
      setEditingSession(fullSession)
      setEditModalOpen(true)
    } else {
      console.error('Session not found for editing:', record.id)
      toast.error('Session not found for editing')
    }
  }

  const handleEditModalClose = () => {
    setEditModalOpen(false)
    setEditingSession(null)
  }

  const handleSessionUpdated = async (sessionId?: string) => {
    console.log('Session updated, refreshing data...')
    await fetchAttendanceSessions()
    handleEditModalClose()
  }

  // Handler for creating new attendance session
  const handleStartSession = (courseId: string, className: string) => {
    const course = state.courses.find((c: any) => c.id === courseId)
    if (!course) return

    createAttendanceSession({
      course_id: courseId,
      course_code: course.course_code,
      course_name: course.course_name,
      class_id: "Bsem", // Default class for now
      class_name: className,
      session_name: `Session ${new Date().toLocaleDateString()}`,
      session_date: new Date().toISOString().split('T')[0],
      start_time: new Date().toTimeString().slice(0, 5),
      end_time: new Date(Date.now() + 90 * 60 * 1000).toTimeString().slice(0, 5), // 90 minutes later
      location: "Room TBD",
      is_active: true,
      attendance_method: "qr_code",
      status: "active"
    })
  }

  // Handler for deleting attendance session
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

  // Handler for updating attendance session
  const handleUpdateSession = async (sessionId: string, updates: Partial<AttendanceSession>) => {
    console.log('Update button clicked for session:', sessionId, 'with updates:', updates)
    
    // Show loading toast
    const loadingToast = toast.loading('Updating session...')
    
    try {
      // Check if session exists
      const session = state.attendanceSessions.find(s => s.id === sessionId)
      if (!session) {
        throw new Error('Session not found')
      }
      
      console.log('Session found:', session)
      console.log('Updating with:', updates)
      
      // Update the session
      await updateAttendanceSessionSupabase(sessionId, updates)
      console.log('Session updated successfully in database')
      
      // Refresh the sessions list
      console.log('Refreshing sessions list...')
      await fetchAttendanceSessions()
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`Session "${session.session_name}" updated successfully!`)
      
    } catch (error: any) {
      console.error('Error updating session:', error)
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error(`Failed to update session: ${error.message || 'Unknown error'}`)
    }
  }

  // Removed Saved Views feature for now

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Course','Class','Date','Start','End','Present','Total','Status']
    const rows = filteredAttendance.map(r => [r.courseCode, r.className, r.date, r.startTime, r.endTime, r.present, r.total, r.status])
    exportRowsToCsv(headers, rows, `attendance-${dateFilter || 'all'}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track and manage student attendance across all sessions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm min-h-[44px] touch-manipulation">
            <CalendarDaysIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Calendar View</span>
            <span className="xs:hidden">Calendar</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-black text-white text-sm min-h-[44px] touch-manipulation">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Create Session</span>
            <span className="xs:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* KPI Grid using the same StatCard UI as the dashboard */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 3 }
      }}>
        {/* Rotating timetable card */}
        <StatCard
          title={currentItem ? (mapSessionStatus(currentItem.status, 'lecturer') === 'active' ? 'Now' : 'Next') : 'Timetable'}
          value={currentItem ? `${currentItem.course_code}` : 'No sessions'}
          subtitle={currentItem ? `${currentItem.session_name}` : 'You are free at this time'}
          icon={CalendarDaysIcon}
          color="#000000"
          change={currentItem ? `${currentItem.start_time} - ${currentItem.end_time}` : ''}
        />

        {/* Today's sessions count */}
        <StatCard
          title="Today's Sessions"
          value={sessionsToday.length}
          subtitle="Scheduled today"
          icon={ClockIcon}
          color="#000000"
          change={sessionsToday.length > 0 ? `${activeCount} active now` : 'No sessions today'}
        />

        {/* Active sessions */}
        <StatCard
          title="Active Sessions"
          value={activeCount}
          subtitle="Currently running"
          icon={UsersIcon}
          color="#000000"
          change={activeCount > 0 ? 'Taking attendance' : 'Idle'}
        />

        {/* Average attendance */}
        <StatCard
          title="Avg Attendance"
          value={`${AVERAGE_ATTENDANCE_7D}%`}
          subtitle="Last 7 days"
          icon={CheckCircleIcon}
          color="#999999"
          change={AVERAGE_ATTENDANCE_7D >= 85 ? 'Healthy engagement' : 'Needs attention'}
        />
      </Box>

      {/* Attendance with filters (MUI styling to match dashboard) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <MUICard
          sx={{
            bgcolor: 'card',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }
          }}
        >
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'card-foreground',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Attendance
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <MUIButton size="small" variant="contained" onClick={handleExportCSV} sx={BUTTON_STYLES.primary}>
                Export CSV
              </MUIButton>
            </Box>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 2, sm: 2.5, md: 3 }
          }}>
            <FormControl size="small">
              <InputLabel id="course-filter-label">Course</InputLabel>
              <Select
                labelId="course-filter-label"
                label="Course"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value as string)}
                aria-label="Filter by course"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'border' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                  '& .MuiSelect-outlined.Mui-focused': { color: '#000' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
                }}
              >
                <MenuItem value="all">All Courses</MenuItem>
                {courseOptions.map(code => (
                  <MenuItem key={code} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel id="class-filter-label">Class</InputLabel>
              <Select
                labelId="class-filter-label"
                label="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value as string)}
                aria-label="Filter by class type"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'border' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                  '& .MuiSelect-outlined.Mui-focused': { color: '#000' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
                }}
              >
                <MenuItem value="all">All Classes</MenuItem>
                {classOptions.map(cls => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              size="small" 
              type="date" 
              label="Date" 
              InputLabelProps={{ shrink: true }} 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter by date"
              sx={{
                '& label.Mui-focused': { color: '#000' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'border' },
                  '&:hover fieldset': { borderColor: '#000' },
                  '&.Mui-focused fieldset': { borderColor: '#000' }
                }
              }} 
            />
            <TextField 
              size="small" 
              type="time" 
              label="Start" 
              InputLabelProps={{ shrink: true }} 
              value={startTimeFilter} 
              onChange={(e) => setStartTimeFilter(e.target.value)}
              aria-label="Filter by start time"
              sx={{
                '& label.Mui-focused': { color: '#000' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'border' },
                  '&:hover fieldset': { borderColor: '#000' },
                  '&.Mui-focused fieldset': { borderColor: '#000' }
                }
              }} 
            />
            <TextField 
              size="small" 
              type="time" 
              label="End" 
              InputLabelProps={{ shrink: true }} 
              value={endTimeFilter} 
              onChange={(e) => setEndTimeFilter(e.target.value)}
              aria-label="Filter by end time"
              sx={{
                '& label.Mui-focused': { color: '#000' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'border' },
                  '&:hover fieldset': { borderColor: '#000' },
                  '&.Mui-focused fieldset': { borderColor: '#000' }
                }
              }} 
            />
          </Box>

          {/* Desktop Table View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer sx={{ 
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 4 },
              '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
            }}>
              <Table aria-label="Attendance records table" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Course</TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Class</TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Time</TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Attendance</TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      py: 1.5
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendance.map((r) => (
                    <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.875rem',
                        py: 1.5
                      }}>{r.courseCode}</TableCell>
                      <TableCell sx={{ 
                        fontSize: '0.875rem',
                        py: 1.5
                      }}>{r.className}</TableCell>
                      <TableCell sx={{ 
                        fontSize: '0.875rem',
                        py: 1.5
                      }}>{r.date}</TableCell>
                      <TableCell sx={{ 
                        fontSize: '0.875rem',
                        py: 1.5
                      }}>{r.startTime} - {r.endTime}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          fontSize: '0.875rem'
                        }}>
                          <span style={{ fontWeight: 600 }}>{r.present}</span>
                          <span style={{ color: 'var(--muted-foreground)' }}>/ {r.total}</span>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        textTransform: 'capitalize',
                        fontSize: '0.875rem',
                        py: 1.5
                      }}>{r.status}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <MUIButton 
                            size="small" 
                            variant="contained" 
                            onClick={() => openQrFor(r)} 
                            aria-label={`Display QR code for ${r.courseCode} ${r.className}`}
                            sx={{
                              ...BUTTON_STYLES.primary,
                              fontSize: '0.875rem',
                              px: 2,
                              py: 1,
                              touchAction: 'manipulation'
                            }}
                          >
                            Display QR
                          </MUIButton>
                          <MUIButton 
                            size="small" 
                            variant="outlined" 
                            onClick={() => {
                              console.log('Edit button clicked for record:', r)
                              openEditModal(r)
                            }}
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderColor: '#666',
                              color: '#666',
                              '&:hover': { borderColor: '#000', color: '#000' }
                            }}
                          >
                            Edit
                          </MUIButton>
                          <MUIButton 
                            size="small" 
                            variant="outlined" 
                            onClick={() => {
                              console.log('Delete button clicked for record:', r)
                              handleDeleteSession(r.id)
                            }}
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              '&:hover': { borderColor: '#dc2626', color: '#dc2626' }
                            }}
                          >
                            Delete
                          </MUIButton>
                          <a 
                            className="underline" 
                            href={`/lecturer/attendance/${r.id}`}
                            aria-label={`View detailed attendance for ${r.courseCode} ${r.className}`}
                            style={{ 
                              color: '#000',
                              fontSize: '0.875rem',
                              textDecoration: 'underline',
                              touchAction: 'manipulation',
                              minHeight: '44px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            View Details
                          </a>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredAttendance.map((r) => (
                <MUICard 
                  key={r.id}
                  sx={{ 
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'border',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <MUICardContent sx={{ p: 2 }}>
                    {/* Header with Course and Status */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#000',
                            mb: 0.5
                          }}
                        >
                          {r.courseCode}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#666',
                            fontSize: '0.875rem'
                          }}
                        >
                          {r.courseName}
                        </Typography>
                      </Box>
                      <Chip 
                        label={r.status} 
                        size="small" 
                        sx={{ 
                          textTransform: 'capitalize',
                          bgcolor: r.status === 'completed' ? '#4caf50' : r.status === 'scheduled' ? '#ff9800' : '#2196f3',
                          color: 'white',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }} 
                      />
                    </Box>

                    {/* Details Grid */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: 2, 
                      mb: 2 
                    }}>
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
                          Class Type
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#333',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {r.className}
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
                          Date
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#333',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {r.date}
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
                          Time
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#333',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {r.startTime} - {r.endTime}
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
                          Attendance
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#333',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                        >
                          {r.present} / {r.total}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexDirection: 'column'
                    }}>
                      <MUIButton 
                        variant="contained" 
                        onClick={() => openQrFor(r)} 
                        aria-label={`Display QR code for ${r.courseCode} ${r.className}`}
                        sx={{
                          ...BUTTON_STYLES.primary,
                          fontSize: '0.875rem',
                          py: 1.5,
                          touchAction: 'manipulation',
                          width: '100%'
                        }}
                      >
                        Display QR Code
                      </MUIButton>
                      <MUIButton 
                        variant="outlined" 
                        onClick={() => {
                          console.log('Mobile Edit button clicked for record:', r)
                          openEditModal(r)
                        }}
                        sx={{
                          borderColor: '#666',
                          color: '#666',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          py: 1.5,
                          touchAction: 'manipulation',
                          width: '100%',
                          '&:hover': {
                            borderColor: '#000',
                            color: '#000',
                            bgcolor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                      >
                        Edit Session
                      </MUIButton>
                      <MUIButton 
                        variant="outlined" 
                        onClick={() => {
                          console.log('Mobile Delete button clicked for record:', r)
                          handleDeleteSession(r.id)
                        }}
                        sx={{
                          borderColor: '#ef4444',
                          color: '#ef4444',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          py: 1.5,
                          touchAction: 'manipulation',
                          width: '100%',
                          '&:hover': {
                            borderColor: '#dc2626',
                            color: '#dc2626',
                            bgcolor: 'rgba(239, 68, 68, 0.04)'
                          }
                        }}
                      >
                        Delete Session
                      </MUIButton>
                      <MUIButton 
                        variant="outlined" 
                        href={`/lecturer/attendance/${r.id}`}
                        component="a"
                        aria-label={`View detailed attendance for ${r.courseCode} ${r.className}`}
                        sx={{
                          borderColor: '#000',
                          color: '#000',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          py: 1.5,
                          touchAction: 'manipulation',
                          width: '100%',
                          '&:hover': {
                            borderColor: '#000',
                            bgcolor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                      >
                        View Details
                      </MUIButton>
                    </Box>
                  </MUICardContent>
                </MUICard>
              ))}
            </Box>
          </Box>
          </MUICardContent>
        </MUICard>
      </motion.div>

      {/* QR Dialog - Teachers show QR codes */}
      <SessionQrCodeDialog isOpen={qrOpen} onOpenChange={setQrOpen} session={qrSession} />
      
      {/* Edit Session Modal */}
      <CreateSessionModal 
        open={editModalOpen}
        onOpenChange={handleEditModalClose}
        lecturerId={state.currentUser?.id || ''}
        onSessionCreated={() => {}} // Not used in edit mode
        editSession={editingSession}
        onSessionUpdated={handleSessionUpdated}
      />
    </div>
  )
}
