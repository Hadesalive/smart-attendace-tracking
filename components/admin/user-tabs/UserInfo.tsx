import React from "react"
import { UserIcon, DevicePhoneMobileIcon, KeyIcon } from "@heroicons/react/24/outline"
import InfoCard from "@/components/admin/InfoCard"

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'lecturer' | 'student'
  status: 'active' | 'inactive' | 'pending'
  avatar?: string
  phone?: string
  department?: string
  studentId?: string
  employeeId?: string
  joinDate: string
  lastLogin: string
  bio?: string
}

interface UserInfoProps {
  user: User
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <InfoCard
      title="User Information"
      items={[
        {
          label: "Bio",
          value: user.bio || "No bio provided",
          icon: UserIcon
        },
        {
          label: "Phone",
          value: user.phone || "Not provided",
          icon: DevicePhoneMobileIcon
        },
        {
          label: user.role === 'student' ? "Student ID" : user.role === 'lecturer' ? "Employee ID" : "Admin ID",
          value: user.studentId || user.employeeId || "N/A",
          icon: KeyIcon
        }
      ]}
      columns={3}
      showDivider={false}
    />
  )
}
