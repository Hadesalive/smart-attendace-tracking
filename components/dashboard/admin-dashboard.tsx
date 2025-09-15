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
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle
} from "@mui/material"
import { 
  UsersIcon, 
  BookOpenIcon, 
  CalendarDaysIcon, 
  ChartPieIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { AddUserForm } from "@/components/admin/add-user-form"
import StatCard from "./stat-card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_SX = {
  border: "1px solid #000",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  "&:hover": { 
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    transform: "translateY(-1px)"
  },
  transition: "all 0.2s ease-in-out"
}

const BUTTON_STYLES = {
  primary: {
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "DM Sans",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    py: 1.5,
    "&:hover": { 
      backgroundColor: "#1f2937",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  },
  outlined: {
    borderColor: "#000",
    color: "#000",
    fontFamily: "DM Sans",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    py: 1.5,
    "&:hover": { 
      borderColor: "#1f2937",
      backgroundColor: "#f9fafb",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  }
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

// Mock data for development
const MOCK_STATS = {
  totalUsers: 1247,
  totalCourses: 23,
  totalSessions: 156,
  attendanceRate: 87.3
}

const MOCK_RECENT_SESSIONS = [
  {
    id: 1,
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    session_name: "Lecture 1: Programming Basics",
    lecturer_name: "Dr. Sarah Johnson",
    session_date: "2024-01-15T10:00:00Z",
    is_active: true,
    attendance_method: "qr_code",
    attendance_count: 45,
    expected_count: 50
  },
  {
    id: 2,
    course_code: "MATH201",
    course_name: "Calculus II",
    session_name: "Tutorial 3: Integration Techniques",
    lecturer_name: "Prof. Michael Chen",
    session_date: "2024-01-14T14:00:00Z",
    is_active: false,
    attendance_method: "face_recognition",
    attendance_count: 38,
    expected_count: 42
  },
  {
    id: 3,
    course_code: "PHYS101",
    course_name: "Physics I",
    session_name: "Lab 2: Mechanics",
    lecturer_name: "Dr. Emily Rodriguez",
    session_date: "2024-01-13T09:00:00Z",
    is_active: false,
    attendance_method: "qr_code",
    attendance_count: 28,
    expected_count: 30
  }
]

const QUICK_ACTIONS = [
  { 
    icon: UserGroupIcon, 
    bgColor: '#404040', 
    hoverColor: '#000000', 
    href: '/admin/users', 
    title: 'Manage Users',
    onClick: false
  },
  { 
    icon: BookOpenIcon, 
    bgColor: '#666666', 
    hoverColor: '#404040', 
    href: '/admin/courses', 
    title: 'Course Management',
    onClick: false
  },
  { 
    icon: CalendarDaysIcon, 
    bgColor: '#999999', 
    hoverColor: '#666666', 
    href: '/admin/sessions', 
    title: 'Session Monitoring',
    onClick: false
  },
  { 
    icon: ChartPieIcon, 
    bgColor: '#BBBBBB', 
    hoverColor: '#999999', 
    href: '/admin/reports', 
    title: 'System Reports',
    onClick: false
  },
  { 
    icon: PlusIcon, 
    bgColor: '#000000', 
    hoverColor: '#333333', 
    href: '#', 
    title: 'Add User',
    onClick: true
  }
] as const

// Chart data and options
const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: {
          family: 'DM Sans, sans-serif',
          size: 12
        },
        color: '#000',
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#000',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      ticks: {
        font: {
          family: 'DM Sans, sans-serif',
          size: 11
        },
        color: '#666'
      },
      grid: {
        color: '#e5e7eb',
        drawBorder: false
      }
    },
    y: {
      ticks: {
        font: {
          family: 'DM Sans, sans-serif',
          size: 11
        },
        color: '#666'
      },
      grid: {
        color: '#e5e7eb',
        drawBorder: false
      }
    }
  },
  elements: {
    point: {
      hoverRadius: 8,
      hoverBorderWidth: 3
    },
    bar: {
      hoverBackgroundColor: 'rgba(0, 0, 0, 0.1)'
    }
  }
}

