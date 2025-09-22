"use client"
import React, { useMemo, useState, useEffect } from "react"
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography } from "@mui/material"
import { PlusIcon, UserPlusIcon, BuildingOffice2Icon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { useAcademicStructure, useAuth, useCourses } from "@/lib/domains"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import SearchFilters from "@/components/admin/SearchFilters"
import FilterBar from "@/components/admin/FilterBar"
import DataTable from "@/components/admin/DataTable"
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

// ============================================================================
// TYPES (MVP)
// ============================================================================

type Year = 1 | 2 | 3 | 4
type Semester = 1 | 2

interface Course { id: string; code: string; name: string; program: string }
interface Classroom { id: string; building: string; room: string; capacity?: number }
interface ClassKey { year: Year; semester: Semester; program: string; section: string }
interface ClassRow extends ClassKey { id: string; size: number }

interface CourseAssignment { id: string; course_id: string; year: Year; semester: Semester; program: string }
interface TeacherAssignment {
  id: string
  teacher_id: string
  teacher_name: string
  course_id: string
  course_code: string
  year: Year
  semester: Semester
  program: string
  section: string
}

// Form data types
interface FormData {
  id?: string
  name?: string
  code?: string
  year?: number
  semester?: number
  program?: string
  section?: string
  building?: string
  room?: string
  capacity?: number
  teacher_id?: string
  course_id?: string
  student_id?: string
  [key: string]: unknown
}

// Table data types
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
  academic_year_id: string
  start_date: string
  end_date: string
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
  department_id: string
  duration_years: number
}

interface ClassroomData {
  id: string
  classroom_name: string
  building: string
  room_number: string
  capacity: number
}

interface SectionData {
  id: string
  section_code: string
  program_id: string
  academic_year_id: string
  semester_id: string
  max_students: number
}

interface Enrollment { id: string; student_id: string; student_name: string; year: Year; semester: Semester; program: string; section: string }

// ============================================================================
// MOCK DATA (placeholder until API wiring)
// ============================================================================

const mockCourses: Course[] = [
  { id: "c1", code: "BSEM2101", name: "Business Essentials I", program: "BSEM" },
  { id: "c2", code: "BSEM2102", name: "Business Essentials II", program: "BSEM" },
]

const mockClassrooms: Classroom[] = [
  { id: "r1", building: "Main Block", room: "MB-101", capacity: 60 },
  { id: "r2", building: "Science Wing", room: "SW-204", capacity: 45 },
]

const mockClasses: ClassRow[] = [
  { id: "cl1", year: 1, semester: 2, program: "BSEM", section: "2101", size: 52 },
  { id: "cl2", year: 1, semester: 2, program: "BSEM", section: "2102", size: 49 },
]

const mockAssignments: TeacherAssignment[] = [
  { id: "t1", teacher_id: "t-001", teacher_name: "Dr. A. Mensah", course_id: "c1", course_code: "BSEM2101", year: 1, semester: 2, program: "BSEM", section: "2101" },
  { id: "t2", teacher_id: "t-002", teacher_name: "Dr. J. Smith", course_id: "c1", course_code: "BSEM2101", year: 1, semester: 2, program: "BSEM", section: "2102" },
]

