"use client"

import { useState, useEffect, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateSessionFormProps {
  lecturerId: string
  onSessionCreated: () => void
}

const initialState = {
  type: "",
  message: "",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating..." : "Create Session"}
    </Button>
  )
}

export default function CreateSessionForm({ lecturerId, onSessionCreated }: CreateSessionFormProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [state, formAction] = useFormState(createSession, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("courses").select("id, course_name, course_code").eq("lecturer_id", lecturerId)
      setCourses(data || [])
    }
    fetchCourses()
  }, [lecturerId])

  useEffect(() => {
    if (state.type === "success") {
      toast.success(state.message)
      onSessionCreated()
      formRef.current?.reset()
    } else if (state.type === "error") {
      toast.error(state.message)
    }
  }, [state, onSessionCreated])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="lecturer_id" value={lecturerId} />

      <div className="space-y-2">
        <Label htmlFor="course_id">Course</Label>
        <Select name="course_id" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session_name">Session Name</Label>
        <Input id="session_name" name="session_name" placeholder="e.g., Week 5 - Midterm Review" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="session_date">Date</Label>
          <Input id="session_date" name="session_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input id="start_time" name="start_time" type="time" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input id="end_time" name="end_time" type="time" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendance_method">Attendance Method</Label>
        <Select name="attendance_method" defaultValue="hybrid">
          <SelectTrigger>
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hybrid">Hybrid (QR & Face)</SelectItem>
            <SelectItem value="qr_code">QR Code Only</SelectItem>
            <SelectItem value="facial_recognition">Facial Recognition Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SubmitButton />
    </form>
  )
}
