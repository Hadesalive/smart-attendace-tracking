"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { DialogBox } from "@/components/ui/dialog-box"
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  BookOpenIcon, 
  DocumentTextIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline"
import { useData } from "@/lib/contexts/DataContext"
import { AttendanceSession } from "@/lib/types/shared"

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lecturerId: string
  onSessionCreated: (sessionId?: string) => void
  editSession?: AttendanceSession | null
  onSessionUpdated?: (sessionId?: string) => void
}

export default function CreateSessionModal({ 
  open, 
  onOpenChange, 
  lecturerId, 
  onSessionCreated,
  editSession,
  onSessionUpdated
}: CreateSessionModalProps) {
  const { 
    state, 
    getCoursesByLecturer, 
    createAttendanceSessionSupabase,
    updateAttendanceSessionSupabase,
    fetchAttendanceSessions,
    fetchCourses
  } = useData()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [formData, setFormData] = useState({
    course_id: "",
    session_name: "",
    session_date: new Date().toISOString().split("T")[0],
    start_time: "",
    end_time: "",
    location: "",
    capacity: 50,
    description: "",
    attendance_method: "hybrid" as "qr_code" | "facial_recognition" | "hybrid"
  })

  // Update form data when editSession changes
  useEffect(() => {
    if (editSession) {
      setFormData({
        course_id: editSession.course_id,
        session_name: editSession.session_name,
        session_date: editSession.session_date,
        start_time: editSession.start_time,
        end_time: editSession.end_time,
        location: editSession.location || "",
        capacity: editSession.capacity || 50,
        description: editSession.description || "",
        attendance_method: editSession.attendance_method
      })
    } else {
      // Reset form for create mode
      setFormData({
        course_id: "",
        session_name: "",
        session_date: new Date().toISOString().split("T")[0],
        start_time: "",
        end_time: "",
        location: "",
        capacity: 50,
        description: "",
        attendance_method: "hybrid"
      })
    }
  }, [editSession])

  // Get courses for this lecturer
  const lecturerCourses = getCoursesByLecturer(lecturerId)
  
  // Fallback to all courses if no lecturer-specific courses found
  const availableCourses = lecturerCourses.length > 0 ? lecturerCourses : state.courses

  // Fetch courses when modal opens
  useEffect(() => {
    if (open && lecturerId) {
      console.log('Modal opened, lecturerId:', lecturerId)
      console.log('Current courses in state:', state.courses.length)
      console.log('All courses:', state.courses)
      console.log('Lecturer courses:', lecturerCourses.length)
      console.log('Lecturer courses details:', lecturerCourses)
      
      // Always try to fetch courses when modal opens
      console.log('Fetching courses...')
      setCoursesLoading(true)
      fetchCourses().finally(() => setCoursesLoading(false))
    }
  }, [open, lecturerId, fetchCourses])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const selectedCourse = availableCourses.find(c => c.id === formData.course_id)
      if (!selectedCourse) {
        throw new Error("Please select a course")
      }

      // Validate required fields
      if (!formData.session_name.trim()) {
        throw new Error("Session name is required")
      }
      if (!formData.session_date) {
        throw new Error("Session date is required")
      }
      if (!formData.start_time) {
        throw new Error("Start time is required")
      }
      if (!formData.end_time) {
        throw new Error("End time is required")
      }
      if (!formData.location.trim()) {
        throw new Error("Location is required")
      }

      if (editSession) {
        // Edit mode - update existing session
        console.log('Updating session:', editSession.id, 'with data:', formData)
        
        const updates = {
          session_name: formData.session_name,
          session_date: formData.session_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          attendance_method: formData.attendance_method
        }
        
        await updateAttendanceSessionSupabase(editSession.id, updates)
        
        toast.success("Session updated successfully!")
        onSessionUpdated?.(editSession.id)
        
      } else {
        // Create mode - create new session
        // Generate QR code data (URL format for external scanning)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const qrCodeData = `${baseUrl}/attend/temp_${Date.now()}`; // Will be updated with actual ID from Supabase

        const sessionData = {
          course_id: formData.course_id,
          lecturer_id: lecturerId,
          course_code: selectedCourse.course_code,
          course_name: selectedCourse.course_name,
          class_id: `class_${formData.course_id}`,
          class_name: selectedCourse.course_name,
          session_name: formData.session_name,
          session_date: formData.session_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location, // Keep for UI but won't be saved to DB
          qr_code: qrCodeData,
          is_active: true,
          attendance_method: formData.attendance_method,
          status: "scheduled" as const,
          type: "lecture" as const,
          capacity: formData.capacity,
          enrolled: 0, // Will be calculated from enrollments
          description: formData.description
        }

        console.log('Creating session with data:', sessionData)
        const newSession = await createAttendanceSessionSupabase(sessionData)
        
        // Update QR code with real session ID
        const realQrCodeData = `${baseUrl}/attend/${newSession.id}`
        await updateAttendanceSessionSupabase(newSession.id, { qr_code: realQrCodeData })
        
        toast.success("Session created successfully!")
        onSessionCreated(newSession.id)
        
        // Reset form
        setFormData({
          course_id: "",
          session_name: "",
          session_date: new Date().toISOString().split("T")[0],
          start_time: "",
          end_time: "",
          location: "",
          capacity: 50,
          description: "",
          attendance_method: "hybrid"
        })
      }
      
    } catch (error: any) {
      console.error('Error with session operation:', error)
      setError(error.message || 'Failed to process session')
      toast.error(error.message || 'Failed to process session')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = availableCourses.find(c => c.id === formData.course_id)

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={editSession ? "Edit Session" : "Create New Session"}
      description={editSession ? "Update your attendance session details" : "Set up a new attendance session for your class"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 px-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Course Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            <BookOpenIcon className="inline w-4 h-4 mr-2" />
            Course
          </label>
          <select
            value={formData.course_id}
            onChange={(e) => handleInputChange('course_id', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
            required
          >
            <option value="">Select a course</option>
            {coursesLoading ? (
              <option disabled>Loading courses...</option>
            ) : (
              availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Session Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            <DocumentTextIcon className="inline w-4 h-4 mr-2" />
            Session Name
          </label>
          <input
            type="text"
            value={formData.session_name}
            onChange={(e) => handleInputChange('session_name', e.target.value)}
            placeholder="e.g., Introduction to Programming"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              <CalendarDaysIcon className="inline w-4 h-4 mr-2" />
              Date
            </label>
            <input
              type="date"
              value={formData.session_date}
              onChange={(e) => handleInputChange('session_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              <ClockIcon className="inline w-4 h-4 mr-2" />
              Start Time
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              <ClockIcon className="inline w-4 h-4 mr-2" />
              End Time
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
            />
          </div>
        </div>

        {/* Location and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              <MapPinIcon className="inline w-4 h-4 mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Room 101, Building A"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              <UsersIcon className="inline w-4 h-4 mr-2" />
              Capacity
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              min="1"
              max="500"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
            />
          </div>
        </div>

        {/* Attendance Method */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            <QrCodeIcon className="inline w-4 h-4 mr-2" />
            Attendance Method
          </label>
          <select
            value={formData.attendance_method}
            onChange={(e) => handleInputChange('attendance_method', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
          >
            <option value="qr_code">QR Code Only</option>
            <option value="facial_recognition">Facial Recognition Only</option>
            <option value="hybrid">QR Code + Facial Recognition</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add any additional details about this session..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editSession ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              editSession ? 'Update Session' : 'Create Session'
            )}
          </button>
        </div>
      </form>
    </DialogBox>
  )
}
