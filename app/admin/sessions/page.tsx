"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab
} from "@mui/material"
import { 
  CalendarDaysIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlayIcon,
  EyeIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatTime, formatNumber } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

const STATS_CARDS = [
  { label: "Total Sessions", value: 0, icon: CalendarDaysIcon, color: "#8b5cf6" },
  { label: "Active Sessions", value: 0, icon: PlayIcon, color: "#10b981" },
  { label: "Completed", value: 0, icon: CheckCircleIcon, color: "#06b6d4" },
  { label: "Cancelled", value: 0, icon: XCircleIcon, color: "#ef4444" }
] as const

const STATUS_COLORS = {
  scheduled: "#f59e0b",
  active: "#10b981", 
  completed: "#06b6d4",
  cancelled: "#ef4444"
} as const

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SessionsPage() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [sessions, setSessions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    completed: 0,
    cancelled: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      const { data: sessions, error } = await supabase
        .from("attendance_sessions")
        .select(`
          *,
          courses(course_code, course_name, department),
          users(full_name, email)
        `)
        .order("session_date", { ascending: false })
        .order("start_time", { ascending: false })

      if (error) throw error

      setSessions(sessions || [])
      
      // Calculate stats
      const totalSessions = sessions?.length || 0
      const activeSessions = sessions?.filter(s => s.is_active).length || 0
      const completed = sessions?.filter(s => !s.is_active && s.status !== 'cancelled').length || 0
      const cancelled = sessions?.filter(s => s.status === 'cancelled').length || 0

      setStats({ totalSessions, activeSessions, completed, cancelled })
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, session: any) => {
    setAnchorEl(event.currentTarget)
    setSelectedSession(session)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedSession(null)
  }, [])

  const handleStatusChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setSelectedStatus(newValue)
  }, [])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const statsCardsWithData = useMemo(() => {
    return STATS_CARDS.map(card => ({
      ...card,
      value: card.label === "Total Sessions" ? stats.totalSessions :
             card.label === "Active Sessions" ? stats.activeSessions :
             card.label === "Completed" ? stats.completed :
             stats.cancelled
    }))
  }, [stats])

  const filteredSessions = useMemo(() => {
    let filtered = sessions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.session_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.courses?.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.courses?.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        filtered = filtered.filter(session => session.is_active)
      } else if (selectedStatus === "completed") {
        filtered = filtered.filter(session => !session.is_active && session.status !== 'cancelled')
      } else {
        filtered = filtered.filter(session => session.status === selectedStatus)
      }
    }

    return filtered
  }, [sessions, searchTerm, selectedStatus])

  const getSessionStatus = useCallback((session: any) => {
    if (session.status === 'cancelled') return { label: 'Cancelled', color: STATUS_COLORS.cancelled }
    if (session.is_active) return { label: 'Active', color: STATUS_COLORS.active }
    
    const now = new Date()
    const sessionStart = new Date(`${session.session_date}T${session.start_time}`)
    
    if (now < sessionStart) {
      return { label: 'Scheduled', color: STATUS_COLORS.scheduled }
    } else {
      return { label: 'Completed', color: STATUS_COLORS.completed }
    }
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ANIMATION_CONFIG.spring}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: "Poppins", 
                fontWeight: 700, 
                color: "#000",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                mb: 1
              }}
            >
              Session Monitoring
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: "DM Sans", 
                color: "#6b7280",
                fontSize: "1rem"
              }}
            >
              Monitor all attendance sessions across the system
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<FunnelIcon className="h-4 w-4" />}
              sx={{
                borderColor: "#e5e7eb",
                color: "#374151",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
              }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<ChartBarIcon className="h-4 w-4" />}
              sx={{
                borderColor: "#e5e7eb",
                color: "#374151",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
              }}
            >
              Analytics
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCardsWithData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 + (index * 0.05) }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: "8px", 
                          backgroundColor: `${stat.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <stat.icon style={{ width: 24, height: 24, color: stat.color }} />
                      </Box>
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 700, 
                        color: "#000",
                        mb: 0.5,
                        fontSize: "1.875rem"
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 }}
      >
        <Card sx={{ 
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: { sm: "center" } }}>
              <TextField
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlassIcon style={{ width: 20, height: 20, color: "#6b7280" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "DM Sans",
                    backgroundColor: "#f9fafb",
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#d1d5db" },
                    "&.Mui-focused fieldset": { borderColor: "#000" }
                  }
                }}
              />
              <Tabs 
                value={selectedStatus} 
                onChange={handleStatusChange}
                sx={{
                  "& .MuiTab-root": {
                    fontFamily: "DM Sans",
                    textTransform: "none",
                    minWidth: "auto",
                    px: 2
                  }
                }}
              >
                <Tab label="All" value="all" />
                <Tab label="Active" value="active" />
                <Tab label="Scheduled" value="scheduled" />
                <Tab label="Completed" value="completed" />
                <Tab label="Cancelled" value="cancelled" />
              </Tabs>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sessions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
      >
        <Card sx={{ 
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: "Poppins", 
                  fontWeight: 600, 
                  color: "#000",
                  mb: 1
                }}
              >
                Sessions ({filteredSessions.length})
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans", 
                  color: "#6b7280",
                  mb: 2
                }}
              >
                All attendance sessions across the system
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Session
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Lecturer
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Date & Time
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Method
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map((session, index) => {
                    const sessionStatus = getSessionStatus(session)
                    
                    return (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 + (index * 0.02) }}
                        component={TableRow}
                        sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}
                      >
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              fontWeight: 600, 
                              color: "#000"
                            }}
                          >
                            {session.session_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                fontWeight: 600, 
                                color: "#000",
                                mb: 0.5
                              }}
                            >
                              {session.courses?.course_code}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                color: "#6b7280"
                              }}
                            >
                              {session.courses?.course_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              color: "#374151"
                            }}
                          >
                            {session.users?.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                fontWeight: 600,
                                color: "#000",
                                mb: 0.5
                              }}
                            >
                              {formatDate(session.session_date)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                color: "#6b7280"
                              }}
                            >
                              {formatTime(`${session.session_date}T${session.start_time}`)} - {formatTime(`${session.session_date}T${session.end_time}`)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={session.attendance_method?.replace("_", " ").toUpperCase() || "QR CODE"} 
                            size="small"
                            sx={{ 
                              backgroundColor: "#f3f4f6",
                              color: "#374151",
                              fontFamily: "DM Sans"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sessionStatus.label} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${sessionStatus.color}20`,
                              color: sessionStatus.color,
                              fontFamily: "DM Sans",
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, session)}
                            sx={{ color: "#6b7280" }}
                          >
                            <EllipsisVerticalIcon style={{ width: 16, height: 16 }} />
                          </IconButton>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          <EyeIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          <ChartBarIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          View Attendance
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          <ClockIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          Session History
        </MenuItem>
      </Menu>
    </Box>
  )
}