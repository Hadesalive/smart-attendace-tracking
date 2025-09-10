"use client"

import React, { useState } from "react"
import { Box, Card, CardContent, Typography, Button, Chip, Pagination } from "@mui/material"
import { motion } from "framer-motion"
import { CalendarDaysIcon, QrCodeIcon } from "@heroicons/react/24/outline"

interface Session {
  id: string
  session_name: string
  session_date: string
  start_time: string
  end_time: string
  status: string
  course: {
    course_code: string
    course_name: string
  }
}

interface SessionsCardProps {
  sessions: Session[]
  onShowQR: (session: Session) => void
}

const SessionsCard = ({ sessions, onShowQR }: SessionsCardProps) => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 3
  const totalPages = Math.ceil(sessions.length / itemsPerPage)
  const paginatedSessions = sessions.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
            <CalendarDaysIcon aria-hidden="true" style={{ 
              width: 24, 
              height: 24, 
              color: '#000000' 
            }} />
            Recent Sessions
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            {sessions.length > 0 ? (
              paginatedSessions.map((session) => (
                <Box
                  key={session.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'secondary',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'border',
                    transition: 'all 0.3s ease',
                    gap: { xs: 2, sm: 0 },
                    '&:hover': {
                      bgcolor: 'muted',
                      borderColor: '#000000'
                    }
                  }}
                >
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
                      {session.course.course_code} - {session.session_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'muted-foreground',
                        fontFamily: 'DM Sans, sans-serif',
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {session.course.course_name}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 0.5, sm: 2 },
                      flexWrap: 'wrap'
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'muted-foreground', 
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        {session.session_date}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'muted-foreground', 
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        {session.start_time} - {session.end_time}
                      </Typography>
                      <Chip
                        label={session.status === 'active' ? 'Active' : 'Completed'}
                        size="small"
                        sx={{
                          bgcolor: session.status === 'active' ? '#000000' : '#E5E5E5',
                          color: session.status === 'active' ? 'white' : '#000000',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600,
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          textTransform: 'capitalize',
                          height: { xs: 20, sm: 24 }
                        }}
                      />
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => onShowQR(session)}
                    aria-label={`Show QR for ${session.course.course_code} ${session.session_name}`}
                    sx={{
                      bgcolor: '#404040',
                      color: 'white',
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1, sm: 1 },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      minWidth: { xs: '100%', sm: '120px' },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': {
                        bgcolor: '#000000',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                  >
                    <QrCodeIcon style={{ 
                      width: 16, 
                      height: 16, 
                      marginRight: 8, 
                      color: 'white' 
                    }} />
                    Show QR
                  </Button>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarDaysIcon style={{ width: 48, height: 48, color: '#000000', margin: '0 auto 16px' }} />
                <Typography variant="h6" sx={{ color: 'muted-foreground', fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                  No sessions yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                  Create your first attendance session
                </Typography>
              </Box>
            )}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 0 }
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="small"
                aria-label="Sessions pagination"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minWidth: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 }
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SessionsCard
