"use client"

import React from "react"
import { Box, Typography, Card, CardContent, Divider } from "@mui/material"
import { motion } from "framer-motion"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

interface InfoItem {
  label: string
  value: string | React.ReactNode
  icon?: React.ComponentType<any>
  description?: string
}

interface InfoCardProps {
  title: string
  subtitle?: string
  items: InfoItem[]
  columns?: 1 | 2 | 3
  showDivider?: boolean
}

const CARD_SX = {
  border: "1px solid #000000",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function InfoCard({ 
  title, 
  subtitle, 
  items, 
  columns = 2,
  showDivider = true 
}: InfoCardProps) {
  const gridColumns = {
    1: "1fr",
    2: "repeat(2, 1fr)",
    3: "repeat(3, 1fr)"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring}
    >
      <Card sx={CARD_SX}>
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h5" 
            sx={TYPOGRAPHY_STYLES.sectionTitle}
            mb={2}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              sx={TYPOGRAPHY_STYLES.sectionSubtitle}
              mb={3}
            >
              {subtitle}
            </Typography>
          )}
          
          <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: { 
              xs: "1fr", 
              sm: columns === 1 ? "1fr" : columns === 2 ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
              md: `repeat(${columns}, 1fr)`
            },
            gap: 3 
          }}>
            {items.map((item, index) => (
              <Box key={index}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  {item.icon && (
                    <item.icon style={{ width: 16, height: 16, color: "#6b7280" }} />
                  )}
                  <Typography variant="body2" sx={TYPOGRAPHY_STYLES.sectionSubtitle}>
                    {item.label}
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  component={typeof item.value === 'string' ? 'p' : 'div'}
                  sx={TYPOGRAPHY_STYLES.tableBody}
                >
                  {item.value}
                </Typography>
                {item.description && (
                  <Typography variant="caption" sx={TYPOGRAPHY_STYLES.tableCaption}>
                    {item.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          
          {showDivider && <Divider sx={{ mt: 3, borderColor: "#e5e7eb" }} />}
        </CardContent>
      </Card>
    </motion.div>
  )
}
