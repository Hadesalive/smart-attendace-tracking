"use client"

import React, { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import { Box, Card as MUICard, CardContent as MUICardContent, Typography, Chip, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Checkbox, Button as MUIButton } from "@mui/material"
import { formatSeconds, exportRowsToCsv } from "@/lib/utils"
import { useAttendance, useCourses } from "@/lib/domains"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const BUTTON = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { bgcolor: '#111' }
  },
  outline: {
    color: '#000',
    borderColor: '#000',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { borderColor: '#000' }
  }
} as const

// ============================================================================
// HELPERS
// ============================================================================

// ============================================================================
// SUB-COMPONENTS (UI-only; stateless where possible)
// ============================================================================

type LiveStatus = 'scheduled' | 'active' | 'closed'

function LiveControls({
  liveStatus,
  locked,
  timeRemainingSec,
  onStart,
  onLock,
  onExtend,
  onClose,
  onShowQr
}: {
  liveStatus: 'scheduled' | 'active' | 'closed'
  locked: boolean
  timeRemainingSec: number
  onStart: () => void
  onLock: () => void
  onExtend: (m: number) => void
  onClose: () => void
  onShowQr: () => void
}) {
  return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap', mb: { xs: 2, sm: 2.5 } }}>
      {liveStatus === 'scheduled' && (
        <MUIButton 
          size="small" 
          variant="contained" 
          onClick={onStart} 
          sx={{
            ...BUTTON.primary,
            minHeight: { xs: 44, sm: 32 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 1 },
            touchAction: 'manipulation'
          }}
        >
          <span className="hidden xs:inline">Start Session</span>
          <span className="xs:hidden">Start</span>
        </MUIButton>
      )}
      {liveStatus === 'active' && (
        <>
          <MUIButton 
            size="small" 
            variant="outlined" 
            onClick={onLock} 
            sx={{
              ...BUTTON.outline,
              minHeight: { xs: 44, sm: 32 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1 },
              touchAction: 'manipulation'
            }}
          >
            <span className="hidden xs:inline">{locked ? 'Unlock Submissions' : 'Lock Submissions'}</span>
            <span className="xs:hidden">{locked ? 'Unlock' : 'Lock'}</span>
          </MUIButton>
          <MUIButton 
            size="small" 
            variant="outlined" 
            onClick={() => onExtend(10)} 
            sx={{
              ...BUTTON.outline,
              minHeight: { xs: 44, sm: 32 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1 },
              touchAction: 'manipulation'
            }}
          >
            <span className="hidden xs:inline">Extend +10m</span>
            <span className="xs:hidden">+10m</span>
          </MUIButton>
          <MUIButton 
            size="small" 
            variant="contained" 
            onClick={onClose} 
            sx={{
              ...BUTTON.primary,
              minHeight: { xs: 44, sm: 32 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1 },
              touchAction: 'manipulation'
            }}
          >
            <span className="hidden xs:inline">Close Session</span>
            <span className="xs:hidden">Close</span>
          </MUIButton>
          <Typography 
            variant="body2" 
            sx={{ 
              ml: { xs: 0, sm: 1 }, 
              mt: { xs: 1, sm: 0 },
              fontFamily: 'DM Sans, sans-serif',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Time left: {formatSeconds(timeRemainingSec)}
          </Typography>
        </>
      )}
      {liveStatus === 'closed' && (
        <Chip 
          label="Session Closed" 
          size="small" 
          sx={{ 
            bgcolor: '#E5E5E5', 
            color: '#000', 
            fontWeight: 700,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            height: { xs: 44, sm: 32 }
          }} 
        />
      )}
      {liveStatus !== 'closed' && (
        <MUIButton 
          size="small" 
          variant="contained" 
          onClick={onShowQr} 
          sx={{
            ...BUTTON.primary,
            minHeight: { xs: 44, sm: 32 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 1 },
            touchAction: 'manipulation'
          }}
        >
          <span className="hidden xs:inline">Display QR</span>
          <span className="xs:hidden">QR</span>
        </MUIButton>
      )}
    </Box>
  )
}

function BulkActionsBar({
  query,
  setQuery,
  onMarkPresent,
  onMarkLate,
  onMarkAbsent,
  onExport
}: {
  query: string
  setQuery: (v: string) => void
  onMarkPresent: () => void
  onMarkLate: () => void
  onMarkAbsent: () => void
  onExport: () => void
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: { xs: 2, sm: 2.5 } }}>
      <TextField size="small" fullWidth placeholder="Search by name or matric" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ maxWidth: 360, '& label.Mui-focused': { color: '#000' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'border' }, '&:hover fieldset': { borderColor: '#000' }, '&.Mui-focused fieldset': { borderColor: '#000' } } }} />
      <MUIButton size="small" variant="outlined" onClick={onMarkPresent} sx={BUTTON.outline}>Mark Present</MUIButton>
      <MUIButton size="small" variant="outlined" onClick={onMarkLate} sx={BUTTON.outline}>Mark Late</MUIButton>
      <MUIButton size="small" variant="outlined" onClick={onMarkAbsent} sx={BUTTON.outline}>Mark Absent</MUIButton>
      <MUIButton size="small" variant="contained" onClick={onExport} sx={BUTTON.primary}>Export CSV</MUIButton>
    </Box>
  )
}

