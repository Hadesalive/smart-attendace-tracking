"use client"
import React, { useMemo, useState, useEffect } from "react"
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography } from "@mui/material"
import { PlusIcon, UserPlusIcon, BuildingOffice2Icon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { useData } from "@/lib/contexts/DataContext"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import SearchFilters from "@/components/admin/SearchFilters"
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
  section: string // uniqueness anchor with the above
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
  
  // Form states
  const [formState, setFormState] = useState({
    type: null as string | null,
    mode: null as 'create' | 'edit' | null,
    data: null as any
  })

  // Data Context
  const { 
    state, 
    fetchAcademicYears,
    fetchSemesters,
    fetchDepartments,
    fetchPrograms,
    fetchClassrooms,
    fetchSections,
    fetchStudentProfiles,
    fetchLecturerProfiles,
    fetchAdminProfiles,
    fetchCourses,
    fetchUsers,
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
    deleteSection,
    createCourse,
    updateCourse,
    deleteCourse,
    createCourseAssignment,
    updateCourseAssignment,
    deleteCourseAssignment,
    createUser,
    updateUser
  } = useData()

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
    const loadAcademicData = async () => {
      try {
        console.log('Loading academic data...')
        await Promise.all([
          fetchAcademicYears(),
          fetchSemesters(),
          fetchDepartments(),
          fetchPrograms(),
          fetchClassrooms(),
          fetchSections(),
          fetchStudentProfiles(),
          fetchLecturerProfiles(),
          fetchAdminProfiles(),
          fetchCourses(),
          fetchUsers()
        ])
        console.log('Academic data loaded successfully')
      } catch (error) {
        console.error('Error loading academic data:', error)
        setError('Failed to load academic data')
      }
    }
    
    loadAcademicData()
  }, [fetchAcademicYears, fetchSemesters, fetchDepartments, fetchPrograms, fetchClassrooms, fetchSections, fetchStudentProfiles, fetchLecturerProfiles, fetchAdminProfiles, fetchCourses, fetchUsers])

  // Get data from database (will replace mock data)
  const classes = useMemo(() => {
    console.log('Sections data:', academicData.sections)
    // Use sections from database instead of mock data
    return academicData.sections.map(section => ({
      id: section.id,
      year: section.year as Year,
      semester: section.semesters?.semester_name || 'N/A',
      program: section.programs?.program_code || 'N/A',
      section: section.section_code,
      size: section.current_enrollment || 0
    }))
  }, [academicData.sections])

  const courses = useMemo(() => {
    return state.courses.map(course => ({
      id: course.id,
      code: course.course_code,
      name: course.course_name,
      program: course.department || 'BSEM'
    }))
  }, [state.courses])

  const classrooms = useMemo(() => {
    return academicData.classrooms.map(classroom => ({
      id: classroom.id,
      building: classroom.building,
      room: classroom.room_number,
      capacity: classroom.capacity
    }))
  }, [academicData.classrooms])

  const assignments = useMemo(() => {
    // Get lecturer assignments from DataContext
    return state.lecturerAssignments.map(assignment => {
      const course = state.courses.find(c => c.id === assignment.course_id)
      const lecturer = state.users.find(u => u.id === assignment.lecturer_id)
      
      return {
        id: assignment.id,
        teacher_id: assignment.lecturer_id,
        teacher_name: lecturer?.full_name || 'Unknown',
        course_id: assignment.course_id,
        course_code: course?.course_code || 'N/A',
        year: 1 as Year,
        semester: 2 as Semester,
        program: course?.department || 'BSEM',
        section: '2101' // Will be updated when sections are properly linked
      }
    })
  }, [state.lecturerAssignments, state.courses, state.users])

  const enrollments = useMemo(() => {
    return state.enrollments.map(enrollment => {
      const student = state.students.find(s => s.id === enrollment.student_id)
      const course = state.courses.find(c => c.id === enrollment.course_id)
      
      return {
        id: enrollment.id,
        student_id: enrollment.student_id,
        student_name: student?.full_name || 'Unknown',
        year: 1 as Year,
        semester: 2 as Semester,
        program: course?.department || 'BSEM',
        section: '2101' // Will be updated when sections are properly linked
      }
    })
  }, [state.enrollments, state.students, state.courses])

  // KPI stats from academic data
  const statsCards = useMemo(() => ([
    { title: "Academic Years", value: academicData.academicYears.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Active years", change: "Current: 2024-2025" },
    { title: "Semesters", value: academicData.semesters.length, icon: ArrowPathIcon, color: "#000000", subtitle: "Total semesters", change: "Fall & Spring" },
    { title: "Departments", value: academicData.departments.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Active departments", change: "CS, BSEM, MT" },
    { title: "Programs", value: academicData.programs.length, icon: UserPlusIcon, color: "#000000", subtitle: "Degree programs", change: "Bachelor programs" },
  ]), [academicData.academicYears.length, academicData.semesters.length, academicData.departments.length, academicData.programs.length])

  // Columns per tab
  const classColumns = [
    { key: "program", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "section", label: "Section" },
    { key: "size", label: "Students" },
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
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses
    return courses.filter(course => 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.program.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [courses, searchTerm])

  const filteredClasses = useMemo(() => {
    if (!searchTerm.trim()) return classes
    return classes.filter(cls => 
      cls.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [classes, searchTerm])

  const filteredClassrooms = useMemo(() => {
    if (!searchTerm.trim()) return classrooms
    return classrooms.filter(room => 
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [classrooms, searchTerm])

  const assignmentColumns = [
    { key: "course_code", label: "Course" },
    { key: "teacher_name", label: "Teacher" },
    { key: "program", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "section", label: "Section" },
  ]

  const enrollmentColumns = [
    { key: "student_name", label: "Student" },
    { key: "student_id", label: "Student ID" },
    { key: "program", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "section", label: "Section" },
  ]

  // Additional filtered data
  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return classrooms
    return classrooms.filter(room => 
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [classrooms, searchTerm])

  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) return assignments
    return assignments.filter(assignment => 
      assignment.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [assignments, searchTerm])

  const filteredEnrollments = useMemo(() => {
    if (!searchTerm.trim()) return enrollments
    return enrollments.filter(enrollment => 
      enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [enrollments, searchTerm])

  // Form handlers
  const openForm = (type: string, mode: 'create' | 'edit', data?: any) => {
    setFormState({ type, mode, data })
  }

  const closeForm = () => {
    setFormState({ type: null, mode: null, data: null })
  }


  const handleSave = async (data: any) => {
    try {
      console.log('Saving data:', data, 'Type:', formState.type, 'Mode:', formState.mode)
      
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
            await createCourseAssignment(data)
          } else {
            await updateCourseAssignment(formState.data.id, data)
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
          
        default:
          console.warn('Unknown form type:', formState.type)
      }
      
      closeForm()
    } catch (error) {
      console.error('Error saving data:', error)
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
        default:
          console.warn('Unknown delete type:', type)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
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
            ] as any} 
            data={academicData.academicYears as any}
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
            ] as any} 
            data={academicData.semesters as any}
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
            ] as any} 
            data={academicData.departments as any}
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
            ] as any} 
            data={academicData.programs as any}
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
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('section', 'create')}
            >
              Create Section
            </Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search sections..."
            filters={[]}
          />
          <DataTable 
            title="Sections" 
            columns={classColumns as any} 
            data={filteredClasses as any}
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
              Assign Course to Class
            </Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search courses..."
            filters={[]}
          />
          <DataTable 
            title="Courses" 
            columns={courseColumns as any} 
            data={filteredCourses as any}
            onEdit={(course: any) => openForm('course', 'edit', course)}
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
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search classrooms..."
            filters={[]}
          />
          <DataTable 
            title="Classrooms" 
            columns={classroomColumns as any} 
            data={filteredRooms as any}
            onEdit={(item: any) => openForm('classroom', 'edit', item)}
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
              Assign Course → Class
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
          <DataTable title="Teacher Assignments" columns={assignmentColumns as any} data={filteredAssignments as any} />
        </>
      )
    },
    {
      label: "Enrollments",
      value: "enrollments",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<UserPlusIcon className="h-4 w-4" />} 
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => openForm('enrollment', 'create')}
            >
              Enroll Student
            </Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search students..."
            filters={[]}
          />
          <DataTable title="Enrollments" columns={enrollmentColumns as any} data={filteredEnrollments as any} />
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
          onTabChange={setActiveTab as any}
        />
      </Box>


      {/* Academic Structure Forms */}
      {formState.type === 'academic-year' && (
        <AcademicYearForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          academicYear={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'semester' && (
        <SemesterForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          semester={formState.data}
          academicYears={academicData.academicYears}
          onSave={handleSave}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'department' && (
        <DepartmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          department={formState.data}
          users={state.users}
          onSave={handleSave}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'program' && (
        <ProgramForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          program={formState.data}
          departments={academicData.departments}
          onSave={handleSave}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'classroom' && (
        <ClassroomForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          classroom={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
        />
      )}

      {formState.type === 'section' && (
        <SectionForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          section={formState.data}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          programs={academicData.programs}
          classrooms={academicData.classrooms}
          onSave={handleSave}
          mode={formState.mode || 'create'}
        />
      )}

      {/* Course Forms */}
      {formState.type === 'course' && (
        <CourseForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          course={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          departments={academicData.departments}
          lecturers={academicData.lecturerProfiles}
        />
      )}

      {formState.type === 'course-assignment' && (
        <CourseAssignmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          assignment={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          courses={courses}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          programs={academicData.programs}
          sections={academicData.sections}
        />
      )}

      {formState.type === 'teacher-assignment' && (
        <TeacherAssignmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          assignment={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          lecturers={(() => {
            // Try using state.users first, then fallback to lecturerProfiles
            const lecturerUsers = state.users.filter(u => u.role === 'lecturer')
            console.log('Lecturer users from state.users:', lecturerUsers)
            
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
            console.log('TeacherAssignmentForm lecturers (from profiles):', lecturerList)
            console.log('Raw lecturerProfiles data:', state.lecturerProfiles)
            return lecturerList
          })()}
          courses={(() => {
            console.log('TeacherAssignmentForm courses:', state.courses)
            return state.courses
          })()}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
          programs={academicData.programs}
          sections={academicData.sections}
        />
      )}

      {formState.type === 'enrollment' && (
        <EnrollmentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          enrollment={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          students={state.users.filter(u => u.role === 'student')}
          sections={academicData.sections}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
        />
      )}

      {/* User Forms */}
      {formState.type === 'lecturer' && (
        <LecturerForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          lecturer={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          departments={academicData.departments}
        />
      )}

      {formState.type === 'student' && (
        <StudentForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          student={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          programs={academicData.programs}
          academicYears={academicData.academicYears}
          semesters={academicData.semesters}
        />
      )}

      {formState.type === 'admin' && (
        <AdminForm
          open={Boolean(formState.type)}
          onOpenChange={closeForm}
          admin={formState.data}
          onSave={handleSave}
          mode={formState.mode || 'create'}
          departments={academicData.departments}
        />
      )}
    </Box>
  )
}


