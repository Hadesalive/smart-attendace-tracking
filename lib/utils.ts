// ============================================================================
// UTILITIES - MAIN ENTRY POINT
// ============================================================================

// Keep the original cn function for backward compatibility
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining class names with Tailwind CSS
 * Merges class names and resolves conflicts using tailwind-merge
 * 
 * @param inputs - Class values to combine
 * @returns Merged class string
 * 
 * @example
 * ```tsx
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4'
 * cn('text-red-500', { 'text-blue-500': isActive }) // 'text-blue-500' if isActive
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Re-export utilities from the organized structure
export * from './utils/format'
export * from './utils/validation'
export * from './utils/date'
export * from './utils/constants'
