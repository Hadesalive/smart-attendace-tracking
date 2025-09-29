/**
 * ADMIN USER DETAILS PAGE
 * @author Alpha Amadu Bah
 * @version 1.0.0
 * @lastUpdated 2024-01-23
 */

"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Box, Typography, Button } from "@mui/material"
import { useAuth, useAcademicStructure, useCourses, useAttendance } from "@/lib/domains"
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
  DocumentTextIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
  last_login_at?: string
  created_at?: string
  full_name?: string
}

interface StudentDetails {
  // User Information
  role: string
  department: string
  lastLogin: string
  joinedDate: string
  bio: string
  phone: string
  studentId: string
  sectionDisplay: string
  
  // Academic Information
  year: number
  major: string
  program: string
  programCode: string
  degreeType: string
  gpa: number
  totalCredits: number
  completedCourses: number
  attendanceRate: number
  assignmentsSubmitted: number
  assignmentsPending: number
  courses: Array<{
    id: string
    name: string
    code: string
    credits: number
    semester: string
    year: number
    status: 'active' | 'completed' | 'upcoming'
  }>
  recentGrades: Array<{
    course: string
    grade: string
    points: number
    maxPoints: number
    date: string
  }>
  upcomingAssignments: Array<{
    title: string
    course: string
    dueDate: string
    status: 'pending' | 'submitted' | 'late'
  }>
  attendanceHistory: Array<{
    course: string
    session: string
    date: string
    status: 'present' | 'absent' | 'late'
  }>
}

interface LecturerDetails {
  // User Information
  role: string
  department: string
  lastLogin: string
  joinedDate: string
  bio: string
  phone: string
  employeeId: string
  
  // Professional Information
  specialization: string
  yearsExperience: number
  position: string
  hireDate: string
  researchInterests: string
  qualifications: string
  totalCourses: number
  activeCourses: number
  totalStudents: number
  averageRating: number
  courses: Array<{
    id: string
    name: string
    code: string
    credits: number
    students: number
    status: 'active' | 'completed' | 'upcoming'
    sections: Array<{
      section: string
      semester: string
      academicYear: string
      program: string
      isPrimary: boolean
      teachingHours: number
    }>
    studentDetails: Array<{
      id: string
      name: string
      email: string
      studentId: string
      section: string
      enrollmentDate: string
      status: string
    }>
  }>
  recentSessions: Array<{
    id: string
    course: string
    title: string
    date: string
    attendance: number
    totalStudents: number
  }>
  upcomingSessions: Array<{
    id: string
    course: string
    title: string
    date: string
    type: 'lecture' | 'lab' | 'tutorial'
  }>
}

interface AdminDetails {
  // User Information
  role: string
  department: string
  lastLogin: string
  joinedDate: string
  bio: string
  phone: string
  adminId: string
  
  // Administrative Information
  permissions: string[]
  systemAccess: string[]
  lastSystemUpdate: string
  totalUsersManaged: number
  totalCoursesManaged: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  recentActivities: Array<{
    action: string
    target: string
    timestamp: string
    status: 'success' | 'warning' | 'error'
  }>
}

