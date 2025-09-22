import React from "react"
import { Box, Typography } from "@mui/material"
import { KeyIcon, AcademicCapIcon, BookOpenIcon, ClockIcon, UsersIcon, StarIcon, UserIcon, DevicePhoneMobileIcon, BuildingOfficeIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { courseColumns, sessionColumns, upcomingSessionColumns } from "@/lib/table-columns/user-columns"

// ============================================================================
// TYPES
// ============================================================================

interface LecturerDetails {
  // User Information
  role: string
  department: string
  lastLogin: string
  joinedDate: string
  bio: string
  phone: string
  employeeId: string
  
  // Professional Information
  specialization: string
  yearsExperience: number
  position: string
  hireDate: string
  researchInterests: string
  qualifications: string
  totalCourses: number
  activeCourses: number
  totalStudents: number
  averageRating: number
  courses: Array<{
    id: string
    name: string
    code: string
    credits: number
    students: number
    status: 'active' | 'completed' | 'upcoming'
    sections: Array<{
      section: string
      semester: string
      academicYear: string
      program: string
      isPrimary: boolean
      teachingHours: number
    }>
    studentDetails: Array<{
      id: string
      name: string
      email: string
      studentId: string
      section: string
      enrollmentDate: string
      status: string
    }>
  }>
  recentSessions: Array<{
    id: string
    course: string
    title: string
    date: string
    attendance: number
    totalStudents: number
  }>
  upcomingSessions: Array<{
    id: string
    course: string
    title: string
    date: string
    type: 'lecture' | 'lab' | 'tutorial'
  }>
}

interface LecturerTabsProps {
  details: LecturerDetails
  state?: any // Add state for real data calculations
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LecturerTabs({ details, state }: LecturerTabsProps) {
  // Helper functions for real data calculations
  const calculateTotalStudents = () => {
    if (!state?.sectionEnrollments || !details.courses) return details.totalStudents
    
    return details.courses.reduce((total, course) => {
      const courseEnrollments = state.sectionEnrollments.filter((enrollment: any) => {
        const section = state.sections?.find((s: any) => s.id === enrollment.section_id)
        return section?.course_id === course.id
      })
      return total + courseEnrollments.length
    }, 0)
  }

  const calculateActiveCourses = () => {
    if (!details.courses) return details.activeCourses
    return details.courses.filter(course => course.status === 'active').length
  }

  const getRecentSessions = () => {
    if (!state?.attendanceSessions || !details.courses) return details.recentSessions
    
    const lecturerSessions = state.attendanceSessions.filter((session: any) => 
      details.courses.some(course => course.id === session.course_id)
    )
    
    return lecturerSessions.slice(0, 5).map((session: any) => ({
      id: session.id,
      course: details.courses.find(c => c.id === session.course_id)?.name || 'Unknown Course',
      title: session.title || 'Session',
      date: new Date(session.session_date).toLocaleDateString(),
      attendance: session.attendance_count || 0,
      totalStudents: session.total_students || 0
    }))
  }

  const lecturerStatsCards = [
    { 
      title: "Active Courses", 
      value: calculateActiveCourses(), 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Currently teaching",
      change: `${details.totalCourses} total`
    },
    { 
      title: "Total Students", 
      value: calculateTotalStudents(), 
      icon: UsersIcon, 
      color: "#000000",
      subtitle: "Students taught",
      change: "This semester"
    },
    { 
      title: "Average Rating", 
      value: details.averageRating, 
      icon: StarIcon, 
      color: "#000000",
      subtitle: "Student rating",
      change: "Out of 5.0"
    },
    { 
      title: "Experience", 
      value: `${details.yearsExperience} years`, 
      icon: ClockIcon, 
      color: "#000000",
      subtitle: "Teaching experience",
      change: "Professional"
    }
  ]

  const tabs = [
    {
      label: "Overview",
      value: "overview",
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Personal Information Section */}
          <InfoCard
            title="Personal Information"
            subtitle="Basic user details and contact information"
            items={[
              {
                label: "Role",
                value: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: '#fef3c7',
                        color: '#92400e',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    >
                      {details.role || "N/A"}
                    </Box>
                  </Box>
                ),
                icon: UserIcon
              },
              {
                label: "Department",
                value: details.department || "N/A",
                icon: BuildingOfficeIcon
              },
              {
                label: "Bio",
                value: details.bio || "No bio provided",
                icon: UserIcon
              },
              {
                label: "Phone",
                value: details.phone || "Not provided",
                icon: DevicePhoneMobileIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />

          {/* Professional Information Section */}
          <InfoCard
            title="Professional Information"
            subtitle="Teaching credentials and professional details"
            items={[
              {
                label: "Employee ID",
                value: (
                  <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1rem' }}>
                    {details.employeeId || "N/A"}
                  </Box>
                ),
                icon: KeyIcon
              },
              {
                label: "Specialization",
                value: details.specialization || "N/A",
                icon: BookOpenIcon
              },
              {
                label: "Experience",
                value: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ fontWeight: 700, color: '#7c3aed', fontSize: '1.25rem' }}>
                      {details.yearsExperience}
                    </Box>
                    <Box component="span" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      years
                    </Box>
                  </Box>
                ),
                icon: ClockIcon
              },
              {
                label: "Position",
                value: details.position || "N/A",
                icon: AcademicCapIcon
              },
              {
                label: "Hire Date",
                value: details.hireDate || "N/A",
                icon: CalendarDaysIcon
              },
              {
                label: "Research Interests",
                value: details.researchInterests || "Not specified",
                icon: BookOpenIcon
              },
              {
                label: "Qualifications",
                value: details.qualifications || "Not specified",
                icon: AcademicCapIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />

          {/* Account Information Section */}
          <InfoCard
            title="Account Information"
            subtitle="Login and account activity details"
            items={[
              {
                label: "Last Login",
                value: details.lastLogin || "N/A",
                icon: ClockIcon
              },
              {
                label: "Joined",
                value: details.joinedDate || "N/A",
                icon: CalendarDaysIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />
        </Box>
      )
    },
    {
      label: "Courses",
      value: "courses",
      content: (
        <DataTable
          title="Teaching Courses"
          subtitle="Current and upcoming courses"
          columns={courseColumns}
          data={details.courses || []}
        />
      )
    },
    {
      label: "Students",
      value: "students",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            All Students in Lecturer's Sections
          </Typography>
          {details.courses?.map((course, courseIndex) => (
            <Box key={course.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#000000' }}>
                {course.name} ({course.code}) - {course.students} students
              </Typography>
              {course.sections?.map((section, sectionIndex) => (
                <Box key={`${course.id}-${sectionIndex}`} sx={{ mb: 2, ml: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666666' }}>
                    Section: {section.section} | {section.semester} {section.academicYear} | {section.program}
                    {section.isPrimary && (
                      <Box component="span" sx={{ 
                        ml: 1, 
                        px: 1, 
                        py: 0.5, 
                        bgcolor: '#000000', 
                        color: 'white', 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        Primary
                      </Box>
                    )}
                  </Typography>
                  {course.studentDetails?.filter(student => student.section === section.section).length > 0 ? (
                    <DataTable
                      title=""
                      subtitle=""
                      columns={[
                        {
                          key: 'student',
                          label: 'Student',
                          render: (value: any, student: any) => (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {student.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {student.studentId}
                              </Typography>
                            </Box>
                          )
                        },
                        {
                          key: 'email',
                          label: 'Email',
                          render: (value: any, student: any) => (
                            <Typography variant="body2">
                              {student.email}
                            </Typography>
                          )
                        },
                        {
                          key: 'enrollmentDate',
                          label: 'Enrolled',
                          render: (value: any, student: any) => (
                            <Typography variant="body2">
                              {student.enrollmentDate}
                            </Typography>
                          )
                        },
                        {
                          key: 'status',
                          label: 'Status',
                          render: (value: any, student: any) => (
                            <Box component="span" sx={{ 
                              px: 1.5, 
                              py: 0.5, 
                              bgcolor: student.status === 'active' ? '#00000020' : '#66666620',
                              color: student.status === 'active' ? '#000000' : '#666666',
                              borderRadius: 1, 
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}>
                              {student.status}
                            </Box>
                          )
                        }
                      ]}
                      data={course.studentDetails?.filter(student => student.section === section.section) || []}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', ml: 2 }}>
                      No students enrolled in this section
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )
    },
    {
      label: "Sessions",
      value: "sessions",
      content: (
        <DataTable
          title="Recent Sessions"
          subtitle="Latest teaching sessions"
          columns={sessionColumns}
          data={getRecentSessions()}
        />
      )
    },
    {
      label: "Upcoming",
      value: "upcoming",
      content: (
        <DataTable
          title="Upcoming Sessions"
          subtitle="Scheduled teaching sessions"
          columns={upcomingSessionColumns}
          data={details.upcomingSessions || []}
        />
      )
    },
    {
      label: "Attendance Management",
      value: "attendance",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Attendance Overview
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Sessions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {details.recentSessions.length}
              </Typography>
            </Box>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Average Attendance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {details.recentSessions.length > 0 
                  ? Math.round(details.recentSessions.reduce((sum, session) => sum + session.attendance, 0) / details.recentSessions.length)
                  : 0}%
              </Typography>
            </Box>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {details.totalStudents}
              </Typography>
            </Box>
          </Box>
          <DataTable
            title="Session Attendance Records"
            subtitle="Detailed attendance for each session"
            columns={[
              {
                key: "course",
                label: "Course",
                render: (session: any) => (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {session.course}
                  </Typography>
                )
              },
              {
                key: "title",
                label: "Session Title",
                render: (session: any) => (
                  <Typography variant="body2">
                    {session.title}
                  </Typography>
                )
              },
              {
                key: "date",
                label: "Date",
                render: (session: any) => (
                  <Typography variant="body2">
                    {new Date(session.date).toLocaleDateString()}
                  </Typography>
                )
              },
              {
                key: "attendance",
                label: "Attendance",
                render: (session: any) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {session.attendance}/{session.totalStudents}
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 8,
                        bgcolor: '#e0e0e0',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(session.attendance / session.totalStudents) * 100}%`,
                          height: '100%',
                          bgcolor: session.attendance / session.totalStudents > 0.8 ? '#4caf50' : 
                                   session.attendance / session.totalStudents > 0.6 ? '#ff9800' : '#f44336'
                        }}
                      />
                    </Box>
                  </Box>
                )
              }
            ]}
            data={details.recentSessions || []}
          />
        </Box>
      )
    }
  ]

  return { tabs }
}
