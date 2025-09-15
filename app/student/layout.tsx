"use client"

import React from "react"
import StudentDashboardLayout from "@/components/layout/student-dashboard-layout"

export default function StudentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    console.log('Signing out...')
    // This would typically:
    // 1. Clear authentication tokens
    // 2. Redirect to login page
    // 3. Clear user session
  }

  return (
    <StudentDashboardLayout userName="Student" onSignOut={handleSignOut}>
      {children}
    </StudentDashboardLayout>
  )
}


