"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Box,
  Card as MUICard,
  CardContent as MUICardContent,
  Typography,
  TextField,
  Button as MUIButton,
  Chip,
  Divider
} from "@mui/material"
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

// ============================================================================
// TYPES
// ============================================================================

interface Student {
  id: string
  name: string
  matric: string
  email: string
}

interface GradeCategory {
  id: string
  name: string
  percentage: number
  isDefault: boolean
}

interface GradeCategories {
  categories: GradeCategory[]
  totalPercentage: number
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StudentGradeManagementPage({ params }: { params: Promise<{ studentId: string }> }) {
  const [studentId, setStudentId] = useState<string>("")
  
  // Handle async params
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setStudentId(resolvedParams.studentId)
    })
  }, [params])

  // ============================================================================
  // STATE
  // ============================================================================

  const [studentGrades, setStudentGrades] = useState<{[categoryId: string]: number}>({})
  const [isEditing, setIsEditing] = useState(false)

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const student: Student = {
    id: studentId,
    name: "John Doe",
    matric: "LIM-2023001",
    email: "john.doe@student.edu"
  }

  const gradeCategories: GradeCategories = {
    categories: [
      { id: 'classwork', name: 'Class Work', percentage: 20, isDefault: true },
      { id: 'homework', name: 'Homework', percentage: 30, isDefault: true },
      { id: 'groupprojects', name: 'Group Projects', percentage: 20, isDefault: true },
      { id: 'tests', name: 'Tests', percentage: 15, isDefault: true },
      { id: 'exams', name: 'Exams', percentage: 10, isDefault: true },
      { id: 'attendance', name: 'Attendance', percentage: 5, isDefault: true }
    ],
    totalPercentage: 100
  }

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const calculateFinalGrade = () => {
    let totalWeightedGrade = 0
    let totalWeight = 0

    gradeCategories.categories.forEach(category => {
      const grade = studentGrades[category.id] || 0
      totalWeightedGrade += (grade * category.percentage) / 100
      totalWeight += category.percentage
    })

    return totalWeight > 0 ? (totalWeightedGrade / totalWeight) * 100 : 0
  }

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#22c55e'
    if (percentage >= 80) return '#16a34a'
    if (percentage >= 70) return '#eab308'
    if (percentage >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const finalGrade = calculateFinalGrade()
  const letterGrade = getLetterGrade(finalGrade)
  const gradeColor = getGradeColor(finalGrade)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGradeChange = (categoryId: string, grade: number) => {
    setStudentGrades(prev => ({
      ...prev,
      [categoryId]: Math.max(0, Math.min(100, grade))
    }))
  }

  const handleSaveGrades = () => {
    // Here you would save to database
    console.log('Saving grades for', student.name, studentGrades)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setStudentGrades({})
    setIsEditing(false)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading while params are being resolved
  if (!studentId) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif" }}>
          Loading...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: { xs: 3, sm: 4 }
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'card-foreground',
                fontFamily: 'Poppins, sans-serif',
                mb: 1
              }}
            >
              Grade Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'muted-foreground',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              Manage grades for {student.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isEditing ? (
              <>
                <MUIButton
                  variant="outlined"
                  onClick={handleCancelEdit}
                  sx={{
                    borderColor: "#6b7280",
                    color: "#6b7280",
                    fontFamily: "DM Sans",
                    textTransform: "none"
                  }}
                >
                  Cancel
                </MUIButton>
                <MUIButton
                  variant="contained"
                  onClick={handleSaveGrades}
                  sx={{
                    bgcolor: "#000",
                    color: "white",
                    fontFamily: "DM Sans",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#111" }
                  }}
                >
                  Save Grades
                </MUIButton>
              </>
            ) : (
              <MUIButton
                variant="contained"
                onClick={() => setIsEditing(true)}
                sx={{
                  bgcolor: "#000",
                  color: "white",
                  fontFamily: "DM Sans",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#111" }
                }}
              >
                Edit Grades
              </MUIButton>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Student Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MUICard
          sx={{
            bgcolor: 'card',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 3,
            mb: 3
          }}
        >
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'card-foreground',
                    fontFamily: 'Poppins, sans-serif',
                    mb: 1
                  }}
                >
                  {student.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'muted-foreground',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                >
                  {student.matric} • {student.email}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: gradeColor,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {finalGrade.toFixed(1)}%
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: gradeColor,
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                >
                  Grade: {letterGrade}
                </Typography>
              </Box>
            </Box>
          </MUICardContent>
        </MUICard>
      </motion.div>

      {/* Grade Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MUICard
          sx={{
            bgcolor: 'card',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 3
          }}
        >
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'card-foreground',
                fontFamily: 'Poppins, sans-serif',
                mb: 3
              }}
            >
              Grade Categories
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {gradeCategories.categories.map((category, index) => {
                const currentGrade = studentGrades[category.id] || 0
                const weightedGrade = (currentGrade * category.percentage) / 100
                
                return (
                  <Box key={category.id}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: 'card-foreground',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'muted-foreground',
                            fontFamily: 'DM Sans, sans-serif'
                          }}
                        >
                          Weight: {category.percentage}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: currentGrade > 0 ? gradeColor : '#6b7280',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {currentGrade > 0 ? `${currentGrade}%` : 'Not Graded'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'muted-foreground',
                            fontFamily: 'DM Sans, sans-serif'
                          }}
                        >
                          Weighted: {weightedGrade.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    {isEditing ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={currentGrade}
                        onChange={(e) => handleGradeChange(category.id, Number(e.target.value))}
                        placeholder="Enter grade (0-100)"
                        inputProps={{ min: 0, max: 100 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'DM Sans, sans-serif'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: currentGrade > 0 ? '#f9fafb' : '#fef2f2',
                        borderRadius: 2,
                        border: `1px solid ${currentGrade > 0 ? '#e5e7eb' : '#fecaca'}`
                      }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: currentGrade > 0 ? '#374151' : '#dc2626',
                            fontFamily: 'DM Sans, sans-serif',
                            textAlign: 'center'
                          }}
                        >
                          {currentGrade > 0 ? `Grade: ${currentGrade}%` : 'No grade entered'}
                        </Typography>
                      </Box>
                    )}

                    {index < gradeCategories.categories.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                )
              })}
            </Box>

            {/* Grade Summary */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              bgcolor: '#f9fafb', 
              borderRadius: 2, 
              border: '1px solid #e5e7eb' 
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'card-foreground',
                  fontFamily: 'Poppins, sans-serif',
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                Grade Summary
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: gradeColor,
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {finalGrade.toFixed(1)}%
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'muted-foreground',
                      fontFamily: 'DM Sans, sans-serif'
                    }}
                  >
                    Final Grade
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: gradeColor,
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {letterGrade}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'muted-foreground',
                      fontFamily: 'DM Sans, sans-serif'
                    }}
                  >
                    Letter Grade
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={finalGrade >= 60 ? <CheckCircleIcon className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
                    label={finalGrade >= 60 ? 'Passing' : 'Failing'}
                    sx={{
                      bgcolor: finalGrade >= 60 ? '#dcfce7' : '#fef2f2',
                      color: finalGrade >= 60 ? '#16a34a' : '#dc2626',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </MUICardContent>
        </MUICard>
      </motion.div>
    </Box>
  )
}
