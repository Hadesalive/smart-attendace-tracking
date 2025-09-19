"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface User {
  id: string
  full_name: string
  role: string
}

interface Department {
  id?: string
  department_code: string
  department_name: string
  description?: string
  head_id?: string
  is_active: boolean
}

interface DepartmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department | null
  users: User[]
  onSave: (data: Department) => void
  mode: 'create' | 'edit'
}

export default function DepartmentForm({ 
  open, 
  onOpenChange, 
  department, 
  users,
  onSave, 
  mode 
}: DepartmentFormProps) {
  const [formData, setFormData] = useState<Department>({
    department_code: '',
    department_name: '',
    description: '',
    head_id: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when department changes
  useEffect(() => {
    if (department && mode === 'edit') {
      setFormData({
        id: department.id,
        department_code: department.department_code,
        department_name: department.department_name,
        description: department.description || '',
        head_id: department.head_id || '',
        is_active: department.is_active
      })
    } else {
      // Reset form for create mode
      setFormData({
        department_code: '',
        department_name: '',
        description: '',
        head_id: '',
        is_active: true
      })
    }
    setErrors({})
  }, [department, mode])

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

    if (!formData.department_code.trim()) {
      newErrors.department_code = 'Department code is required'
    } else if (!/^[A-Z]{2,10}$/.test(formData.department_code)) {
      newErrors.department_code = 'Department code should be 2-10 uppercase letters (e.g., CS, BSEM, MT)'
    }

    if (!formData.department_name.trim()) {
      newErrors.department_name = 'Department name is required'
    } else if (formData.department_name.length < 3) {
      newErrors.department_name = 'Department name must be at least 3 characters'
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
      console.error('Error saving department:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Filter users to show only lecturers and admins for department head
  const eligibleUsers = users.filter(user => 
    user.role === 'lecturer' || user.role === 'admin'
  )

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Department' : 'Edit Department'}
      description={mode === 'create' 
        ? 'Add a new department to the system' 
        : 'Update the department information'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {/* Department Code */}
          <div>
            <label htmlFor="department_code" className="block text-sm font-semibold mb-2 text-gray-900">
              Department Code *
            </label>
            <input
              id="department_code"
              name="department_code"
              type="text"
              value={formData.department_code}
              onChange={handleInputChange}
              placeholder="e.g., CS, BSEM, MT"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.department_code ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition uppercase`}
              required
              maxLength={10}
            />
            {errors.department_code && (
              <p className="mt-1 text-sm text-red-600">{errors.department_code}</p>
            )}
          </div>

          {/* Department Name */}
          <div>
            <label htmlFor="department_name" className="block text-sm font-semibold mb-2 text-gray-900">
              Department Name *
            </label>
            <input
              id="department_name"
              name="department_name"
              type="text"
              value={formData.department_name}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science, Business Management"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.department_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
            />
            {errors.department_name && (
              <p className="mt-1 text-sm text-red-600">{errors.department_name}</p>
            )}
          </div>

          {/* Department Head */}
          <div>
            <label htmlFor="head_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Department Head
            </label>
            <select
              id="head_id"
              name="head_id"
              value={formData.head_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
            >
              <option value="">Select Department Head (Optional)</option>
              {eligibleUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.role})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select a lecturer or admin to head this department
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
              placeholder="Optional description of the department's focus and objectives"
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
              Department is active
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Department' : 'Update Department'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
