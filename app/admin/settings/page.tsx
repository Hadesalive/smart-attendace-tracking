"use client"

import React from "react"
import { motion } from "framer-motion"
import { Box, Typography, Card, CardContent, Grid, Button, Switch, FormControlLabel } from "@mui/material"
import { Cog6ToothIcon, BellIcon, ShieldCheckIcon, DatabaseIcon } from "@heroicons/react/24/outline"

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function SettingsPage() {
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
            System Settings
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#6b7280",
              fontSize: "1rem"
            }}
          >
            Configure system settings and preferences
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {[
          { 
            title: "General Settings", 
            icon: Cog6ToothIcon, 
            color: "#8b5cf6", 
            settings: [
              { label: "Enable QR Code Attendance", checked: true },
              { label: "Allow Late Attendance", checked: false },
              { label: "Auto-close Sessions", checked: true }
            ]
          },
          { 
            title: "Notifications", 
            icon: BellIcon, 
            color: "#10b981", 
            settings: [
              { label: "Email Notifications", checked: true },
              { label: "SMS Notifications", checked: false },
              { label: "Push Notifications", checked: true }
            ]
          },
          { 
            title: "Security", 
            icon: ShieldCheckIcon, 
            color: "#f59e0b", 
            settings: [
              { label: "Two-Factor Authentication", checked: true },
              { label: "Session Timeout", checked: true },
              { label: "IP Restrictions", checked: false }
            ]
          },
          { 
            title: "Data Management", 
            icon: DatabaseIcon, 
            color: "#06b6d4", 
            settings: [
              { label: "Auto Backup", checked: true },
              { label: "Data Retention", checked: true },
              { label: "Export Data", checked: false }
            ]
          }
        ].map((section, index) => (
          <Grid item xs={12} md={6} key={section.title}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...ANIMATION_CONFIG.spring, delay: index * 0.1 }}
            >
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: "8px", 
                        backgroundColor: `${section.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2
                      }}
                    >
                      <section.icon style={{ width: 24, height: 24, color: section.color }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {section.settings.map((setting, settingIndex) => (
                      <FormControlLabel
                        key={settingIndex}
                        control={<Switch defaultChecked={setting.checked} />}
                        label={setting.label}
                        sx={{ "& .MuiFormControlLabel-label": { fontFamily: "DM Sans" } }}
                      />
                    ))}
                  </Box>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      mt: 3, 
                      fontFamily: "DM Sans", 
                      textTransform: "none",
                      borderColor: "#e5e7eb",
                      color: "#374151"
                    }}
                  >
                    Save Changes
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