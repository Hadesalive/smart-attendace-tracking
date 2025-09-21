"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { getFilteredOptions } from '@/lib/utils/smart-defaults'

interface CourseAssignment {
  id?: string
  course_id: string
  academic_year_id: string
  semester_id: string
  program_id: string
  year: number
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
    year: 1,
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
        year: 1,
        is_mandatory: true,
        max_students: undefined
      })
    }
    setErrors({})
  }, [assignment, mode]) // Removed open from dependencies

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

    if (!formData.year || formData.year < 1 || formData.year > 4) {
      newErrors.year = 'Year level must be between 1 and 4'
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

  // Note: Course assignments now apply to ALL sections of a program/year/semester
  // No need to filter sections as the assignment applies to all sections automatically

  // Transform data for SearchableSelect
  const courseOptions = useMemo(() => {
    return courses.map(course => ({
      id: course.id,
      label: `${course.course_code || course.code} - ${course.course_name || course.name}`,
      subtitle: `${course.credits} credits`,
      group: 'Courses'
    }))
  }, [courses])

  const programOptions = useMemo(() => {
    const transformed = programs.map(program => ({
      id: program.id,
      label: `${program.program_code} - ${program.program_name}`,
      subtitle: program.department_name,
      group: 'Programs',
      department: program.department_name
    }))
    
    // Apply smart filtering based on user context
    return getFilteredOptions(transformed, 'admin') // Assuming admin context for now
  }, [programs])

  const academicYearOptions = useMemo(() => {
    return academicYears.map(year => ({
      id: year.id,
      label: year.year_name,
      subtitle: year.is_current ? 'Current Year' : '',
      group: 'Academic Years'
    }))
  }, [academicYears])

  const semesterOptions = useMemo(() => {
    return semesters.map(semester => ({
      id: semester.id,
      label: semester.semester_name,
      subtitle: `Semester ${semester.semester_number}`,
      group: 'Semesters'
    }))
  }, [semesters])

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Assign Course to Program' : 'Edit Course Assignment'}
      description={mode === 'create' 
        ? 'Assign a course to a program for a specific year and semester. This will apply to ALL sections of that program.' 
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
          <SearchableSelect
            label="Course"
            value={formData.course_id}
            onChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
            options={courseOptions}
            placeholder="Search courses..."
            required
            disabled={loading}
            error={errors.course_id}
            className="w-full"
          />

          {/* Academic Year */}
          <SearchableSelect
            label="Academic Year"
            value={formData.academic_year_id}
            onChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value, semester_id: '' }))}
            options={academicYearOptions}
            placeholder="Search academic years..."
            required
            disabled={loading}
            error={errors.academic_year_id}
            className="w-full"
          />

          {/* Semester */}
          <SearchableSelect
            label="Semester"
            value={formData.semester_id}
            onChange={(value) => setFormData(prev => ({ ...prev, semester_id: value }))}
            options={semesterOptions.filter(sem => semesters.find(s => s.id === sem.id)?.academic_year_id === formData.academic_year_id || !formData.academic_year_id)}
            placeholder="Search semesters..."
            required
            disabled={loading || !formData.academic_year_id}
            error={errors.semester_id}
            className="w-full"
          />

          {/* Program */}
          <SearchableSelect
            label="Program"
            value={formData.program_id}
            onChange={(value) => setFormData(prev => ({ ...prev, program_id: value }))}
            options={programOptions}
            placeholder="Search programs..."
            required
            disabled={loading}
            error={errors.program_id}
            className="w-full"
          />

          {/* Year Level */}
          <div>
            <label htmlFor="year" className="block text-sm font-semibold mb-2 text-gray-900">
              Year Level *
            </label>
            <select
              id="year"
              name="year"
              value={formData.year || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.year ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Year Level</option>
              <option value="1">Year 1 (First Year)</option>
              <option value="2">Year 2 (Second Year)</option>
              <option value="3">Year 3 (Third Year)</option>
              <option value="4">Year 4 (Fourth Year)</option>
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year}</p>
            )}
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