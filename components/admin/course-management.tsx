"use client"

import { useState, useEffect } from "react"
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { CourseForm } from "./course-form"
import { deleteCourse } from "@/lib/actions/admin"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
    px: 2,
    py: 1,
    minWidth: "auto",
    "&:hover": { 
      borderColor: "#1f2937",
      backgroundColor: "#f9fafb",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  },
  destructive: {
    backgroundColor: "#dc2626",
    color: "#fff",
    fontFamily: "DM Sans",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "8px",
    px: 2,
    py: 1,
    minWidth: "auto",
    "&:hover": { 
      backgroundColor: "#b91c1c",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  }
}

const TABLE_STYLES = {
  container: {
    border: "1px solid #000",
    borderRadius: "8px",
    overflow: "hidden"
  },
  header: {
    backgroundColor: "hsl(var(--muted))",
    "& .MuiTableCell-head": {
      fontFamily: "DM Sans",
      fontWeight: 600,
      color: "#000",
      borderBottom: "1px solid #000"
    }
  },
  row: {
    "&:hover": {
      backgroundColor: "hsl(var(--muted))"
    },
    "& .MuiTableCell-root": {
      fontFamily: "DM Sans",
      color: "#000",
      borderBottom: "1px solid #e5e7eb"
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select(`*, lecturers:users(full_name)`)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch courses.")
    } else {
      setCourses(data)
    }
  }

  const handleFormSubmit = () => {
    fetchCourses()
    setFormOpen(false)
    setSelectedCourse(null)
  }

  const handleEdit = (course: any) => {
    setSelectedCourse(course)
    setFormOpen(true)
  }

  const handleDeleteClick = (course: any) => {
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      const result = await deleteCourse(courseToDelete.id)
      if (result.message.startsWith("Successfully")) {
        toast.success(result.message)
        fetchCourses()
      } else {
        toast.error(result.message)
      }
    }
    setDeleteDialogOpen(false)
    setCourseToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCourseToDelete(null)
  }

  return (
    <Card sx={CARD_SX}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 0, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start" 
        }}>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: "Poppins", 
                fontWeight: 600, 
                color: "#000",
                mb: 1
              }}
            >
              Course Management
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: "DM Sans", 
                color: "hsl(var(--muted-foreground))"
              }}
            >
              Add, edit, or remove courses from the system.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
            onClick={() => {
              setSelectedCourse(null)
              setFormOpen(true)
            }}
            sx={BUTTON_STYLES.primary}
          >
            Add Course
          </Button>
        </Box>

        {/* Table */}
        <Box sx={{ p: 3, pt: 2 }}>
          <TableContainer sx={TABLE_STYLES.container}>
            <Table>
              <TableHead sx={TABLE_STYLES.header}>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead sx={{ textAlign: "right" }}>Actions</TableHead>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} sx={TABLE_STYLES.row}>
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell>{course.course_code}</TableCell>
                    <TableCell>{course.lecturers?.full_name || "N/A"}</TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(course)}
                          sx={{
                            border: "1px solid #000",
                            color: "#000",
                            "&:hover": {
                              backgroundColor: "#f9fafb",
                              borderColor: "#1f2937"
                            }
                          }}
                        >
                          <PencilIcon style={{ width: 16, height: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(course)}
                          sx={BUTTON_STYLES.destructive}
                        >
                          <TrashIcon style={{ width: 16, height: 16 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>

      {/* Course Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => {
          setFormOpen(false)
          setSelectedCourse(null)
        }}
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
          {selectedCourse ? "Edit Course" : "Create New Course"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <CourseForm course={selectedCourse} onFormSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
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
          color: "#000"
        }}>
          Are you sure?
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "hsl(var(--muted-foreground))"
            }}
          >
            This action cannot be undone. This will permanently delete the course and all associated enrollment and attendance data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={BUTTON_STYLES.outlined}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={BUTTON_STYLES.destructive}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}