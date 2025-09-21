"use client"

import React, { useState } from 'react'
import { DialogBox } from '@/components/ui/dialog-box'
import BulkSelector from '@/components/ui/BulkSelector'

interface BulkOperationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  items: Array<{
    id: string
    label: string
    subtitle?: string
    group?: string
  }>
  onConfirm: (selectedIds: string[]) => void
  loading?: boolean
}

export default function BulkOperationForm({
  open,
  onOpenChange,
  title,
  description,
  items,
  onConfirm,
  loading = false
}: BulkOperationFormProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const handleConfirm = () => {
    onConfirm(selectedIds)
    setSelectedIds([])
    onOpenChange(false)
  }
  
  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <BulkSelector
          label="Select Items"
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          options={items}
          placeholder="Search and select multiple items..."
          className="w-full"
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0 || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Process ${selectedIds.length} items`}
          </button>
        </div>
      </div>
    </DialogBox>
  )
}
