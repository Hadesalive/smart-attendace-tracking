"use client"

import React, { useState, useEffect, useMemo, use } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Divider
} from "@mui/material"
import { 
  ArrowLeftIcon,
  BookOpenIcon, 
  UsersIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { BUTTON_STYLES as ADMIN_BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { formatDate, formatNumber } from "@/lib/utils"
import { useCourses, useAttendance, useGrades, useMaterials, useAuth, useStudentCourses } from "@/lib/domains"
import { Course, Assignment, Submission, AttendanceSession } from "@/lib/types/shared"
import { mapSessionStatus, mapAttendanceStatus } from "@/lib/utils/statusMapping"

interface CourseDetailProps {
  params: Promise<{
    courseId: string
  }>
}

export default function StudentCourseDetailPage({ params }: CourseDetailProps) {
  const router = useRouter()
  const resolvedParams = use(params) as { courseId: string }
  const courseId = resolvedParams.courseId
  
  // Data Context
  const coursesHook = useCourses()
  const attendance = useAttendance()
  const grades = useGrades()
  const materials = useMaterials()
  const auth = useAuth()
  const studentCourses = useStudentCourses()
  
  // Extract state and methods
  const { state: coursesState, getCoursesByLecturer, getStudentsByCourse } = coursesHook
  const { getAttendanceSessionsByCourse, getAttendanceRecordsBySession } = attendance
  const { getAssignmentsByCourse, getSubmissionsByAssignment, getStudentGradesByCourse, calculateFinalGrade } = grades
  const { state: materialsState } = materials
  const { state: authState } = auth
  const { data: studentCoursesData, loading: studentCoursesLoading, error: studentCoursesError } = studentCourses
  
  // Create legacy state object for compatibility
  const state = {
    ...coursesState,
    ...attendance.state,
    ...grades.state,
    materials: materialsState.materials,
    currentUser: authState.currentUser
  }

  const [activeTab, setActiveTab] = useState(0)
  const studentId = state.currentUser?.id || "user_1"

  // Get course details - prioritize section-filtered data from useStudentCourses
  const course = useMemo(() => {
    // First try to get from studentCourses (section-filtered with instructor info)
    const studentCourse = studentCoursesData?.find(c => c.id === courseId)
    if (studentCourse) {
      return {
        ...studentCourse,
        // Map to expected Course interface
        lecturer_name: studentCourse.instructor,
        lecturer_email: 'N/A', // Will be enhanced later
        department: 'General' // Will be enhanced later
      }
    }
    
    // Fallback to regular course lookup
    return state.courses.find((c: Course) => c.id === courseId)
  }, [studentCoursesData, state.courses, courseId])

  // Check if student is enrolled - prioritize section-filtered data from useStudentCourses
  const isEnrolled = useMemo(() => {
    console.log('Enrollment check:', {
      courseId,
      studentId,
      studentCoursesDataLength: studentCoursesData?.length,
      studentCoursesIds: studentCoursesData?.map(c => c.id),
      hasCourseInStudentData: studentCoursesData?.some(course => course.id === courseId),
      legacyEnrollmentsLength: state.enrollments.length,
      legacyHasEnrollment: state.enrollments.some(enrollment => 
        enrollment.student_id === studentId && enrollment.course_id === courseId
      )
    })

    // If we have section-filtered course data, the student is enrolled
    if (studentCoursesData?.some(course => course.id === courseId)) {
      return true
    }
    
    // Fallback to legacy enrollment check
    return state.enrollments.some(enrollment => 
      enrollment.student_id === studentId && enrollment.course_id === courseId
    )
  }, [studentCoursesData, courseId, state.enrollments, studentId])

  // Get course assignments
  const assignments = useMemo(() => {
    return getAssignmentsByCourse(courseId)
  }, [getAssignmentsByCourse, courseId])

  // Get student's submissions
  const submissions = useMemo(() => {
    return assignments.map(assignment => {
      const assignmentSubmissions = getSubmissionsByAssignment(assignment.id)
      return assignmentSubmissions.find(sub => sub.student_id === studentId)
    }).filter(Boolean)
  }, [assignments, getSubmissionsByAssignment, studentId])

  // Get attendance sessions
  const sessions = useMemo(() => {
    return getAttendanceSessionsByCourse(courseId)
  }, [getAttendanceSessionsByCourse, courseId])

  // Get attendance records
  const attendanceRecords = useMemo(() => {
    return sessions.map(session => {
      const records = getAttendanceRecordsBySession(session.id)
      return records.find(record => record.student_id === studentId)
    }).filter(Boolean)
  }, [sessions, getAttendanceRecordsBySession, studentId])

  // Get course materials
  const courseMaterials = useMemo(() => {
    return state.materials.filter((material: any) => material.course_id === courseId)
  }, [state.materials, courseId])

  // Calculate stats - prioritize section-filtered data from useStudentCourses
  const stats = useMemo(() => {
    // Get section-filtered course data
    const studentCourse = studentCoursesData?.find(c => c.id === courseId)
    
    if (studentCourse) {
      // Use pre-calculated stats from useStudentCourses
      return {
        submittedAssignments: studentCourse.submittedAssignments,
        totalAssignments: studentCourse.totalAssignments,
        progress: studentCourse.progress,
        attendanceRate: studentCourse.attendanceRate,
        averageGrade: studentCourse.averageGrade,
        materialsCount: studentCourse.materialsCount,
        sessionsCount: sessions.length // Keep local calculation for sessions
      }
    }
    
    // Fallback to manual calculation if section-filtered data not available
    const submittedAssignments = submissions.length
    const totalAssignments = assignments.length
    const progress = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0
    
    const presentSessions = attendanceRecords.filter(record => {
      const mappedStatus = record ? mapAttendanceStatus(record.status, 'student') : 'absent'
      return mappedStatus === 'present' || mappedStatus === 'late'
    }).length
    const attendanceRate = sessions.length > 0 ? Math.round((presentSessions / sessions.length) * 100) : 0
    
    const grades = getStudentGradesByCourse(studentId, courseId)
    const averageGrade = grades.length > 0 ? Math.round(calculateFinalGrade(studentId, courseId)) : 0

    return { 
      submittedAssignments, 
      totalAssignments, 
      progress, 
      attendanceRate, 
      averageGrade,
      materialsCount: courseMaterials.length,
      sessionsCount: sessions.length
    }
  }, [studentCoursesData, courseId, submissions, assignments, attendanceRecords, sessions, getStudentGradesByCourse, calculateFinalGrade, studentId, courseMaterials])

  // Handlers
  const handleBack = () => {
    router.push('/student/courses')
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Loading state
  if (studentCoursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (studentCoursesError && !course) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '2px dashed #e5e5e5',
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            Error Loading Course
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            {studentCoursesError}
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              ...ADMIN_BUTTON_STYLES.primary,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none'
            }}
          >
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  // Course not found
  if (!course) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '2px dashed #e5e5e5',
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            Course Not Found
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            The course you're looking for doesn't exist or you don't have access to it.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              ...ADMIN_BUTTON_STYLES.primary,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none'
            }}
          >
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  // Not enrolled
  if (!isEnrolled) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '2px dashed #e5e5e5',
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            Course Access Restricted
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            You are not enrolled in this course or it's not assigned to your section. 
            This could be because:
          </Typography>
          <Box sx={{ textAlign: 'left', mb: 3, maxWidth: '400px', mx: 'auto' }}>
            <ul style={{ color: '#888', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <li>The course hasn't been assigned to your section yet</li>
              <li>You're not enrolled in the required program/semester</li>
              <li>Your section enrollment needs to be updated</li>
              <li>The course is not available for your academic year</li>
            </ul>
          </Box>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            Contact your academic advisor or course coordinator for assistance.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              ...ADMIN_BUTTON_STYLES.primary,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none'
            }}
          >
            Return to My Courses
          </Button>
        </Box>
      </Box>
    )
  }

  const statsCards = [
    { 
      title: "Assignments", 
      value: `${stats.submittedAssignments}/${stats.totalAssignments}`, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Submitted",
      change: `${stats.progress}% complete`
    },
    { 
      title: "Attendance", 
      value: `${stats.attendanceRate}%`, 
      icon: CalendarDaysIcon, 
      color: "#000000",
      subtitle: "Present",
      change: `${stats.sessionsCount} sessions`
    },
    { 
      title: "Average Grade", 
      value: `${stats.averageGrade}%`, 
      icon: ChartBarIcon, 
      color: "#000000",
      subtitle: "Overall",
      change: "Current grade"
    },
    { 
      title: "Materials", 
      value: stats.materialsCount, 
      icon: DocumentTextIcon, 
      color: "#000000",
      subtitle: "Available",
      change: "Course resources"
    }
  ]

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={`${course.course_code} - ${course.course_name}`}
        subtitle={`${course.credits} Credits • ${(course as any).department || 'General'} • ${(course as any).semesterLabel || 'Current Semester'}`}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={handleBack}
            sx={{
              ...ADMIN_BUTTON_STYLES.outlined,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none'
            }}
          >
            Back to Courses
          </Button>
        }
      />

      <StatsGrid stats={statsCards} />

      {/* Course Content */}
      <Card sx={{ 
        mt: 3,
        border: '1px solid #000',
        borderRadius: 3,
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              px: 3,
              pt: 2
            }}
          >
            <Tab label="Course Information" />
            <Tab label="Assignments" />
            <Tab label="Attendance" />
            <Tab label="Materials" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box sx={{ space: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Course Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {(course as any).description || 'No description available for this course.'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Instructor (Section-Specific)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ width: 40, height: 40, backgroundColor: '#000' }}>
                        {(course as any).instructor?.charAt(0) || course.lecturer_name?.charAt(0) || 'I'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(course as any).instructor || course.lecturer_name || 'To Be Assigned'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {(course as any).instructor !== 'TBA' ? 'Assigned to your section' : 'No instructor assigned yet'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Section Information */}
                    {(course as any).semesterLabel && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                          Academic Period
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(course as any).semesterLabel}
                        </Typography>
                      </Box>
                    )}

                    {/* Schedule Information */}
                    {(course as any).schedule && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                          Schedule
                        </Typography>
                        {(course as any).schedule.days && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Days: {(course as any).schedule.days.join(', ')}
                          </Typography>
                        )}
                        {(course as any).schedule.time && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Time: {(course as any).schedule.time}
                          </Typography>
                        )}
                        {(course as any).schedule.location && (
                          <Typography variant="body2">
                            Location: {(course as any).schedule.location}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Course Information
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">Course Code:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{course.course_code}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">Credits:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{course.credits}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">Department:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{course.department || 'General'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">Status:</Typography>
                        <Chip 
                          label="Enrolled" 
                          size="small"
                          sx={{ 
                            backgroundColor: '#00000020',
                            color: '#000000',
                            fontFamily: "DM Sans",
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      {(course as any).year && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body2">Year:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{(course as any).year}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">Materials:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{(course as any).materialsCount || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">Assignments:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(course as any).submittedAssignments || 0}/{(course as any).totalAssignments || 0}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Next Session */}
                    {(course as any).nextSession && (
                      <Box sx={{ mt: 3, p: 2, backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                          Next Session
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {(course as any).nextSession.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {(course as any).nextSession.date}
                          {(course as any).nextSession.time && ` • ${(course as any).nextSession.time}`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Assignments
                </Typography>
                {assignments.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      No Assignments
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      No assignments have been posted for this course yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ space: 2 }}>
                    {assignments.map((assignment: Assignment) => {
                      const submission = submissions.find(sub => sub?.assignment_id === assignment.id)
                      return (
                        <Card key={assignment.id} sx={{ 
                          border: '1px solid #e5e5e5',
                          borderRadius: 2,
                          mb: 2
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 1 }}>
                                  {assignment.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 2 }}>
                                  {assignment.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                    Due: {formatDate(assignment.due_date)}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                    Points: {assignment.total_points}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                {submission ? (
                                  <Chip 
                                    label="Submitted" 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#00000020',
                                      color: '#000000',
                                      fontFamily: "DM Sans",
                                      fontWeight: 500
                                    }}
                                  />
                                ) : (
                                  <Chip 
                                    label="Not Submitted" 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#66666620',
                                      color: '#666666',
                                      fontFamily: "DM Sans",
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                            {submission && (
                              <Box sx={{ mt: 2, p: 2, backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                  Your Submission
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                  Submitted on {formatDate(submission.submitted_at)}
                                </Typography>
                                {submission.grade && (
                                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                    Grade: {submission.grade}/{assignment.total_points}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Attendance
                </Typography>
                {sessions.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      No Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      No attendance sessions have been recorded for this course yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ space: 2 }}>
                    {sessions.map((session: AttendanceSession) => {
                      const record = attendanceRecords.find(r => r?.session_id === session.id)
                      const status = record ? mapAttendanceStatus(record.status, 'student') : 'absent'
                      
                      return (
                        <Card key={session.id} sx={{ 
                          border: '1px solid #e5e5e5',
                          borderRadius: 2,
                          mb: 2
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 1 }}>
                                  {session.session_name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                  {formatDate(session.session_date)} • {session.start_time} - {session.end_time}
                                </Typography>
                              </Box>
                              <Chip 
                                label={status.charAt(0).toUpperCase() + status.slice(1)} 
                                size="small"
                                sx={{ 
                                  backgroundColor: status === 'present' ? '#00000020' : '#66666620',
                                  color: status === 'present' ? '#000000' : '#666666',
                                  fontFamily: "DM Sans",
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Course Materials
                </Typography>
                {courseMaterials.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      No Materials
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      No course materials have been uploaded yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ space: 2 }}>
                    {courseMaterials.map((material: any) => (
                      <Card key={material.id} sx={{ 
                        border: '1px solid #e5e5e5',
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DocumentTextIcon className="h-8 w-8 text-muted-foreground" />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 1 }}>
                                {material.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {material.description || 'No description available'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                Uploaded on {formatDate(material.created_at)}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ 
                                borderColor: '#000',
                                color: 'hsl(var(--foreground))',
                                '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
                              }}
                            >
                              Download
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

