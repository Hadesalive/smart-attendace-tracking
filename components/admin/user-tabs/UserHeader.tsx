import React from "react"
import { Button } from "@mui/material"
import { PencilIcon, TrashIcon, UserIcon, AcademicCapIcon, CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"
import DetailHeader from "@/components/admin/DetailHeader"
import { FONT_FAMILIES, FONT_WEIGHTS } from "@/lib/design/fonts"

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

interface UserHeaderProps {
  user: User
  onEdit?: () => void
  onDelete?: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BUTTON_STYLES = {
  primary: {
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: "0.875rem",
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    py: 1.5,
    "&:hover": { 
      backgroundColor: "#1f2937",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  },
  outlined: {
    borderColor: "#000",
    color: "#000",
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: "0.875rem",
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    py: 1.5,
    "&:hover": { 
      borderColor: "#1f2937",
      backgroundColor: "#f9fafb",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s ease-in-out"
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: string) => {
  const colors = {
    active: "#000000",
    inactive: "#666666",
    pending: "#999999"
  }
  return colors[status as keyof typeof colors] || "#666666"
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return '👑'
    case 'lecturer': return '👨‍🏫'
    case 'student': return '🎓'
    default: return '👤'
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function UserHeader({ user, onEdit, onDelete }: UserHeaderProps) {
  return (
    <DetailHeader
      title={user.name}
      subtitle={user.email}
      status={{
        label: user.status,
        color: getStatusColor(user.status)
      }}
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={<PencilIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.outlined}
            onClick={onEdit}
          >
            Edit User
          </Button>
          <Button
            variant="contained"
            startIcon={<TrashIcon className="h-4 w-4" />}
            sx={BUTTON_STYLES.primary}
            onClick={onDelete}
          >
            Delete User
          </Button>
        </>
      }
    />
  )
}
