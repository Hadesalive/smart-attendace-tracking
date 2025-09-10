"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard-material"
import StudentDashboard from "@/components/dashboard/student-dashboard"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { getCurrentUser } from "@/lib/auth"
import { signOut } from "@/lib/auth"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

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

  return (
    <DashboardLayout userName={user.full_name} userRole={user.role}>
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "lecturer" && <LecturerDashboard userId={user.id} />}
      {user.role === "student" && <StudentDashboard userId={user.id} />}
    </DashboardLayout>
  )
}
