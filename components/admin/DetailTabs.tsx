"use client"

import React from "react"
import { Box, Tabs, Tab, Card, CardContent, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

interface TabItem {
  label: string
  value: string
  content: React.ReactNode
  icon?: React.ComponentType<any>
}

interface DetailTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (value: string) => void
  title?: string
  subtitle?: string
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

export default function DetailTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  title,
  subtitle 
}: DetailTabsProps) {
  const activeTabContent = tabs.find(tab => tab.value === activeTab)?.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring}
    >
      <Card sx={CARD_SX}>
        <CardContent sx={{ p: 0 }}>
          {(title || subtitle) && (
            <Box sx={{ p: 3, pb: 0 }}>
              {title && (
                <Typography 
                  variant="h5" 
                  sx={TYPOGRAPHY_STYLES.sectionTitle}
                  mb={1}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body2" 
                  sx={TYPOGRAPHY_STYLES.sectionSubtitle}
                  mb={2}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
          
          <Tabs 
            value={activeTab} 
            onChange={(e, value) => onTabChange(value)}
            sx={{
              borderBottom: "1px solid #e5e7eb",
              "& .MuiTab-root": {
                fontFamily: "DM Sans, sans-serif",
                textTransform: "none",
                minWidth: "auto",
                px: 3,
                py: 2,
                "&.Mui-selected": {
                  color: "#000000",
                  fontWeight: 600
                }
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#000000",
                height: 2
              }
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.icon && <tab.icon style={{ width: 16, height: 16 }} />}
                    {tab.label}
                  </Box>
                }
                value={tab.value}
              />
            ))}
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTabContent}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}
