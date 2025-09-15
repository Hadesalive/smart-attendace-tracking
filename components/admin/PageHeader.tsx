/**
 * PAGE HEADER COMPONENT
 * 
 * A reusable header component for admin pages that provides consistent styling
 * and layout for page titles, subtitles, and action buttons.
 * 
 * ARCHITECTURE:
 * - Built with React 18 and TypeScript
 * - Uses Material-UI for consistent design system
 * - Implements Framer Motion for smooth animations
 * - Follows monochrome design policy for professional appearance
 * 
 * FEATURES IMPLEMENTED:
 * ✅ Consistent page header styling
 * ✅ Animated title and subtitle display
 * ✅ Flexible action buttons area
 * ✅ Responsive design for all screen sizes
 * ✅ Smooth entrance animations
 * 
 * FEATURES TO IMPLEMENT:
 * 🔄 Breadcrumb navigation integration
 * 🔄 Page-level search functionality
 * 🔄 Page-level filtering options
 * 🔄 Page-level export functionality
 * 🔄 Page-level help and documentation
 * 
 * USAGE:
 * ```tsx
 * <PageHeader
 *   title="Users"
 *   subtitle="Manage user accounts and permissions"
 *   actions={<Button>Add User</Button>}
 * />
 * ```
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 * @lastUpdated 2024-01-23
 */

"use client"

import React from "react"
import { Box, Typography, Button } from "@mui/material"
import { motion } from "framer-motion"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: React.ReactNode
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring}
    >
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 4 
      }}>
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={TYPOGRAPHY_STYLES.pageTitle}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            sx={TYPOGRAPHY_STYLES.pageSubtitle}
          >
            {subtitle}
          </Typography>
        </Box>
        {actions && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {actions}
          </Box>
        )}
      </Box>
    </motion.div>
  )
}
