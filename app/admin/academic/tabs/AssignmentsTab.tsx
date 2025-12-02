import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon, UserPlusIcon } from "@heroicons/react/24/outline"
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

interface Assignment {
  id: string
  [key: string]: any
}

interface AssignmentsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredAssignments: any[]
  programs: Program[]
  semesters: Semester[]
  academicYears: AcademicYear[]
  courseAssignments: Assignment[]
  assignmentColumns: any[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function AssignmentsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredAssignments,
  programs,
  semesters,
  academicYears,
  courseAssignments,
  assignmentColumns,
  openForm,
  handleDelete
}: AssignmentsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <Button 
          variant="outlined" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('course-assignment', 'create')}
        >
          Assign Course → Program
        </Button>
        <Button 
          variant="contained" 
          startIcon={<UserPlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('teacher-assignment', 'create')}
        >
          Assign Teacher → Course/Section
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Program', 
            value: filters.assignments.program, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, assignments: { ...prev.assignments, program: v } })), 
            options: [
              { value: 'all', label: 'All Programs' },
              ...programs.map(program => ({ value: program.id, label: program.program_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Year', 
            value: filters.assignments.year, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, assignments: { ...prev.assignments, year: v } })), 
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
            value: filters.assignments.semester, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, assignments: { ...prev.assignments, semester: v } })), 
            options: [
              { value: 'all', label: 'All Semesters' },
              ...semesters.map(semester => ({ value: semester.id, label: semester.semester_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Academic Year', 
            value: filters.assignments.academicYear, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, assignments: { ...prev.assignments, academicYear: v } })), 
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
        searchPlaceholder="Search assignments..."
        filters={[]}
      />
      <DataTable 
        title="Course Assignments" 
        columns={assignmentColumns} 
        data={filteredAssignments}
        onEdit={(item: any) => {
          // Find the original assignment data
          const originalAssignment = courseAssignments.find((a: any) => a.id === item.id)
          openForm('course-assignment', 'edit', originalAssignment)
        }}
        onDelete={(item) => handleDelete('course-assignment', item.id)}
      />
    </>
  )
}

