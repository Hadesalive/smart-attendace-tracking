export interface AcademicYear {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface Semester {
  id: string
  semester_name: string
  semester_number: number
  academic_year_id: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  department_code: string
  department_name: string
  head_id?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Program {
  program_id: string
  id: string
  program_code: string
  program_name: string
  department_id: string
  degree_type: string
  duration_years: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: string
  building: string
  room_number: string
  capacity: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  section_code: string
  program_id: string
  academic_year_id: string
  semester_id: string
  year: number
  classroom_id?: string
  max_capacity: number
  current_enrollment: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  student_id: string
  program_id: string
  section_id: string
  academic_year_id: string
  enrollment_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface LecturerProfile {
  id: string
  user_id: string
  employee_id: string
  department_id: string
  specialization?: string
  hire_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface AdminProfile {
  id: string
  user_id: string
  employee_id: string
  department_id: string
  position: string
  hire_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface AcademicState {
  academicYears: AcademicYear[]
  semesters: Semester[]
  departments: Department[]
  programs: Program[]
  classrooms: Classroom[]
  sections: Section[]
  studentProfiles: StudentProfile[]
  lecturerProfiles: LecturerProfile[]
  adminProfiles: AdminProfile[]
  loading: boolean
  error: string | null
}

export interface AcademicContextType {
  state: AcademicState
  // Academic Years
  fetchAcademicYears: () => Promise<void>
  createAcademicYear: (data: any) => Promise<void>
  updateAcademicYear: (id: string, data: any) => Promise<void>
  deleteAcademicYear: (id: string) => Promise<void>
  // Semesters
  fetchSemesters: () => Promise<void>
  createSemester: (data: any) => Promise<void>
  updateSemester: (id: string, data: any) => Promise<void>
  deleteSemester: (id: string) => Promise<void>
  // Departments
  fetchDepartments: () => Promise<void>
  createDepartment: (data: any) => Promise<void>
  updateDepartment: (id: string, data: any) => Promise<void>
  deleteDepartment: (id: string) => Promise<void>
  // Programs
  fetchPrograms: () => Promise<void>
  createProgram: (data: any) => Promise<void>
  updateProgram: (id: string, data: any) => Promise<void>
  deleteProgram: (id: string) => Promise<void>
  // Classrooms
  fetchClassrooms: () => Promise<void>
  createClassroom: (data: any) => Promise<void>
  updateClassroom: (id: string, data: any) => Promise<void>
  deleteClassroom: (id: string) => Promise<void>
  // Sections
  fetchSections: () => Promise<void>
  createSection: (data: any) => Promise<void>
  updateSection: (id: string, data: any) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  // Profiles
  fetchStudentProfiles: () => Promise<void>
  fetchLecturerProfiles: () => Promise<void>
  fetchAdminProfiles: () => Promise<void>
}
