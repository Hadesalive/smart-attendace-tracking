import React from "react"
import { Box, Typography, Chip, Avatar } from "@mui/material"
import { formatDate } from "@/lib/utils"

interface CourseInformationTabProps {
  course: any
  getLecturersByCourse: (courseId: string) => any[]
  courseId: string
}

export default function CourseInformationTab({ 
  course, 
  getLecturersByCourse, 
  courseId 
}: CourseInformationTabProps) {
  const assignedLecturers = getLecturersByCourse(courseId)
  const primaryLecturer = assignedLecturers.find(l => (l as any).is_primary)
  const otherLecturers = assignedLecturers.filter(l => !(l as any).is_primary)

  return (
    <Box sx={{ space: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          color: '#000000',
          mb: 0.5
        }}>
          Course Information
        </Typography>
        <Typography variant="body2" sx={{ 
          fontFamily: 'DM Sans, sans-serif',
          color: '#666666',
          fontSize: '0.875rem'
        }}>
          View detailed information about this course
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
        gap: { xs: 2, sm: 3 },
        alignItems: 'start'
      }}>
        {/* Description & Lecturers */}
        <Box sx={{ 
          p: { xs: 2, sm: 3 },
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e5e5e5'
        }}>
          <Typography variant="body2" sx={{ 
            color: '#666666', 
            mb: 1.5, 
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem'
          }}>
            Description
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 3, 
            lineHeight: 1.6,
            fontFamily: 'DM Sans, sans-serif',
            color: '#333333'
          }}>
            {(course as any)?.description || 'No description available for this course.'}
          </Typography>
          
          <Typography variant="body2" sx={{ 
            color: '#666666', 
            mb: 1.5, 
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem'
          }}>
            Assigned Lecturers
          </Typography>

          {assignedLecturers.length === 0 ? (
            <Box sx={{ 
              p: 2,
              mb: 3,
              backgroundColor: '#f9f9f9',
              borderRadius: 2,
              border: '1px solid #f0f0f0',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#666666', fontFamily: 'DM Sans, sans-serif' }}>
                No lecturers assigned to this course
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              {primaryLecturer && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  mb: otherLecturers.length > 0 ? 1.5 : 0,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 2,
                  border: '1px solid #f0f0f0'
                }}>
                  <Avatar sx={{ 
                    width: { xs: 36, sm: 40 }, 
                    height: { xs: 36, sm: 40 },
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600
                  }}>
                    {(primaryLecturer as any)?.users?.full_name?.charAt(0) || 'L'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        fontFamily: 'DM Sans, sans-serif',
                        color: '#000000'
                      }}>
                        {(primaryLecturer as any)?.users?.full_name || 'Unknown Lecturer'}
                      </Typography>
                      <Chip label="Primary" size="small" sx={{ 
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontWeight: 600
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif'
                    }}>
                      {(primaryLecturer as any)?.users?.email || 'No email'}
                    </Typography>
                  </Box>
                </Box>
              )}
              {otherLecturers.map((lecturer: any) => (
                <Box key={lecturer.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  mb: 1,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 2,
                  border: '1px solid #e5e5e5'
                }}>
                  <Avatar sx={{ 
                    width: { xs: 32, sm: 36 }, 
                    height: { xs: 32, sm: 36 },
                    backgroundColor: '#666666',
                    color: '#ffffff',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    {lecturer.users?.full_name?.charAt(0) || 'L'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#000000',
                      mb: 0.5,
                      fontSize: '0.875rem'
                    }}>
                      {lecturer.users?.full_name || 'Unknown Lecturer'}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#666666',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.75rem'
                    }}>
                      {lecturer.users?.email || 'No email'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Course Details Card */}
        <Box sx={{ 
          backgroundColor: '#f9f9f9', 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 2,
          border: '1px solid #e5e5e5'
        }}>
          <Typography variant="body2" sx={{ 
            color: '#666666', 
            mb: 2, 
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem'
          }}>
            Course Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: { xs: 1, sm: 1.5 },
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#666666'
              }}>
                Course Code:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontFamily: 'DM Sans, sans-serif',
                color: '#000000'
              }}>
                {course.course_code}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: { xs: 1, sm: 1.5 },
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#666666'
              }}>
                Credits:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontFamily: 'DM Sans, sans-serif',
                color: '#000000'
              }}>
                {course.credits}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: { xs: 1, sm: 1.5 },
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#666666'
              }}>
                Department:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontFamily: 'DM Sans, sans-serif',
                color: '#000000',
                textAlign: 'right',
                maxWidth: '60%'
              }}>
                {course.department || 'General'}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: { xs: 1, sm: 1.5 },
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#666666'
              }}>
                Status:
              </Typography>
              <Chip 
                label={course.status || 'Active'} 
                size="small"
                sx={{ 
                  backgroundColor: '#00000020',
                  color: '#000000',
                  fontFamily: "DM Sans",
                  fontWeight: 500
                }}
              />
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: { xs: 1, sm: 1.5 }
            }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                color: '#666666'
              }}>
                Created:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontFamily: 'DM Sans, sans-serif',
                color: '#000000'
              }}>
                {formatDate(course.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

