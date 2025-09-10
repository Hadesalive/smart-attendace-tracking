"use client"

import React from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function LecturerLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout userName="Lecturer" userRole="Lecturer">
      {children}
    </DashboardLayout>
  )
}


