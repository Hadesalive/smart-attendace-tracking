// Jest setup file for attendance system tests

import '@testing-library/jest-dom'

// Mock Supabase client for testing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        not: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    auth: {
      admin: {
        createUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        deleteUser: jest.fn(() => Promise.resolve({ error: null }))
      },
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    },
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useParams: () => ({}),
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}))

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Global test utilities
global.console = {
  ...console,
  // Suppress console logs during tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

// Test timeout helper
export const TEST_TIMEOUT = 10000

// Helper to wait for async operations
export const waitForAsync = (ms: number = 100) =>
  new Promise(resolve => setTimeout(resolve, ms))