const ATTENDANCE_TRENDS_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Attendance Rate',
      data: [85, 92, 78, 88, 95, 82, 90],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5
    }
  ]
}

const COURSE_PERFORMANCE_DATA = {
  labels: ['CS101', 'MATH201', 'PHYS101', 'ENG101', 'CHEM201'],
  datasets: [
    {
      label: 'Attendance Rate (%)',
      data: [87, 92, 78, 85, 90],
      backgroundColor: [
        '#10b981',
        '#3b82f6',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6'
      ],
      borderColor: '#000',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }
  ]
}

const USER_DISTRIBUTION_DATA = {
  labels: ['Students', 'Lecturers', 'Admins'],
  datasets: [
    {
      data: [1200, 45, 8],
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b'
      ],
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 4
    }
  ]
}

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalSessions: number
  attendanceRate: number
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboard() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [recentSessions, setRecentSessions] = useState(MOCK_RECENT_SESSIONS)
  const [isAddUserOpen, setAddUserOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    // Using mock data for development
    // In production, this would fetch from Supabase
    setStats(MOCK_STATS)
    setRecentSessions(MOCK_RECENT_SESSIONS)
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

  const handleAddUserSuccess = useCallback(() => {
    // Refresh data after adding user
    setAddUserOpen(false)
  }, [])

  const handleNavigate = useCallback((path: string) => {
    // TODO: Implement actual navigation using Next.js router
    console.log(`Navigate to: ${path}`)
    // Example: router.push(path)
  }, [])

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "#10b981" : "#6b7280"
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircleIcon : ClockIcon
  }

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const statsCards = useMemo(() => [
    { 
      title: "Total Users", 
      value: stats.totalUsers, 
      subtitle: "Registered users",
      icon: UsersIcon, 
      color: "#000000",
      trend: { value: 12, isPositive: true },
      change: "+12% from last month"
    },
    { 
      title: "Total Courses", 
      value: stats.totalCourses, 
      subtitle: "Active courses",
      icon: BookOpenIcon, 
      color: "#000000",
      trend: { value: 3, isPositive: true },
      change: "+3 new this semester"
    },
    { 
      title: "Active Sessions", 
      value: stats.totalSessions, 
      subtitle: "Current sessions",
      icon: CalendarDaysIcon, 
      color: "#666666",
      trend: { value: 8, isPositive: true },
      change: "+8% from last week"
    },
    { 
      title: "Attendance Rate", 
      value: `${stats.attendanceRate}%`, 
      subtitle: "This week",
      icon: ArrowTrendingUpIcon, 
      color: "#999999",
      trend: { value: 2.1, isPositive: true },
      change: "+2.1% from last month"
    }
  ], [stats])

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
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: "Poppins, sans-serif", 
                fontWeight: 600, 
                color: "#000000",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                mb: 1
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: "DM Sans, sans-serif", 
                color: "#64748B",
                fontWeight: 500,
                fontSize: "1rem"
              }}
            >
              System overview and management controls
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 1.5 }, 
            alignItems: 'center',
            flexWrap: 'wrap',
            flexShrink: 0
          }}>
            {QUICK_ACTIONS.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5 * (index % 2 === 0 ? 1 : -1)
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Box
                  onClick={() => {
                    if (action.onClick) {
                      setAddUserOpen(true)
                    } else {
                      handleNavigate(action.href)
                    }
                  }}
                  sx={{ 
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: '50%',
                    backgroundColor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: action.hoverColor,
                      transform: 'scale(1.05)',
                      '& .hover-tooltip': {
                        opacity: 1,
                        visibility: 'visible'
                      }
                    }
                  }}
                  title={action.title}
                >
                  <action.icon style={{ 
                    width: 18, 
                    height: 18, 
                    color: '#ffffff' 
                  }} />
                  
                  {/* Hover Tooltip */}
                  <Box
                    className="hover-tooltip"
                    sx={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      mb: 1,
                      px: 2,
                      py: 1,
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      visibility: 'hidden',
                      transition: 'all 0.2s ease-in-out',
                      zIndex: 1000,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '4px solid transparent',
                        borderTopColor: '#000000'
                      }
                    }}
                  >
                    {action.title}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
      >
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, 
          gap: 3, 
          mb: 4 
        }}>
          {statsCards.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              change={stat.change}
            />
          ))}
        </Box>
      </motion.div>


      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
      >
                    <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "Poppins, sans-serif", 
            fontWeight: 600, 
            color: "#000000",
            fontSize: "1.25rem",
            lineHeight: 1.3,
            mb: 3
          }}
        >
          System Analytics
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" }, gap: 3, mb: 4 }}>
          {/* Attendance Trends Chart */}
          <Card sx={CARD_SX}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "Poppins, sans-serif", 
                  fontWeight: 600, 
                  color: "#000000",
                  mb: 2
                }}
              >
                Attendance Trends
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans, sans-serif", 
                        color: "#64748B",
                        fontWeight: 500,
                        mb: 3
                      }}
                    >
                Weekly attendance patterns across all courses
                    </Typography>
              <Box sx={{ height: 250, position: "relative" }}>
                <Bar 
                  data={COURSE_PERFORMANCE_DATA} 
                  options={CHART_OPTIONS} 
                />
              </Box>
                  </CardContent>
                </Card>

          {/* Course Performance Chart */}
          <Card sx={CARD_SX}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "Poppins, sans-serif", 
                  fontWeight: 600, 
                  color: "#000000",
                  mb: 2
                }}
              >
                Course Performance
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans, sans-serif", 
                  color: "#64748B",
                  fontWeight: 500,
                  mb: 3
                }}
              >
                Attendance rates by course
              </Typography>
              <Box sx={{ height: 250, position: "relative" }}>
                <Line 
                  data={ATTENDANCE_TRENDS_DATA} 
                  options={CHART_OPTIONS} 
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.4 }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
          {/* User Distribution Chart */}
          <Card sx={CARD_SX}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "Poppins, sans-serif", 
                  fontWeight: 600, 
                  color: "#000000",
                  mb: 2
                }}
              >
                User Distribution
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans, sans-serif", 
                  color: "#64748B",
                  fontWeight: 500,
                  mb: 3
                }}
              >
                Total users by role
              </Typography>
              <Box sx={{ height: 250, position: "relative" }}>
                <Doughnut 
                  data={USER_DISTRIBUTION_DATA} 
                  options={{
                    ...CHART_OPTIONS,
                    plugins: {
                      ...CHART_OPTIONS.plugins,
                      legend: {
                        ...CHART_OPTIONS.plugins.legend,
                        position: 'bottom' as const
                      }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>

          {/* Course Performance Chart */}
          <Card sx={CARD_SX}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "Poppins, sans-serif", 
                  fontWeight: 600, 
                  color: "#000000",
                  mb: 2
                }}
              >
                Course Performance
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans, sans-serif", 
                  color: "#64748B",
                  fontWeight: 500,
                  mb: 3
                }}
              >
                Attendance rates by course
              </Typography>
              <Box sx={{ height: 250, position: "relative" }}>
                <Bar 
                  data={COURSE_PERFORMANCE_DATA} 
                  options={CHART_OPTIONS} 
                />
              </Box>
            </CardContent>
          </Card>

          {/* Attendance Trends Chart */}
          <Card sx={CARD_SX}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "Poppins, sans-serif", 
                  fontWeight: 600, 
                  color: "#000000",
                  mb: 2
                }}
              >
                Weekly Trends
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans, sans-serif", 
                  color: "#64748B",
                  fontWeight: 500,
                  mb: 3
                }}
              >
                Daily attendance patterns
              </Typography>
              <Box sx={{ height: 250, position: "relative" }}>
                <Line 
                  data={ATTENDANCE_TRENDS_DATA} 
                  options={CHART_OPTIONS} 
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </motion.div>

      {/* Recent Sessions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.4 }}
      >
        <Card sx={CARD_SX}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: "Poppins, sans-serif", 
                  fontWeight: 600, 
                  color: "#000000",
                  mb: 1
                }}
              >
                Recent Attendance Sessions
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans, sans-serif", 
                  color: "#64748B",
                  fontWeight: 500,
                  mb: 2
                }}
              >
                Latest attendance sessions across all courses
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "hsl(var(--muted))" }}>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Session
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Lecturer
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Attendance
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentSessions.map((session, index) => {
                    const StatusIcon = getStatusIcon(session.is_active)
                    const attendancePercentage = Math.round((session.attendance_count / session.expected_count) * 100)
                    
                    return (
                      <TableRow
                      key={session.id}
                        sx={{ "&:hover": { backgroundColor: "hsl(var(--muted))" } }}
                    >
                      <TableCell>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans, sans-serif", 
                              fontWeight: 600, 
                              color: "#000000",
                              mb: 0.5
                            }}
                          >
                              {session.course_code}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontFamily: "DM Sans, sans-serif", 
                                color: "hsl(var(--muted-foreground))"
                            }}
                          >
                              {session.course_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans, sans-serif", 
                              color: "#000"
                          }}
                        >
                          {session.session_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans, sans-serif", 
                              color: "#000"
                          }}
                        >
                            {session.lecturer_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans, sans-serif", 
                              color: "#000"
                          }}
                        >
                          {formatDate(session.session_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                            icon={<StatusIcon style={{ width: 16, height: 16 }} />}
                          label={session.is_active ? "Active" : "Completed"} 
                          size="small"
                          sx={{ 
                              backgroundColor: session.is_active ? "#10b98120" : "hsl(var(--muted))",
                              color: getStatusColor(session.is_active),
                            fontFamily: "DM Sans, sans-serif",
                              fontWeight: 500,
                              border: "1px solid",
                              borderColor: getStatusColor(session.is_active)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography 
                              variant="body2" 
                          sx={{ 
                                fontFamily: "DM Sans, sans-serif", 
                                color: "#000000",
                                fontWeight: 500
                              }}
                            >
                              {session.attendance_count}/{session.expected_count}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontFamily: "DM Sans, sans-serif", 
                                color: "hsl(var(--muted-foreground))"
                              }}
                            >
                              ({attendancePercentage}%)
                            </Typography>
                          </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                            onClick={(e) => handleMenuOpen(e, session)}
                            sx={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          <EllipsisVerticalIcon style={{ width: 16, height: 16 }} />
                        </IconButton>
                      </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add User Dialog */}
      <Dialog 
        open={isAddUserOpen} 
        onClose={() => setAddUserOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            ...CARD_SX,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: "Poppins", 
          fontWeight: 600, 
          color: "#000",
          borderBottom: "1px solid hsl(var(--border))",
          pb: 2
        }}>
          Create New User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "hsl(var(--muted-foreground))",
              mb: 3
            }}
          >
            Add a new student, lecturer, or admin to the system.
          </Typography>
          <AddUserForm onFormSubmit={handleAddUserSuccess} />
        </DialogContent>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            ...CARD_SX,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            minWidth: 160
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans", gap: 1 }}>
          <EyeIcon style={{ width: 16, height: 16 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans", gap: 1 }}>
          <PencilIcon style={{ width: 16, height: 16 }} />
          Edit Session
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans", gap: 1 }}>
          <ChartPieIcon style={{ width: 16, height: 16 }} />
          View Attendance
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans", gap: 1, color: "#dc2626" }}>
          <TrashIcon style={{ width: 16, height: 16 }} />
          Delete Session
        </MenuItem>
      </Menu>
    </Box>
  )
}