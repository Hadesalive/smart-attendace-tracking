import React from "react"
import { Typography, Chip, Box } from "@mui/material"
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GradeRow {
  course: string
  grade: string
  points: number
  maxPoints: number
  date: string
}

interface AssignmentRow {
  title: string
  course: string
  dueDate: string
  status: 'submitted' | 'pending' | 'overdue'
}

interface AttendanceRow {
  course: string
  session: string
  date: string
  status: 'present' | 'absent' | 'late'
  time: string
}

interface MaterialRow {
  title: string
  course: string
  type: 'document' | 'video' | 'image' | 'link'
  uploadedAt: string
  size?: string
}

interface SessionRow {
  title: string
  course: string
  date: string
  attendance: number
  totalStudents: number
}

interface StudentRow {
  name: string
  email: string
  studentId: string
  program: string
  year: number
  status: 'active' | 'inactive' | 'suspended'
  enrollmentDate: string
}

interface LecturerRow {
  name: string
  email: string
  department: string
  courses: string[]
  status: 'active' | 'inactive'
  hireDate: string
}

interface AdminRow {
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive'
  lastLogin: string
}

interface CourseRow {
  name: string
  code: string
  credits: number
  students: number
  status: 'active' | 'inactive'
  sections?: Array<{
    section: string
    semester: string
    academicYear: string
    program: string
    isPrimary: boolean
    teachingHours: number
  }>
}

interface UpcomingSessionRow {
  title: string
  course: string
  date: string
  type: string
}

interface ActivityRow {
  action: string
  target: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return "#000000"
  if (grade.startsWith('B')) return "#333333"
  if (grade.startsWith('C')) return "#666666"
  return "#999999"
}

const getAttendanceStatusColor = (status: string) => {
  const colors = {
    present: "#000000",
    absent: "#666666",
    late: "#333333"
  }
  return colors[status as keyof typeof colors] || "#666666"
}

const getAttendanceStatusIcon = (status: string) => {
  switch (status) {
    case 'present': return CheckCircleIcon
    case 'absent': return XCircleIcon
    case 'late': return ClockIcon
    default: return UserIcon
  }
}

// ============================================================================
// TABLE COLUMN DEFINITIONS
// ============================================================================

export const gradeColumns = [
  {
    key: 'course',
    label: 'Course',
    render: (value: string, row: GradeRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'grade',
    label: 'Grade',
    render: (value: string, row: GradeRow) => (
      <Chip 
        label={row.grade} 
        size="small"
        sx={{ 
          backgroundColor: `${getGradeColor(row.grade)}20`,
          color: getGradeColor(row.grade),
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 500
        }}
      />
    )
  },
  {
    key: 'points',
    label: 'Points',
    render: (value: string, row: GradeRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.points}/{row.maxPoints}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: string, row: GradeRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  }
]

export const assignmentColumns = [
  {
    key: 'title',
    label: 'Assignment',
    render: (value: string, row: AssignmentRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.title}
      </Typography>
    )
  },
  {
    key: 'course',
    label: 'Course',
    render: (value: string, row: AssignmentRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    render: (value: string, row: AssignmentRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.dueDate)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string, row: AssignmentRow) => (
      <Chip 
        label={row.status} 
        size="small"
        sx={{ 
          backgroundColor: row.status === 'submitted' ? "#00000020" : "#66666620",
          color: row.status === 'submitted' ? "#000000" : "#666666",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 500,
          textTransform: "capitalize"
        }}
      />
    )
  }
]

export const attendanceColumns = [
  {
    key: 'course',
    label: 'Course',
    render: (value: string, row: AttendanceRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'session',
    label: 'Session',
    render: (value: string, row: AttendanceRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.session}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: string, row: AttendanceRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string, row: AttendanceRow) => {
      const StatusIcon = getAttendanceStatusIcon(row.status)
      const statusColor = getAttendanceStatusColor(row.status)
      return (
        <Chip 
          icon={<StatusIcon style={{ width: 16, height: 16 }} />}
          label={row.status} 
          size="small"
          sx={{ 
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 500,
            textTransform: "capitalize"
          }}
        />
      )
    }
  }
]

export const courseColumns = [
  {
    key: 'name',
    label: 'Course Name',
    render: (value: string, row: CourseRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.name}
      </Typography>
    )
  },
  {
    key: 'code',
    label: 'Code',
    render: (value: string, row: CourseRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.code}
      </Typography>
    )
  },
  {
    key: 'credits',
    label: 'Credits',
    render: (value: string, row: CourseRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.credits}
      </Typography>
    )
  },
  {
    key: 'students',
    label: 'Students',
    render: (value: string, row: CourseRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.students}
      </Typography>
    )
  },
  {
    key: 'sections',
    label: 'Sections',
    render: (value: string, row: CourseRow) => (
      <Box>
        {row.sections?.map((section, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {section.section} ({section.semester} {section.academicYear})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {section.program} • {section.teachingHours}h/week
              {section.isPrimary && (
                <Box component="span" sx={{ 
                  ml: 1, 
                  px: 0.5, 
                  py: 0.25, 
                  bgcolor: '#000000', 
                  color: 'white', 
                  borderRadius: 0.5, 
                  fontSize: '0.625rem',
                  fontWeight: 500
                }}>
                  Primary
                </Box>
              )}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string, row: CourseRow) => (
      <Chip 
        label={row.status} 
        size="small"
        sx={{ 
          backgroundColor: row.status === 'active' ? "#00000020" : "#66666620",
          color: row.status === 'active' ? "#000000" : "#666666",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 500,
          textTransform: "capitalize"
        }}
      />
    )
  }
]

export const sessionColumns = [
  {
    key: 'title',
    label: 'Session',
    render: (value: string, row: SessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.title}
      </Typography>
    )
  },
  {
    key: 'course',
    label: 'Course',
    render: (value: string, row: SessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: string, row: SessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    key: 'attendance',
    label: 'Attendance',
    render: (value: string, row: SessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.attendance}/{row.totalStudents}
      </Typography>
    )
  }
]

export const upcomingSessionColumns = [
  {
    key: 'title',
    label: 'Session',
    render: (value: string, row: UpcomingSessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.title}
      </Typography>
    )
  },
  {
    key: 'course',
    label: 'Course',
    render: (value: string, row: UpcomingSessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: string, row: UpcomingSessionRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    key: 'type',
    label: 'Type',
    render: (value: string, row: UpcomingSessionRow) => (
      <Chip 
        label={row.type} 
        size="small"
        sx={{ 
          backgroundColor: "#00000020",
          color: "#000000",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 500,
          textTransform: "capitalize"
        }}
      />
    )
  }
]

export const activityColumns = [
  {
    key: 'action',
    label: 'Action',
    render: (value: string, row: ActivityRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.action}
      </Typography>
    )
  },
  {
    key: 'target',
    label: 'Target',
    render: (value: string, row: ActivityRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.target}
      </Typography>
    )
  },
  {
    key: 'timestamp',
    label: 'Time',
    render: (value: string, row: ActivityRow) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.timestamp)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string, row: ActivityRow) => (
      <Chip 
        label={row.status} 
        size="small"
        sx={{ 
          backgroundColor: row.status === 'success' ? "#00000020" : "#66666620",
          color: row.status === 'success' ? "#000000" : "#666666",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 500,
          textTransform: "capitalize"
        }}
      />
    )
  }
]
