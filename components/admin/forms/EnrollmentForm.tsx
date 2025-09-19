"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Enrollment {
  id?: string
  student_id: string
  section_id: string
  academic_year_id: string
  semester_id: string
  enrollment_date: string
  status: 'active' | 'dropped' | 'completed'
  grade?: string
  notes?: string
}

interface EnrollmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment?: Enrollment | null
  mode: 'create' | 'edit'
  onSave: (enrollment: Enrollment) => Promise<void>
  students?: any[]
  sections?: any[]
  academicYears?: any[]
  semesters?: any[]
}

export default function EnrollmentForm({
  open,
  onOpenChange,
  enrollment,
  mode,
  onSave,
  students = [],
  sections = [],
  academicYears = [],
  semesters = []
}: EnrollmentFormProps) {
  const [formData, setFormData] = useState<Enrollment>({
    student_id: '',
    section_id: '',
    academic_year_id: '',
    semester_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    grade: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when enrollment prop changes
  useEffect(() => {
    if (enrollment && mode === 'edit') {
      setFormData(enrollment)
    } else {
      setFormData({
        student_id: '',
        section_id: '',
        academic_year_id: '',
        semester_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        grade: '',
        notes: ''
      })
    }
    setErrors({})
  }, [enrollment, mode, open])

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

    if (!formData.student_id) {
      newErrors.student_id = 'Student is required'
    }

    if (!formData.section_id) {
      newErrors.section_id = 'Section is required'
    }

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = 'Academic year is required'
    }

    if (!formData.semester_id) {
      newErrors.semester_id = 'Semester is required'
    }

    if (!formData.enrollment_date) {
      newErrors.enrollment_date = 'Enrollment date is required'
    }

    if (formData.grade && !['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'].includes(formData.grade)) {
      newErrors.grade = 'Invalid grade format'
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
      console.error('Error saving enrollment:', error)
      setErrors({ submit: 'Failed to save enrollment. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Filter students by role
  const availableStudents = students.filter(student => student.role === 'student')

  // Filter sections based on selected academic year and semester
  const filteredSections = sections.filter(section => 
    section.academic_year_id === formData.academic_year_id &&
    section.semester_id === formData.semester_id
  )

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Enroll Student in Section' : 'Edit Enrollment'}
      description={mode === 'create' 
        ? 'Enroll a student in a specific section' 
        : 'Update the enrollment information'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Student Selection */}
          <div>
            <label htmlFor="student_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Student *
            </label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.student_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.email})
                </option>
              ))}
            </select>
            {errors.student_id && (
              <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
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

          {/* Section */}
          <div>
            <label htmlFor="section_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Section *
            </label>
            <select
              id="section_id"
              name="section_id"
              value={formData.section_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.section_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading || !formData.academic_year_id || !formData.semester_id}
            >
              <option value="">Select Section</option>
              {filteredSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.section_code} - {section.program?.program_name} (Year {section.year})
                </option>
              ))}
            </select>
            {errors.section_id && (
              <p className="mt-1 text-sm text-red-600">{errors.section_id}</p>
            )}
          </div>

          {/* Enrollment Date */}
          <div>
            <label htmlFor="enrollment_date" className="block text-sm font-semibold mb-2 text-gray-900">
              Enrollment Date *
            </label>
            <input
              id="enrollment_date"
              name="enrollment_date"
              type="date"
              value={formData.enrollment_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.enrollment_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            />
            {errors.enrollment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.enrollment_date}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold mb-2 text-gray-900">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="dropped">Dropped</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Grade (for completed enrollments) */}
          {formData.status === 'completed' && (
            <div>
              <label htmlFor="grade" className="block text-sm font-semibold mb-2 text-gray-900">
                Grade
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.grade ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                disabled={loading}
              >
                <option value="">
                  No grade assigned
                </option>
                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.grade && (
                <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold mb-2 text-gray-900">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about this enrollment"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
              disabled={loading}
            />
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
              {loading ? 'Saving...' : mode === 'create' ? 'Enroll Student' : 'Update Enrollment'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}