"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel
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
  ClockIcon,
  PlusIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatFileSize } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Material {
  id: string
  title: string
  type: 'document' | 'video' | 'image' | 'link'
  fileName: string
  fileSize: number
  courseId: string
  courseCode: string
  courseName: string
  uploadedAt: string
  downloads: number
  description?: string
  url?: string
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  materialsCount: number
  lastUpdated: string
}

interface MaterialStats {
  totalMaterials: number
  totalDownloads: number
  thisWeekUploads: number
  storageUsed: string
}

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

const MATERIAL_TYPE_ICONS = {
  document: DocumentTextIcon,
  video: VideoCameraIcon,
  image: PhotoIcon,
  link: LinkIcon
}

const MATERIAL_TYPE_COLORS = {
  document: 'hsl(var(--primary))',
  video: 'hsl(var(--destructive))',
  image: 'hsl(var(--success))',
  link: 'hsl(var(--warning))'
}

  // ============================================================================
  // MOCK DATA
  // ============================================================================
  
const mockStats: MaterialStats = {
  totalMaterials: 47,
  totalDownloads: 1256,
  thisWeekUploads: 8,
  storageUsed: "2.4GB"
}

const mockCourses: Course[] = [
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
    materialsCount: 15,
    lastUpdated: "2024-01-20"
    },
    {
      id: "2",
    courseCode: "CS201",
    courseName: "Data Structures",
    materialsCount: 12,
    lastUpdated: "2024-01-18"
    },
    {
      id: "3",
    courseCode: "CS301",
    courseName: "Database Systems",
    materialsCount: 20,
    lastUpdated: "2024-01-19"
  }
]

