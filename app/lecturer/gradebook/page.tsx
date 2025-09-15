"use client"

import { useState, useMemo } from "react"
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
  Button as MUIButton,
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

// ============================================================================
// TYPES
// ============================================================================

interface Student {
  id: string
  name: string
  matric: string
  email: string
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  enrolled: number
}

interface Class {
  id: string
  name: string
  level: string
}

interface LecturerAssignment {
  classId: string
  courseId: string
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

interface GradeScale {
  id: string
  letter: string
  minPercentage: number
  maxPercentage: number
  description?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function GradebookPage() {
  const router = useRouter()
  
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
  const [gradeCategories, setGradeCategories] = useState<GradeCategories>({
    categories: [
      { id: 'classwork', name: 'Class Work', percentage: 20, isDefault: true },
      { id: 'homework', name: 'Homework', percentage: 30, isDefault: true },
      { id: 'groupprojects', name: 'Group Projects', percentage: 20, isDefault: true },
      { id: 'tests', name: 'Tests', percentage: 15, isDefault: true },
      { id: 'exams', name: 'Exams', percentage: 10, isDefault: true },
      { id: 'attendance', name: 'Attendance', percentage: 5, isDefault: true }
    ],
    totalPercentage: 100
  })

  const [gradeScale, setGradeScale] = useState<GradeScale[]>([
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
  ])

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const classes: Class[] = [
    { id: "class1", name: "Class A", level: "Year 1" },
    { id: "class2", name: "Class B", level: "Year 1" },
    { id: "class3", name: "Class C", level: "Year 2" },
    { id: "class4", name: "Class D", level: "Year 2" }
  ]

  // Lecturer's assigned courses per class
  const lecturerAssignments: LecturerAssignment[] = [
    { classId: "class1", courseId: "CS101" },
    { classId: "class1", courseId: "MATH201" },
    { classId: "class2", courseId: "CS101" },
    { classId: "class3", courseId: "CS102" },
    { classId: "class3", courseId: "PHYS301" },
    { classId: "class4", courseId: "CS102" }
  ]
  
  const courses: Course[] = useMemo(() => [
    {
      id: "CS101",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      enrolled: 45
    },
    {
      id: "MATH201",
      courseCode: "MATH201",
      courseName: "Calculus II",
      enrolled: 38
    },
    {
      id: "CS102",
      courseCode: "CS102",
      courseName: "Data Structures and Algorithms",
      enrolled: 42
    },
    {
      id: "PHYS301",
      courseCode: "PHYS301",
      courseName: "Physics III",
      enrolled: 35
    }
  ], [])

  const students: Student[] = useMemo(() => [
    { id: "s1", name: "John Doe", matric: "LIM-2023001", email: "john.doe@student.edu" },
    { id: "s2", name: "Jane Smith", matric: "LIM-2023002", email: "jane.smith@student.edu" },
    { id: "s3", name: "Mike Johnson", matric: "LIM-2023003", email: "mike.johnson@student.edu" },
    { id: "s4", name: "Alice Brown", matric: "LIM-2023004", email: "alice.brown@student.edu" },
    { id: "s5", name: "David Wilson", matric: "LIM-2023005", email: "david.wilson@student.edu" },
    { id: "s6", name: "Sarah Davis", matric: "LIM-2023006", email: "sarah.davis@student.edu" }
  ], [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Get courses available for selected class
  const availableCourses = useMemo(() => {
    if (!selectedClass) return []
    const assignedCourseIds = lecturerAssignments
      .filter(assignment => assignment.classId === selectedClass)
      .map(assignment => assignment.courseId)
    return courses.filter(course => assignedCourseIds.includes(course.id))
  }, [selectedClass])

  // Get students for selected class and course
  const availableStudents = useMemo(() => {
    if (!selectedClass || !selectedCourse) return []
    // In real app, this would filter students enrolled in this class/course combination
    return students
  }, [selectedClass, selectedCourse])

  const currentCourse = courses.find(c => c.id === selectedCourse)
  const currentClass = classes.find(c => c.id === selectedClass)

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return gradeCategories.categories.reduce((sum, category) => sum + category.percentage, 0)
  }, [gradeCategories.categories])

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = availableStudents.length
    const totalCategories = gradeCategories.categories.length
    const averageGrade = 78.2 // Mock value - would be calculated from actual grades
    const passingRate = 92.1 // Mock value - would be calculated from actual grades
    const totalGraded = Math.floor(totalStudents * 0.85) // Mock value - students with grades entered

    return {
      totalStudents,
      totalCategories,
      averageGrade,
      passingRate,
      totalGraded
    }
  }, [availableStudents, gradeCategories.categories])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpenGradeManagement = (student: Student) => {
    router.push(`/lecturer/gradebook/${student.id}`)
  }

