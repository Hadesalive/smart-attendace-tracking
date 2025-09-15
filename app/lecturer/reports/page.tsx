"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from "@mui/material"
import StatCard from "@/components/dashboard/stat-card"
import { 
  ChartBarIcon,
  CalendarDaysIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatTime } from "@/lib/utils"

// ============================================================================
// CHART.JS CONFIGURATION
// ============================================================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// ============================================================================
// BACKEND INTEGRATION EXPLANATION
// ============================================================================
/*
HOW THIS WOULD WORK WITH A REAL BACKEND:

1. REPORT GENERATION API:
   - POST /api/reports/generate
   - Body: { courseId, reportType, dateRange, userId }
   - Response: { reportId, status: 'generating' }
   - WebSocket/SSE for real-time progress updates

2. REPORT DATA API:
   - GET /api/reports/:id - Get report details
   - GET /api/reports/:id/download - Download report file
   - GET /api/reports/:id/view - Get report data for viewing
   - GET /api/reports/analytics - Get analytics data

3. REPORT GENERATION PROCESS:
   - Queue job in background (Redis/Bull)
   - Generate PDF/Excel using libraries like Puppeteer, ExcelJS
   - Store in cloud storage (AWS S3, Google Cloud)
   - Update database with file URL and metadata
   - Send notification when complete

4. ANALYTICS DATA:
   - Real-time data from attendance, grades, engagement tables
   - Chart.js for visualization
   - Cached results for performance
   - Export capabilities

5. FILE HANDLING:
   - PDF generation with charts and tables
   - Excel export with multiple sheets
   - Email delivery option
   - Scheduled report generation
*/

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ReportType = "attendance" | "performance" | "engagement" | "materials"
type TimeRange = "week" | "month" | "semester" | "year"

interface ReportData {
  id: string
  title: string
  type: ReportType
  courseCode: string
  courseName: string
  generatedAt: string
  period: string
  status: "ready" | "generating" | "error"
  fileSize?: string
  downloadCount: number
}

interface AttendanceStats {
  totalSessions: number
  averageAttendance: number
  attendanceRate: number
  topPerformingStudents: number
  attendanceTrend: number
}

interface PerformanceStats {
  totalAssignments: number
  averageGrade: number
  completionRate: number
  topPerformers: number
  gradeDistribution: { grade: string; count: number }[]
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
    boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)'
  }
}

const BUTTON_STYLES = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { bgcolor: '#333' }
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
  '& .MuiMenuItem-root': {
    '&:hover': { backgroundColor: 'hsl(var(--muted))' },
    '&.Mui-selected': { 
      backgroundColor: 'hsl(var(--muted))', 
      '&:hover': { backgroundColor: 'hsl(var(--muted))' } 
    }
  }
}

const REPORT_TYPES = [
  { value: "attendance", label: "Attendance Reports", icon: CalendarDaysIcon },
  { value: "performance", label: "Performance Reports", icon: AcademicCapIcon },
  { value: "engagement", label: "Engagement Reports", icon: UsersIcon },
  { value: "materials", label: "Materials Reports", icon: DocumentTextIcon }
]

const TIME_RANGES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "semester", label: "This Semester" },
  { value: "year", label: "This Year" }
]

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAttendanceStats: AttendanceStats = {
  totalSessions: 24,
  averageAttendance: 42,
  attendanceRate: 87.5,
  topPerformingStudents: 15,
  attendanceTrend: 12.5
}

const mockPerformanceStats: PerformanceStats = {
  totalAssignments: 8,
  averageGrade: 78.5,
  completionRate: 92.3,
  topPerformers: 12,
  gradeDistribution: [
    { grade: "A", count: 8 },
    { grade: "B", count: 15 },
    { grade: "C", count: 12 },
    { grade: "D", count: 3 },
    { grade: "F", count: 2 }
  ]
}

