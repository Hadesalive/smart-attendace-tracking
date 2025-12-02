import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface SemesterData {
  id: string
  semester_name: string
  semester_number: number
  start_date: string
  end_date: string
  is_current: boolean
}

interface AcademicYear {
  id: string
  year_name: string
}

interface SemestersTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredSemesters: SemesterData[]
  academicYears: AcademicYear[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function SemestersTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredSemesters,
  academicYears,
  openForm,
  handleDelete
}: SemestersTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('semester', 'create')}
        >
          Create Semester
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.semesters.isCurrent, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, semesters: { ...prev.semesters, isCurrent: v } })), 
            options: [
              { value: 'all', label: 'All' },
              { value: 'current', label: 'Current' },
              { value: 'past', label: 'Past' }
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Academic Year', 
            value: filters.semesters.academicYear, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, semesters: { ...prev.semesters, academicYear: v } })), 
            options: [
              { value: 'all', label: 'All Years' },
              ...academicYears.map(year => ({ value: year.id, label: year.year_name }))
            ], 
            span: 4 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search semesters..."
        filters={[]}
      />
      <DataTable 
        title="Semesters" 
        columns={[
          { key: "semester_name", label: "Name" },
          { key: "semester_number", label: "Number" },
          { key: "start_date", label: "Start Date" },
          { key: "end_date", label: "End Date" },
          { key: "is_current", label: "Current" }
        ]} 
        data={filteredSemesters}
        onEdit={(item) => openForm('semester', 'edit', item)}
        onDelete={(item) => handleDelete('semester', item.id)}
      />
    </>
  )
}

