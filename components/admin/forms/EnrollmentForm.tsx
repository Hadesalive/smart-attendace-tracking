"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Enrollment {
  id?: string
  student_id: string
  section_id: string
  enrollment_date: string
  status: 'active' | 'dropped' | 'completed'
  grade?: string
  notes?: string
}

interface EnrollmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment?: Enrollment | null
  mode: 'create' | 'edit' | 'bulk'
  onSave: (enrollment: Enrollment | Enrollment[]) => Promise<void>
  students?: any[]
  sections?: any[]
  academicYears?: any[]
  semesters?: any[]
  bulkData?: Enrollment[]
}

export default function EnrollmentForm({
  open,
  onOpenChange,
  enrollment,
  mode,
  onSave,
  students = [],
  sections = [],
  academicYears = [],
  semesters = [],
  bulkData = []
}: EnrollmentFormProps) {
  const [formData, setFormData] = useState<Enrollment>({
    student_id: '',
    section_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    grade: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkEnrollments, setBulkEnrollments] = useState<Enrollment[]>([])
  const [bulkTemplate, setBulkTemplate] = useState<Partial<Enrollment>>({
    section_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active'
  })
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Initialize form data when enrollment prop changes
  useEffect(() => {
    if (mode === 'bulk') {
      setBulkMode(true)
      setBulkEnrollments(bulkData)
    } else if (enrollment && mode === 'edit') {
      setBulkMode(false)
      setFormData(enrollment)
    } else {
      setBulkMode(false)
      setFormData({
        student_id: '',
        section_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        grade: '',
        notes: ''
      })
    }
    setErrors({})
  }, [enrollment, mode]) // Removed bulkData and open from dependencies

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

    if (!formData.student_id) {
      newErrors.student_id = 'Student is required'
    }

    if (!formData.section_id) {
      newErrors.section_id = 'Section is required'
    }

    if (!formData.enrollment_date) {
      newErrors.enrollment_date = 'Enrollment date is required'
    }

    if (formData.grade && !['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'].includes(formData.grade)) {
      newErrors.grade = 'Invalid grade format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    console.log('Form validation result:', validateForm())
    
    if (!validateForm()) {
      console.log('Form validation failed, errors:', errors)
      return
    }

    setLoading(true)
    try {
      console.log('Calling onSave with formData:', formData)
      await onSave(formData)
      console.log('onSave completed successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving enrollment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setErrors({ submit: `Failed to save enrollment: ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Bulk operations
  const generateBulkEnrollments = () => {
    if (!bulkTemplate.section_id || selectedStudents.length === 0) {
      setErrors({ bulk: 'Please select a section and at least one student' })
      return
    }

    const enrollments: Enrollment[] = selectedStudents.map(studentId => ({
      student_id: studentId,
      section_id: bulkTemplate.section_id!,
      enrollment_date: bulkTemplate.enrollment_date || new Date().toISOString().split('T')[0],
      status: bulkTemplate.status || 'active',
      grade: bulkTemplate.grade || '',
      notes: bulkTemplate.notes || ''
    }))
    
    setBulkEnrollments(enrollments)
  }

  const updateBulkEnrollment = (index: number, field: keyof Enrollment, value: any) => {
    const updated = [...bulkEnrollments]
    updated[index] = { ...updated[index], [field]: value }
    setBulkEnrollments(updated)
  }

  const removeBulkEnrollment = (index: number) => {
    setBulkEnrollments(bulkEnrollments.filter((_, i) => i !== index))
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (bulkEnrollments.length === 0) {
      setErrors({ bulk: 'Please generate enrollments first' })
      return
    }

    // Validate all enrollments
    const validationErrors: Record<string, string> = {}
    bulkEnrollments.forEach((enrollment, index) => {
      if (!enrollment.student_id) {
        validationErrors[`enrollment_${index}`] = 'Student is required'
      }
      if (!enrollment.section_id) {
        validationErrors[`enrollment_${index}`] = 'Section is required'
      }
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await onSave(bulkEnrollments)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving bulk enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudents = () => {
    setSelectedStudents(availableStudents.map(s => s.id))
  }

  const clearStudentSelection = () => {
    setSelectedStudents([])
  }

  // Filter students by role
  const availableStudents = students.filter(student => student.role === 'student')

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'bulk' ? 'Bulk Enroll Students' : mode === 'create' ? 'Enroll Student in Section' : 'Edit Enrollment'}
      description={mode === 'bulk' 
        ? 'Enroll multiple students in a section at once' 
        : mode === 'create' 
        ? 'Enroll a student in a specific section' 
        : 'Update the enrollment information'}
      maxWidth="xl"
    >
      <form onSubmit={bulkMode ? handleBulkSubmit : handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {bulkMode ? (
            <>
              {/* Bulk Template */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Bulk Enrollment Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Section *
                    </label>
                    <select
                      value={bulkTemplate.section_id || ''}
                      onChange={(e) => setBulkTemplate({...bulkTemplate, section_id: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                    >
                      <option value="">Select Section</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.program_code} {section.section_code} - {section.program_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Enrollment Date
                    </label>
                    <input
                      type="date"
                      value={bulkTemplate.enrollment_date || ''}
                      onChange={(e) => setBulkTemplate({...bulkTemplate, enrollment_date: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Student Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Select Students ({selectedStudents.length} selected)</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearStudentSelection}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {availableStudents.map(student => (
                    <label key={student.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">
                        {student.full_name} ({student.email})
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generateBulkEnrollments}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Generate Enrollments ({selectedStudents.length} students)
                </button>
              </div>

              {/* Bulk Enrollments List */}
              {bulkEnrollments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enrollments to Create ({bulkEnrollments.length})</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {bulkEnrollments.map((enrollment, index) => {
                      const student = availableStudents.find(s => s.id === enrollment.student_id)
                      const section = sections.find(s => s.id === enrollment.section_id)
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <span className="font-medium">{student?.full_name}</span>
                            <span className="text-gray-500 ml-2">→ {section?.section_code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBulkEnrollment(index)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {errors.bulk && (
                <p className="text-sm text-red-600">{errors.bulk}</p>
              )}
            </>
          ) : (
            <>

          {/* Student Selection */}
          <div>
            <label htmlFor="student_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Student *
            </label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.student_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.email})
                </option>
              ))}
            </select>
            {errors.student_id && (
              <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
            )}
          </div>

          {/* Section */}
          <div>
            <label htmlFor="section_id" className="block text-sm font-semibold mb-2 text-gray-900">
              Section *
            </label>
            <select
              id="section_id"
              name="section_id"
              value={formData.section_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.section_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.program_code} {section.section_code} - {section.program_name}
                </option>
              ))}
            </select>
            {errors.section_id && (
              <p className="mt-1 text-sm text-red-600">{errors.section_id}</p>
            )}
          </div>

          {/* Enrollment Date */}
          <div>
            <label htmlFor="enrollment_date" className="block text-sm font-semibold mb-2 text-gray-900">
              Enrollment Date *
            </label>
            <input
              id="enrollment_date"
              name="enrollment_date"
              type="date"
              value={formData.enrollment_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.enrollment_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
              required
              disabled={loading}
            />
            {errors.enrollment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.enrollment_date}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold mb-2 text-gray-900">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
              required
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="dropped">Dropped</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Grade (for completed enrollments) */}
          {formData.status === 'completed' && (
            <div>
              <label htmlFor="grade" className="block text-sm font-semibold mb-2 text-gray-900">
                Grade
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.grade ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                disabled={loading}
              >
                <option value="">
                  No grade assigned
                </option>
                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.grade && (
                <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold mb-2 text-gray-900">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about this enrollment"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
              disabled={loading}
            />
          </div>

            </>
          )}

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
              {loading ? 'Saving...' : 
                bulkMode ? `Enroll ${bulkEnrollments.length} Students` :
                mode === 'create' ? 'Enroll Student' : 'Update Enrollment'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}