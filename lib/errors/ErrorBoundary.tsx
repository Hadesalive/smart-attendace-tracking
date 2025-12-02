/**
 * ERROR BOUNDARY COMPONENT
 * 
 * React error boundary for catching and handling errors in component trees.
 * Provides graceful error recovery and user-friendly error displays.
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 */

"use client"

import React, { Component, ReactNode } from 'react'
import { Box, Button, Typography, Alert } from '@mui/material'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { AppError, ErrorBoundaryProps } from './types'
import { TYPOGRAPHY_STYLES } from '@/lib/design/fonts'

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        id: `boundary_${Date.now()}`,
        severity: 'error',
        category: 'unknown',
        message: 'Something went wrong',
        details: error.message,
        originalError: error,
        timestamp: new Date(),
        retryable: true
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Call onError callback if provided
    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    })
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset)
        }
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 4,
            textAlign: 'center'
          }}
        >
          <ExclamationTriangleIcon 
            style={{ 
              width: 64, 
              height: 64, 
              color: '#f44336',
              marginBottom: 16 
            }} 
          />
          
          <Typography 
            variant="h5" 
            sx={{ 
              ...TYPOGRAPHY_STYLES.pageTitle,
              mb: 2 
            }}
          >
            Oops! Something went wrong
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              maxWidth: 600,
              color: 'text.secondary',
              fontSize: '1rem',
              lineHeight: 1.5
            }}
          >
            {this.state.error.message}
          </Typography>

          {process.env.NODE_ENV === 'development' && this.state.error.details && (
            <Alert severity="error" sx={{ mb: 3, maxWidth: 600, textAlign: 'left' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {this.state.error.details}
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowPathIcon style={{ width: 20, height: 20 }} />}
              onClick={this.handleReset}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                '&:hover': { bgcolor: '#333' },
                px: 3,
                py: 1
              }}
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/admin'}
              sx={{
                borderColor: '#000',
                color: '#000',
                '&:hover': { borderColor: '#333', bgcolor: 'rgba(0,0,0,0.04)' },
                px: 3,
                py: 1
              }}
            >
              Go to Dashboard
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 3,
                color: 'text.secondary',
                fontFamily: 'monospace'
              }}
            >
              Error ID: {this.state.error.id}
            </Typography>
          )}
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

