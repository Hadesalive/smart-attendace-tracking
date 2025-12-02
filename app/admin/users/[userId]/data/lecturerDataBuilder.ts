import { LecturerProfileWithUser } from "@/lib/types/joined-data"

export function buildLecturerData(userData: any, contexts: any) {
  const { academic, coursesHook, attendance, auth } = contexts
  
  const lecturerProfile = academic.state.lecturerProfiles.find((lp: any) => lp.user_id === userData.id)
  
  const lecturerAssignments = (coursesHook.state.lecturerAssignments as any[])?.filter((la: any) => 
    la.lecturer_id === userData.id
  ) || []

  let lecturerSessions = attendance.state.attendanceSessions?.filter((session: any) => 
    session.lecturer_id === userData.id
  ) || []

  if (lecturerSessions.length === 0) {
    const lecturerCourseIds = lecturerAssignments.map((la: any) => la.course_id)
    lecturerSessions = attendance.state.attendanceSessions?.filter((session: any) => 
      lecturerCourseIds.includes(session.course_id)
    ) || []
  }

  const lecturerCourses = lecturerAssignments.map((assignment: any) => {
    const course = coursesHook.state.courses.find((c: any) => c.id === assignment.course_id)
    const section = academic.state.sections.find((s: any) => s.id === assignment.section_id)
    const semester = academic.state.semesters.find((s: any) => s.id === assignment.semester_id)
    const academicYear = academic.state.academicYears.find((ay: any) => ay.id === assignment.academic_year_id)
    const program = academic.state.programs.find((p: any) => p.id === assignment.program_id)
    
    return {
      id: course?.id || '',
      name: course?.course_name?.trim() || 'Unknown Course',
      code: course?.course_code || 'N/A',
      credits: course?.credits || 0,
      students: 0,
      status: 'active' as 'active' | 'completed' | 'upcoming',
      section: section?.section_code || 'N/A',
      semester: semester?.semester_name || 'N/A',
      academicYear: academicYear?.year_name || 'N/A',
      program: program?.program_name || 'N/A',
      isPrimary: assignment.is_primary || false,
      teachingHours: assignment.teaching_hours_per_week || 0,
      startDate: assignment.start_date || null,
      endDate: assignment.end_date || null
    }
  })

  const uniqueCourses = lecturerCourses.reduce((acc: any[], course: any) => {
    const existing = acc.find((c: any) => c.id === course.id)
    if (existing) {
      existing.students += course.students
      if (!existing.sections) existing.sections = []
      existing.sections.push({
        section: course.section,
        semester: course.semester,
        academicYear: course.academicYear,
        program: course.program,
        isPrimary: course.isPrimary,
        teachingHours: course.teachingHours
      })
    } else {
      acc.push({
        ...course,
        sections: [{
          section: course.section,
          semester: course.semester,
          academicYear: course.academicYear,
          program: course.program,
          isPrimary: course.isPrimary,
          teachingHours: course.teachingHours
        }]
      })
    }
    return acc
  }, [])

  const lecturerSections = lecturerAssignments.map((assignment: any) => {
    const section = academic.state.sections.find((s: any) => s.id === assignment.section_id)
    return {
      ...assignment,
      section: section,
      programId: section?.program_id,
      semesterId: section?.semester_id,
      academicYearId: section?.academic_year_id
    }
  })

  const programSemesterStudents = academic.state.studentProfiles.filter((student: any) => {
    return lecturerSections.some((ls: any) => 
      student.program_id === ls.programId && 
      student.academic_year_id === ls.academicYearId
    )
  })

  const lecturerStudents = programSemesterStudents.filter((student: any) => {
    return lecturerSections.some((ls: any) => ls.section_id === student.section_id)
  })

  const totalStudents = lecturerStudents.length

  const finalCourses = uniqueCourses.map((course: any) => {
    const courseStudents = lecturerAssignments
      .filter((la: any) => la.course_id === course.id)
      .reduce((students: any[], assignment: any) => {
        const sectionStudents = lecturerStudents.filter((student: any) => 
          student.section_id === assignment.section_id
        )
        
        const studentDetails = sectionStudents.map((student: any) => {
          const user = auth.state.users.find((u: any) => u.id === student.user_id)
          const section = academic.state.sections.find((s: any) => s.id === student.section_id)
          
          const courseSessions = attendance.state.attendanceSessions?.filter((s: any) => 
            s.course_id === course.id && s.section_id === assignment.section_id
          ) || []
          
          const studentAttendanceRecords = attendance.state.attendanceRecords?.filter((ar: any) => 
            ar.student_id === student.user_id && 
            courseSessions.some((s: any) => s.id === ar.session_id)
          ) || []
          
          const totalSessions = courseSessions.length
          const attendedSessions = studentAttendanceRecords.filter((ar: any) => ar.status === 'present').length
          const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0
          
          return {
            id: student.user_id,
            name: user?.full_name || 'Unknown Student',
            email: user?.email || 'No email',
            studentId: student.student_id || 'N/A',
            section: section?.section_code || 'N/A',
            enrollmentDate: student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A',
            status: student.academic_status || 'active',
            attendanceRate: attendanceRate,
            sessionsAttended: attendedSessions,
            totalSessions: totalSessions
          }
        })
        return [...students, ...studentDetails]
      }, [])

    return {
      ...course,
      students: courseStudents.length,
      studentDetails: courseStudents
    }
  })

  const recentSessions = lecturerSessions.slice(0, 5).map((session: any) => {
    const course = coursesHook.state.courses.find((c: any) => c.id === session.course_id)
    const attendanceRecords = attendance.state.attendanceRecords?.filter((ar: any) => ar.session_id === session.id) || []
    const presentCount = attendanceRecords.filter((ar: any) => ar.status === 'present').length
    
    const sessionDate = session.session_date || session.created_at
    const formattedDate = sessionDate ? new Date(sessionDate).toLocaleDateString() : 'N/A'
    
    return {
      id: session.id,
      course: course?.course_name || 'Unknown Course',
      title: session.session_name || 'Session',
      date: formattedDate,
      attendance: presentCount,
      totalStudents: attendanceRecords.length
    }
  })

  const upcomingSessions = lecturerSessions
    .filter((session: any) => {
      const sessionDate = session.session_date || session.created_at
      return sessionDate && new Date(sessionDate) > new Date()
    })
    .slice(0, 5)
    .map((session: any) => {
      const course = coursesHook.state.courses.find((c: any) => c.id === session.course_id)
      const sessionDate = session.session_date || session.created_at
      const formattedDate = sessionDate ? new Date(sessionDate).toLocaleDateString() : 'N/A'
      
      return {
        id: session.id,
        course: course?.course_name || 'Unknown Course',
        title: session.session_name || 'Session',
        date: formattedDate,
        type: 'lecture' as 'lecture' | 'lab' | 'tutorial'
      }
    })

  const lecturerProfileWithUser = lecturerProfile as LecturerProfileWithUser
  const researchInterests = Array.isArray(lecturerProfileWithUser?.research_interests) 
    ? lecturerProfileWithUser.research_interests.join(', ')
    : lecturerProfileWithUser?.research_interests || 'Not specified'

  const qualifications = Array.isArray(lecturerProfileWithUser?.qualifications)
    ? lecturerProfileWithUser.qualifications.join(', ')
    : lecturerProfileWithUser?.qualifications || 'Not specified'

  return {
    role: userData.role || 'lecturer',
    department: lecturerProfileWithUser?.departments?.department_name || 'N/A',
    lastLogin: userData.updated_at ? new Date(userData.updated_at).toLocaleDateString() : new Date(userData.created_at).toLocaleDateString(),
    joinedDate: new Date(userData.created_at).toLocaleDateString(),
    bio: lecturerProfileWithUser?.bio || 'No bio provided',
    phone: 'Not provided',
    employeeId: lecturerProfile?.employee_id || 'N/A',
    specialization: lecturerProfileWithUser?.specialization || 'General',
    yearsExperience: (lecturerProfileWithUser as any)?.years_experience || 0,
    position: lecturerProfileWithUser?.position || 'Lecturer',
    hireDate: lecturerProfileWithUser?.hire_date ? new Date(lecturerProfileWithUser.hire_date).toLocaleDateString() : 'N/A',
    officeLocation: lecturerProfileWithUser?.office_location || 'Not assigned',
    officeHours: lecturerProfileWithUser?.office_hours || 'Not set',
    researchInterests: researchInterests,
    qualifications: qualifications,
    totalCourses: finalCourses.length,
    activeCourses: finalCourses.filter((c: any) => c.status === 'active').length,
    totalStudents: totalStudents,
    averageRating: 0,
    courses: finalCourses,
    recentSessions: recentSessions,
    upcomingSessions: upcomingSessions
  }
}
