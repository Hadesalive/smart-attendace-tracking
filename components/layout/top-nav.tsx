"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { 
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  EyeIcon,
  ArrowRightIcon
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
  onSignOut?: () => void
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
// MOCK NOTIFICATION DATA
// ============================================================================

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Assignment Posted",
    message: "Introduction to Programming assignment is now available",
    type: "info",
    time: "2 minutes ago",
    isRead: true,
    actionUrl: "/student/homework"
  },
  {
    id: "2",
    title: "Grade Updated",
    message: "Your Calculus II midterm grade has been posted",
    type: "success",
    time: "1 hour ago",
    isRead: false,
    actionUrl: "/student/grades"
  },
  {
    id: "3",
    title: "Session Reminder",
    message: "Data Structures lecture starts in 15 minutes",
    type: "warning",
    time: "3 hours ago",
    isRead: true,
    actionUrl: "/student/sessions"
  },
  {
    id: "4",
    title: "Assignment Due Soon",
    message: "Database Design project due tomorrow at 11:59 PM",
    type: "error",
    time: "1 day ago",
    isRead: true,
    actionUrl: "/student/homework"
  },
  {
    id: "5",
    title: "New Material Available",
    message: "Week 5 lecture slides have been uploaded",
    type: "info",
    time: "2 days ago",
    isRead: true,
    actionUrl: "/student/materials"
  }
]

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  time: string
  isRead: boolean
  actionUrl?: string
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLDivElement | null>
}

// ============================================================================
// PROFILE DROPDOWN TYPES
// ============================================================================

interface ProfileDropdownProps {
  userName: string
  userRole: string
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  anchorRef: React.RefObject<HTMLDivElement | null>
}

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


// ============================================================================
// COMPONENT STYLES
// ============================================================================

