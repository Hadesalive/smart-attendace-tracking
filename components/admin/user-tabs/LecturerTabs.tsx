import React, { useState, useMemo, memo } from "react"
import { Box, Typography, TextField, MenuItem, Chip } from "@mui/material"
import { KeyIcon, AcademicCapIcon, BookOpenIcon, ClockIcon, UsersIcon, StarIcon, UserIcon, DevicePhoneMobileIcon, BuildingOfficeIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { courseColumns, sessionColumns, upcomingSessionColumns } from "@/lib/table-columns/user-columns"
import AttendanceManagementTab from "./lecturer/AttendanceManagementTab"

// ============================================================================
// STUDENTS TAB COMPONENT (with filters)
// ============================================================================

interface StudentsTabContentProps {
  courses: Array<{
    id: string
    name: string
    code: string
    sections?: Array<{
      section: string
      semester: string
      academicYear: string
      program: string
      isPrimary: boolean
      teachingHours: number
    }>
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
    status: 'active' | 'completed' | 'upcoming'
  }>
}

const StudentsTabContent = memo(({ courses }: StudentsTabContentProps) => {
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all')

  // Prepare all students data with enhanced info
  const allStudents = useMemo(() => {
    if (!courses || courses.length === 0) return []
    return courses.flatMap(course => {
      const courseSections = course.sections || []
      return (course.studentDetails || []).map(student => {
        const sectionDetails = courseSections.find(s => s.section === student.section)
        return {
          ...student,
          courseName: course.name,
          courseCode: course.code,
          courseId: course.id,
          program: sectionDetails?.program || 'N/A',
          semester: sectionDetails?.semester || 'N/A',
          academicYear: sectionDetails?.academicYear || 'N/A'
        }
      })
    })
  }, [courses])

  const uniqueCourses = useMemo(() => {
    const courseIds = Array.from(new Set(allStudents.map(s => s.courseId)))
    return courseIds.map(id => {
      const student = allStudents.find(s => s.courseId === id)
      return { id, name: student?.courseName || '', code: student?.courseCode || '' }
    })
  }, [allStudents])

  const uniqueSections = useMemo(() => 
    Array.from(new Set(allStudents.map(s => s.section))).sort()
  , [allStudents])

  const uniquePrograms = useMemo(() => 
    Array.from(new Set(allStudents.map(s => s.program))).filter(p => p !== 'N/A').sort()
  , [allStudents])

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      if (courseFilter !== 'all' && student.courseId !== courseFilter) return false
      if (sectionFilter !== 'all' && student.section !== sectionFilter) return false
      if (programFilter !== 'all' && student.program !== programFilter) return false
      if (attendanceFilter === 'at-risk' && (student.attendanceRate || 0) >= 75) return false
      if (attendanceFilter === 'good' && (student.attendanceRate || 0) < 75) return false
      return true
    })
  }, [allStudents, courseFilter, sectionFilter, programFilter, attendanceFilter])

  return (
    <Box>
      {/* Summary Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Students
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {allStudents.length}
          </Typography>
          {filteredStudents.length !== allStudents.length && (
            <Typography variant="caption" color="text.secondary">
              Showing {filteredStudents.length}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Active Courses
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {courses?.filter(c => c.status === 'active').length || 0}
          </Typography>
        </Box>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Sections
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {courses?.reduce((sum, c) => sum + (c.sections?.length || 0), 0) || 0}
          </Typography>
        </Box>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            At Risk Students
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#f44336' }}>
            {allStudents.filter(s => (s.attendanceRate || 0) < 75).length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Below 75% attendance
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        border: '1px solid #e0e0e0', 
        borderRadius: 1,
        bgcolor: '#fafafa'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Filters
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <TextField
            select
            size="small"
            label="Course"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="all">All Courses</MenuItem>
            {uniqueCourses.map(course => (
              <MenuItem key={course.id} value={course.id}>
                {course.code} - {course.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Section"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="all">All Sections</MenuItem>
            {uniqueSections.map(section => (
              <MenuItem key={section} value={section}>
                {section}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Program"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="all">All Programs</MenuItem>
            {uniquePrograms.map(program => (
              <MenuItem key={program} value={program}>
                {program}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Attendance Status"
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="all">All Students</MenuItem>
            <MenuItem value="good">Good (≥75%)</MenuItem>
            <MenuItem value="at-risk">At Risk (&lt;75%)</MenuItem>
          </TextField>
        </Box>

        {/* Active Filters Display */}
        {(courseFilter !== 'all' || sectionFilter !== 'all' || programFilter !== 'all' || attendanceFilter !== 'all') && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Active Filters:
            </Typography>
            {courseFilter !== 'all' && (
              <Chip
                size="small"
                label={`Course: ${uniqueCourses.find(c => c.id === courseFilter)?.code}`}
                onDelete={() => setCourseFilter('all')}
              />
            )}
            {sectionFilter !== 'all' && (
              <Chip
                size="small"
                label={`Section: ${sectionFilter}`}
                onDelete={() => setSectionFilter('all')}
              />
            )}
            {programFilter !== 'all' && (
              <Chip
                size="small"
                label={`Program: ${programFilter}`}
                onDelete={() => setProgramFilter('all')}
              />
            )}
            {attendanceFilter !== 'all' && (
              <Chip
                size="small"
                label={`Attendance: ${attendanceFilter === 'good' ? 'Good' : 'At Risk'}`}
                onDelete={() => setAttendanceFilter('all')}
              />
            )}
            <Chip
              size="small"
              label="Clear All"
              onClick={() => {
                setCourseFilter('all')
                setSectionFilter('all')
                setProgramFilter('all')
                setAttendanceFilter('all')
              }}
              sx={{ bgcolor: '#000', color: 'white', '&:hover': { bgcolor: '#333' } }}
            />
          </Box>
        )}
      </Box>

      {/* Students Table */}
      <DataTable
        title="All Students"
        subtitle={`Showing ${filteredStudents.length} of ${allStudents.length} students`}
        columns={[
          {
            key: 'name',
            label: 'Student',
            render: (_value: string, student: any) => (
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
            key: 'courseName',
            label: 'Course',
            render: (_value: string, student: any) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {student.courseName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {student.courseCode}
                </Typography>
              </Box>
            )
          },
          {
            key: 'section',
            label: 'Section & Program',
            render: (_value: string, student: any) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {student.section}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {student.program}
                </Typography>
              </Box>
            )
          },
          {
            key: 'email',
            label: 'Email',
            render: (_value: string, student: any) => (
              <Typography variant="body2">
                {student.email}
              </Typography>
            )
          },
          {
            key: 'attendanceRate',
            label: 'Attendance',
            render: (_value: string, student: any) => {
              const rate = student.attendanceRate || 0
              return (
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: rate < 50 ? '#f44336' : rate < 75 ? '#ff9800' : '#4caf50'
                    }}
                  >
                    {student.attendanceRate !== undefined ? `${rate}%` : 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {student.sessionsAttended || 0}/{student.totalSessions || 0}
                  </Typography>
                </Box>
              )
            }
          },
          {
            key: 'enrollmentDate',
            label: 'Enrolled',
            render: (_value: string, student: any) => (
              <Typography variant="body2">
                {student.enrollmentDate}
              </Typography>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (_value: string, student: any) => (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: student.status === 'active' ? '#e8f5e9' : '#ffebee',
                  display: 'inline-block'
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    color: student.status === 'active' ? '#2e7d32' : '#c62828'
                  }}
                >
                  {student.status}
                </Typography>
              </Box>
            )
          }
        ]}
        data={filteredStudents}
      />
    </Box>
  )
})

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
  officeLocation?: string
  officeHours?: string
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
      attendanceRate?: number
      sessionsAttended?: number
      totalSessions?: number
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
                label: "Office Location",
                value: details.officeLocation || "Not assigned",
                icon: BuildingOfficeIcon
              },
              {
                label: "Office Hours",
                value: details.officeHours || "Not set",
                icon: ClockIcon
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
      content: <StudentsTabContent courses={details.courses || []} />
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
      content: <AttendanceManagementTab details={details} />
    }
  ]

  return { tabs }
}
