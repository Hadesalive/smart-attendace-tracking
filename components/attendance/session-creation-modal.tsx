"use client"

import { useState, useEffect, useRef, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  BookOpenIcon, 
  DocumentTextIcon 
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export default function CreateSessionModal({ 
  open, 
  onOpenChange, 
  lecturerId, 
  onSessionCreated 
}: CreateSessionModalProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [state, formAction] = useActionState(createSession, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState({
    course_id: "",
    session_name: "",
    session_date: new Date().toISOString().split("T")[0],
    start_time: "",
    end_time: "",
    location: "",
    capacity: "",
    description: "",
    attendance_method: "hybrid"
  })

  useEffect(() => {
    if (open) {
      const fetchCourses = async () => {
        const { data } = await supabase.from("courses").select("id, course_name, course_code").eq("lecturer_id", lecturerId)
        setCourses(data || [])
      }
      fetchCourses()
    }
  }, [open, lecturerId])

  useEffect(() => {
    if (state.type === "success") {
      toast.success(state.message)
      onSessionCreated()
      formRef.current?.reset()
      setFormData({
        course_id: "",
        session_name: "",
        session_date: new Date().toISOString().split("T")[0],
        start_time: "",
        end_time: "",
        location: "",
        capacity: "",
        description: "",
        attendance_method: "hybrid"
      })
      onOpenChange(false)
    } else if (state.type === "error") {
      toast.error(state.message)
    }
  }, [state, onSessionCreated, onOpenChange])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedCourse = courses.find(c => c.id === formData.course_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-['Poppins']">
            Create New Session
          </DialogTitle>
          <DialogDescription className="font-['DM_Sans']">
            Set up a new class session with attendance tracking
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-6">
          <input type="hidden" name="lecturer_id" value={lecturerId} />

          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course_id" className="text-sm font-medium font-['DM_Sans']">
              Course *
            </Label>
            <Select 
              name="course_id" 
              required 
              value={formData.course_id}
              onValueChange={(value) => handleInputChange("course_id", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="h-4 w-4" />
                      <span>{course.course_code} - {course.course_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Name */}
          <div className="space-y-2">
            <Label htmlFor="session_name" className="text-sm font-medium font-['DM_Sans']">
              Session Name *
            </Label>
            <Input 
              id="session_name" 
              name="session_name" 
              placeholder="e.g., Week 5 - Midterm Review" 
              required 
              value={formData.session_name}
              onChange={(e) => handleInputChange("session_name", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_date" className="text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" />
                Date *
              </Label>
              <Input 
                id="session_date" 
                name="session_date" 
                type="date" 
                value={formData.session_date}
                onChange={(e) => handleInputChange("session_date", e.target.value)}
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Start Time *
              </Label>
              <Input 
                id="start_time" 
                name="start_time" 
                type="time" 
                required 
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                End Time *
              </Label>
              <Input 
                id="end_time" 
                name="end_time" 
                type="time" 
                required 
                value={formData.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Location and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Location *
              </Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="e.g., Room 201, Lab A" 
                required 
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Capacity
              </Label>
              <Input 
                id="capacity" 
                name="capacity" 
                type="number" 
                placeholder="50" 
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Attendance Method */}
          <div className="space-y-2">
            <Label htmlFor="attendance_method" className="text-sm font-medium font-['DM_Sans']">
              Attendance Method *
            </Label>
            <Select 
              name="attendance_method" 
              defaultValue="hybrid"
              value={formData.attendance_method}
              onValueChange={(value) => handleInputChange("attendance_method", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Hybrid</Badge>
                    QR Code + Facial Recognition
                  </div>
                </SelectItem>
                <SelectItem value="qr_code">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">QR</Badge>
                    QR Code Only
                  </div>
                </SelectItem>
                <SelectItem value="facial_recognition">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Face</Badge>
                    Facial Recognition Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Description
            </Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Optional session description or notes..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Session Preview */}
          {selectedCourse && formData.session_name && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted/50 rounded-lg border"
            >
              <h4 className="font-medium font-['Poppins'] mb-2">Session Preview</h4>
              <div className="space-y-1 text-sm text-muted-foreground font-['DM_Sans']">
                <p><strong>Course:</strong> {selectedCourse.course_code} - {selectedCourse.course_name}</p>
                <p><strong>Session:</strong> {formData.session_name}</p>
                <p><strong>Date:</strong> {formData.session_date} at {formData.start_time} - {formData.end_time}</p>
                <p><strong>Location:</strong> {formData.location}</p>
                {formData.capacity && <p><strong>Capacity:</strong> {formData.capacity} students</p>}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
