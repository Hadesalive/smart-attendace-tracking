/**
 * ADMIN ACADEMIC HUB PAGE
 *
 * MVP for academic structures and flows:
 * - Courses (subjects) catalog and assignment to classes
 * - Classes organized by Year → Semester → Program (class) → Section
 * - Classrooms (physical rooms) registry
 * - Teacher assignments per course and class/section
 * - Student enrollments into class/section
 *
 * Key rules (as provided):
 * - "Courses" and "Subjects" are the same entity (we use Courses).
 * - A Class is uniquely identified by (year, semester, program, section).
 * - Assigning a course to a class applies to all sections under that (year, semester, program),
 *   unless we later scope to a specific section (not in MVP).
 * - Teacher assignment uniqueness is by (course_id, year, semester, program, section).
 *   Multiple teachers can be assigned to the same course in the same class across sections;
 *   and one teacher can be assigned to all sections.
 * - Scheduling is out-of-scope for MVP.
 * - No bulk import/soft delete for MVP.
 * - Reuse shared admin components and monochrome design.
 */

"use client"

import React, { useMemo, useState } from "react"
import { Box, Button, Dialog, DialogTitle, DialogContent } from "@mui/material"
import { PlusIcon, UserPlusIcon, BuildingOffice2Icon, ArrowPathIcon } from "@heroicons/react/24/outline"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import SearchFilters from "@/components/admin/SearchFilters"
import DataTable from "@/components/admin/DataTable"
import DetailTabs from "@/components/admin/DetailTabs"
import ErrorAlert from "@/components/admin/ErrorAlert"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { AddUserForm } from "@/components/admin/add-user-form"

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
  const [activeTab, setActiveTab] = useState("classes")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [addUserOpen, setAddUserOpen] = useState<false | 'student' | 'lecturer' | 'admin'>(false)

  // KPI stats (placeholder)
  const statsCards = useMemo(() => ([
    { title: "Classes", value: mockClasses.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Total classes", change: "+2 this term" },
    { title: "Courses", value: mockCourses.length, icon: ArrowPathIcon, color: "#000000", subtitle: "Catalog size", change: "+1 added" },
    { title: "Classrooms", value: mockClassrooms.length, icon: BuildingOffice2Icon, color: "#000000", subtitle: "Rooms available", change: "Stable" },
    { title: "Assignments", value: mockAssignments.length, icon: UserPlusIcon, color: "#000000", subtitle: "Teacher-course", change: "+1" },
  ]), [])

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
    { key: "program", label: "Program" },
  ]

  const classroomColumns = [
    { key: "building", label: "Building" },
    { key: "room", label: "Room" },
    { key: "capacity", label: "Capacity" },
  ]

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

  // Filtered data
  const filteredClasses = useMemo(() => mockClasses.filter(c => `${c.program} ${c.section}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])
  const filteredCourses = useMemo(() => mockCourses.filter(c => `${c.code} ${c.name}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])
  const filteredRooms = useMemo(() => mockClassrooms.filter(r => `${r.building} ${r.room}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])
  const filteredAssignments = useMemo(() => mockAssignments.filter(a => `${a.course_code} ${a.teacher_name}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])
  const filteredEnrollments = useMemo(() => mockEnrollments.filter(e => `${e.student_name}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])

  const tabs = [
    {
      label: "Classes",
      value: "classes",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button variant="contained" startIcon={<PlusIcon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}>Create Class</Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search classes..."
            filters={[]}
          />
          <DataTable title="Classes" columns={classColumns as any} data={filteredClasses as any} />
        </>
      )
    },
    {
      label: "Courses",
      value: "courses",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button variant="contained" startIcon={<PlusIcon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}>Create Course</Button>
            <Button variant="outlined" startIcon={<PlusIcon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}>Assign Course to Class</Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search courses..."
            filters={[]}
          />
          <DataTable title="Courses" columns={courseColumns as any} data={filteredCourses as any} />
        </>
      )
    },
    {
      label: "Classrooms",
      value: "classrooms",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button variant="contained" startIcon={<BuildingOffice2Icon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}>Create Classroom</Button>
          </Box>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search classrooms..."
            filters={[]}
          />
          <DataTable title="Classrooms" columns={classroomColumns as any} data={filteredRooms as any} />
        </>
      )
    },
    {
      label: "Assignments",
      value: "assignments",
      content: (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<PlusIcon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}>Assign Course → Class</Button>
            <Button variant="contained" startIcon={<UserPlusIcon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}>Assign Teacher → Course/Section</Button>
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
            <Button variant="contained" startIcon={<UserPlusIcon className="h-4 w-4" />} sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}>Enroll Student</Button>
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Academic Management"
        subtitle="Manage classes, courses, classrooms, assignments, and enrollments"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<UserPlusIcon className="h-4 w-4" />}
              sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => setAddUserOpen('admin')}
            >
              Create User
            </Button>
            <Button
              variant="outlined"
              startIcon={<UserPlusIcon className="h-4 w-4" />}
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => setAddUserOpen('lecturer')}
            >
              Create Lecturer
            </Button>
            <Button
              variant="outlined"
              startIcon={<UserPlusIcon className="h-4 w-4" />}
              sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }}
              onClick={() => setAddUserOpen('student')}
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

      {/* Create User Dialog (for creating students/lecturers/admins) */}
      <Dialog open={Boolean(addUserOpen)} onClose={() => setAddUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={TYPOGRAPHY_STYLES.dialogTitle}>Create User</DialogTitle>
        <DialogContent>
          <AddUserForm onFormSubmit={() => setAddUserOpen(false)} defaultRole={typeof addUserOpen === 'string' ? (addUserOpen as any) : undefined} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}


