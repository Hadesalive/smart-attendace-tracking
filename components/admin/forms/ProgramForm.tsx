"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Department {
  id: string
  department_code: string
  department_name: string
  is_active: boolean
}

interface Program {
  id?: string
  program_code: string
  program_name: string
  department_id: string
  degree_type: string
  duration_years: number
  total_credits: number
  description?: string
  is_active: boolean
}

interface ProgramFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program?: Program | null
  departments: Department[]
  onSave: (data: Program) => void
  mode: 'create' | 'edit'
}

export default function ProgramForm({ 
  open, 
  onOpenChange, 
  program, 
  departments,
  onSave, 
  mode 
}: ProgramFormProps) {
  const [formData, setFormData] = useState<Program>({
    program_code: '',
    program_name: '',
    department_id: '',
    degree_type: 'Bachelor',
    duration_years: 4,
    total_credits: 120,
    description: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when program changes
  useEffect(() => {
    if (program && mode === 'edit') {
      setFormData({
        id: program.id,
        program_code: program.program_code,
        program_name: program.program_name,
        department_id: program.department_id,
        degree_type: program.degree_type,
        duration_years: program.duration_years,
        total_credits: program.total_credits,
        description: program.description || '',
        is_active: program.is_active
      })
    } else {
      // Reset form for create mode
      setFormData({
        program_code: '',
        program_name: '',
        department_id: '',
        degree_type: 'Bachelor',
        duration_years: 4,
        total_credits: 120,
        description: '',
        is_active: true
      })
    }
    setErrors({})
  }, [program, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               (name === 'duration_years' || name === 'total_credits') ? parseInt(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.program_code.trim()) {
      newErrors.program_code = 'Program code is required'
    } else if (!/^[A-Z0-9]{3,10}$/.test(formData.program_code)) {
      newErrors.program_code = 'Program code should be 3-10 uppercase letters/numbers (e.g., CS101, BSEM101)'
    }

    if (!formData.program_name.trim()) {
      newErrors.program_name = 'Program name is required'
    } else if (formData.program_name.length < 3) {
      newErrors.program_name = 'Program name must be at least 3 characters'
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required'
    }

    if (!formData.degree_type) {
      newErrors.degree_type = 'Degree type is required'
    }

    if (formData.duration_years < 1 || formData.duration_years > 10) {
      newErrors.duration_years = 'Duration must be between 1 and 10 years'
    }

    if (formData.total_credits < 1 || formData.total_credits > 500) {
      newErrors.total_credits = 'Total credits must be between 1 and 500'
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
      console.error('Error saving program:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Filter active departments
  const activeDepartments = departments.filter(dept => dept.is_active)

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Program' : 'Edit Program'}
      description={mode === 'create' 
        ? 'Add a new degree program to a department' 
        : 'Update the program information'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {/* Program Code */}
          <div>
            <label htmlFor="program_code" className="block text-sm font-semibold mb-2 text-gray-900">
              Program Code *
            </label>
            <input
              id="program_code"
              name="program_code"
              type="text"
              value={formData.program_code}
              onChange={handleInputChange}
              placeholder="e.g., CS101, BSEM101"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.program_code ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition uppercase`}
              required
              maxLength={10}
            />
            {errors.program_code && (
              <p className="mt-1 text-sm text-red-600">{errors.program_code}</p>
            )}
          </div>

          {/* Program Name */}
          <div>
            <label htmlFor="program_name" className="block text-sm font-semibold mb-2 text-gray-900">
              Program Name *
            </label>
            <input
              id="program_name"
              name="program_name"
              type="text"
              value={formData.program_name}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science, Business Management"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.program_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
            />
            {errors.program_name && (
              <p className="mt-1 text-sm text-red-600">{errors.program_name}</p>
            )}
          </div>

          {/* Department Selection */}
          <div>
            <label htmlFor="department_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Department *
            </label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.department_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
            >
              <option value="">Select Department</option>
              {activeDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_code} - {dept.department_name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
            )}
          </div>

          {/* Program Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="degree_type" className="block text-sm font-semibold mb-2 text-gray-900">
                Degree Type *
              </label>
              <select
                id="degree_type"
                name="degree_type"
                value={formData.degree_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.degree_type ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              >
                <option value="Certificate">Certificate</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
              {errors.degree_type && (
                <p className="mt-1 text-sm text-red-600">{errors.degree_type}</p>
              )}
            </div>

            <div>
              <label htmlFor="duration_years" className="block text-sm font-semibold mb-2 text-gray-900">
                Duration (Years) *
              </label>
              <input
                id="duration_years"
                name="duration_years"
                type="number"
                min="1"
                max="10"
                value={formData.duration_years}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.duration_years ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.duration_years && (
                <p className="mt-1 text-sm text-red-600">{errors.duration_years}</p>
              )}
            </div>

            <div>
              <label htmlFor="total_credits" className="block text-sm font-semibold mb-2 text-gray-900">
                Total Credits *
              </label>
              <input
                id="total_credits"
                name="total_credits"
                type="number"
                min="1"
                max="500"
                value={formData.total_credits}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.total_credits ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.total_credits && (
                <p className="mt-1 text-sm text-red-600">{errors.total_credits}</p>
              )}
            </div>
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
              placeholder="Optional description of the program's objectives, curriculum, and career prospects"
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
              Program is active and accepting enrollments
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Program' : 'Update Program'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
