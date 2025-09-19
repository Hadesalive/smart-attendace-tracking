"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface AcademicYear {
  id: string
  year_name: string
  is_current: boolean
}

interface Semester {
  id: string
  semester_name: string
  semester_number: number
  academic_year_id: string
  is_current: boolean
}

interface Program {
  id: string
  program_code: string
  program_name: string
  is_active: boolean
}

interface Classroom {
  id: string
  building: string
  room_number: string
  room_name?: string
  capacity: number
  is_active: boolean
}

interface Section {
  id?: string
  section_code: string
  program_id: string
  academic_year_id: string
  semester_id: string
  year: number
  max_capacity: number
  current_enrollment: number
  classroom_id?: string
  description?: string
  is_active: boolean
}

interface SectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: Section | null
  academicYears: AcademicYear[]
  semesters: Semester[]
  programs: Program[]
  classrooms: Classroom[]
  onSave: (data: Section) => void
  mode: 'create' | 'edit'
}

export default function SectionForm({ 
  open, 
  onOpenChange, 
  section, 
  academicYears,
  semesters,
  programs,
  classrooms,
  onSave, 
  mode 
}: SectionFormProps) {
  const [formData, setFormData] = useState<Section>({
    section_code: '',
    program_id: '',
    academic_year_id: '',
    semester_id: '',
    year: 1,
    max_capacity: 50,
    current_enrollment: 0,
    classroom_id: '',
    description: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when section changes
  useEffect(() => {
    if (section && mode === 'edit') {
      setFormData({
        id: section.id,
        section_code: section.section_code,
        program_id: section.program_id,
        academic_year_id: section.academic_year_id,
        semester_id: section.semester_id,
        year: section.year,
        max_capacity: section.max_capacity,
        current_enrollment: section.current_enrollment,
        classroom_id: section.classroom_id || '',
        description: section.description || '',
        is_active: section.is_active
      })
    } else {
      // Reset form for create mode
      const currentAcademicYear = academicYears.find(ay => ay.is_current)
      const currentSemester = semesters.find(s => s.is_current)
      
      setFormData({
        section_code: '',
        program_id: '',
        academic_year_id: currentAcademicYear?.id || '',
        semester_id: currentSemester?.id || '',
        year: 1,
        max_capacity: 50,
        current_enrollment: 0,
        classroom_id: '',
        description: '',
        is_active: true
      })
    }
    setErrors({})
  }, [section, mode, academicYears, semesters])

  // Filter semesters based on selected academic year
  const filteredSemesters = semesters.filter(semester => 
    semester.academic_year_id === formData.academic_year_id
  )

  // Filter active programs and classrooms
  const activePrograms = programs.filter(program => program.is_active)
  const activeClassrooms = classrooms.filter(classroom => classroom.is_active)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               (name === 'year' || name === 'max_capacity' || name === 'current_enrollment') ? parseInt(value) || 0 : value,
      // Reset semester when academic year changes
      ...(name === 'academic_year_id' && { semester_id: '' })
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.section_code.trim()) {
      newErrors.section_code = 'Section code is required'
    }

    if (!formData.program_id) {
      newErrors.program_id = 'Program is required'
    }

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = 'Academic year is required'
    }

    if (!formData.semester_id) {
      newErrors.semester_id = 'Semester is required'
    }

    if (formData.year < 1 || formData.year > 4) {
      newErrors.year = 'Year must be between 1 and 4'
    }

    if (formData.max_capacity < 1 || formData.max_capacity > 200) {
      newErrors.max_capacity = 'Max capacity must be between 1 and 200'
    }

    if (formData.current_enrollment < 0 || formData.current_enrollment > formData.max_capacity) {
      newErrors.current_enrollment = `Current enrollment cannot exceed max capacity (${formData.max_capacity})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving section:', error)
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
      title={mode === 'create' ? 'Create Section' : 'Edit Section'}
      description={mode === 'create' 
        ? 'Add a new class section to a program' 
        : 'Update the section information'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {/* Section Code */}
          <div>
            <label htmlFor="section_code" className="block text-sm font-semibold mb-2 text-gray-900">
              Section Code *
            </label>
            <input
              id="section_code"
              name="section_code"
              type="text"
              value={formData.section_code}
              onChange={handleInputChange}
              placeholder="e.g., 2101, A, B, 01"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.section_code ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
            />
            {errors.section_code && (
              <p className="mt-1 text-sm text-red-600">{errors.section_code}</p>
            )}
          </div>

          {/* Program and Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Program *
              </label>
              <select
                id="program_id"
                name="program_id"
                value={formData.program_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.program_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              >
                <option value="">Select Program</option>
                {activePrograms.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.program_code} - {program.program_name}
                  </option>
                ))}
              </select>
              {errors.program_id && (
                <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-semibold mb-2 text-gray-900">
                Academic Year Level *
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.year ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              >
                <option value={1}>Year 1 (First Year)</option>
                <option value={2}>Year 2 (Second Year)</option>
                <option value={3}>Year 3 (Third Year)</option>
                <option value={4}>Year 4 (Fourth Year)</option>
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Academic Year and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="academic_year_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Academic Year *
              </label>
              <select
                id="academic_year_id"
                name="academic_year_id"
                value={formData.academic_year_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.academic_year_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>
                    {year.year_name} {year.is_current && '(Current)'}
                  </option>
                ))}
              </select>
              {errors.academic_year_id && (
                <p className="mt-1 text-sm text-red-600">{errors.academic_year_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="semester_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Semester *
              </label>
              <select
                id="semester_id"
                name="semester_id"
                value={formData.semester_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.semester_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
                disabled={!formData.academic_year_id}
              >
                <option value="">Select Semester</option>
                {filteredSemesters.map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_name} {semester.is_current && '(Current)'}
                  </option>
                ))}
              </select>
              {errors.semester_id && (
                <p className="mt-1 text-sm text-red-600">{errors.semester_id}</p>
              )}
            </div>
          </div>

          {/* Capacity and Enrollment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max_capacity" className="block text-sm font-semibold mb-2 text-gray-900">
                Max Capacity *
              </label>
              <input
                id="max_capacity"
                name="max_capacity"
                type="number"
                min="1"
                max="200"
                value={formData.max_capacity}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.max_capacity ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.max_capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.max_capacity}</p>
              )}
            </div>

            <div>
              <label htmlFor="current_enrollment" className="block text-sm font-semibold mb-2 text-gray-900">
                Current Enrollment
              </label>
              <input
                id="current_enrollment"
                name="current_enrollment"
                type="number"
                min="0"
                max={formData.max_capacity}
                value={formData.current_enrollment}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.current_enrollment ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              />
              {errors.current_enrollment && (
                <p className="mt-1 text-sm text-red-600">{errors.current_enrollment}</p>
              )}
            </div>
          </div>

          {/* Classroom Assignment */}
          <div>
            <label htmlFor="classroom_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Assigned Classroom
            </label>
            <select
              id="classroom_id"
              name="classroom_id"
              value={formData.classroom_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
            >
              <option value="">Select Classroom (Optional)</option>
              {activeClassrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.building} - {classroom.room_number} 
                  {classroom.room_name && ` (${classroom.room_name})`}
                  {` - Capacity: ${classroom.capacity}`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Assign a specific classroom to this section
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description of this section"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
              Section is active and accepting enrollments
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Section' : 'Update Section'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
