import { CourseAssignmentWithJoins, StudentProfileWithUser } from "@/lib/types/joined-data"

export function buildStudentData(userData: any, contexts: any) {
  const { academic, coursesHook, attendance } = contexts
  
  const studentProfile = academic.state.studentProfiles.find((sp: any) => sp.user_id === userData.id)
  
  const programCourseAssignments = coursesHook.state.courseAssignments?.filter((ca: any) => 
    ca.program_id === studentProfile?.program_id && 
    ca.academic_year_id === studentProfile?.academic_year_id
  ) || []
  
  const studentCourses = programCourseAssignments.map((assignment: any) => {
    const course = coursesHook.state.courses.find((c: any) => c.id === assignment.course_id)
    let semester = academic.state.semesters.find((s: any) => s.id === assignment.semester_id)
    if (!semester && studentProfile?.section_id) {
      const section = academic.state.sections.find((s: any) => s.id === studentProfile.section_id)
      if (section?.semester_id) {
        semester = academic.state.semesters.find((s: any) => s.id === section.semester_id)
      }
    }
    
    return {
      id: course?.id || '',
      name: course?.course_name?.trim() || 'Unknown Course',
      code: course?.course_code || 'N/A',
      credits: course?.credits || 0,
      semester: semester?.semester_name || 'N/A',
      year: (assignment as CourseAssignmentWithJoins).year || 1,
      status: 'active' as 'active' | 'completed' | 'upcoming'
    }
  })

  const studentAttendance = attendance.state.attendanceRecords?.filter((ar: any) => 
    ar.student_id === userData.id
  ) || []

  const totalSessions = studentAttendance.length
  const presentSessions = studentAttendance.filter((ar: any) => ar.status === 'present').length
  const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0

  const programName = studentProfile?.programs?.program_name || 'N/A'
  const programCode = studentProfile?.programs?.program_code || 'N/A'
  const degreeType = studentProfile?.programs?.degree_type || 'N/A'
  const studentProfileWithUser = studentProfile as StudentProfileWithUser
  const departmentName = (studentProfileWithUser?.programs as any)?.departments?.department_name || 'N/A'
  const year = studentProfile?.sections?.year || 1
  const totalCredits = studentProfile?.credits_completed || studentCourses.reduce((sum: number, course: any) => sum + course.credits, 0)

  return {
    role: userData.role || 'student',
    department: departmentName,
    lastLogin: userData.updated_at ? new Date(userData.updated_at).toLocaleDateString() : new Date(userData.created_at).toLocaleDateString(),
    joinedDate: new Date(userData.created_at).toLocaleDateString(),
    bio: 'No bio provided',
    phone: studentProfile?.emergency_contact_phone || 'Not provided',
    studentId: studentProfile?.student_id || 'N/A',
    sectionDisplay: `${programCode || 'N/A'} ${studentProfile?.sections?.section_code || 'N/A'}`,
    emergencyContactName: studentProfile?.emergency_contact_name || 'N/A',
    emergencyContactPhone: studentProfile?.emergency_contact_phone || 'N/A',
    emergencyContactRelationship: studentProfile?.emergency_contact_relationship || 'N/A',
    year: year,
    major: programName,
    program: programName,
    programCode: programCode,
    degreeType: degreeType,
    academicStatus: studentProfile?.academic_status || 'active',
    enrollmentDate: studentProfile?.enrollment_date ? new Date(studentProfile.enrollment_date).toLocaleDateString() : 'N/A',
    expectedGraduation: studentProfile?.expected_graduation ? new Date(studentProfile.expected_graduation).toLocaleDateString() : 'N/A',
    gpa: studentProfile?.gpa || 0,
    totalCredits: totalCredits,
    creditsCompleted: studentProfile?.credits_completed || 0,
    creditsRequired: studentProfile?.credits_required || 0,
    completedCourses: studentCourses.filter((c: any) => c.status === 'completed').length,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    assignmentsSubmitted: 0,
    assignmentsPending: 0,
    courses: studentCourses,
    recentGrades: [],
    upcomingAssignments: [],
    attendanceHistory: studentAttendance.map((ar: any) => {
      const session = attendance.state.attendanceSessions?.find((s: any) => s.id === ar.session_id)
      const courseName = session?.course_name || session?.course_code || 'Unknown Course'
      
      return {
        course: courseName,
        session: session?.session_name || ar.session_id,
        date: ar.marked_at,
        status: ar.status as 'present' | 'absent' | 'late'
      }
    })
  }
}
