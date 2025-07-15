"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { CourseForm } from "./course-form"
import { deleteCourse } from "@/lib/actions/admin"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select(`*, lecturers:users(full_name)`)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch courses.")
    } else {
      setCourses(data)
    }
  }

  const handleFormSubmit = () => {
    fetchCourses()
    setFormOpen(false)
    setSelectedCourse(null)
  }

  const handleEdit = (course: any) => {
    setSelectedCourse(course)
    setFormOpen(true)
  }

  const handleDelete = async (courseId: string) => {
    const result = await deleteCourse(courseId)
    if (result.message.startsWith("Successfully")) {
      toast.success(result.message)
      fetchCourses()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>Add, edit, or remove courses from the system.</CardDescription>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setFormOpen(isOpen)
            if (!isOpen) setSelectedCourse(null)
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCourse(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            </DialogHeader>
            <CourseForm course={selectedCourse} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Course Code</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.course_name}</TableCell>
                <TableCell>{course.course_code}</TableCell>
                <TableCell>{course.lecturers?.full_name || "N/A"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
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
                          This action cannot be undone. This will permanently delete the course and all associated enrollment and attendance data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(course.id)}>Delete</AlertDialogAction>
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
