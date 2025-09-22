"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Student {
  id?: string
  full_name: string
  email: string
  password: string
  phone?: string
  student_id?: string
  program_id?: string
  academic_year_id?: string
  semester_id?: string
  section_id?: string // Physical class section
  year_level?: number
  gpa?: number
  enrollment_date?: string
  graduation_date?: string
  is_active: boolean
  role?: string
}

interface StudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  mode: 'create' | 'edit'
  onSave: (student: Student) => Promise<void>
  programs?: any[]
  academicYears?: any[]
  semesters?: any[]
  sections?: any[]
}

export default function StudentForm({
  open,
  onOpenChange,
  student,
  mode,
  onSave,
  programs = [],
  academicYears = [],
  semesters = [],
  sections = []
}: StudentFormProps) {
  const [formData, setFormData] = useState<Student>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    student_id: '',
    program_id: '',
    academic_year_id: '',
    semester_id: '',
    section_id: '', // Physical class section
    year_level: 1,
    gpa: 0,
    enrollment_date: new Date().toISOString().split('T')[0],
    graduation_date: '',
    is_active: true,
    role: 'student' // Always set role to student
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when student prop changes
  useEffect(() => {
    if (student && mode === 'edit') {
      setFormData(student)
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        student_id: '',
        program_id: '',
        academic_year_id: '',
        semester_id: '',
        section_id: '', // Physical class section
        year_level: 1,
        gpa: 0,
        enrollment_date: new Date().toISOString().split('T')[0],
        graduation_date: '',
        is_active: true,
        role: 'student' // Always set role to student
      })
    }
    setErrors({})
  }, [student, mode]) // Removed open from dependencies

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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.year_level && (formData.year_level < 1 || formData.year_level > 5)) {
      newErrors.year_level = 'Year level must be between 1 and 5'
    }

    if (formData.gpa && (formData.gpa < 0 || formData.gpa > 4)) {
      newErrors.gpa = 'GPA must be between 0 and 4'
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
      console.error('Error saving student:', error)
      setErrors({ submit: 'Failed to save student. Please try again.' })
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
      title={mode === 'create' ? 'Create Student' : 'Edit Student'}
      description={mode === 'create' 
        ? 'Add a new student to the system' 
        : 'Update the student information'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-semibold mb-2 text-gray-900">
              Full Name *
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Jane Doe"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-900">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jane.doe@student.university.edu"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password (only for create mode) */}
          {mode === 'create' && (
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-900">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          )}

          {/* Phone and Student ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-2 text-gray-900">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                disabled={loading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="student_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Student ID
              </label>
              <input
                id="student_id"
                name="student_id"
                type="text"
                value={formData.student_id}
                onChange={handleInputChange}
                placeholder="STU2024001"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Program */}
          <div>
            <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Program
            </label>
            <select
              id="program_id"
              name="program_id"
              value={formData.program_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              disabled={loading}
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.program_code} - {program.program_name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="academic_year_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Academic Year
              </label>
              <select
                id="academic_year_id"
                name="academic_year_id"
                value={formData.academic_year_id}
                onChange={(e) => {
                  handleInputChange(e)
                  // Reset semester when academic year changes
                  setFormData(prev => ({ ...prev, semester_id: '' }))
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="semester_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Semester
              </label>
              <select
                id="semester_id"
                name="semester_id"
                value={formData.semester_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
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
            </div>
          </div>

          {/* Physical Class Section */}
          <div>
            <label htmlFor="section_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Physical Class Section
            </label>
            <select
              id="section_id"
              name="section_id"
              value={formData.section_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              disabled={loading}
            >
              <option value="">Select Class Section</option>
              {sections?.map((section) => {
                // Get the program code for this section
                const program = programs.find(p => p.id === section.program_id)
                const programCode = program ? program.program_code : 'Unknown'
                
                return (
                  <option key={section.id} value={section.id}>
                    {section.section_code} - {programCode}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Year Level and GPA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="year_level" className="block text-sm font-semibold mb-2 text-gray-900">
                Year Level
              </label>
              <select
                id="year_level"
                name="year_level"
                value={formData.year_level}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.year_level ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                disabled={loading}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
                <option value={5}>Year 5 (Graduate)</option>
              </select>
              {errors.year_level && (
                <p className="mt-1 text-sm text-red-600">{errors.year_level}</p>
              )}
            </div>

            <div>
              <label htmlFor="gpa" className="block text-sm font-semibold mb-2 text-gray-900">
                GPA
              </label>
              <input
                id="gpa"
                name="gpa"
                type="number"
                value={formData.gpa}
                onChange={handleInputChange}
                min="0"
                max="4"
                step="0.01"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.gpa ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                disabled={loading}
              />
              {errors.gpa && (
                <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>
              )}
            </div>
          </div>

          {/* Enrollment Date and Graduation Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enrollment_date" className="block text-sm font-semibold mb-2 text-gray-900">
                Enrollment Date
              </label>
              <input
                id="enrollment_date"
                name="enrollment_date"
                type="date"
                value={formData.enrollment_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="graduation_date" className="block text-sm font-semibold mb-2 text-gray-900">
                Expected Graduation Date
              </label>
              <input
                id="graduation_date"
                name="graduation_date"
                type="date"
                value={formData.graduation_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>
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
              disabled={loading}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
              Active Student
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Update Student'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
