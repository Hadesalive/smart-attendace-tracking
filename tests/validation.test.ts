// Unit tests for validation system

import { AttendanceValidator, AttendanceErrorRecovery, AttendanceEdgeCaseHandler } from '@/lib/validation/attendance-validation'
import { TestAssertions } from './test-utils'

// ============================================================================
// VALIDATION UNIT TESTS
// ============================================================================

describe('AttendanceValidator', () => {

  describe('validateUUID', () => {
    it('should validate correct UUID format', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const result = AttendanceValidator.validateUUID(validUUID, 'Test ID')

      TestAssertions.assertValidationResult(result, true, 0, 0)
    })

    it('should reject invalid UUID format', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // too short
        '123e4567-e89b-12d3-a456-426614174000-extra', // too long
        'gggggggg-gggg-gggg-gggg-gggggggggggg', // invalid characters
        '' // empty
      ]

      invalidUUIDs.forEach(uuid => {
        const result = AttendanceValidator.validateUUID(uuid, 'Test ID')
        TestAssertions.assertValidationResult(result, false, 1, 0)
      })
    })

    it('should handle null/undefined values', () => {
      const result = AttendanceValidator.validateUUID('', 'Test ID')
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })
  })

  describe('validateDate', () => {
    it('should validate correct date format', () => {
      const validDates = ['2024-01-15', '2025-12-31', '2024-02-29'] // leap year
      validDates.forEach(date => {
        const result = AttendanceValidator.validateDate(date, 'Test Date')
        TestAssertions.assertValidationResult(result, true, 0, 0)
      })
    })

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '2024-13-01', // invalid month
        '2024-01-32', // invalid day
        '2024-02-30', // invalid day for February
        '01-15-2024', // wrong format
        '2024/01/15', // wrong separator
        'not-a-date',
        ''
      ]

      invalidDates.forEach(date => {
        const result = AttendanceValidator.validateDate(date, 'Test Date')
        TestAssertions.assertValidationResult(result, false, 1, 0)
      })
    })

    it('should reject dates too far in future', () => {
      const farFutureDate = '2030-01-01'
      const result = AttendanceValidator.validateDate(farFutureDate, 'Test Date')
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })
  })

  describe('validateTime', () => {
    it('should validate correct time format', () => {
      const validTimes = ['00:00', '12:30', '23:59', '09:15']
      validTimes.forEach(time => {
        const result = AttendanceValidator.validateTime(time, 'Test Time')
        TestAssertions.assertValidationResult(result, true, 0, 0)
      })
    })

    it('should reject invalid time formats', () => {
      const invalidTimes = [
        '25:00', // invalid hour
        '12:60', // invalid minute
        '9:30', // missing leading zero
        '12:3', // single digit minute
        'not-a-time',
        ''
      ]

      invalidTimes.forEach(time => {
        const result = AttendanceValidator.validateTime(time, 'Test Time')
        TestAssertions.assertValidationResult(result, false, 1, 0)
      })
    })
  })

  describe('validateSessionTiming', () => {
    it('should validate correct session timing', () => {
      const result = AttendanceValidator.validateSessionTiming('09:00', '11:00', '2024-12-01')
      TestAssertions.assertValidationResult(result, true, 0, 0)
    })

    it('should reject end time before start time', () => {
      const result = AttendanceValidator.validateSessionTiming('11:00', '09:00', '2024-12-01')
      TestAssertions.assertValidationResult(result, false, 1, 0)
      expect(result.errors[0]).toContain('End time must be after start time')
    })

    it('should reject sessions longer than 8 hours', () => {
      const result = AttendanceValidator.validateSessionTiming('09:00', '18:00', '2024-12-01')
      TestAssertions.assertValidationResult(result, false, 1, 0)
      expect(result.errors[0]).toContain('cannot exceed 8 hours')
    })

    it('should reject sessions shorter than 15 minutes', () => {
      const result = AttendanceValidator.validateSessionTiming('09:00', '09:10', '2024-12-01')
      TestAssertions.assertValidationResult(result, false, 1, 0)
      expect(result.errors[0]).toContain('at least 15 minutes')
    })
  })

  describe('validateSession', () => {
    const validSessionData = {
      course_id: '123e4567-e89b-12d3-a456-426614174000',
      section_id: '123e4567-e89b-12d3-a456-426614174001',
      session_name: 'Test Session',
      session_date: '2024-12-01',
      start_time: '09:00',
      end_time: '11:00',
      location: 'Room 101',
      capacity: 50
    }

    it('should validate correct session data', () => {
      const result = AttendanceValidator.validateSession(validSessionData)
      TestAssertions.assertValidationResult(result, true, 0, 0)
    })

    it('should reject session with invalid course_id', () => {
      const invalidData = { ...validSessionData, course_id: 'invalid-uuid' }
      const result = AttendanceValidator.validateSession(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject session with invalid section_id', () => {
      const invalidData = { ...validSessionData, section_id: 'invalid-uuid' }
      const result = AttendanceValidator.validateSession(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject session with empty name', () => {
      const invalidData = { ...validSessionData, session_name: '' }
      const result = AttendanceValidator.validateSession(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject session with too long name', () => {
      const invalidData = { ...validSessionData, session_name: 'a'.repeat(101) }
      const result = AttendanceValidator.validateSession(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject session with invalid timing', () => {
      const invalidData = { ...validSessionData, start_time: '11:00', end_time: '09:00' }
      const result = AttendanceValidator.validateSession(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should warn about very large capacity', () => {
      const warningData = { ...validSessionData, capacity: 250 }
      const result = AttendanceValidator.validateSession(warningData)
      TestAssertions.assertValidationResult(result, true, 0, 1)
      expect(result.warnings[0]).toContain('Very large capacity')
    })
  })

  describe('validateAttendance', () => {
    const validAttendanceData = {
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      student_id: '123e4567-e89b-12d3-a456-426614174001',
      method: 'qr_code' as const,
      token: 'valid-base64-token'
    }

    it('should validate correct attendance data', () => {
      const result = AttendanceValidator.validateAttendance(validAttendanceData)
      TestAssertions.assertValidationResult(result, true, 0, 0)
    })

    it('should reject attendance with invalid session_id', () => {
      const invalidData = { ...validAttendanceData, session_id: 'invalid-uuid' }
      const result = AttendanceValidator.validateAttendance(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject attendance with invalid student_id', () => {
      const invalidData = { ...validAttendanceData, student_id: 'invalid-uuid' }
      const result = AttendanceValidator.validateAttendance(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject attendance with invalid method', () => {
      const invalidData = { ...validAttendanceData, method: 'invalid_method' as any }
      const result = AttendanceValidator.validateAttendance(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject attendance with invalid token format', () => {
      const invalidData = { ...validAttendanceData, token: 'invalid-base64!@#' }
      const result = AttendanceValidator.validateAttendance(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })
  })

  describe('validateEnrollment', () => {
    const validEnrollmentData = {
      student_id: '123e4567-e89b-12d3-a456-426614174000',
      section_id: '123e4567-e89b-12d3-a456-426614174001',
      enrollment_date: '2024-12-01',
      status: 'active' as const
    }

    it('should validate correct enrollment data', () => {
      const result = AttendanceValidator.validateEnrollment(validEnrollmentData)
      TestAssertions.assertValidationResult(result, true, 0, 0)
    })

    it('should reject enrollment with invalid student_id', () => {
      const invalidData = { ...validEnrollmentData, student_id: 'invalid-uuid' }
      const result = AttendanceValidator.validateEnrollment(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject enrollment with invalid section_id', () => {
      const invalidData = { ...validEnrollmentData, section_id: 'invalid-uuid' }
      const result = AttendanceValidator.validateEnrollment(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should reject enrollment with invalid status', () => {
      const invalidData = { ...validEnrollmentData, status: 'invalid_status' as any }
      const result = AttendanceValidator.validateEnrollment(invalidData)
      TestAssertions.assertValidationResult(result, false, 1, 0)
    })

    it('should warn about future enrollment date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const futureDateString = futureDate.toISOString().split('T')[0]

      const warningData = { ...validEnrollmentData, enrollment_date: futureDateString }
      const result = AttendanceValidator.validateEnrollment(warningData)
      TestAssertions.assertValidationResult(result, true, 0, 1)
      expect(result.warnings[0]).toContain('future')
    })
  })
})

// ============================================================================
// ERROR RECOVERY UNIT TESTS
// ============================================================================

describe('AttendanceErrorRecovery', () => {

  describe('getUserFriendlyError', () => {
    it('should return user-friendly error for QR code expired', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('QR code expired')

      expect(result.title).toBe('QR Code Expired')
      expect(result.message).toContain('expired')
      expect(result.retryable).toBe(false)
      expect(result.action).toContain('Get fresh QR code')
    })

    it('should return user-friendly error for not enrolled', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('You are not enrolled in this section')

      expect(result.title).toBe('Not Enrolled')
      expect(result.message).toContain('not enrolled')
      expect(result.retryable).toBe(false)
      expect(result.action).toContain('academic advisor')
    })

    it('should return user-friendly error for session not found', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('Session not found')

      expect(result.title).toBe('Session Not Found')
      expect(result.retryable).toBe(true)
      expect(result.action).toContain('Refresh')
    })

    it('should return user-friendly error for network errors', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('Network connection failed')

      expect(result.title).toBe('Connection Error')
      expect(result.retryable).toBe(true)
      expect(result.action).toBe('Retry')
    })

    it('should return user-friendly error for duplicate attendance', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('Attendance has already been marked')

      expect(result.title).toBe('Already Marked')
      expect(result.retryable).toBe(false)
      expect(result.action).toContain('View your attendance record')
    })

    it('should return user-friendly error for attendance already marked (alternative phrasing)', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('already marked')

      expect(result.title).toBe('Already Marked')
      expect(result.retryable).toBe(false)
      expect(result.action).toContain('View your attendance record')
    })

    it('should return default error for unknown errors', () => {
      const result = AttendanceErrorRecovery.getUserFriendlyError('Unknown database error')

      expect(result.title).toBe('Error')
      expect(result.retryable).toBe(true)
      expect(result.action).toBe('Try again')
    })
  })

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        'network error',
        'connection timeout',
        'server error',
        'temporary failure',
        'session not found'
      ]

      retryableErrors.forEach(error => {
        expect(AttendanceErrorRecovery.isRetryableError(error)).toBe(true)
      })
    })

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        'QR code expired',
        'not enrolled',
        'invalid token',
        'permission denied',
        'already marked'
      ]

      nonRetryableErrors.forEach(error => {
        expect(AttendanceErrorRecovery.isRetryableError(error)).toBe(false)
      })
    })
  })

  describe('getRetryDelay', () => {
    it('should return exponential backoff for network errors', () => {
      const delay1 = AttendanceErrorRecovery.getRetryDelay('network error', 0)
      const delay2 = AttendanceErrorRecovery.getRetryDelay('network error', 1)
      const delay3 = AttendanceErrorRecovery.getRetryDelay('network error', 2)

      expect(delay1).toBeLessThan(delay2)
      expect(delay2).toBeLessThan(delay3)
      expect(delay3).toBeLessThanOrEqual(10000) // Max 10 seconds
    })

    it('should return fixed delay for other errors', () => {
      const delay = AttendanceErrorRecovery.getRetryDelay('other error', 0)
      expect(delay).toBe(1000) // 1 second
    })
  })
})

