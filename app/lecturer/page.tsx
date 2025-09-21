"use client"

import React from "react"
import { useAuth, useCourses, useAttendance, useGrades } from "@/lib/domains"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard-material"

export default function LecturerDashboardPage() {
  const auth = useAuth()
  const courses = useCourses()
  const attendance = useAttendance()
  const grades = useGrades()
  
  // Create legacy state object for compatibility
  const state = {
    ...auth.state,
    ...courses.state,
    ...attendance.state,
    ...grades.state
  }
  
  // Use real user ID from authentication context
  const userId = state.currentUser?.id || "lecturer-1"
  
  return <LecturerDashboard userId={userId} />
}
