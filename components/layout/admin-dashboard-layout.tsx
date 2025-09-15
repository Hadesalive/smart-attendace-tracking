"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import AdminSidebar from "./admin-sidebar"
import TopNav from "./top-nav"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  userName: string
  className?: string
  onSignOut?: () => void
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
      sidebarOpen: width >= BREAKPOINTS.desktop ? true : prev.sidebarOpen
    }))
  }, [])

  useEffect(() => {
    updateBreakpoints()
    window.addEventListener('resize', updateBreakpoints)
    return () => window.removeEventListener('resize', updateBreakpoints)
  }, [updateBreakpoints])

  return breakpointState
}

/**
 * Custom hook for sidebar state management
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
 */
const useLayoutState = () => {
  const breakpointState = useResponsiveBreakpoints()
  const sidebarState = useSidebarState(breakpointState.isDesktop)

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Admin-specific dashboard layout using AdminSidebar
 */
export default function AdminDashboardLayout({ 
  children, 
  userName, 
  className,
  onSignOut
}: AdminDashboardLayoutProps) {
  const {
    sidebarOpen,
    isDesktop,
    isTablet,
    isMobile,
    toggleSidebar,
    closeSidebar
  } = useLayoutState()

  const containerClassName = useMemo(() => cn(
    LAYOUT_CLASSES.container,
    className
  ), [className])

  const handleMenuClick = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  const handleSidebarClose = useCallback(() => {
    closeSidebar()
  }, [closeSidebar])

  return (
    <div className={containerClassName}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
      />

      {/* Main Content Area */}
      <MainContent>
        {/* Top Navigation */}
        <TopNav 
          onMenuClick={handleMenuClick}
          userName={userName}
          userRole="Admin"
          onSignOut={onSignOut}
        />
        
        {/* Page Content */}
        <PageContent>
          {children}
        </PageContent>
      </MainContent>
    </div>
  )
}


