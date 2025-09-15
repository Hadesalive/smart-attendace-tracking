"use client"

import React from "react"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard-material"

export default function LecturerDashboardPage() {
  // Mock user ID - replace with actual auth
  const userId = "lecturer-1"
  
  return <LecturerDashboard userId={userId} />
}
