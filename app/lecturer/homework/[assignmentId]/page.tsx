"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Box, Typography, Card as MUICard, CardContent as MUICardContent,
  Button as MUIButton, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, LinearProgress
} from "@mui/material"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatNumber } from "@/lib/utils"

interface Submission {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  assignmentTitle: string
  courseCode: string
  submittedAt: string
  grade: number | null
  maxGrade: number
  status: "graded" | "submitted" | "late"
  latePenaltyApplied: number
  finalGrade: number | null
  comments: string
}

export default function AssignmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = (params?.assignmentId as string) || ""

  // Mock: In real app, fetch by assignmentId
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [gradingOpen, setGradingOpen] = useState(false)
  const [current, setCurrent] = useState<Submission | null>(null)
  const [grade, setGrade] = useState(0)
  const [comments, setComments] = useState("")

  useEffect(() => {
    // TODO: replace with fetch
    setSubmissions([
      { id: "1", studentId: "1", studentName: "John Doe", assignmentId, assignmentTitle: "Assignment", courseCode: "CS101", submittedAt: "2024-01-20T14:30:00", grade: 92, maxGrade: 100, status: "graded", latePenaltyApplied: 0, finalGrade: 92, comments: "Great" },
      { id: "2", studentId: "2", studentName: "Jane Smith", assignmentId, assignmentTitle: "Assignment", courseCode: "CS101", submittedAt: "2024-01-21T10:00:00", grade: null, maxGrade: 100, status: "submitted", latePenaltyApplied: 0, finalGrade: null, comments: "" },
    ])
  }, [assignmentId])

  const pending = useMemo(() => submissions.filter(s => s.status !== "graded").length, [submissions])
  const graded = useMemo(() => submissions.filter(s => s.status === "graded").length, [submissions])

  const openGrade = (s: Submission) => {
    setCurrent(s)
    setGrade(s.grade ?? 0)
    setComments(s.comments)
    setGradingOpen(true)
  }

  const saveGrade = () => {
    if (!current) return
    // TODO: compute penalties and sync to gradebook
    setSubmissions(prev => prev.map(s => s.id === current.id ? { ...s, grade, finalGrade: grade, status: "graded", comments } : s))
    setGradingOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Assignment Details</h1>
          <p className="text-muted-foreground">View and grade submissions</p>
        </div>
        <div className="flex gap-2">
          <MUIButton variant="outlined" onClick={() => router.back()}>Back</MUIButton>
        </div>
      </div>

      <MUICard sx={{ bgcolor: 'card', border: '1px solid', borderColor: 'border', borderRadius: 3 }}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              label={`Graded: ${graded}`} 
              sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }}
            />
            <Chip 
              label={`Pending: ${pending}`} 
              sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }}
            />
            <Chip 
              label={`Total: ${submissions.length}`} 
              sx={{ bgcolor: '#333333', color: 'white', fontWeight: 600, border: '1px solid #000000' }}
            />
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Grade</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map(s => (
                <TableRow key={s.id}>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{s.studentName}</TableCell>
                  <TableCell sx={{ fontFamily: 'DM Sans, sans-serif' }}>{formatDate(s.submittedAt)}</TableCell>
                  <TableCell>
                    {s.grade !== null ? (
                      <Box className="flex items-center gap-2">
                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{formatNumber(s.grade)}</Typography>
                        <Typography sx={{ color: 'muted-foreground' }}>/ {formatNumber(s.maxGrade)}</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ color: 'muted-foreground' }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={s.status}
                      sx={{ 
                        bgcolor: s.status === 'graded' ? '#000000' : s.status === 'late' ? '#666666' : '#333333',
                        color: 'white',
                        fontWeight: 600,
                        border: '1px solid #000000'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <MUIButton variant="outlined" size="small" onClick={() => openGrade(s)}>{s.status === 'graded' ? 'View' : 'Grade'}</MUIButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </MUICardContent>
      </MUICard>

      <Dialog open={gradingOpen} onClose={() => setGradingOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Grade Submission</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Grade" type="number" value={grade} onChange={(e) => setGrade(Number(e.target.value))} fullWidth />
            <TextField label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} multiline rows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <MUIButton onClick={() => setGradingOpen(false)}>Cancel</MUIButton>
          <MUIButton variant="contained" onClick={saveGrade}>Save</MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}






