// Test utilities and helpers for comprehensive testing

import { supabase } from '@/lib/supabase'

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

export const TestDataFactory = {
  // Create test user data
  createTestUser(overrides: Partial<any> = {}) {
    return {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      role: 'student',
      ...overrides
    }
  },

  // Create test section data
  createTestSection(overrides: Partial<any> = {}) {
    return {
      id: 'test-section-' + Date.now(),
      section_code: 'TEST101',
      program_id: 'test-program-1',
      academic_year_id: 'test-year-1',
      semester_id: 'test-semester-1',
      year: 1,
      ...overrides
    }
  },

  // Create test enrollment data
  createTestEnrollment(overrides: Partial<any> = {}) {
    return {
      student_id: 'test-student-1',
      section_id: 'test-section-1',
      status: 'active',
      enrollment_date: new Date().toISOString().split('T')[0],
      ...overrides
    }
  },

  // Create test course data
  createTestCourse(overrides: Partial<any> = {}) {
    return {
      id: 'test-course-' + Date.now(),
      course_code: 'TEST101',
      course_name: 'Test Course',
      description: 'A test course',
      credits: 3,
      ...overrides
    }
  },

  // Create test session data
  createTestSession(overrides: Partial<any> = {}) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
      id: 'test-session-' + Date.now(),
      course_id: 'test-course-1',
      section_id: 'test-section-1',
      lecturer_id: 'test-lecturer-1',
      session_name: 'Test Session',
      session_date: tomorrow.toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '11:00',
      location: 'Test Room 101',
      capacity: 50,
      status: 'scheduled',
      type: 'lecture',
      ...overrides
    }
  },

  // Create test attendance record data
  createTestAttendanceRecord(overrides: Partial<any> = {}) {
    return {
      session_id: 'test-session-1',
      student_id: 'test-student-1',
      status: 'present',
      marked_at: new Date().toISOString(),
      method_used: 'qr_code',
      ...overrides
    }
  }
}

// ============================================================================
// TEST DATABASE HELPERS
// ============================================================================

export class TestDatabaseHelper {
  private static testData: Map<string, any[]> = new Map()

  // Setup test data in database
  static async setupTestData() {
    console.log('🧪 Setting up test data...')

    // Create test users
    const testUsers = [
      TestDataFactory.createTestUser({ id: 'test-student-1', email: 'student@test.com', role: 'student' }),
      TestDataFactory.createTestUser({ id: 'test-lecturer-1', email: 'lecturer@test.com', role: 'lecturer' }),
      TestDataFactory.createTestUser({ id: 'test-admin-1', email: 'admin@test.com', role: 'admin' })
    ]

    // Insert test users
    for (const user of testUsers) {
      await supabase.auth.admin.createUser({
        email: user.email,
        password: 'testpassword123',
        user_metadata: { role: user.role }
      })
    }

    // Store test data for cleanup
    this.testData.set('users', testUsers)

    console.log('✅ Test data setup complete')
  }

  // Cleanup test data
  static async cleanupTestData() {
    console.log('🧹 Cleaning up test data...')

    // Delete test users
    const testUsers = this.testData.get('users') || []
    for (const user of testUsers) {
      try {
        await supabase.auth.admin.deleteUser(user.id)
      } catch (error) {
        console.warn(`Failed to delete test user ${user.id}:`, error)
      }
    }

    // Clear test data map
    this.testData.clear()

    console.log('✅ Test data cleanup complete')
  }

  // Reset database to clean state
  static async resetDatabase() {
    console.log('🔄 Resetting database...')

    // Delete all test data
    await this.cleanupTestData()

    // Reset sequences if needed
    // This would depend on your specific database setup

    console.log('✅ Database reset complete')
  }
}

// ============================================================================
// TEST ASSERTION HELPERS
// ============================================================================

export class TestAssertions {
  // Assert validation results
  static assertValidationResult(
    result: { isValid: boolean; errors: string[]; warnings: string[] },
    expectedValid: boolean,
    expectedErrorCount: number = 0,
    expectedWarningCount: number = 0
  ) {
    if (result.isValid !== expectedValid) {
      throw new Error(`Expected validation to be ${expectedValid ? 'valid' : 'invalid'}, but got ${result.isValid}`)
    }

    if (result.errors.length !== expectedErrorCount) {
      throw new Error(`Expected ${expectedErrorCount} errors, but got ${result.errors.length}: ${result.errors.join(', ')}`)
    }

    if (result.warnings.length !== expectedWarningCount) {
      throw new Error(`Expected ${expectedWarningCount} warnings, but got ${result.warnings.length}: ${result.warnings.join(', ')}`)
    }
  }

  // Assert database record exists
  static async assertRecordExists(table: string, id: string, description?: string) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new Error(`${description || `Record in ${table}`} with ID ${id} does not exist`)
    }
  }

  // Assert database record does not exist
  static async assertRecordDoesNotExist(table: string, id: string, description?: string) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .single()

    if (!error && data) {
      throw new Error(`${description || `Record in ${table}`} with ID ${id} should not exist but does`)
    }
  }

  // Assert record count
  static async assertRecordCount(table: string, expectedCount: number, filters?: Record<string, any>) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to count records in ${table}: ${error.message}`)
    }

    if (count !== expectedCount) {
      throw new Error(`Expected ${expectedCount} records in ${table}, but found ${count}`)
    }
  }
}

// ============================================================================
// TEST TIMEOUT AND RETRY HELPERS
// ============================================================================

export class TestHelpers {
  // Wait for condition with timeout
  static async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeoutMs: number = 5000,
    intervalMs: number = 100
  ): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await condition()
        if (result) {
          return true
        }
      } catch (error) {
        // Continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    return false
  }

  // Retry async operation with exponential backoff
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt)
          console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  // Generate unique test ID
  static generateTestId(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export default {
  TestDataFactory,
  TestDatabaseHelper,
  TestAssertions,
  TestHelpers
}
