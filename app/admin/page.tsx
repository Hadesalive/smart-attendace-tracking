"use client"

import React from "react"
import { useAuth, useCourses, useAttendance } from "@/lib/domains"
import AdminDashboardMaterial from "@/components/dashboard/admin-dashboard-material"

export default function AdminDashboardPage() {
  const auth = useAuth()
  const courses = useCourses()
  const attendance = useAttendance()

  // Create legacy state object for compatibility
  const state = {
    ...auth.state,
    ...courses.state,
    ...attendance.state
  }

  // Use real user ID from authentication context
  const userId = state.currentUser?.id || "admin-1"

  return <AdminDashboardMaterial userId={userId} />
}