function AttendanceTable({
  rows,
  selected,
  allSelected,
  toggleAll,
  toggleOne,
  renderStatus
}: {
  rows: StudentAttendance[]
  selected: Set<string>
  allSelected: boolean
  toggleAll: (checked: boolean) => void
  toggleOne: (id: string, checked: boolean) => void
  renderStatus: (status: StudentAttendance['status']) => React.ReactNode
}) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onChange={(e) => toggleAll(e.target.checked)}
              />
            </TableCell>
            <TableCell>Student</TableCell>
            <TableCell>Matric</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Check-in</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.has(s.id)}
                  onChange={(e) => toggleOne(s.id, e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>{s.name}</TableCell>
              <TableCell>{s.matric}</TableCell>
              <TableCell>{renderStatus(s.status)}</TableCell>
              <TableCell>{s.checkInTime ? s.checkInTime : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

interface SessionSummaryProps {
  totalCount: number
  presentCount: number
  onTimeCount: number
  lateCount: number
  absentCount: number
  session: {
    id: string
    courseCode: string
    courseName: string
    className: string
    date: string
    startTime: string
    endTime: string
    location: string
    status: LiveStatus
  }
  liveStatus: LiveStatus
  attendanceRate: number
  onTimeRate: number
  lateRate: number
  absentRate: number
  onExport: () => void
}

function SessionSummary({
  totalCount,
  presentCount,
  onTimeCount,
  lateCount,
  absentCount,
  session,
  liveStatus,
  attendanceRate,
  onTimeRate,
  lateRate,
  absentRate,
  onExport
}: SessionSummaryProps) {
  return (
    <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 3, mt: 2 }}>
      <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'card-foreground', fontFamily: 'Poppins, sans-serif' }}>Session Summary</Typography>
          <MUIButton size="small" variant="outlined" onClick={onExport} sx={BUTTON.outline}>Export CSV</MUIButton>
        </Box>

        {/* Content grid - refined columns and spacing */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '6fr auto 5fr' },
          columnGap: { xs: 2, lg: 2 },
          rowGap: { xs: 2, lg: 0 }
        }}>
          {/* Overview list */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1, columnGap: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Total Students: <strong>{totalCount}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Present: <strong>{presentCount}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>On‑Time: <strong>{onTimeCount}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Late: <strong>{lateCount}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Absent: <strong>{absentCount}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Window: <strong>{session.startTime} – {session.endTime}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Location: <strong>{session.location}</strong></Typography>
            <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize' }}>Final Status: <strong>{liveStatus}</strong></Typography>
          </Box>

          {/* Divider (responsive) */}
          <Box sx={{ display: { xs: 'none', lg: 'block' }, borderLeft: '1px solid', borderColor: 'border' }} />

          {/* Rates panel */}
          <Box sx={{ display: 'grid', gridTemplateRows: 'auto auto auto auto', rowGap: 1.25, pl: { lg: 1 } }}>
            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Attendance Rate</Typography>
              <Box sx={{ position: 'relative', height: 10, bgcolor: 'secondary', borderRadius: 999, overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${attendanceRate}%`, bgcolor: '#000', borderRadius: 999 }} />
              </Box>
              <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif' }}>{attendanceRate}%</Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>On‑Time</Typography>
              <Box sx={{ position: 'relative', height: 8, bgcolor: 'secondary', borderRadius: 999, overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${onTimeRate}%`, bgcolor: '#111', borderRadius: 999 }} />
              </Box>
              <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif' }}>{onTimeRate}%</Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Late</Typography>
              <Box sx={{ position: 'relative', height: 8, bgcolor: 'secondary', borderRadius: 999, overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${lateRate}%`, bgcolor: '#4B5563', borderRadius: 999 }} />
              </Box>
              <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif' }}>{lateRate}%</Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>Absent</Typography>
              <Box sx={{ position: 'relative', height: 8, bgcolor: 'secondary', borderRadius: 999, overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${absentRate}%`, bgcolor: '#9CA3AF', borderRadius: 999 }} />
              </Box>
              <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif' }}>{absentRate}%</Typography>
            </Box>
          </Box>
        </Box>
      </MUICardContent>
    </MUICard>
  )
}

