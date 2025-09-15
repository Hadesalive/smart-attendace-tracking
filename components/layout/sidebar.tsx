"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { 
  ComputerDesktopIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string
}

interface NavigationItem {
    name: string
    icon: React.ComponentType<{ className?: string }>
    href: string
  }

interface NavItemProps {
  item: NavigationItem
  isActive: boolean
  isHovered: boolean
  isFocused: boolean
  onHover: (itemName: string, isHovered: boolean) => void
  onFocus: (itemName: string, isFocused: boolean) => void
  onBlur: (isFocused: boolean) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

interface AnimationVariants {
  [key: string]: any
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NAV_ITEMS_BY_ROLE: Record<string, NavigationItem[]> = {
  Lecturer: [
    { name: "Dashboard", icon: ComputerDesktopIcon, href: "/dashboard" },
    { name: "Gradebook", icon: BookOpenIcon, href: "/lecturer/gradebook" },
    { name: "Attendance", icon: CalendarDaysIcon, href: "/lecturer/attendance" },
    { name: "Sessions", icon: ClipboardDocumentListIcon, href: "/lecturer/sessions" },
    { name: "Homework", icon: AcademicCapIcon, href: "/lecturer/homework" },
    { name: "Lesson Materials", icon: DocumentTextIcon, href: "/lecturer/materials" },
    { name: "Reports", icon: ChartPieIcon, href: "/reports" },
    { name: "Settings", icon: Cog6ToothIcon, href: "/settings" },
  ],
  Admin: [
    { name: "Dashboard", icon: ComputerDesktopIcon, href: "/dashboard" },
    { name: "Users", icon: UsersIcon, href: "/admin/users" },
    { name: "Courses", icon: BookOpenIcon, href: "/admin/courses" },
    { name: "Sessions", icon: ClipboardDocumentListIcon, href: "/admin/sessions" },
    { name: "Attendance", icon: CalendarDaysIcon, href: "/admin/attendance" },
    { name: "Reports", icon: ChartPieIcon, href: "/admin/reports" },
    { name: "Settings", icon: Cog6ToothIcon, href: "/admin/settings" },
  ],
  Student: [
    { name: "Dashboard", icon: ComputerDesktopIcon, href: "/dashboard" },
    { name: "Courses", icon: BookOpenIcon, href: "/student/courses" },
    { name: "Sessions", icon: ClipboardDocumentListIcon, href: "/student/sessions" },
    { name: "Attendance", icon: CalendarDaysIcon, href: "/student/attendance" },
    { name: "Homework", icon: AcademicCapIcon, href: "/student/homework" },
    { name: "Materials", icon: DocumentTextIcon, href: "/student/materials" },
    { name: "Profile", icon: UsersIcon, href: "/student/profile" },
  ],
}

const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = NAV_ITEMS_BY_ROLE.Lecturer

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  },
  springFast: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17
  },
  easeInOut: {
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1] as const
  }
} as const

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const animationVariants: AnimationVariants = {
  // Mobile overlay animations
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  
  background: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  
  overlayPattern: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { delay: 0.1, duration: 0.2 }
  },
  
  // Mobile sidebar animations
  mobileSidebar: {
    initial: { x: -400, scale: 0.8, opacity: 0 },
    animate: { x: 0, scale: 1, opacity: 1 },
    exit: { x: -400, scale: 0.8, opacity: 0 },
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 25,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  
  // Brand section animations
  brandSection: {
    initial: { opacity: 0, y: -30, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  
  brandLogo: {
    whileHover: { 
      scale: 1.1, 
      rotate: 5,
      // removed shadow on hover for minimal design
    },
    whileTap: { scale: 0.95 },
    transition: ANIMATION_CONFIG.springFast
  },
  
  brandText: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { delay: 0.4, duration: 0.4 }
  },
  
  brandSubtitle: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 0.6, duration: 0.3 }
  },
  
  // Navigation item animations
  navItem: {
    initial: { opacity: 0, x: -50, scale: 0.8, rotateY: -15 },
    animate: { opacity: 1, x: 0, scale: 1, rotateY: 0 },
    transition: { delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    whileHover: { x: 8, scale: 1.02, transition: { duration: 0.2 } }
  },
  
  // Separator line animation
  separator: {
    initial: { scaleX: 0, opacity: 0 },
    animate: { scaleX: 1, opacity: 1 },
    transition: { delay: 0.3, duration: 0.4, ease: "easeInOut" }
  }
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing navigation item interactions
 */
const useNavigationState = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [focusedItem, setFocusedItem] = useState<string | null>(null)

  const handleItemHover = useCallback((itemName: string, isHovered: boolean) => {
    setHoveredItem(isHovered ? itemName : null)
  }, [])

  const handleItemFocus = useCallback((itemName: string, isFocused: boolean) => {
    setFocusedItem(isFocused ? itemName : null)
  }, [])

  const handleItemBlur = useCallback(() => {
    setFocusedItem(null)
  }, [])

  return {
    hoveredItem,
    focusedItem,
    handleItemHover,
    handleItemFocus,
    handleItemBlur
  }
}

