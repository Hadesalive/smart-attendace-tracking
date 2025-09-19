"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface AcademicYear {
  id: string
  year_name: string
  is_current: boolean
}

interface Semester {
  id?: string
  academic_year_id: string
  semester_name: string
  semester_number: number
  start_date: string
  end_date: string
  is_current: boolean
  description?: string
}

interface SemesterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  semester?: Semester | null
  academicYears: AcademicYear[]
  onSave: (data: Semester) => void
  mode: 'create' | 'edit'
}

export default function SemesterForm({ 
  open, 
  onOpenChange, 
  semester, 
  academicYears,
  onSave, 
  mode 
}: SemesterFormProps) {
  const [formData, setFormData] = useState<Semester>({
    academic_year_id: '',
    semester_name: '',
    semester_number: 1,
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when semester changes
  useEffect(() => {
    if (semester && mode === 'edit') {
      setFormData({
        id: semester.id,
        academic_year_id: semester.academic_year_id,
        semester_name: semester.semester_name,
        semester_number: semester.semester_number,
        start_date: semester.start_date,
        end_date: semester.end_date,
        is_current: semester.is_current,
        description: semester.description || ''
      })
    } else {
      // Reset form for create mode
      setFormData({
        academic_year_id: academicYears.find(ay => ay.is_current)?.id || '',
        semester_name: '',
        semester_number: 1,
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
      })
    }
    setErrors({})
  }, [semester, mode, academicYears])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'semester_number' ? parseInt(value) : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = 'Academic year is required'
    }

    if (!formData.semester_name.trim()) {
      newErrors.semester_name = 'Semester name is required'
    }

    if (![1, 2].includes(formData.semester_number)) {
      newErrors.semester_number = 'Semester number must be 1 or 2'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (startDate >= endDate) {
        newErrors.end_date = 'End date must be after start date'
      }
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
      console.error('Error saving semester:', error)
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
      title={mode === 'create' ? 'Create Semester' : 'Edit Semester'}
      description={mode === 'create' 
        ? 'Add a new semester to an academic year' 
        : 'Update the semester information'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {/* Academic Year Selection */}
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

          {/* Semester Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="semester_name" className="block text-sm font-semibold mb-2 text-gray-900">
                Semester Name *
              </label>
              <input
                id="semester_name"
                name="semester_name"
                type="text"
                value={formData.semester_name}
                onChange={handleInputChange}
                placeholder="e.g., Fall Semester 2024"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.semester_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.semester_name && (
                <p className="mt-1 text-sm text-red-600">{errors.semester_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="semester_number" className="block text-sm font-semibold mb-2 text-gray-900">
                Semester Number *
              </label>
              <select
                id="semester_number"
                name="semester_number"
                value={formData.semester_number}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.semester_number ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              >
                <option value={1}>1 (First Semester)</option>
                <option value={2}>2 (Second Semester)</option>
              </select>
              {errors.semester_number && (
                <p className="mt-1 text-sm text-red-600">{errors.semester_number}</p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-semibold mb-2 text-gray-900">
                Start Date *
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.start_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-semibold mb-2 text-gray-900">
                End Date *
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.end_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Current Semester Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              id="is_current"
              name="is_current"
              type="checkbox"
              checked={formData.is_current}
              onChange={handleInputChange}
              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
            />
            <label htmlFor="is_current" className="text-sm font-medium text-gray-900">
              Set as current semester
            </label>
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
              placeholder="Optional description for this semester"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Semester' : 'Update Semester'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
