/**
 * ADMIN USER DETAILS PAGE
 * @author Alpha Amadu Bah
 * @version 2.0.0 - Refactored with data builders
 */

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Box, Typography, Button } from "@mui/material"
import { useAuth, useAcademicStructure, useCourses, useAttendance } from "@/lib/domains"
import { useErrorHandler } from "@/lib/errors/useErrorHandler"
import DetailTabs from "@/components/admin/DetailTabs"
import ErrorAlert from "@/components/admin/ErrorAlert"          
import UserHeader from "@/components/admin/user-tabs/UserHeader"
import StudentTabs from "@/components/admin/user-tabs/StudentTabs"
import LecturerTabs from "@/components/admin/user-tabs/LecturerTabs"
import AdminTabs from "@/components/admin/user-tabs/AdminTabs"
import LoginManagement from "@/components/admin/user-tabs/LoginManagement"
import StatsGrid from "@/components/admin/StatsGrid"
import EditUserForm from "@/components/admin/forms/EditUserForm"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { 
  TrophyIcon, 
  CheckCircleIcon, 
  BookOpenIcon, 
  UsersIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"

// Data builders
import { buildStudentData } from "./data/studentDataBuilder"
import { buildLecturerData } from "./data/lecturerDataBuilder"
import { buildAdminData } from "./data/adminDataBuilder"

// Types
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'lecturer' | 'student'
  status: 'active' | 'inactive' | 'pending'
  avatar?: string
  phone?: string
  department?: string
  studentId?: string
  employeeId?: string
  joinDate: string
  lastLogin: string
  bio?: string
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [lecturerDetails, setLecturerDetails] = useState<any>(null)
  const [adminDetails, setAdminDetails] = useState<any>(null)
  const [isEditOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { handleError: handleErrorUtil } = useErrorHandler()
  
  // Hooks
  const auth = useAuth()
  const academic = useAcademicStructure()
  const coursesHook = useCourses()
  const attendance = useAttendance()

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const results = await Promise.allSettled([
          auth.fetchUsers(),
          academic.fetchStudentProfiles(),
          academic.fetchLecturerProfiles(),
          academic.fetchAdminProfiles(),
          academic.fetchDepartments(),
          academic.fetchPrograms(),
          academic.fetchAcademicYears(),
          academic.fetchSections(),
          academic.fetchSemesters(),
          academic.fetchSectionEnrollments(),
          coursesHook.fetchCourses(),
          coursesHook.fetchCourseAssignments(),
          coursesHook.fetchLecturerAssignments(),
          attendance.fetchAttendanceSessions(),
          attendance.fetchAttendanceRecords()
        ])

        const failures = results.filter(r => r.status === 'rejected')
        if (failures.length > 0) {
          console.error('Failed to load some data:', failures)
          setError('Some data failed to load')
        }
      } catch (error) {
        const appError = handleErrorUtil(error, {
          context: 'UserDetailsPage',
          action: 'fetchData',
          metadata: { userId, retryCount }
        })
        setError(appError.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [retryCount])

  // Get user data
  const userData = useMemo(() => {
    return auth.state.users.find(u => u.id === userId) || null
  }, [auth.state.users, userId])

  // Transform user
  const transformedUser = useMemo(() => {
    if (!userData) return null

    let phone = 'N/A'
    let department = userData.department || 'N/A'
    let studentId = userData.student_id || 'N/A'
    let employeeId = 'N/A'
    let bio = 'No bio available'

    if (userData.role === 'student') {
      const studentProfile = academic.state.studentProfiles?.find((sp: any) => sp.user_id === userData.id)
      if (studentProfile) {
        studentId = studentProfile.student_id || studentId
        phone = studentProfile.emergency_contact_phone || phone
        const program = academic.state.programs?.find((p: any) => p.id === studentProfile.program_id)
        if (program) {
          const dept = academic.state.departments?.find((d: any) => d.id === program.department_id)
          department = dept?.department_name || department
        }
      }
    } else if (userData.role === 'lecturer') {
      const lecturerProfile = academic.state.lecturerProfiles?.find((lp: any) => lp.user_id === userData.id)
      if (lecturerProfile) {
        employeeId = lecturerProfile.employee_id || employeeId
        bio = lecturerProfile.bio || bio
        const dept = academic.state.departments?.find((d: any) => d.id === lecturerProfile.department_id)
        department = dept?.department_name || department
      }
    } else if (userData.role === 'admin') {
      const adminProfile = academic.state.adminProfiles?.find((ap: any) => ap.user_id === userData.id)
      if (adminProfile) {
        employeeId = adminProfile.employee_id || employeeId
        const dept = academic.state.departments?.find((d: any) => d.id === adminProfile.department_id)
        department = dept?.department_name || department
      }
    }

    return {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      role: (userData.role as 'admin' | 'lecturer' | 'student') || 'student',
      status: 'active' as 'active' | 'inactive' | 'pending',
      phone,
      department,
      studentId,
      employeeId,
      joinDate: userData.created_at,
      lastLogin: userData.updated_at || userData.created_at,
      bio,
      avatar: userData.profile_image_url
    }
  }, [userData, academic.state])

  // Build role-specific data
  const roleSpecificData = useMemo(() => {
    if (!userData) return null

    const contexts = { academic, coursesHook, attendance, auth }
    const userRole = userData.role as 'admin' | 'lecturer' | 'student'

    if (userRole === 'student') {
      return buildStudentData(userData, contexts)
    } else if (userRole === 'lecturer') {
      return buildLecturerData(userData, contexts)
    } else if (userRole === 'admin') {
      return buildAdminData(userData, contexts)
    }

    return null
  }, [userData, academic.state, coursesHook.state, attendance.state, auth.state])

  // Update state when data changes
  useEffect(() => {
    if (transformedUser) {
      setUser(transformedUser)
    }
  }, [transformedUser])

  useEffect(() => {
    if (roleSpecificData && transformedUser) {
      if (transformedUser.role === 'student') {
        setStudentDetails(roleSpecificData as any)
      } else if (transformedUser.role === 'lecturer') {
        setLecturerDetails(roleSpecificData as any)
      } else if (transformedUser.role === 'admin') {
        setAdminDetails(roleSpecificData as any)
      }
    }
  }, [roleSpecificData, transformedUser])

  // Get tabs
  const getTabs = () => {
    const baseTabs = [
      {
        value: "login",
        label: "Login Management",
        content: <LoginManagement user={user!} />
      }
    ]

    if (user?.role === 'student' && studentDetails) {
      const { tabs } = StudentTabs({ details: studentDetails })
      return [...baseTabs, ...tabs]
    } else if (user?.role === 'lecturer' && lecturerDetails) {
      const { tabs } = LecturerTabs({ 
        details: lecturerDetails, 
        state: {
          users: auth.state.users,
          studentProfiles: academic.state.studentProfiles,
          sectionEnrollments: academic.state.sectionEnrollments,
          sections: academic.state.sections,
          courses: coursesHook.state.courses,
          attendanceRecords: attendance.state.attendanceRecords,
          lecturerAssignments: coursesHook.state.lecturerAssignments,
          semesters: academic.state.semesters,
          academicYears: academic.state.academicYears,
          programs: academic.state.programs
        }
      })
      return [...baseTabs, ...tabs]
    } else if (user?.role === 'admin' && adminDetails) {
      const { tabs } = AdminTabs({ details: adminDetails })
      return [...baseTabs, ...tabs]
    }
    
    return baseTabs
  }

  // Get role-specific stats
  const getRoleStatsCards = () => {
    if (user?.role === 'student' && studentDetails) {
      return [
        { title: "GPA", value: studentDetails.gpa, icon: TrophyIcon, color: "#000000", subtitle: "Current GPA", change: "This semester" },
        { title: "Completed Courses", value: studentDetails.completedCourses, icon: BookOpenIcon, color: "#000000", subtitle: "Total courses", change: `${studentDetails.totalCredits} credits` },
        { title: "Program", value: studentDetails.program, icon: BookOpenIcon, color: "#000000", subtitle: studentDetails.programCode, change: studentDetails.degreeType },
        { title: "Attendance", value: `${studentDetails.attendanceRate}%`, icon: CheckCircleIcon, color: "#000000", subtitle: "Attendance rate", change: "Current semester" }
      ]
    } else if (user?.role === 'lecturer' && lecturerDetails) {
      return [
        { title: "Courses", value: lecturerDetails.totalCourses, icon: BookOpenIcon, color: "#000000", subtitle: "Total courses", change: `${lecturerDetails.activeCourses} active` },
        { title: "Students", value: lecturerDetails.totalStudents, icon: UsersIcon, color: "#000000", subtitle: "Total students", change: "Current semester" },
        { title: "Rating", value: lecturerDetails.averageRating || "N/A", icon: StarIcon, color: "#000000", subtitle: "Average rating", change: "Based on feedback" },
        { title: "Sessions", value: lecturerDetails.recentSessions?.length || 0, icon: ClockIcon, color: "#000000", subtitle: "Recent sessions", change: "This week" }
      ]
    } else if (user?.role === 'admin' && adminDetails) {
      return [
        { title: "Users Managed", value: adminDetails.totalUsersManaged, icon: UsersIcon, color: "#000000", subtitle: "Total users", change: "System-wide" },
        { title: "Courses Managed", value: adminDetails.totalCoursesManaged, icon: BookOpenIcon, color: "#000000", subtitle: "Total courses", change: "All programs" },
        { title: "System Health", value: adminDetails.systemHealth, icon: ShieldCheckIcon, color: "#000000", subtitle: "Overall status", change: "Last check" },
        { title: "Permissions", value: adminDetails.permissions?.length || 0, icon: ShieldCheckIcon, color: "#000000", subtitle: "Access levels", change: "Full access" }
      ]
    }
    return []
  }

  // Handlers
  const handleBack = () => router.push("/admin/users")
  const handleEdit = () => setEditOpen(true)
  const handleEditSubmit = async (data: any) => {
    await auth.updateUser(userId, data)
    setEditOpen(false)
    setRetryCount(prev => prev + 1)
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Typography variant="h6" sx={TYPOGRAPHY_STYLES.pageTitle}>
            Loading user details...
          </Typography>
        </Box>
      </Box>
    )
  }

  // Error state
  if (error || !user) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <ErrorAlert error={error || "User not found"} onRetry={() => setRetryCount(prev => prev + 1)} />
        <Button 
          variant="contained"
          onClick={handleBack}
          sx={BUTTON_STYLES.contained}
        >
          Back to Users
        </Button>
      </Box>
    )
  }

  const tabs = getTabs()
  const statsCards = getRoleStatsCards()

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <UserHeader
        user={user}
        onEdit={handleEdit}
      />

      {statsCards.length > 0 && <StatsGrid stats={statsCards} />}

      <Box sx={{ mt: 4 }}>
        <DetailTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Box>

      <EditUserForm
        open={isEditOpen}
        onOpenChange={setEditOpen}
        user={user}
        onSave={handleEditSubmit}
      />
    </Box>
  )
}
