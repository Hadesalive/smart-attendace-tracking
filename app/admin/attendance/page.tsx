"use client"

import React from "react"
import { motion } from "framer-motion"
import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material"
import { ChartPieIcon, DocumentArrowDownIcon, CalendarDaysIcon, TrendingUpIcon } from "@heroicons/react/24/outline"

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function AttendancePage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ANIMATION_CONFIG.spring}
      >
        <Box sx={{ mb: 4 }}>
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
            Attendance Analytics
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#6b7280",
              fontSize: "1rem"
            }}
          >
            System-wide attendance reports and analytics
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <ChartPieIcon style={{ width: 64, height: 64, color: "#8b5cf6", margin: "0 auto 16px" }} />
              <Typography variant="h6" sx={{ fontFamily: "Poppins", mb: 2 }}>
                Attendance Analytics Dashboard
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280", mb: 3 }}>
                Comprehensive attendance analytics and insights
              </Typography>
              <Button variant="contained" sx={{ backgroundColor: "#000" }}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <DocumentArrowDownIcon style={{ width: 64, height: 64, color: "#10b981", margin: "0 auto 16px" }} />
              <Typography variant="h6" sx={{ fontFamily: "Poppins", mb: 2 }}>
                Generate Reports
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280", mb: 3 }}>
                Create detailed attendance reports for analysis
              </Typography>
              <Button variant="contained" sx={{ backgroundColor: "#000" }}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}