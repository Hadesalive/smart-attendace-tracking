"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { getFilteredOptions } from '@/lib/utils/smart-defaults'

interface TeacherAssignment {
  id?: string
  lecturer_id: string
  course_id: string
  academic_year_id: string
  semester_id: string
  program_id: string
  section_id: string
  is_primary: boolean
  teaching_hours_per_week?: number
  start_date?: string
  end_date?: string
}

interface TeacherAssignmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment?: TeacherAssignment | null
  mode: 'create' | 'edit'
  onSave: (assignment: TeacherAssignment) => Promise<void>
  lecturers?: any[]
  courses?: any[]
  academicYears?: any[]
  semesters?: any[]
  programs?: any[]
  sections?: any[]
}

export default function TeacherAssignmentForm({
  open,
  onOpenChange,
  assignment,
  mode,
  onSave,
  lecturers = [],
  courses = [],
  academicYears = [],
  semesters = [],
  programs = [],
  sections = []
}: TeacherAssignmentFormProps) {
  const [formData, setFormData] = useState<TeacherAssignment>({
    lecturer_id: '',
    course_id: '',
    academic_year_id: '',
    semester_id: '',
    program_id: '',
    section_id: '',
    is_primary: true,
    teaching_hours_per_week: 3,
    start_date: '',
    end_date: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when assignment prop changes
  useEffect(() => {
    if (assignment && mode === 'edit') {
      setFormData(assignment)
    } else {
      setFormData({
        lecturer_id: '',
        course_id: '',
        academic_year_id: '',
        semester_id: '',
        program_id: '',
        section_id: '',
        is_primary: true,
        teaching_hours_per_week: 3,
        start_date: '',
        end_date: ''
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

    if (!formData.lecturer_id) {
      newErrors.lecturer_id = 'Lecturer is required'
    }

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

    if (!formData.section_id) {
      newErrors.section_id = 'Section is required'
    }

    if (formData.teaching_hours_per_week && (formData.teaching_hours_per_week < 1 || formData.teaching_hours_per_week > 20)) {
      newErrors.teaching_hours_per_week = 'Teaching hours must be between 1 and 20'
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
      console.error('Error saving teacher assignment:', error)
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

  // Filter lecturers by role (check both direct role and joined users.role)
  // If lecturers have users data joined, use that; otherwise check direct role
  const availableLecturers = lecturers.filter(lecturer => {
    // If lecturer has users data joined, check users.role
    if (lecturer.users) {
      return lecturer.users.role === 'lecturer'
    }
    // Otherwise check direct role field
    return lecturer.role === 'lecturer'
  })

  // Transform data for SearchableSelect
  const lecturerOptions = useMemo(() => {
    return availableLecturers.map(lecturer => ({
      id: lecturer.user_id || lecturer.id,
      label: lecturer.users?.full_name || lecturer.full_name || 'Unknown Lecturer',
      subtitle: lecturer.users?.email || lecturer.email || 'No email',
      group: 'Lecturers'
    }))
  }, [availableLecturers])

  const courseOptions = useMemo(() => {
    return courses.map(course => ({
      id: course.id,
      label: `${course.course_code} - ${course.course_name}`,
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

  const sectionOptions = useMemo(() => {
    return sections.map(section => ({
      id: section.id,
      label: `${section.section_code}`,
      subtitle: `Year ${section.year}`,
      group: `${section.program_code} - ${section.program_name}`
    }))
  }, [sections])

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Assign Teacher to Course/Section' : 'Edit Teacher Assignment'}
      description={mode === 'create' 
        ? 'Assign a teacher to a specific course and section' 
        : 'Update the teacher assignment information'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Lecturer Selection */}
          <SearchableSelect
            label="Lecturer"
            value={formData.lecturer_id}
            onChange={(value) => setFormData(prev => ({ ...prev, lecturer_id: value }))}
            options={lecturerOptions}
            placeholder="Search lecturers..."
            required
            disabled={loading}
            error={errors.lecturer_id}
            className="w-full"
          />

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
            onChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value, semester_id: '', section_id: '' }))}
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
            onChange={(value) => setFormData(prev => ({ ...prev, semester_id: value, section_id: '' }))}
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
            onChange={(value) => setFormData(prev => ({ ...prev, program_id: value, section_id: '' }))}
            options={programOptions}
            placeholder="Search programs..."
            required
            disabled={loading}
            error={errors.program_id}
            className="w-full"
          />

          {/* Section */}
          <SearchableSelect
            label="Section"
            value={formData.section_id}
            onChange={(value) => setFormData(prev => ({ ...prev, section_id: value }))}
            options={sectionOptions.filter(section => {
              const originalSection = sections.find(s => s.id === section.id)
              return originalSection?.program_id === formData.program_id &&
                     originalSection?.academic_year_id === formData.academic_year_id &&
                     originalSection?.semester_id === formData.semester_id
            })}
            placeholder="Search sections..."
            required
            disabled={loading || !formData.program_id || !formData.academic_year_id || !formData.semester_id}
            error={errors.section_id}
            className="w-full"
          />

          {/* Teaching Hours */}
          <div>
            <label htmlFor="teaching_hours_per_week" className="block text-sm font-semibold mb-2 text-gray-900">
              Teaching Hours per Week
            </label>
            <select
              id="teaching_hours_per_week"
              name="teaching_hours_per_week"
              value={formData.teaching_hours_per_week?.toString() || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.teaching_hours_per_week ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              disabled={loading}
            >
              <option value="">Select Hours</option>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(hours => (
                <option key={hours} value={hours.toString()}>{hours} hours</option>
              ))}
            </select>
            {errors.teaching_hours_per_week && (
              <p className="mt-1 text-sm text-red-600">{errors.teaching_hours_per_week}</p>
            )}
          </div>

          {/* Primary Lecturer */}
          <div className="flex items-center space-x-3">
            <input
              id="is_primary"
              name="is_primary"
              type="checkbox"
              checked={formData.is_primary}
              onChange={handleInputChange}
              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="is_primary" className="text-sm font-medium text-gray-900">
              Primary Lecturer for this Course/Section
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
              {loading ? 'Saving...' : mode === 'create' ? 'Assign Teacher' : 'Update Assignment'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}