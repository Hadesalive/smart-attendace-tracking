"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Divider
} from "@mui/material"
import { 
  DocumentTextIcon, 
  PlusIcon, 
  FolderIcon, 
  DocumentIcon, 
  VideoCameraIcon, 
  PhotoIcon, 
  LinkIcon, 
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatFileSize } from "@/lib/utils"

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

const STATS_CARDS = [
  { label: "Total Materials", value: 35, icon: DocumentTextIcon, color: "#8b5cf6" },
  { label: "Total Downloads", value: 1247, icon: ArrowDownTrayIcon, color: "#10b981" },
  { label: "This Week", value: 8, icon: CloudArrowUpIcon, color: "#f59e0b" },
  { label: "Storage Used", value: "2.4GB", icon: FolderIcon, color: "#06b6d4" }
] as const

const UPLOAD_TYPES = [
  { 
    name: "Upload Document", 
    description: "PDF, Word, PowerPoint", 
    icon: DocumentIcon, 
    color: "#3b82f6",
    acceptedTypes: "PDF, DOC, DOCX, PPT, PPTX"
  },
  { 
    name: "Upload Video", 
    description: "MP4, MOV, AVI", 
    icon: VideoCameraIcon, 
    color: "#ef4444",
    acceptedTypes: "MP4, MOV, AVI, WMV"
  },
  { 
    name: "Upload Image", 
    description: "JPG, PNG, GIF", 
    icon: PhotoIcon, 
    color: "#10b981",
    acceptedTypes: "JPG, PNG, GIF, SVG"
  },
  { 
    name: "Add Link", 
    description: "External resources", 
    icon: LinkIcon, 
    color: "#8b5cf6",
    acceptedTypes: "URL, Website Link"
  }
] as const

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MaterialsPage() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)

  // ============================================================================
  // MOCK DATA
  // ============================================================================
  
  const courses = useMemo(() => [
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Computer Science",
      materialsCount: 12,
      lastUpdated: "2024-01-20",
      color: "#8b5cf6"
    },
    {
      id: "2",
      courseCode: "MATH201",
      courseName: "Calculus II",
      materialsCount: 8,
      lastUpdated: "2024-01-18",
      color: "#10b981"
    },
    {
      id: "3",
      courseCode: "ENG101",
      courseName: "English Composition",
      materialsCount: 15,
      lastUpdated: "2024-01-19",
      color: "#f59e0b"
    }
  ], [])

  const recentMaterials = useMemo(() => [
    {
      id: "1",
      title: "Data Structures Lecture Notes",
      courseCode: "CS101",
      type: "document",
      size: 2048576, // 2MB
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-20T10:30:00",
      downloads: 42,
      status: "published",
      color: "#3b82f6"
    },
    {
      id: "2",
      title: "Integration Techniques Video",
      courseCode: "MATH201",
      type: "video",
      size: 52428800, // 50MB
      uploadedBy: "Prof. Johnson",
      uploadedAt: "2024-01-19T14:15:00",
      downloads: 38,
      status: "published",
      color: "#ef4444"
    },
    {
      id: "3",
      title: "Research Paper Guidelines",
      courseCode: "ENG101",
      type: "document",
      size: 1024000, // 1MB
      uploadedBy: "Dr. Williams",
      uploadedAt: "2024-01-18T16:45:00",
      downloads: 30,
      status: "draft",
      color: "#3b82f6"
    },
    {
      id: "4",
      title: "Algorithm Visualization",
      courseCode: "CS101",
      type: "image",
      size: 512000, // 512KB
      uploadedBy: "Dr. Smith",
      uploadedAt: "2024-01-17T09:20:00",
      downloads: 25,
      status: "published",
      color: "#10b981"
    },
    {
      id: "5",
      title: "Calculus Reference Links",
      courseCode: "MATH201",
      type: "link",
      size: 0,
      uploadedBy: "Prof. Johnson",
      uploadedAt: "2024-01-16T11:20:00",
      downloads: 18,
      status: "published",
      color: "#8b5cf6"
    }
  ], [])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, materialId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedMaterial(materialId)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedMaterial(null)
  }, [])

  const getFileIcon = useCallback((type: string, color?: string) => {
    const iconColor = color || "#6b7280"
    const iconStyle = { width: 20, height: 20, color: iconColor }
    
    switch (type) {
      case "document":
        return <DocumentIcon style={iconStyle} />
      case "video":
        return <VideoCameraIcon style={iconStyle} />
      case "image":
        return <PhotoIcon style={iconStyle} />
      case "link":
        return <LinkIcon style={iconStyle} />
      default:
        return <DocumentTextIcon style={iconStyle} />
    }
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "published":
        return "#10b981"
      case "draft":
        return "#f59e0b"
      case "archived":
        return "#6b7280"
      default:
        return "#6b7280"
    }
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ANIMATION_CONFIG.spring}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: "Poppins", 
                fontWeight: 700, 
                color: "#000",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                mb: 1
              }}
            >
              Lesson Materials
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: "DM Sans", 
                color: "#6b7280",
                fontSize: "1rem"
              }}
            >
              Manage and organize course materials and resources
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<FolderIcon className="h-4 w-4" />}
              sx={{
                borderColor: "#e5e7eb",
                color: "#374151",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
              }}
            >
              Organize
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusIcon className="h-4 w-4" />}
              sx={{
                backgroundColor: "#000",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { backgroundColor: "#1f2937" }
              }}
            >
              Upload Material
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {STATS_CARDS.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 + (index * 0.05) }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: "8px", 
                          backgroundColor: `${stat.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <stat.icon style={{ width: 24, height: 24, color: stat.color }} />
                      </Box>
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 700, 
                        color: "#000",
                        mb: 0.5,
                        fontSize: "1.875rem"
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Course Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "Poppins", 
            fontWeight: 600, 
            color: "#000",
            mb: 2
          }}
        >
          Course Materials
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {courses.map((course, index) => (
            <Grid item xs={12} md={4} key={course.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: "8px", 
                          backgroundColor: `${course.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <FolderIcon style={{ width: 24, height: 24, color: course.color }} />
                      </Box>
                      <Chip 
                        label={`${course.materialsCount} files`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: "#f3f4f6", 
                          color: "#374151",
                          fontFamily: "DM Sans"
                        }} 
                      />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 600, 
                        color: "#000",
                        mb: 1,
                        fontSize: "1.125rem"
                      }}
                    >
                      {course.courseCode}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        mb: 3,
                        fontSize: "0.875rem"
                      }}
                    >
                      {course.courseName}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          Materials
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                          {course.materialsCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280" }}>
                          Last Updated
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#000" }}>
                          {formatDate(course.lastUpdated)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: "#e5e7eb",
                        color: "#374151",
                        fontFamily: "DM Sans",
                        textTransform: "none",
                        "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
                      }}
                    >
                      View Materials
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Recent Materials Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
      >
        <Card sx={{ 
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          mb: 4
        }}>
          <CardContent sx={{ p: 0 }}>
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
                Recent Materials
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans", 
                  color: "#6b7280",
                  mb: 2
                }}
              >
                Latest uploaded course materials and resources
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Material
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Course
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Size
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Uploaded By
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Downloads
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentMaterials.map((material, index) => {
                    const statusColor = getStatusColor(material.status)
                    
                    return (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 + (index * 0.05) }}
                        component={TableRow}
                        sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box 
                              sx={{ 
                                p: 1, 
                                borderRadius: "6px", 
                                backgroundColor: `${material.color}20`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              {getFileIcon(material.type, material.color)}
                            </Box>
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: "DM Sans", 
                                  fontWeight: 600, 
                                  color: "#000",
                                  mb: 0.5
                                }}
                              >
                                {material.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontFamily: "DM Sans", 
                                  color: "#6b7280",
                                  textTransform: "capitalize"
                                }}
                              >
                                {material.type}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              fontWeight: 600,
                              color: "#374151"
                            }}
                          >
                            {material.courseCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={material.type} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${material.color}20`,
                              color: material.color,
                              fontFamily: "DM Sans",
                              textTransform: "capitalize"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              color: "#374151"
                            }}
                          >
                            {material.size > 0 ? formatFileSize(material.size) : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              color: "#374151"
                            }}
                          >
                            {material.uploadedBy}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              color: "#374151"
                            }}
                          >
                            {formatDate(material.uploadedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: "DM Sans", 
                              fontWeight: 600,
                              color: "#000"
                            }}
                          >
                            {material.downloads}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={material.status} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${statusColor}20`,
                              color: statusColor,
                              fontFamily: "DM Sans",
                              fontWeight: 500,
                              textTransform: "capitalize"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton size="small" sx={{ color: "#6b7280" }}>
                              <ArrowDownTrayIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, material.id)}
                              sx={{ color: "#6b7280" }}
                            >
                              <EllipsisVerticalIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Upload Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.4 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "Poppins", 
            fontWeight: 600, 
            color: "#000",
            mb: 2
          }}
        >
          Quick Upload
        </Typography>
        <Grid container spacing={3}>
          {UPLOAD_TYPES.map((uploadType, index) => (
            <Grid item xs={12} sm={6} md={3} key={uploadType.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.4 + (index * 0.1) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box 
                      sx={{ 
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: "12px", 
                          backgroundColor: `${uploadType.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <uploadType.icon style={{ width: 32, height: 32, color: uploadType.color }} />
                      </Box>
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 600, 
                        color: "#000",
                        mb: 1,
                        fontSize: "1rem"
                      }}
                    >
                      {uploadType.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}
                    >
                      {uploadType.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          Download
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          Share Link
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          Move to Folder
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans", color: "#ef4444" }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}