import React from "react"
import { Box, Button } from "@mui/material"
import { PlusIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface Course {
  id: string
  [key: string]: any
}

interface Department {
  id: string
  department_name: string
}

interface Program {
  id: string
  program_name: string
}

interface CoursesTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredCourses: Course[]
  departments: Department[]
  programs: Program[]
  courses: Course[]
  courseColumns: any[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function CoursesTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredCourses,
  departments,
  programs,
  courses,
  courseColumns,
  openForm,
  handleDelete
}: CoursesTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('course', 'create')}
        >
          Create Course
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<PlusIcon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('course-assignment', 'create')}
        >
          Assign Course to Program
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Assignment Status', 
            value: filters.courses.assignmentStatus, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, courses: { ...prev.courses, assignmentStatus: v } })), 
            options: [
              { value: 'all', label: 'All Courses' },
              { value: 'assigned', label: 'Assigned to Programs' },
              { value: 'unassigned', label: 'Not Assigned' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Lecturer Status', 
            value: filters.courses.lecturerStatus, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, courses: { ...prev.courses, lecturerStatus: v } })), 
            options: [
              { value: 'all', label: 'All Lecturers' },
              { value: 'assigned', label: 'Has Lecturer' },
              { value: 'unassigned', label: 'No Lecturer' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Faculty/Department', 
            value: filters.courses.department, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, courses: { ...prev.courses, department: v } })), 
            options: [
              { value: 'all', label: 'All Faculties' },
              ...departments.map(dept => ({ value: dept.department_name, label: dept.department_name }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Program', 
            value: filters.courses.program, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, courses: { ...prev.courses, program: v } })), 
            options: [
              { value: 'all', label: 'All Programs' },
              ...programs.map(program => ({ value: program.id, label: program.program_name }))
            ], 
            span: 3 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search courses..."
        filters={[]}
      />
      <DataTable 
        title="Courses" 
        columns={courseColumns} 
        data={filteredCourses}
        onEdit={(course) => {
          // Find the original course data
          const originalCourse = courses.find((c: any) => c.id === course.id)
          openForm('course', 'edit', originalCourse)
        }}
        onDelete={(course) => handleDelete('course', course.id)}
      />
    </>
  )
}

