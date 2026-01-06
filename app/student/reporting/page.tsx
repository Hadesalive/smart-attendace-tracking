"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  CardContent as MUICardContent, 
  Button as MUIButton, 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from "@mui/material"
import { 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { useReporting } from "@/lib/domains/reporting"
import { toast } from "sonner"

const REPORT_TYPES = [
  { value: 'opinion_suggestion', label: 'Opinion & Suggestion', icon: ChatBubbleLeftRightIcon },
  { value: 'concern_complaint', label: 'Concern & Complaint', icon: ExclamationTriangleIcon },
  { value: 'incident_report', label: 'Incident Report', icon: ShieldCheckIcon },
  { value: 'feedback_teaching', label: 'Teaching Feedback', icon: InformationCircleIcon },
  { value: 'feedback_course', label: 'Course Feedback', icon: DocumentTextIcon },
  { value: 'feedback_administrative', label: 'Administrative Feedback', icon: InformationCircleIcon },
  { value: 'feedback_services', label: 'Services Feedback', icon: InformationCircleIcon },
]

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', color: '#666' },
  { value: 'medium', label: 'Medium', color: '#999' },
  { value: 'high', label: 'High', color: '#cc0000' },
  { value: 'critical', label: 'Critical', color: '#000' },
]

export default function StudentReportingPage() {
  const reporting = useReporting()
  const [formData, setFormData] = useState({
    report_type: '' as any,
    category: '',
    title: '',
    description: '',
    urgency_level: 'medium' as any,
    location_context: '',
    attachment_urls: [] as string[]
  })
  const [submitted, setSubmitted] = useState(false)
  const [referenceCode, setReferenceCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.report_type || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const result = await reporting.submitAnonymousReport({
        report_type: formData.report_type,
        category: formData.category || 'General',
        title: formData.title,
        description: formData.description,
        urgency_level: formData.urgency_level,
        location_context: formData.location_context || undefined,
        attachment_urls: formData.attachment_urls.length > 0 ? formData.attachment_urls : undefined
      })

      setReferenceCode(result.reference_code)
      setSubmitted(true)
      toast.success('Report submitted successfully!')
      
      // Reset form
      setFormData({
        report_type: '' as any,
        category: '',
        title: '',
        description: '',
        urgency_level: 'medium' as any,
        location_context: '',
        attachment_urls: []
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            <MUICardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <CheckCircleIcon className="w-16 h-16" style={{ color: '#000', margin: '0 auto' }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'card-foreground',
                  fontFamily: 'Poppins, sans-serif',
                  mb: 2
                }}
              >
                Report Submitted Successfully
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'muted-foreground',
                  fontFamily: 'DM Sans, sans-serif',
                  mb: 3
                }}
              >
                Your report has been submitted anonymously. You can use the reference code below to track its status (optional).
              </Typography>
              
              <Box sx={{ 
                p: 3, 
                bgcolor: '#f9fafb', 
                borderRadius: 2, 
                mb: 3,
                border: '1px solid #e5e7eb'
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'muted-foreground',
                    fontFamily: 'DM Sans, sans-serif',
                    mb: 1
                  }}
                >
                  Reference Code
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#000',
                    fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '0.05em'
                  }}
                >
                  {referenceCode}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <strong>Important:</strong> Your report is completely anonymous. Save this reference code if you want to check the status of your report later. 
                  The university administration will review your report and take appropriate action.
                </Typography>
              </Alert>

              <MUIButton
                variant="contained"
                onClick={() => {
                  setSubmitted(false)
                  setReferenceCode('')
                }}
                sx={{
                  bgcolor: '#000',
                  color: 'white',
                  fontFamily: 'DM Sans, sans-serif',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': { bgcolor: '#111' }
                }}
              >
                Submit Another Report
              </MUIButton>
            </MUICardContent>
          </MUICard>
        </motion.div>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'card-foreground',
              fontFamily: 'Poppins, sans-serif',
              mb: 1
            }}
          >
            Anonymous Reporting
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'muted-foreground',
              fontFamily: 'DM Sans, sans-serif'
            }}
          >
            Share your opinions, suggestions, concerns, or report incidents anonymously
          </Typography>
        </Box>
      </motion.div>

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
            borderRadius: 3
          }}
        >
          <MUICardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                <strong>Privacy Guaranteed:</strong> All reports are submitted anonymously. Your identity will never be revealed. 
                The university administration will review and respond to reports appropriately.
              </Typography>
            </Alert>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Report Type */}
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontFamily: 'DM Sans, sans-serif' }}>Report Type</InputLabel>
                  <Select
                    value={formData.report_type}
                    onChange={(e) => handleChange('report_type', e.target.value)}
                    label="Report Type"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--border))',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                      },
                    }}
                  >
                    {REPORT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value} sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <type.icon className="w-5 h-5" />
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Category */}
                <TextField
                  fullWidth
                  label="Category (Optional)"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g., Academic, Facilities, Services"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'DM Sans, sans-serif',
                      '& fieldset': { borderColor: 'hsl(var(--border))' },
                      '&:hover fieldset': { borderColor: '#000' },
                      '&.Mui-focused fieldset': { borderColor: '#000' },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'DM Sans, sans-serif',
                    },
                  }}
                />

                {/* Title */}
                <TextField
                  fullWidth
                  required
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Brief summary of your report"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'DM Sans, sans-serif',
                      '& fieldset': { borderColor: 'hsl(var(--border))' },
                      '&:hover fieldset': { borderColor: '#000' },
                      '&.Mui-focused fieldset': { borderColor: '#000' },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'DM Sans, sans-serif',
                    },
                  }}
                />

                {/* Description */}
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={6}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Please provide detailed information about your report..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'DM Sans, sans-serif',
                      '& fieldset': { borderColor: 'hsl(var(--border))' },
                      '&:hover fieldset': { borderColor: '#000' },
                      '&.Mui-focused fieldset': { borderColor: '#000' },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'DM Sans, sans-serif',
                    },
                  }}
                />

                {/* Urgency Level */}
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: 'DM Sans, sans-serif' }}>Urgency Level</InputLabel>
                  <Select
                    value={formData.urgency_level}
                    onChange={(e) => handleChange('urgency_level', e.target.value)}
                    label="Urgency Level"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--border))',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                      },
                    }}
                  >
                    {URGENCY_LEVELS.map((level) => (
                      <MenuItem key={level.value} value={level.value} sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={level.label} 
                            size="small" 
                            sx={{ 
                              bgcolor: level.color, 
                              color: 'white',
                              fontWeight: 600,
                              height: 20,
                              fontSize: '0.7rem'
                            }} 
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Location/Context */}
                <TextField
                  fullWidth
                  label="Location/Context (Optional)"
                  value={formData.location_context}
                  onChange={(e) => handleChange('location_context', e.target.value)}
                  placeholder="e.g., Building A, Room 101, Online platform"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'DM Sans, sans-serif',
                      '& fieldset': { borderColor: 'hsl(var(--border))' },
                      '&:hover fieldset': { borderColor: '#000' },
                      '&.Mui-focused fieldset': { borderColor: '#000' },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'DM Sans, sans-serif',
                    },
                  }}
                />

                <Divider />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <MUIButton
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: '#000',
                      color: 'white',
                      fontFamily: 'DM Sans, sans-serif',
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#111' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                        Submitting...
                      </Box>
                    ) : (
                      'Submit Report'
                    )}
                  </MUIButton>
                </Box>
              </Box>
            </form>
          </MUICardContent>
        </MUICard>
      </motion.div>
    </Box>
  )
}

