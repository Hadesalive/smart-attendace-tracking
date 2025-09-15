import React from "react"
import { Typography, Chip } from "@mui/material"
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'grade',
    label: 'Grade',
    render: (value: any, row: any) => (
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.points}/{row.maxPoints}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: any, row: any) => (
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.title}
      </Typography>
    )
  },
  {
    key: 'course',
    label: 'Course',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.dueDate)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: any, row: any) => (
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'session',
    label: 'Session',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.session}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: any, row: any) => {
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.name}
      </Typography>
    )
  },
  {
    key: 'code',
    label: 'Code',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.code}
      </Typography>
    )
  },
  {
    key: 'students',
    label: 'Students',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.students}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: any, row: any) => (
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.title}
      </Typography>
    )
  },
  {
    key: 'course',
    label: 'Course',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    key: 'attendance',
    label: 'Attendance',
    render: (value: any, row: any) => (
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.title}
      </Typography>
    )
  },
  {
    key: 'course',
    label: 'Course',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.course}
      </Typography>
    )
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    key: 'type',
    label: 'Type',
    render: (value: any, row: any) => (
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
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.action}
      </Typography>
    )
  },
  {
    key: 'target',
    label: 'Target',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {row.target}
      </Typography>
    )
  },
  {
    key: 'timestamp',
    label: 'Time',
    render: (value: any, row: any) => (
      <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
        {formatDate(row.timestamp)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: any, row: any) => (
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
