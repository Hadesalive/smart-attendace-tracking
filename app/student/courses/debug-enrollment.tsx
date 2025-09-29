'use client'

import React from 'react'
import { useStudentCourses, useCourses, useAuth } from '@/lib/domains'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

export default function DebugEnrollmentPage() {
  const router = useRouter()
  const { data: studentCourses, loading, error } = useStudentCourses()
  const courses = useCourses()
  const auth = useAuth()

  const studentId = auth.state.currentUser?.id

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enrollment Debug Information</h1>
        <p className="text-muted-foreground">
          This page helps debug enrollment issues for students.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Student ID:</strong> {studentId || 'Not available'}
              </div>
              <div>
                <strong>User Role:</strong> {auth.state.currentUser?.role || 'Not available'}
              </div>
              <div>
                <strong>Full Name:</strong> {auth.state.currentUser?.full_name || 'Not available'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* useStudentCourses Hook Status */}
        <Card>
          <CardHeader>
            <CardTitle>useStudentCourses Hook Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Loading:</strong> 
                <Badge variant={loading ? "default" : "secondary"} className="ml-2">
                  {loading ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <strong>Error:</strong> 
                <Badge variant={error ? "destructive" : "secondary"} className="ml-2">
                  {error ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <strong>Courses Found:</strong> 
                <Badge variant="outline" className="ml-2">
                  {studentCourses?.length || 0}
                </Badge>
              </div>
            </div>
            
            {error && (
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Student Courses Data */}
        <Card>
          <CardHeader>
            <CardTitle>Student Courses Data</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : studentCourses && studentCourses.length > 0 ? (
              <div className="space-y-3">
                {studentCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{course.course_name}</h3>
                      <Badge variant="outline">{course.course_code}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div><strong>Course ID:</strong> {course.id}</div>
                      <div><strong>Instructor:</strong> {course.instructor}</div>
                      <div><strong>Credits:</strong> {course.credits}</div>
                      <div><strong>Semester:</strong> {course.semesterLabel || 'N/A'}</div>
                      <div><strong>Year:</strong> {course.year || 'N/A'}</div>
                      <div><strong>Status:</strong> {course.status}</div>
                    </div>
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/student/courses/${course.id}`)}
                      >
                        View Course Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No courses found. This could mean:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Student is not enrolled in any sections</li>
                    <li>No courses are assigned to the student's section</li>
                    <li>Student profile is not properly set up</li>
                    <li>Academic year/semester enrollment is missing</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Legacy Courses Data */}
        <Card>
          <CardHeader>
            <CardTitle>Legacy Courses Data (Fallback)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Total Courses:</strong> {courses.state.courses?.length || 0}
              </div>
              <div>
                <strong>Total Enrollments:</strong> {courses.state.enrollments?.length || 0}
              </div>
              <div>
                <strong>Student Enrollments:</strong> {
                  courses.state.enrollments?.filter(e => e.student_id === studentId).length || 0
                }
              </div>
            </div>
            
            {courses.state.enrollments && courses.state.enrollments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Student's Legacy Enrollments:</h4>
                <div className="space-y-2">
                  {courses.state.enrollments
                    .filter(e => e.student_id === studentId)
                    .map((enrollment, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded">
                        <div><strong>Course ID:</strong> {enrollment.course_id}</div>
                        <div><strong>Status:</strong> {enrollment.status || 'N/A'}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-x-2">
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/student/courses')}
              >
                Go to My Courses
              </Button>
              <Button 
                variant="outline" 
                onClick={() => console.log('Student Courses Data:', studentCourses)}
              >
                Log Data to Console
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
