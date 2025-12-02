"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Box,
  Card as MUICard,
  CardContent as MUICardContent,
  Typography,
  TextField,
  Button as MUIButton,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material"
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline"
import { useGrades, useCourses, useAcademicStructure, useAuth } from "@/lib/domains"
import { toast } from "sonner"

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

export default function StudentGradeManagementPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ studentId: string }>
  searchParams: Promise<{ courseId?: string; sectionId?: string }>
}) {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string>("")
  const [courseId, setCourseId] = useState<string>("")
  const [sectionId, setSectionId] = useState<string>("")
  
  // Domain hooks
  const grades = useGrades()
  const courses = useCourses()
  const academic = useAcademicStructure()
  const auth = useAuth()
  
  // Extract state and methods
  const { 
    state: gradesState,
    getStudentGradesByCourse,
    calculateFinalGrade,
    saveStudentGrade
  } = grades
  
  const { state: coursesState } = courses
  const { state: academicState } = academic
  const { state: authState } = auth
  
  // Handle async params and searchParams
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      const resolvedSearchParams = await searchParams
      
      setStudentId(resolvedParams.studentId)
      if (resolvedSearchParams.courseId) {
        setCourseId(resolvedSearchParams.courseId)
      }
      if (resolvedSearchParams.sectionId) {
        setSectionId(resolvedSearchParams.sectionId)
      }
    }
    
    loadParams()
  }, [params, searchParams])

  // ============================================================================
  // STATE
  // ============================================================================

  const [studentGrades, setStudentGrades] = useState<{[categoryId: string]: number}>({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!studentId) return
      
      setLoading(true)
      try {
        const results = await Promise.allSettled([
          auth.loadCurrentUser(),
          grades.fetchAssignments(),
          grades.fetchSubmissions(),
          courses.fetchCourses(),
          courses.fetchLecturerAssignments(),
          academic.fetchSections(),
          academic.fetchSectionEnrollments(),
          academic.fetchStudentProfiles()
        ])

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Failed to load student grade data (${index}):`, result.reason)
          }
        })
      } catch (error) {
        console.error('Error loading student grade data:', error)
        toast.error('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [studentId])

  // Load grade categories when course is selected
  useEffect(() => {
    if (courseId) {
      grades.fetchGradeCategoriesForCourse(courseId)
      grades.fetchStudentGradesForCourse(courseId)
    }
  }, [courseId])

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Get student information
  const student = useMemo(() => {
    if (!studentId) return null
    
    const studentProfile = academicState.studentProfiles?.find((profile: any) => 
      profile.user_id === studentId
    )
    
    if (!studentProfile) return null
    
    return {
      id: studentProfile.user_id,
      name: studentProfile.users?.full_name || 'Unknown Student',
      email: studentProfile.users?.email || '',
      student_id: studentProfile.student_id || '',
      profile: studentProfile
    }
  }, [studentId, academicState.studentProfiles])

  // Get current course information
  const currentCourse = useMemo(() => {
    if (!courseId) return null
    return coursesState.courses?.find((course: any) => course.id === courseId)
  }, [courseId, coursesState.courses])

  // Get current section information
  const currentSection = useMemo(() => {
    if (!sectionId) return null
    return academicState.sections?.find((section: any) => section.id === sectionId)
  }, [sectionId, academicState.sections])

  // Get grade categories for the course
  const gradeCategories = useMemo(() => {
    if (!courseId) return { categories: [], totalPercentage: 0 }
    
    const categories = gradesState.gradeCategories || []
    const totalPercentage = categories.reduce((sum: number, cat: any) => sum + cat.percentage, 0)
    
    return {
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        percentage: cat.percentage,
        isDefault: cat.is_default || false
      })),
      totalPercentage
    }
  }, [courseId, gradesState.gradeCategories])

  // Get existing student grades for the course
  const existingGrades = useMemo(() => {
    if (!studentId || !courseId) return {}
    
    const studentGrades = gradesState.studentGrades?.filter((grade: any) => 
      grade.student_id === studentId && grade.course_id === courseId
    ) || []
    
    const gradesMap: {[categoryId: string]: number} = {}
    studentGrades.forEach((grade: any) => {
      gradesMap[grade.category_id] = grade.percentage
    })
    
    return gradesMap
  }, [studentId, courseId, gradesState.studentGrades])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const calculateFinalGradeValue = () => {
    if (!studentId || !courseId) return 0
    
    // Use the domain hook's calculation if available
    if (calculateFinalGrade) {
      return calculateFinalGrade(studentId, courseId)
    }
    
    // Fallback calculation
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
    if (percentage >= 90) return '#000000'
    if (percentage >= 80) return '#333333'
    if (percentage >= 70) return '#666666'
    if (percentage >= 60) return '#999999'
    return '#cccccc'
  }

  const finalGrade = calculateFinalGradeValue()
  const letterGrade = getLetterGrade(finalGrade)
  const gradeColor = getGradeColor(finalGrade)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGradeChange = useCallback((categoryId: string, grade: number) => {
    setStudentGrades(prev => ({
      ...prev,
      [categoryId]: Math.max(0, Math.min(100, grade))
    }))
  }, [])

  const handleSaveGrades = useCallback(async () => {
    if (!student || !courseId) return
    
    try {
      setLoading(true)
      
      // Save each grade category
      for (const [categoryId, grade] of Object.entries(studentGrades)) {
        if (grade > 0) {
          await saveStudentGrade(student.id, courseId, categoryId, grade)
        }
      }
      
      toast.success('Grades saved successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving grades:', error)
      toast.error('Failed to save grades')
    } finally {
      setLoading(false)
    }
  }, [student, courseId, studentGrades, saveStudentGrade])

  const handleCancelEdit = useCallback(() => {
    setStudentGrades(existingGrades)
    setIsEditing(false)
  }, [existingGrades])

  const handleStartEdit = useCallback(() => {
    setStudentGrades(existingGrades)
    setIsEditing(true)
  }, [existingGrades])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading while params are being resolved or data is loading
  if (!studentId || loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif" }}>
            Loading student data...
          </Typography>
        </Box>
      </Box>
    )
  }

  // Show error if student not found
  if (!student) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", mb: 2 }}>
            Student not found
          </Typography>
          <MUIButton
            variant="outlined"
            onClick={() => router.back()}
            startIcon={<ArrowLeftIcon className="w-4 h-4" />}
            sx={{ fontFamily: "DM Sans" }}
          >
            Go Back
          </MUIButton>
        </Box>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <MUIButton
                variant="outlined"
                onClick={() => router.back()}
                startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                sx={{ 
                  fontFamily: "DM Sans",
                  borderColor: "#6b7280",
                  color: "#6b7280"
                }}
              >
                Back
              </MUIButton>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'card-foreground',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Grade Management
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: 'muted-foreground',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              Manage grades for {student.name}
            </Typography>
            {currentCourse && (
              <Typography
                variant="body2"
                sx={{
                  color: 'muted-foreground',
                  fontFamily: 'DM Sans, sans-serif',
                  mt: 1
                }}
              >
                Course: {currentCourse.course_name} ({currentCourse.course_code})
              </Typography>
            )}
            {currentSection && (
              <Typography
                variant="body2"
                sx={{
                  color: 'muted-foreground',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                Section: {(currentSection as any).programs?.program_code || 'UNKNOWN'} {currentSection.section_code}
              </Typography>
            )}
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
                onClick={handleStartEdit}
                disabled={!courseId}
                sx={{
                  bgcolor: courseId ? "#000" : "#ccc",
                  color: "white",
                  fontFamily: "DM Sans",
                  textTransform: "none",
                  "&:hover": { bgcolor: courseId ? "#111" : "#ccc" }
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
                  {student.student_id} • {student.email}
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
      {courseId && (
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
                      bgcolor: finalGrade >= 60 ? '#000000' : '#666666',
                      color: 'white',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      border: '1px solid #000000'
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </MUICardContent>
        </MUICard>
        </motion.div>
      )}
    </Box>
  )
}