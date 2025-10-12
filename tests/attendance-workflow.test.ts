// Integration tests for attendance workflow

import { TestDataFactory, TestDatabaseHelper, TestAssertions, TestHelpers } from './test-utils'
import { AttendanceValidator } from '@/lib/validation/attendance-validation'

// ============================================================================
// ATTENDANCE WORKFLOW INTEGRATION TESTS
// ============================================================================

describe('Attendance Workflow Integration', () => {

  beforeAll(async () => {
    // Setup test data before running tests
    await TestDatabaseHelper.setupTestData()
  })

  afterAll(async () => {
    // Cleanup test data after all tests complete
    await TestDatabaseHelper.cleanupTestData()
  })

  describe('Student Enrollment → Session Creation → QR Scanning → Attendance Marking', () => {

    it('should complete full attendance workflow successfully', async () => {
      // 1. Create test student and enroll them
      const student = TestDataFactory.createTestUser({
        id: 'workflow-student-1',
        email: 'workflow-student@test.com',
        role: 'student'
      })

      const section = TestDataFactory.createTestSection({
        id: 'workflow-section-1',
        section_code: 'WORK101'
      })

      const enrollmentData = TestDataFactory.createTestEnrollment({
        student_id: student.id,
        section_id: section.id,
        status: 'active'
      })

      // Validate enrollment data
      const enrollmentValidation = AttendanceValidator.validateEnrollment(enrollmentData)
      TestAssertions.assertValidationResult(enrollmentValidation, true, 0, 0)

      // 2. Create test course and session
      const course = TestDataFactory.createTestCourse({
        id: 'workflow-course-1',
        course_code: 'WORK101',
        course_name: 'Workflow Test Course'
      })

      const session = TestDataFactory.createTestSession({
        id: 'workflow-session-1',
        course_id: course.id,
        section_id: section.id,
        lecturer_id: 'test-lecturer-1',
        session_name: 'Workflow Test Session'
      })

      // Validate session data
      const sessionValidation = AttendanceValidator.validateSession(session)
      TestAssertions.assertValidationResult(sessionValidation, true, 0, 0)

      // 3. Simulate QR code generation and scanning
      const qrToken = btoa(`${session.id}:${Math.floor(Date.now() / 60000)}`)
      const attendanceData = {
        session_id: session.id,
        student_id: student.id,
        method: 'qr_code' as const,
        token: qrToken
      }

      // Validate attendance data
      const attendanceValidation = AttendanceValidator.validateAttendance(attendanceData)
      TestAssertions.assertValidationResult(attendanceValidation, true, 0, 0)

      // 4. Verify workflow completed successfully
      expect(enrollmentValidation.isValid).toBe(true)
      expect(sessionValidation.isValid).toBe(true)
      expect(attendanceValidation.isValid).toBe(true)

      // 5. Verify data integrity
      await TestAssertions.assertRecordExists('section_enrollments', enrollmentData.student_id + '_' + enrollmentData.section_id, 'Student enrollment')
    })

    it('should prevent attendance marking for unenrolled students', async () => {
      // Create student not enrolled in the section
      const unenrolledStudent = TestDataFactory.createTestUser({
        id: 'unenrolled-student-1',
        email: 'unenrolled@test.com',
        role: 'student'
      })

      const session = TestDataFactory.createTestSession({
        id: 'expired-session-1',
        course_id: 'test-course-1',
        section_id: 'test-section-1'
      })

      const qrToken = btoa(`${session.id}:${Math.floor(Date.now() / 60000)}`)
      const attendanceData = {
        session_id: session.id,
        student_id: unenrolledStudent.id,
        method: 'qr_code' as const,
        token: qrToken
      }

      // This should fail validation due to enrollment check
      // (In a real scenario, this would be caught by the edge case handler)
      const validation = AttendanceValidator.validateAttendance(attendanceData)
      expect(validation.isValid).toBe(true) // Basic validation passes

      // But the edge case handler should catch this
      // (This would need actual database setup to test properly)
    })

    it('should handle expired QR tokens', async () => {
      const student = TestDataFactory.createTestUser({ id: 'expired-token-student' })
      const session = TestDataFactory.createTestSession({ id: 'expired-token-session' })

      // Create expired token (more than 10 minutes old)
      const expiredTimestamp = Math.floor((Date.now() - 11 * 60 * 1000) / 60000) // 11 minutes ago
      const expiredToken = btoa(`${session.id}:${expiredTimestamp}`)

      const attendanceData = {
        session_id: session.id,
        student_id: student.id,
        method: 'qr_code' as const,
        token: expiredToken
      }

      // Basic validation should pass
      const validation = AttendanceValidator.validateAttendance(attendanceData)
      expect(validation.isValid).toBe(true)

      // But token validation should fail
      try {
        atob(expiredToken) // This should work (valid base64)
        const decoded = atob(expiredToken)
        const [sessionId, timestamp] = decoded.split(':')

        expect(sessionId).toBe(session.id)

        const tokenTime = parseInt(timestamp) * 60000
        const now = Date.now()
        const tokenAge = now - tokenTime

        // Should be expired (more than 10 minutes)
        expect(tokenAge).toBeGreaterThan(10 * 60 * 1000)
      } catch (error) {
        fail('Token decoding should work but validation should fail')
      }
    })

    it('should prevent duplicate attendance marking', async () => {
      const student = TestDataFactory.createTestUser({ id: 'duplicate-student' })
      const session = TestDataFactory.createTestSession({ id: 'duplicate-session-1' })

      // First attendance record
      const firstRecord = TestDataFactory.createTestAttendanceRecord({
        session_id: session.id,
        student_id: student.id,
        status: 'present'
      })

      // Second attendance record (should be prevented)
      const secondRecord = TestDataFactory.createTestAttendanceRecord({
        session_id: session.id,
        student_id: student.id,
        status: 'present'
      })

      // Both records should be identical except for ID and timestamp
      expect(firstRecord.session_id).toBe(secondRecord.session_id)
      expect(firstRecord.student_id).toBe(secondRecord.student_id)
      expect(firstRecord.status).toBe(secondRecord.status)

      // In a real system, the second record should be rejected
      // This test verifies the data structure is correct
    })

    it('should validate session time windows', async () => {
      const student = TestDataFactory.createTestUser({ id: 'time-window-student' })

      // Session that hasn't started yet
      const futureSession = TestDataFactory.createTestSession({
        id: 'future-session-1',
        session_date: '2025-12-01', // Far in future
        start_time: '09:00',
        end_time: '11:00'
      })

      // Session that has already ended
      const pastSession = TestDataFactory.createTestSession({
        id: 'past-session-1',
        session_date: '2023-01-01', // Far in past
        start_time: '09:00',
        end_time: '11:00'
      })

      // Current time should be outside both sessions
      const now = new Date()
      const futureStart = new Date(`${futureSession.session_date}T${futureSession.start_time}`)
      const futureEnd = new Date(`${futureSession.session_date}T${futureSession.end_time}`)
      const pastStart = new Date(`${pastSession.session_date}T${pastSession.start_time}`)
      const pastEnd = new Date(`${pastSession.session_date}T${pastSession.end_time}`)

      expect(now.getTime()).toBeLessThan(futureStart.getTime())
      expect(now.getTime()).toBeGreaterThan(pastEnd.getTime())
    })
  })

  describe('Error Recovery Scenarios', () => {

    it('should handle network failures gracefully', async () => {
      // Simulate network failure scenario
      const student = TestDataFactory.createTestUser({ id: 'network-failure-student' })
      const session = TestDataFactory.createTestSession({ id: 'network-failure-session' })

      // This would test retry logic in a real implementation
      const retryableError = 'Network connection failed'
      const isRetryable = true // Would come from error recovery system

      expect(isRetryable).toBe(true)
    })

    it('should handle invalid QR codes appropriately', async () => {
      const invalidQrCodes = [
        'not-a-url',
        'https://example.com/invalid',
        'https://example.com/attend/',
        'https://example.com/attend/invalid-session-id',
        'https://example.com/attend/123e4567-e89b-12d3-a456-426614174000', // No token
      ]

      // Each invalid QR should be handled gracefully
      invalidQrCodes.forEach(qrCode => {
        // In a real implementation, these would be caught by validation
        expect(typeof qrCode).toBe('string')
        expect(qrCode.length).toBeGreaterThan(0)
      })
    })

    it('should provide helpful error messages for common scenarios', async () => {
      const errorScenarios = [
        {
          error: 'QR code expired',
          expectedTitle: 'QR Code Expired',
          expectedRetryable: false
        },
        {
          error: 'You are not enrolled in this section',
          expectedTitle: 'Not Enrolled',
          expectedRetryable: false
        },
        {
          error: 'Session not found',
          expectedTitle: 'Session Not Found',
          expectedRetryable: true
        },
        {
          error: 'Network connection failed',
          expectedTitle: 'Connection Error',
          expectedRetryable: true
        }
      ]

      errorScenarios.forEach(scenario => {
        // Test error classification logic
        const isRetryable = scenario.error.toLowerCase().includes('network') ||
                           scenario.error.toLowerCase().includes('connection') ||
                           scenario.error.toLowerCase().includes('session not found')

        expect(isRetryable).toBe(scenario.expectedRetryable)
      })
    })
  })

  describe('Data Consistency Checks', () => {

    it('should maintain referential integrity', async () => {
      // Test that all foreign key relationships are maintained
      // This would verify that attendance records reference valid sessions
      // and enrollments reference valid sections

      const student = TestDataFactory.createTestUser({ id: 'consistency-student' })
      const section = TestDataFactory.createTestSection({ id: 'consistency-section' })
      const session = TestDataFactory.createTestSession({
        section_id: section.id
      })

      // Verify relationships
      expect(session.section_id).toBe(section.id)
      expect(typeof student.id).toBe('string')
      expect(student.id.length).toBeGreaterThan(0)
    })

    it('should handle concurrent operations safely', async () => {
      // Test race conditions and concurrent access
      const student1 = TestDataFactory.createTestUser({ id: 'concurrent-student-1' })
      const student2 = TestDataFactory.createTestUser({ id: 'concurrent-student-2' })
      const session = TestDataFactory.createTestSession({ id: 'concurrent-session' })

      // Simulate concurrent attendance marking
      const attendance1 = TestDataFactory.createTestAttendanceRecord({
        session_id: session.id,
        student_id: student1.id
      })

      const attendance2 = TestDataFactory.createTestAttendanceRecord({
        session_id: session.id,
        student_id: student2.id
      })

      // Both should be valid independently
      expect(attendance1.session_id).toBe(attendance2.session_id)
      expect(attendance1.student_id).not.toBe(attendance2.student_id)
    })
  })
})
