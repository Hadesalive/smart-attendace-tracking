"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
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
  TableHead,
  TableRow,
  Avatar,
  Divider
} from "@mui/material"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  PhotoIcon,
  LinkIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatFileSize } from "@/lib/utils"
import { useData } from "@/lib/contexts/DataContext"
import { AttendanceSession } from "@/lib/types/shared"
import { mapSessionStatus } from "@/lib/utils/statusMapping"

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

// Types
interface SessionMaterial {
  id: string
  title: string
  type: "document" | "video" | "image" | "link"
  size?: number
  url?: string
  description?: string
}

interface StudentSession {
  id: string
  title: string
  courseCode: string
  courseName: string
  instructor: string
  type: "lecture" | "lab" | "seminar" | "workshop"
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  enrolled: number
  status: "upcoming" | "active" | "completed" | "cancelled"
  description: string
  materials: SessionMaterial[]
  attendanceStatus?: "present" | "late" | "absent" | null
  checkInTime?: string
  objectives?: string[]
  prerequisites?: string[]
}

export default function StudentSessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string

  const { 
    state,
    fetchCourses,
    fetchEnrollments,
    fetchAttendanceSessions,
    fetchAttendanceRecords,
    getAttendanceRecordsBySession
  } = useData()

  const [session, setSession] = useState<StudentSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Load required data and resolve session from store
  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchCourses(),
        fetchEnrollments(),
        fetchAttendanceSessions(),
        fetchAttendanceRecords()
      ])
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Build session view model from store
  useEffect(() => {
    const source: AttendanceSession | undefined = state.attendanceSessions.find(s => s.id === sessionId)
    if (!source) {
      return
    }

    // Determine status for student view
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const todayDate = now.toISOString().split('T')[0]
    let studentStatus: "upcoming" | "active" | "completed" = 'upcoming'
    if (source.session_date < todayDate || (source.session_date === todayDate && source.end_time < currentTime)) {
      studentStatus = 'completed'
    } else if (source.session_date === todayDate && source.start_time <= currentTime && source.end_time >= currentTime) {
      studentStatus = 'active'
    } else {
      studentStatus = 'upcoming'
    }

    // Attendance record for current user
    const records = getAttendanceRecordsBySession(source.id)
    const studentRecord = records.find(r => !!state.currentUser?.id && r.student_id === state.currentUser.id)

    const view: StudentSession = {
      id: source.id,
      title: source.session_name,
      courseCode: source.course_code,
      courseName: source.course_name,
      instructor: source.lecturer_name || 'Instructor',
      type: (source.type || 'lecture') as any,
      date: source.session_date,
      startTime: source.start_time,
      endTime: source.end_time,
      location: (source as any).location || 'TBA',
      capacity: source.capacity || 50,
      enrolled: source.enrolled || 0,
      status: studentStatus,
      description: source.description || '',
      materials: [],
      attendanceStatus: studentRecord ? (studentRecord.status as any) : null,
      checkInTime: studentRecord?.check_in_time,
      objectives: [],
      prerequisites: []
    }

    setSession(view)
    setLoading(false)
  }, [sessionId, state.attendanceSessions, state.currentUser?.id, getAttendanceRecordsBySession])

  const sessionTypeInfo = useMemo(() => {
    const types = {
      lecture: { label: "Lecture", color: "#000000", icon: AcademicCapIcon },
      lab: { label: "Lab", color: "#000000", icon: BookOpenIcon },
      seminar: { label: "Seminar", color: "#000000", icon: UserIcon },
      workshop: { label: "Workshop", color: "#000000", icon: DocumentTextIcon }
    }
    return types[session?.type as keyof typeof types] || types.lecture
  }, [session?.type])

  const statusInfo = useMemo(() => {
    const statuses = {
      upcoming: { label: "Upcoming", color: "#333333", icon: ClockIcon },
      active: { label: "Active", color: "#000000", icon: CheckCircleIcon },
      completed: { label: "Completed", color: "#000000", icon: CheckCircleIcon },
      cancelled: { label: "Cancelled", color: "#666666", icon: XCircleIcon }
    }
    return statuses[session?.status as keyof typeof statuses] || statuses.upcoming
  }, [session?.status])

  const attendanceStatusInfo = useMemo(() => {
    if (!session?.attendanceStatus) return null
    
    const statuses = {
      present: { label: "Present", color: "#000000", icon: CheckCircleIcon },
      late: { label: "Late", color: "#333333", icon: ExclamationTriangleIcon },
      absent: { label: "Absent", color: "#666666", icon: XCircleIcon }
    }
    return statuses[session.attendanceStatus]
  }, [session?.attendanceStatus])

  const handleMarkAttendance = () => {
    router.push(`/student/scan-attendance?sessionId=${sessionId}`)
  }

  const handleDownloadMaterial = (materialId: string) => {
    console.log('Downloading material:', materialId)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
      case "video":
        return <VideoCameraIcon className="h-5 w-5 text-gray-600" />
      case "image":
        return <PhotoIcon className="h-5 w-5 text-gray-600" />
      case "link":
        return <LinkIcon className="h-5 w-5 text-gray-600" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 2 }}>
            Session Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', mb: 4 }}>
            The session you're looking for could not be found.
          </Typography>
          <MUIButton 
            variant="outlined"
            onClick={() => router.push('/student/sessions')}
            sx={BUTTON_STYLES.outlined}
          >
            Back to Sessions
          </MUIButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">{session.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'DM Sans, sans-serif' }}>
              {session.courseCode} - {session.courseName}
            </Typography>
            <Chip 
              label={sessionTypeInfo.label}
              sx={{ 
                bgcolor: sessionTypeInfo.color,
                color: 'white',
                fontWeight: 600,
                border: '1px solid #000000'
              }}
            />
            <Chip 
              label={statusInfo.label}
              sx={{ 
                bgcolor: statusInfo.color,
                color: 'white',
                fontWeight: 600,
                border: '1px solid #000000'
              }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {session.status === "active" || session.status === "upcoming" ? (
            <MUIButton 
              variant="contained"
              startIcon={<QrCodeIcon className="h-4 w-4" />}
              onClick={handleMarkAttendance}
              sx={BUTTON_STYLES.primary}
            >
              Mark Attendance
            </MUIButton>
          ) : null}
        </div>
      </div>

      {/* Session Info Card */}
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
            <CalendarDaysIcon className="h-5 w-5" />
            Session Information
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3,
            mb: 3
          }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Date & Time
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {formatDate(session.date)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {session.startTime} - {session.endTime}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Location
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPinIcon className="h-4 w-4" />
                {session.location}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Instructor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {session.instructor}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                Capacity
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {session.enrolled}/{session.capacity} students
              </Typography>
            </Box>

            {attendanceStatusInfo && (
              <Box>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                  Your Attendance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <attendanceStatusInfo.icon className={`h-4 w-4 ${attendanceStatusInfo.color}`} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: attendanceStatusInfo.color }}>
                    {attendanceStatusInfo.label}
                  </Typography>
                </Box>
                {session.checkInTime && (
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mt: 0.5 }}>
                    Checked in at {session.checkInTime}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Description */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600, 
            mb: 2 
          }}>
            Session Description
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'hsl(var(--muted-foreground))', 
            lineHeight: 1.6,
            fontFamily: 'DM Sans, sans-serif'
          }}>
            {session.description}
          </Typography>
        </MUICardContent>
      </MUICard>

      {/* Objectives & Prerequisites */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {session.objectives && (
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
                <CheckCircleIcon className="h-5 w-5 text-gray-600" />
                Learning Objectives
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {session.objectives.map((objective, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontFamily: 'DM Sans, sans-serif',
                      lineHeight: 1.5
                    }}>
                      {objective}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </MUICardContent>
          </MUICard>
        )}

        {session.prerequisites && (
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
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
                Prerequisites
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {session.prerequisites.map((prerequisite, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontFamily: 'DM Sans, sans-serif',
                      lineHeight: 1.5
                    }}>
                      {prerequisite}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </MUICardContent>
          </MUICard>
        )}
      </Box>

      {/* Materials */}
      {session.materials.length > 0 && (
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: 0 }}>
            <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pb: 2 }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <DocumentTextIcon className="h-5 w-5" />
                Session Materials ({session.materials.length})
              </Typography>
            </Box>
            
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
                  <TableCell>Material</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {session.materials.map((material) => (
                  <TableRow key={material.id} sx={{ 
                    '& .MuiTableCell-root': { borderColor: '#000' },
                    '&:hover': { backgroundColor: 'hsl(var(--muted) / 0.1)' }
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {getFileIcon(material.type)}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                            {material.title}
                          </Typography>
                          {material.description && (
                            <Typography variant="caption" sx={{ 
                              color: 'hsl(var(--muted-foreground))', 
                              display: 'block',
                              mt: 0.5,
                              lineHeight: 1.4
                            }}>
                              {material.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={material.type.charAt(0).toUpperCase() + material.type.slice(1)} 
                        size="small"
                        sx={{ 
                          textTransform: 'capitalize',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.size ? formatFileSize(material.size) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <MUIButton
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                        onClick={() => handleDownloadMaterial(material.id)}
                        sx={{
                          ...BUTTON_STYLES.outlined,
                          minWidth: 'auto',
                          px: 2
                        }}
                      >
                        Download
                      </MUIButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MUICardContent>
        </MUICard>
      )}
    </div>
  )
}
