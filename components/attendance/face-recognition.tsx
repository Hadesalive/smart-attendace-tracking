"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, User, CheckCircle, X, Loader2 } from "lucide-react"

interface FaceRecognitionProps {
  onRecognitionSuccess: (confidence: number) => void
  onRecognitionError: (error: string) => void
}

export default function FaceRecognition({ onRecognitionSuccess, onRecognitionError }: FaceRecognitionProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [confidence, setConfidence] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startRecognition = async () => {
    try {
      setError("")
      setSuccess("")
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      setError("Failed to access camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const stopRecognition = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setIsScanning(false)
    setIsProcessing(false)
  }

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsProcessing(true)

    // Simulate face recognition processing
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx?.drawImage(video, 0, 0)

    // Simulate recognition process with progress
    for (let i = 0; i <= 100; i += 10) {
      setConfidence(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Simulate recognition result
    const mockConfidence = 0.95 // 95% confidence
    setSuccess(`Face recognized with ${(mockConfidence * 100).toFixed(1)}% confidence`)
    onRecognitionSuccess(mockConfidence)
    setIsProcessing(false)
    stopRecognition()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Face Recognition
        </CardTitle>
        <CardDescription>Look at the camera to mark your attendance using facial recognition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {isScanning ? (
            <div className="space-y-4">
              <div className="relative">
                <video ref={videoRef} className="w-full h-64 bg-black rounded-lg" autoPlay playsInline muted />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Processing...</p>
                      <Progress value={confidence} className="mt-2 w-32" />
                    </div>
                  </div>
                )}
                {/* Face detection overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-blue-500 rounded-full opacity-50"></div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button
                  onClick={stopRecognition}
                  variant="outline"
                  className="flex-1 bg-transparent"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button onClick={captureAndRecognize} className="flex-1" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Camera preview will appear here</p>
                </div>
              </div>
              <Button onClick={startRecognition} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Face Recognition
              </Button>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Position your face within the circle for best results</p>
        </div>
      </CardContent>
    </Card>
  )
}
