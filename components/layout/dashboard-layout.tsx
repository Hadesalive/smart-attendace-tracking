"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import AdminSidebar from "./admin-sidebar"
import LecturerSidebar from "./lecturer-sidebar"
import StudentSidebar from "./student-sidebar"
import TopNav from "./top-nav"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
  userRole: string
  className?: string
}

interface BreakpointConfig {
  desktop: number
  tablet: number
  mobile: number
}

interface LayoutState {
  sidebarOpen: boolean
  isDesktop: boolean
  isTablet: boolean
  isMobile: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BREAKPOINTS: BreakpointConfig = {
  desktop: 1024, // lg
  tablet: 768,   // md
  mobile: 640    // sm
} as const

const LAYOUT_CLASSES = {
  container: "h-screen bg-slate-50 flex",
  mainContent: "flex-1 flex flex-col overflow-hidden",
  pageContent: "flex-1 overflow-y-auto p-4 sm:p-6 pt-16 sm:pt-20 lg:pt-20",
  contentWrapper: "max-w-7xl mx-auto"
} as const

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for responsive breakpoint detection
 * Handles window resize events and provides current breakpoint state
 */
const useResponsiveBreakpoints = () => {
  const [breakpointState, setBreakpointState] = useState<LayoutState>({
    sidebarOpen: false,
    isDesktop: false,
    isTablet: false,
    isMobile: false
  })

  const updateBreakpoints = useCallback(() => {
    const width = window.innerWidth
    
    setBreakpointState(prev => ({
      ...prev,
      isDesktop: width >= BREAKPOINTS.desktop,
      isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
      isMobile: width < BREAKPOINTS.tablet,
      // Auto-manage sidebar state based on breakpoint
      sidebarOpen: width >= BREAKPOINTS.desktop ? true : prev.sidebarOpen
    }))
  }, [])

  useEffect(() => {
    // Initial check
    updateBreakpoints()

    // Add resize listener
    window.addEventListener('resize', updateBreakpoints)
    
    return () => window.removeEventListener('resize', updateBreakpoints)
  }, [updateBreakpoints])

  return breakpointState
}

/**
 * Custom hook for sidebar state management
 * Provides sidebar control functions and state
 */
const useSidebarState = (initialState: boolean = false) => {
  const [sidebarOpen, setSidebarOpen] = useState(initialState)

  const openSidebar = useCallback(() => {
    setSidebarOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return {
    sidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setSidebarOpen
  }
}

/**
 * Custom hook for layout management
 * Combines responsive breakpoints with sidebar state
 */
const useLayoutState = () => {
  const breakpointState = useResponsiveBreakpoints()
  const sidebarState = useSidebarState(breakpointState.isDesktop)

  // Sync sidebar state with breakpoint changes
  useEffect(() => {
    if (breakpointState.isDesktop) {
      sidebarState.setSidebarOpen(true)
    } else if (breakpointState.isMobile) {
      sidebarState.setSidebarOpen(false)
    }
  }, [breakpointState.isDesktop, breakpointState.isMobile, sidebarState.setSidebarOpen])

  return {
    ...breakpointState,
    ...sidebarState
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Main content area component
 * Handles the scrollable content area with proper spacing
 */
const MainContent = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => (
  <div className={cn(LAYOUT_CLASSES.mainContent, className)}>
    {children}
  </div>
)

/**
 * Page content wrapper component
 * Provides consistent padding and max-width constraints
 */
const PageContent = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => (
  <main className={cn(LAYOUT_CLASSES.pageContent, className)}>
    <div className={LAYOUT_CLASSES.contentWrapper}>
      {children}
    </div>
  </main>
)

/**
 * Sidebar wrapper component
 * Manages sidebar visibility and state with role-specific sidebars
 */
const SidebarWrapper = ({ 
  isOpen, 
  onClose,
  userRole
}: { 
  isOpen: boolean
  onClose: () => void 
  userRole: string
}) => {
  // Render the appropriate sidebar based on user role
  switch (userRole) {
    case 'Admin':
      return <AdminSidebar isOpen={isOpen} onClose={onClose} />
    case 'Lecturer':
      return <LecturerSidebar isOpen={isOpen} onClose={onClose} />
    case 'Student':
      return <StudentSidebar isOpen={isOpen} onClose={onClose} />
    default:
      // Default to Lecturer sidebar for backwards compatibility
      return <LecturerSidebar isOpen={isOpen} onClose={onClose} />
  }
}

/**
 * Top navigation wrapper component
 * Handles navigation state and user information
 */
const TopNavWrapper = ({ 
  onMenuClick, 
  userName, 
  userRole 
}: { 
  onMenuClick: () => void
  userName: string
  userRole: string 
}) => (
  <TopNav 
    onMenuClick={onMenuClick}
    userName={userName}
    userRole={userRole}
  />
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DashboardLayout component
 * 
 * Provides the main layout structure for the dashboard application with:
 * - Responsive sidebar (desktop/mobile)
 * - Top navigation bar
 * - Scrollable content area
 * - Proper breakpoint handling
 * - Accessibility features
 * 
 * @param children - The page content to render
 * @param userName - Display name of the current user
 * @param userRole - Role of the current user
 * @param className - Optional additional CSS classes
 */
export default function DashboardLayout({ 
  children, 
  userName, 
  userRole, 
  className 
}: DashboardLayoutProps) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const {
    sidebarOpen,
    isDesktop,
    isTablet,
    isMobile,
    toggleSidebar,
    closeSidebar
  } = useLayoutState()

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const containerClassName = useMemo(() => cn(
    LAYOUT_CLASSES.container,
    className
  ), [className])

  const layoutInfo = useMemo(() => ({
    breakpoint: isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile',
    sidebarVisible: sidebarOpen,
    isResponsive: true
  }), [isDesktop, isTablet, isMobile, sidebarOpen])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuClick = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  const handleSidebarClose = useCallback(() => {
    closeSidebar()
  }, [closeSidebar])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Log layout changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Layout state changed:', layoutInfo)
    }
  }, [layoutInfo])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={containerClassName}>
      {/* Sidebar */}
      <SidebarWrapper 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <MainContent>
        {/* Top Navigation */}
        <TopNavWrapper 
          onMenuClick={handleMenuClick}
          userName={userName}
          userRole={userRole}
        />
        
        {/* Page Content */}
        <PageContent>
          {children}
        </PageContent>
      </MainContent>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { DashboardLayoutProps, BreakpointConfig, LayoutState }
export { BREAKPOINTS, LAYOUT_CLASSES }