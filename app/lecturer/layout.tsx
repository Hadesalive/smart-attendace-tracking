"use client"

import React from "react"
import LecturerDashboardLayout from "@/components/layout/lecturer-dashboard-layout"

export default function LecturerLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <LecturerDashboardLayout userName="Lecturer">
      {children}
    </LecturerDashboardLayout>
  )
}


