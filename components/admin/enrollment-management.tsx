"use client"

import { useState, useEffect, useActionState } from "react"
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { TrashIcon } from "@heroicons/react/24/outline"
import { useFormStatus } from "react-dom"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { createEnrollment, deleteEnrollment } from "@/lib/actions/admin"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type FormState = {
  message: string | null;
  errors: {
    studentId?: string[];
    courseId?: string[];
  } | null;
};

const initialState: FormState = { message: null, errors: null };

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

const FORM_STYLES = {
  container: {
    border: "1px solid #000",
    borderRadius: "8px",
    p: 3,
    mb: 3,
    backgroundColor: "#f9fafb"
  },
  select: {
    "& .MuiOutlinedInput-root": {
      borderColor: "#000",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#1f2937"
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000"
      }
    },
    "& .MuiInputLabel-root": {
      fontFamily: "DM Sans",
      fontWeight: 500,
      color: "#000"
    }
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending}
      sx={BUTTON_STYLES.primary}
    >
      {pending ? "Enrolling..." : "Enroll Student"}
    </Button>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [state, formAction] = useActionState(createEnrollment, initialState)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<any | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!state) return;
    if (state.message?.startsWith("Successfully")) {
      toast.success(state.message);
      fetchInitialData(); // Refresh list
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  async function fetchInitialData() {
    const [enrollmentRes, studentRes, courseRes] = await Promise.all([
      supabase.from("enrollments").select(`*, students:users(full_name), courses(course_name)`),
      supabase.from("users").select("id, full_name").eq("role", "student"),
      supabase.from("courses").select("id, course_name"),
    ])

    setEnrollments(enrollmentRes.data || [])
    setStudents(studentRes.data || [])
    setCourses(courseRes.data || [])
  }

  const handleDeleteClick = (enrollment: any) => {
    setEnrollmentToDelete(enrollment)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (enrollmentToDelete) {
      const result = await deleteEnrollment(enrollmentToDelete.id)
      if (result.message.startsWith("Successfully")) {
        toast.success(result.message)
        fetchInitialData()
      } else {
        toast.error(result.message)
      }
    }
    setDeleteDialogOpen(false)
    setEnrollmentToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setEnrollmentToDelete(null)
  }

  return (
    <Card sx={CARD_SX}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
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
            Enrollment Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "hsl(var(--muted-foreground))"
            }}
          >
            Assign students to courses.
          </Typography>
        </Box>

        {/* Enrollment Form */}
        <Box sx={{ p: 3, pt: 2 }}>
          <Box component="form" action={formAction} sx={FORM_STYLES.container}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "end" }}>
              <FormControl sx={{ flex: 1, ...FORM_STYLES.select }}>
                <InputLabel>Student</InputLabel>
                <Select
                  name="studentId"
                  required
                  label="Student"
                  defaultValue=""
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.full_name}
                    </MenuItem>
                  ))}
                </Select>
                {state.errors?.studentId && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "#dc2626", 
                      mt: 1, 
                      fontFamily: "DM Sans" 
                    }}
                  >
                    {state.errors.studentId[0]}
                  </Typography>
                )}
              </FormControl>
              
              <FormControl sx={{ flex: 1, ...FORM_STYLES.select }}>
                <InputLabel>Course</InputLabel>
                <Select
                  name="courseId"
                  required
                  label="Course"
                  defaultValue=""
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.course_name}
                    </MenuItem>
                  ))}
                </Select>
                {state.errors?.courseId && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "#dc2626", 
                      mt: 1, 
                      fontFamily: "DM Sans" 
                    }}
                  >
                    {state.errors.courseId[0]}
                  </Typography>
                )}
              </FormControl>
              
              <SubmitButton />
            </Box>
          </Box>

          {/* Enrolled Students Table */}
          <TableContainer sx={TABLE_STYLES.container}>
            <Table>
              <TableHead sx={TABLE_STYLES.header}>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead sx={{ textAlign: "right" }}>Actions</TableHead>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} sx={TABLE_STYLES.row}>
                    <TableCell>{enrollment.students.full_name}</TableCell>
                    <TableCell>{enrollment.courses.course_name}</TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(enrollment)}
                        sx={BUTTON_STYLES.destructive}
                      >
                        <TrashIcon style={{ width: 16, height: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>

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
            This will unenroll the student from the course. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{
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
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={BUTTON_STYLES.destructive}
          >
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}