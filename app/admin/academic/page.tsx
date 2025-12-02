"use client"
import React, { useMemo, useState, useEffect } from "react"
import { Box, Button, Typography } from "@mui/material"
import { PlusIcon, UserPlusIcon, BuildingOffice2Icon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { useAcademicStructure, useAuth, useCourses } from "@/lib/domains"
import { 
  CourseAssignmentWithJoins, 
  TransformedCourse,
  TransformedAssignment,
  TransformedEnrollment,
  SectionEnrollmentWithJoins
} from "@/lib/types/joined-data"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import DetailTabs from "@/components/admin/DetailTabs"
import ErrorAlert from "@/components/admin/ErrorAlert"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { 
  AcademicYearForm, 
  SemesterForm, 
  DepartmentForm, 
  ProgramForm, 
  ClassroomForm, 
  SectionForm,
  CourseForm,
  CourseAssignmentForm,
  TeacherAssignmentForm,
  EnrollmentForm,
  LecturerForm,
  StudentForm,
  AdminForm
} from "@/components/admin/forms"

// Tab components
import AcademicYearsTab from "./tabs/AcademicYearsTab"
import SemestersTab from "./tabs/SemestersTab"
import DepartmentsTab from "./tabs/DepartmentsTab"
import ProgramsTab from "./tabs/ProgramsTab"
import SectionsTab from "./tabs/SectionsTab"
import CoursesTab from "./tabs/CoursesTab"
import ClassroomsTab from "./tabs/ClassroomsTab"
import AssignmentsTab from "./tabs/AssignmentsTab"
import EnrollmentsTab from "./tabs/EnrollmentsTab"

// ============================================================================
// TYPES
// ============================================================================

type Year = 1 | 2 | 3 | 4

interface AcademicYearData {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
}

interface SemesterData {
  id: string
  semester_name: string
  semester_number: number
  start_date: string
  end_date: string
  is_current: boolean
}

interface DepartmentData {
  id: string
  department_name: string
  department_code: string
  description?: string
}

interface ProgramData {
  id: string
  program_name: string
  program_code: string
  degree_type: string
  duration_years: number
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState("academic-years")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    academicYears: { isCurrent: 'all' },
    semesters: { isCurrent: 'all', academicYear: 'all' },
    departments: { isActive: 'all' },
    programs: { isActive: 'all', department: 'all', degreeType: 'all' },
    sections: { isActive: 'all', program: 'all', year: 'all', semester: 'all', academicYear: 'all' },
    classrooms: { isActive: 'all', roomType: 'all', building: 'all', capacity: 'all' },
    assignments: { program: 'all', year: 'all', semester: 'all', academicYear: 'all' },
    courses: { assignmentStatus: 'all', lecturerStatus: 'all', department: 'all', program: 'all' },
    enrollments: { status: 'all', program: 'all', year: 'all', semester: 'all', academicYear: 'all' }
  })
  
  // Form state
  const [formState, setFormState] = useState<{
    type: string | null
    mode: 'create' | 'edit' | 'bulk' | null
    data: any
  }>({ type: null, mode: null, data: null })

  // Hooks
  const academic = useAcademicStructure()
  const auth = useAuth()
  const coursesHook = useCourses()
  
  const { state: academicState } = academic
  const { state: authState } = auth
  const { state: coursesState } = coursesHook
  
  const academicData = {
    academicYears: academicState.academicYears,
    semesters: academicState.semesters,
    departments: academicState.departments,
    programs: academicState.programs,
    classrooms: academicState.classrooms,
    sections: academicState.sections,
    studentProfiles: academicState.studentProfiles,
    lecturerProfiles: academicState.lecturerProfiles
  }

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          academic.fetchAcademicYears(),
          academic.fetchSemesters(),
          academic.fetchDepartments(),
          academic.fetchPrograms(),
          academic.fetchClassrooms(),
          academic.fetchSections(),
          academic.fetchSectionEnrollments(),
          academic.fetchStudentProfiles(),
          academic.fetchLecturerProfiles(),
          academic.fetchAdminProfiles(),
          coursesHook.fetchCourses(),
          coursesHook.fetchCourseAssignments(),
          auth.fetchUsers()
        ])
        
        const failures = results.filter(r => r.status === 'rejected')
        if (failures.length > 0) {
          console.error("Failed to load some data:", failures)
          setError('Some data failed to load')
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError('Failed to load data')
      }
    }
    
    loadData()
  }, [])

  // Transform data
  const sections = useMemo(() => {
    return academicData.sections.map(section => {
      const sectionWithJoins = section as any
      const actualEnrollmentCount = academicState.sectionEnrollments.filter(
        e => e.section_id === section.id && e.status === 'active'
      ).length
      
      return {
        id: section.id,
        section_code: section.section_code,
        year: section.year as Year,
        semester: sectionWithJoins.semesters?.semester_name || 'N/A',
        semester_number: sectionWithJoins.semesters?.semester_number || 0,
        program: sectionWithJoins.programs?.program_name || 'N/A',
        program_code: sectionWithJoins.programs?.program_code || 'N/A',
        department: sectionWithJoins.programs?.departments?.department_name || 'N/A',
        department_code: sectionWithJoins.programs?.departments?.department_code || 'N/A',
        academic_year: sectionWithJoins.academic_years?.year_name || 'N/A',
        max_capacity: section.max_capacity || 0,
        current_enrollment: actualEnrollmentCount,
        classroom: sectionWithJoins.classrooms ? 
          `${sectionWithJoins.classrooms.building} - ${sectionWithJoins.classrooms.room_number}` : 'Not assigned',
        is_active: section.is_active ?? true,
        program_id: section.program_id,
        semester_id: section.semester_id,
        academic_year_id: section.academic_year_id
      }
    })
  }, [academicData.sections, academicState.sectionEnrollments])

  const courses = useMemo((): TransformedCourse[] => {
    return coursesState.courses.map(course => ({
      id: course.id,
      code: course.course_code,
      name: course.course_name,
      program: course.department || 'BSEM',
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      department: course.department || 'N/A',
      lecturer_id: course.lecturer_id
    }))
  }, [coursesState.courses])

  const classrooms = useMemo(() => {
    return academicData.classrooms.map(classroom => ({
      id: classroom.id,
      building: classroom.building,
      room: classroom.room_number,
      capacity: classroom.capacity,
      is_active: classroom.is_active ?? true,
      room_type: (classroom as any).room_type || 'Lecture',
      description: classroom.description || ''
    }))
  }, [academicData.classrooms])

  const assignments = useMemo((): TransformedAssignment[] => {
    return coursesState.courseAssignments.map(assignment => {
      const course = coursesState.courses.find(c => c.id === assignment.course_id)
      const assignmentWithJoins = assignment as CourseAssignmentWithJoins
      const program = academicData.programs.find(p => p.id === assignmentWithJoins.program_id)
      const academicYear = academicData.academicYears.find(ay => ay.id === assignment.academic_year_id)
      const semester = academicData.semesters.find(s => s.id === assignment.semester_id)
      
      return {
        id: assignment.id,
        course_id: assignment.course_id,
        course_code: course?.course_code || 'N/A',
        course_name: course?.course_name || 'N/A',
        program: program?.program_name || 'N/A',
        program_code: program?.program_code || 'N/A',
        academic_year: academicYear?.year_name || 'N/A',
        semester: semester?.semester_name || 'N/A',
        semester_number: semester?.semester_number || 0,
        year: assignmentWithJoins.year || 1,
        is_mandatory: assignment.is_mandatory || false,
        max_students: assignment.max_students || null,
        program_id: assignmentWithJoins.program_id || '',
        semester_id: assignment.semester_id,
        academic_year_id: assignment.academic_year_id
      }
    })
  }, [coursesState.courseAssignments, coursesState.courses, academicData.programs, academicData.academicYears, academicData.semesters])

  const enrollments = useMemo((): TransformedEnrollment[] => {
    const studentEnrollments = new Map<string, TransformedEnrollment>()
    
    academicState.sectionEnrollments.forEach(enrollment => {
      const enrollmentWithJoins = enrollment as SectionEnrollmentWithJoins
      const studentKey = `${enrollment.student_id}-${enrollmentWithJoins.program_id}-${enrollmentWithJoins.semester_id}-${enrollmentWithJoins.academic_year_id}`
      
      if (!studentEnrollments.has(studentKey)) {
        const assignedCourses = coursesState.courseAssignments?.filter(assignment => 
          assignment.program_id === enrollment.program_id &&
          assignment.semester_id === enrollment.semester_id &&
          assignment.academic_year_id === enrollment.academic_year_id &&
          assignment.year === enrollment.year
        ) || []
        
        const studentProfile = academicState.studentProfiles?.find(sp => sp.user_id === enrollment.student_id)
        
        studentEnrollments.set(studentKey, {
          id: enrollment.id,
          student_name: enrollment.student_name || 'N/A',
          student_id_number: studentProfile?.student_id || enrollmentWithJoins.users?.student_id || enrollment.student_id_number || 'N/A',
          program: enrollment.program_name || 'N/A',
          program_code: enrollment.program_code || 'N/A',
          year: enrollment.year || 'N/A',
          semester: enrollment.semester_name || 'N/A',
          academic_year: enrollment.academic_year || 'N/A',
          enrollment_date: enrollment.enrollment_date,
          status: enrollment.status,
          inherited_courses: assignedCourses.map(assignment => {
            const assignmentWithJoins = assignment as CourseAssignmentWithJoins
            return {
              course_code: assignmentWithJoins.courses?.course_code || 'N/A',
              course_name: assignmentWithJoins.courses?.course_name || 'N/A',
              credits: assignmentWithJoins.courses?.credits || 0,
            is_mandatory: assignment.is_mandatory
            }
          }),
          course_count: assignedCourses.length,
          sections: [],
          section_count: 0,
          courses_display: '',
          student_id: enrollment.student_id,
          program_id: enrollmentWithJoins.program_id || '',
          semester_id: enrollmentWithJoins.semester_id || '',
          academic_year_id: enrollmentWithJoins.academic_year_id || ''
        })
      }
      
      const studentEnrollment = studentEnrollments.get(studentKey)
      if (studentEnrollment && enrollment.section_code) {
        studentEnrollment.sections.push(enrollment.section_code)
      }
    })
    
    return Array.from(studentEnrollments.values()).map(enrollment => ({
      ...enrollment,
      section: enrollment.sections.length > 0 
        ? enrollment.sections.length === 1 
          ? enrollment.sections[0]
          : `${enrollment.sections[0]} (+${enrollment.sections.length - 1} more)`
        : 'N/A',
      section_count: enrollment.sections.length,
      courses_display: enrollment.inherited_courses.length > 0
        ? enrollment.inherited_courses.length === 1
          ? `${enrollment.inherited_courses[0].course_code} (${enrollment.inherited_courses[0].credits}cr)`
          : `${enrollment.inherited_courses[0].course_code} (+${enrollment.inherited_courses.length - 1} more)`
        : 'No courses assigned'
    }))
  }, [academicState.sectionEnrollments, coursesState.courseAssignments, academicState.studentProfiles])

  // Stats
  const statsCards = useMemo(() => ([
    { title: "Academic Years", value: academicData.academicYears.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Active years", change: "Current: 2024-2025" },
    { title: "Semesters", value: academicData.semesters.length, icon: ArrowPathIcon, color: "#000000", subtitle: "Total semesters", change: "Fall & Spring" },
    { title: "Departments", value: academicData.departments.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Active departments", change: "CS, BSEM, MT" },
    { title: "Programs", value: academicData.programs.length, icon: UserPlusIcon, color: "#000000", subtitle: "Degree programs", change: "Bachelor programs" },
  ]), [academicData.academicYears.length, academicData.semesters.length, academicData.departments.length, academicData.programs.length])

  // Columns
  const sectionColumns = [
    { key: "section_code", label: "Section Code" },
    { key: "department_code", label: "Faculty" },
    { key: "program_code", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "academic_year", label: "Academic Year" },
    { key: "current_enrollment", label: "Enrolled" },
    { key: "max_capacity", label: "Capacity" },
    { key: "classroom", label: "Classroom" },
    { key: "is_active", label: "Status" },
  ]

  const courseColumns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "program", label: "Department" },
  ]

  const classroomColumns = [
    { key: "building", label: "Building" },
    { key: "room", label: "Room" },
    { key: "capacity", label: "Capacity" },
  ]

  const assignmentColumns = [
    { key: "course_code", label: "Course Code" },
    { key: "course_name", label: "Course Name" },
    { key: "program_code", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "academic_year", label: "Academic Year" },
    { key: "is_mandatory", label: "Mandatory" },
  ]

  const enrollmentColumns = [
    { key: "student_name", label: "Student" },
    { key: "student_id_number", label: "Student ID" },
    { key: "program_code", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "academic_year", label: "Academic Year" },
    { key: "section", label: "Sections" },
    { key: "enrollment_date", label: "Enrolled" },
    { key: "status", label: "Status" },
  ]

  // Filtered data
  const filteredAcademicYears = useMemo(() => {
    let filtered = academicData.academicYears
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(year => 
        year.year_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.academicYears.isCurrent !== 'all') {
      filtered = filtered.filter(year => 
        filters.academicYears.isCurrent === 'current' ? year.is_current : !year.is_current
      )
    }
    
    return filtered
  }, [academicData.academicYears, searchTerm, filters.academicYears])

  const filteredSemesters = useMemo(() => {
    let filtered = academicData.semesters
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(sem => 
        sem.semester_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.semesters.isCurrent !== 'all') {
      filtered = filtered.filter(sem => 
        filters.semesters.isCurrent === 'current' ? sem.is_current : !sem.is_current
      )
    }
    
    if (filters.semesters.academicYear !== 'all') {
      filtered = filtered.filter(sem => sem.academic_year_id === filters.semesters.academicYear)
    }
    
    return filtered
  }, [academicData.semesters, searchTerm, filters.semesters])

  const filteredDepartments = useMemo(() => {
    let filtered = academicData.departments
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(dept => 
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.department_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }, [academicData.departments, searchTerm])

  const filteredPrograms = useMemo(() => {
    let filtered = academicData.programs
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(prog => 
        prog.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.program_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.programs.department !== 'all') {
      filtered = filtered.filter(prog => prog.department_id === filters.programs.department)
    }
    
    if (filters.programs.degreeType !== 'all') {
      filtered = filtered.filter(prog => prog.degree_type === filters.programs.degreeType)
    }
    
    return filtered
  }, [academicData.programs, searchTerm, filters.programs])

  const filteredSections = useMemo(() => {
    let filtered = sections
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(sec => 
        sec.section_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.sections.program !== 'all') {
      filtered = filtered.filter(sec => sec.program_id === filters.sections.program)
    }
    
    if (filters.sections.year !== 'all') {
      filtered = filtered.filter(sec => sec.year.toString() === filters.sections.year)
    }
    
    if (filters.sections.semester !== 'all') {
      filtered = filtered.filter(sec => sec.semester_id === filters.sections.semester)
    }
    
    if (filters.sections.academicYear !== 'all') {
      filtered = filtered.filter(sec => sec.academic_year_id === filters.sections.academicYear)
    }
    
    return filtered
  }, [sections, searchTerm, filters.sections])

  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(course => 
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.courses.department !== 'all') {
      filtered = filtered.filter(course => course.department === filters.courses.department)
    }
    
    if (filters.courses.program !== 'all') {
      const courseIds = coursesState.courseAssignments
        .filter(ca => ca.program_id === filters.courses.program)
        .map(ca => ca.course_id)
      filtered = filtered.filter(course => courseIds.includes(course.id))
    }
    
    if (filters.courses.assignmentStatus === 'assigned') {
      const assignedCourseIds = new Set(coursesState.courseAssignments.map(ca => ca.course_id))
      filtered = filtered.filter(course => assignedCourseIds.has(course.id))
    } else if (filters.courses.assignmentStatus === 'unassigned') {
      const assignedCourseIds = new Set(coursesState.courseAssignments.map(ca => ca.course_id))
      filtered = filtered.filter(course => !assignedCourseIds.has(course.id))
    }
    
    return filtered
  }, [courses, searchTerm, filters.courses, coursesState.courseAssignments])

  const filteredRooms = useMemo(() => {
    let filtered = classrooms
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(room => 
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room.toLowerCase().includes(searchTerm.toLowerCase())
    )
    }
    
    if (filters.classrooms.building !== 'all') {
      filtered = filtered.filter(room => room.building === filters.classrooms.building)
    }
    
    if (filters.classrooms.capacity !== 'all') {
      filtered = filtered.filter(room => {
        const cap = room.capacity
        switch (filters.classrooms.capacity) {
          case 'small': return cap <= 30
          case 'medium': return cap > 30 && cap <= 60
          case 'large': return cap > 60 && cap <= 100
          case 'xlarge': return cap > 100
          default: return true
        }
      })
    }
    
    return filtered
  }, [classrooms, searchTerm, filters.classrooms])

  const filteredAssignments = useMemo(() => {
    let filtered = assignments
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(assign => 
        assign.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assign.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.assignments.program !== 'all') {
      filtered = filtered.filter(assign => assign.program_id === filters.assignments.program)
    }
    
    if (filters.assignments.year !== 'all') {
      filtered = filtered.filter(assign => assign.year.toString() === filters.assignments.year)
    }
    
    if (filters.assignments.semester !== 'all') {
      filtered = filtered.filter(assign => assign.semester_id === filters.assignments.semester)
    }
    
    if (filters.assignments.academicYear !== 'all') {
      filtered = filtered.filter(assign => assign.academic_year_id === filters.assignments.academicYear)
    }
    
    return filtered
  }, [assignments, searchTerm, filters.assignments])

  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(enroll => 
        enroll.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enroll.student_id_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.enrollments.status !== 'all') {
      filtered = filtered.filter(enroll => enroll.status === filters.enrollments.status)
    }
    
    if (filters.enrollments.program !== 'all') {
      filtered = filtered.filter(enroll => enroll.program_id === filters.enrollments.program)
    }
    
    if (filters.enrollments.year !== 'all') {
      filtered = filtered.filter(enroll => enroll.year.toString() === filters.enrollments.year)
    }
    
    if (filters.enrollments.semester !== 'all') {
      filtered = filtered.filter(enroll => enroll.semester_id === filters.enrollments.semester)
    }
    
    if (filters.enrollments.academicYear !== 'all') {
      filtered = filtered.filter(enroll => enroll.academic_year_id === filters.enrollments.academicYear)
    }
    
    return filtered
  }, [enrollments, searchTerm, filters.enrollments])

  // Form handlers
  const openForm = (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => {
    setFormState({ type, mode, data: data || null })
  }

  const closeForm = () => {
    setFormState({ type: null, mode: null, data: null })
  }

  const handleSave = async (data: any) => {
    try {
      const type = formState.type
      const mode = formState.mode
      
      if (type === 'academic-year') {
        if (mode === 'create') await academic.createAcademicYear(data)
        else if (mode === 'edit') await academic.updateAcademicYear(data.id, data)
      } else if (type === 'semester') {
        if (mode === 'create') await academic.createSemester(data)
        else if (mode === 'edit') await academic.updateSemester(data.id, data)
      } else if (type === 'department') {
        if (mode === 'create') await academic.createDepartment(data)
        else if (mode === 'edit') await academic.updateDepartment(data.id, data)
      } else if (type === 'program') {
        if (mode === 'create') await academic.createProgram(data)
        else if (mode === 'edit') await academic.updateProgram(data.id, data)
      } else if (type === 'classroom') {
        if (mode === 'create') await academic.createClassroom(data)
        else if (mode === 'edit') await academic.updateClassroom(data.id, data)
      } else if (type === 'section') {
        if (mode === 'create') await academic.createSection(data)
        else if (mode === 'edit') await academic.updateSection(data.id, data)
      } else if (type === 'course') {
        if (mode === 'create') await coursesHook.createCourse(data)
        else if (mode === 'edit') await coursesHook.updateCourse(data.id, data)
      } else if (type === 'course-assignment') {
        if (mode === 'create') await coursesHook.createCourseAssignment(data)
        else if (mode === 'edit') await coursesHook.updateCourseAssignment(data.id, data)
      } else if (type === 'lecturer' || type === 'student' || type === 'admin') {
        if (mode === 'create') await auth.createUser(data)
        else if (mode === 'edit') await auth.updateUser(data.id, data)
      }
      
        closeForm()
      
      // Refresh data
      await Promise.allSettled([
        academic.fetchAcademicYears(),
        academic.fetchSemesters(),
        academic.fetchDepartments(),
        academic.fetchPrograms(),
        academic.fetchClassrooms(),
        academic.fetchSections(),
        academic.fetchSectionEnrollments(),
        coursesHook.fetchCourses(),
        coursesHook.fetchCourseAssignments(),
        auth.fetchUsers()
            ])
          } catch (error) {
      console.error("Failed to save:", error)
      setError('Failed to save')
    }
  }

  const handleDelete = async (type: string, id: string) => {
    try {
      if (type === 'academic-year') await academic.deleteAcademicYear(id)
      else if (type === 'semester') await academic.deleteSemester(id)
      else if (type === 'department') await academic.deleteDepartment(id)
      else if (type === 'program') await academic.deleteProgram(id)
      else if (type === 'classroom') await academic.deleteClassroom(id)
      else if (type === 'section') await academic.deleteSection(id)
      else if (type === 'course') await coursesHook.deleteCourse(id)
      else if (type === 'course-assignment') await coursesHook.deleteCourseAssignment(id)
      
      // Refresh data
      await Promise.allSettled([
        academic.fetchAcademicYears(),
        academic.fetchSemesters(),
        academic.fetchDepartments(),
        academic.fetchPrograms(),
        academic.fetchClassrooms(),
        academic.fetchSections(),
        academic.fetchSectionEnrollments(),
        coursesHook.fetchCourses(),
        coursesHook.fetchCourseAssignments()
      ])
    } catch (error) {
      console.error("Failed to delete:", error)
      setError('Failed to delete')
    }
  }

  // Tabs configuration
  const tabs = [
    {
      label: "Academic Years",
      value: "academic-years",
      content: (
        <AcademicYearsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredAcademicYears={filteredAcademicYears}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Semesters",
      value: "semesters",
      content: (
        <SemestersTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredSemesters={filteredSemesters}
          academicYears={academicData.academicYears}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Departments",
      value: "departments",
      content: (
        <DepartmentsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredDepartments={filteredDepartments}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Programs",
      value: "programs",
      content: (
        <ProgramsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredPrograms={filteredPrograms}
          departments={academicData.departments}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Sections",
      value: "sections",
      content: (
        <SectionsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredSections={filteredSections}
          programs={academicData.programs}
          semesters={academicData.semesters}
          academicYears={academicData.academicYears}
          sections={academicData.sections}
          sectionColumns={sectionColumns}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Courses",
      value: "courses",
      content: (
        <CoursesTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredCourses={filteredCourses}
          departments={academicData.departments}
          programs={academicData.programs}
          courses={coursesState.courses}
          courseColumns={courseColumns}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Classrooms",
      value: "classrooms",
      content: (
        <ClassroomsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredRooms={filteredRooms}
          classrooms={academicData.classrooms}
          classroomColumns={classroomColumns}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Assignments",
      value: "assignments",
      content: (
        <AssignmentsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredAssignments={filteredAssignments}
          programs={academicData.programs}
          semesters={academicData.semesters}
          academicYears={academicData.academicYears}
          courseAssignments={coursesState.courseAssignments}
          assignmentColumns={assignmentColumns}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    },
    {
      label: "Enrollments",
      value: "enrollments",
      content: (
        <EnrollmentsTab
          filters={filters}
          setFilters={setFilters}
            searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEnrollments={filteredEnrollments}
          programs={academicData.programs}
          semesters={academicData.semesters}
          academicYears={academicData.academicYears}
          sectionEnrollments={academicState.sectionEnrollments}
          enrollmentColumns={enrollmentColumns}
          openForm={openForm}
          handleDelete={handleDelete}
        />
      )
    }
  ]

  // Loading state
  if (academicState.loading || authState.loading || coursesState.loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Academic Structure Management"
          subtitle="Manage academic years, semesters, departments, programs, sections, and classrooms"
          actions={null}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography variant="body1">Loading academic data...</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Academic Structure Management"
        subtitle="Manage academic years, semesters, departments, programs, sections, and classrooms"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<UserPlusIcon className="h-4 w-4" />}
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('admin', 'create')}
            >
              Create Admin
            </Button>
            <Button
              variant="outlined"
              startIcon={<UserPlusIcon className="h-4 w-4" />}
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('lecturer', 'create')}
            >
              Create Lecturer
            </Button>
            <Button
              variant="outlined"
              startIcon={<UserPlusIcon className="h-4 w-4" />}
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('student', 'create')}
            >
              Create Student
            </Button>
          </Box>
        }
      />

      <StatsGrid stats={statsCards} />

      {error && (
        <Box sx={{ mt: 3 }}>
          <ErrorAlert error={error} onRetry={() => setError(null)} />
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <DetailTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Box>

      {/* Forms */}
      {formState.type === 'academic-year' && (
        <AcademicYearForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          academicYear={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'semester' && (
        <SemesterForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          semester={formState.data as any}
          academicYears={academicData.academicYears}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'department' && (
        <DepartmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          department={formState.data as any}
          users={authState.users}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'program' && (
        <ProgramForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          program={formState.data as any}
          departments={academicData.departments}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'classroom' && (
        <ClassroomForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          classroom={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'section' && (
        <SectionForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          section={formState.data as any}
          programs={academicData.programs}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          classrooms={academicData.classrooms}
          onSave={handleSave as any}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'course' && (
        <CourseForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          course={formState.data as any}
          users={authState.users}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'course-assignment' && (
        <CourseAssignmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          assignment={formState.data as any}
          courses={coursesState.courses}
          programs={academicData.programs}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'teacher-assignment' && (
        <TeacherAssignmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          assignment={formState.data as any}
          courses={coursesState.courses}
          sections={academicData.sections}
          lecturers={academicData.lecturerProfiles}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'enrollment' && (
        <EnrollmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          enrollment={formState.data as any}
          students={academicData.studentProfiles}
          sections={academicData.sections}
          onSave={handleSave as any}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'lecturer' && (
        <LecturerForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          lecturer={formState.data as any}
          departments={academicData.departments}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'student' && (
        <StudentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          student={formState.data as any}
          programs={academicData.programs}
          sections={academicData.sections}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}

      {formState.type === 'admin' && (
        <AdminForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          admin={formState.data as any}
          departments={academicData.departments}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
        />
      )}
    </Box>
  )
}
