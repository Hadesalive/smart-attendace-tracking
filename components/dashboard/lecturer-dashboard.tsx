"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Calendar, Users, QrCode, Camera, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CreateSessionForm from "@/components/attendance/create-session-form"
import SessionQrCodeDialog from "@/components/attendance/session-qr-code-dialog"
import { supabase } from "@/lib/supabase"

interface LecturerStats {
  totalCourses: number
  totalStudents: number
  todaySessions: number
  averageAttendance: number
}

export default function LecturerDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<LecturerStats>({
    totalCourses: 0,
    totalStudents: 0,
    todaySessions: 0,
    averageAttendance: 0,
  })
  const [courses, setCourses] = useState<any[]>([])
  const [todaySessions, setTodaySessions] = useState<any[]>([])
  const [isCreateSessionOpen, setCreateSessionOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [isQrDialogOpen, setQrDialogOpen] = useState(false)

  useEffect(() => {
    fetchLecturerData()
  }, [userId])

  const fetchLecturerData = async () => {
    // Fetch lecturer's courses
    const { data: lecturerCourses } = await supabase
      .from("courses")
      .select(`
        *,
        enrollments(count)
      `)
      .eq("lecturer_id", userId)

    // Fetch today's sessions
    const today = new Date().toISOString().split("T")[0]
    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select(`
        *,
        courses(course_name, course_code)
      `)
      .eq("lecturer_id", userId)
      .eq("session_date", today)

    // Calculate stats
    const totalStudents = lecturerCourses?.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0) || 0

    setStats({
      totalCourses: lecturerCourses?.length || 0,
      totalStudents,
      todaySessions: sessions?.length || 0,
      averageAttendance: 78.5, // This would be calculated from actual attendance data
    })

    setCourses(lecturerCourses || [])
    setTodaySessions(sessions || [])
  }

  const startAttendanceSession = async (courseId: string) => {
    // This would create a new attendance session
    console.log("Starting attendance session for course:", courseId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
        <Dialog open={isCreateSessionOpen} onOpenChange={setCreateSessionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Attendance Session</DialogTitle>
              <DialogDescription>
                Fill in the details to start a new attendance session for one of your courses.
              </DialogDescription>
            </DialogHeader>
            <CreateSessionForm
              lecturerId={userId}
              onSessionCreated={() => {
                fetchLecturerData() // Refresh data after creation
                setCreateSessionOpen(false) // Close the dialog
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySessions}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Sessions</CardTitle>
          <CardDescription>Manage attendance for today's classes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaySessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.courses?.course_code}</div>
                      <div className="text-sm text-muted-foreground">{session.courses?.course_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{session.session_name}</TableCell>
                  <TableCell>
                    {session.start_time} - {session.end_time}
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.is_active ? "default" : "secondary"}>
                      {session.is_active ? "Active" : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSession(session)
                          setQrDialogOpen(true)
                        }}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        QR
                      </Button>
                      <Button size="sm" variant="outline">
                        <Camera className="h-4 w-4 mr-1" />
                        Face
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Courses you are teaching this semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.course_code}</CardTitle>
                  <CardDescription>{course.course_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">{course.enrollments?.length || 0} students</span>
                    <Badge variant="outline">{course.credits} credits</Badge>
                  </div>
                  <Button className="w-full" onClick={() => startAttendanceSession(course.id)}>
                    Start Attendance
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <SessionQrCodeDialog
        isOpen={isQrDialogOpen}
        onOpenChange={setQrDialogOpen}
        session={
          selectedSession
            ? {
                id: selectedSession.id,
                course_name: selectedSession.courses.course_name,
                course_code: selectedSession.courses.course_code,
              }
            : null
        }
      />
    </div>
  )
}
