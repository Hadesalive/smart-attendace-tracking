"use client"

import React from "react"
import { Alert, Button } from "@mui/material"
import { motion } from "framer-motion"

interface ErrorAlertProps {
  error: string | null
  onRetry?: () => void
  retryText?: string
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function ErrorAlert({ 
  error, 
  onRetry, 
  retryText = "Retry" 
}: ErrorAlertProps) {
  if (!error) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring}
    >
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              {retryText}
            </Button>
          )
        }
      >
        {error}
      </Alert>
    </motion.div>
  )
}
