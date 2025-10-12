# 🧪 Attendance System Test Suite

Comprehensive test coverage for the Limkokwing University attendance tracking system.

## 📋 Test Categories

### 1. **Unit Tests** (`tests/validation.test.ts`)
Tests for core validation logic and utilities:
- ✅ UUID format validation
- ✅ Date/time format validation
- ✅ Session timing validation
- ✅ Enrollment data validation
- ✅ Attendance data validation
- ✅ Error recovery utilities
- ✅ Edge case handlers

### 2. **Integration Tests** (`tests/attendance-workflow.test.ts`)
End-to-end workflow testing:
- ✅ Student enrollment → Session creation → QR scanning → Attendance marking
- ✅ Duplicate attendance prevention
- ✅ Session time window validation
- ✅ Error recovery scenarios
- ✅ Data consistency checks

### 3. **Database Tests** (`tests/database-triggers.test.ts`)
Database functionality testing:
- ✅ Auto-absent trigger functionality
- ✅ Session completion handling
- ✅ Enrollment status updates
- ✅ Data integrity maintenance

### 4. **Edge Case Tests** (`tests/edge-cases.test.ts`)
Comprehensive edge case coverage:
- ✅ Unenrolled student scenarios
- ✅ Cancelled session handling
- ✅ Expired QR token validation
- ✅ Malformed QR code handling
- ✅ Network failure recovery
- ✅ Concurrent operation handling

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install test dependencies
npm install --save-dev jest @types/jest ts-jest jest-environment-jsdom @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

### Test Commands

```bash
# Run all tests with detailed output
npm run test:all

# Run specific test categories
npm test tests/validation.test.ts
npm test tests/attendance-workflow.test.ts
npm test tests/database-triggers.test.ts
npm test tests/edge-cases.test.ts

# Run tests in watch mode (during development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI environment
npm run test:ci
```

## 📊 Coverage Goals

Aim for **90%+ code coverage** across all categories:

| Component | Target Coverage |
|-----------|----------------|
| Validation Logic | 95%+ |
| Error Recovery | 90%+ |
| Database Operations | 85%+ |
| UI Components | 80%+ |
| Overall System | 90%+ |

## 🔧 Test Infrastructure

### Test Utilities (`tests/test-utils.ts`)
- **TestDataFactory**: Creates consistent test data
- **TestDatabaseHelper**: Database setup/cleanup utilities
- **TestAssertions**: Custom assertion helpers
- **TestHelpers**: Async operation helpers and retries

### Test Configuration (`jest.config.js`)
- **Environment**: jsdom for React component testing
- **Coverage**: Detailed coverage reporting
- **TypeScript**: Full TypeScript support
- **Mocks**: Comprehensive mocking for external dependencies

## 🎯 Testing Strategy

### **Test Pyramid**
```
┌─────────────────┐
│   E2E Tests     │  ← User journey testing
│  (10% of tests) │
├─────────────────┤
│ Integration     │  ← Component interaction
│   Tests         │  ← (30% of tests)
│  (30% of tests) │
├─────────────────┤
│   Unit Tests    │  ← Individual functions
│  (60% of tests) │
└─────────────────┘
```

### **Test Organization**
- **Unit Tests**: Test individual functions and utilities
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Edge Case Tests**: Test error conditions and boundaries

## 📋 Test Data Management

### **Test Data Factory**
Creates realistic test data with proper relationships:
```typescript
const student = TestDataFactory.createTestUser({
  role: 'student',
  email: 'test@student.com'
})

const section = TestDataFactory.createTestSection({
  section_code: 'TEST101'
})

const session = TestDataFactory.createTestSession({
  section_id: section.id,
  start_time: '09:00',
  end_time: '11:00'
})
```

### **Database Cleanup**
Automatic cleanup ensures tests don't interfere with each other:
```typescript
beforeAll(async () => {
  await TestDatabaseHelper.setupTestData()
})

afterAll(async () => {
  await TestDatabaseHelper.cleanupTestData()
})
```

## 🐛 Debugging Tests

### **Common Issues**
1. **Async operations**: Use `waitForAsync()` helper for timing issues
2. **Database state**: Ensure proper cleanup between tests
3. **Mock dependencies**: Check that external services are properly mocked

### **Debug Commands**
```bash
# Run single test with verbose output
npm test tests/validation.test.ts -- --verbose

# Debug specific test
npm test tests/validation.test.ts -- --testNamePattern="should validate correct UUID format"

# Check test environment
npm test -- --listTests
```

## 📈 Continuous Integration

### **CI Pipeline**
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

### **Quality Gates**
- ✅ All tests must pass
- ✅ Minimum 80% code coverage
- ✅ No critical security vulnerabilities
- ✅ Performance benchmarks met

## 🔍 Test Examples

### **Validation Test**
```typescript
it('should validate correct session data', () => {
  const sessionData = {
    course_id: 'valid-uuid',
    section_id: 'valid-uuid',
    session_name: 'Test Session',
    session_date: '2024-12-01',
    start_time: '09:00',
    end_time: '11:00'
  }

  const result = AttendanceValidator.validateSession(sessionData)
  TestAssertions.assertValidationResult(result, true, 0, 0)
})
```

### **Integration Test**
```typescript
it('should complete full attendance workflow', async () => {
  // 1. Create test student and enroll them
  const student = TestDataFactory.createTestUser({ role: 'student' })
  const enrollment = TestDataFactory.createTestEnrollment({
    student_id: student.id,
    section_id: 'test-section'
  })

  // 2. Create test session
  const session = TestDataFactory.createTestSession({
    section_id: 'test-section'
  })

  // 3. Simulate QR scanning and attendance marking
  const qrToken = generateValidToken(session.id)
  const attendance = await markAttendance(student.id, session.id, qrToken)

  // 4. Verify workflow completed successfully
  expect(attendance.status).toBe('present')
})
```

## 🎯 Success Criteria

- ✅ **100% test coverage** for validation logic
- ✅ **95%+ coverage** for core attendance features
- ✅ **All edge cases handled** with appropriate error messages
- ✅ **Database integrity maintained** under all conditions
- ✅ **Performance benchmarks met** (tests run in < 30 seconds)
- ✅ **CI/CD pipeline passing** consistently

## 🚨 Known Limitations

- **Database tests** require actual Supabase connection
- **Real-time features** difficult to test in isolation
- **Mobile-specific behaviors** require device testing
- **Performance tests** need production-like environment

## 📞 Support

For test-related issues:
1. Check the test logs for detailed error information
2. Verify test data setup/cleanup is working correctly
3. Ensure all dependencies are properly installed
4. Check that mocks are correctly configured

---

**🧪 Happy Testing!** Ensure your attendance system is bulletproof before deployment.
