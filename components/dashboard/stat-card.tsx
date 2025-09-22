"use client"

import React, { useMemo } from "react"
import { Box, Card, CardContent, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>
  color: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  change?: string
  className?: string
}

interface TrendIndicatorProps {
  trend: {
    value: number
    isPositive: boolean
  }
}

interface IconContainerProps {
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>
  color: string
}

interface BackgroundOverlayProps {
  color: string
}

interface AnimationConfig {
  card: {
    initial: { opacity: number; y: number }
    animate: { opacity: number; y: number }
    transition: { duration: number }
  }
  hover: {
    transform: string
    boxShadow: string
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_CONFIG: AnimationConfig = {
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  hover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
} as const

const CARD_STYLES = {
  base: {
    bgcolor: 'card',
    border: '1px solid',
    borderColor: 'border',
    borderRadius: 3,
    height: '100%',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  hover: {
    '&:hover': {
      transform: ANIMATION_CONFIG.hover.transform,
      boxShadow: ANIMATION_CONFIG.hover.boxShadow,
      '& .stat-icon': {
        transform: 'scale(1.1)'
      }
    }
  }
} as const

const ICON_CONFIG = {
  size: {
    xs: 48,
    sm: 52,
    md: 56
  },
  iconSize: 28,
  borderRadius: '16px'
} as const

const TYPOGRAPHY_CONFIG = {
  value: {
    fontWeight: 800,
    color: 'card-foreground',
    fontFamily: 'Poppins, sans-serif',
    lineHeight: 1.2
  },
  title: {
    fontWeight: 600,
    color: 'card-foreground',
    fontFamily: 'Poppins, sans-serif'
  },
  subtitle: {
    color: 'muted-foreground',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500
  },
  change: {
    color: 'muted-foreground',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500
  },
  trend: {
    fontWeight: 700,
    fontFamily: 'DM Sans, sans-serif'
  }
} as const

const TREND_COLORS = {
  positive: '#10B981',
  negative: '#EF4444',
  positiveBg: '#10B98115',
  negativeBg: '#EF444415'
} as const

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Background gradient overlay component
 * Adds subtle color accent to the card
 */
const BackgroundOverlay = ({ color }: BackgroundOverlayProps) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
      zIndex: 0
    }}
    aria-hidden="true"
  />
)

/**
 * Icon container component
 * Displays the stat icon with styling
 */
const IconContainer = ({ icon: Icon, color }: IconContainerProps) => (
  <Box
    className="stat-icon"
    sx={{
      width: { xs: ICON_CONFIG.size.xs, sm: ICON_CONFIG.size.sm, md: ICON_CONFIG.size.md },
      height: { xs: ICON_CONFIG.size.xs, sm: ICON_CONFIG.size.sm, md: ICON_CONFIG.size.md },
      borderRadius: ICON_CONFIG.borderRadius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f5f5',
      color: color,
      transition: 'all 0.3s ease',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: ICON_CONFIG.borderRadius,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        zIndex: -1
      }
    }}
    aria-hidden="true"
  >
    <Icon style={{ 
      width: ICON_CONFIG.iconSize, 
      height: ICON_CONFIG.iconSize 
    }} />
  </Box>
)

/**
 * Trend indicator component
 * Shows trend value and direction
 */
const TrendIndicator = ({ trend }: TrendIndicatorProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Typography
      variant="caption"
      sx={{
        color: trend.isPositive ? TREND_COLORS.positive : TREND_COLORS.negative,
        ...TYPOGRAPHY_CONFIG.trend,
        fontSize: '0.75rem'
      }}
    >
      {trend.isPositive ? '+' : ''}{trend.value}%
    </Typography>
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: trend.isPositive ? TREND_COLORS.positiveBg : TREND_COLORS.negativeBg
      }}
    >
      {trend.isPositive ? (
        <CheckCircleIcon style={{ 
          width: 12, 
          height: 12, 
          color: TREND_COLORS.positive 
        }} />
      ) : (
        <ExclamationTriangleIcon style={{ 
          width: 12, 
          height: 12, 
          color: TREND_COLORS.negative 
        }} />
      )}
    </Box>
  </Box>
)

/**
 * Header section component
 * Contains icon and trend indicator
 */
const HeaderSection = ({ 
  icon, 
  color, 
  trend 
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>
  color: string
  trend?: { value: number; isPositive: boolean }
}) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    mb: { xs: 1.5, sm: 2, md: 2 } 
  }}>
    <IconContainer icon={icon} color={color} />
    {trend && <TrendIndicator trend={trend} />}
  </Box>
)

