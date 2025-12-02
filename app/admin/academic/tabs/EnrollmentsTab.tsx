import React from "react"
import { Box, Button } from "@mui/material"
import { UserPlusIcon } from "@heroicons/react/24/outline"
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

interface Enrollment {
  id: string
  [key: string]: any
}

interface EnrollmentsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredEnrollments: any[]
  programs: Program[]
  semesters: Semester[]
  academicYears: AcademicYear[]
  sectionEnrollments: Enrollment[]
  enrollmentColumns: any[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function EnrollmentsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredEnrollments,
  programs,
  semesters,
  academicYears,
  sectionEnrollments,
  enrollmentColumns,
  openForm,
  handleDelete
}: EnrollmentsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <Button 
          variant="contained" 
          startIcon={<UserPlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('enrollment', 'create')}
        >
          Enroll Student
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<UserPlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('enrollment', 'bulk')}
        >
          Bulk Enroll Students
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.enrollments.status, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, enrollments: { ...prev.enrollments, status: v } })), 
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'dropped', label: 'Dropped' },
              { value: 'completed', label: 'Completed' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Program', 
            value: filters.enrollments.program, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, enrollments: { ...prev.enrollments, program: v } })), 
            options: [
              { value: 'all', label: 'All Programs' },
              ...programs.map(program => ({ value: program.id, label: program.program_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Year', 
            value: filters.enrollments.year, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, enrollments: { ...prev.enrollments, year: v } })), 
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
            value: filters.enrollments.semester, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, enrollments: { ...prev.enrollments, semester: v } })), 
            options: [
              { value: 'all', label: 'All Semesters' },
              ...semesters.map(semester => ({ value: semester.id, label: semester.semester_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Academic Year', 
            value: filters.enrollments.academicYear, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, enrollments: { ...prev.enrollments, academicYear: v } })), 
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
        searchPlaceholder="Search students..."
        filters={[
          {
            label: 'Status',
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'dropped', label: 'Dropped' },
              { value: 'completed', label: 'Completed' }
            ],
            value: filters.enrollments.status,
            onChange: (value: string) => setFilters((prev: any) => ({
              ...prev,
              enrollments: { ...prev.enrollments, status: value }
            }))
          },
          {
            label: 'Program',
            options: [
              { value: 'all', label: 'All Programs' },
              ...(programs?.map((program: any) => ({
                value: program.id,
                label: program.program_name
              })) || [])
            ],
            value: filters.enrollments.program,
            onChange: (value: string) => setFilters((prev: any) => ({
              ...prev,
              enrollments: { ...prev.enrollments, program: value }
            }))
          },
          {
            label: 'Year Level',
            options: [
              { value: 'all', label: 'All Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ],
            value: filters.enrollments.year,
            onChange: (value: string) => setFilters((prev: any) => ({
              ...prev,
              enrollments: { ...prev.enrollments, year: value }
            }))
          },
          {
            label: 'Semester',
            options: [
              { value: 'all', label: 'All Semesters' },
              ...(semesters?.map((semester: any) => ({
                value: semester.id,
                label: semester.semester_name
              })) || [])
            ],
            value: filters.enrollments.semester,
            onChange: (value: string) => setFilters((prev: any) => ({
              ...prev,
              enrollments: { ...prev.enrollments, semester: value }
            }))
          }
        ]}
      />
      <DataTable 
        title="Student Enrollments" 
        columns={enrollmentColumns} 
        data={filteredEnrollments}
        onEdit={(item: any) => {
          // Find the original enrollment data
          const originalEnrollment = sectionEnrollments.find(e => e.id === item.id)
          openForm('enrollment', 'edit', originalEnrollment)
        }}
        onDelete={(item) => handleDelete('enrollment', item.id)}
      />
    </>
  )
}