// ============================================================================
// EDGE CASE HANDLER TESTS
// ============================================================================

describe('AttendanceEdgeCaseHandler', () => {

  describe('handleAttendanceEdgeCases', () => {
    // Note: These tests would need actual database setup
    // For now, we'll test the basic structure

    it('should have handleAttendanceEdgeCases method', () => {
      expect(typeof AttendanceEdgeCaseHandler.handleAttendanceEdgeCases).toBe('function')
    })

    it('should return a promise', async () => {
      const data = {
        session_id: 'test-session-id',
        student_id: 'test-student-id',
        method: 'qr_code' as const,
        token: 'test-token'
      }

      const result = AttendanceEdgeCaseHandler.handleAttendanceEdgeCases(data)
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('handleSessionEdgeCases', () => {
    it('should have handleSessionEdgeCases method', () => {
      expect(typeof AttendanceEdgeCaseHandler.handleSessionEdgeCases).toBe('function')
    })

    it('should return a promise', async () => {
      const data = {
        course_id: 'test-course-id',
        section_id: 'test-section-id',
        session_name: 'Test Session',
        session_date: '2024-12-01',
        start_time: '09:00',
        end_time: '11:00'
      }

      const result = AttendanceEdgeCaseHandler.handleSessionEdgeCases(data)
      expect(result).toBeInstanceOf(Promise)
    })
  })
})
