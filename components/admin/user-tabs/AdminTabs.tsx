import React from "react"
import { Box, Typography } from "@mui/material"
import { ShieldCheckIcon, CogIcon, ClockIcon, UsersIcon, BookOpenIcon, UserIcon, DevicePhoneMobileIcon, BuildingOfficeIcon, CalendarDaysIcon, KeyIcon } from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"
import InfoCard from "@/components/admin/InfoCard"
import StatsGrid from "@/components/admin/StatsGrid"
import DataTable from "@/components/admin/DataTable"
import { activityColumns } from "@/lib/table-columns/user-columns"

// ============================================================================
// TYPES
// ============================================================================

interface AdminDetails {
  // User Information
  role: string
  department: string
  lastLogin: string
  joinedDate: string
  bio: string
  phone: string
  adminId: string
  
  // Administrative Information
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Personal Information Section */}
          <InfoCard
            title="Personal Information"
            subtitle="Basic user details and contact information"
            items={[
              {
                label: "Role",
                value: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: '#fecaca',
                        color: '#991b1b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    >
                      {details.role || "N/A"}
                    </Box>
                  </Box>
                ),
                icon: UserIcon
              },
              {
                label: "Department",
                value: details.department || "N/A",
                icon: BuildingOfficeIcon
              },
              {
                label: "Bio",
                value: details.bio || "No bio provided",
                icon: UserIcon
              },
              {
                label: "Phone",
                value: details.phone || "Not provided",
                icon: DevicePhoneMobileIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />

          {/* Administrative Information Section */}
          <InfoCard
            title="Administrative Information"
            subtitle="System access and administrative privileges"
            items={[
              {
                label: "Admin ID",
                value: (
                  <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1rem' }}>
                    {details.adminId || "N/A"}
                  </Box>
                ),
                icon: KeyIcon
              },
              {
                label: "Permissions",
                value: (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {details.permissions.map((permission, index) => (
                      <Box
                        key={index}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: '#e0e7ff',
                          color: '#3730a3',
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}
                      >
                        {permission}
                      </Box>
                    ))}
                  </Box>
                ),
                icon: ShieldCheckIcon
              },
              {
                label: "System Access",
                value: (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {details.systemAccess.map((access, index) => (
                      <Box
                        key={index}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: '#f0fdf4',
                          color: '#166534',
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}
                      >
                        {access}
                      </Box>
                    ))}
                  </Box>
                ),
                icon: CogIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />

          {/* Account Information Section */}
          <InfoCard
            title="Account Information"
            subtitle="Login and account activity details"
            items={[
              {
                label: "Last Login",
                value: details.lastLogin || "N/A",
                icon: ClockIcon
              },
              {
                label: "Joined",
                value: details.joinedDate || "N/A",
                icon: CalendarDaysIcon
              },
              {
                label: "Last System Update",
                value: formatDate(details.lastSystemUpdate),
                icon: ClockIcon
              }
            ]}
            columns={2}
            showDivider={false}
          />
        </Box>
      )
    },
    {
      label: "System Management",
      value: "system",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            System Overview
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                System Health
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: details.systemHealth === 'excellent' ? '#4caf50' :
                             details.systemHealth === 'good' ? '#8bc34a' :
                             details.systemHealth === 'warning' ? '#ff9800' : '#f44336'
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {details.systemHealth}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {details.totalUsersManaged}
              </Typography>
            </Box>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Courses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {details.totalCoursesManaged}
              </Typography>
            </Box>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Last Update
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatDate(details.lastSystemUpdate)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {details.permissions.map((permission, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {permission.replace('_', ' ').toUpperCase()}
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                System Access
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {details.systemAccess.map((access, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: '#e3f2fd',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {access.replace('_', ' ').toUpperCase()}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
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
          data={details.recentActivities || []}
        />
      )
    }
  ]

  return { tabs }
}
