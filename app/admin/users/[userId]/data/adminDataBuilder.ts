import { AdminProfileWithUser } from "@/lib/types/joined-data"

export function buildAdminData(userData: any, contexts: any) {
  const { academic, coursesHook, auth } = contexts
  
  const adminProfile = academic.state.adminProfiles.find((ap: any) => ap.user_id === userData.id)
  
  const department = adminProfile 
    ? academic.state.departments?.find((d: any) => d.id === (adminProfile as AdminProfileWithUser)?.department_id)?.department_name || 'N/A'
    : 'N/A'
  
  const totalUsers = auth.state.users.length
  const totalCourses = coursesHook.state.courses.length
  const activeUsers = auth.state.users.filter((u: any) => (u as any).status === 'active' || !(u as any).status).length
  const userActivityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
  
  let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent'
  if (userActivityRate < 50) systemHealth = 'critical'
  else if (userActivityRate < 70) systemHealth = 'warning'
  else if (userActivityRate < 90) systemHealth = 'good'
  
  const recentActivities = [
    {
      action: 'User Created',
      target: 'New student enrollment',
      timestamp: new Date().toISOString(),
      status: 'success' as 'success' | 'warning' | 'error'
    },
    {
      action: 'Course Updated',
      target: 'Course curriculum modified',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'success' as 'success' | 'warning' | 'error'
    },
    {
      action: 'System Backup',
      target: 'Database backup completed',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'success' as 'success' | 'warning' | 'error'
    }
  ]
  
  return {
    role: userData.role || 'admin',
    department: department,
    lastLogin: userData.updated_at ? new Date(userData.updated_at).toLocaleDateString() : new Date(userData.created_at).toLocaleDateString(),
    joinedDate: new Date(userData.created_at).toLocaleDateString(),
    bio: (adminProfile as any)?.bio || 'System Administrator',
    phone: (adminProfile as any)?.phone || 'Not provided',
    adminId: adminProfile?.employee_id || `ADM-${userData.id.substring(0, 8).toUpperCase()}`,
    permissions: [
      'user_management',
      'course_management',
      'system_settings',
      'reports_access',
      'data_export',
      'academic_structure'
    ],
    systemAccess: [
      'admin_panel',
      'reports',
      'analytics',
      'user_management',
      'course_management',
      'attendance_oversight'
    ],
    lastSystemUpdate: userData.updated_at || userData.created_at,
    totalUsersManaged: totalUsers,
    totalCoursesManaged: totalCourses,
    systemHealth: systemHealth,
    recentActivities: recentActivities
  }
}

