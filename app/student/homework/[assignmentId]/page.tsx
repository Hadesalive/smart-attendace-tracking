"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton, 
  Chip,
  LinearProgress,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeftIcon,
  ClockIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  StarIcon,
  BookOpenIcon,
  PaperClipIcon,
  AcademicCapIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_SX = {
  bgcolor: 'card',
  border: '1px solid',
  borderColor: '#000',
  borderRadius: 3,
  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }
}

const BUTTON_STYLES = {
  primary: {
    backgroundColor: 'hsl(var(--foreground))',
    color: 'hsl(var(--background))',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { 
      backgroundColor: 'hsl(var(--foreground) / 0.9)' 
    }
  },
  outlined: {
    borderColor: '#000',
    color: 'hsl(var(--foreground))',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': {
      borderColor: '#000',
      backgroundColor: 'hsl(var(--muted))',
    }
  }
}

const FILE_UPLOAD_SX = {
  border: '2px dashed #000',
  borderRadius: 2,
  p: 3,
  textAlign: 'center' as const,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'hsl(var(--primary))',
    backgroundColor: 'hsl(var(--muted) / 0.5)',
  },
  '&.dragover': {
    borderColor: 'hsl(var(--primary))',
    backgroundColor: 'hsl(var(--primary) / 0.1)',
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface AssignmentDetails {
  id: string
  title: string
  description: string
  courseId: string
  courseCode: string
  courseName: string
  instructor: string
  dueDate: string
  totalPoints: number
  status: "pending" | "submitted" | "graded" | "late" | "overdue"
  submittedAt?: string
  grade?: number
  finalGrade?: number
  feedback?: string
  attachments?: string[]
  submissionType: "file" | "text" | "both"
  allowLateSubmission: boolean
  createdAt: string
  instructions?: string
  rubric?: string
}

interface SubmissionHistory {
  id: string
  submittedAt: string
  status: "draft" | "submitted" | "graded"
  textContent?: string
  attachments?: string[]
  grade?: number
  feedback?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AssignmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = (params?.assignmentId as string) || ""

  // ============================================================================
  // STATE
  // ============================================================================
  
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null)
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory[]>([])
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAssignment: AssignmentDetails = {
      id: assignmentId,
      title: "Data Structures Implementation",
      description: "Implement basic data structures including arrays, linked lists, and stacks. Submit your code with proper documentation and test cases.",
      courseId: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      dueDate: "2024-01-25T23:59:00",
      totalPoints: 100,
      status: "pending",
      submissionType: "both",
      allowLateSubmission: true,
      createdAt: "2024-01-15",
      instructions: `
1. Implement the following data structures in your preferred programming language:
   - Dynamic Array
   - Singly Linked List
   - Stack (using array and linked list)
   - Queue (using array and linked list)

2. Include comprehensive test cases for each implementation
3. Add proper documentation and comments
4. Submit both source code and a README file
5. Include time complexity analysis for each operation

Evaluation Criteria:
- Correctness (40%)
- Code Quality (25%)
- Documentation (20%)
- Test Coverage (15%)
      `,
      rubric: `
Excellent (90-100): All implementations correct, excellent documentation, comprehensive tests
Good (80-89): Minor issues, good documentation, adequate tests
Satisfactory (70-79): Some issues, basic documentation, minimal tests
Needs Improvement (60-69): Multiple issues, poor documentation, insufficient tests
Unsatisfactory (0-59): Major issues, no documentation, no tests
      `
    }

    const mockHistory: SubmissionHistory[] = [
      {
        id: "1",
        submittedAt: "2024-01-20T14:30:00",
        status: "draft",
        textContent: "Work in progress...",
        attachments: ["draft_implementation.py"]
      }
    ]

    setAssignment(mockAssignment)
    setSubmissionHistory(mockHistory)
    setLoading(false)
  }, [assignmentId])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const timeUntilDue = useMemo(() => {
    if (!assignment) return null
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    const diffMs = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays
  }, [assignment])

  const isOverdue = useMemo(() => {
    return timeUntilDue !== null && timeUntilDue < 0 && assignment?.status !== "graded"
  }, [timeUntilDue, assignment])

  const isDueSoon = useMemo(() => {
    return timeUntilDue !== null && timeUntilDue <= 2 && timeUntilDue >= 0
  }, [timeUntilDue])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmitAssignment = () => {
    setSubmissionText("")
    setSubmissionFiles([])
    setSubmissionDialogOpen(true)
  }

  const handleSaveSubmission = () => {
    if (!assignment) return
    
    // Here you would save the submission to database
    console.log('Submitting assignment:', {
      assignmentId: assignment.id,
      text: submissionText,
      files: submissionFiles
    })
    
    setSubmissionDialogOpen(false)
  }

  const handleFileUpload = (files: FileList | File[]) => {
    const newFiles = Array.from(files)
    setSubmissionFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Chip label="Pending" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "submitted":
        return <Chip label="Submitted" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "graded":
        return <Chip label="Graded" sx={{ bgcolor: '#333333', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "late":
        return <Chip label="Late" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "overdue":
        return <Chip label="Overdue" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
    }
  }

  const getGradeColor = (grade: number, total: number) => {
    const percentage = (grade / total) * 100
    if (percentage >= 90) return "#000000"
    if (percentage >= 80) return "#333333"
    if (percentage >= 70) return "#666666"
    return "#999999"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
          <p className="mt-4 text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Assignment not found</p>
          <MUIButton 
            onClick={() => router.back()}
            sx={{ mt: 2 }}
          >
            Go Back
          </MUIButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-poppins">{assignment.title}</h1>
          <p className="text-muted-foreground font-dm-sans">
            {assignment.courseCode} - {assignment.courseName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(assignment.status)}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatNumber(assignment.totalPoints)} pts
          </Typography>
        </div>
      </div>

      {/* Urgency Alert */}
      {(isOverdue || isDueSoon) && (
        <Alert 
          severity={isOverdue ? "error" : "warning"}
          sx={{ 
            border: '1px solid #000',
            backgroundColor: isOverdue ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--warning) / 0.1)',
            borderRadius: 2,
            '& .MuiAlert-icon': { 
              color: isOverdue ? 'hsl(var(--destructive))' : 'hsl(var(--warning))' 
            }
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {isOverdue ? "⚠️ Assignment Overdue" : "⏰ Due Soon"}
            </Typography>
            <Typography variant="body2">
              {isOverdue 
                ? `This assignment was due ${Math.abs(timeUntilDue || 0)} days ago`
                : `This assignment is due in ${timeUntilDue} day${timeUntilDue === 1 ? '' : 's'}`
              }
            </Typography>
          </Box>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Description */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                Assignment Description
              </Typography>
              <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, mb: 3 }}>
                {assignment.description}
              </Typography>
              
              {assignment.instructions && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                    Instructions
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'hsl(var(--muted) / 0.5)', 
                    borderRadius: 2,
                    border: '1px solid #000'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'muted-foreground', 
                        fontFamily: 'DM Sans, sans-serif', 
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {assignment.instructions}
                    </Typography>
                  </Box>
                </Box>
              )}
            </MUICardContent>
          </MUICard>

          {/* Rubric */}
          {assignment.rubric && (
            <MUICard sx={CARD_SX}>
              <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                  Grading Rubric
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'hsl(var(--muted) / 0.5)', 
                  borderRadius: 2,
                  border: '1px solid hsl(var(--border))'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'muted-foreground', 
                      fontFamily: 'DM Sans, sans-serif', 
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {assignment.rubric}
                  </Typography>
                </Box>
              </MUICardContent>
            </MUICard>
          )}

          {/* Submission History */}
          {submissionHistory.length > 0 && (
            <MUICard sx={CARD_SX}>
              <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                  Submission History
                </Typography>
                <Table sx={{ 
                  '& .MuiTableCell-root': { 
                    borderColor: '#000',
                    borderWidth: '1px'
                  },
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    borderColor: '#000',
                    borderWidth: '1px',
                    backgroundColor: 'hsl(var(--muted) / 0.3)'
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Files</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissionHistory.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {formatDate(submission.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={submission.status}
                            sx={{ 
                              bgcolor: submission.status === 'graded' ? '#000000' : '#666666',
                              color: 'white',
                              fontWeight: 600,
                              border: '1px solid #000000'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {submission.attachments?.length || 0} file(s)
                        </TableCell>
                        <TableCell>
                          {submission.grade ? (
                            <Typography sx={{ fontWeight: 600 }}>
                              {formatNumber(submission.grade)}/{formatNumber(assignment.totalPoints)}
                            </Typography>
                          ) : (
                            <Typography sx={{ color: 'muted-foreground' }}>-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </MUICardContent>
            </MUICard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                Assignment Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                    Instructor
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {assignment.instructor}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                    Due Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {formatDate(assignment.dueDate)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                    Points
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {formatNumber(assignment.totalPoints)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                    Submission Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {assignment.submissionType === 'both' ? 'Text & Files' : 
                     assignment.submissionType === 'file' ? 'Files Only' : 'Text Only'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontFamily: 'DM Sans, sans-serif' }}>
                    Late Submissions
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {assignment.allowLateSubmission ? 'Allowed' : 'Not Allowed'}
                  </Typography>
                </Box>
              </Box>
            </MUICardContent>
          </MUICard>

          {/* Grade Display */}
          {assignment.status === 'graded' && assignment.grade !== undefined && (
            <MUICard sx={CARD_SX}>
              <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                  Your Grade
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      fontWeight: 700,
                      color: getGradeColor(assignment.grade, assignment.totalPoints)
                    }}
                  >
                    {formatNumber(assignment.grade)}/{formatNumber(assignment.totalPoints)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'muted-foreground' }}>
                    {Math.round((assignment.grade / assignment.totalPoints) * 100)}%
                  </Typography>
                </Box>

                {assignment.feedback && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'hsl(var(--muted) / 0.5)', 
                    borderRadius: 2,
                    border: '1px solid #000'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Instructor Feedback:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'muted-foreground', fontStyle: 'italic' }}>
                      "{assignment.feedback}"
                    </Typography>
                  </Box>
                )}
              </MUICardContent>
            </MUICard>
          )}

          {/* Action Buttons */}
          <MUICard sx={CARD_SX}>
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {assignment.status === 'pending' && (
                  <MUIButton 
                    variant="contained"
                    fullWidth
                    onClick={handleSubmitAssignment}
                    sx={BUTTON_STYLES.primary}
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </MUIButton>
                )}
                
                <MUIButton 
                  variant="outlined" 
                  fullWidth
                  sx={BUTTON_STYLES.outlined}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Instructions
                </MUIButton>
              </Box>
            </MUICardContent>
          </MUICard>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog 
        open={submissionDialogOpen} 
        onClose={() => setSubmissionDialogOpen(false)} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            border: '2px solid #000',
            borderRadius: 3,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
          Submit Assignment: {assignment.title}
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{
            borderColor: '#000',
            borderWidth: '1px'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" sx={{ color: 'muted-foreground' }}>
              {assignment.description}
            </Typography>
            
            {assignment.submissionType !== 'file' && (
              <TextField 
                label="Assignment Text" 
                value={submissionText} 
                onChange={(e) => setSubmissionText(e.target.value)} 
                multiline 
                rows={6} 
                fullWidth 
                placeholder="Type your assignment response here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                    '&:hover fieldset': { borderColor: '#000' },
                    '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))',
                    '&.Mui-focused': { color: '#000' },
                  },
                }}
              />
            )}
            
            {assignment.submissionType !== 'text' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                  Attach Files
                </Typography>
                
                {/* Drag and Drop Upload Area */}
                <Box
                  sx={{
                    ...FILE_UPLOAD_SX,
                    ...(isDragOver && { 
                      borderColor: 'hsl(var(--primary))',
                      backgroundColor: 'hsl(var(--primary) / 0.1)' 
                    })
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <ArrowUpTrayIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
                    Drop files here or click to browse
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'muted-foreground', fontSize: '0.875rem' }}>
                    Supports: PDF, DOC, DOCX, TXT, ZIP (Max 10MB each)
                  </Typography>
                </Box>

                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.zip,.py,.js,.html,.css,.cpp,.java,.c"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                  style={{ display: 'none' }}
                />

                {/* File List */}
                {submissionFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      Selected Files ({submissionFiles.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {submissionFiles.map((file, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 1.5,
                          border: '1px solid #000',
                          borderRadius: 1,
                          backgroundColor: 'hsl(var(--muted) / 0.3)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <PaperClipIcon className="h-4 w-4 text-muted-foreground" />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                fontFamily: 'Poppins, sans-serif',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'muted-foreground' }}>
                                {formatFileSize(file.size)}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveFile(index)}
                            sx={{ 
                              color: 'hsl(var(--destructive))',
                              '&:hover': { backgroundColor: 'hsl(var(--destructive) / 0.1)' }
                            }}
                          >
                            ✕
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <MUIButton 
            onClick={() => setSubmissionDialogOpen(false)}
            sx={{
              color: 'hsl(var(--muted-foreground))',
              '&:hover': { backgroundColor: 'hsl(var(--muted))' }
            }}
          >
            Cancel
          </MUIButton>
          <MUIButton 
            variant="contained" 
            onClick={handleSaveSubmission}
            sx={BUTTON_STYLES.primary}
          >
            Submit Assignment
          </MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}


