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
  Paper,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Select,
  FormControl,
  InputLabel
} from "@mui/material"
import { 
  BookOpenIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UsersIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
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
  { label: "Total Courses", value: 0, icon: BookOpenIcon, color: "#8b5cf6" },
  { label: "Active Courses", value: 0, icon: CalendarDaysIcon, color: "#10b981" },
  { label: "Total Students", value: 0, icon: AcademicCapIcon, color: "#f59e0b" },
  { label: "Lecturers", value: 0, icon: UserIcon, color: "#06b6d4" }
] as const

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics", 
  "Engineering",
  "Business",
  "Arts & Sciences",
  "Medicine",
  "Law"
] as const

// ============================================================================
// INTERFACES
// ============================================================================

interface Course {
  id: string
  course_code: string
  course_name: string
  credits: number
  department: string
  lecturer_id: string
  created_at: string
  status: 'active' | 'inactive'
  users?: {
    full_name: string
    email: string
  }
  _count?: {
    enrollments: number
  }
}

interface CourseStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  lecturers: number
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CoursesPage() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    lecturers: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isAddCourseOpen, setAddCourseOpen] = useState(false)
  const [isEditCourseOpen, setEditCourseOpen] = useState(false)
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const { data: courses, error } = await supabase
        .from("courses")
        .select(`
          *,
          users(full_name, email),
          enrollments(count)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCourses(courses || [])
      
      // Calculate stats
      const totalCourses = courses?.length || 0
      const activeCourses = courses?.filter(c => c.status === 'active').length || 0
      
      // Get unique lecturers
      const lecturerIds = new Set(courses?.map(c => c.lecturer_id))
      const lecturers = lecturerIds.size

      // Calculate total enrollments
      const totalStudents = courses?.reduce((acc, course) => {
        return acc + (course.enrollments?.length || 0)
      }, 0) || 0

      setStats({ totalCourses, activeCourses, totalStudents, lecturers })
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget)
    setSelectedCourse(course)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedCourse(null)
  }, [])

  const handleEditCourse = useCallback(() => {
    setEditCourseOpen(true)
    handleMenuClose()
  }, [handleMenuClose])

  const handleDeleteCourse = useCallback(() => {
    setDeleteConfirmOpen(true)
    handleMenuClose()
  }, [handleMenuClose])

  const confirmDeleteCourse = useCallback(async () => {
    if (!selectedCourse) return

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", selectedCourse.id)

      if (error) throw error

      fetchCourses()
      setDeleteConfirmOpen(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }, [selectedCourse, fetchCourses])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const statsCardsWithData = useMemo(() => {
    return STATS_CARDS.map(card => ({
      ...card,
      value: card.label === "Total Courses" ? stats.totalCourses :
             card.label === "Active Courses" ? stats.activeCourses :
             card.label === "Total Students" ? stats.totalStudents :
             stats.lecturers
    }))
  }, [stats])

  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(course => course.department === selectedDepartment)
    }

    return filtered
  }, [courses, searchTerm, selectedDepartment])

  const getDepartmentColor = useCallback((department: string) => {
    const colors = [
      "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", 
      "#ef4444", "#84cc16", "#f97316"
    ]
    const index = DEPARTMENTS.indexOf(department as any)
    return colors[index % colors.length] || "#6b7280"
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
              Course Management
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: "DM Sans", 
                color: "#6b7280",
                fontSize: "1rem"
              }}
            >
              Oversee all courses and academic programs
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
              variant="contained"
              startIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setAddCourseOpen(true)}
              sx={{
                backgroundColor: "#000",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { backgroundColor: "#1f2937" }
              }}
            >
              Add Course
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
                placeholder="Search courses..."
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ fontFamily: "DM Sans" }}>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  sx={{
                    fontFamily: "DM Sans",
                    backgroundColor: "#f9fafb",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000" }
                  }}
                >
                  <MenuItem value="all" sx={{ fontFamily: "DM Sans" }}>All Departments</MenuItem>
                  {DEPARTMENTS.map(dept => (
                    <MenuItem key={dept} value={dept} sx={{ fontFamily: "DM Sans" }}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Table */}
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
                Courses ({filteredCourses.length})
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans", 
                  color: "#6b7280",
                  mb: 2
                }}
              >
                Manage all academic courses and programs
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Lecturer
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Credits
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Students
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Created
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses.map((course, index) => {
                    const departmentColor = getDepartmentColor(course.department)
                    
                    return (
                      <motion.tr
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 + (index * 0.02) }}
                        component={TableRow}
                        sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}
                      >
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
                              {course.course_code}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                color: "#6b7280"
                              }}
                            >
                              {course.course_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.department} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${departmentColor}20`,
                              color: departmentColor,
                              fontFamily: "DM Sans",
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar 
                              src="/placeholder-user.jpg" 
                              alt={course.users?.full_name}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                color: "#374151"
                              }}
                            >
                              {course.users?.full_name || "Not assigned"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              fontWeight: 600,
                              color: "#000"
                            }}
                          >
                            {course.credits}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <UsersIcon style={{ width: 16, height: 16, color: "#6b7280" }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                fontWeight: 600,
                                color: "#000"
                              }}
                            >
                              {course._count?.enrollments || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.status || "active"} 
                            size="small"
                            sx={{ 
                              backgroundColor: course.status === "active" ? "#10b98120" : "#6b728020",
                              color: course.status === "active" ? "#10b981" : "#6b7280",
                              fontFamily: "DM Sans",
                              fontWeight: 500,
                              textTransform: "capitalize"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              color: "#374151"
                            }}
                          >
                            {formatDate(course.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, course)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#000" }}>
          Delete Course
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#374151",
              mb: 2
            }}
          >
            Are you sure you want to delete <strong>{selectedCourse?.course_code}</strong>? 
            This will also remove all related enrollments and sessions. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ 
              fontFamily: "DM Sans", 
              textTransform: "none",
              color: "#6b7280"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteCourse}
            variant="contained"
            color="error"
            sx={{ 
              fontFamily: "DM Sans", 
              textTransform: "none"
            }}
          >
            Delete Course
          </Button>
        </DialogActions>
      </Dialog>

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
          <UsersIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          Manage Enrollments
        </MenuItem>
        <MenuItem onClick={handleEditCourse} sx={{ fontFamily: "DM Sans" }}>
          <PencilIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          Edit Course
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteCourse} sx={{ fontFamily: "DM Sans", color: "#ef4444" }}>
          <TrashIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          Delete Course
        </MenuItem>
      </Menu>
    </Box>
  )
}