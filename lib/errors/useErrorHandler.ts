/**
 * ERROR HANDLER HOOK
 * 
 * Custom React hook for consistent error handling across the application.
 * Provides utilities for error transformation, logging, and user feedback.
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 */

"use client"

import { useCallback } from 'react'
import { AppError, ErrorHandlerOptions, ErrorCategory, ErrorSeverity } from './types'

// ============================================================================
// ERROR HANDLER HOOK
// ============================================================================

export function useErrorHandler() {
  /**
   * Transforms any error into a structured AppError
   */
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): AppError => {
    const {
      context,
      metadata = {},
      action,
      logToConsole = true,
      logToMonitoring = process.env.NODE_ENV === 'production',
      userMessage,
      retryable = true
    } = options

    // Determine error category and severity
    const { category, severity } = categorizeError(error)
    
    // Extract error message
    const errorMessage = extractErrorMessage(error)
    
    // Create structured error
    const appError: AppError = {
      id: generateErrorId(),
      severity,
      category,
      message: userMessage || getUserFriendlyMessage(category, errorMessage),
      details: errorMessage,
      context: {
        ...metadata,
        ...(context && { component: context }),
        ...(action && { action })
      },
      originalError: error,
      timestamp: new Date(),
      retryable,
      retryCount: 0
    }

    // Log to console in development
    if (logToConsole && process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${severity.toUpperCase()}: ${appError.message}`)
      console.error('Details:', appError.details)
      console.error('Context:', appError.context)
      console.error('Original Error:', error)
      console.groupEnd()
    }

    // Log to monitoring service in production
    if (logToMonitoring) {
      logToMonitoringService(appError)
    }

    return appError
  }, [])

  /**
   * Clears an error (for retry scenarios)
   */
  const clearError = useCallback(() => {
    // Clear error state
    return null
  }, [])

  /**
   * Retry handler with exponential backoff
   */
  const createRetryHandler = useCallback((
    operation: () => Promise<void>,
    maxRetries: number = 3
  ) => {
    return async (currentError: AppError): Promise<void> => {
      const retryCount = (currentError.retryCount || 0) + 1
      
      if (retryCount > maxRetries) {
        throw new Error(`Max retries (${maxRetries}) exceeded`)
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      await operation()
    }
  }, [])

  return {
    handleError,
    clearError,
    createRetryHandler
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function categorizeError(error: unknown): { category: ErrorCategory; severity: ErrorSeverity } {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { category: 'network', severity: 'error' }
  }

  // Database errors (Supabase/PostgreSQL)
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    
    if (err.code === 'PGRST') {
      return { category: 'database', severity: 'error' }
    }
    
    if (err.message?.includes('JWT') || err.message?.includes('authentication')) {
      return { category: 'authentication', severity: 'critical' }
    }
    
    if (err.message?.includes('permission') || err.message?.includes('authorized')) {
      return { category: 'authorization', severity: 'error' }
    }
    
    if (err.status === 404 || err.message?.includes('not found')) {
      return { category: 'not_found', severity: 'warning' }
    }
  }

  // Validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return { category: 'validation', severity: 'warning' }
  }

  // Default
  return { category: 'unknown', severity: 'error' }
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    if (err.message) return err.message
    if (err.error) return err.error
    if (err.details) return err.details
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

function getUserFriendlyMessage(category: ErrorCategory, technicalMessage: string): string {
  const messages: Record<ErrorCategory, string> = {
    network: 'Unable to connect to the server. Please check your internet connection.',
    database: 'Failed to load data from the database. Please try again.',
    validation: 'The information provided is invalid. Please check your input.',
    authentication: 'Your session has expired. Please log in again.',
    authorization: 'You do not have permission to perform this action.',
    not_found: 'The requested resource was not found.',
    unknown: 'An unexpected error occurred. Please try again.'
  }

  // If technical message is user-friendly enough, use it
  if (technicalMessage.length < 100 && !technicalMessage.includes('Error:')) {
    return technicalMessage
  }

  return messages[category]
}

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function logToMonitoringService(error: AppError): void {
  // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
  // For now, just log to console in production
  if (process.env.NODE_ENV === 'production') {
    console.error('[MONITORING]', {
      id: error.id,
      severity: error.severity,
      category: error.category,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp
    })
  }
}

