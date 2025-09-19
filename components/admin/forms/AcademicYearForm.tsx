"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface AcademicYear {
  id?: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
  description?: string
}

interface AcademicYearFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academicYear?: AcademicYear | null
  onSave: (data: AcademicYear) => void
  mode: 'create' | 'edit'
}

export default function AcademicYearForm({ 
  open, 
  onOpenChange, 
  academicYear, 
  onSave, 
  mode 
}: AcademicYearFormProps) {
  const [formData, setFormData] = useState<AcademicYear>({
    year_name: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when academic year changes
  useEffect(() => {
    if (academicYear && mode === 'edit') {
      setFormData({
        id: academicYear.id,
        year_name: academicYear.year_name,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
        is_current: academicYear.is_current,
        description: academicYear.description || ''
      })
    } else {
      // Reset form for create mode
      setFormData({
        year_name: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
      })
    }
    setErrors({})
  }, [academicYear, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!formData.year_name.trim()) {
      newErrors.year_name = 'Academic year name is required'
    } else if (!/^\d{4}-\d{4}$/.test(formData.year_name)) {
      newErrors.year_name = 'Format should be YYYY-YYYY (e.g., 2024-2025)'
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
      console.error('Error saving academic year:', error)
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
      title={mode === 'create' ? 'Create Academic Year' : 'Edit Academic Year'}
      description={mode === 'create' 
        ? 'Add a new academic year to the system' 
        : 'Update the academic year information'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {/* Academic Year Name */}
          <div>
            <label htmlFor="year_name" className="block text-sm font-semibold mb-2 text-gray-900">
              Academic Year Name *
            </label>
            <input
              id="year_name"
              name="year_name"
              type="text"
              value={formData.year_name}
              onChange={handleInputChange}
              placeholder="e.g., 2024-2025"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.year_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
            />
            {errors.year_name && (
              <p className="mt-1 text-sm text-red-600">{errors.year_name}</p>
            )}
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

          {/* Current Year Checkbox */}
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
              Set as current academic year
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
              placeholder="Optional description for this academic year"
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Academic Year' : 'Update Academic Year'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
