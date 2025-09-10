"use client"

import React, { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDaysIcon, PlusIcon, ClockIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import StatCard from "@/components/dashboard/stat-card"
import { Box, Card as MUICard, CardContent as MUICardContent, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button as MUIButton, Chip } from "@mui/material"
import SessionQrCodeDialog from "@/components/attendance/session-qr-code-dialog"
import { exportRowsToCsv } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

type SessionStatus = "active" | "scheduled" | "completed"
type AttendanceStatus = "scheduled" | "completed"

interface CourseInfo { 
  course_code: string
  course_name: string 
}

interface SessionItem {
  id: string
  session_name: string
  session_date: string
  start_time: string
  end_time: string
  status: SessionStatus
  course: CourseInfo
}

interface AttendanceRecord {
  id: string
  courseCode: string
  courseName: string
  className: string
  date: string
  startTime: string
  endTime: string
  present: number
  total: number
  status: AttendanceStatus
}

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
const TODAY_DATE = "2024-01-20"

// ============================================================================
// HELPERS
// ============================================================================

/** Apply all filters to the dataset */
const filterAttendance = (
  data: AttendanceRecord[],
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
  // ==========================================================================
  // MOCK DATA (replace with real data fetching)
  // ==========================================================================
  const sessions: SessionItem[] = [
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
      session_name: "Tutorial 3: Integration",
      session_date: "2024-01-21",
      start_time: "14:00",
      end_time: "15:30",
      status: "scheduled",
      course: {
        course_code: "MATH201",
        course_name: "Calculus II"
      }
    },
    {
      id: "3",
      session_name: "Lecture 4: Algorithms",
      session_date: "2024-01-18",
      start_time: "09:00",
      end_time: "10:30",
      status: "completed",
      course: {
        course_code: "CS101",
        course_name: "Introduction to Computer Science"
      }
    }
  ]

  const sessionsToday = useMemo(() => sessions.filter(s => s.session_date === TODAY_DATE), [sessions])

  // Build a prioritized list for timetable rotation: active first, then scheduled
  const timetable = useMemo(() => {
    const active = sessionsToday.filter(s => s.status === 'active')
    const scheduled = sessionsToday.filter(s => s.status === 'scheduled')
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

  const activeCount = useMemo(() => sessionsToday.filter(s => s.status === 'active').length, [sessionsToday])

  // Attendance records mock data
  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "a1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      className: "Lecture",
      date: "2024-01-20",
      startTime: "09:00",
      endTime: "10:30",
      present: 42,
      total: 45,
      status: "completed"
    },
    {
      id: "a2",
      courseCode: "MATH201",
      courseName: "Calculus II",
      className: "Tutorial",
      date: "2024-01-21",
      startTime: "14:00",
      endTime: "15:30",
      present: 35,
      total: 38,
      status: "scheduled"
    },
    {
      id: "a3",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      className: "Quiz",
      date: "2024-01-18",
      startTime: "09:00",
      endTime: "10:00",
      present: 40,
      total: 45,
      status: "completed"
    }
  ]

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
  const [qrSession, setQrSession] = useState<{ id: string; course_name: string; course_code: string } | null>(null)
  
  const openQrFor = (record: AttendanceRecord) => {
    setQrSession({ id: record.id, course_name: record.courseName, course_code: record.courseCode })
    setQrOpen(true) // Always show QR code for teachers to display
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
          title={currentItem ? (currentItem.status === 'active' ? 'Now' : 'Next') : 'Timetable'}
          value={currentItem ? `${currentItem.course.course_code}` : 'No sessions'}
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
                          alignItems: 'center'
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
    </div>
  )
}
