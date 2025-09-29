/**
 * STUDENT COURSES PAGE - REFACTORED
 * 
 * This page demonstrates the usage of the new useStudentCourses hook
 * with clean data fetching and proper error handling.
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  TextField,
  IconButton,
  Chip
} from "@mui/material"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import { BUTTON_STYLES as ADMIN_BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { 
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { useStudentCourses } from "@/lib/domains/courses/useStudentCourses"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import FilterBar from "@/components/admin/FilterBar"
import DataTable from "@/components/admin/DataTable"

// Constants
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
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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

export default function StudentCoursesPageNew() {
  const router = useRouter()
  
  // Use the new hook for clean data fetching
  const { data: courses, loading, error, reload } = useStudentCourses()
  
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filters, setFilters] = useState({
    status: 'all',
    grade: 'all',
    year: 'all'
  })

  // Computed values
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Filter by search term
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((course) => 
        course.course_code.toLowerCase().includes(query) ||
        course.course_name.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      )
    }

    // Advanced filters
    if (filters.status !== 'all') {
      filtered = filtered.filter((course) => course.status === filters.status)
    }

    if (filters.grade !== 'all') {
      filtered = filtered.filter((course) => {
        switch (filters.grade) {
          case 'excellent': return course.averageGrade >= 90
          case 'good': return course.averageGrade >= 80 && course.averageGrade < 90
          case 'satisfactory': return course.averageGrade >= 70 && course.averageGrade < 80
          case 'needs_improvement': return course.averageGrade < 70
          default: return true
        }
      })
    }

    if (filters.year !== 'all') {
      filtered = filtered.filter((course) => course.year === parseInt(filters.year))
    }

    return filtered
  }, [courses, searchQuery, filters])

  const stats = useMemo(() => {
    const activeCourses = courses.filter((c) => c.status === 'active').length
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)
    const overallAttendanceRate = courses.length > 0 
      ? courses.reduce((sum, c) => sum + c.attendanceRate, 0) / courses.length : 0
    const overallGrade = courses.length > 0
      ? courses.reduce((sum, c) => sum + c.averageGrade, 0) / courses.length : 0

    // Year-based statistics
    const yearStats = {
      year1: courses.filter((c) => c.year === 1).length,
      year2: courses.filter((c) => c.year === 2).length,
      year3: courses.filter((c) => c.year === 3).length,
      year4: courses.filter((c) => c.year === 4).length
    }

    return { activeCourses, totalCredits, overallAttendanceRate, overallGrade, yearStats }
  }, [courses])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => setSearchQuery("")

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      grade: 'all',
      year: 'all'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Chip label="Active" sx={{ bgcolor: '#000000', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "completed":
        return <Chip label="Completed" sx={{ bgcolor: '#666666', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      case "dropped":
        return <Chip label="Dropped" sx={{ bgcolor: '#999999', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
      default:
        return <Chip label={status} sx={{ bgcolor: '#cccccc', color: 'white', fontWeight: 600, border: '1px solid #000000' }} />
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "#000000"
    if (grade >= 80) return "#333333"
    if (grade >= 70) return "#666666"
    return "#999999"
  }

  // Define table columns for courses
  const columns = [
    {
      key: 'course',
      label: 'Course',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.course_code || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.course_name || 'No course name'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.instructor || 'TBA'}
        </Typography>
      )
    },
    {
      key: 'year',
      label: 'Year Level',
      render: (value: any, row: any) => (
        <Chip 
          label={row.year ? `Year ${row.year}` : 'N/A'} 
          size="small"
          sx={{ 
            backgroundColor: "#000000",
            color: "white",
            fontFamily: "DM Sans",
            fontWeight: 500,
            fontSize: '0.75rem'
          }}
        />
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.credits || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (value: any, row: any) => (
        <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
          {row.semesterLabel || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.attendanceRate}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Rate
          </Typography>
        </Box>
      )
    },
    {
      key: 'grade',
      label: 'Average Grade',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={{ 
            ...TYPOGRAPHY_STYLES.tableBody, 
            color: getGradeColor(row.averageGrade),
            fontWeight: 600
          }}>
            {Math.round(row.averageGrade)}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            Overall
          </Typography>
        </Box>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="body2" sx={TYPOGRAPHY_STYLES.tableBody}>
            {row.progress}%
          </Typography>
          <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
            {row.submittedAssignments}/{row.totalAssignments} assignments
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => (
        <Chip 
          label={row.status === 'active' ? "Active" : row.status === 'completed' ? "Completed" : "Upcoming"} 
          size="small"
          sx={{ 
            backgroundColor: row.status === 'active' ? "#00000020" : row.status === 'completed' ? "#66666620" : "#99999920",
            color: row.status === 'active' ? "#000000" : row.status === 'completed' ? "#666666" : "#999999",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <MUIButton
            size="small"
            variant="contained"
            onClick={() => router.push(`/student/courses/${row.id}`)}
            sx={{
              ...BUTTON_STYLES.primary,
              fontSize: '0.75rem',
              px: 2,
              py: 0.5
            }}
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            View
          </MUIButton>
        </Box>
      )
    }
  ]

  const statsCards = [
    { 
      title: "Active Courses", 
      value: formatNumber(stats.activeCourses), 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "This semester",
      change: "Currently enrolled"
    },
    { 
      title: "Total Credits", 
      value: formatNumber(stats.totalCredits), 
      icon: AcademicCapIcon, 
      color: "#000000",
      subtitle: "Enrolled",
      change: "Academic load"
    },
    { 
      title: "Attendance Rate", 
      value: `${Math.round(stats.overallAttendanceRate)}%`, 
      icon: CheckCircleIcon, 
      color: "#000000",
      subtitle: "Overall rate",
      change: "All courses"
    },
    { 
      title: "Average Grade", 
      value: `${Math.round(stats.overallGrade)}%`, 
      icon: ChartBarIcon, 
      color: "#000000",
      subtitle: "Overall average",
      change: "All courses"
    }
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
          <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
            <XMarkIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
              Error Loading Courses
            </Typography>
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', mb: 4, maxWidth: 400, mx: 'auto' }}>
              {error}
            </Typography>
            <MUIButton 
              variant="contained" 
              onClick={reload}
              sx={{
                ...ADMIN_BUTTON_STYLES.primary,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none'
              }}
            >
              Try Again
            </MUIButton>
          </MUICardContent>
        </MUICard>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="My Courses"
        subtitle="Manage your enrolled courses and track your progress"
        actions={
          <MUIButton 
            variant="outlined" 
            startIcon={<ChartBarIcon className="h-4 w-4" />}
            sx={{
              ...ADMIN_BUTTON_STYLES.outlined,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none'
            }}
          >
            Academic Report
          </MUIButton>
        }
      />

      <StatsGrid stats={statsCards} />

      {/* Search */}
      <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
        <MUICardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Search Courses
            </Typography>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="Search by course code, name, or instructor..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'hsl(var(--border))' },
                  '&:hover fieldset': { borderColor: '#000' },
                  '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
                  pr: searchQuery ? 5 : 1,
                },
                '& .MuiInputLabel-root': {
                  color: 'hsl(var(--muted-foreground))',
                  '&.Mui-focused': { color: '#000' },
                },
              }}
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

      {/* Advanced Filters */}
      <FilterBar
        fields={[
          { 
            type: 'native-select', 
            label: 'Status', 
            value: filters.status, 
            onChange: (v) => setFilters(prev => ({ ...prev, status: v })), 
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'upcoming', label: 'Upcoming' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Grade Range', 
            value: filters.grade, 
            onChange: (v) => setFilters(prev => ({ ...prev, grade: v })), 
            options: [
              { value: 'all', label: 'All Grades' },
              { value: 'excellent', label: '90% and above' },
              { value: 'good', label: '80-89%' },
              { value: 'satisfactory', label: '70-79%' },
              { value: 'needs_improvement', label: 'Below 70%' }
            ], 
            span: 2 
          },
          { 
            type: 'native-select', 
            label: 'Year Level', 
            value: filters.year, 
            onChange: (v) => setFilters(prev => ({ ...prev, year: v })), 
            options: [
              { value: 'all', label: 'All Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ], 
            span: 2 
          },
          { 
            type: 'clear-button', 
            label: 'Clear Filters', 
            onClick: handleClearFilters, 
            span: 2 
          }
        ]}
      />

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <MUICard sx={{ mt: 3, ...CARD_SX, '&:hover': {} }}>
          <MUICardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
            <BookOpenIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 2 }}>
              {searchQuery ? 'No Courses Found' : 'No Courses Enrolled'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))', mb: 4, maxWidth: 400, mx: 'auto' }}>
              {searchQuery 
                ? `No courses match "${searchQuery}". Try adjusting your search terms.`
                : 'You are not enrolled in any courses yet. Contact your academic advisor for enrollment assistance.'
              }
            </Typography>
            {searchQuery && (
              <MUIButton 
                variant="outlined" 
                onClick={handleClearSearch}
                sx={{
                  ...ADMIN_BUTTON_STYLES.outlined,
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none'
                }}
                startIcon={<XMarkIcon className="h-4 w-4" />}
              >
                Clear Search
              </MUIButton>
            )}
          </MUICardContent>
        </MUICard>
      ) : (
        <DataTable
          title="My Courses"
          subtitle="View and manage your enrolled courses"
          columns={columns}
          data={filteredCourses}
          onRowClick={(course) => router.push(`/student/courses/${course.id}`)}
        />
      )}
    </Box>
  )
}