/**
 * Custom hook for handling navigation item keyboard events
 */
const useNavigationKeyboard = () => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.location.href = href
    }
  }, [])

  return { handleKeyDown }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Active state indicator component
 */
const ActiveIndicator = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ opacity: 0, height: '70%' }}
        animate={{ opacity: 1, height: '70%' }}
        exit={{ opacity: 0, height: '70%' }}
        transition={ANIMATION_CONFIG.spring}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-black rounded-r-full"
        style={{ zIndex: 2 }}
      />
    )}
  </AnimatePresence>
)

/**
 * Focus state indicator component
 */
const FocusIndicator = ({ isFocused, isActive }: { isFocused: boolean; isActive: boolean }) => (
  <AnimatePresence>
    {isFocused && !isActive && (
      <motion.div
        initial={{ opacity: 0, height: '40%' }}
        animate={{ opacity: 0.6, height: '40%' }}
        exit={{ opacity: 0, height: '40%' }}
        transition={ANIMATION_CONFIG.springFast}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 bg-gray-400 rounded-r-full"
      />
    )}
  </AnimatePresence>
)

/**
 * Navigation item icon component
 */
const NavItemIcon = ({ 
  item, 
  isHighlighted, 
  isHovered, 
  isActive 
}: { 
  item: NavigationItem
  isHighlighted: boolean
  isHovered: boolean
  isActive: boolean
}) => (
  <motion.div
    className="relative"
    animate={{ 
      scale: isHighlighted ? 1.15 : 1,
      rotate: isHovered && !isActive ? 5 : 0,
      y: isHovered ? -2 : 0
    }}
    transition={ANIMATION_CONFIG.spring}
  >
      <motion.div
        className="p-2 rounded-lg transition-all duration-300"
        whileHover={{ scale: 1.05, rotate: 2 }}
      >
      <item.icon className={cn(
        "h-5 w-5 transition-all duration-300",
        isActive ? "text-black" : "text-gray-500 group-hover:text-black"
      )} />
    </motion.div>
  </motion.div>
)

/**
 * Navigation item text component
 */
const NavItemText = ({ 
  item, 
  isHovered, 
  isActive 
}: { 
  item: NavigationItem
  isHovered: boolean
  isActive: boolean
}) => (
  <motion.span 
    className="font-dm-sans font-medium text-sm transition-all duration-300"
    animate={{ 
      x: isHovered ? 4 : 0,
      color: isActive ? "#000000" : isHovered ? "#000000" : "#6B7280"
    }}
    transition={ANIMATION_CONFIG.spring}
  >
    {item.name}
  </motion.span>
)

/**
 * Individual navigation item component with sophisticated animations
 */
