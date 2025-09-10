"use client"

import React, { useRef, useEffect, useState } from "react"
import { Box, Button, Typography, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material"
import { QrCodeIcon, XMarkIcon, CameraIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface MobileQrScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
  title?: string
  sessionId?: string
  courseName?: string
}

const MobileQrScanner = ({ 
  isOpen, 
  onClose, 
  onScan, 
  title = "Scan QR Code",
  sessionId,
  courseName
}: MobileQrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Check for camera availability and screen size
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (typeof window !== 'undefined' && navigator.mediaDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const hasVideoDevice = devices.some(device => device.kind === 'videoinput')
          setHasCamera(hasVideoDevice)
        } else {
          setHasCamera(false)
        }
      } catch (err) {
        console.error('Error checking camera:', err)
        setHasCamera(false)
      }
    }
    
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsFullScreen(window.innerWidth < 768)
      }
    }
    
    checkCamera()
    checkScreenSize()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize)
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Start camera stream
  const startCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)
      
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } else {
        setError('Camera not available in this environment.')
        setIsScanning(false)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
      setIsScanning(false)
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  // Simple QR code detection (basic implementation)
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // In a real implementation, you'd use a QR code library like 'qr-scanner'
    // For now, we'll simulate detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Basic pattern detection (simplified)
    // In production, use a proper QR code library
    setTimeout(() => {
      // Simulate QR code detection - this would be the session QR code data
      const mockData = sessionId ? `session-${sessionId}` : `attendance-${Date.now()}`
      onScan(mockData)
      stopCamera()
      onClose()
    }, 2000)
  }

  // Start scanning when dialog opens
  useEffect(() => {
    if (isOpen && hasCamera) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, hasCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: { xs: 0, sm: 3 },
          margin: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '90vh' }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon style={{ width: 24, height: 24 }} />
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              {title}
            </Typography>
            {courseName && (
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif', color: 'text.secondary' }}>
                {courseName}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <XMarkIcon style={{ width: 20, height: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {!hasCamera ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 300,
            p: 3,
            textAlign: 'center'
          }}>
            <CameraIcon style={{ width: 64, height: 64, color: '#ccc', marginBottom: 16 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 1 }}>
              Camera Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'DM Sans, sans-serif' }}>
              Please enable camera permissions or use a device with a camera.
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 300,
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 1, color: 'error.main' }}>
              Camera Error
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'DM Sans, sans-serif', mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={startCamera}
              sx={{ 
                bgcolor: '#000',
                '&:hover': { bgcolor: '#111' },
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600
              }}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', height: { xs: '70vh', sm: 400 } }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '0 0 12px 12px'
              }}
              playsInline
              muted
            />
            
            {/* Scanning overlay */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  width: 200,
                  height: 200,
                  border: '3px solid #000',
                  borderRadius: 12,
                  position: 'relative'
                }}
              >
                {/* Corner indicators */}
                <Box sx={{
                  position: 'absolute',
                  top: -3,
                  left: -3,
                  width: 20,
                  height: 20,
                  borderTop: '3px solid #000',
                  borderLeft: '3px solid #000'
                }} />
                <Box sx={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 20,
                  height: 20,
                  borderTop: '3px solid #000',
                  borderRight: '3px solid #000'
                }} />
                <Box sx={{
                  position: 'absolute',
                  bottom: -3,
                  left: -3,
                  width: 20,
                  height: 20,
                  borderBottom: '3px solid #000',
                  borderLeft: '3px solid #000'
                }} />
                <Box sx={{
                  position: 'absolute',
                  bottom: -3,
                  right: -3,
                  width: 20,
                  height: 20,
                  borderBottom: '3px solid #000',
                  borderRight: '3px solid #000'
                }} />
              </motion.div>
            </Box>

            {/* Instructions */}
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              p: 2,
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'DM Sans, sans-serif' }}>
                Point your camera at the QR code displayed by your lecturer
              </Typography>
            </Box>
          </Box>
        )}

        {/* Hidden canvas for QR detection */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Action buttons */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          {isScanning ? (
            <Button 
              variant="outlined" 
              onClick={stopCamera}
              sx={{ 
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                minWidth: 120
              }}
            >
              Stop Scanning
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={startCamera}
              sx={{ 
                bgcolor: '#000',
                '&:hover': { bgcolor: '#111' },
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                minWidth: 120
              }}
            >
              Start Scanning
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default MobileQrScanner
