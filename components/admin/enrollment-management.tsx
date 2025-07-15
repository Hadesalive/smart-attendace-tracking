"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { useFormState, useFormStatus } from "react-dom"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { createEnrollment, deleteEnrollment } from "@/lib/actions/admin"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type FormState = {
  message: string | null;
  errors: {
    studentId?: string[];
    courseId?: string[];
  } | null;
};

const initialState: FormState = { message: null, errors: null };

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? "Enrolling..." : "Enroll Student"}
    </Button>
  )
}

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [state, formAction] = useFormState(createEnrollment, initialState)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!state) return;
    if (state.message?.startsWith("Successfully")) {
      toast.success(state.message);
      fetchInitialData(); // Refresh list
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  async function fetchInitialData() {
    const [enrollmentRes, studentRes, courseRes] = await Promise.all([
      supabase.from("enrollments").select(`*, students:users(full_name), courses(course_name)`),
      supabase.from("users").select("id, full_name").eq("role", "student"),
      supabase.from("courses").select("id, course_name"),
    ])

    setEnrollments(enrollmentRes.data || [])
    setStudents(studentRes.data || [])
    setCourses(courseRes.data || [])
  }

  const handleDelete = async (enrollmentId: string) => {
    const result = await deleteEnrollment(enrollmentId)
    if (result.message.startsWith("Successfully")) {
      toast.success(result.message)
      fetchInitialData()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Management</CardTitle>
        <CardDescription>Assign students to courses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="flex items-end gap-4 p-4 border rounded-lg">
          <div className="flex-1">
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <Select name="studentId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.studentId && <p className="text-sm text-red-500 mt-1">{state.errors.studentId[0]}</p>}
          </div>
          <div className="flex-1">
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <Select name="courseId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.courseId && <p className="text-sm text-red-500 mt-1">{state.errors.courseId[0]}</p>}
          </div>
          <SubmitButton />
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.students.full_name}</TableCell>
                <TableCell>{enrollment.courses.course_name}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will unenroll the student from the course. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(enrollment.id)}>Unenroll</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
