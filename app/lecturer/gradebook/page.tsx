"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpenIcon, PlusIcon, FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

export default function GradebookPage() {
  // Mock data - replace with actual data fetching
  const courses = [
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      credits: 3,
      semester: "Fall 2024",
      totalStudents: 45,
      averageGrade: 85.2
    },
    {
      id: "2", 
      courseCode: "MATH201",
      courseName: "Calculus II",
      credits: 4,
      semester: "Fall 2024",
      totalStudents: 38,
      averageGrade: 78.5
    }
  ]

  const recentGrades = [
    {
      id: "1",
      studentName: "John Doe",
      courseCode: "CS101",
      assignment: "Midterm Exam",
      grade: 92,
      maxGrade: 100,
      date: "2024-01-15"
    },
    {
      id: "2",
      studentName: "Jane Smith", 
      courseCode: "MATH201",
      assignment: "Quiz 3",
      grade: 85,
      maxGrade: 100,
      date: "2024-01-14"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gradebook</h1>
          <p className="text-muted-foreground">Manage student grades and academic records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <BookOpenIcon className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{course.credits} credits</Badge>
              </div>
              <CardTitle className="text-lg">{course.courseCode}</CardTitle>
              <CardDescription>{course.courseName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Students</span>
                  <span className="font-medium">{formatNumber(course.totalStudents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average Grade</span>
                  <span className="font-medium">{formatNumber(course.averageGrade)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Semester</span>
                  <span className="font-medium">{course.semester}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>Latest grade entries across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.studentName}</TableCell>
                  <TableCell>{grade.courseCode}</TableCell>
                  <TableCell>{grade.assignment}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(grade.grade)}</span>
                      <span className="text-muted-foreground">/ {formatNumber(grade.maxGrade)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(grade.date)}</TableCell>
                  <TableCell>
                    <Badge variant={grade.grade >= 80 ? "default" : "secondary"}>
                      {grade.grade >= 80 ? "Pass" : "Needs Review"}
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