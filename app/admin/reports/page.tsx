"use client"

import React from "react"
import { motion } from "framer-motion"
import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material"
import { DocumentTextIcon, ChartBarIcon, UsersIcon, BookOpenIcon } from "@heroicons/react/24/outline"

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function ReportsPage() {
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
            System Reports
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#6b7280",
              fontSize: "1rem"
            }}
          >
            Generate comprehensive reports on system usage and performance
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {[
          { title: "User Reports", icon: UsersIcon, color: "#8b5cf6", description: "User activity and engagement reports" },
          { title: "Course Reports", icon: BookOpenIcon, color: "#10b981", description: "Course performance and enrollment reports" },
          { title: "Attendance Reports", icon: ChartBarIcon, color: "#f59e0b", description: "Detailed attendance analytics and trends" },
          { title: "System Reports", icon: DocumentTextIcon, color: "#06b6d4", description: "System usage and performance metrics" }
        ].map((report, index) => (
          <Grid item xs={12} md={6} key={report.title}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...ANIMATION_CONFIG.spring, delay: index * 0.1 }}
            >
              <Card sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <report.icon style={{ width: 64, height: 64, color: report.color, margin: "0 auto 16px" }} />
                  <Typography variant="h6" sx={{ fontFamily: "Poppins", mb: 2 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "DM Sans", color: "#6b7280", mb: 3 }}>
                    {report.description}
                  </Typography>
                  <Button variant="contained" sx={{ backgroundColor: "#000" }}>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}