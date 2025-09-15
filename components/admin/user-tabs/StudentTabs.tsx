import React from "react"
import { Box } from "@mui/material"
import { KeyIcon, CalendarDaysIcon, AcademicCapIcon, BookOpenIcon, ClockIcon, TrophyIcon, CheckCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { gradeColumns, assignmentColumns, attendanceColumns } from "@/lib/table-columns/user-columns"

// ============================================================================
// TYPES
// ============================================================================

interface StudentDetails {
  studentId: string
  year: number
  major: string
  gpa: number
  totalCredits: number
  completedCourses: number
  attendanceRate: number
  assignmentsSubmitted: number
  assignmentsPending: number
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
        <Box>
          <InfoCard
            title="Academic Information"
            items={[
              {
                label: "Student ID",
                value: details.studentId,
                icon: KeyIcon
              },
              {
                label: "Year",
                value: `Year ${details.year}`,
                icon: CalendarDaysIcon
              },
              {
                label: "Major",
                value: details.major,
                icon: AcademicCapIcon
              },
              {
                label: "Total Credits",
                value: details.totalCredits.toString(),
                icon: BookOpenIcon
              }
            ]}
            columns={3}
            showDivider={false}
          />
          <StatsGrid stats={studentStatsCards} />
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
          data={details.recentGrades}
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
          data={details.upcomingAssignments}
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
          data={details.attendanceHistory}
        />
      )
    }
  ]

  return { tabs }
}
