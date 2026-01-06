"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { 
  ComputerDesktopIcon,
  UsersIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StudentSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STUDENT_NAV_ITEMS: NavigationItem[] = [
  { name: "Dashboard", icon: ComputerDesktopIcon, href: "/student" },
  { name: "Courses", icon: BookOpenIcon, href: "/student/courses" },
  { name: "Sessions", icon: ClipboardDocumentListIcon, href: "/student/sessions" },
  { name: "Attendance", icon: CalendarDaysIcon, href: "/student/attendance" },
  { name: "Homework", icon: AcademicCapIcon, href: "/student/homework" },
  { name: "Grades", icon: StarIcon, href: "/student/grades" },
  { name: "Materials", icon: DocumentTextIcon, href: "/student/materials" },
  { name: "Reporting", icon: DocumentTextIcon, href: "/student/reporting" },
  { name: "Community", icon: ChatBubbleLeftRightIcon, href: "/student/community" },
  { name: "Profile", icon: UsersIcon, href: "/student/profile" },
]

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
  }
} as const

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const NavItem = ({ 
  item, 
  isActive 
}: { 
  item: NavigationItem
  isActive: boolean 
}) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.a
      href={item.href}
      className={cn(
        "group relative flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer select-none overflow-hidden",
        isActive 
          ? "text-black bg-gray-100" 
          : "text-gray-600 hover:text-black hover:bg-gray-50"
      )}
      whileHover={{ 
        x: 8,
        scale: 1.02,
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
      <motion.div
        className="p-2 rounded-lg transition-all duration-300"
        whileHover={{ scale: 1.05, rotate: 2 }}
      >
        <item.icon className={cn(
          "h-5 w-5 transition-all duration-300",
          isActive ? "text-black" : "text-gray-500 group-hover:text-black"
        )} />
      </motion.div>
      
      <motion.span 
        className="font-dm-sans font-medium text-sm transition-all duration-300"
        animate={{ 
          color: isActive ? "#000000" : "#6B7280"
        }}
        transition={ANIMATION_CONFIG.spring}
      >
        {item.name}
      </motion.span>
    </motion.a>
  )
}

const BrandSection = ({ isMobile = false }: { isMobile?: boolean }) => (
  <motion.div 
    className="flex items-center gap-3 px-6 py-4"
  >
    <motion.div 
      className={cn(
        "bg-gradient-to-br from-black via-gray-800 to-black rounded-full flex items-center justify-center shadow-lg",
        isMobile ? "w-12 h-12" : "w-10 h-10"
      )}
    >
      <ComputerDesktopIcon className={cn(
        "text-white",
        isMobile ? "h-7 w-7" : "w-5 h-5"
      )} />
    </motion.div>
    
    <div>
      <h1 className={cn(
        "font-bold text-black font-poppins tracking-wide",
        isMobile ? "text-xl" : "text-lg"
      )}>
        Limkokwing
      </h1>
      {isMobile && (
        <p className="text-sm text-gray-600 font-dm-sans">
          Student Portal
        </p>
      )}
    </div>
  </motion.div>
)

const MobileOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        className="fixed inset-0 z-40 lg:hidden"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.div
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        />
      </motion.div>
    )}
  </AnimatePresence>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StudentSidebar({ isOpen, onClose }: StudentSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <MobileOverlay isOpen={isOpen} onClose={onClose} />
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:bg-slate-50 relative">
        <div className="absolute right-0 top-8 bottom-8 w-px bg-gray-200" />
        
        <BrandSection />
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {STUDENT_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed left-0 top-0 z-50 h-screen w-full bg-slate-50 lg:hidden"
            initial={{ x: -400, scale: 0.8, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            exit={{ x: -400, scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 25,
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <div className="absolute right-0 top-8 bottom-8 w-px bg-gray-200 z-10" />
            
            <BrandSection isMobile />
            
            <motion.div 
              className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-6"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4, ease: "easeInOut" }}
            />

            <nav className="flex-1 px-4 py-6 space-y-2">
              {STUDENT_NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.4 + (index * 0.08), duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <NavItem
                    item={item}
                    isActive={pathname === item.href}
                  />
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


