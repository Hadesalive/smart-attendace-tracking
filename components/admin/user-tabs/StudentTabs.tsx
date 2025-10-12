import React from "react"
import { Box, Typography } from "@mui/material"
import { KeyIcon, CalendarDaysIcon, AcademicCapIcon, BookOpenIcon, ClockIcon, TrophyIcon, CheckCircleIcon, DocumentTextIcon, UserIcon, DevicePhoneMobileIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { gradeColumns, assignmentColumns, attendanceColumns } from "@/lib/table-columns/user-columns"

// ============================================================================
// TYPES
// ============================================================================

interface StudentDetails {
  // User Information
  role: string
  department: string
  lastLogin: string
  joinedDate: string
  bio: string
  phone: string
  studentId: string
  sectionDisplay: string
  
  // Emergency Contact Information
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  
  // Academic Information
  year: number
  major: string
  program?: string
  programCode?: string
  degreeType?: string
  academicStatus?: string
  enrollmentDate?: string
  expectedGraduation?: string
  gpa: number
  totalCredits: number
  creditsCompleted?: number
  creditsRequired?: number
  completedCourses: number
  attendanceRate: number
  assignmentsSubmitted: number
  assignmentsPending: number
  courses: Array<{
    id: string
    name: string
    code: string
    credits: number
    semester: string
    year: number
    status: 'active' | 'completed' | 'upcoming'
  }>
  recentGrades: Array<{
    course: string
    grade: string
    points: number
    maxPoints: number
    date: string
  }>
  upcomingAssignments: Array<{
    title: string
    course: string
    dueDate: string
    status: 'pending' | 'submitted' | 'late'
  }>
  attendanceHistory: Array<{
    course: string
    session: string
    date: string
    status: 'present' | 'absent' | 'late'
  }>
}

interface StudentTabsProps {
  details: StudentDetails
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentTabs({ details }: StudentTabsProps) {

  const studentStatsCards = [
    { 
      title: "GPA", 
      value: details.gpa, 
      icon: TrophyIcon, 
      color: "#000000",
      subtitle: "Current GPA",
      change: "This semester"
    },
    { 
      title: "Attendance Rate", 
      value: `${details.attendanceRate}%`, 
      icon: CheckCircleIcon, 
      color: "#000000",
      subtitle: "Overall attendance",
      change: "Above average"
    },
    { 
      title: "Completed Courses", 
      value: details.completedCourses, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Total courses",
      change: `${details.totalCredits} credits`
    },
    { 
      title: "Assignments", 
      value: `${details.assignmentsSubmitted}/${details.assignmentsSubmitted + details.assignmentsPending}`, 
      icon: DocumentTextIcon, 
      color: "#000000",
      subtitle: "Submitted/Pending",
      change: `${details.assignmentsPending} pending`
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
                        bgcolor: '#f3f4f6',
                        color: '#374151',
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

          {/* Academic Information Section */}
          <InfoCard
            title="Academic Information"
            subtitle="Student academic details and enrollment information"
            items={[
              {
                label: "Student ID",
                value: (
                  <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1rem' }}>
                    {details.studentId || "N/A"}
                  </Box>
                ),
                icon: KeyIcon
              },
              {
                label: "Section",
                value: details.sectionDisplay || "N/A",
                icon: AcademicCapIcon
              },
              {
                label: "Year",
                value: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Year {details.year}
                    </Box>
                  </Box>
                ),
                icon: CalendarDaysIcon
              },
              {
                label: "Major",
                value: details.major,
                icon: AcademicCapIcon
              },
              {
                label: "Program Code",
                value: details.programCode || "N/A",
                icon: BookOpenIcon
              },
              {
                label: "Degree Type",
                value: details.degreeType || "N/A",
                icon: AcademicCapIcon
              },
              {
                label: "Academic Status",
                value: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: details.academicStatus === 'active' ? '#dcfce7' : '#fee2e2',
                        color: details.academicStatus === 'active' ? '#166534' : '#991b1b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    >
                      {details.academicStatus || 'active'}
                    </Box>
                  </Box>
                ),
                icon: CheckCircleIcon
              },
              {
                label: "Enrollment Date",
                value: details.enrollmentDate || "N/A",
                icon: CalendarDaysIcon
              },
              {
                label: "Expected Graduation",
                value: details.expectedGraduation || "N/A",
                icon: CalendarDaysIcon
              },
              {
                label: "Credits Progress",
                value: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ fontWeight: 700, color: '#059669', fontSize: '1.125rem' }}>
                      {details.creditsCompleted || 0}
                    </Box>
                    <Box component="span" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      / {details.creditsRequired || 0} credits
                    </Box>
                  </Box>
                ),
                icon: BookOpenIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />

          {/* Emergency Contact Section */}
          <InfoCard
            title="Emergency Contact"
            subtitle="Emergency contact information on file"
            items={[
              {
                label: "Contact Name",
                value: details.emergencyContactName || "N/A",
                icon: UserIcon
              },
              {
                label: "Contact Phone",
                value: details.emergencyContactPhone || "N/A",
                icon: DevicePhoneMobileIcon
              },
              {
                label: "Relationship",
                value: details.emergencyContactRelationship || "N/A",
                icon: UserIcon
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
      label: "Grades",
      value: "grades",
      content: (
        <DataTable
          title="Recent Grades"
          subtitle="Latest academic performance"
          columns={gradeColumns}
          data={details.recentGrades || []}
        />
      )
    },
    {
      label: "Assignments",
      value: "assignments",
      content: (
        <DataTable
          title="Upcoming Assignments"
          subtitle="Pending and submitted assignments"
          columns={assignmentColumns}
          data={details.upcomingAssignments || []}
        />
      )
    },
    {
      label: "Courses",
      value: "courses",
      content: (
        <DataTable
          title="Enrolled Courses"
          subtitle="Current and completed courses"
          columns={[
            {
              key: "name",
              label: "Course Name",
              render: (value: any, course: any) => (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {course.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {course.code}
                  </Typography>
                </Box>
              )
            },
            {
              key: "credits",
              label: "Credits",
              render: (value: any, course: any) => (
                <Typography variant="body2">
                  {course.credits}
                </Typography>
              )
            },
            {
              key: "semester",
              label: "Semester",
              render: (value: any, course: any) => (
                <Typography variant="body2">
                  {course.semester}
                </Typography>
              )
            },
            {
              key: "year",
              label: "Year",
              render: (value: any, course: any) => (
                <Typography variant="body2">
                  Year {course.year}
                </Typography>
              )
            },
            {
              key: "status",
              label: "Status",
              render: (value: any, course: any) => (
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: course.status === 'active' ? '#e8f5e8' : '#f5f5f5',
                    color: course.status === 'active' ? '#2e7d32' : '#666',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  {course.status}
                </Box>
              )
            }
          ]}
          data={details.courses || []}
        />
      )
    },
    {
      label: "Attendance",
      value: "attendance",
      content: (
        <DataTable
          title="Attendance History"
          subtitle="Recent attendance records"
          columns={attendanceColumns}
          data={details.attendanceHistory || []}
        />
      )
    }
  ]

  return { tabs }
}
