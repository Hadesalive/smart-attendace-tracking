"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Course {
  id?: string
  course_code: string
  course_name: string
  credits: number
  department?: string
  lecturer_id?: string
}

interface User {
  id: string
  full_name: string
  role: string
}

interface CourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course | null
  mode: 'create' | 'edit'
  onSave: (course: Course) => Promise<void>
  departments?: any[]
  users: User[]
}

export default function CourseForm({
  open,
  onOpenChange,
  course,
  mode,
  onSave,
  departments = [],
  users
}: CourseFormProps) {
  const [formData, setFormData] = useState<Course>({
    course_code: '',
    course_name: '',
    credits: 3,
    department: '',
    lecturer_id: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Filter users to show only lecturers for course assignment
  const eligibleLecturers = users.filter(user => user.role === 'lecturer')

  // Initialize form data when course prop changes
  useEffect(() => {
    if (course && mode === 'edit') {
      setFormData({
        course_code: course.course_code || '',
        course_name: course.course_name || '',
        credits: course.credits || 3,
        department: course.department || '',
        lecturer_id: course.lecturer_id || ''
      })
    } else {
      setFormData({
        course_code: '',
        course_name: '',
        credits: 3,
        department: '',
        lecturer_id: ''
      })
    }
    setErrors({})
  }, [course, mode]) // Removed open from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.course_code.trim()) {
      newErrors.course_code = 'Course code is required'
    } else if (!/^[A-Z]{2,4}[0-9]{3,4}$/.test(formData.course_code)) {
      newErrors.course_code = 'Course code must be in format like CS101, MATH2001, ENG101'
    }

    if (!formData.course_name.trim()) {
      newErrors.course_name = 'Course name is required'
    }

    if (formData.credits < 1 || formData.credits > 6) {
      newErrors.credits = 'Credits must be between 1 and 6'
    }

    // Department is optional in the database schema

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving course:', error)
      setErrors({ submit: 'Failed to save course. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Course' : 'Edit Course'}
      description={mode === 'create' 
        ? 'Add a new course to the system' 
        : 'Update the course information'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Course Code */}
          <div>
            <label htmlFor="course_code" className="block text-sm font-semibold mb-2 text-gray-900">
              Course Code *
            </label>
            <input
              id="course_code"
              name="course_code"
              type="text"
              value={formData.course_code}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
                handleInputChange(e)
              }}
              placeholder="e.g., CS101, MATH2001"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.course_code ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition uppercase`}
              required
              disabled={loading}
            />
            {errors.course_code && (
              <p className="mt-1 text-sm text-red-600">{errors.course_code}</p>
            )}
          </div>

          {/* Course Name */}
          <div>
            <label htmlFor="course_name" className="block text-sm font-semibold mb-2 text-gray-900">
              Course Name *
            </label>
            <input
              id="course_name"
              name="course_name"
              type="text"
              value={formData.course_name}
              onChange={handleInputChange}
              placeholder="Enter course name"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.course_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            />
            {errors.course_name && (
              <p className="mt-1 text-sm text-red-600">{errors.course_name}</p>
            )}
          </div>

          {/* Credits and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="credits" className="block text-sm font-semibold mb-2 text-gray-900">
                Credits *
              </label>
              <input
                id="credits"
                name="credits"
                type="number"
                value={formData.credits}
                onChange={handleInputChange}
                min="1"
                max="6"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.credits ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
                disabled={loading}
              />
              {errors.credits && (
                <p className="mt-1 text-sm text-red-600">{errors.credits}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-semibold mb-2 text-gray-900">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                disabled={loading}
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.department_name}>
                    {dept.department_name} ({dept.department_code})
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            {/* Lecturer */}
            <div>
              <label htmlFor="lecturer_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Lecturer
              </label>
              <select
                id="lecturer_id"
                name="lecturer_id"
                value={formData.lecturer_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              >
                <option value="">Select Lecturer (Optional)</option>
                {eligibleLecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.full_name} ({lecturer.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Update Course'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}