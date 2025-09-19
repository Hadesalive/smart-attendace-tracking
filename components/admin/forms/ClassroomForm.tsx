"use client"

import React, { useState, useEffect } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'

interface Classroom {
  id?: string
  building: string
  room_number: string
  room_name?: string
  capacity: number
  room_type: string
  equipment: string[]
  description?: string
  is_active: boolean
}

interface ClassroomFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom?: Classroom | null
  onSave: (data: Classroom) => void
  mode: 'create' | 'edit'
}

const ROOM_TYPES = [
  'lecture',
  'lab',
  'computer_lab',
  'seminar',
  'conference',
  'workshop',
  'studio'
]

const EQUIPMENT_OPTIONS = [
  'Projector',
  'Whiteboard',
  'Blackboard',
  'Audio System',
  'Microphone',
  'Computers',
  'Network',
  'Lab Equipment',
  'Safety Equipment',
  'Business Software',
  'Television',
  'Document Camera',
  'Smart Board',
  'Printer',
  'Scanner'
]

export default function ClassroomForm({ 
  open, 
  onOpenChange, 
  classroom, 
  onSave, 
  mode 
}: ClassroomFormProps) {
  const [formData, setFormData] = useState<Classroom>({
    building: '',
    room_number: '',
    room_name: '',
    capacity: 30,
    room_type: 'lecture',
    equipment: [],
    description: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when classroom changes
  useEffect(() => {
    if (classroom && mode === 'edit') {
      setFormData({
        id: classroom.id,
        building: classroom.building,
        room_number: classroom.room_number,
        room_name: classroom.room_name || '',
        capacity: classroom.capacity,
        room_type: classroom.room_type,
        equipment: classroom.equipment || [],
        description: classroom.description || '',
        is_active: classroom.is_active
      })
    } else {
      // Reset form for create mode
      setFormData({
        building: '',
        room_number: '',
        room_name: '',
        capacity: 30,
        room_type: 'lecture',
        equipment: [],
        description: '',
        is_active: true
      })
    }
    setErrors({})
  }, [classroom, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'capacity' ? parseInt(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(eq => eq !== equipment)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.building.trim()) {
      newErrors.building = 'Building name is required'
    }

    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required'
    }

    if (formData.capacity < 1 || formData.capacity > 1000) {
      newErrors.capacity = 'Capacity must be between 1 and 1000'
    }

    if (!formData.room_type) {
      newErrors.room_type = 'Room type is required'
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
      console.error('Error saving classroom:', error)
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
      title={mode === 'create' ? 'Create Classroom' : 'Edit Classroom'}
      description={mode === 'create' 
        ? 'Add a new classroom to the system' 
        : 'Update the classroom information'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="px-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="building" className="block text-sm font-semibold mb-2 text-gray-900">
                Building *
              </label>
              <input
                id="building"
                name="building"
                type="text"
                value={formData.building}
                onChange={handleInputChange}
                placeholder="e.g., Main Block, Science Wing"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.building ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.building && (
                <p className="mt-1 text-sm text-red-600">{errors.building}</p>
              )}
            </div>

            <div>
              <label htmlFor="room_number" className="block text-sm font-semibold mb-2 text-gray-900">
                Room Number *
              </label>
              <input
                id="room_number"
                name="room_number"
                type="text"
                value={formData.room_number}
                onChange={handleInputChange}
                placeholder="e.g., MB-101, SW-204"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.room_number ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.room_number && (
                <p className="mt-1 text-sm text-red-600">{errors.room_number}</p>
              )}
            </div>
          </div>

          {/* Room Name */}
          <div>
            <label htmlFor="room_name" className="block text-sm font-semibold mb-2 text-gray-900">
              Room Name
            </label>
            <input
              id="room_name"
              name="room_name"
              type="text"
              value={formData.room_name}
              onChange={handleInputChange}
              placeholder="e.g., Main Lecture Hall, Computer Lab 1"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional descriptive name for the room
            </p>
          </div>

          {/* Room Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="room_type" className="block text-sm font-semibold mb-2 text-gray-900">
                Room Type *
              </label>
              <select
                id="room_type"
                name="room_type"
                value={formData.room_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.room_type ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              >
                {ROOM_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.room_type && (
                <p className="mt-1 text-sm text-red-600">{errors.room_type}</p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-semibold mb-2 text-gray-900">
                Capacity *
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="1000"
                value={formData.capacity}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.capacity ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                } text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none transition`}
                required
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Available Equipment
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EQUIPMENT_OPTIONS.map(equipment => (
                <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.equipment.includes(equipment)}
                    onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-900">{equipment}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select all equipment available in this classroom
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
              placeholder="Optional description of the classroom's features, location, or special notes"
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
              Classroom is active and available for booking
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Classroom' : 'Update Classroom'}
            </button>
          </div>
        </div>
      </form>
    </DialogBox>
  )
}
