import React from "react"
import { Box } from "@mui/material"
import { KeyIcon, AcademicCapIcon, BookOpenIcon, ClockIcon, UsersIcon, StarIcon } from "@heroicons/react/24/outline"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { courseColumns, sessionColumns, upcomingSessionColumns } from "@/lib/table-columns/user-columns"

// ============================================================================
// TYPES
// ============================================================================

interface LecturerDetails {
  employeeId: string
  department: string
  specialization: string
  yearsExperience: number
  totalCourses: number
  activeCourses: number
  totalStudents: number
  averageRating: number
  courses: Array<{
    id: string
    name: string
    code: string
    students: number
    status: 'active' | 'completed' | 'upcoming'
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
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LecturerTabs({ details }: LecturerTabsProps) {
  const lecturerStatsCards = [
    { 
      title: "Active Courses", 
      value: details.activeCourses, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Currently teaching",
      change: `${details.totalCourses} total`
    },
    { 
      title: "Total Students", 
      value: details.totalStudents, 
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
        <Box>
          <InfoCard
            title="Professional Information"
            items={[
              {
                label: "Employee ID",
                value: details.employeeId,
                icon: KeyIcon
              },
              {
                label: "Department",
                value: details.department,
                icon: AcademicCapIcon
              },
              {
                label: "Specialization",
                value: details.specialization,
                icon: BookOpenIcon
              },
              {
                label: "Experience",
                value: `${details.yearsExperience} years`,
                icon: ClockIcon
              }
            ]}
            columns={3}
            showDivider={false}
          />
          <StatsGrid stats={lecturerStatsCards} />
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
          data={details.courses}
        />
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
          data={details.recentSessions}
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
          data={details.upcomingSessions}
        />
      )
    }
  ]

  return { tabs }
}
