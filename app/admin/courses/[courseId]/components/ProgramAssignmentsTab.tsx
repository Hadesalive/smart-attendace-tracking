import React from "react"
import { Box, Typography, Button } from "@mui/material"
import { PlusIcon, BookOpenIcon } from "@heroicons/react/24/outline"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import DataTable from "@/components/admin/DataTable"
import CourseAssignmentForm from "@/components/admin/forms/CourseAssignmentForm"

interface ProgramAssignmentsTabProps {
  course: any
  filters: any
  filteredAssignments: any[]
  assignmentColumns: any[]
  filterOptions: any
  isAddAssignmentOpen: boolean
  isEditAssignmentOpen: boolean
  selectedAssignment: any
  academicData: any
  handleAddAssignment: () => void
  handleEditAssignment: (assignment: any) => void
  handleSaveAssignment: (data: any) => Promise<void>
  handleCloseAssignmentForm: () => void
  handleFilterChange: (key: string, value: string) => void
  clearFilters: () => void
}

export default function ProgramAssignmentsTab({
  course,
  filters,
  filteredAssignments,
  assignmentColumns,
  filterOptions,
  isAddAssignmentOpen,
  isEditAssignmentOpen,
  selectedAssignment,
  academicData,
  handleAddAssignment,
  handleEditAssignment,
  handleSaveAssignment,
  handleCloseAssignmentForm,
  handleFilterChange,
  clearFilters
}: ProgramAssignmentsTabProps) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: '#000000',
            mb: 0.5
          }}>
            Program Assignments
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: 'DM Sans, sans-serif',
            color: '#666666',
            fontSize: '0.875rem'
          }}>
            Manage course assignments to academic programs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon className="h-4 w-4" />}
          onClick={handleAddAssignment}
          sx={{
            ...BUTTON_STYLES.primary,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Assign to Program
        </Button>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <FilterBar
          fields={[
            { 
              type: 'native-select', 
              label: 'Program', 
              value: filters.program, 
              onChange: (v) => handleFilterChange('program', v), 
              options: filterOptions.programs, 
              span: 3 
            },
            { 
              type: 'native-select', 
              label: 'Year Level', 
              value: filters.year, 
              onChange: (v) => handleFilterChange('year', v), 
              options: filterOptions.years, 
              span: 2 
            },
            { 
              type: 'native-select', 
              label: 'Semester', 
              value: filters.semester, 
              onChange: (v) => handleFilterChange('semester', v), 
              options: filterOptions.semesters, 
              span: 2 
            },
            { 
              type: 'native-select', 
              label: 'Academic Year', 
              value: filters.academicYear, 
              onChange: (v) => handleFilterChange('academicYear', v), 
              options: filterOptions.academicYears, 
              span: 3 
            },
            { 
              type: 'clear-button', 
              label: 'Clear', 
              onClick: clearFilters,
              span: 2 
            }
          ]}
        />
      </Box>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Box sx={{ 
          p: 6, 
          textAlign: 'center',
          border: '2px dashed #e5e5e5',
          borderRadius: 3,
          backgroundColor: '#f9f9f9',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#000000',
            backgroundColor: '#f5f5f5'
          }
        }}>
          <Box sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            backgroundColor: '#00000020', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto', 
            mb: 3 
          }}>
            <BookOpenIcon className="h-8 w-8" style={{ color: '#666666' }} />
          </Box>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            color: '#000000',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600
          }}>
            No Assignments Found
          </Typography>
          <Typography variant="body2" sx={{ 
            mb: 4, 
            color: '#666666',
            fontFamily: 'DM Sans, sans-serif',
            maxWidth: 400,
            mx: 'auto'
          }}>
            This course has not been assigned to any programs yet. Create your first assignment to get started.
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddAssignment}
            sx={{
              ...BUTTON_STYLES.primary,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Create First Assignment
          </Button>
        </Box>
      ) : (
        <DataTable
          title=""
          subtitle=""
          columns={assignmentColumns}
          data={filteredAssignments}
          onRowClick={(assignment) => handleEditAssignment(assignment)}
        />
      )}

      {/* Course Assignment Form */}
      <CourseAssignmentForm
        open={isAddAssignmentOpen || isEditAssignmentOpen}
        onOpenChange={handleCloseAssignmentForm}
        assignment={selectedAssignment}
        onSave={handleSaveAssignment}
        mode={isEditAssignmentOpen ? 'edit' : 'create'}
        courses={[course].filter(Boolean)}
        academicYears={academicData.academicYears}
        semesters={academicData.semesters}
        programs={academicData.programs}
        sections={academicData.sections}
      />
    </Box>
  )
}

