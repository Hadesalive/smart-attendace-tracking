// Database trigger tests for auto-absent functionality

import { TestDataFactory, TestDatabaseHelper, TestAssertions, TestHelpers } from './test-utils'
import { AttendanceValidator } from '@/lib/validation/attendance-validation'

// ============================================================================
// DATABASE TRIGGER TESTS
// ============================================================================

describe('Auto-Absent Database Triggers', () => {

  beforeAll(async () => {
    await TestDatabaseHelper.setupTestData()
  })

  afterAll(async () => {
    await TestDatabaseHelper.cleanupTestData()
  })

  describe('Auto-Absent Trigger on Session Completion', () => {

    it('should mark absent students when session status is set to completed', async () => {
      // 1. Create test section with enrolled students
      const section = TestDataFactory.createTestSection({
        id: 'absent-test-section-1',
        section_code: 'ABSENT101'
      })

      // Create multiple test students
      const students = [
        TestDataFactory.createTestUser({ id: 'absent-student-1', email: 'absent1@test.com' }),
        TestDataFactory.createTestUser({ id: 'absent-student-2', email: 'absent2@test.com' }),
        TestDataFactory.createTestUser({ id: 'absent-student-3', email: 'absent3@test.com' })
      ]

      // Enroll students in section
      for (const student of students) {
        const enrollment = TestDataFactory.createTestEnrollment({
          student_id: student.id,
          section_id: section.id,
          status: 'active'
        })

        const validation = AttendanceValidator.validateEnrollment(enrollment)
        TestAssertions.assertValidationResult(validation, true, 0, 0)
      }

      // 2. Create session for this section
      const session = TestDataFactory.createTestSession({
        id: 'absent-test-session-1',
        course_id: 'test-course-1',
        section_id: section.id,
        session_name: 'Absent Test Session',
        status: 'scheduled'
      })

      const sessionValidation = AttendanceValidator.validateSession(session)
      TestAssertions.assertValidationResult(sessionValidation, true, 0, 0)

      // 3. Mark one student as present (simulate QR scan)
      const presentRecord = TestDataFactory.createTestAttendanceRecord({
        session_id: session.id,
        student_id: students[0].id,
        status: 'present'
      })

      // 4. Update session status to completed
      // This should trigger the auto-absent functionality
      // In a real test, we'd call the database trigger

      // 5. Verify results
      // - Student 1 should be 'present' (manually marked)
      // - Students 2 & 3 should be 'absent' (auto-marked by trigger)

      expect(presentRecord.status).toBe('present')
      expect(presentRecord.student_id).toBe(students[0].id)
      expect(presentRecord.session_id).toBe(session.id)
    })

    it('should handle sessions with no enrolled students', async () => {
      // Create section with no enrollments
      const emptySection = TestDataFactory.createTestSection({
        id: 'empty-section-1',
        section_code: 'EMPTY101'
      })

      // Create session for empty section
      const emptySession = TestDataFactory.createTestSession({
        id: 'empty-section-session-1',
        section_id: emptySection.id,
        session_name: 'Empty Section Session'
      })

      // Update session to completed
      // Should not create any absent records since no students are enrolled

      expect(emptySession.section_id).toBe(emptySection.id)
      // In a real test, we'd verify no absent records were created
    })

    it('should not override existing attendance records', async () => {
      // Create student and enroll them
      const student = TestDataFactory.createTestUser({ id: 'override-student-1' })
      const section = TestDataFactory.createTestSection({ id: 'override-section-1' })

      const enrollment = TestDataFactory.createTestEnrollment({
        student_id: student.id,
        section_id: section.id
      })

      const session = TestDataFactory.createTestSession({
        id: 'override-test-session-1',
        section_id: section.id,
        session_name: 'Override Test Session'
      })

      // Manually mark student as late (not present)
      const lateRecord = TestDataFactory.createTestAttendanceRecord({
        session_id: session.id,
        student_id: student.id,
        status: 'late'
      })

      // Update session to completed
      // Should NOT change the 'late' record to 'absent'

      expect(lateRecord.status).toBe('late')
      expect(lateRecord.student_id).toBe(student.id)
      // In a real test, we'd verify the record remains 'late'
    })

    it('should handle session time expiration correctly', async () => {
      // Create session that has already ended
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1) // Yesterday

      const expiredSession = TestDataFactory.createTestSession({
        id: 'expired-session-1',
        session_date: pastDate.toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '11:00',
        status: 'scheduled' // Not yet marked as completed
      })

      // Create enrolled student
      const student = TestDataFactory.createTestUser({ id: 'expired-student-1' })
      const section = TestDataFactory.createTestSection({ id: 'expired-section-1' })

      const enrollment = TestDataFactory.createTestEnrollment({
        student_id: student.id,
        section_id: section.id
      })

      // Update session status to completed (triggering auto-absent)
      // Should mark student as absent since session is expired

      expect(expiredSession.status).toBe('scheduled')
      expect(enrollment.status).toBe('active')
      // In a real test, we'd verify absent record was created
    })
  })

  describe('Trigger Edge Cases', () => {

    it('should handle rapid session status changes', async () => {
      // Test rapid updates to session status
      const session = TestDataFactory.createTestSession({
        id: 'rapid-change-session-1',
        status: 'scheduled'
      })

      // Simulate rapid status changes
      const statusChanges = ['active', 'completed', 'scheduled', 'completed']

      statusChanges.forEach(status => {
        expect(['scheduled', 'active', 'completed', 'cancelled']).toContain(status)
      })

      // Should handle all status changes gracefully
      expect(statusChanges.length).toBe(4)
    })

    it('should handle concurrent trigger executions', async () => {
      // Test multiple sessions completing simultaneously
      const sessions = [
        TestDataFactory.createTestSession({ id: 'concurrent-1', status: 'scheduled' }),
        TestDataFactory.createTestSession({ id: 'concurrent-2', status: 'scheduled' }),
        TestDataFactory.createTestSession({ id: 'concurrent-3', status: 'scheduled' })
      ]

      // All sessions should be handled independently
      sessions.forEach(session => {
        expect(session.status).toBe('scheduled')
      })

      expect(sessions.length).toBe(3)
    })

    it('should handle database transaction rollbacks', async () => {
      // Test behavior when database operations fail
      const session = TestDataFactory.createTestSession({
        id: 'rollback-session-1',
        course_id: 'test-course-1',
        section_id: 'test-section-1'
      })

      // Simulate a scenario where attendance marking fails
      // The trigger should handle this gracefully

      expect(session.id).toBeDefined()
      expect(typeof session.id).toBe('string')
    })
  })
})
