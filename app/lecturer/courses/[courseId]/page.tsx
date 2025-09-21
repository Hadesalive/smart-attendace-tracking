"use client"

import React, { useState, useEffect, useMemo } from "react"
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
  LinearProgress,
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
  PencilIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useCourses, useAttendance, useGrades, useMaterials, useAuth } from "@/lib/domains"
import { Course, Assignment, Submission, AttendanceSession } from "@/lib/types/shared"
import { mapSessionStatus, mapAttendanceStatus } from "@/lib/utils/statusMapping"

interface CourseDetailProps {
  params: {
    courseId: string
  }
}

export default function LecturerCourseDetailPage({ params }: CourseDetailProps) {
  const router = useRouter()
  const courseId = params.courseId
  
  // Data Context
  const coursesHook = useCourses()
  const attendance = useAttendance()
  const grades = useGrades()
  const materials = useMaterials()
  const auth = useAuth()
  
  // Extract state and methods
  const { state: coursesState, getCoursesByLecturer, getStudentsByCourse } = coursesHook
  const { getAttendanceSessionsByCourse, getAttendanceRecordsBySession } = attendance
  const { getAssignmentsByCourse, getSubmissionsByAssignment, getStudentGradesByCourse, calculateFinalGrade } = grades
  const { state: materialsState } = materials
  const { state: authState } = auth
  
  // Create legacy state object for compatibility
  const state = {
    ...coursesState,
    ...attendance.state,
    ...grades.state,
    materials: materialsState.materials,
    currentUser: authState.currentUser
  }

  const [activeTab, setActiveTab] = useState(0)
  const lecturerId = state.currentUser?.id || "user_2"

  // Get course details
  const course = useMemo(() => {
    return state.courses.find((c: Course) => c.id === courseId)
  }, [state.courses, courseId])

  // Check if lecturer is assigned to this course
  const isAssigned = useMemo(() => {
    return course?.lecturer_id === lecturerId
  }, [course, lecturerId])

  // Get enrolled students
  const enrolledStudents = useMemo(() => {
    return getStudentsByCourse(courseId)
  }, [getStudentsByCourse, courseId])

  // Get course assignments
  const assignments = useMemo(() => {
    return getAssignmentsByCourse(courseId)
  }, [getAssignmentsByCourse, courseId])

  // Get all submissions for assignments
  const allSubmissions = useMemo(() => {
    return assignments.flatMap(assignment => 
      getSubmissionsByAssignment(assignment.id)
    )
  }, [assignments, getSubmissionsByAssignment])

  // Get attendance sessions
  const sessions = useMemo(() => {
    return getAttendanceSessionsByCourse(courseId)
  }, [getAttendanceSessionsByCourse, courseId])

  // Get all attendance records
  const allAttendanceRecords = useMemo(() => {
    return sessions.flatMap(session => 
      getAttendanceRecordsBySession(session.id)
    )
  }, [sessions, getAttendanceRecordsBySession])

  // Get course materials
  const courseMaterials = useMemo(() => {
    return state.materials.filter((material: any) => material.course_id === courseId)
  }, [state.materials, courseId])

  // Calculate stats
  const stats = useMemo(() => {
    const totalAssignments = assignments.length
    const totalSubmissions = allSubmissions.length
    const gradedSubmissions = allSubmissions.filter(sub => sub.grade !== null).length
    const gradingProgress = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0
    
    const presentRecords = allAttendanceRecords.filter(record => {
      const mappedStatus = mapAttendanceStatus(record.status, 'lecturer')
      return mappedStatus === 'present' || mappedStatus === 'late'
    }).length
    const attendanceRate = allAttendanceRecords.length > 0 ? Math.round((presentRecords / allAttendanceRecords.length) * 100) : 0

    return { 
      enrolledStudents: enrolledStudents.length,
      totalAssignments, 
      totalSubmissions,
      gradedSubmissions,
      gradingProgress,
      attendanceRate,
      materialsCount: courseMaterials.length,
      sessionsCount: sessions.length
    }
  }, [enrolledStudents, assignments, allSubmissions, allAttendanceRecords, courseMaterials, sessions])

  // Handlers
  const handleBack = () => {
    router.push('/lecturer/courses')
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
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
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
            }}
          >
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  // Not assigned
  if (!isAssigned) {
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
            Not Assigned
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
            You are not assigned to teach this course. Contact your department head for course assignments.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{ 
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
            }}
          >
            Return to Courses
          </Button>
        </Box>
      </Box>
    )
  }

  const statsCards = [
    { 
      title: "Enrolled Students", 
      value: stats.enrolledStudents, 
      icon: UsersIcon, 
      color: "#000000",
      subtitle: "Total enrolled",
      change: "Active students"
    },
    { 
      title: "Assignments", 
      value: `${stats.gradedSubmissions}/${stats.totalSubmissions}`, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Graded",
      change: `${stats.gradingProgress}% complete`
    },
    { 
      title: "Attendance Rate", 
      value: `${stats.attendanceRate}%`, 
      icon: CalendarDaysIcon, 
      color: "#000000",
      subtitle: "Overall",
      change: `${stats.sessionsCount} sessions`
    },
    { 
      title: "Materials", 
      value: stats.materialsCount, 
      icon: DocumentTextIcon, 
      color: "#000000",
      subtitle: "Uploaded",
      change: "Course resources"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="outlined"
              startIcon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={handleBack}
              sx={{ 
                borderColor: '#000',
                color: 'hsl(var(--foreground))',
                '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
              }}
            >
              Back
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">
            {course.course_code} - {course.course_name}
          </h1>
          <p className="text-muted-foreground font-dm-sans">
            {course.credits} Credits • {course.department || 'General'} • {course.semester || 'Current Semester'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<PencilIcon className="h-4 w-4" />}
            sx={{ 
              borderColor: '#000',
              color: 'hsl(var(--foreground))',
              '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
            }}
          >
            Edit Course
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: 1
      }}>
        {statsCards.map((card, index) => (
          <Card key={index} sx={{ 
            border: '1px solid #000',
            borderRadius: 3,
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: `${card.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 1
                  }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    {card.subtitle}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ 
                color: 'hsl(var(--muted-foreground))',
                fontSize: '0.75rem'
              }}>
                {card.change}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Course Content */}
      <Card sx={{ 
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
            <Tab label="Students" />
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
                      {course.description || 'No description available for this course.'}
                    </Typography>
                    
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
                          label="Active" 
                          size="small"
                          sx={{ 
                            backgroundColor: '#00000020',
                            color: '#000000',
                            fontFamily: "DM Sans",
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<BookOpenIcon className="h-4 w-4" />}
                        onClick={() => router.push(`/lecturer/homework?course=${courseId}`)}
                        sx={{ 
                          borderColor: '#000',
                          color: 'hsl(var(--foreground))',
                          '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
                        }}
                      >
                        Manage Assignments
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CalendarDaysIcon className="h-4 w-4" />}
                        onClick={() => router.push(`/lecturer/attendance?course=${courseId}`)}
                        sx={{ 
                          borderColor: '#000',
                          color: 'hsl(var(--foreground))',
                          '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
                        }}
                      >
                        Manage Attendance
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ChartBarIcon className="h-4 w-4" />}
                        onClick={() => router.push(`/lecturer/gradebook?course=${courseId}`)}
                        sx={{ 
                          borderColor: '#000',
                          color: 'hsl(var(--foreground))',
                          '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
                        }}
                      >
                        View Gradebook
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DocumentTextIcon className="h-4 w-4" />}
                        onClick={() => router.push(`/lecturer/materials?course=${courseId}`)}
                        sx={{ 
                          borderColor: '#000',
                          color: 'hsl(var(--foreground))',
                          '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
                        }}
                      >
                        Manage Materials
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Enrolled Students
                </Typography>
                {enrolledStudents.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      No Students Enrolled
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      No students are currently enrolled in this course.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ space: 2 }}>
                    {enrolledStudents.map((student: any) => (
                      <Card key={student.id} sx={{ 
                        border: '1px solid #e5e5e5',
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40 }}>
                              {student.full_name?.charAt(0) || 'S'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 1 }}>
                                {student.full_name || 'Unknown Student'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {student.email || 'No email'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                Enrolled on {formatDate(student.enrolled_at || student.created_at)}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip 
                                label={student.status || 'Active'} 
                                size="small"
                                sx={{ 
                                  backgroundColor: '#00000020',
                                  color: '#000000',
                                  fontFamily: "DM Sans",
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
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
                    <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                      No assignments have been created for this course yet.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/lecturer/homework?course=${courseId}`)}
                      sx={{ 
                        backgroundColor: 'hsl(var(--foreground))',
                        color: 'hsl(var(--background))',
                        '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
                      }}
                    >
                      Create Assignment
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ space: 2 }}>
                    {assignments.map((assignment: Assignment) => {
                      const assignmentSubmissions = getSubmissionsByAssignment(assignment.id)
                      const gradedCount = assignmentSubmissions.filter(sub => sub.grade !== null).length
                      
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
                                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                    Submissions: {assignmentSubmissions.length}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip 
                                  label={`${gradedCount}/${assignmentSubmissions.length} Graded`} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: gradedCount === assignmentSubmissions.length ? '#00000020' : '#66666620',
                                    color: gradedCount === assignmentSubmissions.length ? '#000000' : '#666666',
                                    fontFamily: "DM Sans",
                                    fontWeight: 500
                                  }}
                                />
                              </Box>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={assignmentSubmissions.length > 0 ? (gradedCount / assignmentSubmissions.length) * 100 : 0}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'hsl(var(--muted))',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: 'hsl(var(--foreground))',
                                  borderRadius: 3,
                                }
                              }}
                            />
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
                  Attendance Sessions
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
                    <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                      No attendance sessions have been created for this course yet.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/lecturer/attendance?course=${courseId}`)}
                      sx={{ 
                        backgroundColor: 'hsl(var(--foreground))',
                        color: 'hsl(var(--background))',
                        '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
                      }}
                    >
                      Create Session
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ space: 2 }}>
                    {sessions.map((session: AttendanceSession) => {
                      const records = getAttendanceRecordsBySession(session.id)
                      const presentCount = records.filter(record => {
                        const mappedStatus = mapAttendanceStatus(record.status, 'lecturer')
                        return mappedStatus === 'present' || mappedStatus === 'late'
                      }).length
                      const attendanceRate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0
                      
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
                                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                  {presentCount}/{records.length} students present ({attendanceRate}%)
                                </Typography>
                              </Box>
                              <Chip 
                                label={mapSessionStatus(session.status, 'lecturer')} 
                                size="small"
                                sx={{ 
                                  backgroundColor: session.status === 'active' ? '#00000020' : '#66666620',
                                  color: session.status === 'active' ? '#000000' : '#666666',
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

            {activeTab === 4 && (
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
                    <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                      No course materials have been uploaded yet.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/lecturer/materials?course=${courseId}`)}
                      sx={{ 
                        backgroundColor: 'hsl(var(--foreground))',
                        color: 'hsl(var(--background))',
                        '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
                      }}
                    >
                      Upload Material
                    </Button>
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
    </div>
  )
}
