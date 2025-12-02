"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Box,
  Card as MUICard,
  CardContent as MUICardContent,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UserGroupIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import StatCard from "@/components/dashboard/stat-card"
import MonochromeButton from "@/components/admin/MonochromeButton"
import { useGrades, useCourses, useAcademicStructure, useAuth } from "@/lib/domains"
import { useMockData } from "@/lib/hooks/useMockData"
import { GradeCategory } from "@/lib/types/shared"

// ============================================================================
// TYPES
// ============================================================================

interface Student {
  id: string
  full_name: string
  student_id: string
  email: string
}

interface Course {
  id: string
  course_code: string
  course_name: string
  enrolled: number
}

// Using shared types from DataContext

// ============================================================================
// COMPONENT
// ============================================================================

export default function GradebookPage() {
  const router = useRouter()
  const grades = useGrades()
  const courses = useCourses()
  const academic = useAcademicStructure()
  const auth = useAuth()
  
  // Extract state and methods
  const { 
    state: gradesState,
    getStudentGradesByCourse,
    getCourseGradeSummary,
    calculateFinalGrade,
    updateGradeCategory,
    fetchGradeCategoriesForCourse,
    saveGradeCategoriesForCourse,
    fetchStudentGradesForCourse
  } = grades
  
  const { 
    state: coursesState,
    getCoursesByLecturer, 
    getStudentsByCourse,
    fetchCourses
  } = courses
  
  const { state: academicState } = academic
  const { state: authState } = auth
  
  const { isInitialized } = useMockData()

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const results = await Promise.allSettled([
        auth.loadCurrentUser(),
        grades.fetchAssignments(),
        grades.fetchSubmissions(),
        courses.fetchCourses(),
        courses.fetchCourseAssignments(),
        courses.fetchLecturerAssignments(), // ✅ Load lecturer assignments
        academic.fetchSections(), // ✅ Load sections data
        academic.fetchSectionEnrollments(),
        academic.fetchStudentProfiles() // ✅ Load student profiles
      ])

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to load gradebook data (${index}):`, result.reason)
        }
      })
    }

    loadData()
  }, []) // Remove dependencies to prevent infinite re-renders
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [activeTab, setActiveTab] = useState(0)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryPercentage, setNewCategoryPercentage] = useState(0)
  const [gradeScaleDialogOpen, setGradeScaleDialogOpen] = useState(false)
  const [newGradeDialogOpen, setNewGradeDialogOpen] = useState(false)
  const [newGradeLetter, setNewGradeLetter] = useState("")
  const [newGradeMin, setNewGradeMin] = useState(0)
  const [newGradeMax, setNewGradeMax] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Get lecturer's courses - using lecturer_assignments table like courses page
  const lecturerCourses = useMemo(() => {
    const lecturerId = authState.currentUser?.id
    console.log('🔍 Gradebook Debug:', {
      lecturerId,
      totalCourses: coursesState.courses.length,
      lecturerAssignments: coursesState.lecturerAssignments?.length || 0,
      loading: coursesState.loading
    })
    
    if (!lecturerId) return []

    // Get lecturer's assigned courses from lecturer_assignments table (like courses page)
    const lecturerAssignments = coursesState.lecturerAssignments?.filter((assignment: any) => 
      assignment.lecturer_id === lecturerId
    ) || []
    
    console.log('📋 Lecturer assignments found:', lecturerAssignments.length)
    
    const lecturerCourses = lecturerAssignments.map((assignment: any) => {
      const course = coursesState.courses?.find((c: any) => c.id === assignment.course_id)
      return course
    }).filter(Boolean)
    
    console.log('📚 Lecturer courses found:', lecturerCourses.length)
    
    // Fallback: If no lecturer assignments, try direct course assignment
    if (lecturerCourses.length === 0) {
      const directCourses = coursesState.courses?.filter((course: any) => course.lecturer_id === lecturerId) || []
      console.log('🔄 Fallback - Direct courses found:', directCourses.length)
      return directCourses
    }
    
    return lecturerCourses
  }, [coursesState.courses, coursesState.lecturerAssignments, authState.currentUser?.id])

  // Load grade categories and student grades when course changes
  useEffect(() => {
    if (!selectedCourse) return
    fetchGradeCategoriesForCourse(selectedCourse)
    fetchStudentGradesForCourse(selectedCourse)
  }, [selectedCourse, fetchGradeCategoriesForCourse, fetchStudentGradesForCourse])
  
  // Get classes/sections that the lecturer is teaching - from lecturer_assignments
  const classes = useMemo(() => {
    const lecturerId = authState.currentUser?.id
    console.log('🔍 Gradebook Classes Debug:', {
      lecturerId,
      lecturerAssignmentsCount: coursesState.lecturerAssignments?.length || 0,
      lecturerAssignments: coursesState.lecturerAssignments?.slice(0, 2),
      sectionsCount: academicState.sections?.length || 0
    })
    
    if (!lecturerId || !coursesState.lecturerAssignments) return []

    // Get unique sections from lecturer assignments
    const lecturerSections = coursesState.lecturerAssignments
      .filter((assignment: any) => assignment.lecturer_id === lecturerId)
      .map((assignment: any) => {
        // Find the section from academic structure
        const section = academicState.sections.find((s: any) => s.id === assignment.section_id)
        console.log('🔍 Assignment to section mapping:', {
          assignmentId: assignment.id,
          sectionId: assignment.section_id,
          foundSection: !!section,
          sectionCode: section?.section_code,
          programCode: (section as any)?.programs?.program_code,
          fullCode: section ? `${(section as any).programs?.program_code || 'UNKNOWN'} ${section.section_code}` : undefined
        })
        return section
      })
      .filter(Boolean) // Remove undefined sections
      .filter((section: any, index: number, arr: any[]) => 
        arr.findIndex(s => s.id === section.id) === index // Remove duplicates
      )

    console.log('🏫 Lecturer sections found:', lecturerSections.length)
    return lecturerSections
  }, [coursesState.lecturerAssignments, academicState.sections, authState.currentUser?.id])
  
  // Get courses available for selected class/section
  const availableCourses = useMemo(() => {
    if (!selectedClass) return lecturerCourses
    
    // Filter courses by selected section
    const sectionCourses = lecturerCourses.filter((course: any) => {
      // Find lecturer assignment for this course and section
      const assignment = coursesState.lecturerAssignments?.find((assignment: any) => 
        assignment.course_id === course.id && assignment.section_id === selectedClass
      )
      return !!assignment
    })
    
    console.log('📚 Courses for selected section:', sectionCourses.length)
    return sectionCourses
  }, [selectedClass, lecturerCourses, coursesState.lecturerAssignments])

  // Get students for selected class and course
  const availableStudents = useMemo(() => {
    if (!selectedClass || !selectedCourse) return []
    
    // Get students enrolled in the selected section
    const sectionStudents = academicState.sectionEnrollments
      ?.filter((enrollment: any) => enrollment.section_id === selectedClass)
      ?.map((enrollment: any) => {
        // Find the student profile
        const studentProfile = academicState.studentProfiles?.find((profile: any) => 
          profile.user_id === enrollment.student_id
        )
        
        // Get user information from the profile
        if (studentProfile) {
          return {
            id: studentProfile.user_id,
            name: studentProfile.users?.full_name || 'Unknown Student',
            email: studentProfile.users?.email || '',
            student_id: studentProfile.student_id || '',
            profile: studentProfile
          }
        }
        return null
      })
      ?.filter(Boolean) || []
    
    console.log('👥 Students in selected section:', {
      selectedClass,
      selectedCourse,
      sectionStudentsCount: sectionStudents.length,
      sectionStudents: sectionStudents.slice(0, 3).map(s => s ? {
        id: s.id,
        name: s.name,
        student_id: s.student_id
      } : null).filter(Boolean)
    })
    
    return sectionStudents
  }, [selectedClass, selectedCourse, academicState.sectionEnrollments, academicState.studentProfiles])

  // Get current course and class info
  const currentCourse = lecturerCourses.find((c: any) => c.id === selectedCourse)
  const currentClass = classes.find((c: any) => c.id === selectedClass)

  // Grade categories for the selected course
  const gradeCategories = useMemo(() => ({
    categories: gradesState.gradeCategories,
    totalPercentage: gradesState.gradeCategories.reduce((sum: number, cat: any) => sum + cat.percentage, 0)
  }), [gradesState.gradeCategories])

  // Grade scale (static for now)
  const gradeScale = useMemo(() => [
    { id: 'a-plus', letter: 'A+', minPercentage: 97, maxPercentage: 100, description: 'Excellent' },
    { id: 'a', letter: 'A', minPercentage: 93, maxPercentage: 96, description: 'Excellent' },
    { id: 'a-minus', letter: 'A-', minPercentage: 90, maxPercentage: 92, description: 'Excellent' },
    { id: 'b-plus', letter: 'B+', minPercentage: 87, maxPercentage: 89, description: 'Good' },
    { id: 'b', letter: 'B', minPercentage: 83, maxPercentage: 86, description: 'Good' },
    { id: 'b-minus', letter: 'B-', minPercentage: 80, maxPercentage: 82, description: 'Good' },
    { id: 'c-plus', letter: 'C+', minPercentage: 77, maxPercentage: 79, description: 'Satisfactory' },
    { id: 'c', letter: 'C', minPercentage: 73, maxPercentage: 76, description: 'Satisfactory' },
    { id: 'c-minus', letter: 'C-', minPercentage: 70, maxPercentage: 72, description: 'Satisfactory' },
    { id: 'd-plus', letter: 'D+', minPercentage: 67, maxPercentage: 69, description: 'Passing' },
    { id: 'd', letter: 'D', minPercentage: 63, maxPercentage: 66, description: 'Passing' },
    { id: 'd-minus', letter: 'D-', minPercentage: 60, maxPercentage: 62, description: 'Passing' },
    { id: 'f', letter: 'F', minPercentage: 0, maxPercentage: 59, description: 'Failing' }
  ], [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================


  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return gradeCategories.categories.reduce((sum: number, category: any) => sum + category.percentage, 0)
  }, [gradeCategories.categories])

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = availableStudents.length
    const totalCategories = gradeCategories.categories.length
    
    // Calculate average grade from actual student grades
    let averageGrade = 0
    let passingRate = 0
    let totalGraded = 0
    
    if (selectedCourse && availableStudents.length > 0) {
      const studentGrades = availableStudents.map((student: any) => {
        const grades = getStudentGradesByCourse(student.id, selectedCourse)
        const finalGrade = calculateFinalGrade(student.id, selectedCourse)
        return { student, grades, finalGrade }
      })
      
      const studentsWithGrades = studentGrades.filter(sg => sg.finalGrade > 0)
      totalGraded = studentsWithGrades.length
      
      if (studentsWithGrades.length > 0) {
        averageGrade = studentsWithGrades.reduce((sum, sg) => sum + sg.finalGrade, 0) / studentsWithGrades.length
        passingRate = (studentsWithGrades.filter(sg => sg.finalGrade >= 60).length / studentsWithGrades.length) * 100
      }
    }

    return {
      totalStudents,
      totalCategories,
      averageGrade: Math.round(averageGrade * 10) / 10,
      passingRate: Math.round(passingRate * 10) / 10,
      totalGraded
    }
  }, [availableStudents, gradeCategories.categories, selectedCourse, getStudentGradesByCourse, calculateFinalGrade])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpenGradeManagement = (student: Student) => {
    const queryParams = new URLSearchParams()
    if (selectedCourse) {
      queryParams.set('courseId', selectedCourse)
    }
    if (selectedClass) {
      queryParams.set('sectionId', selectedClass)
    }
    
    const queryString = queryParams.toString()
    const url = `/lecturer/gradebook/${student.id}${queryString ? `?${queryString}` : ''}`
    router.push(url)
  }

  const handleUpdateCategoryPercentage = (categoryId: string, percentage: number) => {
    const updatedCategories = gradesState.gradeCategories.map((cat: any) => 
      cat.id === categoryId ? { ...cat, percentage } : cat
    )
    updateGradeCategory(selectedCourse, updatedCategories)
    if (selectedCourse) {
      saveGradeCategoriesForCourse(selectedCourse, updatedCategories)
    }
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() && newCategoryPercentage > 0) {
      const newCategory: GradeCategory = {
        id: `cat_${Date.now()}`,
        name: newCategoryName.trim(),
        percentage: newCategoryPercentage,
        is_default: false,
        course_id: selectedCourse
      }
      
      const updatedCategories = [...gradesState.gradeCategories, newCategory]
      updateGradeCategory(selectedCourse, updatedCategories)
      if (selectedCourse) {
        saveGradeCategoriesForCourse(selectedCourse, updatedCategories)
      }
      
      setNewCategoryName("")
      setNewCategoryPercentage(0)
      setNewCategoryDialogOpen(false)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = gradesState.gradeCategories.filter((cat: any) => cat.id !== categoryId)
    updateGradeCategory(selectedCourse, updatedCategories)
    if (selectedCourse) {
      saveGradeCategoriesForCourse(selectedCourse, updatedCategories)
    }
  }

  const handleUpdateGradeScale = (gradeId: string, field: 'minPercentage' | 'maxPercentage', value: number) => {
    // Grade scale is static for now - could be made dynamic later
    console.log('Update grade scale:', { gradeId, field, value })
  }

  const handleAddGrade = () => {
    if (newGradeLetter.trim() && newGradeMin >= 0 && newGradeMax >= newGradeMin) {
      // Grade scale is static for now - could be made dynamic later
      console.log('Add grade:', { letter: newGradeLetter, min: newGradeMin, max: newGradeMax })
      
      setNewGradeLetter("")
      setNewGradeMin(0)
      setNewGradeMax(0)
      setNewGradeDialogOpen(false)
    }
  }

  const handleDeleteGrade = (gradeId: string) => {
    // Grade scale is static for now - could be made dynamic later
    console.log('Delete grade:', gradeId)
  }

  const getLetterGrade = (percentage: number) => {
    const grade = gradeScale.find(g => percentage >= g.minPercentage && percentage <= g.maxPercentage)
    return grade ? grade.letter : 'F'
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
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
              Gradebook
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'muted-foreground',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              Manage student grades and track academic performance
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' }, 
        gap: { xs: 1.5, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 3 }
      }}>
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled in course"
          icon={UserGroupIcon}
          color="#000000"
          change="+12 new students enrolled"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Grade Categories"
          value={stats.totalCategories}
          subtitle="Assessment types"
          icon={ClipboardDocumentListIcon}
          color="#000000"
          change="+2 new categories added"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Class Average"
          value={`${stats.averageGrade.toFixed(1)}%`}
          subtitle="Overall performance"
          icon={StarIcon}
          color="#000000"
          change="+3.2% from last month"
          trend={{ value: 1.8, isPositive: true }}
        />
        <StatCard
          title="Passing Rate"
          value={`${stats.passingRate.toFixed(1)}%`}
          subtitle="Students passing"
          icon={CheckCircleIcon}
          color="#999999"
          change="+2.3% from last week"
          trend={{ value: 0.8, isPositive: true }}
        />
      </Box>

      {/* Course Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MUICard
          sx={{
            bgcolor: 'card',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            },
            mb: 3
          }}
        >
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'card-foreground',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Course Selection
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 3 }}>
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "200px" } }}>
                <FormControl fullWidth>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      setSelectedCourse("") // Reset course when class changes
                    }}
                    label="Select Class"
                    sx={{
                      fontFamily: "DM Sans",
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'border' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '& .MuiSelect-outlined.Mui-focused': { color: '#000' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
                    }}
                  >
                    {(() => {
                      console.log('🏫 Gradebook Class Dropdown Debug:', {
                        classesCount: classes.length,
                        classes: classes.slice(0, 3),
                        loading: coursesState.loading
                      })
                      return null
                    })()}
                    {coursesState.loading ? (
                      <MenuItem disabled>
                        <Typography sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          Loading sections...
                        </Typography>
                      </MenuItem>
                    ) : classes.length === 0 ? (
                      <MenuItem disabled>
                        <Typography sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          No sections assigned
                        </Typography>
                      </MenuItem>
                    ) : (
                      classes.filter(cls => cls).map((cls: any) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          <Box>
                            <Typography sx={{ fontFamily: "Poppins", fontWeight: 600 }}>
                              {(cls as any).programs?.program_code || 'UNKNOWN'} {cls.section_code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "DM Sans" }}>
                              {cls.level} • {(cls as any).programs?.program_name || 'Program'}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "300px" } }}>
                <FormControl fullWidth>
                  <InputLabel>Select Course</InputLabel>
                  <Select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    label="Select Course"
                    sx={{
                      fontFamily: "DM Sans",
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'border' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '& .MuiSelect-outlined.Mui-focused': { color: '#000' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
                    }}
                  >
                    {(() => {
                      console.log('🎯 Course Dropdown Debug:', {
                        availableCoursesCount: availableCourses.length,
                        availableCourses: availableCourses.slice(0, 2),
                        loading: coursesState.loading
                      })
                      return null
                    })()}
                    {coursesState.loading ? (
                      <MenuItem disabled>
                        <Typography sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          Loading courses...
                        </Typography>
                      </MenuItem>
                    ) : availableCourses.length === 0 ? (
                      <MenuItem disabled>
                        <Typography sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          No courses available
                        </Typography>
                      </MenuItem>
                    ) : (
                      availableCourses.map((course) => (
                       <MenuItem key={course?.id} value={course?.id}>
                         <Box>
                           <Typography sx={{ fontFamily: "Poppins", fontWeight: 600 }}>
                             {course?.course_code}
                           </Typography>
                           <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "DM Sans" }}>
                             {course?.course_name}
                           </Typography>
                         </Box>
                       </MenuItem>
                     ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </MUICardContent>
        </MUICard>
      </motion.div>

      {/* Grade Categories Management */}
      {selectedClass && selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MUICard
            sx={{
              bgcolor: 'card',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
              },
              mb: 3
            }}
          >
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'card-foreground',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Grade Categories - {currentClass?.section_code} - {currentCourse?.course_code}
                </Typography>
                 <MonochromeButton
                   monoVariant="outlined"
                   onClick={() => setCategoryDialogOpen(true)}
                 >
                   Edit Categories
                 </MonochromeButton>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fit, minmax(150px, 1fr))' }, gap: 2 }}>
                {gradeCategories.categories.map((category) => (
                  <Box key={category.id} sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2, position: 'relative' }}>
                    <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#000" }}>
                      {category.percentage}%
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                      {category.name}
                    </Typography>
                     <MonochromeButton
                       size="small"
                       onClick={() => handleDeleteCategory(category.id)}
                       sx={{
                         position: 'absolute',
                         top: 4,
                         right: 4,
                         minWidth: 'auto',
                         p: 0.5,
                         color: '#ef4444',
                         '&:hover': { backgroundColor: '#fef2f2' }
                       }}
                     >
                       ×
                     </MonochromeButton>
                  </Box>
                ))}
                
                {/* Add New Category Button */}
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    border: '2px dashed #d1d5db', 
                    borderRadius: 2, 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80px',
                    '&:hover': { borderColor: '#000', backgroundColor: '#f9fafb' }
                  }}
                  onClick={() => setNewCategoryDialogOpen(true)}
                >
                  <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#6b7280" }}>
                    +
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                    Add Category
                  </Typography>
                </Box>
              </Box>
              
              {/* Total Percentage Display */}
              <Box sx={{ mt: 2, p: 2, bgcolor: totalPercentage === 100 ? '#f0fdf4' : totalPercentage > 100 ? '#fef2f2' : '#fefce8', borderRadius: 2, border: `1px solid ${totalPercentage === 100 ? '#22c55e' : totalPercentage > 100 ? '#ef4444' : '#eab308'}` }}>
                <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, textAlign: 'center', color: totalPercentage === 100 ? '#16a34a' : totalPercentage > 100 ? '#dc2626' : '#ca8a04' }}>
                  Total: {totalPercentage}% {totalPercentage === 100 ? '✓' : totalPercentage > 100 ? '⚠️ Exceeds 100%' : '⚠️ Below 100%'}
                </Typography>
              </Box>
            </MUICardContent>
          </MUICard>
        </motion.div>
      )}

      {/* Grade Scale Management */}
      {selectedClass && selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MUICard
            sx={{
              bgcolor: 'card',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
              },
              mb: 3
            }}
          >
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'card-foreground',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Grade Scale - {currentClass?.section_code} - {currentCourse?.course_code}
                </Typography>
                 <MonochromeButton
                   monoVariant="outlined"
                   onClick={() => setGradeScaleDialogOpen(true)}
                 >
                   Edit Grade Scale
                 </MonochromeButton>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                {gradeScale.map((grade) => (
                  <Box key={grade.id} sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 2, 
                    position: 'relative',
                    bgcolor: grade.letter === 'F' ? '#fef2f2' : grade.letter.startsWith('A') ? '#f0fdf4' : grade.letter.startsWith('B') ? '#fefce8' : '#f9fafb'
                  }}>
                    <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#000" }}>
                      {grade.letter}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                      {grade.minPercentage}% - {grade.maxPercentage}%
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                      {grade.description}
                    </Typography>
                     <MonochromeButton
                       size="small"
                       onClick={() => handleDeleteGrade(grade.id)}
                       sx={{
                         position: 'absolute',
                         top: 4,
                         right: 4,
                         minWidth: 'auto',
                         p: 0.5,
                         color: '#ef4444',
                         '&:hover': { backgroundColor: '#fef2f2' }
                       }}
                     >
                       ×
                     </MonochromeButton>
                  </Box>
                ))}
                
                {/* Add New Grade Button */}
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    border: '2px dashed #d1d5db', 
                    borderRadius: 2, 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80px',
                    '&:hover': { borderColor: '#000', backgroundColor: '#f9fafb' }
                  }}
                  onClick={() => setNewGradeDialogOpen(true)}
                >
                  <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#6b7280" }}>
                    +
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                    Add Grade
                  </Typography>
                </Box>
              </Box>
            </MUICardContent>
          </MUICard>
        </motion.div>
      )}

      {/* Main Content */}
      {selectedClass && selectedCourse ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MUICard
            sx={{
              bgcolor: 'card',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
              }
            }}
          >
            <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'card-foreground',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Student Grades - {availableStudents.length} Students
                </Typography>
              </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280", mb: 2 }}>
                Select a class and course to view and manage student grades. Grades from Homework and Attendance pages will automatically sync here.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {availableStudents.map((student: any) => (
                  <Box 
                    key={student.id}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 2, 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: '#f9fafb' }
                    }}
                  >
                     <Box>
                       <Typography variant="body1" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
                         {student.name}
                       </Typography>
                       <Typography variant="caption" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                         {student.student_id}
                       </Typography>
                     </Box>
                     <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                       <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                         Final Grade: {selectedCourse ? `${calculateFinalGrade(student.id, selectedCourse).toFixed(1)}%` : 'N/A'}
                       </Typography>
                       <MonochromeButton
                         size="small"
                         monoVariant="outlined"
                         onClick={() => handleOpenGradeManagement(student)}
                       >
                         Manage Grades
                       </MonochromeButton>
                     </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </MUICardContent>
        </MUICard>
      </motion.div>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#6b7280", mb: 2 }}>
            Select a Class and Course
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#9ca3af" }}>
            Choose a class and course to view and manage student grades
          </Typography>
        </Box>
      )}

      {/* Grade Categories Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
          Edit Grade Categories
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {gradeCategories.categories.map((category) => (
              <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label={`${category.name} (%)`}
                  type="number"
                  value={category.percentage}
                  onChange={(e) => handleUpdateCategoryPercentage(category.id, Number(e.target.value))}
                  variant="outlined"
                  inputProps={{ min: 0, max: 100 }}
                />
                 <MonochromeButton
                   monoVariant="outlined"
                   onClick={() => handleDeleteCategory(category.id)}
                   sx={{ minWidth: 'auto', px: 2, color: '#ef4444', borderColor: '#ef4444' }}
                 >
                   Delete
                 </MonochromeButton>
              </Box>
            ))}
            
            <Box sx={{ mt: 2, p: 2, bgcolor: totalPercentage === 100 ? '#f0fdf4' : totalPercentage > 100 ? '#fef2f2' : '#fefce8', borderRadius: 2, border: `1px solid ${totalPercentage === 100 ? '#22c55e' : totalPercentage > 100 ? '#ef4444' : '#eab308'}` }}>
              <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, textAlign: 'center', color: totalPercentage === 100 ? '#16a34a' : totalPercentage > 100 ? '#dc2626' : '#ca8a04' }}>
                Total: {totalPercentage}% {totalPercentage === 100 ? '✓' : totalPercentage > 100 ? '⚠️ Exceeds 100%' : '⚠️ Below 100%'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
         <DialogActions>
           <MonochromeButton onClick={() => setCategoryDialogOpen(false)}>
             Cancel
           </MonochromeButton>
           <MonochromeButton 
             onClick={() => setCategoryDialogOpen(false)} 
             monoVariant="primary"
           >
             Save Categories
           </MonochromeButton>
         </DialogActions>
      </Dialog>

      {/* Add New Category Dialog */}
      <Dialog open={newCategoryDialogOpen} onClose={() => setNewCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
          Add New Grade Category
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              variant="outlined"
              placeholder="e.g., Lab Work, Presentations, etc."
            />
            <TextField
              fullWidth
              label="Percentage (%)"
              type="number"
              value={newCategoryPercentage}
              onChange={(e) => setNewCategoryPercentage(Number(e.target.value))}
              variant="outlined"
              inputProps={{ min: 1, max: 100 }}
            />
          </Box>
        </DialogContent>
         <DialogActions>
           <MonochromeButton onClick={() => {
             setNewCategoryDialogOpen(false)
             setNewCategoryName("")
             setNewCategoryPercentage(0)
           }}>
             Cancel
           </MonochromeButton>
           <MonochromeButton 
             onClick={handleAddCategory}
             monoVariant="primary"
             disabled={!newCategoryName.trim() || newCategoryPercentage <= 0}
           >
             Add Category
           </MonochromeButton>
         </DialogActions>
      </Dialog>

      {/* Grade Scale Dialog */}
      <Dialog open={gradeScaleDialogOpen} onClose={() => setGradeScaleDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
          Edit Grade Scale
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {gradeScale.map((grade) => (
              <Box key={grade.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Box sx={{ minWidth: 60 }}>
                  <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, textAlign: 'center' }}>
                    {grade.letter}
                  </Typography>
                </Box>
                <TextField
                  label="Min %"
                  type="number"
                  value={grade.minPercentage}
                  onChange={(e) => handleUpdateGradeScale(grade.id, 'minPercentage', Number(e.target.value))}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100 }}
                />
                <TextField
                  label="Max %"
                  type="number"
                  value={grade.maxPercentage}
                  onChange={(e) => handleUpdateGradeScale(grade.id, 'maxPercentage', Number(e.target.value))}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100 }}
                />
                <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280", minWidth: 100 }}>
                  {grade.description}
                </Typography>
                 <MonochromeButton
                   monoVariant="outlined"
                   onClick={() => handleDeleteGrade(grade.id)}
                   sx={{ minWidth: 'auto', px: 2, color: '#ef4444', borderColor: '#ef4444' }}
                 >
                   Delete
                 </MonochromeButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <MonochromeButton onClick={() => setGradeScaleDialogOpen(false)}>
            Close
          </MonochromeButton>
        </DialogActions>
      </Dialog>

      {/* Add New Grade Dialog */}
      <Dialog open={newGradeDialogOpen} onClose={() => setNewGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
          Add New Grade
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Grade Letter"
              value={newGradeLetter}
              onChange={(e) => setNewGradeLetter(e.target.value)}
              variant="outlined"
              placeholder="e.g., A+, B-, etc."
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Min Percentage"
                type="number"
                value={newGradeMin}
                onChange={(e) => setNewGradeMin(Number(e.target.value))}
                variant="outlined"
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                fullWidth
                label="Max Percentage"
                type="number"
                value={newGradeMax}
                onChange={(e) => setNewGradeMax(Number(e.target.value))}
                variant="outlined"
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
          </Box>
        </DialogContent>
         <DialogActions>
           <MonochromeButton onClick={() => {
             setNewGradeDialogOpen(false)
             setNewGradeLetter("")
             setNewGradeMin(0)
             setNewGradeMax(0)
           }}>
             Cancel
           </MonochromeButton>
           <MonochromeButton 
             onClick={handleAddGrade}
             monoVariant="primary"
             disabled={!newGradeLetter.trim() || newGradeMin < 0 || newGradeMax < newGradeMin}
           >
             Add Grade
           </MonochromeButton>
         </DialogActions>
      </Dialog>
    </Box>
  )
}