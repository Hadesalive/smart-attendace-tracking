// Auth utility functions

export const getCurrentUserRole = (user: any): string => {
  return user?.role || 'guest'
}

export const isAdmin = (user: any): boolean => {
  return getCurrentUserRole(user) === 'admin'
}

export const isLecturer = (user: any): boolean => {
  return getCurrentUserRole(user) === 'lecturer'
}

export const isStudent = (user: any): boolean => {
  return getCurrentUserRole(user) === 'student'
}

export const canAccessAdmin = (user: any): boolean => {
  return isAdmin(user)
}

export const canAccessLecturer = (user: any): boolean => {
  return isAdmin(user) || isLecturer(user)
}

export const canAccessStudent = (user: any): boolean => {
  return isAdmin(user) || isLecturer(user) || isStudent(user)
}
