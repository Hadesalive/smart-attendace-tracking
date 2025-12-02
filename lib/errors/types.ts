/**
 * ERROR TYPES
 * 
 * Centralized error type definitions for consistent error handling across the application.
 * Provides structured error information for better debugging and user feedback.
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 */

// ============================================================================
// ERROR SEVERITY LEVELS
// ============================================================================

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

// ============================================================================
// ERROR CATEGORIES
// ============================================================================

export type ErrorCategory = 
  | 'network'
  | 'database'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'unknown'

// ============================================================================
// APPLICATION ERROR INTERFACE
// ============================================================================

export interface AppError {
  /** Unique error identifier */
  id: string
  
  /** Error severity level */
  severity: ErrorSeverity
  
  /** Error category for classification */
  category: ErrorCategory
  
  /** User-friendly error message */
  message: string
  
  /** Technical error details (for debugging) */
  details?: string
  
  /** Context where error occurred */
  context?: {
    page?: string
    component?: string
    action?: string
    userId?: string
    [key: string]: any
  }
  
  /** Original error object */
  originalError?: Error | unknown
  
  /** Timestamp when error occurred */
  timestamp: Date
  
  /** Whether error is retryable */
  retryable: boolean
  
  /** Number of retry attempts made */
  retryCount?: number
}

// ============================================================================
// ERROR HANDLER OPTIONS
// ============================================================================

export interface ErrorHandlerOptions {
  /** Context information */
  context?: string
  
  /** Additional metadata */
  metadata?: Record<string, any>
  
  /** Action being performed when error occurred */
  action?: string
  
  /** Whether error should be logged to console */
  logToConsole?: boolean
  
  /** Whether error should be sent to monitoring service */
  logToMonitoring?: boolean
  
  /** Custom user-friendly message override */
  userMessage?: string
  
  /** Whether this error is retryable */
  retryable?: boolean
}

// ============================================================================
// ERROR BOUNDARY PROPS
// ============================================================================

export interface ErrorBoundaryProps {
  children: React.ReactNode
  
  /** Fallback UI to show when error occurs */
  fallback?: React.ReactNode | ((error: AppError, reset: () => void) => React.ReactNode)
  
  /** Callback when error is caught */
  onError?: (error: AppError) => void
  
  /** Callback when error is reset */
  onReset?: () => void
}

// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================

export type ErrorRecoveryStrategy = 
  | 'retry'          // Retry the failed operation
  | 'reload'         // Reload the page
  | 'redirect'       // Redirect to another page
  | 'fallback'       // Show fallback UI
  | 'ignore'         // Silently ignore

export interface ErrorRecoveryOptions {
  strategy: ErrorRecoveryStrategy
  maxRetries?: number
  retryDelay?: number
  redirectUrl?: string
  fallbackData?: any
}

