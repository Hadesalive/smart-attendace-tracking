"use client"

import React, { useState, useMemo } from "react"
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
  Tab
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
  courseCode: string
  courseName: string
  instructor: string
}

interface Material {
  id: string
  title: string
  courseCode: string
  courseName: string
  type: "document" | "video" | "image" | "link"
  size?: number
  url?: string
  uploadedBy: string
  uploadedAt: string
  description?: string
  downloads: number
  category: "lecture" | "assignment" | "reading" | "reference" | "lab"
}

export default function StudentMaterialsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseParam = searchParams?.get('course')
  
  // State
  const [selectedCourse, setSelectedCourse] = useState<string>(courseParam || "")
  const [categoryTab, setCategoryTab] = useState<"all" | "lecture" | "assignment" | "reading" | "reference" | "lab">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Mock data
  const courses: Course[] = [
    { id: "1", courseCode: "CS101", courseName: "Introduction to Computer Science", instructor: "Dr. Smith" },
    { id: "2", courseCode: "MATH201", courseName: "Calculus II", instructor: "Prof. Johnson" },
    { id: "3", courseCode: "ENG101", courseName: "English Composition", instructor: "Dr. Brown" },
    { id: "4", courseCode: "PHYS101", courseName: "Physics I", instructor: "Dr. Wilson" },
  ]

  const materials: Material[] = [
    {
      id: "1",
      title: "Introduction to Programming - Lecture 1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      type: "document",
      size: 2048576,
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-22T10:00:00",
      description: "Basic programming concepts and syntax introduction",
      downloads: 42,
      category: "lecture"
    },
    {
      id: "2",
      title: "Data Structures Assignment",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      type: "document",
      size: 1024000,
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-20T14:00:00",
      description: "Implement basic data structures: arrays, linked lists",
      downloads: 38,
      category: "assignment"
    },
    {
      id: "3",
      title: "Algorithm Visualization Video",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      type: "video",
      size: 52428800,
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-19T16:00:00",
      description: "Visual explanation of sorting algorithms",
      downloads: 35,
      category: "lecture"
    },
    {
      id: "4",
      title: "Integration Techniques Notes",
      courseCode: "MATH201",
      courseName: "Calculus II",
      type: "document",
      size: 3072000,
      uploadedBy: "Prof. Johnson",
      uploadedAt: "2024-01-21T09:00:00",
      description: "Comprehensive notes on integration by parts and substitution",
      downloads: 45,
      category: "lecture"
    },
    {
      id: "5",
      title: "Calculus Practice Problems",
      courseCode: "MATH201",
      courseName: "Calculus II",
      type: "document",
      size: 1536000,
      uploadedBy: "Prof. Johnson",
      uploadedAt: "2024-01-18T11:00:00",
      description: "Practice exercises for integration techniques",
      downloads: 30,
      category: "assignment"
    },
    {
      id: "6",
      title: "Online Calculus Resources",
      courseCode: "MATH201",
      courseName: "Calculus II",
      type: "link",
      url: "https://khanacademy.org/calculus",
      uploadedBy: "Prof. Johnson",
      uploadedAt: "2024-01-17T15:30:00",
      description: "External resources for additional practice",
      downloads: 25,
      category: "reference"
    },
    {
      id: "7",
      title: "Essay Writing Guidelines",
      courseCode: "ENG101",
      courseName: "English Composition",
      type: "document",
      size: 512000,
      uploadedBy: "Dr. Brown",
      uploadedAt: "2024-01-20T13:00:00",
      description: "Comprehensive guide to academic essay writing",
      downloads: 40,
      category: "reading"
    },
    {
      id: "8",
      title: "Research Paper Examples",
      courseCode: "ENG101",
      courseName: "English Composition",
      type: "document",
      size: 2560000,
      uploadedBy: "Dr. Brown",
      uploadedAt: "2024-01-19T14:00:00",
      description: "Sample research papers with annotations",
      downloads: 33,
      category: "reference"
    }
  ]

  // Computed values
  const filteredMaterials = useMemo(() => {
    let filtered = materials
    
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse)
      if (course) {
        filtered = filtered.filter(material => material.courseCode === course.courseCode)
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
        material.courseCode.toLowerCase().includes(query) ||
        material.courseName.toLowerCase().includes(query)
      )
    }
    
    return filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }, [selectedCourse, categoryTab, searchQuery, materials, courses])

  const stats = useMemo(() => {
    const totalMaterials = materials.length
    const totalDownloads = materials.reduce((sum, m) => sum + m.downloads, 0)
    const recentMaterials = materials.filter(m => {
      const uploadDate = new Date(m.uploadedAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadDate >= weekAgo
    }).length
    const uniqueCourses = new Set(materials.map(m => m.courseCode)).size

    return { totalMaterials, totalDownloads, recentMaterials, uniqueCourses }
  }, [materials])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleDownload = (materialId: string) => {
    // Simulate download
    console.log('Downloading material:', materialId)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />
      case "video":
        return <VideoCameraIcon className="h-5 w-5 text-red-600" />
      case "image":
        return <PhotoIcon className="h-5 w-5 text-green-600" />
      case "link":
        return <LinkIcon className="h-5 w-5 text-purple-600" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      lecture: "bg-blue-500",
      assignment: "bg-orange-500", 
      reading: "bg-green-500",
      reference: "bg-purple-500",
      lab: "bg-red-500"
    }
    return (
      <Badge variant="default" className={colors[category as keyof typeof colors] || "bg-gray-500"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
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
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
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
                          {material.courseCode}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {material.courseName}
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
                          {formatDate(material.uploadedAt)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          by {material.uploadedBy}
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
                        onClick={() => handleDownload(material.id)}
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