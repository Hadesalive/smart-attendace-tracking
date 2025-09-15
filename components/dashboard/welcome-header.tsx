"use client"

import React, { useCallback, useMemo } from "react"
import { Box, Typography, Button } from "@mui/material"
import { motion } from "framer-motion"
import { 
  PlusIcon,
  UsersIcon,
  ComputerDesktopIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CreateSessionForm from "@/components/attendance/create-session-form"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WelcomeHeaderProps {
  onCreateSession: () => void
  lecturerId: string
  userName?: string
  className?: string
}

interface QuickAction {
  id: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  label: string
  description: string
  bgColor: string
  hoverColor: string
  onClick?: () => void
  isDialog?: boolean
}

interface AnimationConfig {
  container: {
    initial: { opacity: number; y: number }
    animate: { opacity: number; y: number }
    transition: { duration: number }
  }
  button: {
    whileHover: { scale: number; rotate: number }
    whileTap: { scale: number }
    transition: { type: string; stiffness: number; damping: number }
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
  },
  button: {
    whileHover: { scale: 1.1, rotate: 5 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  }
} as const

const QUICK_ACTIONS: Omit<QuickAction, 'onClick'>[] = [
  {
    id: 'create-session',
    icon: PlusIcon,
    label: 'Create Session',
    description: 'Start a new attendance session',
    bgColor: '#404040',
    hoverColor: '#000000',
    isDialog: true
  },
  {
    id: 'manage-students',
    icon: UsersIcon,
    label: 'Manage Students',
    description: 'View and manage student enrollments',
    bgColor: '#666666',
    hoverColor: '#404040'
  },
  {
    id: 'view-reports',
    icon: ComputerDesktopIcon,
    label: 'View Reports',
    description: 'Access attendance analytics and reports',
    bgColor: '#999999',
    hoverColor: '#666666'
  }
] as const

const TYPOGRAPHY_CONFIG = {
  title: {
    fontWeight: 800,
    color: '#0F172A',
    fontFamily: 'Poppins, sans-serif',
    lineHeight: 1.2
  },
  subtitle: {
    color: '#64748B',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    lineHeight: 1.4
  }
} as const

const BUTTON_CONFIG = {
  size: {
    xs: 36,
    sm: 40
  },
  iconSize: 18
} as const

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing quick actions
 * Handles action state and provides action handlers
 */
const useQuickActions = (onCreateSession: () => void) => {
  const handleCreateSession = useCallback(() => {
    onCreateSession()
  }, [onCreateSession])

  const handleManageStudents = useCallback(() => {
    // TODO: Implement student management navigation
    console.log('Navigate to student management')
  }, [])

  const handleViewReports = useCallback(() => {
    // TODO: Implement reports navigation
    console.log('Navigate to reports')
  }, [])

  const actionHandlers = useMemo(() => ({
    'create-session': handleCreateSession,
    'manage-students': handleManageStudents,
    'view-reports': handleViewReports
  }), [handleCreateSession, handleManageStudents, handleViewReports])

  return { actionHandlers }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Welcome text section component
 * Displays the main greeting and description
 */
const WelcomeText = ({ 
  userName = "Dr. Smith the Pioneer" 
}: { 
  userName?: string 
}) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      variant="h3"
      sx={{
        ...TYPOGRAPHY_CONFIG.title,
        mb: { xs: 0.5, sm: 1 },
        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
      }}
    >
      Hello, {userName}! 👋
    </Typography>
    <Typography
      variant="h6"
      sx={{
        ...TYPOGRAPHY_CONFIG.subtitle,
        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
      }}
    >
      Here's what's happening with your classes today
    </Typography>
  </Box>
)

/**
 * Quick action button component
 * Individual action button with animations
 */
const QuickActionButton = ({ 
  action, 
  onClick, 
  isDialog = false 
}: { 
  action: QuickAction
  onClick?: () => void
  isDialog?: boolean 
}) => {
  const ButtonComponent = (
    <Box
      onClick={onClick || (() => {})}
      sx={{
        width: { xs: BUTTON_CONFIG.size.xs, sm: BUTTON_CONFIG.size.sm },
        height: { xs: BUTTON_CONFIG.size.xs, sm: BUTTON_CONFIG.size.sm },
        borderRadius: '50%',
        bgcolor: action.bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        '&:hover': {
          bgcolor: action.hoverColor,
          transform: 'scale(1.05)',
          '& .hover-tooltip': {
            opacity: 1,
            visibility: 'visible'
          }
        }
      }}
      aria-label={action.label}
      title={action.description}
    >
      <action.icon aria-hidden="true" style={{ 
        width: BUTTON_CONFIG.iconSize, 
        height: BUTTON_CONFIG.iconSize,
        color: '#ffffff'
      }} />
      
      {/* Hover Tooltip */}
      <Box
        className="hover-tooltip"
        sx={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          mb: 1,
          px: 2,
          py: 1,
          backgroundColor: '#000000',
          color: '#ffffff',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          opacity: 0,
          visibility: 'hidden',
          transition: 'all 0.2s ease-in-out',
          zIndex: 1000,
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '4px solid transparent',
            borderTopColor: '#000000'
          }
        }}
      >
        {action.label}
      </Box>
    </Box>
  )

  if (isDialog) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {ButtonComponent}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Attendance Session</DialogTitle>
            <DialogDescription>
              Fill in the details to start a new attendance session for one of your courses.
            </DialogDescription>
          </DialogHeader>
        <CreateSessionForm
          lecturerId=""
          onSessionCreated={onClick || (() => {})}
        />
        </DialogContent>
      </Dialog>
    )
  }

  return ButtonComponent
}