const NavItem = ({ 
  item, 
  isActive, 
  isHovered, 
  isFocused, 
  onHover, 
  onFocus, 
  onBlur, 
  onKeyDown 
}: NavItemProps) => {
  const [mounted, setMounted] = useState(false)
  const { handleKeyDown } = useNavigationKeyboard()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const isHighlighted = isActive || isHovered || isFocused

  const handleKeyDownEvent = (e: React.KeyboardEvent) => {
    handleKeyDown(e, item.href)
    onKeyDown?.(e)
  }

  if (!mounted) return null

  return (
    <motion.a
      href={item.href}
      className={cn(
        "group relative flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer select-none overflow-hidden",
        isActive 
          ? "text-black" 
          : "text-gray-600 hover:text-black"
      )}
      onMouseEnter={() => onHover(item.name, true)}
      onMouseLeave={() => onHover(item.name, false)}
      onFocus={() => onFocus(item.name, true)}
      onBlur={() => onBlur(false)}
      onKeyDown={handleKeyDownEvent}
      tabIndex={0}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
      whileHover={{ 
        x: 8,
        scale: 1.02,
        // removed hover shadow for minimal design
      }}
      whileTap={{ 
        scale: 0.98,
        x: 4
      }}
      animate={{ 
        borderLeft: isActive ? '2px solid #000000' : '2px solid transparent'
      }}
      transition={ANIMATION_CONFIG.spring}
    >
      {/* Active indicator removed to keep only the minimal left border */}
      {/* Focus indicator removed for a single, minimal active indicator */}
      
      <NavItemIcon 
        item={item}
        isHighlighted={isHighlighted}
        isHovered={isHovered}
        isActive={isActive}
      />
      
      <NavItemText 
        item={item}
        isHovered={isHovered}
        isActive={isActive}
      />
    </motion.a>
  )
}

/**
 * Mobile overlay component
 */
const MobileOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
      {isOpen && (
        <motion.div 
        className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        {...animationVariants.overlay}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200"
          {...animationVariants.background}
        />
        <motion.div
          className="absolute inset-0 bg-black/20"
          {...animationVariants.overlayPattern}
        />
      </motion.div>
    )}
  </AnimatePresence>
)

/**
 * Brand section component
 */
