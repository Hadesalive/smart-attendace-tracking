// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Formats a date to a readable string
 * 
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 * 
 * @example
 * ```tsx
 * formatDate(new Date('2023-12-25')) // 'Dec 25, 2023'
 * formatDate(new Date(), { includeTime: true }) // 'Dec 25, 2023 at 2:30 PM'
 * ```
 */
export function formatDate(
  date: Date | string,
  options: {
    includeTime?: boolean
    format?: 'short' | 'long' | 'medium'
    locale?: string
  } = {}
): string {
  const {
    includeTime = false,
    format = 'medium',
    locale = 'en-SL'
  } = options

  const dateObj = typeof date === 'string' ? new Date(date) : date

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(includeTime && { timeStyle: 'short' })
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj)
}

/**
 * Gets relative time string (e.g., "2 hours ago", "in 3 days")
 * 
 * @param date - Date to compare
 * @param now - Current date (default: new Date())
 * @returns Relative time string
 * 
 * @example
 * ```tsx
 * getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // '2 hours ago'
 * getRelativeTime(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) // 'in 3 days'
 * ```
 */
export function getRelativeTime(date: Date | string, now: Date = new Date()): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ]

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds)
    if (count >= 1) {
      const isFuture = diffInSeconds < 0
      const plural = count !== 1 ? 's' : ''
      return isFuture 
        ? `in ${count} ${interval.label}${plural}`
        : `${count} ${interval.label}${plural} ago`
    }
  }

  return 'just now'
}

/**
 * Checks if a date is today
 * 
 * @param date - Date to check
 * @returns True if date is today
 * 
 * @example
 * ```tsx
 * isToday(new Date()) // true
 * isToday(new Date('2023-12-25')) // false (if not today)
 * ```
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear()
}

/**
 * Checks if a date is yesterday
 * 
 * @param date - Date to check
 * @returns True if date is yesterday
 * 
 * @example
 * ```tsx
 * isYesterday(new Date(Date.now() - 24 * 60 * 60 * 1000)) // true
 * ```
 */
export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return dateObj.getDate() === yesterday.getDate() &&
         dateObj.getMonth() === yesterday.getMonth() &&
         dateObj.getFullYear() === yesterday.getFullYear()
}

/**
 * Gets the start of day for a date
 * 
 * @param date - Date to get start of day for
 * @returns Date at start of day (00:00:00)
 * 
 * @example
 * ```tsx
 * getStartOfDay(new Date('2023-12-25T15:30:00')) // 2023-12-25T00:00:00.000Z
 * ```
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const startOfDay = new Date(dateObj)
  startOfDay.setHours(0, 0, 0, 0)
  return startOfDay
}

/**
 * Gets the end of day for a date
 * 
 * @param date - Date to get end of day for
 * @returns Date at end of day (23:59:59.999)
 * 
 * @example
 * ```tsx
 * getEndOfDay(new Date('2023-12-25T15:30:00')) // 2023-12-25T23:59:59.999Z
 * ```
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const endOfDay = new Date(dateObj)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay
}

/**
 * Adds days to a date
 * 
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 * 
 * @example
 * ```tsx
 * addDays(new Date('2023-12-25'), 7) // 2024-01-01
 * addDays(new Date('2023-12-25'), -7) // 2023-12-18
 * ```
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const newDate = new Date(dateObj)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

/**
 * Gets the difference in days between two dates
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in days (positive if date1 is after date2)
 * 
 * @example
 * ```tsx
 * getDaysDifference(new Date('2023-12-25'), new Date('2023-12-20')) // 5
 * ```
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  const diffTime = d1.getTime() - d2.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Checks if two dates are the same day
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 * 
 * @example
 * ```tsx
 * isSameDay(new Date('2023-12-25T10:00:00'), new Date('2023-12-25T20:00:00')) // true
 * ```
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear()
}

/**
 * Gets the week number for a date
 * 
 * @param date - Date to get week number for
 * @returns Week number (1-53)
 * 
 * @example
 * ```tsx
 * getWeekNumber(new Date('2023-12-25')) // 52
 * ```
 */
export function getWeekNumber(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const startOfYear = new Date(dateObj.getFullYear(), 0, 1)
  const days = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

/**
 * Gets the start of week for a date
 * 
 * @param date - Date to get start of week for
 * @param startDay - Day of week to start on (0 = Sunday, 1 = Monday)
 * @returns Date at start of week
 * 
 * @example
 * ```tsx
 * getStartOfWeek(new Date('2023-12-25')) // 2023-12-24 (Sunday)
 * getStartOfWeek(new Date('2023-12-25'), 1) // 2023-12-18 (Monday)
 * ```
 */
export function getStartOfWeek(date: Date | string, startDay: number = 0): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const startOfWeek = new Date(dateObj)
  const day = startOfWeek.getDay()
  const diff = day - startDay
  startOfWeek.setDate(startOfWeek.getDate() - diff)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek
}

/**
 * Formats time in 12-hour format
 * 
 * @param date - Date to format
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted time string
 * 
 * @example
 * ```tsx
 * formatTime(new Date('2023-12-25T14:30:00')) // '2:30 PM'
 * formatTime(new Date('2023-12-25T14:30:45'), true) // '2:30:45 PM'
 * ```
 */
export function formatTime(date: Date | string, includeSeconds: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(includeSeconds && { second: '2-digit' })
  }
  
  return new Intl.DateTimeFormat('en-SL', options).format(dateObj)
}
