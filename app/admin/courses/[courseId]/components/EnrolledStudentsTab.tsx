import React from "react"
import { Box, Typography } from "@mui/material"
import { UserGroupIcon } from "@heroicons/react/24/outline"
import FilterBar from "@/components/admin/FilterBar"
import DataTable from "@/components/admin/DataTable"

interface EnrolledStudentsTabProps {
  filters: any
  filteredStudents: any[]
  studentColumns: any[]
  filterOptions: any
  handleFilterChange: (key: string, value: string) => void
  handleSearchChange: (value: string) => void
  clearFilters: () => void
  onStudentClick: (studentId: string) => void
}

export default function EnrolledStudentsTab({
  filters,
  filteredStudents,
  studentColumns,
  filterOptions,
  handleFilterChange,
  handleSearchChange,
  clearFilters,
  onStudentClick
}: EnrolledStudentsTabProps) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          color: '#000000',
          mb: 0.5
        }}>
          Enrolled Students
        </Typography>
        <Typography variant="body2" sx={{ 
          fontFamily: 'DM Sans, sans-serif',
          color: '#666666',
          fontSize: '0.875rem'
        }}>
          View and manage students enrolled in this course
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <FilterBar
          fields={[
            { 
              type: 'text', 
              label: 'Search Students', 
              value: filters.search, 
              onChange: handleSearchChange, 
              placeholder: 'Search by name, ID, or program...',
              span: 4 
            },
            { 
              type: 'native-select', 
              label: 'Program', 
              value: filters.program, 
              onChange: (v) => handleFilterChange('program', v), 
              options: filterOptions.programs, 
              span: 2 
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
              label: 'Status', 
              value: filters.status, 
              onChange: (v) => handleFilterChange('status', v), 
              options: filterOptions.status, 
              span: 2 
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

      {/* Students List */}
      {filteredStudents.length === 0 ? (
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
            <UserGroupIcon className="h-8 w-8" style={{ color: '#666666' }} />
          </Box>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            color: '#000000',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600
          }}>
            No Students Enrolled
          </Typography>
          <Typography variant="body2" sx={{ 
            mb: 4, 
            color: '#666666',
            fontFamily: 'DM Sans, sans-serif',
            maxWidth: 400,
            mx: 'auto'
          }}>
            No students are currently enrolled in this course. Students will appear here once they are enrolled through program assignments.
          </Typography>
        </Box>
      ) : (
        <DataTable
          title=""
          subtitle=""
          columns={studentColumns}
          data={filteredStudents}
          onRowClick={(student) => onStudentClick(student.student_id)}
        />
      )}
    </Box>
  )
}

