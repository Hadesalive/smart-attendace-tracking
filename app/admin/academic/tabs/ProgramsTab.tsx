import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface ProgramData {
  id: string
  program_code: string
  program_name: string
  degree_type: string
  duration_years: number
}

interface Department {
  id: string
  department_name: string
}

interface ProgramsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredPrograms: ProgramData[]
  departments: Department[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function ProgramsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredPrograms,
  departments,
  openForm,
  handleDelete
}: ProgramsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('program', 'create')}
        >
          Create Program
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.programs.isActive, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, programs: { ...prev.programs, isActive: v } })), 
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Department', 
            value: filters.programs.department, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, programs: { ...prev.programs, department: v } })), 
            options: [
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept.id, label: dept.department_name }))
            ], 
            span: 4 
          },
          { 
            type: 'native-select', 
            label: 'Degree Type', 
            value: filters.programs.degreeType, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, programs: { ...prev.programs, degreeType: v } })), 
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'Bachelor', label: 'Bachelor' },
              { value: 'Master', label: 'Master' },
              { value: 'PhD', label: 'PhD' },
              { value: 'Certificate', label: 'Certificate' }
            ], 
            span: 3 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search programs..."
        filters={[]}
      />
      <DataTable 
        title="Programs" 
        columns={[
          { key: "program_code", label: "Code" },
          { key: "program_name", label: "Name" },
          { key: "degree_type", label: "Degree Type" },
          { key: "duration_years", label: "Duration" }
        ]} 
        data={filteredPrograms}
        onEdit={(item) => openForm('program', 'edit', item)}
        onDelete={(item) => handleDelete('program', item.id)}
      />
    </>
  )
}

