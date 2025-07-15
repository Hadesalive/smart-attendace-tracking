"use client"

import { Badge } from "@/components/ui/badge"

// A note on timezones: All date comparisons should ideally be done against UTC.
// The session creation logic was updated to store times in UTC.
// The new Date() object here will correctly use the client's local time and compare it against the UTC times from the database.

const getSessionStatus = (
  startTime: string,
  endTime: string
): "Active" | "Upcoming" | "Expired" => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now >= start && now <= end) {
    return "Active"
  }
  if (now < start) {
    return "Upcoming"
  }
  return "Expired"
}

interface SessionStatusBadgeProps {
  startTime: string
  endTime: string
}

export function SessionStatusBadge({ startTime, endTime }: SessionStatusBadgeProps) {
  const status = getSessionStatus(startTime, endTime)

  const statusStyles = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Upcoming: "bg-blue-100 text-blue-800 border-blue-200",
    Expired: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {status}
    </Badge>
  )
}
