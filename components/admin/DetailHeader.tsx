"use client"

import React from "react"
import { Box, Typography, Button, Chip } from "@mui/material"
import { motion } from "framer-motion"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

interface DetailHeaderProps {
  title: string
  subtitle?: string
  status?: {
    label: string
    color: string
  }
  actions?: React.ReactNode
  metadata?: Array<{
    label: string
    value: string
    icon?: React.ComponentType<any>
  }>
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function DetailHeader({ 
  title, 
  subtitle, 
  status, 
  actions, 
  metadata = [] 
}: DetailHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring}
    >
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={TYPOGRAPHY_STYLES.pageTitle}
              >
                {title}
              </Typography>
              {status && (
                <Chip 
                  label={status.label} 
                  size="small"
                  sx={{ 
                    backgroundColor: `${status.color}20`,
                    color: status.color,
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                    textTransform: "capitalize"
                  }}
                />
              )}
            </Box>
            {subtitle && (
              <Typography 
                variant="body1" 
                sx={TYPOGRAPHY_STYLES.pageSubtitle}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {actions}
            </Box>
          )}
        </Box>
        
        {metadata.length > 0 && (
          <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2,
            p: 3,
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            border: "1px solid #e5e7eb"
          }}>
            {metadata.map((item, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {item.icon && <item.icon style={{ width: 16, height: 16, color: "#6b7280" }} />}
                <Box>
                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </motion.div>
  )
}
