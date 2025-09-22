"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Lecturer {
  id?: string
  full_name: string
  email: string
  password: string
  phone?: string
  department_id?: string
  employee_id?: string
  specialization?: string
  qualification?: string
  experience_years?: number
  position?: string
  hire_date?: string
  bio?: string
  research_interests?: string
  is_active: boolean
}

interface LecturerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lecturer?: Lecturer | null
  mode: 'create' | 'edit'
  onSave: (lecturer: Lecturer) => Promise<void>
  departments?: any[]
}

export default function LecturerForm({
  open,
  onOpenChange,
  lecturer,
  mode,
  onSave,
  departments = []
}: LecturerFormProps) {
  const [formData, setFormData] = useState<Lecturer>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    department_id: '',
    employee_id: '',
    specialization: '',
    qualification: '',
    experience_years: 0,
    position: '',
    hire_date: '',
    bio: '',
    research_interests: '',
    is_active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when lecturer prop changes
  useEffect(() => {
    if (lecturer && mode === 'edit') {
      setFormData(lecturer)
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        department_id: '',
        employee_id: '',
        specialization: '',
        qualification: '',
        experience_years: 0,
        position: '',
        hire_date: '',
        bio: '',
        research_interests: '',
        is_active: true
      })
    }
    setErrors({})
  }, [lecturer, mode, open])

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
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.experience_years && (formData.experience_years < 0 || formData.experience_years > 50)) {
      newErrors.experience_years = 'Experience years must be between 0 and 50'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      // Add role for lecturer creation
      const lecturerData = {
        ...formData,
        role: 'lecturer'
      }
      await onSave(lecturerData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving lecturer:', error)
      setErrors({ submit: 'Failed to save lecturer. Please try again.' })
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
      title={mode === 'create' ? 'Create Lecturer' : 'Edit Lecturer'}
      description={mode === 'create' 
        ? 'Add a new lecturer to the system' 
        : 'Update the lecturer information'}
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
              placeholder="Dr. John Smith"
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
              placeholder="john.smith@university.edu"
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
                placeholder="EMP001"
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

          {/* Specialization and Qualification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="specialization" className="block text-sm font-semibold mb-2 text-gray-900">
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="Computer Science, Mathematics, etc."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="qualification" className="block text-sm font-semibold mb-2 text-gray-900">
                Qualification
              </label>
              <input
                id="qualification"
                name="qualification"
                type="text"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="PhD, Masters, etc."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Position and Hire Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="position" className="block text-sm font-semibold mb-2 text-gray-900">
                Position
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              >
                <option value="">Select Position</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
            </div>

            <div>
              <label htmlFor="hire_date" className="block text-sm font-semibold mb-2 text-gray-900">
                Hire Date
              </label>
              <input
                id="hire_date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Experience Years */}
          <div>
            <label htmlFor="experience_years" className="block text-sm font-semibold mb-2 text-gray-900">
              Years of Experience
            </label>
            <input
              id="experience_years"
              name="experience_years"
              type="number"
              value={formData.experience_years}
              onChange={handleInputChange}
              min="0"
              max="50"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.experience_years ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              disabled={loading}
            />
            {errors.experience_years && (
              <p className="mt-1 text-sm text-red-600">{errors.experience_years}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold mb-2 text-gray-900">
              Professional Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Brief professional biography..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Research Interests */}
          <div>
            <label htmlFor="research_interests" className="block text-sm font-semibold mb-2 text-gray-900">
              Research Interests
            </label>
            <textarea
              id="research_interests"
              name="research_interests"
              value={formData.research_interests}
              onChange={handleInputChange}
              placeholder="Areas of research interest..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
              disabled={loading}
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
              disabled={loading}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
              Active Lecturer
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Lecturer' : 'Update Lecturer'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
