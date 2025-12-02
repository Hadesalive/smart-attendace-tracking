import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface Program {
  id: string
  program_name: string
}

interface Semester {
  id: string
  semester_name: string
}

interface AcademicYear {
  id: string
  year_name: string
}

interface Section {
  id: string
  [key: string]: any
}

interface SectionsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredSections: any[]
  programs: Program[]
  semesters: Semester[]
  academicYears: AcademicYear[]
  sections: Section[]
  sectionColumns: any[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function SectionsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredSections,
  programs,
  semesters,
  academicYears,
  sections,
  sectionColumns,
  openForm,
  handleDelete
}: SectionsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('section', 'create')}
        >
          Create Section
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('section', 'bulk')}
        >
          Bulk Create Sections
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.sections.isActive, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, sections: { ...prev.sections, isActive: v } })), 
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Program', 
            value: filters.sections.program, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, sections: { ...prev.sections, program: v } })), 
            options: [
              { value: 'all', label: 'All Programs' },
              ...programs.map(program => ({ value: program.id, label: program.program_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Year', 
            value: filters.sections.year, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, sections: { ...prev.sections, year: v } })), 
            options: [
              { value: 'all', label: 'All Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Semester', 
            value: filters.sections.semester, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, sections: { ...prev.sections, semester: v } })), 
            options: [
              { value: 'all', label: 'All Semesters' },
              ...semesters.map(semester => ({ value: semester.id, label: semester.semester_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Academic Year', 
            value: filters.sections.academicYear, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, sections: { ...prev.sections, academicYear: v } })), 
            options: [
              { value: 'all', label: 'All Years' },
              ...academicYears.map(year => ({ value: year.id, label: year.year_name }))
            ], 
            span: 2 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search sections..."
        filters={[]}
      />
      <DataTable 
        title="Sections" 
        columns={sectionColumns} 
        data={filteredSections}
        onEdit={(item: any) => {
          // Find the original section data from sections
          const originalSection = sections.find(s => s.id === item.id)
          openForm('section', 'edit', originalSection)
        }}
        onDelete={(item) => handleDelete('section', item.id)}
      />
    </>
  )
}

