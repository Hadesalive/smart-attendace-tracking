// ============================================================================
// STATUS MAPPING UTILITIES
// ============================================================================
// Centralized status definitions and mapping functions for consistent data flow

// ============================================================================
// SHARED STATUS DEFINITIONS
// ============================================================================

// Assignment statuses (from shared types)
export type AssignmentStatus = 'draft' | 'published' | 'closed'

// Submission statuses (from shared types)
export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded'

// Session statuses (from shared types)
export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

// Attendance statuses (from shared types)
export type AttendanceStatus = 'present' | 'late' | 'absent'

// ============================================================================
// ROLE-SPECIFIC STATUS MAPPINGS
// ============================================================================

// Lecturer view mappings
export const LECTURER_STATUS_MAPPING = {
  // Assignment statuses
  assignment: {
    'draft': 'upcoming',
    'published': 'active', 
    'closed': 'completed'
  },
  // Session statuses
  session: {
    'scheduled': 'scheduled',
    'active': 'active',
    'completed': 'completed',
    'cancelled': 'cancelled'
  }
} as const

// Student view mappings
export const STUDENT_STATUS_MAPPING = {
  // Assignment statuses
  assignment: {
    'draft': 'upcoming',
    'published': 'active',
    'closed': 'completed'
  },
  // Session statuses
  session: {
    'scheduled': 'upcoming',
    'active': 'active', 
    'completed': 'completed',
    'cancelled': 'missed'
  }
} as const

// Admin view mappings
export const ADMIN_STATUS_MAPPING = {
  // Assignment statuses
  assignment: {
    'draft': 'draft',
    'published': 'published',
    'closed': 'closed'
  },
  // Session statuses
  session: {
    'scheduled': 'scheduled',
    'active': 'active',
    'completed': 'completed', 
    'cancelled': 'cancelled'
  }
} as const

// ============================================================================
// STATUS MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps assignment status from shared type to role-specific display status
 */
export function mapAssignmentStatus(
  status: AssignmentStatus, 
  role: 'admin' | 'lecturer' | 'student'
): string {
  switch (role) {
    case 'admin':
      return ADMIN_STATUS_MAPPING.assignment[status]
    case 'lecturer':
      return LECTURER_STATUS_MAPPING.assignment[status]
    case 'student':
      return STUDENT_STATUS_MAPPING.assignment[status]
    default:
      return status
  }
}

/**
 * Maps session status from shared type to role-specific display status
 */
export function mapSessionStatus(
  status: SessionStatus,
  role: 'admin' | 'lecturer' | 'student'
): string {
  switch (role) {
    case 'admin':
      return ADMIN_STATUS_MAPPING.session[status]
    case 'lecturer':
      return LECTURER_STATUS_MAPPING.session[status]
    case 'student':
      return STUDENT_STATUS_MAPPING.session[status]
    default:
      return status
  }
}

/**
 * Maps submission status from shared type to role-specific display status
 */
export function mapSubmissionStatus(
  status: SubmissionStatus,
  role: 'admin' | 'lecturer' | 'student'
): string {
  // Submission statuses are generally consistent across roles
  return status
}

/**
 * Maps attendance status from shared type to role-specific display status
 */
export function mapAttendanceStatus(
  status: AttendanceStatus,
  role: 'admin' | 'lecturer' | 'student'
): string {
  // Attendance statuses are consistent across roles
  return status
}

// ============================================================================
// REVERSE MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps role-specific display status back to shared type status
 */
export function reverseMapAssignmentStatus(
  displayStatus: string,
  role: 'admin' | 'lecturer' | 'student'
): AssignmentStatus | null {
  const mapping = role === 'admin' ? ADMIN_STATUS_MAPPING.assignment :
                  role === 'lecturer' ? LECTURER_STATUS_MAPPING.assignment :
                  STUDENT_STATUS_MAPPING.assignment
  
  const entry = Object.entries(mapping).find(([_, value]) => value === displayStatus)
  return entry ? entry[0] as AssignmentStatus : null
}

/**
 * Maps role-specific display status back to shared type status
 */
export function reverseMapSessionStatus(
  displayStatus: string,
  role: 'admin' | 'lecturer' | 'student'
): SessionStatus | null {
  const mapping = role === 'admin' ? ADMIN_STATUS_MAPPING.session :
                  role === 'lecturer' ? LECTURER_STATUS_MAPPING.session :
                  STUDENT_STATUS_MAPPING.session
  
  const entry = Object.entries(mapping).find(([_, value]) => value === displayStatus)
  return entry ? entry[0] as SessionStatus : null
}

// ============================================================================
// STATUS VALIDATION
// ============================================================================

/**
 * Validates if a status is valid for a given entity type
 */
export function isValidStatus(
  status: string,
  entityType: 'assignment' | 'session' | 'submission' | 'attendance'
): boolean {
  switch (entityType) {
    case 'assignment':
      return ['draft', 'published', 'closed'].includes(status)
    case 'session':
      return ['scheduled', 'active', 'completed', 'cancelled'].includes(status)
    case 'submission':
      return ['pending', 'submitted', 'late', 'graded'].includes(status)
    case 'attendance':
      return ['present', 'late', 'absent'].includes(status)
    default:
      return false
  }
}

// ============================================================================
// STATUS COLOR MAPPINGS
// ============================================================================

export const STATUS_COLORS = {
  // Assignment statuses
  assignment: {
    draft: '#6b7280',
    published: '#10b981',
    closed: '#6b7280'
  },
  // Session statuses
  session: {
    scheduled: '#f59e0b',
    active: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444'
  },
  // Submission statuses
  submission: {
    pending: '#f59e0b',
    submitted: '#10b981',
    late: '#ef4444',
    graded: '#6b7280'
  },
  // Attendance statuses
  attendance: {
    present: '#10b981',
    late: '#f59e0b',
    absent: '#ef4444'
  }
} as const

/**
 * Gets the color for a given status and entity type
 */
export function getStatusColor(
  status: string,
  entityType: 'assignment' | 'session' | 'submission' | 'attendance'
): string {
  return STATUS_COLORS[entityType][status as keyof typeof STATUS_COLORS[typeof entityType]] || '#6b7280'
}
