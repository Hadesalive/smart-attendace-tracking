"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card as MUICard, 
  Button as MUIButton,
  Tabs,
  Tab,
  Chip,
  Alert
} from "@mui/material"
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { useReporting } from "@/lib/domains/reporting"
import { formatDate } from "@/lib/utils"

export default function AdminReputationManagementPage() {
  const reporting = useReporting()
  const [selectedTab, setSelectedTab] = useState(0)

  useEffect(() => {
    reporting.fetchAnonymousReports()
    reporting.fetchSocialMediaMentions()
    reporting.fetchRumors()
    reporting.fetchReputationAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const reports = reporting.state.anonymousReports
  const mentions = reporting.state.socialMediaMentions
  const rumors = reporting.state.rumors
  const analytics = reporting.state.reputationAnalytics

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
            Reputation Management
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'muted-foreground',
              fontFamily: 'DM Sans, sans-serif'
            }}
          >
            Manage anonymous reports, social media mentions, and university reputation
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
            borderRadius: 3,
            mb: 3
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'border',
              '& .MuiTab-root': {
                fontFamily: 'DM Sans, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 64,
              }
            }}
          >
            <Tab label="Anonymous Reports" />
            <Tab label="Social Media Mentions" />
            <Tab label="Rumors" />
            <Tab label="Analytics" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {selectedTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2, fontWeight: 700 }}>
                  Anonymous Reports ({reports.length})
                </Typography>
                {reports.length === 0 ? (
                  <Alert severity="info">No reports available</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reports.map((report) => (
                      <MUICard key={report.id} sx={{ border: '1px solid', borderColor: 'border', borderRadius: 2 }}>
                        <Box sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                              {report.title}
                            </Typography>
                            <Chip label={report.status} size="small" />
                          </Box>
                          <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground', mb: 1 }}>
                            {report.description}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'muted-foreground' }}>
                            Reference: {report.reference_code} • {formatDate(report.created_at)}
                          </Typography>
                        </Box>
                      </MUICard>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {selectedTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2, fontWeight: 700 }}>
                  Social Media Mentions ({mentions.length})
                </Typography>
                <Alert severity="info">
                  Social media monitoring features will be implemented with API integrations.
                </Alert>
              </Box>
            )}

            {selectedTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2, fontWeight: 700 }}>
                  Rumors ({rumors.length})
                </Typography>
                <Alert severity="info">
                  Rumor management interface coming soon.
                </Alert>
              </Box>
            )}

            {selectedTab === 3 && (
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2, fontWeight: 700 }}>
                  Reputation Analytics
                </Typography>
                <Alert severity="info">
                  Analytics dashboard will display reputation metrics, sentiment analysis, and trends.
                </Alert>
              </Box>
            )}
          </Box>
        </MUICard>
      </motion.div>
    </Box>
  )
}

