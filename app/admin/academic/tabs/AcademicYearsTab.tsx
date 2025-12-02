import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface AcademicYearData {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
}

interface AcademicYearsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredAcademicYears: AcademicYearData[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function AcademicYearsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredAcademicYears,
  openForm,
  handleDelete
}: AcademicYearsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('academic-year', 'create')}
        >
          Create Academic Year
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.academicYears.isCurrent, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, academicYears: { ...prev.academicYears, isCurrent: v } })), 
            options: [
              { value: 'all', label: 'All' },
              { value: 'current', label: 'Current' },
              { value: 'past', label: 'Past' }
            ], 
            span: 3 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search academic years..."
        filters={[]}
      />
      <DataTable 
        title="Academic Years" 
        columns={[
          { key: "year_name", label: "Year" },
          { key: "start_date", label: "Start Date" },
          { key: "end_date", label: "End Date" },
          { key: "is_current", label: "Current" }
        ]} 
        data={filteredAcademicYears}
        onEdit={(item) => openForm('academic-year', 'edit', item)}
        onDelete={(item) => handleDelete('academic-year', item.id)}
      />
    </>
  )
}

