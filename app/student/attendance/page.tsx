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
  Tabs,
  Tab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDaysIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  BookOpenIcon
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
  overflow: 'hidden' as const
}

const BUTTON_STYLES = {
  outlined: {
    borderColor: '#000',
    color: 'hsl(var(--foreground))',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': {
      borderColor: '#000',
      backgroundColor: 'hsl(var(--muted))',
    }
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
}

// Types
interface AttendanceRecord {
  id: string
  sessionTitle: string
  courseCode: string
  courseName: string
  date: string
  startTime: string
  endTime: string
  status: "present" | "late" | "absent"
  checkInTime?: string
  instructor: string
  location: string
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  instructor: string
}

export default function StudentAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [statusTab, setStatusTab] = useState<"all" | "present" | "late" | "absent">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Mock data
  const courses: Course[] = [
    { id: "1", courseCode: "CS101", courseName: "Introduction to Computer Science", instructor: "Dr. Smith" },
    { id: "2", courseCode: "MATH201", courseName: "Calculus II", instructor: "Prof. Johnson" },
    { id: "3", courseCode: "ENG101", courseName: "English Composition", instructor: "Dr. Brown" },
    { id: "4", courseCode: "PHYS101", courseName: "Physics I", instructor: "Dr. Wilson" },
  ]

  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      sessionTitle: "Introduction to Programming",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      date: "2024-01-22T10:00:00",
      startTime: "10:00",
      endTime: "11:30",
      status: "present",
      checkInTime: "10:02",
      instructor: "Dr. Smith",
      location: "Room 101"
    },
    {
      id: "2",
      sessionTitle: "Data Structures Lab",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      date: "2024-01-22T14:00:00",
      startTime: "14:00",
      endTime: "16:00",
      status: "late",
      checkInTime: "14:15",
      instructor: "Dr. Smith",
      location: "Lab 201"
    },
    {
      id: "3",
      sessionTitle: "Derivatives and Applications",
      courseCode: "MATH201",
      courseName: "Calculus II",
      date: "2024-01-21T09:00:00",
      startTime: "09:00",
      endTime: "10:30",
      status: "present",
      checkInTime: "08:58",
      instructor: "Prof. Johnson",
      location: "Room 301"
    },
    {
      id: "4",
      sessionTitle: "Integration Techniques",
      courseCode: "MATH201",
      courseName: "Calculus II",
      date: "2024-01-20T11:00:00",
      startTime: "11:00",
      endTime: "12:00",
      status: "absent",
      instructor: "Prof. Johnson",
      location: "Room 302"
    },
    {
      id: "5",
      sessionTitle: "Essay Writing Workshop",
      courseCode: "ENG101",
      courseName: "English Composition",
      date: "2024-01-19T13:00:00",
      startTime: "13:00",
      endTime: "15:00",
      status: "present",
      checkInTime: "12:58",
      instructor: "Dr. Brown",
      location: "Room 205"
    }
  ]

  // Computed values
  const filteredRecords = useMemo(() => {
    let filtered = attendanceRecords
    
    if (selectedCourse) {
      filtered = filtered.filter(record => record.courseCode === selectedCourse)
    }
    
    if (statusTab !== "all") {
      filtered = filtered.filter(record => record.status === statusTab)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(record => 
        record.sessionTitle.toLowerCase().includes(query) ||
        record.courseCode.toLowerCase().includes(query) ||
        record.courseName.toLowerCase().includes(query) ||
        record.instructor.toLowerCase().includes(query)
      )
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedCourse, statusTab, searchQuery])

  const stats = useMemo(() => {
    const totalSessions = attendanceRecords.length
    const presentSessions = attendanceRecords.filter(r => r.status === 'present').length
    const lateSessions = attendanceRecords.filter(r => r.status === 'late').length
    const attendanceRate = totalSessions > 0 ? ((presentSessions + lateSessions) / totalSessions) * 100 : 0

    return { totalSessions, presentSessions, lateSessions, attendanceRate }
  }, [attendanceRecords])

  const courseStats = useMemo(() => {
    const courseStatsMap = new Map()
    
    courses.forEach(course => {
      const courseRecords = attendanceRecords.filter(r => r.courseCode === course.courseCode)
      const present = courseRecords.filter(r => r.status === 'present' || r.status === 'late').length
      const total = courseRecords.length
      const rate = total > 0 ? (present / total) * 100 : 0
      
      courseStatsMap.set(course.courseCode, {
        courseName: course.courseName,
        present,
        total,
        rate
      })
    })
    
    return courseStatsMap
  }, [attendanceRecords, courses])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="bg-green-500">Present</Badge>
      case "late":
        return <Badge variant="default" className="bg-yellow-500">Late</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "late":
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      case "absent":
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">My Attendance</h1>
          <p className="text-muted-foreground font-dm-sans">Track your attendance history and statistics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined" 
            startIcon={<ChartBarIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
          >
            Export Report
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
        <StatCard title="Total Sessions" value={formatNumber(stats.totalSessions)} icon={CalendarDaysIcon} color="#000000" change="All courses" />
        <StatCard title="Present" value={formatNumber(stats.presentSessions)} icon={CheckCircleIcon} color="#000000" change="On time" />
        <StatCard title="Late" value={formatNumber(stats.lateSessions)} icon={ExclamationTriangleIcon} color="#000000" change="Tardy" />
        <StatCard title="Attendance Rate" value={`${Math.round(stats.attendanceRate)}%`} icon={ChartBarIcon} color="#000000" change="Overall" />
      </Box>

      {/* Course Performance */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <PresentationChartLineIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'hsl(var(--card-foreground))' }}>
              Course Performance
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: { xs: 2, sm: 3 } 
          }}>
            {Array.from(courseStats.entries()).map(([courseCode, stats]) => (
              <Box key={courseCode} sx={{ 
                p: 2, 
                border: '1px solid #000', 
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 1 }}>
                  {courseCode}
                </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1, fontSize: '0.875rem' }}>
                  {stats.courseName}
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 0.5 }}>
                  {Math.round(stats.rate)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                  {stats.present}/{stats.total} sessions
                </Typography>
              </Box>
            ))}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Search and Filter */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Search */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Search Records
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Search by session, course, or instructor..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={INPUT_STYLES}
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

        {/* Course Filter */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Filter Course
              </Typography>
            </Box>
            
            <FormControl fullWidth sx={INPUT_STYLES}>
              <InputLabel>Select Course</InputLabel>
              <Select
                native
                value={selectedCourse}
                onChange={(e) => setSelectedCourse((e.target as HTMLSelectElement).value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.courseCode}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </MUICardContent>
        </MUICard>
      </Box>

      {/* Status Tabs */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          <Tabs 
            value={statusTab} 
            onChange={(e, newValue) => setStatusTab(newValue)}
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
            <Tab label={`All (${filteredRecords.length})`} value="all" />
            <Tab label={`Present (${filteredRecords.filter(r => r.status === 'present').length})`} value="present" />
            <Tab label={`Late (${filteredRecords.filter(r => r.status === 'late').length})`} value="late" />
            <Tab label={`Absent (${filteredRecords.filter(r => r.status === 'absent').length})`} value="absent" />
          </Tabs>
        </MUICardContent>
      </MUICard>

      {/* Records Table */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          {filteredRecords.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CalendarDaysIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                No Records Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                Your attendance records will appear here once you start attending sessions.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  '& .MuiTableCell-root': { 
                    borderColor: '#000',
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }
                }}>
                  <TableCell>Session</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} sx={{ 
                    '& .MuiTableCell-root': { borderColor: '#000' }
                  }}>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      {record.sessionTitle}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {record.courseCode}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {record.courseName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(record.date)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {record.startTime} - {record.endTime}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.checkInTime ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {record.checkInTime}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{record.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </MUICardContent>
      </MUICard>
    </div>
  )
}
