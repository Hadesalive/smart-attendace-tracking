"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Calendar, CheckCircle, QrCode, Camera } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import QrScannerComponent from "@/components/attendance/qr-scanner"
import { supabase } from "@/lib/supabase"

interface StudentStats {
  enrolledCourses: number
  totalSessions: number
  attendedSessions: number
  attendanceRate: number
}

export default function StudentDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    totalSessions: 0,
    attendedSessions: 0,
    attendanceRate: 0,
  })
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [isQrScannerOpen, setQrScannerOpen] = useState(false)

  useEffect(() => {
    fetchStudentData()
  }, [userId])

  const fetchStudentData = async () => {
    // Fetch enrolled courses
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses(*)
      `)
      .eq("student_id", userId)

    // Fetch recent attendance records
    const { data: attendance } = await supabase
      .from("attendance_records")
      .select(`
        *,
        attendance_sessions(
          session_name,
          session_date,
          courses(course_code, course_name)
        )
      `)
      .eq("student_id", userId)
      .order("marked_at", { ascending: false })
      .limit(10)

    // Fetch upcoming sessions for enrolled courses
    const courseIds = enrollments?.map((e) => e.course_id) || []
    const today = new Date().toISOString().split("T")[0]

    const { data: upcoming } = await supabase
      .from("attendance_sessions")
      .select(`
        *,
        courses(course_code, course_name)
      `)
      .in("course_id", courseIds)
      .gte("session_date", today)
      .eq("is_active", true)
      .order("session_date", { ascending: true })
      .limit(5)

    // Calculate stats
    const attendanceRate = attendance?.length ? (attendance.length / 20) * 100 : 0 // Simplified calculation

    setStats({
      enrolledCourses: enrollments?.length || 0,
      totalSessions: 20, // This would be calculated from actual data
      attendedSessions: attendance?.length || 0,
      attendanceRate: Math.min(attendanceRate, 100),
    })

    setEnrolledCourses(enrollments || [])
    setRecentAttendance(attendance || [])
    setUpcomingSessions(upcoming || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Dialog open={isQrScannerOpen} onOpenChange={setQrScannerOpen}>
          <DialogTrigger asChild>
            <Button>
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Attendance QR Code</DialogTitle>
              <DialogDescription>
                Point your camera at the QR code to mark your attendance.
              </DialogDescription>
            </DialogHeader>
            <QrScannerComponent
              onScanSuccess={() => {
                fetchStudentData() // Refresh data after scanning
                setQrScannerOpen(false) // Close the dialog
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attended</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendedSessions}</div>
            <p className="text-xs text-muted-foreground">Sessions attended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
            <Progress value={stats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Sessions you need to attend</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.courses?.course_code}</div>
                      <div className="text-sm text-muted-foreground">{session.courses?.course_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{session.session_name}</TableCell>
                  <TableCell>{new Date(session.session_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {session.start_time} - {session.end_time}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
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

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Courses you are enrolled in this semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{enrollment.courses?.course_code}</CardTitle>
                  <CardDescription>{enrollment.courses?.course_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="outline">{enrollment.courses?.credits} credits</Badge>
                    <span className="text-sm text-muted-foreground">{enrollment.courses?.department}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.attendance_sessions?.courses?.course_code}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.attendance_sessions?.courses?.course_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{record.attendance_sessions?.session_name}</TableCell>
                  <TableCell>{new Date(record.marked_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.method_used === "qr_code" ? "QR Code" : "Face Recognition"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Present
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
