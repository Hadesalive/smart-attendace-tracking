"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import StudentDashboardLayout from "@/components/layout/student-dashboard-layout"
import { useAuth } from "@/lib/domains"
import { signOut } from "@/lib/auth"

export default function StudentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const auth = useAuth()
  const { state, loadCurrentUser } = auth
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      await loadCurrentUser()
      setLoading(false)
    }
    checkAuth()
  }, [loadCurrentUser])

  useEffect(() => {
    if (!loading && !state.currentUser) {
      router.push('/')
      return
    }
    
    if (!loading && state.currentUser && state.currentUser.role !== 'student') {
      // Redirect non-student users to their appropriate dashboard
      if (state.currentUser.role === 'admin') {
        router.push('/admin')
      } else if (state.currentUser.role === 'lecturer') {
        router.push('/lecturer')
      } else {
        router.push('/dashboard')
      }
      return
    }
  }, [loading, state.currentUser, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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

  if (!state.currentUser || state.currentUser.role !== 'student') {
    return null
  }

  return (
    <StudentDashboardLayout 
      userName={state.currentUser.full_name || "Student"} 
      onSignOut={handleSignOut}
    >
      {children}
    </StudentDashboardLayout>
  )
}


