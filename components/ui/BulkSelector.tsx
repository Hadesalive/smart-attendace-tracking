"use client"

import React, { useState, useMemo } from 'react'
import { DialogBox } from './dialog-box'

interface BulkSelectorProps {
  label: string
  selectedIds: string[]
  onChange: (ids: string[]) => void
  options: Array<{
    id: string
    label: string
    subtitle?: string
    group?: string
  }>
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export default function BulkSelector({
  label,
  selectedIds,
  onChange,
  options,
  placeholder = "Select multiple items...",
  required = false,
  disabled = false,
  error,
  className = ""
}: BulkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.group?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])
  
  // Group options
  const groupedOptions = useMemo(() => {
    const groups: Record<string, typeof options> = {}
    
    filteredOptions.forEach(option => {
      const group = option.group || 'Other'
      if (!groups[group]) groups[group] = []
      groups[group].push(option)
    })
    
    return groups
  }, [filteredOptions])
  
  const selectedOptions = options.filter(option => selectedIds.includes(option.id))
  
  const handleToggle = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter(id => id !== optionId))
    } else {
      onChange([...selectedIds, optionId])
    }
  }
  
  const handleSelectAll = () => {
    const allIds = filteredOptions.map(option => option.id)
    onChange(allIds)
  }
  
  const handleClearAll = () => {
    onChange([])
  }
  
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-2 text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
          error 
            ? 'border-red-300 bg-red-50 hover:border-red-400' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        } text-gray-900 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200`}
      >
        {selectedOptions.length > 0 ? (
          <div>
            <div className="font-medium">
              {selectedOptions.length} item{selectedOptions.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-sm text-gray-500">
              {selectedOptions.slice(0, 3).map(option => option.label).join(', ')}
              {selectedOptions.length > 3 && ` and ${selectedOptions.length - 3} more...`}
            </div>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </button>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <DialogBox
        open={isOpen}
        onOpenChange={setIsOpen}
        title={`Select ${label}`}
        description="Search and select multiple items"
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Search and Controls */}
          <div className="space-y-4">
            <div className="px-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                autoFocus
              />
            </div>
            <div className="flex gap-3 px-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-sm transition-all duration-200 border border-gray-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-sm transition-all duration-200 border border-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {/* Options List */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              <div key={groupName} className="space-y-2">
                <div className="text-sm font-bold text-gray-600 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  {groupName}
                </div>
                <div className="space-y-1">
                  {groupOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center space-x-4 px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedIds.includes(option.id)
                          ? 'bg-gray-100 border-gray-300 shadow-sm'
                          : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(option.id)}
                        onChange={() => handleToggle(option.id)}
                        className="w-4 h-4 text-gray-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        {option.subtitle && (
                          <div className="text-sm text-gray-500 mt-1">{option.subtitle}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredOptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No options found</div>
                <div className="text-xs text-gray-400 mt-1">Try adjusting your search terms</div>
              </div>
            )}
          </div>
        </div>
      </DialogBox>
    </div>
  )
}
