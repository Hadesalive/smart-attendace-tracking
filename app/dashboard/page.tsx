"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard-material"
import StudentDashboard from "@/components/dashboard/student-dashboard"
import AdminDashboardLayout from "@/components/layout/admin-dashboard-layout"
import LecturerDashboardLayout from "@/components/layout/lecturer-dashboard-layout"
import StudentDashboardLayout from "@/components/layout/student-dashboard-layout"
import { getCurrentUser } from "@/lib/auth"
import { signOut } from "@/lib/auth"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  // Handle student redirect in useEffect
  useEffect(() => {
    if (user && user.role === "student" && !redirecting) {
      setRedirecting(true)
      router.push("/student")
    }
  }, [user, router, redirecting])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push("/")
    } else {
      setUser(currentUser)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show loading while redirecting students
  if (user.role === "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Redirecting to student dashboard...</p>
        </div>
      </div>
    )
  }

  // Render the appropriate layout based on user role
  if (user.role === "admin") {
    return (
      <AdminDashboardLayout userName={user.full_name}>
        <AdminDashboard />
      </AdminDashboardLayout>
    )
  }

  if (user.role === "lecturer") {
    return (
      <LecturerDashboardLayout userName={user.full_name}>
        <LecturerDashboard userId={user.id} />
      </LecturerDashboardLayout>
    )
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Invalid user role</p>
      </div>
    </div>
  )
}
