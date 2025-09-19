"use client"

import React, { useState } from 'react'
import { 
  AcademicYearForm, 
  SemesterForm, 
  DepartmentForm, 
  ProgramForm, 
  ClassroomForm, 
  SectionForm 
} from './index'

// Simple types for the form manager
interface AcademicYear {
  id?: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
  description?: string
}

interface Semester {
  id?: string
  academic_year_id: string
  semester_name: string
  semester_number: number
  start_date: string
  end_date: string
  is_current: boolean
  description?: string
}

interface Department {
  id?: string
  department_code: string
  department_name: string
  description?: string
  head_id?: string
  is_active: boolean
}

interface Program {
  id?: string
  program_code: string
  program_name: string
  department_id: string
  degree_type: string
  duration_years: number
  total_credits: number
  description?: string
  is_active: boolean
}

interface Classroom {
  id?: string
  building: string
  room_number: string
  room_name?: string
  capacity: number
  room_type: string
  equipment: string[]
  description?: string
  is_active: boolean
}

interface Section {
  id?: string
  section_code: string
  program_id: string
  academic_year_id: string
  semester_id: string
  year: number
  max_capacity: number
  current_enrollment: number
  classroom_id?: string
  description?: string
  is_active: boolean
}

interface User {
  id: string
  full_name: string
  role: string
}

interface AcademicFormManagerProps {
  // Data arrays
  academicYears: AcademicYear[]
  semesters: Semester[]
  departments: Department[]
  programs: Program[]
  classrooms: Classroom[]
  sections: Section[]
  users: User[]
  
  // CRUD handlers
  onSaveAcademicYear: (data: AcademicYear) => Promise<void>
  onSaveSemester: (data: Semester) => Promise<void>
  onSaveDepartment: (data: Department) => Promise<void>
  onSaveProgram: (data: Program) => Promise<void>
  onSaveClassroom: (data: Classroom) => Promise<void>
  onSaveSection: (data: Section) => Promise<void>
  
  // Delete handlers
  onDeleteAcademicYear: (id: string) => Promise<void>
  onDeleteSemester: (id: string) => Promise<void>
  onDeleteDepartment: (id: string) => Promise<void>
  onDeleteProgram: (id: string) => Promise<void>
  onDeleteClassroom: (id: string) => Promise<void>
  onDeleteSection: (id: string) => Promise<void>
}

type FormType = 'academic-year' | 'semester' | 'department' | 'program' | 'classroom' | 'section'
type FormMode = 'create' | 'edit'

interface FormState {
  type: FormType | null
  mode: FormMode | null
  data: any
}

export default function AcademicFormManager({
  academicYears,
  semesters,
  departments,
  programs,
  classrooms,
  sections,
  users,
  onSaveAcademicYear,
  onSaveSemester,
  onSaveDepartment,
  onSaveProgram,
  onSaveClassroom,
  onSaveSection,
  onDeleteAcademicYear,
  onDeleteSemester,
  onDeleteDepartment,
  onDeleteProgram,
  onDeleteClassroom,
  onDeleteSection
}: AcademicFormManagerProps) {
  const [formState, setFormState] = useState<FormState>({
    type: null,
    mode: null,
    data: null
  })

  const openForm = (type: FormType, mode: FormMode, data?: any) => {
    setFormState({ type, mode, data })
  }

  const closeForm = () => {
    setFormState({ type: null, mode: null, data: null })
  }

  const handleSave = async (data: any) => {
    try {
      switch (formState.type) {
        case 'academic-year':
          await onSaveAcademicYear(data)
          break
        case 'semester':
          await onSaveSemester(data)
          break
        case 'department':
          await onSaveDepartment(data)
          break
        case 'program':
          await onSaveProgram(data)
          break
        case 'classroom':
          await onSaveClassroom(data)
          break
        case 'section':
          await onSaveSection(data)
          break
      }
      closeForm()
    } catch (error) {
      console.error('Error saving data:', error)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      switch (formState.type) {
        case 'academic-year':
          await onDeleteAcademicYear(id)
          break
        case 'semester':
          await onDeleteSemester(id)
          break
        case 'department':
          await onDeleteDepartment(id)
          break
        case 'program':
          await onDeleteProgram(id)
          break
        case 'classroom':
          await onDeleteClassroom(id)
          break
        case 'section':
          await onDeleteSection(id)
          break
      }
      closeForm()
    } catch (error) {
      console.error('Error deleting data:', error)
      throw error
    }
  }

  // Render appropriate form based on state
  const renderForm = () => {
    if (!formState.type || !formState.mode) return null

    const commonProps = {
      open: true,
      onOpenChange: closeForm,
      mode: formState.mode as 'create' | 'edit',
      onSave: handleSave
    }

    switch (formState.type) {
      case 'academic-year':
        return (
          <AcademicYearForm
            {...commonProps}
            academicYear={formState.data}
          />
        )

      case 'semester':
        return (
          <SemesterForm
            {...commonProps}
            semester={formState.data}
            academicYears={academicYears as any}
          />
        )

      case 'department':
        return (
          <DepartmentForm
            {...commonProps}
            department={formState.data}
            users={users as any}
          />
        )

      case 'program':
        return (
          <ProgramForm
            {...commonProps}
            program={formState.data}
            departments={departments as any}
          />
        )

      case 'classroom':
        return (
          <ClassroomForm
            {...commonProps}
            classroom={formState.data}
          />
        )

      case 'section':
        return (
          <SectionForm
            {...commonProps}
            section={formState.data}
            academicYears={academicYears as any}
            semesters={semesters as any}
            programs={programs as any}
            classrooms={classrooms as any}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderForm()}
      
      {/* Form Controls - These would be used by parent components */}
      <div style={{ display: 'none' }}>
        {/* This is a way to expose the openForm function to parent components */}
        {/* In a real implementation, you might want to use a different pattern */}
        <button onClick={() => openForm('academic-year', 'create')}>Create Academic Year</button>
        <button onClick={() => openForm('semester', 'create')}>Create Semester</button>
        <button onClick={() => openForm('department', 'create')}>Create Department</button>
        <button onClick={() => openForm('program', 'create')}>Create Program</button>
        <button onClick={() => openForm('classroom', 'create')}>Create Classroom</button>
        <button onClick={() => openForm('section', 'create')}>Create Section</button>
      </div>
    </>
  )
}

// Hook for using the form manager
export function useAcademicFormManager(props: AcademicFormManagerProps) {
  const [formState, setFormState] = useState<FormState>({
    type: null,
    mode: null,
    data: null
  })

  const openForm = (type: FormType, mode: FormMode, data?: any) => {
    setFormState({ type, mode, data })
  }

  const closeForm = () => {
    setFormState({ type: null, mode: null, data: null })
  }
  
  return {
    openForm,
    closeForm,
    formState,
    FormManager: () => <AcademicFormManager {...props} />
  }
}