const mockMaterials: Material[] = [
    {
      id: "1",
    title: "Introduction to Programming",
      type: "document",
    fileName: "intro-programming.pdf",
    fileSize: 2048576,
    courseId: "1",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    uploadedAt: "2024-01-20T10:30:00Z",
    downloads: 45,
    description: "Basic programming concepts and syntax"
    },
    {
      id: "2",
    title: "Data Structures Lecture Video",
      type: "video",
    fileName: "data-structures-lecture.mp4",
    fileSize: 104857600,
    courseId: "2",
    courseCode: "CS201",
    courseName: "Data Structures",
    uploadedAt: "2024-01-19T14:20:00Z",
    downloads: 32,
    description: "Comprehensive overview of data structures"
    },
    {
      id: "3",
    title: "Database Design Diagram",
      type: "image",
    fileName: "db-design.png",
    fileSize: 512000,
    courseId: "3",
    courseCode: "CS301",
    courseName: "Database Systems",
    uploadedAt: "2024-01-18T16:45:00Z",
    downloads: 28,
    description: "Entity relationship diagram example"
  },
  {
    id: "4",
    title: "Online Programming Tutorial",
      type: "link",
    fileName: "programming-tutorial",
    fileSize: 0,
    courseId: "1",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    uploadedAt: "2024-01-17T09:15:00Z",
    downloads: 67,
    url: "https://example.com/tutorial",
    description: "Interactive programming tutorial"
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LecturerMaterialsPage() {
  const router = useRouter()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [uploadStep, setUploadStep] = useState<'select' | 'upload'>('select')
  const [selectedUploadType, setSelectedUploadType] = useState<'document' | 'video' | 'image' | 'link' | null>(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    courseId: '',
    file: null as File | null,
    url: ''
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredMaterials = useMemo(() => {
    let filtered = mockMaterials

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(material => material.courseId === selectedCourse)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(query) ||
        material.courseCode.toLowerCase().includes(query) ||
        material.courseName.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query)
      )
    }

    // Filter by tab (material type)
    if (activeTab === 1) {
      filtered = filtered.filter(material => material.type === 'document')
    } else if (activeTab === 2) {
      filtered = filtered.filter(material => material.type === 'video')
    } else if (activeTab === 3) {
      filtered = filtered.filter(material => material.type === 'image')
    } else if (activeTab === 4) {
      filtered = filtered.filter(material => material.type === 'link')
    }

    return filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }, [selectedCourse, searchQuery, activeTab])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleViewMaterial = (material: Material) => {
    setSelectedMaterial(material)
    setViewDialogOpen(true)
  }

  const handleDownloadMaterial = (material: Material) => {
    // In a real app, this would trigger a download
    console.log('Downloading material:', material.fileName)
  }

  const handleDeleteMaterial = (materialId: string) => {
    // In a real app, this would delete the material
    console.log('Deleting material:', materialId)
  }

  const handleUploadTypeSelect = (type: 'document' | 'video' | 'image' | 'link') => {
    setSelectedUploadType(type)
    setUploadStep('upload')
  }

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false)
    setUploadStep('select')
    setSelectedUploadType(null)
    setUploadForm({
      title: '',
      description: '',
      courseId: '',
      file: null,
      url: ''
    })
    setUploadProgress(0)
    setIsUploading(false)
    setIsDragOver(false)
  }

  const handleFormChange = (field: keyof typeof uploadForm, value: string | File) => {
    setUploadForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFormChange('file', file)
      if (!uploadForm.title) {
        handleFormChange('title', file.name.split('.')[0])
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFormChange('file', file)
      if (!uploadForm.title) {
        handleFormChange('title', file.name.split('.')[0])
      }
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedUploadType || !uploadForm.title || !uploadForm.courseId) return
    
    if (selectedUploadType !== 'link' && !uploadForm.file) return
    if (selectedUploadType === 'link' && !uploadForm.url) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            setIsUploading(false)
            handleUploadDialogClose()
            setShowSuccessAlert(true)
            // Auto-hide success message after 5 seconds
            setTimeout(() => setShowSuccessAlert(false), 5000)
            // In a real app, you would refresh the materials list here
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getFileIcon = (type: Material['type']) => {
    const IconComponent = MATERIAL_TYPE_ICONS[type]
    return <IconComponent className="h-5 w-5" />
  }

  const getTypeColor = (type: Material['type']) => {
    return MATERIAL_TYPE_COLORS[type]
  }

  const getAcceptedFileTypes = (type: string) => {
    switch (type) {
      case 'document':
        return '.pdf,.doc,.docx,.ppt,.pptx'
      case 'video':
        return '.mp4,.mov,.avi,.wmv'
      case 'image':
        return '.jpg,.jpeg,.png,.gif,.svg'
      default:
        return '*'
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'transparent'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Alert */}
        {showSuccessAlert && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              severity="success" 
              onClose={() => setShowSuccessAlert(false)}
              sx={{ 
                mb: 3, 
                border: '1px solid #10b981',
                '& .MuiAlert-icon': { color: '#10b981' }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Material uploaded successfully!
              </Typography>
              <Typography variant="body2">
                Your material has been added to the course and is now available to students.
              </Typography>
            </Alert>
          </motion.div>
        )}

        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 700, 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <DocumentTextIcon className="h-8 w-8" />
              Course Materials
            </Typography>
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              Manage and organize your course materials and resources
            </Typography>
          </Box>
          <MUIButton
              variant="contained"
              startIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setUploadDialogOpen(true)}
            sx={BUTTON_STYLES.primary}
            >
              Upload Material
          </MUIButton>
          </Box>

        {/* Stats Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: 3, 
          mb: 4 
        }}>
          <StatCard
            title="Total Materials"
            value={mockStats.totalMaterials.toString()}
            icon={DocumentTextIcon}
            color="#8b5cf6"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Downloads"
            value={mockStats.totalDownloads.toString()}
            icon={ArrowDownTrayIcon}
            color="#10b981"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="This Week"
            value={mockStats.thisWeekUploads.toString()}
            icon={CloudArrowUpIcon}
            color="#f59e0b"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Storage Used"
            value={mockStats.storageUsed}
            icon={FolderIcon}
            color="#06b6d4"
            trend={{ value: 5, isPositive: false }}
          />
        </Box>

        {/* Filters */}
        <MUICard sx={{ ...CARD_SX, mb: 4 }}>
          <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              {/* Course Filter */}
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel>Filter by Course</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Filter by Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  sx={INPUT_STYLES}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {mockCourses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Search */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                <TextField
                  fullWidth
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={INPUT_STYLES}
                  InputProps={{
                    startAdornment: <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-400" />,
                    endAdornment: searchQuery && (
                      <IconButton onClick={handleClearSearch} size="small">
                        <XMarkIcon className="h-4 w-4" />
                      </IconButton>
                    )
                        }} 
                      />
                    </Box>
            </Box>
          </MUICardContent>
        </MUICard>

        {/* Material Type Tabs */}
        <MUICard sx={CARD_SX}>
          <Box sx={{ borderBottom: '1px solid hsl(var(--border))' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
                      sx={{ 
                '& .MuiTab-root': {
                  textTransform: 'none',
                        fontWeight: 600, 
                  color: 'hsl(var(--muted-foreground))',
                  '&.Mui-selected': {
                    color: 'hsl(var(--foreground))'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'hsl(var(--foreground))'
                }
              }}
            >
              <Tab label="All Materials" />
              <Tab label="Documents" />
              <Tab label="Videos" />
              <Tab label="Images" />
              <Tab label="Links" />
            </Tabs>
                      </Box>

          <MUICardContent sx={{ p: 0 }}>
            {filteredMaterials.length === 0 ? (
              <Box sx={{ 
                p: 6, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <DocumentTextIcon className="h-16 w-16 text-gray-300" />
                <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  {searchQuery ? 'No materials found' : 'No materials yet'}
              </Typography>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Upload your first material to get started'
                  }
              </Typography>
                {!searchQuery && (
                  <MUIButton
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    onClick={() => setUploadDialogOpen(true)}
                    sx={BUTTON_STYLES.primary}
                  >
                    Upload Material
                  </MUIButton>
                )}
            </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { borderColor: '#000' } }}>
                    <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Downloads</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow 
                        key={material.id}
                              sx={{ 
                        '&:hover': { bgcolor: 'hsl(var(--muted) / 0.3)' },
                        '& td': { borderColor: '#000' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: getTypeColor(material.type),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {getFileIcon(material.type)}
                            </Box>
                            <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {material.title}
                              </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                              {material.fileName}
                              </Typography>
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
                          <Chip 
                          label={material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                            size="small"
                            sx={{ 
                            bgcolor: getTypeColor(material.type),
                            color: 'white',
                            fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                        <Typography variant="body2">
                          {material.type === 'link' ? '-' : formatFileSize(material.fileSize)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {material.downloads}
                          </Typography>
                        </TableCell>
                        <TableCell>
                        <Typography variant="body2">
                            {formatDate(material.uploadedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewMaterial(material)}
                            sx={{ color: 'hsl(var(--muted-foreground))' }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDownloadMaterial(material)}
                            sx={{ color: 'hsl(var(--muted-foreground))' }}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              size="small"
                            onClick={() => handleDeleteMaterial(material.id)}
                            sx={{ color: 'hsl(var(--destructive))' }}
                            >
                            <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Box>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </MUICardContent>
        </MUICard>

        {/* Upload Dialog */}
        <Dialog 
          open={uploadDialogOpen} 
          onClose={handleUploadDialogClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              border: '2px solid #000',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #000', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            pb: 2
          }}>
            <CloudArrowUpIcon className="h-6 w-6" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {uploadStep === 'select' ? 'Upload New Material' : `Upload ${selectedUploadType?.charAt(0).toUpperCase()}${selectedUploadType?.slice(1)}`}
        </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {uploadStep === 'select' ? 'Choose the type of material to upload' : 'Fill in the details and upload your file'}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {/* Step Indicator */}
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={uploadStep === 'select' ? 0 : 1} sx={{ mb: 2 }}>
                <Step>
                  <StepLabel>Select Type</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Upload & Details</StepLabel>
                </Step>
              </Stepper>
            </Box>

            {uploadStep === 'select' ? (
              // Step 1: Type Selection
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2
              }}>
                {[
                  { type: 'document', label: 'Document', desc: 'PDF, Word, PowerPoint', icon: DocumentTextIcon, color: '#3b82f6' },
                  { type: 'video', label: 'Video', desc: 'MP4, MOV, AVI', icon: VideoCameraIcon, color: '#ef4444' },
                  { type: 'image', label: 'Image', desc: 'JPG, PNG, GIF', icon: PhotoIcon, color: '#10b981' },
                  { type: 'link', label: 'Link', desc: 'External resource', icon: LinkIcon, color: '#8b5cf6' }
                ].map((item) => (
                  <MUICard 
                    key={item.type}
                    onClick={() => handleUploadTypeSelect(item.type as any)}
                      sx={{ 
                      ...LIST_CARD_SX, 
                      cursor: 'pointer',
                      textAlign: 'center',
                      p: 3,
                      '&:hover': {
                        ...LIST_CARD_SX['&:hover'],
                        bgcolor: `${item.color}10`
                      }
                    }}
                  >
                    <MUICardContent sx={{ p: 2 }}>
                      <Box sx={{ 
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: item.color,
                        color: 'white',
                        display: 'inline-flex'
                      }}>
                        <item.icon className="h-8 w-8" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {item.desc}
                      </Typography>
                    </MUICardContent>
                  </MUICard>
                ))}
                    </Box>
            ) : (
              // Step 2: Upload Form
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Form Fields */}
                <TextField
                  fullWidth
                  label="Material Title"
                  value={uploadForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  sx={INPUT_STYLES}
                />

                <FormControl fullWidth required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={uploadForm.courseId}
                    label="Course"
                    onChange={(e) => handleFormChange('courseId', e.target.value)}
                    sx={INPUT_STYLES}
                  >
                    {mockCourses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  sx={INPUT_STYLES}
                />

                {/* File Upload or URL Input */}
                {selectedUploadType === 'link' ? (
                  <TextField
                    fullWidth
                    label="URL"
                    value={uploadForm.url}
                    onChange={(e) => handleFormChange('url', e.target.value)}
                    placeholder="https://example.com/resource"
                    required
                    sx={INPUT_STYLES}
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                      Upload File
                    </Typography>
                    
                    {/* Drag & Drop Area */}
                    <Box
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      sx={{ 
                        border: `2px dashed ${isDragOver ? '#000' : 'hsl(var(--border))'}`,
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: isDragOver ? 'hsl(var(--muted) / 0.5)' : 'hsl(var(--muted) / 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#000',
                          bgcolor: 'hsl(var(--muted) / 0.3)'
                        }
                      }}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {uploadForm.file ? uploadForm.file.name : 'Drop your file here or click to browse'}
                    </Typography>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        Accepted formats: {getAcceptedFileTypes(selectedUploadType || '').replace(/\./g, '').toUpperCase()}
                      </Typography>
                      {uploadForm.file && (
                        <Box sx={{ mt: 2 }}>
                          <Chip 
                            label={`${formatFileSize(uploadForm.file.size)}`}
                            sx={{ bgcolor: 'hsl(var(--primary))', color: 'white' }}
                          />
                        </Box>
                      )}
                    </Box>
                    
                    <input
                      id="file-upload"
                      type="file"
                      accept={getAcceptedFileTypes(selectedUploadType || '')}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Uploading...</Typography>
                      <Typography variant="body2">{uploadProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'hsl(var(--muted))',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#000'
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid #000', gap: 1 }}>
            {uploadStep === 'upload' && (
              <MUIButton 
                onClick={() => setUploadStep('select')}
                sx={BUTTON_STYLES.outlined}
                disabled={isUploading}
              >
                Back
              </MUIButton>
            )}
            <MUIButton 
              onClick={handleUploadDialogClose}
              sx={BUTTON_STYLES.outlined}
              disabled={isUploading}
            >
              Cancel
            </MUIButton>
            {uploadStep === 'upload' && (
              <MUIButton 
                variant="contained"
                onClick={handleUploadSubmit}
                disabled={
                  isUploading || 
                  !uploadForm.title || 
                  !uploadForm.courseId || 
                  (selectedUploadType !== 'link' && !uploadForm.file) ||
                  (selectedUploadType === 'link' && !uploadForm.url)
                }
                sx={BUTTON_STYLES.primary}
                startIcon={isUploading ? undefined : <CloudArrowUpIcon className="h-4 w-4" />}
              >
                {isUploading ? 'Uploading...' : 'Upload Material'}
              </MUIButton>
            )}
          </DialogActions>
        </Dialog>

        {/* View Material Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedMaterial && (
            <>
              <DialogTitle sx={{ borderBottom: '1px solid #000' }}>
                Material Details
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: getTypeColor(selectedMaterial.type),
                    color: 'white'
                  }}>
                    {getFileIcon(selectedMaterial.type)}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedMaterial.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      {selectedMaterial.courseCode} - {selectedMaterial.courseName}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedMaterial.description || 'No description available'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      File Details
                    </Typography>
                    <Typography variant="body2">
                      Type: {selectedMaterial.type.charAt(0).toUpperCase() + selectedMaterial.type.slice(1)}
                    </Typography>
                    <Typography variant="body2">
                      Size: {selectedMaterial.type === 'link' ? 'N/A' : formatFileSize(selectedMaterial.fileSize)}
                    </Typography>
                    <Typography variant="body2">
                      Downloads: {selectedMaterial.downloads}
                    </Typography>
                    <Typography variant="body2">
                      Uploaded: {formatDate(selectedMaterial.uploadedAt)}
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: '1px solid #000' }}>
                <MUIButton 
                  onClick={() => setViewDialogOpen(false)}
                  sx={BUTTON_STYLES.outlined}
                >
                  Close
                </MUIButton>
                <MUIButton 
                  variant="contained"
                  startIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                  onClick={() => handleDownloadMaterial(selectedMaterial)}
                  sx={BUTTON_STYLES.primary}
                >
          Download
                </MUIButton>
              </DialogActions>
            </>
          )}
        </Dialog>
      </motion.div>
    </Box>
  )
}