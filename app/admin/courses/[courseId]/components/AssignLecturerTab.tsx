import React from "react"
import { Box, Typography, Card, CardContent, Avatar, IconButton, Button } from "@mui/material"
import { UserPlusIcon, PencilIcon } from "@heroicons/react/24/outline"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import TeacherAssignmentForm from "@/components/admin/forms/TeacherAssignmentForm"

interface AssignLecturerTabProps {
  course: any
  courseId: string
  getLecturersByCourse: (courseId: string) => any[]
  isAssignLecturerOpen: boolean
  selectedLecturerAssignment: any
  lecturerAssignmentMode: 'create' | 'edit'
  handleAssignLecturer: () => void
  handleEditLecturerAssignment: (assignment: any) => void
  handleSaveLecturerAssignment: (data: any) => Promise<void>
  handleCloseLecturerForm: () => void
  lecturerProfiles: any[]
  academicYears: any[]
  semesters: any[]
  programs: any[]
  sections: any[]
}

export default function AssignLecturerTab({
  course,
  courseId,
  getLecturersByCourse,
  isAssignLecturerOpen,
  selectedLecturerAssignment,
  lecturerAssignmentMode,
  handleAssignLecturer,
  handleEditLecturerAssignment,
  handleSaveLecturerAssignment,
  handleCloseLecturerForm,
  lecturerProfiles,
  academicYears,
  semesters,
  programs,
  sections
}: AssignLecturerTabProps) {
  const assignedLecturers = getLecturersByCourse(courseId)
  const primaryLecturer = assignedLecturers.find(l => (l as any).is_primary)
  const additionalLecturers = assignedLecturers.filter(l => !(l as any).is_primary)

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
            Assign Lecturer
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: 'DM Sans, sans-serif',
            color: '#666666',
            fontSize: '0.875rem'
          }}>
            Manage lecturer assignments for this course
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlusIcon className="h-4 w-4" />}
          onClick={handleAssignLecturer}
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
          Assign Lecturer
        </Button>
      </Box>

      {/* Assigned Lecturers */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Assigned Lecturers
          </Typography>
          {assignedLecturers.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              No lecturers assigned to this course
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {primaryLecturer && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#000000' }}>
                    {(primaryLecturer as any).users?.full_name?.charAt(0) || 'L'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {(primaryLecturer as any).users?.full_name || 'Unknown Lecturer'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {(primaryLecturer as any).users?.email || 'No email'} • Primary Lecturer
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {(primaryLecturer as any).teaching_hours_per_week ? `${(primaryLecturer as any).teaching_hours_per_week} hours/week` : ''}
                      {(primaryLecturer as any).sections?.section_code ? 
                        ` • Section: ${(primaryLecturer as any).programs?.program_code || (primaryLecturer as any).sections?.programs?.program_code || ''} ${(primaryLecturer as any).sections.section_code}`.trim().replace(/Section:\s+/, 'Section: ')
                        : ''}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEditLecturerAssignment(primaryLecturer)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </IconButton>
                </Box>
              )}
              
              {additionalLecturers.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                    Additional Lecturers ({additionalLecturers.length})
                  </Typography>
                  {additionalLecturers.map((lecturer) => (
                    <Box key={lecturer.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid #f3f4f6', borderRadius: 1, mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#6b7280' }}>
                        {(lecturer as any).users?.full_name?.charAt(0) || 'L'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {(lecturer as any).users?.full_name || 'Unknown Lecturer'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {(lecturer as any).users?.email || 'No email'}
                          {(lecturer as any).teaching_hours_per_week ? ` • ${(lecturer as any).teaching_hours_per_week} hours/week` : ''}
                          {(lecturer as any).sections?.section_code ? 
                            ` • Section: ${(lecturer as any).programs?.program_code || (lecturer as any).sections?.programs?.program_code || ''} ${(lecturer as any).sections.section_code}`.trim().replace(/Section:\s+/, 'Section: ')
                            : ''}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditLecturerAssignment(lecturer)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Teacher Assignment Form */}
      <TeacherAssignmentForm
        open={isAssignLecturerOpen}
        onOpenChange={handleCloseLecturerForm}
        assignment={selectedLecturerAssignment}
        mode={lecturerAssignmentMode}
        onSave={handleSaveLecturerAssignment}
        lecturers={lecturerProfiles}
        courses={[course]}
        academicYears={academicYears}
        semesters={semesters}
        programs={programs}
        sections={sections}
      />
    </Box>
  )
}

