"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { 
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TopNavProps {
  onMenuClick: () => void
  userName: string
  userRole: string
}

interface ScrollPosition {
  window: number
  body: number
  main: number
  max: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SCROLL_THRESHOLD = 10
const NOTIFICATION_COUNT = 3

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for scroll detection with multiple fallbacks
 * Handles scroll events from window, document, body, and main content
 */
const useScrollDetection = (threshold: number = SCROLL_THRESHOLD) => {
  const [isScrolled, setIsScrolled] = useState(false)

  const getScrollPosition = useCallback((): ScrollPosition => {
    const windowScroll = window.pageYOffset || document.documentElement.scrollTop
    const bodyScroll = document.body.scrollTop
    const mainContent = document.querySelector('main')
    const mainScroll = mainContent ? mainContent.scrollTop : 0
    
    const maxScroll = Math.max(windowScroll, bodyScroll, mainScroll)
    
    return {
      window: windowScroll,
      body: bodyScroll,
      main: mainScroll,
      max: maxScroll
    }
  }, [])

  const handleScroll = useCallback(() => {
    const scrollPosition = getScrollPosition()
    setIsScrolled(scrollPosition.max > threshold)
  }, [getScrollPosition, threshold])

  useEffect(() => {
    // Initial check
    handleScroll()

    // Event listeners for different scroll sources
    const scrollSources = [
      { element: window, event: 'scroll' },
      { element: document, event: 'scroll' },
      { element: document.body, event: 'scroll' }
    ]

    // Add main content listener if it exists
    const mainContent = document.querySelector('main')
    if (mainContent) {
      scrollSources.push({ element: mainContent, event: 'scroll' })
    }

    // Attach all listeners
    scrollSources.forEach(({ element, event }) => {
      element.addEventListener(event, handleScroll, { passive: true })
    })

    // Cleanup function
    return () => {
      scrollSources.forEach(({ element, event }) => {
        element.removeEventListener(event, handleScroll)
      })
    }
  }, [handleScroll])

  return isScrolled
}

/**
 * Custom hook for theme management
 * TODO: Integrate with actual theme provider
 */
const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
    // TODO: Integrate with theme provider
  }, [])

  return { isDarkMode, toggleTheme }
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const styles = {
  header: {
    base: "fixed top-0 left-0 right-0 z-50 px-4 py-3 lg:px-6 transition-all duration-300 lg:left-64",
    scrolled: "bg-gray-100/80 backdrop-blur-lg border-b border-gray-200/30 shadow-lg",
    transparent: "bg-transparent"
  },
  button: {
    base: "flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-300 rounded-full p-2",
    scrolled: "bg-gray-100/60 hover:bg-gray-100/80 backdrop-blur-sm border border-gray-200/30",
    transparent: "bg-transparent hover:bg-gray-100/30"
  },
  searchInput: {
    base: "pl-10 w-full font-dm-sans rounded-full placeholder:text-slate-400 text-slate-700 transition-all duration-300",
    scrolled: "bg-gray-100/70 backdrop-blur-md border-gray-200/50 focus:bg-gray-50 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm",
    transparent: "bg-transparent border-transparent focus:bg-gray-50/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
  },
  userProfile: {
    base: "flex items-center gap-3 pl-2 transition-all duration-300 rounded-full",
    scrolled: "bg-gray-100/60 hover:bg-gray-100/80 backdrop-blur-sm border border-gray-200/30 px-2 py-1",
    transparent: "bg-transparent hover:bg-gray-100/30 px-2 py-1"
  }
} as const

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Mobile menu button component
 */
const MobileMenuButton = ({ 
  onMenuClick, 
  isScrolled 
}: { 
  onMenuClick: () => void
  isScrolled: boolean 
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onMenuClick}
    className={cn(
      "lg:hidden text-slate-600 hover:text-slate-900 transition-all duration-300 flex-shrink-0 relative z-20",
      isScrolled 
        ? "bg-white/50 hover:bg-white/70 border border-white/20" 
        : "hover:bg-white/20"
    )}
    aria-label="Toggle mobile menu"
  >
    <Bars3Icon className="h-5 w-5" />
  </Button>
)

