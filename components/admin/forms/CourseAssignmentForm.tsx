"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface CourseAssignment {
  id?: string
  course_id: string
  academic_year_id: string
  semester_id: string
  program_id: string
  section_id?: string
  is_mandatory: boolean
  max_students?: number
}

interface CourseAssignmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment?: CourseAssignment | null
  mode: 'create' | 'edit'
  onSave: (assignment: CourseAssignment) => Promise<void>
  courses?: any[]
  academicYears?: any[]
  semesters?: any[]
  programs?: any[]
  sections?: any[]
}

export default function CourseAssignmentForm({
  open,
  onOpenChange,
  assignment,
  mode,
  onSave,
  courses = [],
  academicYears = [],
  semesters = [],
  programs = [],
  sections = []
}: CourseAssignmentFormProps) {
  const [formData, setFormData] = useState<CourseAssignment>({
    course_id: '',
    academic_year_id: '',
    semester_id: '',
    program_id: '',
    section_id: '',
    is_mandatory: true,
    max_students: undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when assignment prop changes
  useEffect(() => {
    if (assignment && mode === 'edit') {
      setFormData(assignment)
    } else {
      setFormData({
        course_id: '',
        academic_year_id: '',
        semester_id: '',
        program_id: '',
        section_id: '',
        is_mandatory: true,
        max_students: undefined
      })
    }
    setErrors({})
  }, [assignment, mode, open])

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

    if (!formData.course_id) {
      newErrors.course_id = 'Course is required'
    }

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = 'Academic year is required'
    }

    if (!formData.semester_id) {
      newErrors.semester_id = 'Semester is required'
    }

    if (!formData.program_id) {
      newErrors.program_id = 'Program is required'
    }

    if (formData.max_students && formData.max_students < 1) {
      newErrors.max_students = 'Max students must be greater than 0'
    }

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
      console.error('Error saving course assignment:', error)
      setErrors({ submit: 'Failed to save assignment. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Filter sections based on selected program, academic year, and semester
  const filteredSections = sections.filter(section => 
    section.program_id === formData.program_id &&
    section.academic_year_id === formData.academic_year_id &&
    section.semester_id === formData.semester_id
  )

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Assign Course to Class' : 'Edit Course Assignment'}
      description={mode === 'create' 
        ? 'Assign a course to a class or section' 
        : 'Update the course assignment information'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Course Selection */}
          <div>
            <label htmlFor="course_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Course *
            </label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.course_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code || course.course_code} - {course.name || course.course_name}
                </option>
              ))}
            </select>
            {errors.course_id && (
              <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Academic Year *
            </label>
            <select
              id="academic_year_id"
              name="academic_year_id"
              value={formData.academic_year_id}
              onChange={(e) => {
                handleInputChange(e)
                // Reset dependent fields
                setFormData(prev => ({ ...prev, semester_id: '', section_id: '' }))
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.academic_year_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year_name}
                </option>
              ))}
            </select>
            {errors.academic_year_id && (
              <p className="mt-1 text-sm text-red-600">{errors.academic_year_id}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="semester_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Semester *
            </label>
            <select
              id="semester_id"
              name="semester_id"
              value={formData.semester_id}
              onChange={(e) => {
                handleInputChange(e)
                // Reset section when semester changes
                setFormData(prev => ({ ...prev, section_id: '' }))
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.semester_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading || !formData.academic_year_id}
            >
              <option value="">Select Semester</option>
              {semesters
                .filter(sem => sem.academic_year_id === formData.academic_year_id)
                .map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_name} (Semester {semester.semester_number})
                  </option>
                ))}
            </select>
            {errors.semester_id && (
              <p className="mt-1 text-sm text-red-600">{errors.semester_id}</p>
            )}
          </div>

          {/* Program */}
          <div>
            <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Program *
            </label>
            <select
              id="program_id"
              name="program_id"
              value={formData.program_id}
              onChange={(e) => {
                handleInputChange(e)
                // Reset section when program changes
                setFormData(prev => ({ ...prev, section_id: '' }))
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.program_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.program_code} - {program.program_name}
                </option>
              ))}
            </select>
            {errors.program_id && (
              <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
            )}
          </div>

          {/* Section (Optional) */}
          <div>
            <label htmlFor="section_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Section (Optional)
            </label>
            <select
              id="section_id"
              name="section_id"
              value={formData.section_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              disabled={loading || !formData.program_id || !formData.academic_year_id || !formData.semester_id}
            >
              <option value="">
                Apply to all sections
              </option>
              {filteredSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.section_code} (Year {section.year})
                </option>
              ))}
            </select>
          </div>

          {/* Max Students */}
          <div>
            <label htmlFor="max_students" className="block text-sm font-semibold mb-2 text-gray-900">
              Max Students (Optional)
            </label>
            <select
              id="max_students"
              name="max_students"
              value={formData.max_students?.toString() || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.max_students ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              disabled={loading}
            >
              <option value="">
                No limit
              </option>
              {[20, 30, 40, 50, 60, 80, 100].map(num => (
                <option key={num} value={num.toString()}>{num} students</option>
              ))}
            </select>
            {errors.max_students && (
              <p className="mt-1 text-sm text-red-600">{errors.max_students}</p>
            )}
          </div>

          {/* Mandatory Course */}
          <div className="flex items-center space-x-3">
            <input
              id="is_mandatory"
              name="is_mandatory"
              type="checkbox"
              checked={formData.is_mandatory}
              onChange={handleInputChange}
              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="is_mandatory" className="text-sm font-medium text-gray-900">
              Mandatory Course
            </label>
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
              {loading ? 'Saving...' : mode === 'create' ? 'Assign Course' : 'Update Assignment'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}