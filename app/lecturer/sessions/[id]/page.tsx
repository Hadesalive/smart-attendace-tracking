"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  Divider
} from "@mui/material"
import { 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface Session {
  id: string
  title: string
  courseCode: string
  courseName: string
  type: "lecture" | "tutorial" | "lab" | "workshop"
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  enrolled: number
  status: "scheduled" | "active" | "completed" | "cancelled"
  description?: string
  materials: string[]
  createdAt: string
  updatedAt: string
}

const SESSION_TYPES = {
  lecture: { label: "Lecture", color: "#8b5cf6", icon: "📚" },
  tutorial: { label: "Tutorial", color: "#06b6d4", icon: "👥" },
  lab: { label: "Lab", color: "#f59e0b", icon: "🔬" },
  workshop: { label: "Workshop", color: "#10b981", icon: "🛠️" }
}

const STATUS_COLORS = {
  scheduled: "#f59e0b",
  active: "#10b981", 
  completed: "#10b981",
  cancelled: "#ef4444"
}

const BUTTON_STYLES = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { bgcolor: '#111' }
  },
  secondary: {
    borderColor: '#000',
    color: '#000',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { 
      borderColor: '#000',
      bgcolor: 'rgba(0,0,0,0.04)'
    }
  }
} as const

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock session data - replace with actual API call
  useEffect(() => {
    const mockSession: Session = {
      id: sessionId,
      title: "Advanced Database Design",
      courseCode: "CS301",
      courseName: "Database Systems",
      type: "lecture",
      date: "2024-01-20",
      startTime: "10:00",
      endTime: "11:30",
      location: "Room 201",
      capacity: 50,
      enrolled: 45,
      status: "scheduled",
      description: "This session covers advanced database design principles including normalization, indexing strategies, and query optimization techniques.",
      materials: ["lecture-notes.pdf", "assignment-3.pdf", "sample-database.sql"],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    }
    
    setTimeout(() => {
      setSession(mockSession)
      setLoading(false)
    }, 500)
  }, [sessionId])

  const handleStartSession = () => {
    router.push(`/lecturer/attendance/${sessionId}`)
  }

  const handleEditSession = () => {
    console.log('Edit session:', sessionId)
  }

  const handleDeleteSession = () => {
    console.log('Delete session:', sessionId)
  }

  const handleExportAttendance = () => {
    console.log('Export attendance for:', sessionId)
  }

  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: 'transparent',
        py: 2,
        px: 2
      }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: 700, 
          color: 'card-foreground'
        }}>
          Loading...
        </Typography>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box sx={{ 
        bgcolor: 'transparent',
        py: 2,
        px: 2
      }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: 700, 
          color: 'card-foreground'
        }}>
          Session Not Found
        </Typography>
      </Box>
    )
  }

  const sessionType = SESSION_TYPES[session.type]
  const statusColor = STATUS_COLORS[session.status]

  return (
    <Box sx={{ 
      bgcolor: 'transparent',
      py: 2,
      px: 2,
      maxWidth: '1400px',
      mx: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 700, 
                color: 'card-foreground',
                mb: 0.5
              }}>
                {session.title}
              </Typography>
              <Typography variant="body1" sx={{ 
                fontFamily: 'DM Sans, sans-serif', 
                color: 'muted-foreground' 
              }}>
                {session.courseCode} • {session.courseName}
              </Typography>
            </Box>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleEditSession}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAttendance}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export Attendance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Share')}>
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteSession} className="text-red-600">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Box>
          
          {/* Status and Type Chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip
              label={sessionType.label}
              sx={{
                bgcolor: sessionType.color,
                color: 'white',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              sx={{
                bgcolor: statusColor,
                color: 'white',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>

        {/* Main Content - Single Column Layout */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Session Info Cards Row */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: 2 
          }}>
            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2, textAlign: 'center' }}>
                <CalendarDaysIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', mb: 0.5 }}>
                  Date
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                  {new Date(session.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Typography>
              </MUICardContent>
            </MUICard>

            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2, textAlign: 'center' }}>
                <ClockIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', mb: 0.5 }}>
                  Time
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                  {session.startTime} - {session.endTime}
                </Typography>
              </MUICardContent>
            </MUICard>

            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2, textAlign: 'center' }}>
                <MapPinIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', mb: 0.5 }}>
                  Location
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                  {session.location}
                </Typography>
              </MUICardContent>
            </MUICard>

            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2, textAlign: 'center' }}>
                <UsersIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', mb: 0.5 }}>
                  Enrollment
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                  {session.enrolled}/{session.capacity}
                </Typography>
              </MUICardContent>
            </MUICard>
          </Box>

          {/* Action Buttons */}
          <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
            <MUICardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 2, color: 'card-foreground' }}>
                Session Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <MUIButton 
                  onClick={handleStartSession}
                  disabled={session.status === 'completed' || session.status === 'cancelled'}
                  sx={BUTTON_STYLES.primary}
                >
                  {session.status === 'active' ? (
                    <>
                      <PauseIcon className="h-4 w-4 mr-2" />
                      Manage Session
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Session
                    </>
                  )}
                </MUIButton>
                
                <MUIButton 
                  onClick={handleEditSession} 
                  sx={BUTTON_STYLES.secondary}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Session
                </MUIButton>
                
                <MUIButton 
                  onClick={handleExportAttendance} 
                  sx={BUTTON_STYLES.secondary}
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export Data
                </MUIButton>
              </Box>
            </MUICardContent>
          </MUICard>

          {/* Stats and Details Row */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
            gap: 3 
          }}>
            {/* Statistics */}
            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 2, color: 'card-foreground' }}>
                  Session Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                      Total Capacity
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                      {session.capacity}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                      Enrolled
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                      {session.enrolled}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                      Available Spots
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                      {session.capacity - session.enrolled}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                      Enrollment Rate
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'card-foreground' }}>
                      {Math.round((session.enrolled / session.capacity) * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </MUICardContent>
            </MUICard>

            {/* Materials */}
            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 2, color: 'card-foreground' }}>
                  Materials
                </Typography>
                {session.materials.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {session.materials.map((material, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          p: 1, 
                          borderRadius: 1, 
                          border: '1px solid', 
                          borderColor: 'border',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                        onClick={() => console.log('Download:', material)}
                      >
                        <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                        <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'card-foreground' }}>
                          {material}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                    No materials uploaded
                  </Typography>
                )}
              </MUICardContent>
            </MUICard>
          </Box>

          {/* Description */}
          {session.description && (
            <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
              <MUICardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 1.5, color: 'card-foreground' }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', lineHeight: 1.6 }}>
                  {session.description}
                </Typography>
              </MUICardContent>
            </MUICard>
          )}
        </Box>
      </motion.div>
    </Box>
  )
}