const mockEnrollments: Enrollment[] = [
  { id: "e1", student_id: "s-1001", student_name: "Jane Doe", year: 1, semester: 2, program: "BSEM", section: "2101" },
  { id: "e2", student_id: "s-1002", student_name: "John Doe", year: 1, semester: 2, program: "BSEM", section: "2102" },
]

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AcademicHubPage() {
  const [activeTab, setActiveTab] = useState("academic-years")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  // Filter states for each tab
  const [filters, setFilters] = useState({
    academicYears: {
      isCurrent: 'all' // all, current, past
    },
    semesters: {
      isCurrent: 'all', // all, current, past
      academicYear: 'all'
    },
    departments: {
      isActive: 'all' // all, active, inactive
    },
    programs: {
      isActive: 'all', // all, active, inactive
      department: 'all',
      degreeType: 'all'
    },
    sections: {
      isActive: 'all', // all, active, inactive
      program: 'all',
      year: 'all',
      semester: 'all',
      academicYear: 'all'
    },
    classrooms: {
      isActive: 'all', // all, active, inactive
      roomType: 'all',
      building: 'all',
      capacity: 'all' // all, small, medium, large, xlarge
    },
    assignments: {
      program: 'all',
      year: 'all',
      semester: 'all',
      academicYear: 'all'
    },
    courses: {
      assignmentStatus: 'all', // all, assigned, unassigned
      lecturerStatus: 'all', // all, assigned, unassigned
      department: 'all', // all, specific department
      program: 'all' // all, specific program
    },
    enrollments: {
      status: 'all', // all, active, dropped, completed
      program: 'all',
      year: 'all',
      semester: 'all',
      academicYear: 'all'
    }
  })
  
  // Form states
  const [formState, setFormState] = useState<{
    type: string | null
    mode: 'create' | 'edit' | 'bulk' | null
    data: any
  }>({
    type: null,
    mode: null,
    data: null
  })

  // Data Context
  const academic = useAcademicStructure()
  const auth = useAuth()
  const coursesHook = useCourses()
  
  // Extract state and methods
  const { 
    state: academicState,
    fetchAcademicYears,
    fetchSemesters,
    fetchDepartments,
    fetchPrograms,
    fetchClassrooms,
    fetchSections,
    fetchSectionEnrollments,
    fetchStudentProfiles,
    fetchLecturerProfiles,
    fetchAdminProfiles,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    createSemester,
    updateSemester,
    deleteSemester,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createProgram,
    updateProgram,
    deleteProgram,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    createSection,
    updateSection,
    deleteSection
  } = academic
  
  const { 
    state: authState,
    fetchUsers,
    createUser,
    updateUser
  } = auth
  
  const { 
    state: coursesState,
    fetchCourses,
    fetchCourseAssignments,
    createCourse,
    updateCourse,
    deleteCourse,
    createCourseAssignment,
    updateCourseAssignment,
    deleteCourseAssignment
  } = coursesHook
  
  // Create legacy state object for compatibility
  const state = {
    ...academicState,
    ...authState,
    ...coursesState,
    students: authState.users?.filter(user => user.role === 'student') || [],
    semesters: academicState.semesters,
    programs: academicState.programs
  }
  
  

  // Academic data from DataContext
  const academicData = {
    academicYears: state.academicYears,
    semesters: state.semesters,
    departments: state.departments,
    programs: state.programs,
    classrooms: state.classrooms,
    sections: state.sections,
    studentProfiles: state.studentProfiles,
    lecturerProfiles: state.lecturerProfiles,
    adminProfiles: state.adminProfiles
  }

  // Fetch academic data on component mount
  useEffect(() => {
    console.log("🚀 Academic page useEffect called - loading data...")
    const loadAcademicData = async () => {
      try {
        console.log("📡 Starting to fetch all academic data...")
        await Promise.all([
          fetchAcademicYears(),
          fetchSemesters(),
          fetchDepartments(),
          fetchPrograms(),
          fetchClassrooms(),
          fetchSections(),
          fetchSectionEnrollments(),
          fetchStudentProfiles(),
          fetchLecturerProfiles(),
          fetchAdminProfiles(),
          fetchCourses(),
          fetchUsers()
        ])
        console.log("✅ All academic data loaded successfully")
      } catch (error) {
        console.error("❌ Error loading academic data:", error)
        setError('Failed to load academic data')
      }
    }
    
    loadAcademicData()
  }, []) // Empty dependency array - only run once on mount

  // Get sections data from database with proper joins
  const sections = useMemo(() => {
    return academicData.sections.map(section => {
      const sectionWithJoins = section as any // Type assertion for joined data
      
      
      // Calculate actual enrollment count from section enrollments
      const actualEnrollmentCount = academicState.sectionEnrollments.filter(
        enrollment => enrollment.section_id === section.id && enrollment.status === 'active'
      ).length
      
      return {
        id: section.id,
        section_code: section.section_code,
        year: section.year as Year,
        semester: sectionWithJoins.semesters?.semester_name || 'N/A',
        semester_number: sectionWithJoins.semesters?.semester_number || 0,
        program: sectionWithJoins.programs?.program_name || 'N/A',
        program_code: sectionWithJoins.programs?.program_code || 'N/A',
        department: sectionWithJoins.programs?.departments?.department_name || 
                   academicData.departments.find(d => d.id === sectionWithJoins.programs?.department_id)?.department_name || 
                   'N/A',
        academic_year: sectionWithJoins.academic_years?.year_name || 'N/A',
        max_capacity: section.max_capacity || 0,
        current_enrollment: actualEnrollmentCount, // Use calculated enrollment count
        classroom: sectionWithJoins.classrooms ? 
          `${sectionWithJoins.classrooms.building} - ${sectionWithJoins.classrooms.room_number}` : 'Not assigned',
        is_active: section.is_active ?? true,
        // Add ID properties for filtering
        program_id: section.program_id,
        semester_id: section.semester_id,
        academic_year_id: section.academic_year_id
      }
    })
  }, [academicData.sections, academicState.sectionEnrollments])

  const courses = useMemo(() => {
    return state.courses.map(course => ({
      id: course.id,
      code: course.course_code,
      name: course.course_name,
      program: course.department || 'BSEM',
      // Keep original course data for forms
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      department: course.department,
      lecturer_id: course.lecturer_id
    }))
  }, [state.courses])

  const classrooms = useMemo(() => {
    return academicData.classrooms.map(classroom => ({
      id: classroom.id,
      building: classroom.building,
      room: classroom.room_number,
      capacity: classroom.capacity,
      is_active: classroom.is_active ?? true,
      // Add properties for filtering
      room_type: (classroom as any).room_type || 'Lecture', // Default to Lecture if not specified
      description: classroom.description || ''
    }))
  }, [academicData.classrooms])

  const assignments = useMemo(() => {
    // Get course assignments from DataContext
    return state.courseAssignments.map(assignment => {
      const course = state.courses.find(c => c.id === assignment.course_id)
      const program = academicData.programs.find(p => p.id === (assignment as any).program_id)
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
        year: (assignment as any).year || 1,
        is_mandatory: assignment.is_mandatory || false,
        max_students: assignment.max_students || null,
        // Add ID properties for filtering
        program_id: (assignment as any).program_id,
        semester_id: assignment.semester_id,
        academic_year_id: assignment.academic_year_id
      }
    })
  }, [state.courseAssignments, state.courses, academicData.programs, academicData.academicYears, academicData.semesters])

  const enrollments = useMemo(() => {
    // Group enrollments by student-program-semester to show inheritance-based enrollment
    const studentEnrollments = new Map()
    
    academicState.sectionEnrollments.forEach(enrollment => {
      const studentKey = `${enrollment.student_id}-${enrollment.program_id}-${enrollment.semester_id}-${enrollment.academic_year_id}`
      
      if (!studentEnrollments.has(studentKey)) {
        // Get courses assigned to this program/semester/year combination
        const assignedCourses = state.courseAssignments?.filter((assignment: any) => 
          assignment.program_id === enrollment.program_id &&
          assignment.semester_id === enrollment.semester_id &&
          assignment.academic_year_id === enrollment.academic_year_id &&
          assignment.year === enrollment.year
        ) || []
        
        // Debug logging for first enrollment
        if (studentEnrollments.size === 0) {
          console.log('🔍 Debug for first enrollment:')
          console.log('Enrollment data:', enrollment)
          console.log('Looking for courses with:', {
            program_id: enrollment.program_id,
            semester_id: enrollment.semester_id,
            academic_year_id: enrollment.academic_year_id,
            year: enrollment.year
          })
          console.log('Available course assignments:', state.courseAssignments?.length || 0)
          console.log('Matching courses:', assignedCourses.length)
          console.log('Courses found:', assignedCourses)
        }
        
        studentEnrollments.set(studentKey, {
          id: enrollment.id,
          student_name: enrollment.student_name || 'N/A',
          student_id_number: enrollment.student_id_number || 'N/A',
          program: enrollment.program_name || 'N/A',
          program_code: enrollment.program_code || 'N/A',
          year: enrollment.year || 'N/A',
          semester: enrollment.semester_name || 'N/A',
          academic_year: enrollment.academic_year || 'N/A',
          enrollment_date: enrollment.enrollment_date,
          status: enrollment.status,
          // Show inherited courses from program assignment
          inherited_courses: assignedCourses.map((assignment: any) => ({
            course_code: assignment.courses?.course_code || 'N/A',
            course_name: assignment.courses?.course_name || 'N/A',
            credits: assignment.courses?.credits || 0,
            is_mandatory: assignment.is_mandatory
          })),
          course_count: assignedCourses.length,
          // Show all sections for this student in this program/semester
          sections: [],
          // Add ID properties for filtering
          student_id: enrollment.student_id,
          program_id: enrollment.program_id,
          semester_id: enrollment.semester_id,
          academic_year_id: enrollment.academic_year_id
        })
      }
      
      // Add section to the sections array
      const studentEnrollment = studentEnrollments.get(studentKey)
      if (enrollment.section_code) {
        studentEnrollment.sections.push(enrollment.section_code)
      }
    })
    
    // Convert to array and format display
    return Array.from(studentEnrollments.values()).map(enrollment => ({
      ...enrollment,
      section: enrollment.sections.length > 0 
        ? enrollment.sections.length === 1 
          ? enrollment.sections[0]
          : `${enrollment.sections[0]} (+${enrollment.sections.length - 1} more)`
        : 'N/A',
      section_count: enrollment.sections.length,
      // Format inherited courses for display
      courses_display: enrollment.inherited_courses.length > 0
        ? enrollment.inherited_courses.length === 1
          ? `${enrollment.inherited_courses[0].course_code} (${enrollment.inherited_courses[0].credits}cr)`
          : `${enrollment.inherited_courses[0].course_code} (+${enrollment.inherited_courses.length - 1} more)`
        : 'No courses assigned'
    }))
  }, [academicState.sectionEnrollments, state.courseAssignments])

  // KPI stats from academic data
  const statsCards = useMemo(() => ([
    { title: "Academic Years", value: academicData.academicYears.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Active years", change: "Current: 2024-2025" },
    { title: "Semesters", value: academicData.semesters.length, icon: ArrowPathIcon, color: "#000000", subtitle: "Total semesters", change: "Fall & Spring" },
    { title: "Departments", value: academicData.departments.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Active departments", change: "CS, BSEM, MT" },
    { title: "Programs", value: academicData.programs.length, icon: UserPlusIcon, color: "#000000", subtitle: "Degree programs", change: "Bachelor programs" },
  ]), [academicData.academicYears.length, academicData.semesters.length, academicData.departments.length, academicData.programs.length])

  // Columns per tab
  const sectionColumns = [
    { key: "section_code", label: "Section Code" },
    { key: "department", label: "Faculty" },
    { key: "program", label: "Program" },
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

  // Filtered data based on search term
  // Enhanced filtered data with search and filters
  const filteredAcademicYears = useMemo(() => {
    let filtered = academicData.academicYears
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(year => 
        year.year_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        year.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filters.academicYears.isCurrent !== 'all') {
      filtered = filtered.filter(year => 
        filters.academicYears.isCurrent === 'current' ? year.is_current : !year.is_current
      )
    }
    
    return filtered
  }, [academicData.academicYears, searchTerm, filters.academicYears])

  const filteredSemesters = useMemo(() => {
    let filtered = academicData.semesters
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(semester => 
        semester.semester_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filters.semesters.isCurrent !== 'all') {
      filtered = filtered.filter(semester => 
        filters.semesters.isCurrent === 'current' ? semester.is_current : !semester.is_current
      )
    }
    
    // Apply academic year filter
    if (filters.semesters.academicYear !== 'all') {
      filtered = filtered.filter(semester => 
        semester.academic_year_id === filters.semesters.academicYear
      )
    }
    
    return filtered
  }, [academicData.semesters, searchTerm, filters.semesters])

  const filteredDepartments = useMemo(() => {
    let filtered = academicData.departments
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(dept => 
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.department_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filters.departments.isActive !== 'all') {
      filtered = filtered.filter(dept => 
        filters.departments.isActive === 'active' ? dept.is_active : !dept.is_active
      )
    }
    
    return filtered
  }, [academicData.departments, searchTerm, filters.departments])

  const filteredPrograms = useMemo(() => {
    let filtered = academicData.programs
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(program => 
        program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.program_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filters.programs.isActive !== 'all') {
      filtered = filtered.filter(program => 
        filters.programs.isActive === 'active' ? program.is_active : !program.is_active
      )
    }
    
    // Apply department filter
    if (filters.programs.department !== 'all') {
      filtered = filtered.filter(program => 
        program.department_id === filters.programs.department
      )
    }
    
    // Apply degree type filter
    if (filters.programs.degreeType !== 'all') {
      filtered = filtered.filter(program => 
        program.degree_type === filters.programs.degreeType
      )
    }
    
    return filtered
  }, [academicData.programs, searchTerm, filters.programs])

  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(course => 
      course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    }
    
    // Apply assignment status filter
    if (filters.courses.assignmentStatus !== 'all') {
      if (filters.courses.assignmentStatus === 'assigned') {
        // Check if course is assigned to any program
        filtered = filtered.filter(course => 
          state.courseAssignments.some(assignment => assignment.course_id === course.id)
        )
      } else if (filters.courses.assignmentStatus === 'unassigned') {
        // Check if course is not assigned to any program
        filtered = filtered.filter(course => 
          !state.courseAssignments.some(assignment => assignment.course_id === course.id)
        )
      }
    }
    
    // Apply lecturer status filter
    if (filters.courses.lecturerStatus !== 'all') {
      if (filters.courses.lecturerStatus === 'assigned') {
        filtered = filtered.filter(course => course.lecturer_id)
      } else if (filters.courses.lecturerStatus === 'unassigned') {
        filtered = filtered.filter(course => !course.lecturer_id)
      }
    }
    
    // Apply department filter
    if (filters.courses.department !== 'all') {
      filtered = filtered.filter(course => 
        course.department === filters.courses.department
      )
    }
    
    // Apply program filter
    if (filters.courses.program !== 'all') {
      // Check if course is assigned to the selected program
      filtered = filtered.filter(course => 
        state.courseAssignments.some(assignment => 
          assignment.course_id === course.id && 
          (assignment as any).program_id === filters.courses.program
        )
      )
    }
    
    return filtered
  }, [courses, searchTerm, filters.courses, state.courseAssignments])

  const filteredSections = useMemo(() => {
    let filtered = sections
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(section => 
        section.section_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filters.sections.isActive !== 'all') {
      filtered = filtered.filter(section => 
        filters.sections.isActive === 'active' ? section.is_active : !section.is_active
      )
    }
    
    // Apply program filter
    if (filters.sections.program !== 'all') {
      filtered = filtered.filter(section => 
        section.program_id === filters.sections.program
      )
    }
    
    // Apply year filter
    if (filters.sections.year !== 'all') {
      filtered = filtered.filter(section => 
        section.year.toString() === filters.sections.year
      )
    }
    
    // Apply semester filter
    if (filters.sections.semester !== 'all') {
      filtered = filtered.filter(section => 
        section.semester_id === filters.sections.semester
      )
    }
    
    // Apply academic year filter
    if (filters.sections.academicYear !== 'all') {
      filtered = filtered.filter(section => 
        section.academic_year_id === filters.sections.academicYear
      )
    }
    
    return filtered
  }, [sections, searchTerm, filters.sections])

  const filteredClassrooms = useMemo(() => {
    let filtered = classrooms
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(room => 
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room.toLowerCase().includes(searchTerm.toLowerCase())
    )
    }
    
    // Apply status filter
    if (filters.classrooms.isActive !== 'all') {
      filtered = filtered.filter(room => 
        filters.classrooms.isActive === 'active' ? room.is_active : !room.is_active
      )
    }
    
    // Apply room type filter
    if (filters.classrooms.roomType !== 'all') {
      filtered = filtered.filter(room => 
        room.room_type === filters.classrooms.roomType
      )
    }
    
    // Apply building filter
    if (filters.classrooms.building !== 'all') {
      filtered = filtered.filter(room => 
        room.building === filters.classrooms.building
      )
    }
    
    return filtered
  }, [classrooms, searchTerm, filters.classrooms])

  const filteredAssignments = useMemo(() => {
    let filtered = assignments
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(assignment => 
        assignment.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.program_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply program filter
    if (filters.assignments.program !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.program_id === filters.assignments.program
      )
    }
    
    // Apply year filter
    if (filters.assignments.year !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.year.toString() === filters.assignments.year
      )
    }
    
    // Apply semester filter
    if (filters.assignments.semester !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.semester_id === filters.assignments.semester
      )
    }
    
    // Apply academic year filter
    if (filters.assignments.academicYear !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.academic_year_id === filters.assignments.academicYear
      )
    }
    
    return filtered
  }, [assignments, searchTerm, filters.assignments])

  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(enrollment => 
        enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student_id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.program_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.academic_year?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.section?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filters.enrollments.status !== 'all') {
      filtered = filtered.filter(enrollment => 
        enrollment.status === filters.enrollments.status
      )
    }
    
    // Apply program filter
    if (filters.enrollments.program !== 'all') {
      filtered = filtered.filter(enrollment => 
        enrollment.program_id === filters.enrollments.program
      )
    }
    
    // Apply year filter
    if (filters.enrollments.year !== 'all') {
      filtered = filtered.filter(enrollment => 
        enrollment.year?.toString() === filters.enrollments.year
      )
    }
    
    // Apply semester filter
    if (filters.enrollments.semester !== 'all') {
      filtered = filtered.filter(enrollment => 
        enrollment.semester_id === filters.enrollments.semester
      )
    }
    
    // Apply academic year filter
    if (filters.enrollments.academicYear !== 'all') {
      filtered = filtered.filter(enrollment => 
        enrollment.academic_year_id === filters.enrollments.academicYear
      )
    }
    
    return filtered
  }, [enrollments, searchTerm, filters.enrollments])

  const assignmentColumns = [
    { key: "course_code", label: "Course Code" },
    { key: "course_name", label: "Course Name" },
    { key: "program", label: "Program" },
    { key: "program_code", label: "Program Code" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "academic_year", label: "Academic Year" },
    { key: "is_mandatory", label: "Mandatory" },
    { key: "max_students", label: "Max Students" },
  ]

  const enrollmentColumns = [
    { key: "student_name", label: "Student Name" },
    { key: "student_id_number", label: "Student ID" },
    { key: "program", label: "Program" },
    { key: "year", label: "Year Level" },
    { key: "semester", label: "Semester" },
    { key: "academic_year", label: "Academic Year" },
    { key: "courses_display", label: "Inherited Courses" },
    { key: "section", label: "Sections" },
    { key: "enrollment_date", label: "Enrollment Date" },
    { key: "status", label: "Status" },
  ]

  // Additional filtered data
  const filteredRooms = useMemo(() => {
    let filtered = classrooms
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(room => 
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room.toLowerCase().includes(searchTerm.toLowerCase())
    )
    }
    
    // Apply status filter
    if (filters.classrooms.isActive !== 'all') {
      filtered = filtered.filter(room => 
        filters.classrooms.isActive === 'active' ? room.is_active : !room.is_active
      )
    }
    
    // Apply room type filter
    if (filters.classrooms.roomType !== 'all') {
      filtered = filtered.filter(room => 
        room.room_type === filters.classrooms.roomType
      )
    }
    
    // Apply building filter
    if (filters.classrooms.building !== 'all') {
      filtered = filtered.filter(room => 
        room.building === filters.classrooms.building
      )
    }
    
    // Apply capacity filter
    if (filters.classrooms.capacity !== 'all') {
      filtered = filtered.filter(room => {
        const capacity = room.capacity
        switch (filters.classrooms.capacity) {
          case 'small':
            return capacity >= 1 && capacity <= 30
          case 'medium':
            return capacity >= 31 && capacity <= 60
          case 'large':
            return capacity >= 61 && capacity <= 100
          case 'xlarge':
            return capacity > 100
          default:
            return true
        }
      })
    }
    
    return filtered
  }, [classrooms, searchTerm, filters.classrooms])

  // Form handlers
  const openForm = (type: string, mode: 'create' | 'edit' | 'bulk', data?: any) => {
    setFormState({ type, mode, data: data || null })
  }

  const closeForm = () => {
    setFormState({ type: null, mode: null, data: null })
  }


  const handleSave = async (data: any) => {
    try {
      // Handle bulk operations
      if (Array.isArray(data)) {
        // Process bulk operations based on form type
        switch (formState.type) {
          case 'section':
            for (const item of data) {
              await createSection(item)
            }
            break
          case 'enrollment':
            for (const item of data) {
              // For section enrollments, we need to create the section enrollment
              try {
                // Import and call the server action
                const { createSectionEnrollment } = await import('@/lib/domains/courses/actions')
                const formData = new FormData()
                formData.append('student_id', item.student_id)
                formData.append('section_id', item.section_id)
                formData.append('enrollment_date', item.enrollment_date)
                formData.append('status', item.status || 'active')
                formData.append('grade', item.grade || '')
                formData.append('notes', item.notes || '')
                
                const result = await createSectionEnrollment({}, formData)
                if (result.type === 'error') {
                  // Handle error silently or throw if needed
                  throw new Error(result.message)
                }
              } catch (error) {
                // Handle error silently or re-throw if needed
                throw error
              }
            }
            break
          default:
            // Bulk operation not supported for this type
        }
        // Refresh data after bulk operations
        await Promise.all([
          fetchSections(),
          fetchSectionEnrollments(),
          fetchCourseAssignments(),
          fetchUsers()
        ])
        closeForm()
        return
      }
      
      // Route to appropriate CRUD operation based on form type
      switch (formState.type) {
        case 'academic-year':
          if (formState.mode === 'create') {
            await createAcademicYear(data)
          } else {
            await updateAcademicYear(formState.data.id, data)
          }
          break
          
        case 'semester':
          if (formState.mode === 'create') {
            await createSemester(data)
          } else {
            await updateSemester(formState.data.id, data)
          }
          break
          
        case 'department':
          if (formState.mode === 'create') {
            await createDepartment(data)
          } else {
            await updateDepartment(formState.data.id, data)
          }
          break
          
        case 'program':
          if (formState.mode === 'create') {
            await createProgram(data)
          } else {
            await updateProgram(formState.data.id, data)
          }
          break
          
        case 'classroom':
          if (formState.mode === 'create') {
            await createClassroom(data)
          } else {
            await updateClassroom(formState.data.id, data)
          }
          break
          
        case 'section':
          if (formState.mode === 'create') {
            await createSection(data)
          } else {
            await updateSection(formState.data.id, data)
          }
          break
          
        case 'course':
          if (formState.mode === 'create') {
            await createCourse(data)
          } else {
            await updateCourse(formState.data.id, data)
          }
          break
          
        case 'course-assignment':
          if (formState.mode === 'create') {
            await coursesHook.createCourseAssignment(data)
          } else {
            await coursesHook.updateCourseAssignment(formState.data.id, data)
          }
          break
          
        case 'teacher-assignment':
          if (formState.mode === 'create') {
            await coursesHook.createTeacherAssignment(data)
          } else {
            await coursesHook.updateTeacherAssignment(formState.data.id, data)
          }
          break
          
        case 'lecturer':
        case 'student':
        case 'admin':
          if (formState.mode === 'create') {
            await createUser(data)
          } else {
            await updateUser(formState.data.id, data)
          }
          break
          
        case 'enrollment':
          // Handle single enrollment creation or update
          try {
            const { createSectionEnrollment, updateSectionEnrollment } = await import('@/lib/domains/courses/actions')
            const formData = new FormData()
            
            // Add ID for updates
            if (formState.mode === 'edit' && data.id) {
              formData.append('id', data.id)
            }
            
            formData.append('student_id', data.student_id)
            formData.append('section_id', data.section_id)
            formData.append('enrollment_date', data.enrollment_date)
            formData.append('status', data.status || 'active')
            formData.append('grade', data.grade || '')
            formData.append('notes', data.notes || '')
            
            const result = formState.mode === 'edit' 
              ? await updateSectionEnrollment({}, formData)
              : await createSectionEnrollment({}, formData)
            
            if (result.type === 'error') {
              throw new Error(result.message)
            }
            
            // Refresh data after enrollment operation
            await Promise.all([
              fetchSections(),
              fetchSectionEnrollments(),
              fetchUsers()
            ])
          } catch (error) {
            throw error
          }
          break
          
        default:
          // Unknown form type
      }
      
      closeForm()
    } catch (error) {
      setError('Failed to save data')
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      // Route to appropriate delete operation based on type
      switch (type) {
        case 'academic-year':
          await deleteAcademicYear(id)
          break
        case 'semester':
          await deleteSemester(id)
          break
        case 'department':
          await deleteDepartment(id)
          break
        case 'program':
          await deleteProgram(id)
          break
        case 'classroom':
          await deleteClassroom(id)
          break
        case 'section':
          await deleteSection(id)
          break
        case 'course':
          await deleteCourse(id)
          break
        case 'course-assignment':
          await deleteCourseAssignment(id)
          break
        case 'enrollment':
          const { deleteSectionEnrollment } = await import('@/lib/domains/courses/actions')
          const result = await deleteSectionEnrollment(id)
          if (result.type === 'error') {
            throw new Error(result.message)
          }
          // Refresh data after deletion
          await Promise.all([
            fetchSectionEnrollments(),
            fetchSections(),
            fetchUsers()
          ])
          break
        default:
          // Unknown delete type
      }
    } catch (error) {
      setError('Failed to delete item')
    }
  }

  const tabs = [
    {
      label: "Academic Years",
      value: "academic-years",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('academic-year', 'create')}
            >
              Create Academic Year
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.academicYears.isCurrent, 
                onChange: (v) => setFilters(prev => ({ ...prev, academicYears: { ...prev.academicYears, isCurrent: v } })), 
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'current', label: 'Current' },
                  { value: 'past', label: 'Past' }
                ], 
                span: 3 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search academic years..."
            filters={[]}
          />
          <DataTable 
            title="Academic Years" 
            columns={[
              { key: "year_name", label: "Year" },
              { key: "start_date", label: "Start Date" },
              { key: "end_date", label: "End Date" },
              { key: "is_current", label: "Current" }
            ]} 
            data={filteredAcademicYears as AcademicYearData[]}
            onEdit={(item: any) => openForm('academic-year', 'edit', item)}
            onDelete={(item: any) => handleDelete('academic-year', item.id)}
          />
        </>
      )
    },
    {
      label: "Semesters",
      value: "semesters",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('semester', 'create')}
            >
              Create Semester
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.semesters.isCurrent, 
                onChange: (v) => setFilters(prev => ({ ...prev, semesters: { ...prev.semesters, isCurrent: v } })), 
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'current', label: 'Current' },
                  { value: 'past', label: 'Past' }
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Academic Year', 
                value: filters.semesters.academicYear, 
                onChange: (v) => setFilters(prev => ({ ...prev, semesters: { ...prev.semesters, academicYear: v } })), 
                options: [
                  { value: 'all', label: 'All Years' },
                  ...academicData.academicYears.map(year => ({ value: year.id, label: year.year_name }))
                ], 
                span: 4 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search semesters..."
            filters={[]}
          />
          <DataTable 
            title="Semesters" 
            columns={[
              { key: "semester_name", label: "Name" },
              { key: "semester_number", label: "Number" },
              { key: "start_date", label: "Start Date" },
              { key: "end_date", label: "End Date" },
              { key: "is_current", label: "Current" }
            ]} 
            data={filteredSemesters as SemesterData[]}
            onEdit={(item: any) => openForm('semester', 'edit', item)}
            onDelete={(item: any) => handleDelete('semester', item.id)}
          />
        </>
      )
    },
    {
      label: "Departments",
      value: "departments",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('department', 'create')}
            >
              Create Department
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.departments.isActive, 
                onChange: (v) => setFilters(prev => ({ ...prev, departments: { ...prev.departments, isActive: v } })), 
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ], 
                span: 3 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search departments..."
            filters={[]}
          />
          <DataTable 
            title="Departments" 
            columns={[
              { key: "department_code", label: "Code" },
              { key: "department_name", label: "Name" },
              { key: "description", label: "Description" }
            ]} 
            data={filteredDepartments as DepartmentData[]}
            onEdit={(item: any) => openForm('department', 'edit', item)}
            onDelete={(item: any) => handleDelete('department', item.id)}
          />
        </>
      )
    },
    {
      label: "Programs",
      value: "programs",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('program', 'create')}
            >
              Create Program
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.programs.isActive, 
                onChange: (v) => setFilters(prev => ({ ...prev, programs: { ...prev.programs, isActive: v } })), 
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Department', 
                value: filters.programs.department, 
                onChange: (v) => setFilters(prev => ({ ...prev, programs: { ...prev.programs, department: v } })), 
                options: [
                  { value: 'all', label: 'All Departments' },
                  ...academicData.departments.map(dept => ({ value: dept.id, label: dept.department_name }))
                ], 
                span: 4 
              },
              { 
                type: 'native-select', 
                label: 'Degree Type', 
                value: filters.programs.degreeType, 
                onChange: (v) => setFilters(prev => ({ ...prev, programs: { ...prev.programs, degreeType: v } })), 
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'Bachelor', label: 'Bachelor' },
                  { value: 'Master', label: 'Master' },
                  { value: 'PhD', label: 'PhD' },
                  { value: 'Certificate', label: 'Certificate' }
                ], 
                span: 3 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search programs..."
            filters={[]}
          />
          <DataTable 
            title="Programs" 
            columns={[
              { key: "program_code", label: "Code" },
              { key: "program_name", label: "Name" },
              { key: "degree_type", label: "Degree Type" },
              { key: "duration_years", label: "Duration" }
            ]} 
            data={filteredPrograms as ProgramData[]}
            onEdit={(item: any) => openForm('program', 'edit', item)}
            onDelete={(item: any) => handleDelete('program', item.id)}
          />
        </>
      )
    },
    {
      label: "Sections",
      value: "sections",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('section', 'create')}
            >
              Create Section
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('section', 'bulk')}
            >
              Bulk Create Sections
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.sections.isActive, 
                onChange: (v) => setFilters(prev => ({ ...prev, sections: { ...prev.sections, isActive: v } })), 
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Program', 
                value: filters.sections.program, 
                onChange: (v) => setFilters(prev => ({ ...prev, sections: { ...prev.sections, program: v } })), 
                options: [
                  { value: 'all', label: 'All Programs' },
                  ...academicData.programs.map(program => ({ value: program.id, label: program.program_name }))
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Year', 
                value: filters.sections.year, 
                onChange: (v) => setFilters(prev => ({ ...prev, sections: { ...prev.sections, year: v } })), 
                options: [
                  { value: 'all', label: 'All Years' },
                  { value: '1', label: 'Year 1' },
                  { value: '2', label: 'Year 2' },
                  { value: '3', label: 'Year 3' },
                  { value: '4', label: 'Year 4' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Semester', 
                value: filters.sections.semester, 
                onChange: (v) => setFilters(prev => ({ ...prev, sections: { ...prev.sections, semester: v } })), 
                options: [
                  { value: 'all', label: 'All Semesters' },
                  ...academicData.semesters.map(semester => ({ value: semester.id, label: semester.semester_name }))
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Academic Year', 
                value: filters.sections.academicYear, 
                onChange: (v) => setFilters(prev => ({ ...prev, sections: { ...prev.sections, academicYear: v } })), 
                options: [
                  { value: 'all', label: 'All Years' },
                  ...academicData.academicYears.map(year => ({ value: year.id, label: year.year_name }))
                ], 
                span: 2 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search sections..."
            filters={[]}
          />
          <DataTable 
            title="Sections" 
            columns={sectionColumns} 
            data={filteredSections as any}
            onEdit={(item: any) => {
              // Find the original section data from academicData.sections
              const originalSection = academicData.sections.find(s => s.id === item.id)
              openForm('section', 'edit', originalSection)
            }}
            onDelete={(item: any) => handleDelete('section', item.id)}
          />
        </>
      )
    },
    {
      label: "Courses",
      value: "courses",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('course', 'create')}
            >
              Create Course
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('course-assignment', 'create')}
            >
              Assign Course to Program
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Assignment Status', 
                value: filters.courses.assignmentStatus, 
                onChange: (v) => setFilters(prev => ({ ...prev, courses: { ...prev.courses, assignmentStatus: v } })), 
                options: [
                  { value: 'all', label: 'All Courses' },
                  { value: 'assigned', label: 'Assigned to Programs' },
                  { value: 'unassigned', label: 'Not Assigned' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Lecturer Status', 
                value: filters.courses.lecturerStatus, 
                onChange: (v) => setFilters(prev => ({ ...prev, courses: { ...prev.courses, lecturerStatus: v } })), 
                options: [
                  { value: 'all', label: 'All Lecturers' },
                  { value: 'assigned', label: 'Has Lecturer' },
                  { value: 'unassigned', label: 'No Lecturer' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Faculty/Department', 
                value: filters.courses.department, 
                onChange: (v) => setFilters(prev => ({ ...prev, courses: { ...prev.courses, department: v } })), 
                options: [
                  { value: 'all', label: 'All Faculties' },
                  ...academicData.departments.map(dept => ({ value: dept.department_name, label: dept.department_name }))
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Program', 
                value: filters.courses.program, 
                onChange: (v) => setFilters(prev => ({ ...prev, courses: { ...prev.courses, program: v } })), 
                options: [
                  { value: 'all', label: 'All Programs' },
                  ...academicData.programs.map(program => ({ value: program.id, label: program.program_name }))
                ], 
                span: 3 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search courses..."
            filters={[]}
          />
          <DataTable 
            title="Courses" 
            columns={courseColumns} 
            data={filteredCourses as Course[]}
            onEdit={(course: any) => {
              // Find the original course data
              const originalCourse = state.courses.find(c => c.id === course.id)
              openForm('course', 'edit', originalCourse)
            }}
            onDelete={(course: any) => handleDelete('course', course.id)}
          />
        </>
      )
    },
    {
      label: "Classrooms",
      value: "classrooms",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<BuildingOffice2Icon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('classroom', 'create')}
            >
              Create Classroom
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.classrooms.isActive, 
                onChange: (v) => setFilters(prev => ({ ...prev, classrooms: { ...prev.classrooms, isActive: v } })), 
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Room Type', 
                value: filters.classrooms.roomType, 
                onChange: (v) => setFilters(prev => ({ ...prev, classrooms: { ...prev.classrooms, roomType: v } })), 
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'lecture', label: 'Lecture Hall' },
                  { value: 'lab', label: 'Laboratory' },
                  { value: 'computer_lab', label: 'Computer Lab' },
                  { value: 'seminar', label: 'Seminar Room' },
                  { value: 'conference', label: 'Conference Room' },
                  { value: 'workshop', label: 'Workshop' },
                  { value: 'studio', label: 'Studio' }
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Building', 
                value: filters.classrooms.building, 
                onChange: (v) => setFilters(prev => ({ ...prev, classrooms: { ...prev.classrooms, building: v } })), 
                options: [
                  { value: 'all', label: 'All Buildings' },
                  ...Array.from(new Set(academicData.classrooms.map(room => room.building))).map(building => ({ 
                    value: building, 
                    label: building 
                  }))
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Capacity', 
                value: filters.classrooms.capacity, 
                onChange: (v) => setFilters(prev => ({ ...prev, classrooms: { ...prev.classrooms, capacity: v } })), 
                options: [
                  { value: 'all', label: 'All Capacities' },
                  { value: 'small', label: 'Small (1-30)' },
                  { value: 'medium', label: 'Medium (31-60)' },
                  { value: 'large', label: 'Large (61-100)' },
                  { value: 'xlarge', label: 'Extra Large (100+)' }
                ], 
                span: 2 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search classrooms..."
            filters={[]}
          />
          <DataTable 
            title="Classrooms" 
            columns={classroomColumns} 
            data={filteredRooms as any}
            onEdit={(item: any) => {
              // Find the original classroom data
              const originalClassroom = academicData.classrooms.find(c => c.id === item.id)
              openForm('classroom', 'edit', originalClassroom)
            }}
            onDelete={(item: any) => handleDelete('classroom', item.id)}
          />
        </>
      )
    },
    {
      label: "Assignments",
      value: "assignments",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Button 
              variant="outlined" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('course-assignment', 'create')}
            >
              Assign Course → Program
            </Button>
            <Button 
              variant="contained" 
              startIcon={<UserPlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('teacher-assignment', 'create')}
            >
              Assign Teacher → Course/Section
            </Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search assignments..."
            filters={[]}
          />
          <DataTable 
            title="Course Assignments" 
            columns={assignmentColumns} 
            data={filteredAssignments as any}
            onEdit={(item: any) => {
              // Find the original assignment data
              const originalAssignment = state.courseAssignments.find(a => a.id === item.id)
              openForm('course-assignment', 'edit', originalAssignment)
            }}
            onDelete={(item: any) => handleDelete('course-assignment', item.id)}
          />
        </>
      )
    },
    {
      label: "Enrollments",
      value: "enrollments",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Button 
              variant="contained" 
              startIcon={<UserPlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('enrollment', 'create')}
            >
              Enroll Student
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<UserPlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('enrollment', 'bulk')}
            >
              Bulk Enroll Students
            </Button>
          </Box>
          <FilterBar
            fields={[
              { 
                type: 'native-select', 
                label: 'Status', 
                value: filters.enrollments.status, 
                onChange: (v) => setFilters(prev => ({ ...prev, enrollments: { ...prev.enrollments, status: v } })), 
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'dropped', label: 'Dropped' },
                  { value: 'completed', label: 'Completed' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Program', 
                value: filters.enrollments.program, 
                onChange: (v) => setFilters(prev => ({ ...prev, enrollments: { ...prev.enrollments, program: v } })), 
                options: [
                  { value: 'all', label: 'All Programs' },
                  ...academicData.programs.map(program => ({ value: program.id, label: program.program_name }))
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Year', 
                value: filters.enrollments.year, 
                onChange: (v) => setFilters(prev => ({ ...prev, enrollments: { ...prev.enrollments, year: v } })), 
                options: [
                  { value: 'all', label: 'All Years' },
                  { value: '1', label: 'Year 1' },
                  { value: '2', label: 'Year 2' },
                  { value: '3', label: 'Year 3' },
                  { value: '4', label: 'Year 4' }
                ], 
                span: 2 
              },
              { 
                type: 'native-select', 
                label: 'Semester', 
                value: filters.enrollments.semester, 
                onChange: (v) => setFilters(prev => ({ ...prev, enrollments: { ...prev.enrollments, semester: v } })), 
                options: [
                  { value: 'all', label: 'All Semesters' },
                  ...academicData.semesters.map(semester => ({ value: semester.id, label: semester.semester_name }))
                ], 
                span: 3 
              },
              { 
                type: 'native-select', 
                label: 'Academic Year', 
                value: filters.enrollments.academicYear, 
                onChange: (v) => setFilters(prev => ({ ...prev, enrollments: { ...prev.enrollments, academicYear: v } })), 
                options: [
                  { value: 'all', label: 'All Years' },
                  ...academicData.academicYears.map(year => ({ value: year.id, label: year.year_name }))
                ], 
                span: 2 
              }
            ]}
          />
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search students..."
            filters={[
              {
                label: 'Status',
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'dropped', label: 'Dropped' },
                  { value: 'completed', label: 'Completed' }
                ],
                value: filters.enrollments.status,
                onChange: (value: string) => setFilters(prev => ({
                  ...prev,
                  enrollments: { ...prev.enrollments, status: value }
                }))
              },
              {
                label: 'Program',
                options: [
                  { value: 'all', label: 'All Programs' },
                  ...(academicData.programs?.map((program: any) => ({
                    value: program.id,
                    label: program.program_name
                  })) || [])
                ],
                value: filters.enrollments.program,
                onChange: (value: string) => setFilters(prev => ({
                  ...prev,
                  enrollments: { ...prev.enrollments, program: value }
                }))
              },
              {
                label: 'Year Level',
                options: [
                  { value: 'all', label: 'All Years' },
                  { value: '1', label: 'Year 1' },
                  { value: '2', label: 'Year 2' },
                  { value: '3', label: 'Year 3' },
                  { value: '4', label: 'Year 4' }
                ],
                value: filters.enrollments.year,
                onChange: (value: string) => setFilters(prev => ({
                  ...prev,
                  enrollments: { ...prev.enrollments, year: value }
                }))
              },
              {
                label: 'Semester',
                options: [
                  { value: 'all', label: 'All Semesters' },
                  ...(academicData.semesters?.map((semester: any) => ({
                    value: semester.id,
                    label: semester.semester_name
                  })) || [])
                ],
                value: filters.enrollments.semester,
                onChange: (value: string) => setFilters(prev => ({
                  ...prev,
                  enrollments: { ...prev.enrollments, semester: value }
                }))
              }
            ]}
          />
          <DataTable 
            title="Student Enrollments" 
            columns={enrollmentColumns} 
            data={filteredEnrollments as any}
            onEdit={(item: any) => {
              // Find the original enrollment data
              const originalEnrollment = academicState.sectionEnrollments.find(e => e.id === item.id)
              openForm('enrollment', 'edit', originalEnrollment)
            }}
            onDelete={(item: any) => handleDelete('enrollment', item.id)}
          />
        </>
      )
    }
  ]

  // Loading state
  if (state.loading) {
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


      {/* Academic Structure Forms */}
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
          users={state.users}
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
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          programs={academicData.programs}
          classrooms={academicData.classrooms}
          onSave={handleSave as any}
          mode={formState.mode as 'create' | 'edit' | 'bulk'}
          bulkData={formState.mode === 'bulk' ? [] : undefined}
        />
      )}

      {/* Course Forms */}
      {formState.type === 'course' && (
        <CourseForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          course={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
          departments={academicData.departments}
          users={state.users}
        />
      )}

      {formState.type === 'course-assignment' && (
        <>
          {console.log("CourseAssignmentForm props:", {
            courses: courses,
            academicYears: academicData.academicYears,
            semesters: academicData.semesters,
            programs: academicData.programs,
            coursesLength: courses?.length,
            academicYearsLength: academicData.academicYears?.length,
            semestersLength: academicData.semesters?.length,
            programsLength: academicData.programs?.length
          })}
          <CourseAssignmentForm
            open={Boolean(formState.type)}
            onOpenChange={closeForm}
            assignment={formState.data as any}
            onSave={handleSave as any}
            mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
            courses={courses}
            academicYears={academicData.academicYears}
            semesters={academicData.semesters}
            programs={academicData.programs}
            sections={sections}
          />
        </>
      )}

      {formState.type === 'teacher-assignment' && (
        <TeacherAssignmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          assignment={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
          lecturers={(() => {
            // Try using state.users first, then fallback to lecturerProfiles
            const lecturerUsers = state.users.filter(u => u.role === 'lecturer')
            
            if (lecturerUsers.length > 0) {
              return lecturerUsers.map((user: any) => ({
                id: user.id,
                full_name: user.full_name || 'Unknown',
                email: user.email || 'unknown@email.com',
                role: 'lecturer'
              }))
            }
            
            // Fallback to lecturerProfiles
            const lecturerList = state.lecturerProfiles.map((lp: any) => ({
              id: lp.user_id || lp.id,
              full_name: lp.users?.full_name || lp.full_name || 'Unknown',
              email: lp.users?.email || lp.email || 'unknown@email.com',
              role: 'lecturer'
            }))
            return lecturerList
          })()}
          courses={state.courses}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          programs={academicData.programs}
          sections={sections}
        />
      )}

      {formState.type === 'enrollment' && (
        <EnrollmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          enrollment={formState.data as any}
          onSave={handleSave as any}
          mode={formState.mode as 'create' | 'edit' | 'bulk'}
          students={state.users.filter(u => u.role === 'student')}
          sections={sections}
          bulkData={formState.mode === 'bulk' ? [] : undefined}
        />
      )}

      {/* User Forms */}
      {formState.type === 'lecturer' && (
        <LecturerForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          lecturer={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
          departments={academicData.departments}
        />
      )}

      {formState.type === 'student' && (
        <StudentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          student={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
          programs={academicData.programs}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          sections={academicData.sections}
        />
      )}

      {formState.type === 'admin' && (
        <AdminForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          admin={formState.data as any}
          onSave={handleSave as any}
          mode={(formState.mode === 'bulk' ? 'create' : formState.mode) || 'create'}
          departments={academicData.departments}
        />
      )}
    </Box>
  )
}


