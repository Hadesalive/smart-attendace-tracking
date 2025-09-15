import React from "react"
import { Box } from "@mui/material"
import { ShieldCheckIcon, CogIcon, ClockIcon, UsersIcon, BookOpenIcon } from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { activityColumns } from "@/lib/table-columns/user-columns"

// ============================================================================
// TYPES
// ============================================================================

interface AdminDetails {
  permissions: string[]
  systemAccess: string[]
  lastSystemUpdate: string
  totalUsersManaged: number
  totalCoursesManaged: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  recentActivities: Array<{
    action: string
    target: string
    timestamp: string
    status: 'success' | 'warning' | 'error'
  }>
}

interface AdminTabsProps {
  details: AdminDetails
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminTabs({ details }: AdminTabsProps) {
  const adminStatsCards = [
    { 
      title: "Users Managed", 
      value: details.totalUsersManaged, 
      icon: UsersIcon, 
      color: "#000000",
      subtitle: "Total users",
      change: "System-wide"
    },
    { 
      title: "Courses Managed", 
      value: details.totalCoursesManaged, 
      icon: BookOpenIcon, 
      color: "#000000",
      subtitle: "Total courses",
      change: "System-wide"
    },
    { 
      title: "System Health", 
      value: details.systemHealth, 
      icon: ShieldCheckIcon, 
      color: "#000000",
      subtitle: "Current status",
      change: "Real-time"
    },
    { 
      title: "Last Update", 
      value: formatDate(details.lastSystemUpdate), 
      icon: ClockIcon, 
      color: "#000000",
      subtitle: "System update",
      change: "Recent"
    }
  ]

  const tabs = [
    {
      label: "Overview",
      value: "overview",
      content: (
        <Box>
          <InfoCard
            title="Administrative Information"
            items={[
              {
                label: "Permissions",
                value: details.permissions.join(", "),
                icon: ShieldCheckIcon
              },
              {
                label: "System Access",
                value: details.systemAccess.join(", "),
                icon: CogIcon
              },
              {
                label: "Last Update",
                value: formatDate(details.lastSystemUpdate),
                icon: ClockIcon
              }
            ]}
            columns={3}
            showDivider={false}
          />
          <StatsGrid stats={adminStatsCards} />
        </Box>
      )
    },
    {
      label: "Activity",
      value: "activity",
      content: (
        <DataTable
          title="Recent Activities"
          subtitle="Latest administrative actions"
          columns={activityColumns}
          data={details.recentActivities}
        />
      )
    }
  ]

  return { tabs }
}
