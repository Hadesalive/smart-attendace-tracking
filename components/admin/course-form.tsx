"use client"

import { useEffect, useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createCourse, updateCourse } from "@/lib/actions/admin"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

type FormState = {
  type: string;
  message: string;
  errors?: {
    course_name?: string[];
    course_code?: string[];
    lecturer_id?: string[];
  };
};

const initialState: FormState = { type: 'idle', message: '', errors: undefined };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Course" : "Create Course"}
    </Button>
  )
}

export function CourseForm({ course, onFormSubmit }: { course?: any; onFormSubmit: () => void }) {
  const [lecturers, setLecturers] = useState<any[]>([])
  const isEditing = !!course

  const action = isEditing ? updateCourse : createCourse
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    async function fetchLecturers() {
      const { data, error } = await supabase.from("users").select("id, full_name").eq("role", "lecturer")
      if (error) {
        toast.error("Failed to fetch lecturers.")
      } else {
        setLecturers(data)
      }
    }
    fetchLecturers()
  }, [])

  useEffect(() => {
    if (!state) return;
    if (state.message?.startsWith("Successfully")) {
      toast.success(state.message);
      onFormSubmit();
    } else if (state.message && state.errors) {
      // This indicates a validation error message
      toast.error(state.message);
    } else if (state.message) {
      // This indicates a general error from the catch block
      toast.error(state.message);
    }
  }, [state, onFormSubmit]);

  return (
    <form action={formAction} className="space-y-4">
      {isEditing && <input type="hidden" name="courseId" value={course.id} />}
      <div>
        <Label htmlFor="courseName">Course Name</Label>
        <Input id="courseName" name="courseName" defaultValue={course?.course_name} required />
        {state.errors?.course_name && <p className="text-sm text-red-500 mt-1">{state.errors.course_name[0]}</p>}
      </div>
      <div>
        <Label htmlFor="courseCode">Course Code</Label>
        <Input id="courseCode" name="courseCode" defaultValue={course?.course_code} required />
        {state.errors?.course_code && <p className="text-sm text-red-500 mt-1">{state.errors.course_code[0]}</p>}
      </div>
      <div>
        <Label htmlFor="lecturerId">Lecturer</Label>
        <Select name="lecturerId" defaultValue={course?.lecturer_id} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a lecturer" />
          </SelectTrigger>
          <SelectContent>
            {lecturers.map((lecturer) => (
              <SelectItem key={lecturer.id} value={lecturer.id}>
                {lecturer.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.lecturer_id && <p className="text-sm text-red-500 mt-1">{state.errors.lecturer_id[0]}</p>}
      </div>
      <SubmitButton isEditing={isEditing} />
    </form>
  )
}
