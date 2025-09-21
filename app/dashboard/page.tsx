"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/domains"

export default function Dashboard() {
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
    
    if (!loading && state.currentUser) {
      // Redirect users to their role-specific dashboard
      if (state.currentUser.role === 'admin') {
        router.push('/admin')
      } else if (state.currentUser.role === 'lecturer') {
        router.push('/lecturer')
      } else if (state.currentUser.role === 'student') {
        router.push('/student')
      } else {
        // Unknown role, redirect to login
        router.push('/')
      }
    }
  }, [loading, state.currentUser, router])

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

  if (!state.currentUser) {
    return null
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