const mockCourses = [
  { id: "1", code: "CS101", name: "Introduction to Computer Science" },
  { id: "2", code: "CS201", name: "Data Structures" },
  { id: "3", code: "CS301", name: "Database Systems" },
  { id: "4", code: "CS401", name: "Software Engineering" }
]

const mockReports: ReportData[] = [
  {
    id: "1",
    title: "Weekly Attendance Summary",
    type: "attendance",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    generatedAt: "2024-01-20T10:30:00Z",
    period: "Week 3",
    status: "ready",
    fileSize: "2.3 MB",
    downloadCount: 5
  },
  {
    id: "2",
    title: "Midterm Performance Analysis",
    type: "performance",
    courseCode: "CS201",
    courseName: "Data Structures",
    generatedAt: "2024-01-18T14:15:00Z",
    period: "Midterm",
    status: "ready",
    fileSize: "1.8 MB",
    downloadCount: 12
  },
  {
    id: "3",
    title: "Student Engagement Report",
    type: "engagement",
    courseCode: "CS301",
    courseName: "Database Systems",
    generatedAt: "2024-01-15T09:45:00Z",
    period: "Month 1",
    status: "ready",
    fileSize: "3.1 MB",
    downloadCount: 8
  },
  {
    id: "4",
    title: "Materials Usage Report",
    type: "materials",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    generatedAt: "2024-01-12T16:20:00Z",
    period: "Week 2",
    status: "generating",
    fileSize: undefined,
    downloadCount: 0
  }
]

// ============================================================================
// CHART DATA
// ============================================================================

const attendanceChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  datasets: [
    {
      label: 'Attendance Rate (%)',
      data: [85, 87, 89, 88, 91, 87.5],
      borderColor: 'hsl(var(--muted-foreground))',
      backgroundColor: 'hsla(var(--muted-foreground), 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}

const attendanceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: 'hsl(var(--border))',
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
      },
    },
    x: {
      grid: {
        color: 'hsl(var(--border))',
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
      },
    },
  },
}

const gradeDistributionData = {
  labels: ['A', 'B', 'C', 'D', 'F'],
  datasets: [
    {
      data: [8, 15, 12, 3, 2],
      backgroundColor: [
        '#10b981',
        '#3b82f6',
        '#f59e0b',
        '#ef4444',
        '#6b7280',
      ],
      borderColor: '#000',
      borderWidth: 1,
    },
  ],
}

const gradeDistributionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: 'hsl(var(--foreground))',
        padding: 20,
      },
    },
    title: {
      display: false,
    },
  },
}

const engagementData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Engagement Score',
      data: [7.2, 8.5, 7.8, 8.9, 7.5, 6.8, 5.2],
      backgroundColor: 'hsla(var(--muted-foreground), 0.2)',
      borderColor: 'hsl(var(--muted-foreground))',
      borderWidth: 2,
    },
  ],
}

const engagementOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 10,
      grid: {
        color: 'hsl(var(--border))',
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
      },
    },
    x: {
      grid: {
        color: 'hsl(var(--border))',
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
      },
    },
  },
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsPage() {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState(0)
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all")
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("month")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Quick Generate state
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedReportType, setSelectedReportType] = useState<ReportType | "">("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null)
  
  // Report Viewing state
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredReports = useMemo(() => {
    let filtered = mockReports

    if (reportTypeFilter !== "all") {
      filtered = filtered.filter(report => report.type === reportTypeFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(query) ||
        report.courseCode.toLowerCase().includes(query) ||
        report.courseName.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
  }, [reportTypeFilter, searchQuery])

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

  const handleGenerateReport = async (type: ReportType) => {
    if (!selectedCourse || !selectedReportType) {
      alert('Please select a course and report type')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setShowSuccessAlert(false)
    setGeneratedReport(null)

    // Simulate report generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsGenerating(false)
          
          // Create generated report
          const course = mockCourses.find(c => c.id === selectedCourse)
          const newReport: ReportData = {
            id: Date.now().toString(),
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${course?.name}`,
            type: selectedReportType as ReportType,
            courseCode: course?.code || '',
            courseName: course?.name || '',
            generatedAt: new Date().toISOString(),
            period: dateRange.start && dateRange.end 
              ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
              : 'Custom Range',
            status: 'ready',
            fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
            downloadCount: 0
          }
          
          setGeneratedReport(newReport)
          setShowSuccessAlert(true)
          
          // Auto-hide success alert after 5 seconds
          setTimeout(() => setShowSuccessAlert(false), 5000)
          
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleQuickGenerate = (type: ReportType) => {
    setSelectedReportType(type)
    setActiveTab(1) // Switch to Quick Generate tab
  }

  const resetQuickGenerate = () => {
    setSelectedCourse("")
    setSelectedReportType("")
    setDateRange({ start: "", end: "" })
    setIsGenerating(false)
    setGenerationProgress(0)
    setShowSuccessAlert(false)
    setGeneratedReport(null)
  }

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId)
    // Download logic here
  }

  const handleViewReport = (reportId: string) => {
    const report = mockReports.find(r => r.id === reportId)
    if (report) {
      setSelectedReport(report)
      setViewDialogOpen(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'hsl(var(--muted-foreground))'
      case 'generating': return '#f59e0b'
      case 'error': return 'hsl(var(--destructive))'
      default: return 'hsl(var(--muted-foreground))'
    }
  }

  const getTypeIcon = (type: ReportType) => {
    const reportType = REPORT_TYPES.find(t => t.value === type)
    return reportType?.icon || DocumentTextIcon
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const ReportCard = ({ report }: { report: ReportData }) => {
    const IconComponent = getTypeIcon(report.type)
    
    return (
      <MUICard sx={{ ...LIST_CARD_SX, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MUICardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  color: 'hsl(var(--foreground))',
                  mb: 0.5
                }}
              >
                {report.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'hsl(var(--muted-foreground))',
                  mb: 1
                }}
              >
                {report.courseCode} • {report.courseName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={report.period}
                  size="small"
                  sx={{ 
                    bgcolor: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  size="small"
                  sx={{ 
                    bgcolor: getStatusColor(report.status),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
            <IconComponent style={{ width: 24, height: 24, color: 'hsl(var(--muted-foreground))' }} />
          </Box>

          {/* Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarDaysIcon style={{ width: 16, height: 16, color: 'hsl(var(--muted-foreground))' }} />
              <Typography variant="body2">
                Generated {formatDate(report.generatedAt)}
              </Typography>
            </Box>
            {report.fileSize && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DocumentTextIcon style={{ width: 16, height: 16, color: 'hsl(var(--muted-foreground))' }} />
                <Typography variant="body2">
                  {report.fileSize} • {report.downloadCount} downloads
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
            <MUIButton 
              size="small" 
              onClick={() => handleViewReport(report.id)}
              sx={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <EyeIcon style={{ width: 16, height: 16 }} />
            </MUIButton>
            {report.status === 'ready' && (
              <MUIButton 
                size="small" 
                onClick={() => handleDownloadReport(report.id)}
                sx={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <ArrowDownTrayIcon style={{ width: 16, height: 16 }} />
              </MUIButton>
            )}
          </Box>
        </MUICardContent>
      </MUICard>
    )
  }

  // ============================================================================
  // REPORT VIEWING DIALOG
  // ============================================================================

  const ReportViewDialog = () => {
    if (!selectedReport) return null

    const getReportDetails = (report: ReportData) => {
      switch (report.type) {
        case 'attendance':
          return {
            summary: `This attendance report covers ${report.period} for ${report.courseName}.`,
            keyMetrics: [
              { label: 'Total Sessions', value: '24', icon: CalendarDaysIcon },
              { label: 'Average Attendance', value: '42 students', icon: UsersIcon },
              { label: 'Attendance Rate', value: '87.5%', icon: ChartBarIcon },
              { label: 'Top Performers', value: '15 students', icon: AcademicCapIcon }
            ],
            insights: [
              'Attendance has improved by 12.5% compared to last period',
              'Peak attendance days are Tuesday and Thursday',
              '15 students have perfect attendance records',
              'Late arrivals decreased by 8% this period'
            ]
          }
        case 'performance':
          return {
            summary: `This performance report analyzes student grades and completion rates for ${report.courseName}.`,
            keyMetrics: [
              { label: 'Total Assignments', value: '8', icon: DocumentTextIcon },
              { label: 'Average Grade', value: '78.5%', icon: AcademicCapIcon },
              { label: 'Completion Rate', value: '92.3%', icon: ChartBarIcon },
              { label: 'Top Performers', value: '12 students', icon: UsersIcon }
            ],
            insights: [
              'Grade distribution shows healthy spread across all levels',
              'Assignment completion rate is above 90%',
              '12 students consistently score above 85%',
              'Most challenging assignment was the final project'
            ]
          }
        case 'engagement':
          return {
            summary: `This engagement report measures student participation and interaction in ${report.courseName}.`,
            keyMetrics: [
              { label: 'Active Students', value: '38', icon: UsersIcon },
              { label: 'Discussion Posts', value: '156', icon: DocumentTextIcon },
              { label: 'Response Rate', value: '89%', icon: ChartBarIcon },
              { label: 'Engagement Score', value: '8.2/10', icon: AcademicCapIcon }
            ],
            insights: [
              'Student engagement increased by 15% this period',
              'Discussion participation is highest on Mondays',
              '89% of students actively participate in discussions',
              'Peer-to-peer interaction has doubled'
            ]
          }
        case 'materials':
          return {
            summary: `This materials report tracks resource usage and effectiveness for ${report.courseName}.`,
            keyMetrics: [
              { label: 'Total Materials', value: '23', icon: DocumentTextIcon },
              { label: 'Downloads', value: '1,247', icon: ArrowDownTrayIcon },
              { label: 'Most Popular', value: 'Lecture Notes', icon: ChartBarIcon },
              { label: 'Usage Rate', value: '94%', icon: UsersIcon }
            ],
            insights: [
              'Lecture notes are the most accessed materials',
              'Video content has 94% completion rate',
              'Students prefer PDF format over other formats',
              'Materials usage peaks on weekends'
            ]
          }
        default:
          return {
            summary: `Report details for ${report.title}.`,
            keyMetrics: [],
            insights: []
          }
      }
    }

    const details = getReportDetails(selectedReport)

    return (
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            ...CARD_SX,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid hsl(var(--border))',
          pb: 2
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {selectedReport.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              {selectedReport.courseCode} • {selectedReport.courseName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={selectedReport.period}
              size="small"
              sx={{ 
                bgcolor: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
                fontWeight: 600
              }}
            />
            <Chip 
              label={selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
              size="small"
              sx={{ 
                bgcolor: getStatusColor(selectedReport.status),
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Summary */}
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {details.summary}
            </Typography>

            {/* Key Metrics */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Key Metrics
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              {details.keyMetrics.map((metric, index) => (
                <Box key={index}>
                  <Paper sx={{ 
                    p: 2, 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'hsl(var(--muted))', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <metric.icon style={{ width: 20, height: 20, color: 'hsl(var(--muted-foreground))' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {metric.value}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Insights */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Key Insights
            </Typography>
            <List sx={{ bgcolor: 'hsl(var(--muted))', borderRadius: 2, p: 1 }}>
              {details.insights.map((insight, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: 'hsl(var(--muted-foreground))' 
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={insight}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: 'hsl(var(--foreground))' }
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {/* Report Info */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: 'hsl(var(--muted))', 
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  Generated on {formatDate(selectedReport.generatedAt)} at {formatTime(selectedReport.generatedAt)}
                </Typography>
                {selectedReport.fileSize && (
                  <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                    File size: {selectedReport.fileSize} • {selectedReport.downloadCount} downloads
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <MUIButton
                  size="small"
                  variant="outlined"
                  onClick={() => handleDownloadReport(selectedReport.id)}
                  sx={BUTTON_STYLES.outlined}
                >
                  <ArrowDownTrayIcon style={{ width: 16, height: 16, marginRight: 4 }} />
                  Download
                </MUIButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid hsl(var(--border))' }}>
          <MUIButton 
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Close
          </MUIButton>
        </DialogActions>
      </Dialog>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <ChartBarIcon style={{ width: 32, height: 32 }} />
            Reports & Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
            Generate and manage detailed reports for your courses
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: 3, 
          mb: 4 
        }}>
          <StatCard
            title="Total Reports"
            value={mockReports.length.toString()}
            icon={DocumentTextIcon}
            color="hsl(var(--muted-foreground))"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Attendance Rate"
            value={`${mockAttendanceStats.attendanceRate}%`}
            icon={CalendarDaysIcon}
            color="hsl(var(--muted-foreground))"
            trend={{ value: mockAttendanceStats.attendanceTrend, isPositive: true }}
          />
          <StatCard
            title="Avg Performance"
            value={`${mockPerformanceStats.averageGrade}%`}
            icon={AcademicCapIcon}
            color="hsl(var(--muted-foreground))"
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard
            title="Active Students"
            value={mockAttendanceStats.averageAttendance.toString()}
            icon={UsersIcon}
            color="hsl(var(--muted-foreground))"
            trend={{ value: 15, isPositive: true }}
          />
        </Box>

        {/* Tabs - Fixed styling */}
        <MUICard sx={{ ...CARD_SX, mb: 4 }}>
          <MUICardContent sx={{ p: 0 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: 'hsl(var(--muted-foreground))',
                  '&.Mui-selected': {
                    color: '#000'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#000',
                  height: 2
                }
              }}
            >
              <Tab label="All Reports" />
              <Tab label="Quick Generate" />
              <Tab label="Analytics" />
            </Tabs>
          </MUICardContent>
        </MUICard>

        {/* Content based on active tab */}
        {activeTab === 0 && (
          <>
            {/* Filters */}
            <MUICard sx={{ ...CARD_SX, mb: 4 }}>
              <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { xs: 'stretch', sm: 'center' },
                  mb: 3
                }}>
                  {/* Search */}
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <MagnifyingGlassIcon style={{ 
                      position: 'absolute', 
                      right: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      width: 20, 
                      height: 20, 
                      color: 'hsl(var(--muted-foreground))' 
                    }} />
                  </Box>

                  {/* Report Type Filter */}
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportTypeFilter}
                      label="Report Type"
                      onChange={(e) => setReportTypeFilter(e.target.value)}
                      sx={INPUT_STYLES}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      {REPORT_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Time Range Filter */}
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                      value={timeRangeFilter}
                      label="Time Range"
                      onChange={(e) => setTimeRangeFilter(e.target.value)}
                      sx={INPUT_STYLES}
                    >
                      {TIME_RANGES.map(range => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Quick Generate Button */}
                  <MUIButton
                    variant="outlined"
                    onClick={() => setActiveTab(1)}
                    sx={BUTTON_STYLES.outlined}
                  >
                    <DocumentTextIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                    Quick Generate
                  </MUIButton>
                </Box>
              </MUICardContent>
            </MUICard>

            {/* Reports List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {filteredReports.length === 0 ? (
                <MUICard sx={CARD_SX}>
                  <MUICardContent sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <DocumentTextIcon style={{ width: 64, height: 64, color: 'hsl(var(--muted-foreground))' }} />
                    <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      {searchQuery || reportTypeFilter !== "all" 
                        ? 'No reports found' 
                        : 'No reports yet'
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      {searchQuery || reportTypeFilter !== "all"
                        ? 'Try adjusting your search terms or filters'
                        : 'Generate your first report to get started'
                      }
                    </Typography>
                  </MUICardContent>
                </MUICard>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(2, 1fr)', 
                    lg: 'repeat(3, 1fr)' 
                  },
                  gap: 3
                }}>
                  {filteredReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </Box>
              )}
            </motion.div>
          </>
        )}

        {activeTab === 1 && (
          <>
            {/* Success Alert */}
            {showSuccessAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ marginBottom: '16px' }}
              >
                <MUICard sx={{ ...CARD_SX, borderColor: '#10b981', bgcolor: '#f0fdf4' }}>
                  <MUICardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        bgcolor: '#10b981', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <DocumentTextIcon style={{ width: 20, height: 20, color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                          Report Generated Successfully!
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {generatedReport?.title} is ready for download.
                        </Typography>
                      </Box>
                      <MUIButton
                        size="small"
                        onClick={() => setShowSuccessAlert(false)}
                        sx={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        <XMarkIcon style={{ width: 16, height: 16 }} />
                      </MUIButton>
                    </Box>
                  </MUICardContent>
                </MUICard>
              </motion.div>
            )}

            {/* Quick Generate Form */}
            <MUICard sx={CARD_SX}>
              <MUICardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Quick Generate Reports
                  </Typography>
                  <MUIButton
                    size="small"
                    onClick={resetQuickGenerate}
                    sx={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Reset
                  </MUIButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Report Type Selection */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                      Select Report Type
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 2
                    }}>
                      {REPORT_TYPES.map((type) => (
                        <MUIButton
                          key={type.value}
                          variant={selectedReportType === type.value ? "contained" : "outlined"}
                          onClick={() => setSelectedReportType(type.value as ReportType)}
                          disabled={isGenerating}
                          sx={{ 
                            ...(selectedReportType === type.value ? BUTTON_STYLES.primary : BUTTON_STYLES.outlined),
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            height: 'auto',
                            minHeight: 80
                          }}
                        >
                          <type.icon style={{ width: 24, height: 24 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {type.label}
                          </Typography>
                        </MUIButton>
                      ))}
                    </Box>
                  </Box>

                  {/* Course Selection */}
                  <FormControl fullWidth>
                    <InputLabel>Select Course</InputLabel>
                    <Select
                      value={selectedCourse}
                      label="Select Course"
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      disabled={isGenerating}
                      sx={INPUT_STYLES}
                    >
                      {mockCourses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Date Range Selection */}
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>Start Date (Optional)</InputLabel>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        disabled={isGenerating}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>End Date (Optional)</InputLabel>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        disabled={isGenerating}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </FormControl>
                  </Box>

                  {/* Generation Progress */}
                  {isGenerating && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Generating report...</Typography>
                        <Typography variant="body2">{Math.round(generationProgress)}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={generationProgress} 
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

                  {/* Generate Button */}
                  <MUIButton
                    variant="contained"
                    onClick={() => selectedReportType && handleGenerateReport(selectedReportType)}
                    disabled={!selectedCourse || !selectedReportType || isGenerating}
                    sx={{ 
                      ...BUTTON_STYLES.primary,
                      py: 1.5,
                      mt: 2
                    }}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </MUIButton>
                </Box>
              </MUICardContent>
            </MUICard>

            {/* Generated Report Preview */}
            {generatedReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MUICard sx={CARD_SX}>
                  <MUICardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                      Generated Report
                    </Typography>
                    <ReportCard report={generatedReport} />
                  </MUICardContent>
                </MUICard>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Analytics Overview */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                lg: 'repeat(4, 1fr)' 
              },
              gap: 3, 
              mb: 4 
            }}>
              <StatCard
                title="Attendance Trend"
                value="+12.5%"
                icon={ChartBarIcon}
                color="hsl(var(--muted-foreground))"
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Avg Performance"
                value="78.5%"
                icon={AcademicCapIcon}
                color="hsl(var(--muted-foreground))"
                trend={{ value: 5.2, isPositive: true }}
              />
              <StatCard
                title="Engagement Score"
                value="8.2/10"
                icon={UsersIcon}
                color="hsl(var(--muted-foreground))"
                trend={{ value: 15, isPositive: true }}
              />
              <StatCard
                title="Materials Usage"
                value="94%"
                icon={DocumentTextIcon}
                color="hsl(var(--muted-foreground))"
                trend={{ value: 8, isPositive: true }}
              />
            </Box>

            {/* Charts Section */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                lg: 'repeat(2, 1fr)' 
              },
              gap: 3, 
              mb: 4 
            }}>
              {/* Attendance Chart */}
              <MUICard sx={CARD_SX}>
                <MUICardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    Attendance Over Time
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={attendanceChartData} options={attendanceChartOptions} />
                  </Box>
                </MUICardContent>
              </MUICard>

              {/* Grade Distribution Chart */}
              <MUICard sx={CARD_SX}>
                <MUICardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    Grade Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={gradeDistributionData} options={gradeDistributionOptions} />
                  </Box>
                </MUICardContent>
              </MUICard>
            </Box>

            {/* Additional Charts */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                lg: 'repeat(2, 1fr)' 
              },
              gap: 3, 
              mb: 4 
            }}>
              {/* Engagement Chart */}
              <MUICard sx={CARD_SX}>
                <MUICardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    Weekly Engagement Pattern
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={engagementData} options={engagementOptions} />
                  </Box>
                </MUICardContent>
              </MUICard>

              {/* Course Performance Chart */}
              <MUICard sx={CARD_SX}>
                <MUICardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    Course Performance Comparison
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar 
                      data={{
                        labels: mockCourses.map(c => c.code),
                        datasets: [{
                          label: 'Performance %',
                          data: [85, 78, 92, 88],
                          backgroundColor: 'hsla(var(--muted-foreground), 0.2)',
                          borderColor: 'hsl(var(--muted-foreground))',
                          borderWidth: 2,
                        }]
                      }} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          title: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'hsl(var(--border))' },
                            ticks: { color: 'hsl(var(--muted-foreground))' },
                          },
                          x: {
                            grid: { color: 'hsl(var(--border))' },
                            ticks: { color: 'hsl(var(--muted-foreground))' },
                          },
                        },
                      }} 
                    />
                  </Box>
                </MUICardContent>
              </MUICard>
            </Box>

            {/* Detailed Analytics */}
            <MUICard sx={CARD_SX}>
              <MUICardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Detailed Analytics
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    md: 'repeat(2, 1fr)' 
                  },
                  gap: 3 
                }}>
                  {/* Course Performance */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Course Performance
                    </Typography>
                    <List sx={{ bgcolor: 'hsl(var(--muted))', borderRadius: 2, p: 1 }}>
                      {mockCourses.map((course, index) => (
                        <ListItem key={course.id} sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : 'hsl(var(--muted-foreground))'
                            }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${course.code} - ${course.name}`}
                            secondary={`${75 + index * 5}% average performance`}
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: { color: 'hsl(var(--foreground))', fontWeight: 600 }
                            }}
                            secondaryTypographyProps={{ 
                              variant: 'caption',
                              sx: { color: 'hsl(var(--muted-foreground))' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Top Insights */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Key Insights
                    </Typography>
                    <List sx={{ bgcolor: 'hsl(var(--muted))', borderRadius: 2, p: 1 }}>
                      {[
                        'Attendance rates have improved by 12.5% this semester',
                        'Student engagement peaks on Tuesday and Thursday',
                        'Materials usage increased by 25% after video content addition',
                        'Assignment completion rate is consistently above 90%',
                        'Peer collaboration has doubled compared to last semester'
                      ].map((insight, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box sx={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%', 
                              bgcolor: 'hsl(var(--muted-foreground))' 
                            }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={insight}
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: { color: 'hsl(var(--foreground))' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              </MUICardContent>
            </MUICard>
          </Box>
        )}
      </motion.div>

      {/* Report View Dialog */}
      <ReportViewDialog />
    </Box>
  )
}