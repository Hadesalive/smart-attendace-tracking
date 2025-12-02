import React from "react"
import { Box, Button } from "@mui/material"
import { BuildingOffice2Icon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import FilterBar from "@/components/admin/FilterBar"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"

interface Classroom {
  id: string
  building: string
  [key: string]: any
}

interface ClassroomsTabProps {
  filters: any
  setFilters: (filters: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredRooms: any[]
  classrooms: Classroom[]
  classroomColumns: any[]
  openForm: (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => void
  handleDelete: (type: string, id: string) => void
}

export default function ClassroomsTab({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  filteredRooms,
  classrooms,
  classroomColumns,
  openForm,
  handleDelete
}: ClassroomsTabProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<BuildingOffice2Icon className="h-4 w-4" />} 
          sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
          onClick={() => openForm('classroom', 'create')}
        >
          Create Classroom
        </Button>
      </Box>
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.classrooms.isActive, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, classrooms: { ...prev.classrooms, isActive: v } })), 
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Room Type', 
            value: filters.classrooms.roomType, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, classrooms: { ...prev.classrooms, roomType: v } })), 
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'lecture', label: 'Lecture Hall' },
              { value: 'lab', label: 'Laboratory' },
              { value: 'computer_lab', label: 'Computer Lab' },
              { value: 'seminar', label: 'Seminar Room' },
              { value: 'conference', label: 'Conference Room' },
              { value: 'workshop', label: 'Workshop' },
              { value: 'studio', label: 'Studio' }
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Building', 
            value: filters.classrooms.building, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, classrooms: { ...prev.classrooms, building: v } })), 
            options: [
              { value: 'all', label: 'All Buildings' },
              ...Array.from(new Set(classrooms.map(room => room.building))).map(building => ({ 
                value: building, 
                label: building 
              }))
            ], 
            span: 3 
          },
          { 
            type: 'native-select', 
            label: 'Capacity', 
            value: filters.classrooms.capacity, 
            onChange: (v) => setFilters((prev: any) => ({ ...prev, classrooms: { ...prev.classrooms, capacity: v } })), 
            options: [
              { value: 'all', label: 'All Capacities' },
              { value: 'small', label: 'Small (1-30)' },
              { value: 'medium', label: 'Medium (31-60)' },
              { value: 'large', label: 'Large (61-100)' },
              { value: 'xlarge', label: 'Extra Large (100+)' }
            ], 
            span: 2 
          }
        ]}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search classrooms..."
        filters={[]}
      />
      <DataTable 
        title="Classrooms" 
        columns={classroomColumns} 
        data={filteredRooms}
        onEdit={(item: any) => {
          // Find the original classroom data
          const originalClassroom = classrooms.find(c => c.id === item.id)
          openForm('classroom', 'edit', originalClassroom)
        }}
        onDelete={(item) => handleDelete('classroom', item.id)}
      />
    </>
  )
}