/**
 * Value display component
 * Shows the main statistic value
 */
const ValueDisplay = ({ value }: { value: string | number }) => {
  // Handle very long text by adjusting font size dynamically
  const valueStr = String(value)
  const isLongText = valueStr.length > 20
  
  return (
    <Typography
      variant="h3"
      sx={{
        ...TYPOGRAPHY_CONFIG.value,
        mb: { xs: 0.5, sm: 1 },
        fontSize: isLongText 
          ? { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
          : { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
        lineHeight: isLongText ? 1.1 : 1.2,
        wordBreak: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: isLongText ? 3 : 1,
        WebkitBoxOrient: 'vertical'
      }}
    >
      {value}
    </Typography>
  )
}

/**
 * Title display component
 * Shows the statistic title
 */
const TitleDisplay = ({ title }: { title: string }) => {
  // Handle very long titles by adjusting font size dynamically
  const isLongTitle = title.length > 25
  
  return (
    <Typography
      variant="h6"
      sx={{
        ...TYPOGRAPHY_CONFIG.title,
        mb: { xs: 0.5, sm: 1 },
        fontSize: isLongTitle 
          ? { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' }
          : { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
        lineHeight: 1.2,
        wordBreak: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: isLongTitle ? 2 : 1,
        WebkitBoxOrient: 'vertical'
      }}
    >
      {title}
    </Typography>
  )
}

/**
 * Subtitle display component
 * Shows optional subtitle text
 */
const SubtitleDisplay = ({ subtitle }: { subtitle: string }) => (
  <Typography
    variant="body2"
    sx={{
      ...TYPOGRAPHY_CONFIG.subtitle,
      fontSize: '0.875rem'
    }}
  >
    {subtitle}
  </Typography>
)

/**
 * Change indicator component
 * Shows optional change information
 */
const ChangeIndicator = ({ change }: { change: string }) => (
  <Box sx={{ 
    mt: 2, 
    pt: 2, 
    borderTop: '1px solid', 
    borderColor: 'border' 
  }}>
    <Typography
      variant="caption"
      sx={{
        ...TYPOGRAPHY_CONFIG.change,
        fontSize: '0.75rem'
      }}
    >
      {change}
    </Typography>
  </Box>
)

/**
 * Card content component
 * Main content area of the stat card
 */
const CardContentArea = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => (
  <CardContent sx={{ 
    p: { xs: 2, sm: 2.5, md: 3 }, 
    position: 'relative', 
    zIndex: 1 
  }}>
    {children}
  </CardContent>
)

/**
 * Animated card wrapper component
 * Handles entrance animations
 */
const AnimatedCard = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => (
  <motion.div
    initial={ANIMATION_CONFIG.card.initial}
    animate={ANIMATION_CONFIG.card.animate}
    transition={ANIMATION_CONFIG.card.transition}
    className={className}
  >
    {children}
  </motion.div>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * StatCard component
 * 
 * Displays a single statistic with icon, value, and optional trend information.
 * Features:
 * - Responsive design
 * - Hover animations
 * - Trend indicators
 * - Accessibility features
 * - Consistent styling
 * 
 * @param title - The title of the statistic
 * @param value - The value to display
 * @param icon - Icon component to display
 * @param color - Color theme for the card
 * @param subtitle - Optional subtitle text
 * @param trend - Optional trend data
 * @param change - Optional change description
 * @param className - Optional additional CSS classes
 */
export default function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  trend,
  change,
  className
}: StatCardProps) {
  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const cardStyles = useMemo(() => ({
    ...CARD_STYLES.base,
    ...CARD_STYLES.hover
  }), [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AnimatedCard className={className}>
      <Card sx={cardStyles}>
        <BackgroundOverlay color={color} />
        
        <CardContentArea>
          <HeaderSection 
            icon={icon} 
            color={color} 
            trend={trend} 
          />
          
          <ValueDisplay value={value} />
          <TitleDisplay title={title} />
          
          {subtitle && <SubtitleDisplay subtitle={subtitle} />}
          {change && <ChangeIndicator change={change} />}
        </CardContentArea>
      </Card>
    </AnimatedCard>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { StatCardProps, TrendIndicatorProps, IconContainerProps, BackgroundOverlayProps, AnimationConfig }
export { ANIMATION_CONFIG, CARD_STYLES, ICON_CONFIG, TYPOGRAPHY_CONFIG, TREND_COLORS }