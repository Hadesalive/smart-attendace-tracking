/**
 * TYPE GUARDS
 * 
 * Runtime type checking utilities for verifying object shapes and ensuring type safety
 * when working with joined database queries and dynamic data transformations.
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 */

import {
  SectionEnrollmentWithJoins,
  CourseWithAssignments,
  CourseAssignmentWithJoins,
  LecturerAssignmentWithJoins,
  AttendanceSessionWithJoins,
  AttendanceRecordWithJoins,
  SectionWithJoins,
  ProgramWithDepartment,
  StudentProfileWithUser,
  LecturerProfileWithUser
} from '@/lib/types/joined-data'
import { SectionEnrollment, StudentProfile, LecturerProfile } from '@/lib/domains/academic/types'
import { Course, CourseAssignment, LecturerAssignment } from '@/lib/domains/courses/types'
import { AttendanceSession, AttendanceRecord } from '@/lib/domains/attendance/types'

// ============================================================================
// ENROLLMENT TYPE GUARDS
// ============================================================================

export function isEnrollmentWithJoins(
  enrollment: SectionEnrollment | SectionEnrollmentWithJoins
): enrollment is SectionEnrollmentWithJoins {
  return 'users' in enrollment && enrollment.users !== undefined
}

export function hasEnrollmentUserData(
  enrollment: SectionEnrollmentWithJoins
): enrollment is SectionEnrollmentWithJoins & { users: NonNullable<SectionEnrollmentWithJoins['users']> } {
  return enrollment.users !== undefined && enrollment.users.full_name !== undefined
}

export function hasEnrollmentSectionData(
  enrollment: SectionEnrollmentWithJoins
): enrollment is SectionEnrollmentWithJoins & { sections: NonNullable<SectionEnrollmentWithJoins['sections']> } {
  return enrollment.sections !== undefined
}

// ============================================================================
// COURSE TYPE GUARDS
// ============================================================================

export function isCourseWithAssignments(
  course: Course | CourseWithAssignments
): course is CourseWithAssignments {
  return 'courseAssignments' in course || 'lecturerAssignments' in course
}

export function isCourseAssignmentWithJoins(
  assignment: CourseAssignment | CourseAssignmentWithJoins
): assignment is CourseAssignmentWithJoins {
  return 'courses' in assignment || 'programs' in assignment
}

export function hasAssignmentCourseData(
  assignment: CourseAssignmentWithJoins
): assignment is CourseAssignmentWithJoins & { courses: NonNullable<CourseAssignmentWithJoins['courses']> } {
  return assignment.courses !== undefined
}

// ============================================================================
// LECTURER ASSIGNMENT TYPE GUARDS
// ============================================================================

export function isLecturerAssignmentWithJoins(
  assignment: LecturerAssignment | LecturerAssignmentWithJoins
): assignment is LecturerAssignmentWithJoins {
  return 'courses' in assignment || 'sections' in assignment || 'users' in assignment
}

export function hasLecturerAssignmentCourseData(
  assignment: LecturerAssignmentWithJoins
): assignment is LecturerAssignmentWithJoins & { courses: NonNullable<LecturerAssignmentWithJoins['courses']> } {
  return assignment.courses !== undefined
}

// ============================================================================
// ATTENDANCE TYPE GUARDS
// ============================================================================

export function isAttendanceSessionWithJoins(
  session: AttendanceSession | AttendanceSessionWithJoins
): session is AttendanceSessionWithJoins {
  return 'courses' in session || 'users' in session || 'sections' in session
}

export function hasSessionCourseData(
  session: AttendanceSessionWithJoins
): session is AttendanceSessionWithJoins & { courses: NonNullable<AttendanceSessionWithJoins['courses']> } {
  return session.courses !== undefined
}

export function isAttendanceRecordWithJoins(
  record: AttendanceRecord | AttendanceRecordWithJoins
): record is AttendanceRecordWithJoins {
  return 'users' in record || 'attendance_sessions' in record
}

// ============================================================================
// SECTION TYPE GUARDS
// ============================================================================

export function isSectionWithJoins(
  section: any
): section is SectionWithJoins {
  return section && typeof section === 'object' && 'id' in section
}

export function hasSectionProgramData(
  section: SectionWithJoins
): section is SectionWithJoins & { programs: NonNullable<SectionWithJoins['programs']> } {
  return section.programs !== undefined
}

// ============================================================================
// PROFILE TYPE GUARDS
// ============================================================================

export function isStudentProfileWithUser(
  profile: StudentProfile | StudentProfileWithUser
): profile is StudentProfileWithUser {
  return 'users' in profile && profile.users !== undefined
}

export function isLecturerProfileWithUser(
  profile: LecturerProfile | LecturerProfileWithUser
): profile is LecturerProfileWithUser {
  return 'users' in profile && profile.users !== undefined
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isNonEmptyArray<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj
}

// ============================================================================
// SAFE GETTERS WITH TYPE NARROWING
// ============================================================================

export function getStudentIdFromEnrollment(
  enrollment: SectionEnrollmentWithJoins
): string {
  if (hasEnrollmentUserData(enrollment) && enrollment.users.student_id) {
    return enrollment.users.student_id
  }
  if (enrollment.student_id_number && enrollment.student_id_number !== 'N/A') {
    return enrollment.student_id_number
  }
  return 'UNKNOWN'
}

export function getProgramCodeFromSection(
  section: SectionWithJoins
): string {
  if (hasSectionProgramData(section) && section.programs.program_code) {
    return section.programs.program_code
  }
  return 'N/A'
}

export function getCourseNameFromAssignment(
  assignment: CourseAssignmentWithJoins
): string {
  if (hasAssignmentCourseData(assignment) && assignment.courses.course_name) {
    return assignment.courses.course_name
  }
  return 'Unknown Course'
}

