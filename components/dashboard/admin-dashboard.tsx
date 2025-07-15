"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, BookOpen, Calendar, TrendingUp, Plus, Settings } from "lucide-react"
import CourseManagement from "@/components/admin/course-management"
import EnrollmentManagement from "@/components/admin/enrollment-management"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddUserForm } from "@/components/admin/add-user-form"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalSessions: number
  attendanceRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalSessions: 0,
    attendanceRate: 0,
  })
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [isAddUserOpen, setAddUserOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Fetch stats in parallel
    const [userRes, courseRes, sessionRes, attendanceRes, completedSessionsRes] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("attendance_sessions").select("*", { count: "exact", head: true }),
      supabase.from("attendance_records").select("id", { count: "exact", head: true }),
      supabase.from("attendance_sessions").select("course_id").eq("is_active", false),
    ])

    const totalAttendanceRecords = attendanceRes.count || 0
    const completedSessions = completedSessionsRes.data || []

    let totalExpectedAttendees = 0
    if (completedSessions.length > 0) {
      const courseIds = completedSessions.map((s) => s.course_id)
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .in("course_id", courseIds)
      totalExpectedAttendees = count || 0
    }

    const attendanceRate = totalExpectedAttendees > 0
        ? parseFloat(((totalAttendanceRecords / totalExpectedAttendees) * 100).toFixed(1))
        : 0

    // Fetch recent sessions for the table
    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select(`*,
        courses(course_name, course_code),
        users(full_name)`)
      .order("created_at", { ascending: false })
      .limit(5)

    setStats({
      totalUsers: userRes.count || 0,
      totalCourses: courseRes.count || 0,
      totalSessions: sessionRes.count || 0,
      attendanceRate: attendanceRate,
    })

    setRecentSessions(sessions || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new student, lecturer, or admin to the system.
                </DialogDescription>
              </DialogHeader>
              <AddUserForm
                onFormSubmit={() => {
                  fetchDashboardData() // Refresh data after adding user
                  setAddUserOpen(false) // Close the dialog
                }}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">+3 new this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CourseManagement />
        <EnrollmentManagement />
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Sessions</CardTitle>
          <CardDescription>Latest attendance sessions across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.courses?.course_code}</div>
                      <div className="text-sm text-muted-foreground">{session.courses?.course_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{session.session_name}</TableCell>
                  <TableCell>{session.users?.full_name}</TableCell>
                  <TableCell>{new Date(session.session_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={session.is_active ? "default" : "secondary"}>
                      {session.is_active ? "Active" : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{session.attendance_method.replace("_", " ").toUpperCase()}</Badge>
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
