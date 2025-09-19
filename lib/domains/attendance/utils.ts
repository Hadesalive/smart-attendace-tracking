import { AttendanceSession, AttendanceRecord } from '@/lib/types/shared'

export const getSessionTimeStatus = (session: AttendanceSession): 'upcoming' | 'active' | 'completed' => {
  const now = new Date()
  const startTime = new Date(`${session.session_date}T${session.start_time}`)
  const endTime = new Date(`${session.session_date}T${session.end_time}`)

  if (now < startTime) {
    return 'upcoming'
  } else if (now >= startTime && now <= endTime) {
    return 'active'
  } else {
    return 'completed'
  }
}

export const getAttendanceStats = (sessions: AttendanceSession[], records: AttendanceRecord[]) => {
  const totalSessions = sessions.length
  const activeSessions = sessions.filter(s => s.is_active).length
  const completedSessions = sessions.filter(s => !s.is_active).length
  const totalRecords = records.length
  const presentRecords = records.filter(r => r.status === 'present').length
  const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

  return {
    totalSessions,
    activeSessions,
    completedSessions,
    totalRecords,
    presentRecords,
    attendanceRate: Math.round(attendanceRate * 100) / 100
  }
}

export const getSessionsByDateRange = (sessions: AttendanceSession[], startDate: string, endDate: string) => {
  return sessions.filter(session => {
    const sessionDate = new Date(session.session_date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return sessionDate >= start && sessionDate <= end
  })
}

export const getAttendanceByStudent = (records: AttendanceRecord[], studentId: string) => {
  return records.filter(record => record.student_id === studentId)
}

export const getAttendanceBySession = (records: AttendanceRecord[], sessionId: string) => {
  return records.filter(record => record.session_id === sessionId)
}

export const sortSessionsByDate = (sessions: AttendanceSession[]): AttendanceSession[] => {
  return [...sessions].sort((a, b) => {
    const dateA = new Date(`${a.session_date}T${a.start_time}`)
    const dateB = new Date(`${b.session_date}T${b.start_time}`)
    return dateB.getTime() - dateA.getTime()
  })
}

export const isSessionActive = (session: AttendanceSession): boolean => {
  return getSessionTimeStatus(session) === 'active'
}

export const isSessionUpcoming = (session: AttendanceSession): boolean => {
  return getSessionTimeStatus(session) === 'upcoming'
}

export const isSessionCompleted = (session: AttendanceSession): boolean => {
  return getSessionTimeStatus(session) === 'completed'
}
