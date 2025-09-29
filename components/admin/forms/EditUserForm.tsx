"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'
import { Box, Typography, Chip } from '@mui/material'
import { UserIcon, AcademicCapIcon, KeyIcon, DevicePhoneMobileIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'lecturer' | 'student'
  status: 'active' | 'inactive' | 'pending'
  phone?: string
  department?: string
  bio?: string
  studentId?: string
  employeeId?: string
  joinDate: string
  lastLogin: string
  avatar?: string
}

// Student-specific fields
interface StudentFields {
  student_id?: string
  program_id?: string
  academic_year_id?: string
  semester_id?: string
  section_id?: string
  year_level?: number
  gpa?: number
  enrollment_date?: string
  graduation_date?: string
}

// Lecturer-specific fields
interface LecturerFields {
  employee_id?: string
  department_id?: string
  specialization?: string
  qualification?: string
  experience_years?: number
  position?: string
  hire_date?: string
  research_interests?: string
}

// Admin-specific fields
interface AdminFields {
  employee_id?: string
  department_id?: string
  position?: string
  access_level?: string
}

interface EditUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (userData: Partial<User>) => Promise<void>
  departments?: any[]
  programs?: any[]
  academicYears?: any[]
  semesters?: any[]
  sections?: any[]
  profileData?: any // Role-specific profile data
}

