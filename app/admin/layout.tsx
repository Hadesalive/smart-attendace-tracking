"use client"

import React from "react"
import AdminDashboardLayout from "@/components/layout/admin-dashboard-layout"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    console.log("Signing out...")
  }

  return (
    <AdminDashboardLayout userName="Admin" onSignOut={handleSignOut}>
      {children}
    </AdminDashboardLayout>
  )
}
