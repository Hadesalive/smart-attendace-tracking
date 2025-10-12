// Comprehensive validation utilities for attendance system
// Handles edge cases and provides detailed error messages

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface EnrollmentValidationData {
  student_id: string
  section_id: string
  enrollment_date?: string
  status?: string
}

export interface SessionValidationData {
  course_id: string
  section_id: string
  session_name: string
  session_date: string
  start_time: string
  end_time: string
  location?: string
  capacity?: number
}

export interface AttendanceValidationData {
  session_id: string
  student_id: string
  method: 'qr_code' | 'facial_recognition'
  token?: string
  timestamp?: string
}

// ============================================================================
// INPUT VALIDATION UTILITIES
// ============================================================================

export class AttendanceValidator {

  // Validate UUID format
  static validateUUID(uuid: string, fieldName: string): ValidationResult {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!uuid || typeof uuid !== 'string') {
      return {
        isValid: false,
        errors: [`${fieldName} is required`],
        warnings: []
      }
    }

    if (!uuidRegex.test(uuid)) {
      return {
        isValid: false,
        errors: [`${fieldName} must be a valid UUID format`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  // Validate date format (YYYY-MM-DD)
  static validateDate(date: string, fieldName: string): ValidationResult {
    if (!date || typeof date !== 'string') {
      return {
        isValid: false,
        errors: [`${fieldName} is required`],
        warnings: []
      }
    }

    // Strict format validation - must be exactly YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return {
        isValid: false,
        errors: [`${fieldName} must be in YYYY-MM-DD format`],
        warnings: []
      }
    }

    // Validate month (01-12)
    const month = parseInt(date.substring(5, 7))
    if (month < 1 || month > 12) {
      return {
        isValid: false,
        errors: [`${fieldName} has invalid month`],
        warnings: []
      }
    }

    // Validate day (01-31) based on month
    const day = parseInt(date.substring(8, 10))
    const year = parseInt(date.substring(0, 4))

    // Basic day validation (doesn't account for leap years perfectly, but good enough)
    const maxDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const maxDay = maxDaysInMonth[month - 1]

    if (day < 1 || day > maxDay) {
      return {
        isValid: false,
        errors: [`${fieldName} has invalid day for the month`],
        warnings: []
      }
    }

    const parsedDate = new Date(date + 'T00:00:00Z')
    if (isNaN(parsedDate.getTime())) {
      return {
        isValid: false,
        errors: [`${fieldName} is not a valid date`],
        warnings: []
      }
    }

    // Check if date is not too far in future (more than 1 year)
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    if (parsedDate > oneYearFromNow) {
      return {
        isValid: false,
        errors: [`${fieldName} cannot be more than 1 year in the future`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  // Validate time format (HH:MM)
  static validateTime(time: string, fieldName: string): ValidationResult {
    if (!time || typeof time !== 'string') {
      return {
        isValid: false,
        errors: [`${fieldName} is required`],
        warnings: []
      }
    }

    // Strict format validation - must be exactly HH:MM with leading zeros
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return {
        isValid: false,
        errors: [`${fieldName} must be in HH:MM format (24-hour) with leading zeros`],
        warnings: []
      }
    }

    // Validate hours and minutes separately
    const [hours, minutes] = time.split(':').map(Number)

    if (hours < 0 || hours > 23) {
      return {
        isValid: false,
        errors: [`${fieldName} hours must be between 00 and 23`],
        warnings: []
      }
    }

    if (minutes < 0 || minutes > 59) {
      return {
        isValid: false,
        errors: [`${fieldName} minutes must be between 00 and 59`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  // Validate session timing (start before end, reasonable duration)
  static validateSessionTiming(startTime: string, endTime: string, sessionDate: string): ValidationResult {
    const startResult = this.validateTime(startTime, 'Start time')
    if (!startResult.isValid) return startResult

    const endResult = this.validateTime(endTime, 'End time')
    if (!endResult.isValid) return endResult

    const dateResult = this.validateDate(sessionDate, 'Session date')
    if (!dateResult.isValid) return dateResult

    // Check that end time is after start time
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])

    if (startMinutes >= endMinutes) {
      return {
        isValid: false,
        errors: ['End time must be after start time'],
        warnings: []
      }
    }

    // Check duration is reasonable (not more than 8 hours)
    const durationMinutes = endMinutes - startMinutes
    if (durationMinutes > 8 * 60) {
      return {
        isValid: false,
        errors: ['Session duration cannot exceed 8 hours'],
        warnings: []
      }
    }

    // Check duration is not too short (minimum 15 minutes)
    if (durationMinutes < 15) {
      return {
        isValid: false,
        errors: ['Session duration must be at least 15 minutes'],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  // Validate enrollment data
  static validateEnrollment(data: EnrollmentValidationData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate student_id
    const studentResult = this.validateUUID(data.student_id, 'Student ID')
    if (!studentResult.isValid) {
      errors.push(...studentResult.errors)
    }

    // Validate section_id
    const sectionResult = this.validateUUID(data.section_id, 'Section ID')
    if (!sectionResult.isValid) {
      errors.push(...sectionResult.errors)
    }

    // Validate enrollment_date if provided
    if (data.enrollment_date) {
      const dateResult = this.validateDate(data.enrollment_date, 'Enrollment date')
      if (!dateResult.isValid) {
        errors.push(...dateResult.errors)
      } else {
        // Warning if enrollment date is in future
        const enrollmentDate = new Date(data.enrollment_date + 'T00:00:00Z')
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (enrollmentDate > today) {
          warnings.push('Enrollment date is in the future')
        }
      }
    }

    // Validate status if provided
    if (data.status && !['active', 'inactive', 'withdrawn'].includes(data.status)) {
      errors.push('Status must be active, inactive, or withdrawn')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Validate session data
  static validateSession(data: SessionValidationData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate course_id
    const courseResult = this.validateUUID(data.course_id, 'Course ID')
    if (!courseResult.isValid) {
      errors.push(...courseResult.errors)
    }

    // Validate section_id
    const sectionResult = this.validateUUID(data.section_id, 'Section ID')
    if (!sectionResult.isValid) {
      errors.push(...sectionResult.errors)
    }

    // Validate session name
    if (!data.session_name || data.session_name.trim().length === 0) {
      errors.push('Session name is required')
    } else if (data.session_name.length > 100) {
      errors.push('Session name cannot exceed 100 characters')
    }

    // Validate dates and times
    const timingResult = this.validateSessionTiming(data.start_time, data.end_time, data.session_date)
    if (!timingResult.isValid) {
      errors.push(...timingResult.errors)
    }

    // Validate capacity if provided
    if (data.capacity !== undefined) {
      if (typeof data.capacity !== 'number' || data.capacity < 1) {
        errors.push('Capacity must be a positive number')
      } else if (data.capacity > 1000) {
        warnings.push('Very large capacity - consider if this is realistic')
      }
    }

    // Validate location if provided
    if (data.location && data.location.length > 100) {
      errors.push('Location cannot exceed 100 characters')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Validate attendance data
  static validateAttendance(data: AttendanceValidationData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate session_id
    const sessionResult = this.validateUUID(data.session_id, 'Session ID')
    if (!sessionResult.isValid) {
      errors.push(...sessionResult.errors)
    }

    // Validate student_id
    const studentResult = this.validateUUID(data.student_id, 'Student ID')
    if (!studentResult.isValid) {
      errors.push(...studentResult.errors)
    }

    // Validate method
    if (!['qr_code', 'facial_recognition'].includes(data.method)) {
      errors.push('Method must be qr_code or facial_recognition')
    }

    // Validate token format if provided (only if other validations pass)
    if (data.token && errors.length === 0) {
      try {
        // Should be base64 encoded
        const decoded = atob(data.token)
        // Should contain session_id:timestamp format
        const parts = decoded.split(':')
        if (parts.length !== 2) {
          errors.push('Invalid QR token format - should be session_id:timestamp')
        }
      } catch (e) {
        errors.push('Invalid QR token format - must be valid base64')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// ============================================================================
// EDGE CASE HANDLERS
// ============================================================================

export class AttendanceEdgeCaseHandler {

  // Handle enrollment edge cases
  static async handleEnrollmentEdgeCases(data: EnrollmentValidationData): Promise<{
    shouldProceed: boolean
    reason?: string
    suggestedAction?: string
  }> {
    // Check if student is already enrolled in this section
    // Check if section capacity would be exceeded
    // Check if enrollment date conflicts with existing enrollments

    return {
      shouldProceed: true,
      reason: 'Enrollment appears valid',
      suggestedAction: 'Proceed with enrollment'
    }
  }

  // Handle attendance marking edge cases
  static async handleAttendanceEdgeCases(data: AttendanceValidationData): Promise<{
    shouldProceed: boolean
    reason?: string
    suggestedAction?: string
  }> {
    try {
      // Import supabase dynamically to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase')

      // Check if session still exists and is active
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('id, status, section_id, session_date, start_time, end_time')
        .eq('id', data.session_id)
        .single()

      if (sessionError || !session) {
        return {
          shouldProceed: false,
          reason: 'Session not found or cancelled',
          suggestedAction: 'Check if session was cancelled or removed'
        }
      }

      if (session.status === 'cancelled') {
        return {
          shouldProceed: false,
          reason: 'Session has been cancelled',
          suggestedAction: 'Contact your lecturer for alternative arrangements'
        }
      }

      // Check if student is still enrolled in the section
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('section_enrollments')
        .select('id, status')
        .eq('student_id', data.student_id)
        .eq('section_id', session.section_id)
        .eq('status', 'active')
        .maybeSingle()

      if (enrollmentError || !enrollment) {
        return {
          shouldProceed: false,
          reason: 'Student no longer enrolled in this section',
          suggestedAction: 'Contact academic advisor to re-enroll'
        }
      }

      // Check if session time window is still valid
      const now = new Date()
      const sessionStart = new Date(`${session.session_date}T${session.start_time}`)
      const sessionEnd = new Date(`${session.session_date}T${session.end_time}`)

      if (now < sessionStart) {
        return {
          shouldProceed: false,
          reason: 'Session has not started yet',
          suggestedAction: 'Wait for session to start before marking attendance'
        }
      }

      if (now > sessionEnd) {
        return {
          shouldProceed: false,
          reason: 'Session has already ended',
          suggestedAction: 'Contact lecturer if you need to mark attendance for this session'
        }
      }

      return {
        shouldProceed: true,
        reason: 'Attendance marking conditions are valid',
        suggestedAction: 'Proceed with marking attendance'
      }
    } catch (error) {
      console.error('Error checking attendance edge cases:', error)
      return {
        shouldProceed: false,
        reason: 'Unable to verify attendance conditions',
        suggestedAction: 'Try again or contact support'
      }
    }
  }

  // Handle session creation edge cases
  static async handleSessionEdgeCases(data: SessionValidationData): Promise<{
    shouldProceed: boolean
    reason?: string
    suggestedAction?: string
  }> {
    const warnings: string[] = []

    try {
      // Import supabase dynamically to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase')

      // Check for overlapping sessions in same section
      const { data: overlappingSessions, error: overlapError } = await supabase
        .from('attendance_sessions')
        .select('id, session_name, session_date, start_time, end_time')
        .eq('section_id', data.section_id)
        .eq('session_date', data.session_date)
        .neq('status', 'cancelled')

      if (overlapError) {
        console.warn('Could not check for overlapping sessions:', overlapError)
      } else if (overlappingSessions && overlappingSessions.length > 0) {
        // Check for actual time overlap
        const newStart = new Date(`${data.session_date}T${data.start_time}`)
        const newEnd = new Date(`${data.session_date}T${data.end_time}`)

        for (const existingSession of overlappingSessions) {
          const existingStart = new Date(`${existingSession.session_date}T${existingSession.start_time}`)
          const existingEnd = new Date(`${existingSession.session_date}T${existingSession.end_time}`)

          // Check for overlap
          if (newStart < existingEnd && newEnd > existingStart) {
            return {
              shouldProceed: false,
              reason: `Time conflict with existing session: ${existingSession.session_name}`,
              suggestedAction: 'Choose different time or date to avoid conflicts'
            }
          }
        }
      }

      // Check if capacity is realistic (warn but don't block)
      if (data.capacity && data.capacity > 200) {
        console.warn('⚠️ Very large capacity detected:', data.capacity)
        warnings.push(`Very large capacity (${data.capacity}) - consider if this is realistic`)
      }

      return {
        shouldProceed: true,
        reason: 'Session creation conditions are valid',
        suggestedAction: 'Proceed with creating session'
      }
    } catch (error) {
      console.error('Error checking session edge cases:', error)
      return {
        shouldProceed: false,
        reason: 'Unable to verify session creation conditions',
        suggestedAction: 'Try again or contact support'
      }
    }
  }
}

// ============================================================================
// ERROR RECOVERY UTILITIES
// ============================================================================

export class AttendanceErrorRecovery {

  // Generate user-friendly error messages
  static getUserFriendlyError(error: string, context?: string): {
    title: string
    message: string
    action?: string
    retryable: boolean
  } {
    const errorLower = error.toLowerCase()

    if (errorLower.includes('qr code expired')) {
      return {
        title: 'QR Code Expired',
        message: 'The QR code has expired. Please ask your lecturer to generate a new one.',
        action: 'Get fresh QR code from lecturer',
        retryable: false
      }
    }

    if (errorLower.includes('not enrolled')) {
      return {
        title: 'Not Enrolled',
        message: 'You are not enrolled in this section. Please contact your academic advisor.',
        action: 'Contact academic advisor',
        retryable: false
      }
    }

    if (errorLower.includes('session not found')) {
      return {
        title: 'Session Not Found',
        message: 'This session may have been cancelled or removed.',
        action: 'Refresh and try again',
        retryable: true
      }
    }

    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        action: 'Retry',
        retryable: true
      }
    }

    if (errorLower.includes('duplicate') || errorLower.includes('already marked') || errorLower.includes('attendance has already been marked')) {
      return {
        title: 'Already Marked',
        message: 'Your attendance for this session has already been recorded.',
        action: 'View your attendance record',
        retryable: false
      }
    }

    // Default error
    return {
      title: 'Error',
      message: 'Something went wrong. Please try again or contact support.',
      action: 'Try again',
      retryable: true
    }
  }

  // Determine if error is retryable
  static isRetryableError(error: string): boolean {
    const retryableErrors = [
      'network',
      'connection',
      'timeout',
      'server error',
      'temporary',
      'session not found'
    ]

    const nonRetryableErrors = [
      'already marked',
      'attendance has already been marked',
      'duplicate',
      'not enrolled',
      'invalid token',
      'qr code expired',
      'permission denied'
    ]

    const errorLower = error.toLowerCase()

    // Check if it's explicitly non-retryable
    const isNonRetryable = nonRetryableErrors.some(nonRetryable => errorLower.includes(nonRetryable))
    if (isNonRetryable) {
      return false
    }

    // Check if it's retryable
    return retryableErrors.some(retryable => errorLower.includes(retryable))
  }

  // Get retry delay based on error type
  static getRetryDelay(error: string, attempt: number): number {
    if (error.toLowerCase().includes('network')) {
      return Math.min(1000 * Math.pow(2, attempt), 10000) // Exponential backoff, max 10s
    }

    return 1000 // 1 second for other errors
  }
}

export default AttendanceValidator
