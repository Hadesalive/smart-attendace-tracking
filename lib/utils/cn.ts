// ============================================================================
// CLASSNAME UTILITIES
// ============================================================================

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

/**
 * Creates a conditional class name function
 * Useful for creating reusable class name builders
 * 
 * @param baseClasses - Base classes to always apply
 * @returns Function that accepts conditional classes
 * 
 * @example
 * ```tsx
 * const buttonClasses = createClassNameBuilder('px-4 py-2 rounded')
 * buttonClasses({ 'bg-blue-500': isPrimary, 'bg-gray-500': !isPrimary })
 * ```
 */
export function createClassNameBuilder(baseClasses: string) {
  return (conditionalClasses: Record<string, boolean> = {}) => {
    return cn(baseClasses, conditionalClasses)
  }
}

/**
 * Creates a variant-based class name function
 * Useful for component variants
 * 
 * @param variants - Object mapping variant names to classes
 * @returns Function that accepts variant props
 * 
 * @example
 * ```tsx
 * const buttonVariants = createVariantBuilder({
 *   size: { sm: 'px-2 py-1', md: 'px-4 py-2', lg: 'px-6 py-3' },
 *   variant: { primary: 'bg-blue-500', secondary: 'bg-gray-500' }
 * })
 * buttonVariants({ size: 'md', variant: 'primary' })
 * ```
 */
export function createVariantBuilder<T extends Record<string, Record<string, string>>>(
  variants: T
) {
  return (props: { [K in keyof T]?: keyof T[K] } = {}) => {
    const classes = Object.entries(props).map(([key, value]) => {
      if (value && variants[key]) {
        return variants[key][value as string]
      }
      return ''
    }).filter(Boolean)
    
    return cn(...classes)
  }
}
