/**
 * SHARED ADMIN CONSTANTS
 * 
 * This file contains all shared constants used across the admin interface.
 * It serves as the single source of truth for styling, animations, and configuration.
 * 
 * ARCHITECTURE:
 * - Centralized constant management for consistency
 * - TypeScript type safety for all constants
 * - Monochrome design policy enforcement
 * - Reusable across all admin components and pages
 * 
 * CONSTANTS INCLUDED:
 * ✅ CARD_SX - Card styling with hover effects and transitions
 * ✅ ANIMATION_CONFIG - Spring animation configuration for smooth transitions
 * ✅ BUTTON_STYLES - Complete button styling system (primary, outlined, contained)
 * ✅ STATUS_COLORS - Status color mapping for consistent theming
 * 
 * USAGE PATTERNS:
 * - Import only what you need to minimize bundle size
 * - Use TypeScript for type safety and IntelliSense
 * - Follow monochrome design policy for professional appearance
 * - Maintain consistency across all admin pages
 * 
 * MAINTENANCE:
 * - Update constants here to apply changes globally
 * - Test changes across all admin pages
 * - Document any new constants added
 * - Ensure backward compatibility when updating
 * 
 * @author Alpha Amadu Bah
 * @version 1.0.0
 * @lastUpdated 2024-01-23
 */

// ============================================================================
// SHARED ADMIN CONSTANTS
// ============================================================================

export const CARD_SX = {
  border: "1px solid #000",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  "&:hover": { 
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    transform: "translateY(-1px)"
  },
  transition: "all 0.2s ease-in-out"
}

export const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export const BUTTON_STYLES = {
  primary: {
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "DM Sans",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    py: 1.5,
    "&:hover": { 
      backgroundColor: "#1f2937",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  },
  outlined: {
    borderColor: "#000",
    color: "#000",
    fontFamily: "DM Sans",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    py: 1.5,
    "&:hover": { 
      borderColor: "#1f2937",
      backgroundColor: "#f9fafb",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  },
  contained: {
    backgroundColor: "#000000",
    color: "#ffffff",
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 500,
    textTransform: "none" as const,
    "&:hover": { backgroundColor: "#1f2937" }
  }
}

export const STATUS_COLORS = {
  active: "#000000", 
  completed: "#333333",
  cancelled: "#999999",
  scheduled: "#666666"
} as const