interface StudentAttendance {
  id: string
  name: string
  matric: string
  status: "present" | "absent" | "late"
  checkInTime?: string
}

export default function LecturerSessionAttendancePage() {
  const params = useParams()
  const sessionId = params?.id as string
  const attendance = useAttendance()
  const courses = useCourses()
  
  // Extract state and methods
  const { 
    state: attendanceState,
    fetchAttendanceRecords, 
    fetchAttendanceSessions, 
    updateAttendanceSessionSupabase 
  } = attendance
  
  const { state: coursesState } = courses
  
  // Create legacy state object for compatibility
  // Direct state access - NO STATE MERGING

  // Ensure data is available
  useEffect(() => {
    if (!attendanceState.attendanceSessions.length) fetchAttendanceSessions()
    if (!attendanceState.attendanceRecords.length) fetchAttendanceRecords()
  }, [attendanceState.attendanceSessions.length, attendanceState.attendanceRecords.length, fetchAttendanceSessions, fetchAttendanceRecords])

  // Read session details from shared state
  const session = useMemo(() => {
    const s = attendanceState.attendanceSessions.find((ss: any) => ss.id === sessionId)
    if (!s) return null
    return {
      id: s.id,
      courseCode: s.course_code,
      courseName: s.course_name,
      className: s.class_name || "Lecture",
      date: s.session_date,
      startTime: s.start_time,
      endTime: s.end_time,
      location: s.location || "",
      status: (s.status === 'active' ? 'active' : s.status === 'completed' ? 'closed' : 'scheduled') as LiveStatus,
      qr_code: s.qr_code as string | undefined
    }
  }, [attendanceState.attendanceSessions, sessionId])

  // Build students list from attendance records for this session
  const [students, setStudents] = useState<StudentAttendance[]>([])
  useEffect(() => {
      const records = attendanceState.attendanceRecords.filter((r: any) => r.session_id === sessionId)
    if (records.length) {
      const mapped = records.map((r: any) => ({
        id: r.student_id,
        name: r.student_name || 'Student',
        matric: r.student_id,
        status: (r.status || 'present') as "present" | "late" | "absent",
        checkInTime: r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : undefined
      }))
      setStudents(mapped)
    } else {
      setStudents([])
    }
  }, [attendanceState.attendanceRecords, sessionId])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allSelected = selected.size > 0 && selected.size === students.length
  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(students.map(s => s.id)) : new Set())
  }
  const toggleOne = (id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) next.add(id); else next.delete(id)
      return next
    })
  }

  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(s => (
      s.name.toLowerCase().includes(q) ||
      s.matric.toLowerCase().includes(q)
    ))
  }, [students, query])

  // Clear selection when query changes to avoid hidden selected rows
  React.useEffect(() => {
    setSelected(new Set())
  }, [query])

  const presentCount = students.filter(s => s.status === 'present' || s.status === 'late').length
  const lateCount = students.filter(s => s.status === 'late').length
  const absentCount = students.filter(s => s.status === 'absent').length
  const totalCount = students.length
  const onTimeCount = students.filter(s => s.status === 'present').length
  const attendanceRate = totalCount ? Math.round((presentCount / totalCount) * 100) : 0
  const onTimeRate = totalCount ? Math.round((onTimeCount / totalCount) * 100) : 0
  const lateRate = totalCount ? Math.round((lateCount / totalCount) * 100) : 0
  const absentRate = totalCount ? Math.round((absentCount / totalCount) * 100) : 0

  const renderStatus = (status: StudentAttendance["status"]) => {
    if (status === 'present') return <Chip label="Present" size="small" sx={{ bgcolor: '#000', color: 'white', fontWeight: 700 }} />
    if (status === 'late') return <Chip label="Late" size="small" sx={{ bgcolor: '#E5E5E5', color: '#000', fontWeight: 700 }} />
    return <Chip label="Absent" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
  }

  const setStatusForSelected = (status: StudentAttendance["status"]) => {
    if (selected.size === 0) return
    setStudents(prev => prev.map(s => selected.has(s.id) ? { ...s, status } : s))
  }

  const exportCSV = () => {
    const headers = ['Student','Matric','Status','Check-in']
    const rows = students.map(s => [s.name, s.matric, s.status, s.checkInTime || ''])
    exportRowsToCsv(headers, rows, `session-${sessionId}-attendance.csv`)
  }

  // QR dialog state
  const [qrOpen, setQrOpen] = useState(false)
  const qrSession = useMemo(() => session ? ({ id: session.id, course_name: session.courseName, course_code: session.courseCode, qr_code: (session as any).qr_code }) : null, [session])

  // Live controls state
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(session?.status ?? 'scheduled')
  const [locked, setLocked] = useState(false)
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(() => 90 * 60)

  // Countdown when active
  React.useEffect(() => {
    if (liveStatus !== 'active') return
    const id = setInterval(() => setTimeRemainingSec(prev => Math.max(prev - 1, 0)), 1000)
    return () => clearInterval(id)
  }, [liveStatus])

  // Sync live status when session loads
  useEffect(() => {
    if (session) setLiveStatus(session.status)
  }, [session])

  const startSession = () => {
    setLiveStatus('active')
    setLocked(false)
    setQrOpen(true)
  }
  const lockSession = () => setLocked(prev => !prev)
  const extendSession = async (minutes: number) => {
    if (!session) return
    
    try {
      // Calculate new end time
      const currentEndTime = session.endTime
      const [hours, mins] = currentEndTime.split(':').map(Number)
      const currentEndMinutes = hours * 60 + mins
      const newEndMinutes = currentEndMinutes + minutes
      const newHours = Math.floor(newEndMinutes / 60)
      const newMins = newEndMinutes % 60
      const newEndTime = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
      
      // Update in database
      await updateAttendanceSessionSupabase(session.id, {
        end_time: newEndTime
      })
      
      // Update local state
      setTimeRemainingSec(prev => prev + minutes * 60)
      
      // Refresh sessions to get updated data
      await fetchAttendanceSessions()
    } catch (error) {
      console.error('Error extending session:', error)
    }
  }
  const closeSession = () => {
    setLiveStatus('closed')
    setLocked(true)
  }

  if (!session) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Session Attendance</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Session not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Session Attendance</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Full attendance list for the selected session</p>
      </div>

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
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'card-foreground', fontFamily: 'Poppins, sans-serif', mb: { xs: 1, sm: 1.5 } }}>
            {session.courseCode} • {session.className}
          </Typography>
          <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif', mb: { xs: 2, sm: 2.5, md: 3 } }}>
            {session.courseName} • {session.date} • {session.startTime} - {session.endTime} • {session.location}
          </Typography>

          {/* Live controls */}
          <LiveControls
            liveStatus={liveStatus}
            locked={locked}
            timeRemainingSec={timeRemainingSec}
            onStart={startSession}
            onLock={lockSession}
            onExtend={extendSession}
            onClose={closeSession}
            onShowQr={() => setQrOpen(true)}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 2.5 } }}>
            <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
              <strong style={{ color: 'var(--card-foreground)' }}>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{liveStatus}</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
              <strong style={{ color: 'var(--card-foreground)' }}>Present:</strong> {presentCount} / {students.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
              <strong style={{ color: 'var(--card-foreground)' }}>Late:</strong> {lateCount}
            </Typography>
            <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
              <strong style={{ color: 'var(--card-foreground)' }}>Absent:</strong> {absentCount}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', flexWrap: 'wrap', mb: { xs: 2, sm: 2.5 } }}>
            <TextField 
              size="small" 
              fullWidth 
              placeholder="Search by name or matric" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              sx={{ 
                maxWidth: { xs: '100%', sm: 360 }, 
                '& label.Mui-focused': { color: '#000' }, 
                '& .MuiOutlinedInput-root': { 
                  '& fieldset': { borderColor: 'border' }, 
                  '&:hover fieldset': { borderColor: '#000' }, 
                  '&.Mui-focused fieldset': { borderColor: '#000' },
                  minHeight: { xs: 44, sm: 40 }
                } 
              }} 
            />
            <MUIButton 
              size="small" 
              variant="outlined" 
              onClick={() => setStatusForSelected('present')} 
              sx={{
                ...BUTTON.outline,
                minHeight: { xs: 44, sm: 32 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1 },
                touchAction: 'manipulation'
              }}
            >
              <span className="hidden xs:inline">Mark Present</span>
              <span className="xs:hidden">Present</span>
            </MUIButton>
            <MUIButton 
              size="small" 
              variant="outlined" 
              onClick={() => setStatusForSelected('late')} 
              sx={{
                ...BUTTON.outline,
                minHeight: { xs: 44, sm: 32 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1 },
                touchAction: 'manipulation'
              }}
            >
              <span className="hidden xs:inline">Mark Late</span>
              <span className="xs:hidden">Late</span>
            </MUIButton>
            <MUIButton 
              size="small" 
              variant="outlined" 
              onClick={() => setStatusForSelected('absent')} 
              sx={{
                ...BUTTON.outline,
                minHeight: { xs: 44, sm: 32 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1 },
                touchAction: 'manipulation'
              }}
            >
              <span className="hidden xs:inline">Mark Absent</span>
              <span className="xs:hidden">Absent</span>
            </MUIButton>
            <MUIButton 
              size="small" 
              variant="contained" 
              onClick={exportCSV} 
              sx={{
                ...BUTTON.primary,
                minHeight: { xs: 44, sm: 32 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1 },
                touchAction: 'manipulation'
              }}
            >
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </MUIButton>
          </Box>

          <TableContainer sx={{ 
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
          }}>
            <Table aria-label="Student attendance table" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ py: { xs: 1, sm: 1.5 } }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selected.size > 0 && !allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      aria-label="Select all students"
                      sx={{ 
                        '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 24 } },
                        touchAction: 'manipulation'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    py: { xs: 1, sm: 1.5 }
                  }}>Student</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    py: { xs: 1, sm: 1.5 }
                  }}>Matric</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    py: { xs: 1, sm: 1.5 }
                  }}>Status</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    py: { xs: 1, sm: 1.5 }
                  }}>Check-in</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} hover sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                    <TableCell padding="checkbox" sx={{ py: { xs: 1, sm: 1.5 } }}>
                      <Checkbox
                        checked={selected.has(s.id)}
                        onChange={(e) => toggleOne(s.id, e.target.checked)}
                        aria-label={`Select ${s.name}`}
                        sx={{ 
                          '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 24 } },
                          touchAction: 'manipulation'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>{s.name}</TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>{s.matric}</TableCell>
                    <TableCell sx={{ py: { xs: 1, sm: 1.5 } }}>{renderStatus(s.status)}</TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>{s.checkInTime ? s.checkInTime : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </MUICardContent>
        </MUICard>
      </motion.div>

      {/* Post-session analytics */}
      {liveStatus === 'closed' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SessionSummary
            totalCount={totalCount}
            presentCount={presentCount}
            onTimeCount={onTimeCount}
            lateCount={lateCount}
            absentCount={absentCount}
            session={session}
            liveStatus={liveStatus}
            attendanceRate={attendanceRate}
            onTimeRate={onTimeRate}
            lateRate={lateRate}
            absentRate={absentRate}
            onExport={exportCSV}
          />
        </motion.div>
      )}

      {/* QR Dialog - Teachers show QR codes */}
    </div>
  )
}