  const handleUpdateCategoryPercentage = (categoryId: string, percentage: number) => {
    setGradeCategories(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, percentage } : cat
      )
    }))
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() && newCategoryPercentage > 0) {
      const newCategory: GradeCategory = {
        id: `cat_${Date.now()}`,
        name: newCategoryName.trim(),
        percentage: newCategoryPercentage,
        isDefault: false
      }
      
      setGradeCategories(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }))
      
      setNewCategoryName("")
      setNewCategoryPercentage(0)
      setNewCategoryDialogOpen(false)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    setGradeCategories(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }))
  }

  const handleUpdateGradeScale = (gradeId: string, field: 'minPercentage' | 'maxPercentage', value: number) => {
    setGradeScale(prev => prev.map(grade => 
      grade.id === gradeId ? { ...grade, [field]: value } : grade
    ))
  }

  const handleAddGrade = () => {
    if (newGradeLetter.trim() && newGradeMin >= 0 && newGradeMax >= newGradeMin) {
      const newGrade: GradeScale = {
        id: `grade_${Date.now()}`,
        letter: newGradeLetter.trim(),
        minPercentage: newGradeMin,
        maxPercentage: newGradeMax,
        description: 'Custom Grade'
      }
      
      setGradeScale(prev => [...prev, newGrade].sort((a, b) => b.minPercentage - a.minPercentage))
      
      setNewGradeLetter("")
      setNewGradeMin(0)
      setNewGradeMax(0)
      setNewGradeDialogOpen(false)
    }
  }

  const handleDeleteGrade = (gradeId: string) => {
    setGradeScale(prev => prev.filter(grade => grade.id !== gradeId))
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
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        <Box>
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 600 }}>
                            {cls.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "DM Sans" }}>
                            {cls.level}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "300px" } }}>
                <FormControl fullWidth disabled={!selectedClass}>
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
                    {availableCourses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        <Box>
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 600 }}>
                            {course.courseCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "DM Sans" }}>
                            {course.courseName}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
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
                  Grade Categories - {currentClass?.name} - {currentCourse?.courseCode}
                </Typography>
                <MUIButton
                  variant="outlined"
                  onClick={() => setCategoryDialogOpen(true)}
                  sx={{
                    borderColor: "#000",
                    color: "#000",
                    fontFamily: "DM Sans",
                    textTransform: "none",
                    "&:hover": { borderColor: "#000", backgroundColor: "#f9fafb" }
                  }}
                >
                  Edit Categories
                </MUIButton>
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
                    <MUIButton
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
                    </MUIButton>
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
                  Grade Scale - {currentClass?.name} - {currentCourse?.courseCode}
                </Typography>
                <MUIButton
                  variant="outlined"
                  onClick={() => setGradeScaleDialogOpen(true)}
                  sx={{
                    borderColor: "#000",
                    color: "#000",
                    fontFamily: "DM Sans",
                    textTransform: "none",
                    "&:hover": { borderColor: "#000", backgroundColor: "#f9fafb" }
                  }}
                >
                  Edit Grade Scale
                </MUIButton>
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
                    <MUIButton
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
                    </MUIButton>
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
                {availableStudents.map((student) => (
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
                        {student.matric}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: "DM Sans, sans-serif", color: "#6b7280" }}>
                        Final Grade: 85.5%
                      </Typography>
                      <MUIButton
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenGradeManagement(student)}
                        sx={{
                          borderColor: "#000",
                          color: "#000",
                          fontFamily: "DM Sans",
                          textTransform: "none",
                          "&:hover": { borderColor: "#000", backgroundColor: "#f9fafb" }
                        }}
                      >
                        Manage Grades
                      </MUIButton>
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
                <MUIButton
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteCategory(category.id)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Delete
                </MUIButton>
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
          <MUIButton onClick={() => setCategoryDialogOpen(false)}>
            Cancel
          </MUIButton>
          <MUIButton 
            onClick={() => setCategoryDialogOpen(false)} 
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "white",
              "&:hover": { bgcolor: "#111" }
            }}
          >
            Save Categories
          </MUIButton>
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
          <MUIButton onClick={() => {
            setNewCategoryDialogOpen(false)
            setNewCategoryName("")
            setNewCategoryPercentage(0)
          }}>
            Cancel
          </MUIButton>
          <MUIButton 
            onClick={handleAddCategory}
            variant="contained"
            disabled={!newCategoryName.trim() || newCategoryPercentage <= 0}
            sx={{
              bgcolor: "#000",
              color: "white",
              "&:hover": { bgcolor: "#111" }
            }}
          >
            Add Category
          </MUIButton>
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
                <MUIButton
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteGrade(grade.id)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Delete
                </MUIButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <MUIButton onClick={() => setGradeScaleDialogOpen(false)}>
            Close
          </MUIButton>
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
          <MUIButton onClick={() => {
            setNewGradeDialogOpen(false)
            setNewGradeLetter("")
            setNewGradeMin(0)
            setNewGradeMax(0)
          }}>
            Cancel
          </MUIButton>
          <MUIButton 
            onClick={handleAddGrade}
            variant="contained"
            disabled={!newGradeLetter.trim() || newGradeMin < 0 || newGradeMax < newGradeMin}
            sx={{
              bgcolor: "#000",
              color: "white",
              "&:hover": { bgcolor: "#111" }
            }}
          >
            Add Grade
          </MUIButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}