// ============================================================================
// MOCK DATA REMOVED - Using real database data only
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UserDetailsPage() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  // Data Context
  const auth = useAuth()
  const academic = useAcademicStructure()
  const courses = useCourses()
  const attendance = useAttendance()
  
  // Create unified state object
  const state = {
    ...auth.state,
    ...academic.state,
    ...courses.state,
    ...attendance.state,
    courseAssignments: courses.state.courseAssignments || [],
    lecturerAssignments: courses.state.lecturerAssignments || [],
    sectionEnrollments: academic.state.sectionEnrollments || []
  }

  const [user, setUser] = useState<User | null>(null)
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null)
  const [lecturerDetails, setLecturerDetails] = useState<LecturerDetails | null>(null)
  const [adminDetails, setAdminDetails] = useState<AdminDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

        await Promise.all([
          auth.fetchUsers(),
          academic.fetchStudentProfiles(),
          academic.fetchLecturerProfiles(),
          academic.fetchDepartments(),
          academic.fetchPrograms(),
          academic.fetchAcademicYears(),
          academic.fetchSections(),
          academic.fetchSemesters(),
          academic.fetchSectionEnrollments(),
          courses.fetchCourses(),
          courses.fetchCourseAssignments(),
          courses.fetchLecturerAssignments(),
          attendance.fetchAttendanceSessions(),
          attendance.fetchAttendanceRecords()
        ])
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Get user data from context
  const userData = useMemo(() => {
    return state.users.find(u => u.id === userId)
  }, [state.users, userId])

  // Transform user data
  const transformedUser = useMemo(() => {
    if (!userData) return null

    return {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      role: (userData.role as 'admin' | 'lecturer' | 'student') || 'student',
      status: 'active' as 'active' | 'inactive' | 'pending',
      phone: 'N/A', // Default phone
      department: 'Computer Science', // Default department
      studentId: 'N/A', // Default student ID
      employeeId: 'N/A', // Default employee ID
      joinDate: userData.created_at,
      lastLogin: new Date().toISOString(),
      bio: 'No bio available', // Default bio
      avatar: userData.profile_image_url
    }
  }, [userData])

  // Get role-specific data
  const roleSpecificData = useMemo(() => {
    if (!userData) return null

    const userRole = (userData.role as 'admin' | 'lecturer' | 'student') || 'student'

    if (userRole === 'student') {
      // Get student profile
      const studentProfile = state.studentProfiles.find(sp => sp.user_id === userData.id)
      
      // Get student enrollments
      const studentEnrollments = state.sectionEnrollments.filter(se => se.student_id === userData.id)
      
      // Get all courses for the student's program, academic year, and semester
      const studentProgramId = studentProfile?.program_id
      const studentAcademicYearId = studentProfile?.academic_year_id
      const studentSectionId = studentProfile?.section_id
      
      
      // Get all course assignments for this student's program and academic year
      const programCourseAssignments = (state.courseAssignments as any[])?.filter(ca => 
        ca.program_id === studentProgramId && 
        ca.academic_year_id === studentAcademicYearId
      ) || []
      
      
      // Get the actual courses from these assignments
      const studentCourses = programCourseAssignments.map(assignment => {
        const course = state.courses.find(c => c.id === assignment.course_id)
        // Try to get semester from assignment first, then from section
        let semester = state.semesters.find(s => s.id === assignment.semester_id)
        if (!semester && studentProfile?.section_id) {
          const section = state.sections.find(s => s.id === studentProfile.section_id)
          if (section?.semester_id) {
            semester = state.semesters.find(s => s.id === section.semester_id)
          }
        }
        
        return {
          id: course?.id || '',
          name: course?.course_name?.trim() || 'Unknown Course', // Remove trailing spaces
          code: course?.course_code || 'N/A',
          credits: course?.credits || 0,
          semester: semester?.semester_name || 'N/A',
          year: (assignment as any).year || 1,
          status: 'active' as 'active' | 'completed' | 'upcoming'
        }
      })

      // Get attendance records for this student
      const studentAttendance = state.attendanceRecords.filter(ar => 
        studentCourses.some(course => course.id === ar.session_id) // Use session_id instead
      )

      // Calculate attendance rate
      const totalSessions = studentAttendance.length
      const presentSessions = studentAttendance.filter(ar => ar.status === 'present').length
      const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0

      // Get program information from student profile
      const programName = studentProfile?.programs?.program_name || 'N/A'
      const programCode = studentProfile?.programs?.program_code || 'N/A'
      const degreeType = studentProfile?.programs?.degree_type || 'N/A'
      const departmentName = (studentProfile?.programs as any)?.departments?.department_name || 'N/A'
      const year = studentProfile?.sections?.year || 1

      // Calculate total credits from student profile or courses
      const totalCredits = studentProfile?.credits_completed || studentCourses.reduce((sum, course) => sum + course.credits, 0)

      return {
        // User Information
        role: userData.role || 'student',
        department: departmentName,
        lastLogin: (userData as any).last_login_at ? new Date((userData as any).last_login_at).toLocaleDateString() : 'N/A',
        joinedDate: (userData as any).created_at ? new Date((userData as any).created_at).toLocaleDateString() : 'N/A',
        bio: (userData as any).bio || 'No bio provided',
        phone: (userData as any).phone || 'Not provided',
        studentId: studentProfile?.student_id || 'N/A',
        sectionDisplay: `${programCode || 'N/A'} ${studentProfile?.sections?.section_code || 'N/A'}`,
        
        // Academic Information
        year: year,
        major: programName, // Use program name as major
        program: programName,
        programCode: programCode,
        degreeType: degreeType,
        gpa: studentProfile?.gpa || 0,
        totalCredits: totalCredits,
        completedCourses: studentCourses.filter(c => c.status === 'completed').length,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        assignmentsSubmitted: 0, // TODO: Calculate from assignments
        assignmentsPending: 0, // TODO: Calculate from assignments
        courses: studentCourses,
        recentGrades: [], // TODO: Implement grades
        upcomingAssignments: [], // TODO: Implement assignments
        attendanceHistory: studentAttendance.map(ar => ({
          course: 'Unknown Course', // Default course name
          session: ar.session_id,
          date: ar.marked_at,
          status: ar.status as 'present' | 'absent' | 'late'
        }))
      }
    } else if (userRole === 'lecturer') {
      // Get lecturer profile
      const lecturerProfile = state.lecturerProfiles.find(lp => lp.user_id === userData.id)
          
          // Get lecturer assignments (from lecturer_assignments table)
          const lecturerAssignments = (state.lecturerAssignments as any[])?.filter(la => 
            la.lecturer_id === userData.id
          ) || []

          console.log('🔍 Lecturer Data Debug:', {
            lecturerProfile,
            lecturerAssignments: lecturerAssignments.length,
            allLecturerAssignments: state.lecturerAssignments?.length || 0,
            userId: userData.id,
            lecturerAssignmentsData: lecturerAssignments,
            allLecturerAssignmentsData: state.lecturerAssignments,
            sectionEnrollments: state.sectionEnrollments?.length || 0,
            allSectionEnrollments: state.sectionEnrollments
          })
      
      // Get lecturer sessions
      const lecturerSessions = state.attendanceSessions.filter(session => 
        session.lecturer_id === userData.id
      )

          // Get lecturer courses from lecturer assignments
          const lecturerCourses = lecturerAssignments.map(assignment => {
            const course = state.courses.find(c => c.id === assignment.course_id)
            const section = state.sections.find(s => s.id === assignment.section_id)
            const semester = state.semesters.find(s => s.id === assignment.semester_id)
            const academicYear = state.academicYears.find(ay => ay.id === assignment.academic_year_id)
            const program = state.programs.find(p => p.id === assignment.program_id)
            
        return {
          id: course?.id || '',
              name: course?.course_name?.trim() || 'Unknown Course',
          code: course?.course_code || 'N/A',
              credits: course?.credits || 0,
              students: 0, // Will be calculated below
              status: 'active' as 'active' | 'completed' | 'upcoming',
              section: section?.section_code || 'N/A',
              semester: semester?.semester_name || 'N/A',
              academicYear: academicYear?.year_name || 'N/A',
              program: program?.program_name || 'N/A',
              isPrimary: assignment.is_primary || false,
              teachingHours: assignment.teaching_hours_per_week || 0,
              startDate: assignment.start_date || null,
              endDate: assignment.end_date || null
            }
          })

          // Get unique courses (combine by course_id)
          const uniqueCourses = lecturerCourses.reduce((acc, course) => {
            const existing = acc.find(c => c.id === course.id)
            if (existing) {
              // Combine students count
              existing.students += course.students
              // Add section info if not already present
              if (!existing.sections) existing.sections = []
              existing.sections.push({
                section: course.section,
                semester: course.semester,
                academicYear: course.academicYear,
                program: course.program,
                isPrimary: course.isPrimary,
                teachingHours: course.teachingHours
              })
            } else {
              acc.push({
                ...course,
                sections: [{
                  section: course.section,
                  semester: course.semester,
                  academicYear: course.academicYear,
                  program: course.program,
                  isPrimary: course.isPrimary,
                  teachingHours: course.teachingHours
                }]
              })
            }
            return acc
          }, [] as any[])

          // Get lecturer's assigned sections and their program/semester info
          const lecturerSections = lecturerAssignments.map(assignment => {
            const section = state.sections.find(s => s.id === assignment.section_id)
            return {
              ...assignment,
              section: section,
              programId: section?.program_id,
              semesterId: section?.semester_id,
              academicYearId: section?.academic_year_id
            }
          })

          console.log('🔍 Lecturer Sections Debug:', {
            lecturerSections: lecturerSections.map(ls => ({
              sectionId: ls.section_id,
              sectionCode: ls.section?.section_code,
              programId: ls.programId,
              semesterId: ls.semesterId,
              academicYearId: ls.academicYearId,
              courseId: ls.course_id
            }))
          })

          // Get students enrolled in the same program/semester as lecturer's sections
          const programSemesterStudents = state.studentProfiles.filter(student => {
            // Check if student is in same program/semester as any of lecturer's sections
            return lecturerSections.some(ls => 
              student.program_id === ls.programId && 
              student.academic_year_id === ls.academicYearId
            )
          })

          console.log('🔍 Program/Semester Students:', {
            totalStudents: programSemesterStudents.length,
            students: programSemesterStudents.map(s => ({
              id: s.user_id,
              studentId: s.student_id,
              programId: s.program_id,
              academicYearId: s.academic_year_id,
              sectionId: s.section_id
            }))
          })

          // Filter students by lecturer's assigned sections
          const lecturerStudents = programSemesterStudents.filter(student => {
            return lecturerSections.some(ls => ls.section_id === student.section_id)
          })

          console.log('🔍 Lecturer Students (filtered by sections):', {
            totalStudents: lecturerStudents.length,
            students: lecturerStudents.map(s => ({
              id: s.user_id,
              studentId: s.student_id,
              sectionId: s.section_id
            }))
          })

          const totalStudents = lecturerStudents.length

          // Calculate students per course and get detailed student information
          const coursesWithStudents = uniqueCourses.map(course => {
            const courseAssignments = lecturerAssignments.filter(la => la.course_id === course.id)
            const courseStudents = courseAssignments.reduce((students, assignment) => {
              // Get students in this specific section for this course
              const sectionStudents = lecturerStudents.filter(student => 
                student.section_id === assignment.section_id
              )
              
              const studentDetails = sectionStudents.map(student => {
                const user = state.users.find(u => u.id === student.user_id)
                const section = state.sections.find(s => s.id === student.section_id)
      return {
                  id: student.user_id,
                  name: user?.full_name || 'Unknown Student',
                  email: user?.email || 'No email',
                  studentId: student.student_id || 'N/A',
                  section: section?.section_code || 'N/A',
                  enrollmentDate: student.enrollment_date || 'N/A',
                  status: student.academic_status || 'active'
                }
              })
              return [...students, ...studentDetails]
            }, [] as any[])

            return {
              ...course,
              students: courseStudents.length,
              studentDetails: courseStudents
            }
          })

          // Update uniqueCourses to include studentDetails
          const finalCourses = uniqueCourses.map(course => {
            const courseStudents = lecturerAssignments
              .filter(la => la.course_id === course.id)
              .reduce((students, assignment) => {
                // Get students in this specific section for this course
                const sectionStudents = lecturerStudents.filter(student => 
                  student.section_id === assignment.section_id
                )
                
                const studentDetails = sectionStudents.map(student => {
                  const user = state.users.find(u => u.id === student.user_id)
                  const section = state.sections.find(s => s.id === student.section_id)
                  return {
                    id: student.user_id,
                    name: user?.full_name || 'Unknown Student',
                    email: user?.email || 'No email',
                    studentId: student.student_id || 'N/A',
                    section: section?.section_code || 'N/A',
                    enrollmentDate: student.enrollment_date || 'N/A',
                    status: student.academic_status || 'active'
                  }
                })
                return [...students, ...studentDetails]
              }, [] as any[])

            return {
              ...course,
              students: courseStudents.length,
              studentDetails: courseStudents
            }
          })

          console.log('🔍 Final Courses Data:', {
            finalCourses: finalCourses.length,
            coursesWithStudents: coursesWithStudents.length,
            totalStudents
          })

      // Get recent sessions with proper course names
      const recentSessions = lecturerSessions.slice(0, 5).map(session => {
        const course = state.courses.find(c => c.id === session.course_id)
        const attendanceRecords = state.attendanceRecords.filter(ar => ar.session_id === session.id)
        const presentCount = attendanceRecords.filter(ar => ar.status === 'present').length
        
        return {
          id: session.id,
          course: course?.course_name || 'Unknown Course',
          title: (session as any).title || 'Session',
          date: new Date(session.session_date).toLocaleDateString(),
          attendance: presentCount,
          totalStudents: attendanceRecords.length
        }
      })

      // Get upcoming sessions
      const upcomingSessions = lecturerSessions
          .filter(session => new Date(session.session_date) > new Date())
          .slice(0, 5)
        .map(session => {
          const course = state.courses.find(c => c.id === session.course_id)
          return {
            id: session.id,
            course: course?.course_name || 'Unknown Course',
            title: (session as any).title || 'Session',
            date: new Date(session.session_date).toLocaleDateString(),
            type: 'lecture' as 'lecture' | 'lab' | 'tutorial'
          }
        })

      // Format research interests and qualifications as strings
      const researchInterests = Array.isArray((lecturerProfile as any)?.research_interests) 
        ? (lecturerProfile as any).research_interests.join(', ')
        : (lecturerProfile as any)?.research_interests || 'Not specified'

      const qualifications = Array.isArray((lecturerProfile as any)?.qualifications)
        ? (lecturerProfile as any).qualifications.join(', ')
        : (lecturerProfile as any)?.qualifications || 'Not specified'

      return {
        // User Information
        role: userData.role || 'lecturer',
        department: (lecturerProfile as any)?.departments?.department_name || 'N/A',
        lastLogin: (userData as any).last_login_at ? new Date((userData as any).last_login_at).toLocaleDateString() : 'N/A',
        joinedDate: (userData as any).created_at ? new Date((userData as any).created_at).toLocaleDateString() : 'N/A',
        bio: (lecturerProfile as any)?.bio || (userData as any).bio || 'No bio provided',
        phone: (userData as any).phone || 'Not provided',
        employeeId: lecturerProfile?.employee_id || 'N/A',
        
        // Professional Information
        specialization: (lecturerProfile as any)?.specialization || 'General',
        yearsExperience: (lecturerProfile as any)?.years_experience || 0,
        position: (lecturerProfile as any)?.position || 'Lecturer',
        hireDate: (lecturerProfile as any)?.hire_date ? new Date((lecturerProfile as any).hire_date).toLocaleDateString() : 'N/A',
        researchInterests: researchInterests,
        qualifications: qualifications,
        totalCourses: finalCourses.length,
        activeCourses: finalCourses.filter(c => c.status === 'active').length,
        totalStudents: totalStudents,
        averageRating: 0, // Default rating - can be calculated from feedback later
        courses: finalCourses,
        recentSessions: recentSessions,
        upcomingSessions: upcomingSessions
      }
    } else if (userRole === 'admin') {
      // Get admin profile
      const adminProfile = state.adminProfiles.find(ap => ap.user_id === userData.id)
      
      // Admin-specific data
      return {
        // User Information
        role: userData.role || 'admin',
        department: (adminProfile as any)?.departments?.department_name || 'N/A',
        lastLogin: (userData as any).last_login_at ? new Date((userData as any).last_login_at).toLocaleDateString() : 'N/A',
        joinedDate: (userData as any).created_at ? new Date((userData as any).created_at).toLocaleDateString() : 'N/A',
        bio: (userData as any).bio || 'No bio provided',
        phone: (userData as any).phone || 'Not provided',
        adminId: 'ADMIN001', // Default admin ID
        
        // Administrative Information
        permissions: ['user_management', 'course_management', 'system_settings'],
        systemAccess: ['admin_panel', 'reports', 'analytics'],
        lastSystemUpdate: new Date().toISOString(),
        totalUsersManaged: state.users.length,
        totalCoursesManaged: state.courses.length,
        systemHealth: 'excellent' as 'excellent' | 'good' | 'warning' | 'critical',
        recentActivities: [] // TODO: Implement activity tracking
      }
    }

    return null
  }, [userData, state.studentProfiles, state.sectionEnrollments, state.sections, state.courses, state.attendanceRecords, state.lecturerProfiles, state.attendanceSessions, state.users, state.lecturerAssignments, state.semesters, state.academicYears, state.programs])

  // Update user when data changes
  useEffect(() => {
    if (transformedUser) {
      setUser(transformedUser)
    }
  }, [transformedUser])

  // Update role-specific data when data changes
  useEffect(() => {
    if (roleSpecificData && transformedUser) {
      if (transformedUser.role === 'student') {
        setStudentDetails(roleSpecificData as any)
      } else if (transformedUser.role === 'lecturer') {
        console.log('🔍 Setting Lecturer Details:', roleSpecificData)
        setLecturerDetails(roleSpecificData as any)
      } else if (transformedUser.role === 'admin') {
        setAdminDetails(roleSpecificData as any)
      }
    }
  }, [roleSpecificData, transformedUser])


  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading || auth.state.loading) {
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

  if (error || !user) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <ErrorAlert error={error || "User not found"} onRetry={() => window.location.reload()} />
              <Button 
          variant="contained"
          onClick={() => router.push("/admin/users")}
          sx={BUTTON_STYLES.contained}
        >
          Back to Users
              </Button>
    </Box>
  )
}

  // Get tabs based on user role
  const getTabs = () => {
    const baseTabs = [
      {
        value: "login",
        label: "Login Management",
        content: <LoginManagement user={user} />
      }
    ]

    if (user.role === 'student' && studentDetails) {
      const { tabs } = StudentTabs({ details: studentDetails })
      return [...baseTabs, ...tabs]
    } else if (user.role === 'lecturer' && lecturerDetails) {
      const { tabs } = LecturerTabs({ details: lecturerDetails, state })
      return [...baseTabs, ...tabs]
    } else if (user.role === 'admin' && adminDetails) {
      const { tabs } = AdminTabs({ details: adminDetails })
      return [...baseTabs, ...tabs]
    }
    
    return baseTabs
  }

  const tabs = getTabs()

  // Get role-specific stats cards
  const getRoleStatsCards = () => {
    if (user.role === 'student' && studentDetails) {
      return [
        { 
          title: "GPA", 
          value: studentDetails.gpa, 
          icon: TrophyIcon, 
          color: "#000000",
          subtitle: "Current GPA",
          change: "This semester"
        },
        { 
          title: "Completed Courses", 
          value: studentDetails.completedCourses, 
          icon: BookOpenIcon, 
          color: "#000000",
          subtitle: "Total courses",
          change: `${studentDetails.totalCredits} credits`
        },
        { 
          title: "Program", 
          value: studentDetails.program, 
          icon: BookOpenIcon, 
          color: "#000000",
          subtitle: studentDetails.programCode,
          change: studentDetails.degreeType
        },
        { 
          title: "Assignments", 
          value: `${studentDetails.assignmentsSubmitted}/${studentDetails.assignmentsSubmitted + studentDetails.assignmentsPending}`, 
          icon: DocumentTextIcon, 
          color: "#000000",
          subtitle: "Submitted/Pending",
          change: `${studentDetails.assignmentsPending} pending`
        }
      ]
    } else if (user.role === 'lecturer' && lecturerDetails) {
      return [
        { 
          title: "Active Courses", 
          value: lecturerDetails.activeCourses, 
          icon: BookOpenIcon, 
          color: "#000000",
          subtitle: "Currently teaching",
          change: `${lecturerDetails.totalCourses} total`
        },
        { 
          title: "Total Students", 
          value: lecturerDetails.totalStudents, 
          icon: UsersIcon, 
          color: "#000000",
          subtitle: "Students taught",
          change: "This semester"
        },
        { 
          title: "Average Rating", 
          value: lecturerDetails.averageRating, 
          icon: StarIcon, 
          color: "#000000",
          subtitle: "Student rating",
          change: "Out of 5.0"
        },
        { 
          title: "Experience", 
          value: `${lecturerDetails.yearsExperience} years`, 
          icon: ClockIcon, 
          color: "#000000",
          subtitle: "Teaching experience",
          change: "Professional"
        }
      ]
    } else if (user.role === 'admin' && adminDetails) {
      return [
        { 
          title: "Users Managed", 
          value: adminDetails.totalUsersManaged, 
          icon: UsersIcon, 
          color: "#000000",
          subtitle: "Total users",
          change: "System-wide"
        },
        { 
          title: "Courses Managed", 
          value: adminDetails.totalCoursesManaged, 
          icon: BookOpenIcon, 
          color: "#000000",
          subtitle: "Total courses",
          change: "System-wide"
        },
        { 
          title: "System Health", 
          value: adminDetails.systemHealth, 
          icon: ShieldCheckIcon, 
          color: "#000000",
          subtitle: "Current status",
          change: "Real-time"
        },
        { 
          title: "Last Update", 
          value: new Date(adminDetails.lastSystemUpdate).toLocaleDateString(), 
          icon: ClockIcon, 
          color: "#000000",
          subtitle: "System update",
          change: "Recent"
        }
      ]
    }
    return []
  }

  const roleStatsCards = getRoleStatsCards()

  // ============================================================================
  // EDIT FUNCTIONALITY
  // ============================================================================

  const handleEditUser = () => {
    setEditModalOpen(true)
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (!user) return
      
      // Update user profile in the database (both users table and role-specific profile)
      await auth.updateUserProfile(user.id, userData)
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...userData } : null)
      
      // Refresh user data
      await auth.fetchUsers()
      
      setEditModalOpen(false)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const handleExportUser = () => {
    if (!user) return
    
    // Create export data
    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        department: user.department,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
        bio: user.bio
      },
      studentDetails: studentDetails,
      lecturerDetails: lecturerDetails,
      adminDetails: adminDetails,
      exportDate: new Date().toISOString()
    }
    
    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-${user.id}-export.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDeleteUser = async () => {
    if (!user) return
    
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      try {
        await auth.deleteUser(user.id)
        // Redirect to users list after successful deletion
        router.push('/admin/users')
      } catch (error) {
        console.error('Error deleting user:', error)
        setError('Failed to delete user. Please try again.')
      }
    }
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <UserHeader 
        user={user} 
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      
      
      {/* Global Stats Cards */}
      {roleStatsCards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <StatsGrid stats={roleStatsCards} />
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <DetailTabs
          tabs={tabs}
          activeTab={tabs[tabValue]?.value || "login"}
          onTabChange={(value) => {
            const tabIndex = tabs.findIndex(tab => tab.value === value)
            setTabValue(tabIndex >= 0 ? tabIndex : 0)
          }}
        />
      </Box>

      {/* Edit User Modal */}
      <EditUserForm
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={user}
        onSave={handleSaveUser}
        departments={state.departments || []}
        programs={state.programs || []}
        academicYears={state.academicYears || []}
        semesters={state.semesters || []}
        sections={state.sections || []}
        profileData={roleSpecificData}
      />
    </Box>
  )
}