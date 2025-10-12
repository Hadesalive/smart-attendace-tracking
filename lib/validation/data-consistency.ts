// Data consistency checks and cleanup utilities
// Ensures database integrity and handles orphaned records

import { supabase } from '@/lib/supabase'

export interface ConsistencyCheckResult {
  isConsistent: boolean
  issues: ConsistencyIssue[]
  fixed: number
  warnings: string[]
}

export interface ConsistencyIssue {
  type: 'orphaned_record' | 'missing_reference' | 'invalid_status' | 'data_mismatch'
  table: string
  record_id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  suggested_action?: string
}

export class DataConsistencyChecker {

  // Check for orphaned attendance records (no corresponding session)
  static async checkOrphanedAttendanceRecords(): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    try {
      const { data: orphanedRecords, error } = await supabase
        .from('attendance_records')
        .select('id, session_id, student_id')
        .not('session_id', 'in', `(${await this.getValidSessionIds()})`)

      if (error) {
        console.error('Error checking orphaned attendance records:', error)
        return []
      }

      if (orphanedRecords && orphanedRecords.length > 0) {
        orphanedRecords.forEach(record => {
          issues.push({
            type: 'orphaned_record',
            table: 'attendance_records',
            record_id: record.id,
            description: `Attendance record references non-existent session ${record.session_id}`,
            severity: 'medium',
            suggested_action: 'Remove orphaned record or restore session'
          })
        })
      }
    } catch (error) {
      console.error('Error in orphaned attendance check:', error)
    }

