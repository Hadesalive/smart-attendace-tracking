"use client"

import { useState } from "react"
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface QrScannerComponentProps {
  onScanSuccess: () => void
}

export default function QrScannerComponent({ onScanSuccess }: QrScannerComponentProps) {
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    const result = detectedCodes[0]?.rawValue;
    if (!result) return;

    try {
      const url = new URL(result)
      
      // Extract session ID from URL path (format: /attend/[sessionId])
      const pathParts = url.pathname.split('/').filter(part => part.length > 0)
      const sessionId = pathParts[pathParts.length - 1] // Last part of path

      if (!sessionId || sessionId === 'attend') {
        throw new Error("Invalid QR code. Session ID not found in URL path.")
      }

      console.log('QR Code scanned:', {
        fullUrl: result,
        pathname: url.pathname,
        extractedSessionId: sessionId
      })

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw new Error("You must be logged in to mark attendance.")
      }

      const { error: functionError } = await supabase.functions.invoke("mark-attendance", {
        body: { session_id: sessionId, student_id: userData.user.id },
      })

      if (functionError) {
        let errorMessage = functionError.message
        try {
          const parsedContext = JSON.parse(functionError.context)
          if (parsedContext.error) {
            errorMessage = parsedContext.error
          }
        } catch (e) {
          // Ignore parsing error, use original message
        }
        throw new Error(errorMessage)
      }

      toast.success("Attendance marked successfully!")
      onScanSuccess() // Close dialog and refresh data
    } catch (e: any) {
      setError(e.message)
      toast.error(e.message)
    }
  }

  return (
    <div className="p-4">
      <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden border bg-gray-900">
        <Scanner
          onScan={handleScan}
          onError={(error: unknown) => {
            let errorMessage = "An unknown error occurred during scanning.";
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            setError(errorMessage);
            toast.error(errorMessage);
          }}
          
        />
      </div>
      {error && <p className="text-red-500 text-center font-medium mt-4">{error}</p>}
      <p className="text-sm text-muted-foreground text-center mt-4">
        Point your camera at the QR code presented by the lecturer.
      </p>
    </div>
  )
}
