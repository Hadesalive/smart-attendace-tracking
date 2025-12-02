"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Box, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { ServerIcon } from "@heroicons/react/24/outline"
import WelcomeHeader from "./welcome-header"
import StatsGrid from "@/components/admin/StatsGrid"
import AnalyticsCard from "./analytics-card"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdminStats {
    totalCourses: number
    totalStudents: number
    todaySessions: number
    averageAttendance: number
}

interface AdminDashboardProps {
    userId: string
    className?: string
}

interface DashboardState {
    stats: AdminStats
    loading: boolean
    error: string | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATS: AdminStats = {
    totalCourses: 0,
    totalStudents: 0,
    todaySessions: 0,
    averageAttendance: 0
}

const ANIMATION_VARIANTS = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }
} as const

const LOADING_CONFIG = {
    spinner: {
        size: 64,
        color: '#000000',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    text: {
        color: '#666666',
        fontFamily: 'DM Sans'
    }
} as const

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useDashboardState = (userId: string) => {
    const [state, setState] = useState<DashboardState>({
        stats: INITIAL_STATS,
        loading: true,
        error: null
    })

    const updateState = useCallback((updates: Partial<DashboardState>) => {
        setState(prev => ({ ...prev, ...updates }))
    }, [])

    return {
        state,
        updateState
    }
}

const useDataFetching = (userId: string) => {
    const fetchAdminData = useCallback(async (): Promise<{
        stats: AdminStats
    }> => {
        try {
            const { supabase } = await import('@/lib/supabase')

            // Fetch total courses count
            const { count: coursesCount, error: coursesError } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })

            if (coursesError) {
                console.error('Error fetching courses count:', coursesError)
            }

            // Fetch total students count (users with role 'student')
            const { count: studentsCount, error: studentsError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student')

            if (studentsError) {
                console.error('Error fetching students count:', studentsError)
            }

            // Fetch today's sessions count
            const today = new Date().toISOString().split('T')[0]
            const { count: todaySessionsCount, error: sessionsError } = await supabase
                .from('attendance_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('session_date', today)

            if (sessionsError) {
                console.error('Error fetching today sessions count:', sessionsError)
            }

            // Calculate average attendance across all sessions
            const { data: allSessions } = await supabase
                .from('attendance_sessions')
                .select('id')

            const { data: allAttendanceRecords } = await supabase
                .from('attendance_records')
                .select('id')

            let averageAttendance = 87 // Default fallback

            if (allSessions && allAttendanceRecords && studentsCount) {
                const totalPossibleAttendance = (studentsCount || 0) * (allSessions.length || 1)
                if (totalPossibleAttendance > 0) {
                    averageAttendance = Math.round(
                        ((allAttendanceRecords.length || 0) / totalPossibleAttendance) * 100
                    )
                }
            }

            const stats: AdminStats = {
                totalCourses: coursesCount || 0,
                totalStudents: studentsCount || 0,
                todaySessions: todaySessionsCount || 0,
                averageAttendance
            }

            return { stats }
        } catch (error) {
            console.error('Error fetching admin data:', error)
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
            throw new Error(errorMessage)
        }
    }, [userId])

    return { fetchAdminData }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ErrorDisplay = ({
    error,
    onRetry
}: {
    error: string
    onRetry: () => void
}) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 400,
        flexDirection: 'column',
        gap: 2
    }}>
        <Typography
            variant="h6"
            sx={{
                color: '#dc2626',
                fontFamily: 'DM Sans',
                textAlign: 'center'
            }}
        >
            Failed to load dashboard
        </Typography>
        <Typography
            variant="body2"
            sx={{
                color: '#666666',
                fontFamily: 'DM Sans',
                textAlign: 'center',
                maxWidth: 400
            }}
        >
            {error}
        </Typography>
        <button
            onClick={onRetry}
            style={{
                padding: '8px 16px',
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'DM Sans',
                fontWeight: 600
            }}
            aria-label="Retry loading dashboard"
        >
            Try Again
        </button>
    </Box>
)

const LoadingSpinner = () => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 400
        }}
        role="status"
        aria-label="Loading dashboard data"
    >
        <Box sx={{ textAlign: 'center' }}>
            <Box
                sx={{
                    width: LOADING_CONFIG.spinner.size,
                    height: LOADING_CONFIG.spinner.size,
                    borderRadius: '50%',
                    bgcolor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.3 }
                    },
                    animation: LOADING_CONFIG.spinner.animation
                }}
                aria-hidden="true"
            >
                <ServerIcon
                    style={{
                        width: 32,
                        height: 32,
                        color: LOADING_CONFIG.spinner.color
                    }}
                />
            </Box>
            <Typography
                variant="h6"
                sx={{
                    color: LOADING_CONFIG.text.color,
                    fontFamily: LOADING_CONFIG.text.fontFamily
                }}
            >
                Loading dashboard...
            </Typography>
        </Box>
    </Box>
)

const WelcomeSection = ({ userId }: { userId: string }) => (
    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <WelcomeHeader lecturerId={userId} onCreateSession={() => { }} userName="Administrator" />
    </Box>
)

const StatisticsSection = ({ stats }: { stats: AdminStats }) => (
    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <StatsGrid stats={stats} />
    </Box>
)

const AnalyticsSection = () => (
    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <AnalyticsCard />
    </Box>
)

const SystemOverviewSection = () => (
    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins', fontWeight: 600 }}>
                System Overview
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Active Lecturers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        342
                    </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Active Students
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        905
                    </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Today's Sessions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        23
                    </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        System Uptime
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                        99.9%
                    </Typography>
                </Box>
            </Box>
        </Box>
    </Box>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboardMaterial({
    userId,
    className
}: AdminDashboardProps) {
    const { state, updateState } = useDashboardState(userId)
    const { fetchAdminData } = useDataFetching(userId)

    useEffect(() => {
        const loadData = async () => {
            try {
                updateState({ loading: true, error: null })
                const data = await fetchAdminData()
                updateState({
                    ...data,
                    loading: false,
                    error: null
                })
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
                const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'
                updateState({
                    loading: false,
                    error: errorMessage
                })
            }
        }

        loadData()
    }, [userId])

    const handleRetry = useCallback(() => {
        const loadData = async () => {
            try {
                updateState({ loading: true, error: null })
                const data = await fetchAdminData()
                updateState({
                    ...data,
                    loading: false,
                    error: null
                })
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
                const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'
                updateState({
                    loading: false,
                    error: errorMessage
                })
            }
        }
        loadData()
    }, [fetchAdminData, updateState])

    if (state.loading) {
        return <LoadingSpinner />
    }

    if (state.error) {
        return <ErrorDisplay error={state.error} onRetry={handleRetry} />
    }

    return (
        <Box sx={{
            bgcolor: 'transparent',
            py: { xs: 1, sm: 2, md: 0 },
            px: { xs: 1, sm: 2, md: 0 },
            ...(className && { className })
        }}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={ANIMATION_VARIANTS.container}
            >
                <WelcomeSection userId={userId} />

                <StatisticsSection stats={state.stats} />

                <AnalyticsSection />

                <SystemOverviewSection />
            </motion.div>
        </Box>
    )
}

export type { AdminDashboardProps, AdminStats, DashboardState }
export { INITIAL_STATS, ANIMATION_VARIANTS, LOADING_CONFIG }