const styles = {
  header: {
    base: "fixed top-0 left-0 right-0 z-50 px-4 py-3 lg:px-6 transition-all duration-300 lg:left-64",
    scrolled: "bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-lg",
    transparent: "bg-transparent"
  },
  button: {
    base: "flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-300 rounded-lg px-3 py-2",
    scrolled: "bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200/30 shadow-sm",
    transparent: "bg-transparent hover:bg-white/30"
  },
  searchInput: {
    base: "pl-10 w-full font-dm-sans rounded-lg placeholder:text-slate-400 text-slate-700 transition-all duration-300",
    scrolled: "bg-white/70 backdrop-blur-md border-gray-200/50 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm",
    transparent: "bg-transparent border-transparent focus:bg-white/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
  },
  userProfile: {
    base: "flex items-center gap-3 pl-2 transition-all duration-300 rounded-lg cursor-pointer",
    scrolled: "bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200/30 px-3 py-2 shadow-sm",
    transparent: "bg-transparent hover:bg-white/30 px-3 py-2"
  },
  profileDropdown: {
    base: "absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200/50 backdrop-blur-lg z-50",
    animation: "transform transition-all duration-200 ease-out"
  },
  notificationDropdown: {
    base: "absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-lg z-50",
    animation: "transform transition-all duration-300 ease-out"
  },
  notificationItem: {
    base: "flex items-start gap-3 p-4 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer",
    unread: "bg-gray-50/50 border-l-4 border-l-black",
    read: "border-l-4 border-l-transparent"
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
        placeholder="Search courses, assignments..."
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
 * Notification dropdown component
 */
const NotificationDropdown = ({ 
  isOpen, 
  onClose, 
  anchorRef 
}: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const unreadCount = mockNotifications.filter(n => !n.isRead).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  const getNotificationIcon = (notification: Notification) => {
    // Use specific icons based on notification content, not just type
    if (notification.title.includes('Assignment')) {
      return <AcademicCapIcon className="h-5 w-5 text-gray-700" />
    }
    if (notification.title.includes('Grade')) {
      return <ChartBarIcon className="h-5 w-5 text-gray-700" />
    }
    if (notification.title.includes('Session')) {
      return <CalendarDaysIcon className="h-5 w-5 text-gray-700" />
    }
    if (notification.title.includes('Material')) {
      return <DocumentTextIcon className="h-5 w-5 text-gray-700" />
    }
    if (notification.title.includes('Due Soon')) {
      return <ClockIcon className="h-5 w-5 text-gray-700" />
    }
    // Default fallback
    return <BellIcon className="h-5 w-5 text-gray-700" />
  }


  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
    className={cn(
        styles.notificationDropdown.base,
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 font-poppins">Notifications</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-dm-sans">
              {unreadCount} unread
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-dm-sans">No notifications yet</p>
          </div>
        ) : (
          mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                styles.notificationItem.base,
                notification.isRead ? styles.notificationItem.read : styles.notificationItem.unread
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium text-gray-900 font-poppins",
                      !notification.isRead && "font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 font-dm-sans mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2 ml-2" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <ClockIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 font-dm-sans">
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full text-center text-sm text-gray-700 hover:text-black font-medium font-dm-sans transition-colors duration-200 flex items-center justify-center gap-2">
          View all notifications
          <ArrowRightIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

/**
 * Notifications button component with dropdown
 */
const NotificationsButton = ({ 
  count, 
  isScrolled 
}: { 
  count: number
  isScrolled: boolean 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const handleNotificationClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative">
  <Button
    variant="ghost"
    size="sm"
        onClick={handleNotificationClick}
    className={cn(
          "relative text-slate-600 hover:text-slate-900 transition-all duration-300 rounded-lg px-3 py-2",
      isScrolled ? styles.button.scrolled : styles.button.transparent
    )}
    aria-label={`Notifications (${count} unread)`}
  >
    <BellIcon className="h-5 w-5" />
        {count > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-black text-white flex items-center justify-center text-xs rounded-full animate-pulse">
            {count}
          </div>
        )}
  </Button>
      
      <NotificationDropdown
        isOpen={isDropdownOpen}
        onClose={handleCloseDropdown}
        anchorRef={notificationRef}
      />
    </div>
  )
}

/**
 * Profile dropdown component
 */
const ProfileDropdown = ({ 
  userName, 
  userRole, 
  isOpen, 
  onClose, 
  onSignOut, 
  anchorRef 
}: ProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className={cn(
        styles.profileDropdown.base,
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-poppins">{userName}</p>
            <p className="text-xs text-gray-500 capitalize font-dm-sans">{userRole}</p>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button
          onClick={() => {
            // TODO: Navigate to profile page
            onClose()
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <UserIcon className="h-4 w-4" />
          View Profile
        </button>
        
        <button
          onClick={() => {
            // TODO: Navigate to settings page
            onClose()
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          Settings
        </button>
        
        <div className="border-t border-gray-100 my-2" />
        
        <button
          onClick={() => {
            onSignOut?.()
            onClose()
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

/**
 * User profile component with dropdown
 */
const UserProfile = ({ 
  userName, 
  userRole, 
  isScrolled,
  onSignOut
}: { 
  userName: string
  userRole: string
  isScrolled: boolean 
  onSignOut?: () => void
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative">
      <div
        ref={profileRef}
        onClick={handleProfileClick}
        className={cn(
    styles.userProfile.base,
    isScrolled ? styles.userProfile.scrolled : styles.userProfile.transparent
        )}
      >
    <div className="text-right hidden sm:block">
      <p className="text-sm font-medium text-slate-900 font-poppins">{userName}</p>
      <p className="text-xs text-slate-500 capitalize font-dm-sans">{userRole}</p>
    </div>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8 text-slate-600" />
          <ChevronDownIcon className={cn(
            "h-4 w-4 text-slate-500 transition-transform duration-200",
            isDropdownOpen && "rotate-180"
          )} />
        </div>
      </div>
      
      <ProfileDropdown
        userName={userName}
        userRole={userRole}
        isOpen={isDropdownOpen}
        onClose={handleCloseDropdown}
        onSignOut={onSignOut}
        anchorRef={profileRef}
      />
  </div>
)
}

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
export default function TopNav({ onMenuClick, userName, userRole, onSignOut }: TopNavProps) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [searchQuery, setSearchQuery] = useState("")
  const isScrolled = useScrollDetection()

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

        {/* Right Section - Notifications, Avatar */}
        <div className="flex items-center gap-2">
          <NotificationsButton 
            count={NOTIFICATION_COUNT}
            isScrolled={isScrolled}
          />

          <UserProfile 
            userName={userName}
            userRole={userRole}
            isScrolled={isScrolled}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  )
}