"use server"

import { supabaseAdmin } from "../../supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FormState {
  type?: string
  message: string
  errors?: Record<string, string[]>
}

// Academic Structure Schemas
const AcademicYearSchema = z.object({
  year_name: z.string().min(1, { message: "Year name is required." }),
  start_date: z.string().min(1, { message: "Start date is required." }),
  end_date: z.string().min(1, { message: "End date is required." }),
  is_current: z.boolean().optional(),
  description: z.string().optional(),
})

const SemesterSchema = z.object({
  semester_name: z.string().min(1, { message: "Semester name is required." }),
  semester_number: z.number().min(1).max(2, { message: "Semester number must be 1 or 2." }),
  academic_year_id: z.string().uuid({ message: "Academic year is required." }),
  start_date: z.string().min(1, { message: "Start date is required." }),
  end_date: z.string().min(1, { message: "End date is required." }),
  is_current: z.boolean().optional(),
})

const DepartmentSchema = z.object({
  department_code: z.string().min(1, { message: "Department code is required." }),
  department_name: z.string().min(1, { message: "Department name is required." }),
  head_id: z.string().uuid().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

const ProgramSchema = z.object({
  program_code: z.string().min(1, { message: "Program code is required." }),
  program_name: z.string().min(1, { message: "Program name is required." }),
  department_id: z.string().uuid({ message: "Department is required." }),
  degree_type: z.string().min(1, { message: "Degree type is required." }),
  duration_years: z.number().min(1, { message: "Duration must be at least 1 year." }),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

const ClassroomSchema = z.object({
  building: z.string().min(1, { message: "Building is required." }),
  room_number: z.string().min(1, { message: "Room number is required." }),
  capacity: z.number().min(1, { message: "Capacity must be at least 1." }),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

const SectionSchema = z.object({
  section_code: z.string().min(1, { message: "Section code is required." }),
  program_id: z.string().uuid({ message: "Program is required." }),
  academic_year_id: z.string().uuid({ message: "Academic year is required." }),
  semester_id: z.string().uuid({ message: "Semester is required." }),
  year: z.number().min(1).max(4, { message: "Year must be between 1 and 4." }),
  classroom_id: z.union([z.string().uuid(), z.literal(''), z.null()]).transform(val => val === '' ? null : val).optional(),
  max_capacity: z.number().min(1, { message: "Max capacity must be at least 1." }),
  current_enrollment: z.number().min(0).optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

// --- ACADEMIC YEAR MANAGEMENT ---
export async function createAcademicYear(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = AcademicYearSchema.safeParse({
    year_name: formData.get("year_name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_current: formData.get("is_current") === "true",
    description: formData.get("description"),
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("academic_years").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create academic year. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Academic year created successfully." }
}

export async function updateAcademicYear(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = AcademicYearSchema.safeParse({
    year_name: formData.get("year_name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_current: formData.get("is_current") === "true",
    description: formData.get("description"),
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase
    .from("academic_years")
    .update(validatedFields.data)
    .eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update academic year. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Academic year updated successfully." }
}

export async function deleteAcademicYear(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("academic_years").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete academic year. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Academic year deleted successfully." }
}

// --- SEMESTER MANAGEMENT ---
export async function createSemester(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SemesterSchema.safeParse({
    semester_name: formData.get("semester_name"),
    semester_number: parseInt(formData.get("semester_number") as string),
    academic_year_id: formData.get("academic_year_id"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_current: formData.get("is_current") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("semesters").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create semester. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Semester created successfully." }
}

export async function updateSemester(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SemesterSchema.safeParse({
    semester_name: formData.get("semester_name"),
    semester_number: parseInt(formData.get("semester_number") as string),
    academic_year_id: formData.get("academic_year_id"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_current: formData.get("is_current") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase
    .from("semesters")
    .update(validatedFields.data)
    .eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update semester. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Semester updated successfully." }
}

export async function deleteSemester(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("semesters").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete semester. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Semester deleted successfully." }
}

// --- DEPARTMENT MANAGEMENT ---
export async function createDepartment(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = DepartmentSchema.safeParse({
    department_code: formData.get("department_code"),
    department_name: formData.get("department_name"),
    head_id: formData.get("head_id") || undefined,
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("departments").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create department. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Department created successfully." }
}

export async function updateDepartment(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = DepartmentSchema.safeParse({
    department_code: formData.get("department_code"),
    department_name: formData.get("department_name"),
    head_id: formData.get("head_id") || undefined,
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase
    .from("departments")
    .update(validatedFields.data)
    .eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update department. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Department updated successfully." }
}

export async function deleteDepartment(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("departments").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete department. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Department deleted successfully." }
}

// --- PROGRAM MANAGEMENT ---
export async function createProgram(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ProgramSchema.safeParse({
    program_code: formData.get("program_code"),
    program_name: formData.get("program_name"),
    department_id: formData.get("department_id"),
    degree_type: formData.get("degree_type"),
    duration_years: parseInt(formData.get("duration_years") as string),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("programs").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create program. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Program created successfully." }
}

export async function updateProgram(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ProgramSchema.safeParse({
    program_code: formData.get("program_code"),
    program_name: formData.get("program_name"),
    department_id: formData.get("department_id"),
    degree_type: formData.get("degree_type"),
    duration_years: parseInt(formData.get("duration_years") as string),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase
    .from("programs")
    .update(validatedFields.data)
    .eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update program. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Program updated successfully." }
}

export async function deleteProgram(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("programs").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete program. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Program deleted successfully." }
}

// --- CLASSROOM MANAGEMENT ---
export async function createClassroom(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ClassroomSchema.safeParse({
    building: formData.get("building"),
    room_number: formData.get("room_number"),
    capacity: parseInt(formData.get("capacity") as string),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("classrooms").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create classroom. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Classroom created successfully." }
}

export async function updateClassroom(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ClassroomSchema.safeParse({
    building: formData.get("building"),
    room_number: formData.get("room_number"),
    capacity: parseInt(formData.get("capacity") as string),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase
    .from("classrooms")
    .update(validatedFields.data)
    .eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update classroom. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Classroom updated successfully." }
}

export async function deleteClassroom(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("classrooms").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete classroom. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Classroom deleted successfully." }
}

// --- SECTION MANAGEMENT ---
export async function createSection(prevState: FormState, formData: FormData): Promise<FormState> {
  console.log('Server action received form data:', {
    section_code: formData.get("section_code"),
    program_id: formData.get("program_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    year: formData.get("year"),
    classroom_id: formData.get("classroom_id"),
    max_capacity: formData.get("max_capacity"),
    current_enrollment: formData.get("current_enrollment"),
    description: formData.get("description"),
    is_active: formData.get("is_active")
  })

  const validatedFields = SectionSchema.safeParse({
    section_code: formData.get("section_code"),
    program_id: formData.get("program_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    year: parseInt(formData.get("year") as string),
    classroom_id: formData.get("classroom_id") === null ? undefined : formData.get("classroom_id"),
    max_capacity: parseInt(formData.get("max_capacity") as string),
    current_enrollment: parseInt(formData.get("current_enrollment") as string) || 0,
    description: formData.get("description"),
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    console.log('Validation errors:', validatedFields.error.flatten().fieldErrors)
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("sections").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create section. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Section created successfully." }
}

export async function updateSection(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SectionSchema.safeParse({
    section_code: formData.get("section_code"),
    program_id: formData.get("program_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    year: parseInt(formData.get("year") as string),
    classroom_id: formData.get("classroom_id") === null ? undefined : formData.get("classroom_id"),
    max_capacity: parseInt(formData.get("max_capacity") as string),
    current_enrollment: parseInt(formData.get("current_enrollment") as string) || 0,
    is_active: formData.get("is_active") === "true",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase
    .from("sections")
    .update(validatedFields.data)
    .eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update section. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Section updated successfully." }
}

export async function deleteSection(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("sections").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete section. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Section deleted successfully." }
}
