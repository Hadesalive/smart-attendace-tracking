import { AttendanceSession, AttendanceRecord } from '@/lib/types/shared'

export interface AttendanceState {
  currentUser: any
  attendanceSessions: AttendanceSession[]
  attendanceRecords: AttendanceRecord[]
  loading: boolean
  error: string | null
}

export interface AttendanceContextType {
  state: AttendanceState
  fetchAttendanceSessions: () => Promise<void>
  fetchAttendanceRecords: () => Promise<void>
  createAttendanceSessionSupabase: (session: Omit<AttendanceSession, 'id' | 'created_at'>) => Promise<AttendanceSession>
  updateAttendanceSessionSupabase: (sessionId: string, updates: Partial<AttendanceSession>) => Promise<void>
  deleteAttendanceSessionSupabase: (sessionId: string) => Promise<void>
  markAttendanceSupabase: (sessionId: string, studentId: string, method: 'qr_code' | 'facial_recognition') => Promise<void>
  getSessionTimeStatus: (session: AttendanceSession) => 'upcoming' | 'active' | 'completed'
  updateSessionStatusBasedOnTime: (sessionId: string) => Promise<void>
  subscribeToAttendanceSessions: (courseId?: string) => void
  subscribeToAttendanceRecords: (sessionId?: string) => void
  unsubscribeAll: () => void
  getAttendanceSessionsByCourse: (courseId: string) => AttendanceSession[]
  getAttendanceRecordsBySession: (sessionId: string) => AttendanceRecord[]
}
