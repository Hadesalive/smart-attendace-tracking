"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Divider
} from "@mui/material"
import { 
  AcademicCapIcon, 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

export default function HomeworkPage() {
  // Mock data - replace with actual data fetching
  const assignments = [
    {
      id: "1",
      title: "Data Structures Implementation",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      dueDate: "2024-01-25",
      totalPoints: 100,
      submittedCount: 42,
      totalStudents: 45,
      status: "active",
      description: "Implement basic data structures including arrays, linked lists, and stacks."
    },
    {
      id: "2",
      title: "Calculus Problem Set 3",
      courseCode: "MATH201",
      courseName: "Calculus II", 
      dueDate: "2024-01-22",
      totalPoints: 50,
      submittedCount: 38,
      totalStudents: 38,
      status: "completed",
      description: "Solve integration problems using various techniques."
    },
    {
      id: "3",
      title: "Research Paper Outline",
      courseCode: "ENG101",
      courseName: "English Composition",
      dueDate: "2024-01-30",
      totalPoints: 25,
      submittedCount: 0,
      totalStudents: 30,
      status: "upcoming",
      description: "Create a detailed outline for your research paper topic."
    }
  ]

  const recentSubmissions = [
    {
      id: "1",
      studentName: "John Doe",
      assignment: "Data Structures Implementation",
      courseCode: "CS101",
      submittedAt: "2024-01-20T14:30:00",
      grade: 92,
      maxGrade: 100,
      status: "graded"
    },
    {
      id: "2",
      studentName: "Jane Smith",
      assignment: "Calculus Problem Set 3", 
      courseCode: "MATH201",
      submittedAt: "2024-01-19T16:45:00",
      grade: 87,
      maxGrade: 50,
      status: "graded"
    },
    {
      id: "3",
      studentName: "Mike Johnson",
      assignment: "Data Structures Implementation",
      courseCode: "CS101", 
      submittedAt: "2024-01-21T09:15:00",
      grade: null,
      maxGrade: 100,
      status: "submitted"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      case "graded":
        return <Badge variant="default">Graded</Badge>
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSubmissionStatus = (status: string, grade: number | null) => {
    if (status === "graded" && grade !== null) {
      return grade >= 80 ? "Pass" : "Needs Review"
    }
    return status === "submitted" ? "Pending Review" : "Not Submitted"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Homework</h1>
          <p className="text-muted-foreground">Manage assignments and track student submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Assignments</p>
                <p className="text-2xl font-bold">{formatNumber(assignments.filter(a => a.status === 'active').length)}</p>
              </div>
              <AcademicCapIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due This Week</p>
                <p className="text-2xl font-bold">{formatNumber(2)}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Submission Rate</p>
                <p className="text-2xl font-bold">{formatNumber(89.5)}%</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{formatNumber(15)}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <CardDescription>{assignment.courseCode} - {assignment.courseName}</CardDescription>
                </div>
                {getStatusBadge(assignment.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Due Date</span>
                    <span className="font-medium">{formatDate(assignment.dueDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Points</span>
                    <span className="font-medium">{formatNumber(assignment.totalPoints)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Submissions</span>
                    <span className="font-medium">
                      {formatNumber(assignment.submittedCount)} / {formatNumber(assignment.totalStudents)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {formatNumber((assignment.submittedCount / assignment.totalStudents) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(assignment.submittedCount / assignment.totalStudents) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Grade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest student submissions and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.studentName}</TableCell>
                  <TableCell>{submission.assignment}</TableCell>
                  <TableCell>{submission.courseCode}</TableCell>
                  <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                  <TableCell>
                    {submission.grade !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatNumber(submission.grade)}</span>
                        <span className="text-muted-foreground">/ {formatNumber(submission.maxGrade)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                      {getSubmissionStatus(submission.status, submission.grade)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      {submission.status === 'graded' ? 'View' : 'Grade'}
                    </Button>
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