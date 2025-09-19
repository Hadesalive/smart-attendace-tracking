import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/lib/contexts/DataContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Attendance System",
  description: "Hybrid smart attendance system with facial recognition and QR code scanning",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  )
}