/**
 * Quick actions section component
 * Container for all quick action buttons
 */
const QuickActionsSection = ({ 
  actions, 
  actionHandlers 
}: { 
  actions: QuickAction[]
  actionHandlers: Record<string, () => void>
}) => (
  <Box sx={{ 
    display: 'flex', 
    gap: { xs: 1, sm: 1.5 }, 
    alignItems: 'center',
    flexShrink: 0
  }}>
    {actions.map((action, index) => (
      <motion.div
        key={action.id}
        whileHover={{ 
          scale: ANIMATION_CONFIG.button.whileHover.scale, 
          rotate: ANIMATION_CONFIG.button.whileHover.rotate * (index % 2 === 0 ? 1 : -1)
        }}
        whileTap={ANIMATION_CONFIG.button.whileTap}
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
      >
        <QuickActionButton
          action={action}
          onClick={actionHandlers[action.id]}
          isDialog={action.isDialog}
        />
      </motion.div>
    ))}
  </Box>
)

/**
 * Main container component
 * Handles layout and responsive behavior
 */
const WelcomeContainer = ({ 
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
  >
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between', 
      alignItems: { xs: 'flex-start', sm: 'flex-start' },
      mb: { xs: 3, sm: 4 },
      gap: { xs: 2, sm: 0 },
      ...(className && { className })
    }}>
      {children}
    </Box>
  </motion.div>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * WelcomeHeader component
 * 
 * Displays a welcome message with quick action buttons for lecturers.
 * Features:
 * - Personalized greeting
 * - Quick action buttons with animations
 * - Responsive design
 * - Accessibility features
 * - Color fading effect for actions
 * 
 * @param onCreateSession - Callback when session creation is requested
 * @param lecturerId - ID of the lecturer
 * @param userName - Display name of the lecturer
 * @param className - Optional additional CSS classes
 */
export default function WelcomeHeader({ 
  onCreateSession, 
  lecturerId, 
  userName,
  className 
}: WelcomeHeaderProps) {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const { actionHandlers } = useQuickActions(onCreateSession)

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const quickActions = useMemo((): QuickAction[] => 
    QUICK_ACTIONS.map(action => ({
      ...action,
      onClick: actionHandlers[action.id as keyof typeof actionHandlers]
    })), [actionHandlers]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <WelcomeContainer className={className}>
      <WelcomeText userName={userName} />
      <QuickActionsSection 
        actions={quickActions}
        actionHandlers={actionHandlers}
      />
    </WelcomeContainer>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { WelcomeHeaderProps, QuickAction, AnimationConfig }
export { ANIMATION_CONFIG, QUICK_ACTIONS, TYPOGRAPHY_CONFIG, BUTTON_CONFIG }