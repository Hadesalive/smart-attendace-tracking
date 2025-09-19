"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Admin {
  id?: string
  full_name: string
  email: string
  password: string
  phone?: string
  employee_id?: string
  department_id?: string
  position?: string
  access_level?: string
  is_active: boolean
}

interface AdminFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin?: Admin | null
  mode: 'create' | 'edit'
  onSave: (admin: Admin) => Promise<void>
  departments?: any[]
}

export default function AdminForm({
  open,
  onOpenChange,
  admin,
  mode,
  onSave,
  departments = []
}: AdminFormProps) {
  const [formData, setFormData] = useState<Admin>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    employee_id: '',
    department_id: '',
    position: '',
    access_level: 'admin',
    is_active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when admin prop changes
  useEffect(() => {
    if (admin && mode === 'edit') {
      setFormData(admin)
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        employee_id: '',
        department_id: '',
        position: '',
        access_level: 'admin',
        is_active: true
      })
    }
    setErrors({})
  }, [admin, mode, open])

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

    if (!formData.position?.trim()) {
      newErrors.position = 'Position is required'
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
      console.error('Error saving admin:', error)
      setErrors({ submit: 'Failed to save admin. Please try again.' })
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
      title={mode === 'create' ? 'Create Admin' : 'Edit Admin'}
      description={mode === 'create' 
        ? 'Add a new administrator to the system' 
        : 'Update the administrator information'}
      maxWidth="md"
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
              placeholder="John Administrator"
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
              placeholder="admin@university.edu"
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

          {/* Phone and Employee ID */}
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
              <label htmlFor="employee_id" className="block text-sm font-semibold mb-2 text-gray-900">
                Employee ID
              </label>
              <input
                id="employee_id"
                name="employee_id"
                type="text"
                value={formData.employee_id}
                onChange={handleInputChange}
                placeholder="ADM001"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Department
            </label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              disabled={loading}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name} ({dept.department_code})
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-semibold mb-2 text-gray-900">
              Position *
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Position</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Academic Administrator">Academic Administrator</option>
              <option value="IT Administrator">IT Administrator</option>
              <option value="Registrar">Registrar</option>
              <option value="Dean">Dean</option>
              <option value="Vice Chancellor">Vice Chancellor</option>
              <option value="Chancellor">Chancellor</option>
            </select>
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          {/* Access Level */}
          <div>
            <label htmlFor="access_level" className="block text-sm font-semibold mb-2 text-gray-900">
              Access Level
            </label>
            <select
              id="access_level"
              name="access_level"
              value={formData.access_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              disabled={loading}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="system_admin">System Admin</option>
            </select>
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
              Active Administrator
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Admin' : 'Update Admin'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
