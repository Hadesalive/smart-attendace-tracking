import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface DepartmentData {
  id: string
  department_code: string
  department_name: string
  description?: string
}

interface DepartmentsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredDepartments: DepartmentData[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function DepartmentsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredDepartments,
  openForm,
  handleDelete
}: DepartmentsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('department', 'create')}
        >
          Create Department
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.departments.isActive, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, departments: { ...prev.departments, isActive: v } })), 
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ], 
            span: 3 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search departments..."
        filters={[]}
      />
      <DataTable 
        title="Departments" 
        columns={[
          { key: "department_code", label: "Code" },
          { key: "department_name", label: "Name" },
          { key: "description", label: "Description" }
        ]} 
        data={filteredDepartments}
        onEdit={(item) => openForm('department', 'edit', item)}
        onDelete={(item) => handleDelete('department', item.id)}
      />
    </>
  )
}