/**
 * Search bar component
 */
const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  isScrolled 
}: { 
  searchQuery: string
  onSearchChange: (query: string) => void
  isScrolled: boolean 
}) => (
  <div className="hidden lg:block relative flex-1 max-w-md mx-4">
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="text"
        placeholder="Search employees, locations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
          styles.searchInput.base,
          isScrolled ? styles.searchInput.scrolled : styles.searchInput.transparent
        )}
        aria-label="Search"
      />
    </div>
  </div>
)

/**
 * Theme toggle button component
 */
const ThemeToggle = ({ 
  isDarkMode, 
  onToggle, 
  isScrolled 
}: { 
  isDarkMode: boolean
  onToggle: () => void
  isScrolled: boolean 
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onToggle}
    className={cn(
      styles.button.base,
      isScrolled ? styles.button.scrolled : styles.button.transparent
    )}
    aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
  >
    {isDarkMode ? (
      <SunIcon className="h-4 w-4" />
    ) : (
      <MoonIcon className="h-4 w-4" />
    )}
  </Button>
)

/**
 * Notifications button component
 */
const NotificationsButton = ({ 
  count, 
  isScrolled 
}: { 
  count: number
  isScrolled: boolean 
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      "relative text-slate-600 hover:text-slate-900 transition-all duration-300 rounded-full p-2",
      isScrolled ? styles.button.scrolled : styles.button.transparent
    )}
    aria-label={`Notifications (${count} unread)`}
  >
    <BellIcon className="h-5 w-5" />
    {count > 0 && (
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 rounded-full"
        aria-label={`${count} unread notifications`}
      >
        {count}
      </Badge>
    )}
  </Button>
)

/**
 * User profile component
 */
const UserProfile = ({ 
  userName, 
  userRole, 
  isScrolled 
}: { 
  userName: string
  userRole: string
  isScrolled: boolean 
}) => (
  <div className={cn(
    styles.userProfile.base,
    isScrolled ? styles.userProfile.scrolled : styles.userProfile.transparent
  )}>
    <div className="text-right hidden sm:block">
      <p className="text-sm font-medium text-slate-900 font-poppins">{userName}</p>
      <p className="text-xs text-slate-500 capitalize font-dm-sans">{userRole}</p>
    </div>
    <Button
      variant="ghost"
      size="sm"
      className="p-1 text-slate-600 hover:text-slate-900 bg-transparent hover:bg-transparent border-0 transition-colors duration-300 rounded-full"
      aria-label="User profile menu"
    >
      <UserCircleIcon className="h-8 w-8" />
    </Button>
  </div>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TopNavigation component with glassmorphism effect on scroll
 * 
 * Features:
 * - Responsive design (mobile/desktop)
 * - Scroll-triggered glassmorphism effect
 * - Theme toggle functionality
 * - Search functionality
 * - Notifications with badge
 * - User profile display
 * 
 * @param onMenuClick - Function to handle mobile menu toggle
 * @param userName - Display name of the current user
 * @param userRole - Role of the current user
 */
export default function TopNav({ onMenuClick, userName, userRole }: TopNavProps) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [searchQuery, setSearchQuery] = useState("")
  const isScrolled = useScrollDetection()
  const { isDarkMode, toggleTheme } = useTheme()

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const headerClassName = useMemo(() => cn(
    styles.header.base,
    isScrolled ? styles.header.scrolled : styles.header.transparent
  ), [isScrolled])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    // TODO: Implement search functionality
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <header className={headerClassName}>
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <MobileMenuButton 
          onMenuClick={onMenuClick} 
          isScrolled={isScrolled} 
        />

        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isScrolled={isScrolled}
        />

        {/* Right Section - Theme, Notifications, Avatar */}
        <div className="flex items-center gap-2">
          <ThemeToggle 
            isDarkMode={isDarkMode}
            onToggle={toggleTheme}
            isScrolled={isScrolled}
          />

          <NotificationsButton 
            count={NOTIFICATION_COUNT}
            isScrolled={isScrolled}
          />

          <UserProfile 
            userName={userName}
            userRole={userRole}
            isScrolled={isScrolled}
          />
        </div>
      </div>
    </header>
  )
}