import React from "react"
import { Box, Typography } from "@mui/material"
import DataTable from "@/components/admin/DataTable"

interface AttendanceManagementTabProps {
  details: {
    recentSessions: Array<{
      id: string
      course: string
      title: string
      date: string
      attendance: number
      totalStudents: number
    }>
    courses: Array<{
      id: string
      name: string
      code: string
      studentDetails?: Array<{
        id: string
        name: string
        email: string
        studentId: string
        section: string
        enrollmentDate: string
        status: string
        attendanceRate?: number
        sessionsAttended?: number
        totalSessions?: number
      }>
    }>
    totalStudents: number
  }
}

export default function AttendanceManagementTab({ details }: AttendanceManagementTabProps) {
  // Calculate stats
  const totalSessions = details.recentSessions.length
  const averageAttendance = details.recentSessions.length > 0 
    ? Math.round((details.recentSessions.reduce((sum, session) => {
        const rate = session.totalStudents > 0 ? (session.attendance / session.totalStudents) * 100 : 0
        return sum + rate
      }, 0) / details.recentSessions.length))
    : 0

  const allStudents = details.courses.flatMap(course => 
    (course.studentDetails || []).map(student => ({
      ...student,
      courseName: course.name,
      courseCode: course.code
    }))
  )

  const studentsAtRisk = allStudents.filter(student => (student.attendanceRate || 0) < 75).length
  const lowAttendanceStudents = allStudents
    .filter(student => (student.attendanceRate || 0) < 75)
    .sort((a, b) => (a.attendanceRate || 0) - (b.attendanceRate || 0))

  return (
    <Box>
      {/* Attendance Statistics */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Attendance Analytics
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Sessions Conducted
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {totalSessions}
          </Typography>
        </Box>
        
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Average Attendance Rate
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {averageAttendance}%
          </Typography>
        </Box>
        
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Students at Risk
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#f44336' }}>
            {studentsAtRisk}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Below 75% attendance
          </Typography>
        </Box>
        
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Students
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {details.totalStudents}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Across all courses
          </Typography>
        </Box>
      </Box>

      {/* Students with Low Attendance */}
      {lowAttendanceStudents.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <DataTable
            title="Students Requiring Attention"
            subtitle="Students with attendance below 75%"
            columns={[
              {
                key: "name",
                label: "Student Name",
                render: (_value: string, row: any) => (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.name}
                  </Typography>
                )
              },
              {
                key: "studentId",
                label: "Student ID",
                render: (_value: string, row: any) => (
                  <Typography variant="body2">
                    {row.studentId}
                  </Typography>
                )
              },
              {
                key: "courseName",
                label: "Course",
                render: (_value: string, row: any) => (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.courseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.courseCode}
                    </Typography>
                  </Box>
                )
              },
              {
                key: "attendanceRate",
                label: "Attendance Rate",
                render: (_value: string, row: any) => {
                  const rate = row.attendanceRate || 0
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: rate < 50 ? '#f44336' : rate < 75 ? '#ff9800' : '#4caf50'
                        }}
                      >
                        {rate.toFixed(1)}%
                      </Typography>
                      <Box
                        sx={{
                          width: 60,
                          height: 8,
                          bgcolor: '#e0e0e0',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${rate}%`,
                            height: '100%',
                            bgcolor: rate < 50 ? '#f44336' : rate < 75 ? '#ff9800' : '#4caf50'
                          }}
                        />
                      </Box>
                    </Box>
                  )
                }
              },
              {
                key: "sessionsAttended",
                label: "Sessions",
                render: (_value: string, row: any) => (
                  <Typography variant="body2">
                    {row.sessionsAttended || 0} / {row.totalSessions || 0}
                  </Typography>
                )
              },
              {
                key: "status",
                label: "Status",
                render: (_value: string, row: any) => (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: row.status === 'active' ? '#e8f5e9' : '#ffebee',
                      display: 'inline-block'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: row.status === 'active' ? '#2e7d32' : '#c62828'
                      }}
                    >
                      {row.status}
                    </Typography>
                  </Box>
                )
              }
            ]}
            data={lowAttendanceStudents}
          />
        </Box>
      )}

      {/* All Students Attendance Summary */}
      <DataTable
        title="Student Attendance Summary"
        subtitle="Complete attendance overview for all students"
        columns={[
          {
            key: "name",
            label: "Student Name",
            render: (_value: string, row: any) => (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.name}
              </Typography>
            )
          },
          {
            key: "studentId",
            label: "Student ID",
            render: (_value: string, row: any) => (
              <Typography variant="body2">
                {row.studentId}
              </Typography>
            )
          },
          {
            key: "courseName",
            label: "Course",
            render: (_value: string, row: any) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {row.courseName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.courseCode}
                </Typography>
              </Box>
            )
          },
          {
            key: "section",
            label: "Section",
            render: (_value: string, row: any) => (
              <Typography variant="body2">
                {row.section}
              </Typography>
            )
          },
          {
            key: "attendanceRate",
            label: "Attendance Rate",
            render: (_value: string, row: any) => {
              const rate = row.attendanceRate || 0
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: rate < 50 ? '#f44336' : rate < 75 ? '#ff9800' : '#4caf50'
                    }}
                  >
                    {rate.toFixed(1)}%
                  </Typography>
                  <Box
                    sx={{
                      width: 60,
                      height: 8,
                      bgcolor: '#e0e0e0',
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${rate}%`,
                        height: '100%',
                        bgcolor: rate < 50 ? '#f44336' : rate < 75 ? '#ff9800' : '#4caf50'
                      }}
                    />
                  </Box>
                </Box>
              )
            }
          },
          {
            key: "sessionsAttended",
            label: "Sessions",
            render: (_value: string, row: any) => (
              <Typography variant="body2">
                {row.sessionsAttended || 0} / {row.totalSessions || 0}
              </Typography>
            )
          }
        ]}
        data={allStudents}
      />
    </Box>
  )
}

