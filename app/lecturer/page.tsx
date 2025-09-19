"use client"

import React from "react"
import { useData } from "@/lib/contexts/DataContext"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard-material"

export default function LecturerDashboardPage() {
  const { state } = useData()
  
  // Use real user ID from authentication context
  const userId = state.currentUser?.id || "lecturer-1"
  
  return <LecturerDashboard userId={userId} />
}
