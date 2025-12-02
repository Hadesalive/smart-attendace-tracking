"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Skeleton
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { 
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FolderIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatFileSize } from "@/lib/utils"
import { useMaterials, useCourses, useAuth, useAcademicStructure } from "@/lib/domains"
import { useMockData } from "@/lib/hooks/useMockData"
import { Material as SharedMaterial } from "@/lib/types/shared"
import { toast } from "sonner"

// Constants
const CARD_SX = {
  bgcolor: 'card',
  border: '1px solid',
  borderColor: '#000',
  borderRadius: 3,
  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  position: 'relative' as const,
  overflow: 'hidden' as const
}

const LIST_CARD_SX = {
  ...CARD_SX,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
    borderColor: '#000',
  }
}

const BUTTON_STYLES = {
  primary: {
    backgroundColor: 'hsl(var(--foreground))',
    color: 'hsl(var(--background))',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { backgroundColor: 'hsl(var(--foreground) / 0.9)' }
  },
  outlined: {
    borderColor: '#000',
    color: 'hsl(var(--foreground))',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { borderColor: '#000', backgroundColor: 'hsl(var(--muted))' }
  }
}

const INPUT_STYLES = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'hsl(var(--border))' },
    '&:hover fieldset': { borderColor: '#000' },
    '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
  },
  '& .MuiInputLabel-root': {
    color: 'hsl(var(--muted-foreground))',
    '&.Mui-focused': { color: '#000' },
  },
  '& .MuiSelect-select': {
    color: 'hsl(var(--foreground))',
    padding: '12px 14px',
    lineHeight: '1.5',
  },
}

// Types
interface Course {
  id: string
  course_code: string
  course_name: string
  instructor: string
}

interface Material {
  id: string
  title: string
  course_code: string
  course_name: string
  type: "document" | "video" | "image" | "link"
  size?: number
  url?: string
  uploaded_by: string
  uploaded_at: string
  description?: string
  downloads: number
  category: "lecture" | "assignment" | "reading" | "reference" | "lab"
}