export default function EditUserForm({
  open,
  onOpenChange,
  user,
  onSave,
  departments = [],
  programs = [],
  academicYears = [],
  semesters = [],
  sections = [],
  profileData = null
}: EditUserFormProps) {
  const [formData, setFormData] = useState<Partial<User & StudentFields & LecturerFields & AdminFields>>({
    name: '',
    email: '',
    role: 'student',
    status: 'active',
    phone: '',
    department: '',
    bio: '',
    // Student fields
    student_id: '',
    program_id: '',
    academic_year_id: '',
    semester_id: '',
    section_id: '',
    year_level: 1,
    gpa: 0,
    enrollment_date: '',
    graduation_date: '',
    // Lecturer fields
    employee_id: '',
    department_id: '',
    specialization: '',
    qualification: '',
    experience_years: 0,
    position: '',
    hire_date: '',
    research_interests: '',
    // Admin fields
    access_level: 'admin'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && open) {
      const initialData: Partial<User & StudentFields & LecturerFields & AdminFields> = {
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        status: user.status || 'active',
        phone: user.phone || '',
        department: user.department || '',
        bio: user.bio || ''
      }

      // Add role-specific data if available
      if (profileData) {
        if (user.role === 'student') {
          Object.assign(initialData, {
            student_id: profileData.studentId || '',
            program_id: profileData.program_id || '',
            academic_year_id: profileData.academic_year_id || '',
            semester_id: profileData.semester_id || '',
            section_id: profileData.section_id || '',
            year_level: profileData.year || 1,
            gpa: profileData.gpa || 0,
            enrollment_date: profileData.enrollment_date || '',
            graduation_date: profileData.graduation_date || ''
          })
        } else if (user.role === 'lecturer') {
          Object.assign(initialData, {
            employee_id: profileData.employee_id || '',
            department_id: profileData.department_id || '',
            specialization: profileData.specialization || '',
            qualification: profileData.qualification || '',
            experience_years: profileData.experience_years || 0,
            position: profileData.position || '',
            hire_date: profileData.hire_date || '',
            research_interests: profileData.research_interests || ''
          })
        } else if (user.role === 'admin') {
          Object.assign(initialData, {
            employee_id: profileData.employee_id || '',
            department_id: profileData.department_id || '',
            access_level: profileData.access_level || 'basic'
          })
        }
      }

      setFormData(initialData)
    }
    setErrors({})
  }, [user, open, profileData])


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

    if (!formData.name?.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
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
      console.error('Error updating user:', error)
      setErrors({ submit: 'Failed to update user. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626'
      case 'lecturer': return '#2563eb'
      case 'student': return '#059669'
      default: return '#6b7280'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <KeyIcon className="h-4 w-4" />
      case 'lecturer': return <AcademicCapIcon className="h-4 w-4" />
      case 'student': return <UserIcon className="h-4 w-4" />
      default: return <UserIcon className="h-4 w-4" />
    }
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      description="Update the user's personal and account information."
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
            <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-900">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Dr. John Smith"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
              value={formData.email || ''}
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

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-2 text-gray-900">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
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

          {/* Role Display (Read-only) */}
          <div>
            <label htmlFor="role" className="block text-sm font-semibold mb-2 text-gray-900">
              Role
            </label>
            <div className="flex items-center gap-2">
              <Chip
                label={formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : 'Student'}
                sx={{
                  backgroundColor: getRoleColor(formData.role || ''),
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                (Cannot be changed)
              </Typography>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold mb-2 text-gray-900">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio || ''}
              onChange={handleInputChange}
              placeholder="Brief description about the user..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                
                {/* Student ID and Program */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="student_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Student ID
                    </label>
                    <input
                      id="student_id"
                      name="student_id"
                      type="text"
                      value={formData.student_id || ''}
                      onChange={handleInputChange}
                      placeholder="STU2024001"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Program
                    </label>
                    <select
                      id="program_id"
                      name="program_id"
                      value={formData.program_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.program_name} ({program.program_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Year and Semester */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="academic_year_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Academic Year
                    </label>
                    <select
                      id="academic_year_id"
                      name="academic_year_id"
                      value={formData.academic_year_id || ''}
                      onChange={handleInputChange}
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
                      value={formData.semester_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.semester_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section and Year Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="section_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Section
                    </label>
                    <select
                      id="section_id"
                      name="section_id"
                      value={formData.section_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="">Select Section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.section_code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="year_level" className="block text-sm font-semibold mb-2 text-gray-900">
                      Year Level
                    </label>
                    <select
                      id="year_level"
                      name="year_level"
                      value={formData.year_level || 1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>
                  </div>
                </div>

                {/* GPA and Enrollment Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="gpa" className="block text-sm font-semibold mb-2 text-gray-900">
                      GPA
                    </label>
                    <input
                      id="gpa"
                      name="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa || 0}
                      onChange={handleInputChange}
                      placeholder="3.75"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="enrollment_date" className="block text-sm font-semibold mb-2 text-gray-900">
                      Enrollment Date
                    </label>
                    <input
                      id="enrollment_date"
                      name="enrollment_date"
                      type="date"
                      value={formData.enrollment_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Graduation Date */}
                <div className="mt-4">
                  <label htmlFor="graduation_date" className="block text-sm font-semibold mb-2 text-gray-900">
                    Graduation Date
                  </label>
                  <input
                    id="graduation_date"
                    name="graduation_date"
                    type="date"
                    value={formData.graduation_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {/* Lecturer-specific fields */}
          {formData.role === 'lecturer' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                {/* Employee ID and Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="employee_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Employee ID
                    </label>
                    <input
                      id="employee_id"
                      name="employee_id"
                      type="text"
                      value={formData.employee_id || ''}
                      onChange={handleInputChange}
                      placeholder="EMP2024001"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="department_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Department
                    </label>
                    <select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Position and Specialization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="position" className="block text-sm font-semibold mb-2 text-gray-900">
                      Position
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="">Select Position</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-semibold mb-2 text-gray-900">
                      Specialization
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={formData.specialization || ''}
                      onChange={handleInputChange}
                      placeholder="Machine Learning & AI"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Experience and Hire Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="experience_years" className="block text-sm font-semibold mb-2 text-gray-900">
                      Years of Experience
                    </label>
                    <input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years || 0}
                      onChange={handleInputChange}
                      placeholder="5"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="hire_date" className="block text-sm font-semibold mb-2 text-gray-900">
                      Hire Date
                    </label>
                    <input
                      id="hire_date"
                      name="hire_date"
                      type="date"
                      value={formData.hire_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Qualification and Research Interests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-semibold mb-2 text-gray-900">
                      Qualification
                    </label>
                    <input
                      id="qualification"
                      name="qualification"
                      type="text"
                      value={formData.qualification || ''}
                      onChange={handleInputChange}
                      placeholder="PhD in Computer Science"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="research_interests" className="block text-sm font-semibold mb-2 text-gray-900">
                      Research Interests
                    </label>
                    <input
                      id="research_interests"
                      name="research_interests"
                      type="text"
                      value={formData.research_interests || ''}
                      onChange={handleInputChange}
                      placeholder="Machine Learning, Deep Learning"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Admin-specific fields */}
          {formData.role === 'admin' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrative Information</h3>
                
                {/* Employee ID and Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="employee_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Employee ID
                    </label>
                    <input
                      id="employee_id"
                      name="employee_id"
                      type="text"
                      value={formData.employee_id || ''}
                      onChange={handleInputChange}
                      placeholder="ADMIN001"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="department_id" className="block text-sm font-semibold mb-2 text-gray-900">
                      Department
                    </label>
                    <select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Position and Access Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="position" className="block text-sm font-semibold mb-2 text-gray-900">
                      Position
                    </label>
                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={formData.position || ''}
                      onChange={handleInputChange}
                      placeholder="System Administrator"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="access_level" className="block text-sm font-semibold mb-2 text-gray-900">
                      Access Level
                    </label>
                    <select
                      id="access_level"
                      name="access_level"
                      value={formData.access_level || 'admin'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                      disabled={loading}
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="system_admin">System Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              id="status"
              name="status"
              type="checkbox"
              checked={formData.status === 'active'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-900">
              Active User
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}