    return issues
  }

  // Check for orphaned section enrollments (no corresponding section)
  static async checkOrphanedEnrollments(): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    try {
      // This would need to check against sections table if it exists
      // For now, we'll check for enrollments with invalid section_ids
      const { data: invalidEnrollments, error } = await supabase
        .from('section_enrollments')
        .select('id, section_id, student_id')
        .or('section_id.is.null,section_id.eq.')

      if (error) {
        console.error('Error checking orphaned enrollments:', error)
        return []
      }

      if (invalidEnrollments && invalidEnrollments.length > 0) {
        invalidEnrollments.forEach(enrollment => {
          issues.push({
            type: 'orphaned_record',
            table: 'section_enrollments',
            record_id: enrollment.id,
            description: `Enrollment record has invalid or missing section_id`,
            severity: 'high',
            suggested_action: 'Remove invalid enrollment or fix section reference'
          })
        })
      }
    } catch (error) {
      console.error('Error in orphaned enrollments check:', error)
    }

    return issues
  }

  // Check for students enrolled in non-existent sections
  static async checkInvalidSectionReferences(): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    try {
      // Get all valid section_ids from attendance_sessions (which reference sections)
      const { data: validSectionIds, error: sectionError } = await supabase
        .from('attendance_sessions')
        .select('section_id')
        .not('section_id', 'is', null)

      if (sectionError) {
        console.error('Error getting valid section IDs:', sectionError)
        return []
      }

      if (validSectionIds && validSectionIds.length > 0) {
        const validIds = validSectionIds.map(s => s.section_id).filter(Boolean)

        // Check enrollments that reference non-existent sections
        const { data: invalidEnrollments, error: enrollmentError } = await supabase
          .from('section_enrollments')
          .select('id, section_id, student_id')
          .not('section_id', 'in', `(${validIds.join(',')})`)

        if (enrollmentError) {
          console.error('Error checking invalid section references:', enrollmentError)
          return []
        }

        if (invalidEnrollments && invalidEnrollments.length > 0) {
          invalidEnrollments.forEach(enrollment => {
            issues.push({
              type: 'missing_reference',
              table: 'section_enrollments',
              record_id: enrollment.id,
              description: `Enrollment references non-existent section ${enrollment.section_id}`,
              severity: 'high',
              suggested_action: 'Remove enrollment or create missing section'
            })
          })
        }
      }
    } catch (error) {
      console.error('Error in invalid section references check:', error)
    }

    return issues
  }

  // Check for attendance records with invalid status values
  static async checkInvalidAttendanceStatus(): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    try {
      const { data: invalidRecords, error } = await supabase
        .from('attendance_records')
        .select('id, status, student_id, session_id')
        .not('status', 'in', '(present,late,absent)')

      if (error) {
        console.error('Error checking invalid attendance status:', error)
        return []
      }

      if (invalidRecords && invalidRecords.length > 0) {
        invalidRecords.forEach(record => {
          issues.push({
            type: 'invalid_status',
            table: 'attendance_records',
            record_id: record.id,
            description: `Attendance record has invalid status: ${record.status}`,
            severity: 'medium',
            suggested_action: 'Update status to valid value (present, late, or absent)'
          })
        })
      }
    } catch (error) {
      console.error('Error in invalid status check:', error)
    }

    return issues
  }

  // Check for enrollment status inconsistencies
  static async checkEnrollmentStatusConsistency(): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    try {
      const { data: inconsistentEnrollments, error } = await supabase
        .from('section_enrollments')
        .select('id, status, student_id, section_id')
        .not('status', 'in', '(active,inactive,withdrawn)')

      if (error) {
        console.error('Error checking enrollment status consistency:', error)
        return []
      }

      if (inconsistentEnrollments && inconsistentEnrollments.length > 0) {
        inconsistentEnrollments.forEach(enrollment => {
          issues.push({
            type: 'invalid_status',
            table: 'section_enrollments',
            record_id: enrollment.id,
            description: `Enrollment has invalid status: ${enrollment.status}`,
            severity: 'medium',
            suggested_action: 'Update status to valid value (active, inactive, or withdrawn)'
          })
        })
      }
    } catch (error) {
      console.error('Error in enrollment status check:', error)
    }

    return issues
  }

  // Run all consistency checks
  static async runAllChecks(): Promise<ConsistencyCheckResult> {
    console.log('🔍 Running data consistency checks...')

    const allIssues = [
      ...(await this.checkOrphanedAttendanceRecords()),
      ...(await this.checkOrphanedEnrollments()),
      ...(await this.checkInvalidSectionReferences()),
      ...(await this.checkInvalidAttendanceStatus()),
      ...(await this.checkEnrollmentStatusConsistency())
    ]

    // Count by severity
    const issuesBySeverity = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length
    }

    const warnings = []
    if (issuesBySeverity.critical > 0) {
      warnings.push(`${issuesBySeverity.critical} critical issues found - immediate attention required`)
    }
    if (issuesBySeverity.high > 0) {
      warnings.push(`${issuesBySeverity.high} high-severity issues found`)
    }

    const isConsistent = allIssues.length === 0

    console.log(`✅ Consistency check complete: ${isConsistent ? 'All good' : `${allIssues.length} issues found`}`)

    return {
      isConsistent,
      issues: allIssues,
      fixed: 0, // We don't auto-fix in this version
      warnings
    }
  }

  // Helper method to get valid session IDs
  private static async getValidSessionIds(): Promise<string> {
    try {
      const { data: sessions, error } = await supabase
        .from('attendance_sessions')
        .select('id')

      if (error || !sessions) {
        return 'null'
      }

      return sessions.map(s => `'${s.id}'`).join(',')
    } catch (error) {
      console.error('Error getting valid session IDs:', error)
      return 'null'
    }
  }

  // Fix orphaned records (dangerous - use with caution)
  static async fixOrphanedRecords(issueType: string): Promise<number> {
    let fixed = 0

    try {
      switch (issueType) {
        case 'orphaned_attendance':
          // Remove attendance records for non-existent sessions
          const { error: deleteError } = await supabase
            .from('attendance_records')
            .delete()
            .not('session_id', 'in', `(${await this.getValidSessionIds()})`)

          if (!deleteError) {
            console.log('✅ Fixed orphaned attendance records')
            fixed++
          }
          break

        case 'invalid_status':
          // Fix invalid status values to 'absent' (most common default)
          const { error: statusError } = await supabase
            .from('attendance_records')
            .update({ status: 'absent' })
            .not('status', 'in', '(present,late,absent)')

          if (!statusError) {
            console.log('✅ Fixed invalid attendance status values')
            fixed++
          }
          break
      }
    } catch (error) {
      console.error(`Error fixing ${issueType}:`, error)
    }

    return fixed
  }
}

export default DataConsistencyChecker
