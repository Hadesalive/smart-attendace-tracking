// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates an email address
 * 
 * @param email - Email to validate
 * @returns True if valid email
 * 
 * @example
 * ```tsx
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a phone number
 * 
 * @param phone - Phone number to validate
 * @param format - Expected format (default: 'SL')
 * @returns True if valid phone number
 * 
 * @example
 * ```tsx
 * isValidPhone('+23212345678') // true
 * isValidPhone('23212345678') // true
 * isValidPhone('12345678') // true (local format)
 * ```
 */
export function isValidPhone(phone: string, format: 'SL' | 'INTERNATIONAL' = 'SL'): boolean {
  const cleaned = phone.replace(/\D/g, '')
  
  if (format === 'SL') {
    // Sierra Leone phone numbers: +232XXXXXXXXX (11 digits) or XXXXXXXX (8 digits local)
    return (cleaned.length === 11 && cleaned.startsWith('232')) || 
           (cleaned.length === 8)
  }
  
  if (format === 'INTERNATIONAL') {
    return cleaned.length >= 10 && cleaned.length <= 15
  }
  
  return false
}

/**
 * Validates a password strength
 * 
 * @param password - Password to validate
 * @param options - Validation options
 * @returns Validation result with score and requirements
 * 
 * @example
 * ```tsx
 * validatePassword('password123', { minLength: 8, requireSpecial: true })
 * // { isValid: false, score: 2, requirements: { length: true, special: false } }
 * ```
 */
export function validatePassword(
  password: string, 
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecial?: boolean
  } = {}
): {
  isValid: boolean
  score: number
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    special: boolean
  }
} {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true
  } = options

  const requirements = {
    length: password.length >= minLength,
    uppercase: !requireUppercase || /[A-Z]/.test(password),
    lowercase: !requireLowercase || /[a-z]/.test(password),
    numbers: !requireNumbers || /\d/.test(password),
    special: !requireSpecial || /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const score = Object.values(requirements).filter(Boolean).length
  const isValid = Object.values(requirements).every(Boolean)

  return { isValid, score, requirements }
}

/**
 * Validates a URL
 * 
 * @param url - URL to validate
 * @param protocols - Allowed protocols (default: ['http', 'https'])
 * @returns True if valid URL
 * 
 * @example
 * ```tsx
 * isValidUrl('https://example.com') // true
 * isValidUrl('ftp://example.com') // false
 * ```
 */
export function isValidUrl(url: string, protocols: string[] = ['http', 'https']): boolean {
  try {
    const urlObj = new URL(url)
    return protocols.includes(urlObj.protocol.slice(0, -1))
  } catch {
    return false
  }
}

/**
 * Validates a date string
 * 
 * @param date - Date string to validate
 * @param format - Expected format (default: 'ISO')
 * @returns True if valid date
 * 
 * @example
 * ```tsx
 * isValidDate('2023-12-25') // true
 * isValidDate('25/12/2023', 'DD/MM/YYYY') // true
 * ```
 */
export function isValidDate(date: string, format: 'ISO' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'ISO'): boolean {
  try {
    if (format === 'ISO') {
      const dateObj = new Date(date)
      return !isNaN(dateObj.getTime()) && date.includes('-')
    }
    
    if (format === 'DD/MM/YYYY') {
      const [day, month, year] = date.split('/')
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return !isNaN(dateObj.getTime()) && 
             dateObj.getDate() === parseInt(day) &&
             dateObj.getMonth() === parseInt(month) - 1 &&
             dateObj.getFullYear() === parseInt(year)
    }
    
    if (format === 'MM/DD/YYYY') {
      const [month, day, year] = date.split('/')
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return !isNaN(dateObj.getTime()) && 
             dateObj.getDate() === parseInt(day) &&
             dateObj.getMonth() === parseInt(month) - 1 &&
             dateObj.getFullYear() === parseInt(year)
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Validates a student ID format
 * 
 * @param studentId - Student ID to validate
 * @param format - Expected format pattern
 * @returns True if valid student ID
 * 
 * @example
 * ```tsx
 * isValidStudentId('STU123456') // true (default pattern)
 * isValidStudentId('2023001', /^\d{7}$/) // true (custom pattern)
 * ```
 */
export function isValidStudentId(
  studentId: string, 
  format: RegExp = /^STU\d{6}$/
): boolean {
  return format.test(studentId)
}

/**
 * Validates a course code format
 * 
 * @param courseCode - Course code to validate
 * @param format - Expected format pattern
 * @returns True if valid course code
 * 
 * @example
 * ```tsx
 * isValidCourseCode('CS101') // true (default pattern)
 * isValidCourseCode('MATH-201', /^[A-Z]{3,4}-\d{3}$/) // true (custom pattern)
 * ```
 */
export function isValidCourseCode(
  courseCode: string, 
  format: RegExp = /^[A-Z]{2,4}\d{3}$/
): boolean {
  return format.test(courseCode)
}

/**
 * Validates required fields in an object
 * 
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Validation result with missing fields
 * 
 * @example
 * ```tsx
 * validateRequiredFields({ name: 'John', age: 25 }, ['name', 'email'])
 * // { isValid: false, missingFields: ['email'] }
 * ```
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): {
  isValid: boolean
  missingFields: (keyof T)[]
} {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || 
    data[field] === null || 
    data[field] === '' ||
    (Array.isArray(data[field]) && data[field].length === 0)
  )

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Sanitizes input to prevent XSS attacks
 * 
 * @param input - Input to sanitize
 * @returns Sanitized input
 * 
 * @example
 * ```tsx
 * sanitizeInput('<script>alert("xss")</script>') // '&lt;script&gt;alert("xss")&lt;/script&gt;'
 * ```
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
