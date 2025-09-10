"use client"

import React, { useMemo } from "react"
import { Box } from "@mui/material"
import { motion } from "framer-motion"
import StatCard from "./stat-card"
import { 
  BookOpenIcon, 
  UsersIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon 
} from "@heroicons/react/24/outline"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LecturerStats {
  totalCourses: number
  totalStudents: number
  todaySessions: number
  averageAttendance: number
}

interface StatsGridProps {
  stats: LecturerStats
  className?: string
}

interface StatData {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  trend: {
    value: number
    isPositive: boolean
  }
  change: string
}

interface AnimationConfig {
  container: {
    initial: { opacity: number; y: number }
    animate: { opacity: number; y: number }
    transition: { duration: number }
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_CONFIG: AnimationConfig = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }
} as const

const GRID_CONFIG = {
  columns: {
    xs: 'repeat(1, 1fr)',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(2, 1fr)',
    lg: 'repeat(4, 1fr)'
  },
  gap: {
    xs: 2,
    sm: 2.5,
    md: 3
  },
  marginBottom: {
    xs: 2,
    sm: 3,
    md: 3
  }
} as const

const STAT_COLORS = {
  primary: '#000000',
  secondary: '#666666',
  tertiary: '#999999'
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates stat data configuration based on lecturer stats
 * @param stats - The lecturer statistics
 * @returns Array of stat data objects
 */
const createStatsData = (stats: LecturerStats): StatData[] => [
  {
    title: 'Total Courses',
    value: stats.totalCourses,
    subtitle: 'Courses you\'re teaching',
    icon: BookOpenIcon,
    color: STAT_COLORS.primary,
    trend: { value: 2.1, isPositive: true },
    change: '+2 new courses this semester'
  },
  {
    title: 'Total Students',
    value: stats.totalStudents,
    subtitle: 'Across all courses',
    icon: UsersIcon,
    color: STAT_COLORS.primary,
    trend: { value: 5.2, isPositive: true },
    change: '+12 new students enrolled'
  },
  {
    title: 'Today\'s Sessions',
    value: stats.todaySessions,
    subtitle: 'Active attendance sessions',
    icon: CalendarDaysIcon,
    color: STAT_COLORS.secondary,
    trend: { value: 0, isPositive: true },
    change: '3 sessions scheduled today'
  },
  {
    title: 'Attendance Rate',
    value: `${stats.averageAttendance}%`,
    subtitle: 'This week',
    icon: CheckCircleIcon,
    color: STAT_COLORS.tertiary,
    trend: { value: 1.8, isPositive: true },
    change: '+2.3% from last week'
  }
]

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Grid container component
 * Handles responsive grid layout
 */
const GridContainer = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => (
  <Box sx={{ 
    display: 'grid', 
    gridTemplateColumns: GRID_CONFIG.columns,
    gap: GRID_CONFIG.gap,
    mb: GRID_CONFIG.marginBottom,
    ...(className && { className })
  }} role="region" aria-label="Lecturer statistics overview">
    {children}
  </Box>
)

/**
 * Animated container component
 * Handles entrance animations
 */
const AnimatedContainer = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => (
  <motion.div
    initial={ANIMATION_CONFIG.container.initial}
    animate={ANIMATION_CONFIG.container.animate}
    transition={ANIMATION_CONFIG.container.transition}
    className={className}
  >
    {children}
  </motion.div>
)

/**
 * Stat card wrapper component
 * Individual stat card with proper key
 */
const StatCardWrapper = ({ 
  stat, 
  index 
}: { 
  stat: StatData
  index: number 
}) => (
  <StatCard
    key={`${stat.title}-${index}`}
    title={stat.title}
    value={stat.value}
    subtitle={stat.subtitle}
    icon={stat.icon}
    color={stat.color}
    trend={stat.trend}
    change={stat.change}
  />
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * StatsGrid component
 * 
 * Displays a responsive grid of statistics cards for the lecturer dashboard.
 * Features:
 * - Responsive grid layout (1-4 columns based on screen size)
 * - Animated entrance
 * - Consistent styling and colors
 * - Trend indicators
 * - Accessibility features
 * 
 * @param stats - Lecturer statistics data
 * @param className - Optional additional CSS classes
 */
export default function StatsGrid({ 
  stats, 
  className 
}: StatsGridProps) {
  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const statsData = useMemo(() => createStatsData(stats), [stats])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AnimatedContainer className={className}>
      <GridContainer>
        {statsData.map((stat, index) => (
          <StatCardWrapper
            key={`${stat.title}-${index}`}
            stat={stat}
            index={index}
          />
        ))}
      </GridContainer>
    </AnimatedContainer>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { StatsGridProps, LecturerStats, StatData, AnimationConfig }
export { ANIMATION_CONFIG, GRID_CONFIG, STAT_COLORS, createStatsData }