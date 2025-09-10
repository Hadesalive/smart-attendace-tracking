"use client"

import React from "react"
import { Box, Card, CardContent, Typography, Button, Chip } from "@mui/material"
import { motion } from "framer-motion"
import { BookOpenIcon, UsersIcon } from "@heroicons/react/24/outline"

interface Course {
  id: string
  course_code: string
  course_name: string
  credits: number
  enrollments?: { count: number }[]
}

interface CoursesCardProps {
  courses: Course[]
  onStartAttendance: (courseId: string) => void
}

const CoursesCard = ({ courses, onStartAttendance }: CoursesCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          bgcolor: 'card',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'card-foreground',
              fontFamily: 'Poppins, sans-serif',
              mb: { xs: 2, sm: 2.5, md: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
            }}
          >
            <BookOpenIcon style={{ 
              width: 24, 
              height: 24, 
              color: '#404040' 
            }} />
            My Courses
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, flex: 1 }}>
            {courses.map((course) => (
              <Box
                key={course.id}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: 'secondary',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'border',
                  transition: 'all 0.3s ease',
                  mb: { xs: 1.5, sm: 2 },
                  '&:hover': {
                    bgcolor: 'muted',
                    borderColor: '#000000',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between', 
                  mb: { xs: 1.5, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1.5, sm: 0 }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 },
                    flex: 1,
                    minWidth: 0,
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <Box
                      sx={{
                        p: { xs: 0.75, sm: 1 },
                        bgcolor: '#404040',
                        borderRadius: 1,
                        color: 'white',
                        flexShrink: 0
                      }}
                    >
                      <BookOpenIcon style={{ 
                        width: 20, 
                        height: 20, 
                        color: 'white' 
                      }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: 'card-foreground',
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {course.course_code}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'muted-foreground',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {course.course_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${course.credits} credits`}
                    size="small"
                    sx={{
                      bgcolor: '#E5E5E5',
                      color: '#000000',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      height: { xs: 20, sm: 24 },
                      alignSelf: { xs: 'flex-start', sm: 'center' }
                    }}
                  />
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: { xs: 1.5, sm: 2 },
                  mt: { xs: 0.5, sm: 0 }
                }}>
                  <UsersIcon style={{ 
                    width: 16, 
                    height: 16, 
                    color: '#666666' 
                  }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'muted-foreground', 
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    {course.enrollments?.[0]?.count || 0} {course.enrollments?.[0]?.count === 1 ? 'student' : 'students'}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  onClick={() => onStartAttendance(course.id)}
                  aria-label={`Start attendance for ${course.course_code} ${course.course_name}`}
                  sx={{
                    bgcolor: '#404040',
                    color: 'white',
                    py: { xs: 1.5, sm: 1.5 },
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    minHeight: { xs: 44, sm: 48 },
                    '&:hover': {
                      bgcolor: '#000000',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  Start Attendance
                </Button>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CoursesCard