const BrandSection = ({ isMobile = false }: { isMobile?: boolean }) => {
  const logoVariants = isMobile ? {
    whileHover: animationVariants.brandLogo.whileHover,
    whileTap: animationVariants.brandLogo.whileTap,
    transition: animationVariants.brandLogo.transition
  } : {}

  const textVariants = isMobile ? animationVariants.brandText : {}

  return (
    <motion.div 
      className="flex items-center gap-3 px-6 py-4"
      {...(isMobile ? animationVariants.brandSection : {})}
    >
      <motion.div 
        className={cn(
          "bg-gradient-to-br from-black via-gray-800 to-black rounded-full flex items-center justify-center shadow-lg",
          isMobile ? "w-12 h-12" : "w-10 h-10"
        )}
        {...logoVariants}
      >
        <motion.div 
          animate={isMobile ? { 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          } : {}}
          transition={{ 
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <ComputerDesktopIcon className={cn(
            "text-white",
            isMobile ? "h-7 w-7" : "w-5 h-5"
          )} />
        </motion.div>
      </motion.div>
      
      <motion.div {...textVariants}>
        <h1 className={cn(
          "font-bold text-black font-poppins tracking-wide",
          isMobile ? "text-xl" : "text-lg"
        )}>
          Limkokwing
        </h1>
        {isMobile && (
          <motion.p 
            className="text-sm text-gray-600 font-dm-sans"
            {...animationVariants.brandSubtitle}
          >
            Smart Attendance
          </motion.p>
        )}
      </motion.div>
          </motion.div>
  )
}

/**
 * Navigation items component
 */
const NavigationItems = ({ 
  items, 
  pathname, 
  hoveredItem, 
  focusedItem, 
  onItemHover, 
  onItemFocus, 
  onItemBlur,
  isMobile = false 
}: {
  items: NavigationItem[]
  pathname: string
  hoveredItem: string | null
  focusedItem: string | null
  onItemHover: (itemName: string, isHovered: boolean) => void
  onItemFocus: (itemName: string, isFocused: boolean) => void
  onItemBlur: () => void
  isMobile?: boolean
}) => (
  <nav className="flex-1 px-4 py-6 space-y-2">
    {items.map((item, index) => {
      const itemVariants = isMobile ? {
        ...animationVariants.navItem,
        transition: {
          ...animationVariants.navItem.transition,
          delay: 0.4 + (index * 0.08)
        }
      } : {}

      const NavItemWrapper = isMobile ? motion.div : 'div'
      const wrapperProps = isMobile ? itemVariants : {}

      return (
        <NavItemWrapper key={item.name} {...wrapperProps}>
          <NavItem
            item={item}
            isActive={pathname === item.href}
            isHovered={hoveredItem === item.name}
            isFocused={focusedItem === item.name}
            onHover={onItemHover}
            onFocus={onItemFocus}
            onBlur={onItemBlur}
            onKeyDown={() => {}}
          />
        </NavItemWrapper>
      )
    })}
  </nav>
)

/**
 * Desktop sidebar component
 */
const DesktopSidebar = ({ 
  items, 
  pathname, 
  hoveredItem, 
  focusedItem, 
  onItemHover, 
  onItemFocus, 
  onItemBlur 
}: {
  items: NavigationItem[]
  pathname: string
  hoveredItem: string | null
  focusedItem: string | null
  onItemHover: (itemName: string, isHovered: boolean) => void
  onItemFocus: (itemName: string, isFocused: boolean) => void
  onItemBlur: () => void
}) => (
  <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:bg-slate-50 relative">
    <div className="absolute right-0 top-8 bottom-8 w-px bg-gray-200" />
    
    <BrandSection />
    
    <NavigationItems
      items={items}
      pathname={pathname}
      hoveredItem={hoveredItem}
      focusedItem={focusedItem}
      onItemHover={onItemHover}
      onItemFocus={onItemFocus}
      onItemBlur={onItemBlur}
    />
          </div>
)

/**
 * Mobile sidebar component
 */
const MobileSidebar = ({ 
  isOpen, 
  items, 
  pathname, 
  hoveredItem, 
  focusedItem, 
  onItemHover, 
  onItemFocus, 
  onItemBlur 
}: {
  isOpen: boolean
  items: NavigationItem[]
  pathname: string
  hoveredItem: string | null
  focusedItem: string | null
  onItemHover: (itemName: string, isHovered: boolean) => void
  onItemFocus: (itemName: string, isFocused: boolean) => void
  onItemBlur: () => void
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        className="fixed left-0 top-0 z-50 h-screen w-full bg-slate-50 lg:hidden"
        {...animationVariants.mobileSidebar}
      >
        <div className="absolute right-0 top-8 bottom-8 w-px bg-gray-200 z-10" />
        
        <BrandSection isMobile />
        
        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-6"
          {...animationVariants.separator}
        />

        <NavigationItems
          items={items}
          pathname={pathname}
          hoveredItem={hoveredItem}
          focusedItem={focusedItem}
          onItemHover={onItemHover}
          onItemFocus={onItemFocus}
          onItemBlur={onItemBlur}
          isMobile
        />
      </motion.div>
    )}
  </AnimatePresence>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Sidebar component with sophisticated animations and responsive design
 * 
 * Features:
 * - Responsive design (desktop/mobile)
 * - Sophisticated Framer Motion animations
 * - Keyboard navigation support
 * - Accessibility features
 * - Staggered animations for mobile
 * - Glassmorphism effects
 * 
 * @param isOpen - Whether the sidebar is open (mobile)
 * @param onClose - Function to close the sidebar
 */
export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const pathname = usePathname()
  const {
    hoveredItem,
    focusedItem,
    handleItemHover,
    handleItemFocus,
    handleItemBlur
  } = useNavigationState()

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const navigationItems = useMemo(() => {
    const roleKey = (userRole || 'Lecturer') as keyof typeof NAV_ITEMS_BY_ROLE
    return NAV_ITEMS_BY_ROLE[roleKey] || DEFAULT_NAVIGATION_ITEMS
  }, [userRole])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <MobileOverlay isOpen={isOpen} onClose={onClose} />
      
      <DesktopSidebar
        items={navigationItems}
        pathname={pathname}
        hoveredItem={hoveredItem}
        focusedItem={focusedItem}
        onItemHover={handleItemHover}
        onItemFocus={handleItemFocus}
        onItemBlur={handleItemBlur}
      />

      <MobileSidebar
        isOpen={isOpen}
        items={navigationItems}
        pathname={pathname}
        hoveredItem={hoveredItem}
        focusedItem={focusedItem}
        onItemHover={handleItemHover}
        onItemFocus={handleItemFocus}
        onItemBlur={handleItemBlur}
      />
    </>
  )
}