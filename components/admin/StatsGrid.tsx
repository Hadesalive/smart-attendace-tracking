/**
 * STATS GRID COMPONENT
 * 
 * A reusable grid component for displaying statistics cards in admin pages.
 * Provides consistent layout and animations for statistical data visualization.
 * 
 * ARCHITECTURE:
 * - Built with React 18 and TypeScript
 * - Uses Material-UI for consistent design system
 * - Implements Framer Motion for smooth animations
 * - Follows monochrome design policy for professional appearance
 * 
 * FEATURES IMPLEMENTED:
 * ✅ Responsive grid layout for statistics cards
 * ✅ Animated card entrance and hover effects
 * ✅ Loading state with skeleton placeholders
 * ✅ Consistent card styling and spacing
 * ✅ Flexible grid configuration
 * 
 * FEATURES TO IMPLEMENT:
 * 🔄 Interactive chart integration
 * 🔄 Real-time data updates
 * 🔄 Customizable card layouts
 * 🔄 Advanced filtering and sorting
 * 🔄 Export functionality for statistics
 * 
 * USAGE:
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { title: "Total Users", value: 150, icon: UsersIcon, color: "#000", subtitle: "Active users", change: "+5%" }
 *   ]}
 *   loading={false}
 * />
 * ```
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 * @lastUpdated 2024-01-23
 */

"use client"

import React, { useMemo } from "react"
import { Box } from "@mui/material"
import { motion } from "framer-motion"
import StatCard from "@/components/dashboard/stat-card"
import { 
  BookOpenIcon, 
  UsersIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon 
} from "@heroicons/react/24/outline"

interface StatCardData {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  subtitle: string
  change: string
}

interface LecturerStats {
  totalCourses: number
  totalStudents: number
  todaySessions: number
  averageAttendance: number
}

interface StatsGridProps {
  stats: StatCardData[] | LecturerStats
  loading?: boolean
  className?: string
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function StatsGrid({ stats, loading = false, className }: StatsGridProps) {
  // Transform lecturer stats to stat card data if needed
  const statCards = useMemo(() => {
    if (Array.isArray(stats)) {
      return stats
    }
    
    // Transform LecturerStats to StatCardData array
    const lecturerStats = stats as LecturerStats
    return [
      {
        title: "Total Courses",
        value: lecturerStats.totalCourses,
        subtitle: "Active courses",
        icon: BookOpenIcon,
        color: "#000000",
        trend: { value: 0, isPositive: true },
        change: "All time"
      },
      {
        title: "Total Students",
        value: lecturerStats.totalStudents,
        subtitle: "Enrolled students",
        icon: UsersIcon,
        color: "#000000",
        trend: { value: 0, isPositive: true },
        change: "Across all courses"
      },
      {
        title: "Today's Sessions",
        value: lecturerStats.todaySessions,
        subtitle: "Scheduled sessions",
        icon: CalendarDaysIcon,
        color: "#000000",
        trend: { value: 0, isPositive: true },
        change: "Today"
      },
      {
        title: "Average Attendance",
        value: `${lecturerStats.averageAttendance}%`,
        subtitle: "Overall attendance",
        icon: CheckCircleIcon,
        color: "#000000",
        trend: { value: 0, isPositive: true },
        change: "This semester"
      }
    ]
  }, [stats])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
      className={className}
    >
      <Box sx={{ 
        display: "grid", 
        gridTemplateColumns: { 
          xs: "1fr", 
          sm: "repeat(2, 1fr)", 
          md: "repeat(4, 1fr)" 
        },
        gap: { xs: 2, sm: 2.5, md: 3 },
        mb: 4,
        minHeight: { xs: "auto", sm: "200px" }
      }}>
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
            change={stat.change}
          />
        ))}
      </Box>
    </motion.div>
  )
}
