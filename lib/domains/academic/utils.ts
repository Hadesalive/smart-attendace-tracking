import { AcademicYear, Semester, Department, Program, Classroom, Section } from './types'

export const getCurrentAcademicYear = (academicYears: AcademicYear[]): AcademicYear | null => {
  return academicYears.find(year => year.is_current) || null
}

export const getCurrentSemester = (semesters: Semester[]): Semester | null => {
  return semesters.find(semester => semester.is_current) || null
}

export const getActiveDepartments = (departments: Department[]): Department[] => {
  return departments.filter(dept => dept.is_active)
}

export const getActivePrograms = (programs: Program[]): Program[] => {
  return programs.filter(program => program.is_active)
}

export const getActiveClassrooms = (classrooms: Classroom[]): Classroom[] => {
  return classrooms.filter(classroom => classroom.is_active)
}

export const getActiveSections = (sections: Section[]): Section[] => {
  return sections.filter(section => section.is_active)
}

export const getSectionsByProgram = (sections: Section[], programId: string): Section[] => {
  return sections.filter(section => section.program_id === programId)
}

export const getSectionsByAcademicYear = (sections: Section[], academicYearId: string): Section[] => {
  return sections.filter(section => section.academic_year_id === academicYearId)
}

export const getSectionsBySemester = (sections: Section[], semesterId: string): Section[] => {
  return sections.filter(section => section.semester_id === semesterId)
}

export const getSectionsByYear = (sections: Section[], year: number): Section[] => {
  return sections.filter(section => section.year === year)
}

export const getClassroomsByBuilding = (classrooms: Classroom[], building: string): Classroom[] => {
  return classrooms.filter(classroom => classroom.building === building)
}

export const getProgramsByDepartment = (programs: Program[], departmentId: string): Program[] => {
  return programs.filter(program => program.program_id === departmentId)
}

export const sortAcademicYearsByDate = (academicYears: AcademicYear[]): AcademicYear[] => {
  return [...academicYears].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )
}

export const sortSemestersByDate = (semesters: Semester[]): Semester[] => {
  return [...semesters].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )
}

export const sortSectionsByCode = (sections: Section[]): Section[] => {
  return [...sections].sort((a, b) => a.section_code.localeCompare(b.section_code))
}

export const getAcademicStats = (state: {
  academicYears: AcademicYear[]
  semesters: Semester[]
  departments: Department[]
  programs: Program[]
  classrooms: Classroom[]
  sections: Section[]
}) => {
  return {
    totalAcademicYears: state.academicYears.length,
    totalSemesters: state.semesters.length,
    totalDepartments: state.departments.length,
    activeDepartments: state.departments.filter(d => d.is_active).length,
    totalPrograms: state.programs.length,
    activePrograms: state.programs.filter(p => p.is_active).length,
    totalClassrooms: state.classrooms.length,
    activeClassrooms: state.classrooms.filter(c => c.is_active).length,
    totalSections: state.sections.length,
    activeSections: state.sections.filter(s => s.is_active).length
  }
}

export const isAcademicYearActive = (academicYear: AcademicYear): boolean => {
  const now = new Date()
  const startDate = new Date(academicYear.start_date)
  const endDate = new Date(academicYear.end_date)
  return now >= startDate && now <= endDate
}

export const isSemesterActive = (semester: Semester): boolean => {
  const now = new Date()
  const startDate = new Date(semester.start_date)
  const endDate = new Date(semester.end_date)
  return now >= startDate && now <= endDate
}

export const getSectionCapacityUtilization = (section: Section): number => {
  if (section.max_capacity === 0) return 0
  return Math.round((section.current_enrollment / section.max_capacity) * 100)
}

export const getSectionsWithHighUtilization = (sections: Section[], threshold: number = 90): Section[] => {
  return sections.filter(section => getSectionCapacityUtilization(section) >= threshold)
}

export const getSectionsWithLowUtilization = (sections: Section[], threshold: number = 50): Section[] => {
  return sections.filter(section => getSectionCapacityUtilization(section) <= threshold)
}
