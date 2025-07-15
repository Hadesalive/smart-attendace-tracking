"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QRScanner from "@/components/attendance/qr-scanner"
import FaceRecognition from "@/components/attendance/face-recognition"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { QrCode, Camera, CheckCircle } from "lucide-react"

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push("/")
    } else {
      setUser(currentUser)
    }
    setLoading(false)
  }

  const handleQRScanSuccess = async (qrData: string) => {
    try {
      // In a real implementation, you would:
      // 1. Validate the QR code
      // 2. Check if the session is active
      // 3. Mark attendance in the database

      console.log("QR Code scanned:", qrData)

      // Simulate attendance marking
      const { error } = await supabase.from("attendance_records").insert({
        session_id: "mock-session-id", // This would come from the QR code
        student_id: user.id,
        method_used: "qr_code",
      })

      if (!error) {
        setAttendanceMarked(true)
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const handleFaceRecognitionSuccess = async (confidence: number) => {
    try {
      console.log("Face recognized with confidence:", confidence)

      // Simulate attendance marking
      const { error } = await supabase.from("attendance_records").insert({
        session_id: "mock-session-id",
        student_id: user.id,
        method_used: "facial_recognition",
        confidence_score: confidence,
      })

      if (!error) {
        setAttendanceMarked(true)
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const handleScanError = (error: string) => {
    console.error("Scan error:", error)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (attendanceMarked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Attendance Marked!</CardTitle>
            <CardDescription>Your attendance has been successfully recorded for this session.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
          <p className="text-gray-600">Choose your preferred method to mark attendance</p>
        </div>

        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="face" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Face Recognition
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr">
            <QRScanner onScanSuccess={handleQRScanSuccess} onScanError={handleScanError} />
          </TabsContent>

          <TabsContent value="face">
            <FaceRecognition onRecognitionSuccess={handleFaceRecognitionSuccess} onRecognitionError={handleScanError} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