export default function StudentMaterialsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseParam = searchParams?.get('course')
  
  // Data Context
  const materialsHook = useMaterials()
  const coursesHook = useCourses()
  const auth = useAuth()
  const academic = useAcademicStructure()
  
  const { state: materialsState } = materialsHook
  const { state: coursesState } = coursesHook
  const { state: authState } = auth
  const { state: academicState } = academic
  
  const { isInitialized } = useMockData()
  
  // State
  const [selectedCourse, setSelectedCourse] = useState<string>(courseParam || "")
  const [categoryTab, setCategoryTab] = useState<"all" | "lecture" | "assignment" | "reading" | "reference" | "lab">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const results = await Promise.allSettled([
        auth.loadCurrentUser(),
        materialsHook.fetchMaterials(),
        coursesHook.fetchCourses(),
        coursesHook.fetchCourseAssignments(),
        academic.fetchSectionEnrollments()
      ])

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to load student materials data (${index}):`, result.reason)
        }
      })
    }

    loadData()
  }, [])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const results = await Promise.allSettled([
        auth.loadCurrentUser(),
        materialsHook.fetchMaterials(),
        coursesHook.fetchCourses(),
        coursesHook.fetchCourseAssignments(),
        academic.fetchSectionEnrollments()
      ])

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to load student materials data (${index}):`, result.reason)
        }
      })
    }

    loadData()
  }, [auth.loadCurrentUser, materialsHook.fetchMaterials, coursesHook.fetchCourses, coursesHook.fetchCourseAssignments, academic.fetchSectionEnrollments])

  // Get student's courses from DataContext
  const studentCourses = useMemo(() => {
    const studentId = authState.currentUser?.id
    if (!studentId) return []

    // Get student's section enrollment
    const studentSection = academicState.sectionEnrollments.find(
      (enrollment: any) => enrollment.student_id === studentId
    ) as any

    if (!studentSection?.sections) return []

    const section = studentSection.sections
    
    // Get course assignments for student's program/year/semester
    const relevantAssignments = coursesState.courseAssignments?.filter((assignment: any) => 
      assignment.program_id === section.program_id &&
      assignment.academic_year_id === section.academic_year_id &&
      assignment.semester_id === section.semester_id &&
      assignment.year === section.year
    ) || []

    // Map to courses
    return relevantAssignments
      .map((assignment: any) => 
        coursesState.courses.find((course: any) => course?.id === assignment.course_id)
      )
      .filter((course): course is any => Boolean(course))
      .map(course => ({
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        instructor: course.lecturer_name || "TBD"
      }))
  }, [coursesState.courses, coursesState.courseAssignments, academicState.sectionEnrollments, authState.currentUser?.id])

  // Get materials from DataContext
  const materials = useMemo(() => {
    // Filter materials for student's enrolled courses
    const enrolledCourseIds = studentCourses.map(c => c.id)
    
    return materialsState.materials
      .filter((material: any) => enrolledCourseIds.includes(material.course_id))
      .map((material: any) => {
        const course = coursesState.courses.find((c: any) => c.id === material.course_id)
        return {
          id: material.id,
          title: material.title,
          course_code: course?.course_code || 'N/A',
          course_name: course?.course_name || 'N/A',
          type: material.material_type as "document" | "video" | "image" | "link",
          size: material.file_size,
          url: material.file_url || material.external_url,
          uploaded_by: material.author_name || 'Unknown',
          uploaded_at: material.created_at,
          description: material.description,
          downloads: material.download_count || 0,
          category: material.category as "lecture" | "assignment" | "reading" | "reference" | "lab"
        }
      })
  }, [materialsState.materials, coursesState.courses, studentCourses])

  // Legacy mock data for reference
  const legacyMaterials: Material[] = [
    {
      id: "1",
      title: "Introduction to Programming - Lecture 1",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      type: "document",
      size: 2048576,
      uploaded_by: "Dr. Smith",
      uploaded_at: "2024-01-22T10:00:00",
      description: "Basic programming concepts and syntax introduction",
      downloads: 42,
      category: "lecture"
    },
    {
      id: "2",
      title: "Data Structures Assignment",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      type: "document",
      size: 1024000,
      uploaded_by: "Dr. Smith",
      uploaded_at: "2024-01-20T14:00:00",
      description: "Implement basic data structures: arrays, linked lists",
      downloads: 38,
      category: "assignment"
    },
    {
      id: "3",
      title: "Algorithm Visualization Video",
      course_code: "CS101",
      course_name: "Introduction to Computer Science",
      type: "video",
      size: 52428800,
      uploaded_by: "Dr. Smith",
      uploaded_at: "2024-01-19T16:00:00",
      description: "Visual explanation of sorting algorithms",
      downloads: 35,
      category: "lecture"
    },
    {
      id: "4",
      title: "Integration Techniques Notes",
      course_code: "MATH201",
      course_name: "Calculus II",
      type: "document",
      size: 3072000,
      uploaded_by: "Prof. Johnson",
      uploaded_at: "2024-01-21T09:00:00",
      description: "Comprehensive notes on integration by parts and substitution",
      downloads: 45,
      category: "lecture"
    },
    {
      id: "5",
      title: "Calculus Practice Problems",
      course_code: "MATH201",
      course_name: "Calculus II",
      type: "document",
      size: 1536000,
      uploaded_by: "Prof. Johnson",
      uploaded_at: "2024-01-18T11:00:00",
      description: "Practice exercises for integration techniques",
      downloads: 30,
      category: "assignment"
    },
    {
      id: "6",
      title: "Online Calculus Resources",
      course_code: "MATH201",
      course_name: "Calculus II",
      type: "link",
      url: "https://khanacademy.org/calculus",
      uploaded_by: "Prof. Johnson",
      uploaded_at: "2024-01-17T15:30:00",
      description: "External resources for additional practice",
      downloads: 25,
      category: "reference"
    },
    {
      id: "7",
      title: "Essay Writing Guidelines",
      course_code: "ENG101",
      course_name: "English Composition",
      type: "document",
      size: 512000,
      uploaded_by: "Dr. Brown",
      uploaded_at: "2024-01-20T13:00:00",
      description: "Comprehensive guide to academic essay writing",
      downloads: 40,
      category: "reading"
    },
    {
      id: "8",
      title: "Research Paper Examples",
      course_code: "ENG101",
      course_name: "English Composition",
      type: "document",
      size: 2560000,
      uploaded_by: "Dr. Brown",
      uploaded_at: "2024-01-19T14:00:00",
      description: "Sample research papers with annotations",
      downloads: 33,
      category: "reference"
    }
  ]

  // Computed values
  const filteredMaterials = useMemo(() => {
    let filtered = materials
    
    if (selectedCourse) {
      const course = studentCourses.find((c: any) => c.id === selectedCourse)
      if (course) {
        filtered = filtered.filter(material => material.course_code === course.course_code)
      }
    }
    
    if (categoryTab !== "all") {
      filtered = filtered.filter(material => material.category === categoryTab)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query) ||
        material.course_code.toLowerCase().includes(query) ||
        material.course_name.toLowerCase().includes(query)
      )
    }
    
    return filtered.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
  }, [selectedCourse, categoryTab, searchQuery, materials, studentCourses])

  const stats = useMemo(() => {
    const totalMaterials = materials.length
    const totalDownloads = materials.reduce((sum, m) => sum + m.downloads, 0)
    const recentMaterials = materials.filter(m => {
      const uploadDate = new Date(m.uploaded_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadDate >= weekAgo
    }).length
    const uniqueCourses = new Set(materials.map(m => m.course_code)).size

    return { totalMaterials, totalDownloads, recentMaterials, uniqueCourses }
  }, [materials])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleDownload = useCallback(async (materialId: string, url: string) => {
    try {
      // Increment download count
      await materialsHook.incrementDownloadCount(materialId)
      
      // Open file in new tab
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error downloading material:', error)
      toast.error('Failed to download material')
    }
  }, [materialsHook])


  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
      case "video":
        return <VideoCameraIcon className="h-5 w-5 text-gray-600" />
      case "image":
        return <PhotoIcon className="h-5 w-5 text-gray-600" />
      case "link":
        return <LinkIcon className="h-5 w-5 text-gray-600" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      lecture: "#000000",
      assignment: "#333333", 
      reading: "#666666",
      reference: "#999999",
      lab: "#cccccc"
    }
    return (
      <Chip 
        label={category.charAt(0).toUpperCase() + category.slice(1)}
        sx={{ 
          bgcolor: colors[category as keyof typeof colors] || "#cccccc",
          color: 'white',
          fontWeight: 600,
          border: '1px solid #000000'
        }}
      />
    )
  }

  // Loading state
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={400} height={20} />
          </div>
        </div>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress sx={{ color: '#000000' }} />
        </Box>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Course Materials</h1>
          <p className="text-muted-foreground font-dm-sans">Access lecture notes, assignments, and resources</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MUIButton 
            variant="outlined" 
            startIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
          >
            Download All
          </MUIButton>
        </div>
      </div>

      {/* KPI Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: 1
      }}>
        <StatCard title="Total Materials" value={stats.totalMaterials.toString()} icon={DocumentTextIcon} color="#000000" change="All courses" />
        <StatCard title="Total Downloads" value={stats.totalDownloads.toString()} icon={ArrowDownTrayIcon} color="#000000" change="Your activity" />
        <StatCard title="This Week" value={stats.recentMaterials.toString()} icon={CalendarDaysIcon} color="#000000" change="New uploads" />
        <StatCard title="Courses" value={stats.uniqueCourses.toString()} icon={BookOpenIcon} color="#000000" change="With materials" />
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Search */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Search Materials
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Search by title, description, or course..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={INPUT_STYLES}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
                    </Box>
                  ),
                  endAdornment: searchQuery && (
                    <IconButton
                      onClick={handleClearSearch}
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        right: 8,
                        color: 'hsl(var(--muted-foreground))',
                        '&:hover': { 
                          color: 'hsl(var(--foreground))',
                          backgroundColor: 'hsl(var(--muted))' 
                        }
                      }}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </IconButton>
                  )
                }}
              />
            </Box>
          </MUICardContent>
        </MUICard>

        {/* Course Filter */}
        <MUICard sx={CARD_SX}>
          <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FolderIcon className="h-5 w-5 text-muted-foreground" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Filter Course
              </Typography>
            </Box>
            
            <FormControl fullWidth sx={INPUT_STYLES}>
              <InputLabel>Select Course</InputLabel>
              <Select
                native
                value={selectedCourse}
                onChange={(e) => setSelectedCourse((e.target as HTMLSelectElement).value)}
              >
                <option value="">All Courses</option>
                {studentCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </MUICardContent>
        </MUICard>
      </Box>

      {/* Category Tabs */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          <Tabs 
            value={categoryTab} 
            onChange={(e, newValue) => setCategoryTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: 'hsl(var(--foreground))' },
              '& .MuiTab-root': {
                color: 'hsl(var(--muted-foreground))',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                '&.Mui-selected': { color: 'hsl(var(--foreground))', fontWeight: 600 },
                '&:hover': { color: 'hsl(var(--foreground))' },
              },
            }}
          >
            <Tab label={`All (${filteredMaterials.length})`} value="all" />
            <Tab label={`Lectures (${filteredMaterials.filter(m => m.category === 'lecture').length})`} value="lecture" />
            <Tab label={`Assignments (${filteredMaterials.filter(m => m.category === 'assignment').length})`} value="assignment" />
            <Tab label={`Readings (${filteredMaterials.filter(m => m.category === 'reading').length})`} value="reading" />
            <Tab label={`References (${filteredMaterials.filter(m => m.category === 'reference').length})`} value="reference" />
            <Tab label={`Labs (${filteredMaterials.filter(m => m.category === 'lab').length})`} value="lab" />
          </Tabs>
        </MUICardContent>
      </MUICard>

      {/* Materials List */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 0 }}>
          {filteredMaterials.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <DocumentTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
                No Materials Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {searchQuery || selectedCourse || categoryTab !== "all"
                  ? 'No materials match your current filters. Try adjusting your search criteria.'
                  : 'No materials have been uploaded yet. Check back later for course resources.'
                }
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  '& .MuiTableCell-root': { 
                    borderColor: '#000',
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }
                }}>
                  <TableCell>Material</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Downloads</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id} sx={{ 
                    '& .MuiTableCell-root': { borderColor: '#000' },
                    '&:hover': { backgroundColor: 'hsl(var(--muted) / 0.1)' }
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {getFileIcon(material.type)}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                            {material.title}
                          </Typography>
                          {material.description && (
                            <Typography variant="caption" sx={{ 
                              color: 'hsl(var(--muted-foreground))', 
                              display: 'block',
                              mt: 0.5,
                              lineHeight: 1.4
                            }}>
                              {material.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {material.course_code}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {material.course_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(material.category)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.size ? formatFileSize(material.size) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(material.uploaded_at)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          by {material.uploaded_by}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {material.downloads}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <MUIButton
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                        onClick={() => handleDownload(material.id, material.url)}
                        sx={{
                          ...BUTTON_STYLES.outlined,
                          minWidth: 'auto',
                          px: 2
                        }}
                      >
                        Download
                      </MUIButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </MUICardContent>
      </MUICard>
    </div>
  )
}