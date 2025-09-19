"use client"

import React, { useRef, useEffect, useState } from "react"
import { DialogBox } from "@/components/ui/dialog-box"
import { XMarkIcon, CameraIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner"

interface MobileQrScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
  loading?: boolean
  scanResult?: {
    success: boolean
    message: string
    sessionId?: string
    courseName?: string
  } | null
}

export default function MobileQrScanner({ 
  isOpen, 
  onClose, 
  onScan, 
  loading = false,
  scanResult 
}: MobileQrScannerProps) {
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isHttps, setIsHttps] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      setIsHttps(isSecure)
    }
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    if (!isHttps) {
      setHasCamera(false)
      setCameraError('Camera requires a secure connection (HTTPS). Please use a secure connection to access the camera.')
      return
    }

    setIsInitializing(true)
    setCameraError(null)

    // The Scanner component will handle camera access internally
    // We just need to set the states for the UI
    setTimeout(() => {
      setIsInitializing(false)
      setHasCamera(true)
      setCameraError(null)
      setIsScanning(true)
    }, 1000) // Small delay to show loading state
  }

  const stopCamera = () => {
    // The Scanner component will handle stopping the camera internally
    setIsScanning(false)
    setIsInitializing(false)
  }

  const handleQrScan = (result: IDetectedBarcode[]) => {
    if (result && result.length > 0) {
      const qrData = result[0].rawValue
      onScan(qrData)
    }
  }

  const handleScannerError = (error: any) => {
    console.error('QR Scanner error:', error)
    setCameraError('Failed to start QR scanner. Please try again.')
    setHasCamera(false)
  }


  return (
    <DialogBox
      open={isOpen}
      onOpenChange={onClose}
      title=""
      description=""
      maxWidth="sm"
      className="p-0"
    >
      <div className="relative">
        {/* Header - Fixed spacing */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scan QR Code</h2>
            <p className="text-sm text-gray-500 mt-1">Point your camera at the QR code</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Camera View */}
        {isInitializing ? (
          <div className="mx-6 mb-6">
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Starting Camera...</h3>
              <p className="text-gray-600 text-sm">
                Please allow camera access when prompted
              </p>
            </div>
          </div>
        ) : hasCamera && isScanning ? (
          <div className="relative bg-black mx-6 rounded-2xl overflow-hidden">
            <Scanner
              onScan={handleQrScan}
              onError={handleScannerError}
            />
            
            {/* Scanning Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* QR Frame */}
                <div className="w-56 h-56 border-2 border-white/30 rounded-2xl"></div>
                
                {/* Corner Indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8">
                  <div className="w-full h-0.5 bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8">
                  <div className="w-full h-0.5 bg-white"></div>
                  <div className="w-0.5 h-full bg-white ml-auto"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8">
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-full h-0.5 bg-white mt-auto"></div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8">
                  <div className="w-0.5 h-full bg-white ml-auto"></div>
                  <div className="w-full h-0.5 bg-white mt-auto"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-6 mb-6">
            {/* Error State */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              {!isHttps ? (
                <>
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CameraIcon className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Connection Required</h3>
                  <p className="text-gray-600 text-sm">
                    Camera access requires a secure connection (HTTPS). Please use a secure connection to scan QR codes.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CameraIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Not Available</h3>
                  <p className="text-gray-600 text-sm">
                    {cameraError || 'Please allow camera access to scan QR codes.'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {hasCamera && isScanning && (
          <div className="px-6 pb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Position the QR code within the frame
              </p>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-6 mb-6 p-4 rounded-xl ${
              scanResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                scanResult.success ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-sm font-medium ${
                scanResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {scanResult.message}
              </p>
            </div>
            {scanResult.courseName && (
              <p className="text-xs text-gray-600 mt-2 ml-5">
                Course: {scanResult.courseName}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </DialogBox>
  )
}
