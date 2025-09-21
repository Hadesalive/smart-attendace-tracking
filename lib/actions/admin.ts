"use server"

import { supabaseAdmin } from "../supabase/admin"
import { createClient } from "@supabase/supabase-js"
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

interface UserFormData {
  email: string
  password: string
  fullName: string
  role: 'admin' | 'lecturer' | 'student'
}

interface CourseFormData {
  course_name: string
  course_code: string
  credits: number
  department?: string
  lecturer_id?: string
}

interface EnrollmentFormData {
  studentId: string
  courseId: string
}

interface SessionFormData {
  title: string
  course_id: string
  start_time: string
  end_time: string
  location?: string
  description?: string
}

interface AcademicYearFormData {
  year_name: string
  start_date: string
  end_date: string
  is_current?: boolean
  description?: string
}

interface SemesterFormData {
  semester_name: string
  semester_number: number
  academic_year_id: string
  start_date: string
  end_date: string
  is_current?: boolean
}

interface DepartmentFormData {
  department_code: string
  department_name: string
  head_id?: string
  description?: string
  is_active?: boolean
}

interface ProgramFormData {
  program_code: string
  program_name: string
  department_id: string
  degree_type: string
  duration_years: number
  description?: string
  is_active?: boolean
}

interface ClassroomFormData {
  room_number: string
  building: string
  capacity: number
  room_type: string
  description?: string
  is_active?: boolean
}

interface SectionFormData {
  section_name: string
  program_id: string
  academic_year_id: string
  semester_id: string
  max_students?: number
  is_active?: boolean
}

interface CourseAssignmentFormData {
  course_id: string
  section_id: string
  academic_year_id: string
  semester_id: string
  is_mandatory?: boolean
  max_students?: number
}

// Schemas
const UserSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  fullName: z.string().min(2, { message: "Full name is required." }),
  role: z.enum(["admin", "lecturer", "student"], { message: "A valid role must be selected." }),
})

const CourseSchema = z.object({
  course_name: z.string().min(3, { message: "Course name is required." }),
  course_code: z.string().min(3, { message: "Course code is required." }),
  credits: z.number().min(1, { message: "Credits must be at least 1." }),
  department: z.string().optional(),
  lecturer_id: z.string().uuid().optional(),
})

const CourseAssignmentSchema = z.object({
  course_id: z.string().uuid({ message: "Course is required." }),
  section_id: z.string().uuid({ message: "Section is required." }),
  academic_year_id: z.string().uuid({ message: "Academic year is required." }),
  semester_id: z.string().uuid({ message: "Semester is required." }),
  is_mandatory: z.boolean().optional(),
  max_students: z.number().min(1).optional(),
})

const EnrollmentSchema = z.object({
  studentId: z.string().uuid({ message: "A student must be selected." }),
  courseId: z.string().uuid({ message: "A course must be selected." }),
})

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
  classroom_id: z.string().uuid().optional(),
  max_capacity: z.number().min(1, { message: "Max capacity must be at least 1." }),
  current_enrollment: z.number().min(0).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

// --- USER MANAGEMENT ---
export async function createUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = UserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password, fullName, role } = validatedFields.data

  const supabase = supabaseAdmin

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for simplicity
    })

    if (authError) throw new Error(authError.message)
    if (!authData.user) throw new Error("User was not created in the authentication system.")

    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      role,
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(profileError.message)
    }

    revalidatePath("/dashboard")
    return { type: "success", message: `Successfully created user: ${fullName}` }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
    return { message: `Error creating user: ${errorMessage}` }
  }
}

// --- COURSE MANAGEMENT ---
export async function createCourse(prevState: FormState, formData: FormData): Promise<FormState> {
  console.log('Server action received course form data:', {
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    credits: formData.get("credits"),
    department: formData.get("department"),
    lecturer_id: formData.get("lecturer_id")
  })

  const validatedFields = CourseSchema.safeParse({
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    credits: parseInt(formData.get("credits") as string) || 3,
    department: formData.get("department") || undefined,
    lecturer_id: formData.get("lecturer_id") || undefined,
  })

  if (!validatedFields.success) {
    console.log('Course validation errors:', validatedFields.error.flatten().fieldErrors)
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase.from("courses").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create course. ${error.message}` }
  }

  revalidatePath("/dashboard")
  return { type: "success", message: "Course created successfully." }
}

export async function updateCourse(prevState: FormState, formData: FormData): Promise<FormState> {
  const courseId = formData.get("courseId") as string
  
  console.log('Server action received course update form data:', {
    courseId,
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    credits: formData.get("credits"),
    department: formData.get("department"),
    lecturer_id: formData.get("lecturer_id")
  })

  const validatedFields = CourseSchema.safeParse({
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    credits: parseInt(formData.get("credits") as string) || 3,
    department: formData.get("department") || undefined,
    lecturer_id: formData.get("lecturer_id") || undefined,
  })

  if (!validatedFields.success) {
    console.log('Course update validation errors:', validatedFields.error.flatten().fieldErrors)
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase
    .from("courses")
    .update(validatedFields.data)
    .eq("id", courseId)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update course. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course updated successfully." }
}

export async function deleteCourse(courseId: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("courses").delete().eq("id", courseId)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete course. ${error.message}` }
  }

  revalidatePath("/dashboard")
  return { type: "success", message: "Course deleted successfully." }
}

// --- ENROLLMENT MANAGEMENT ---
export async function createEnrollment(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = EnrollmentSchema.safeParse({
    studentId: formData.get("studentId"),
    courseId: formData.get("courseId"),
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { studentId, courseId } = validatedFields.data

  const supabase = supabaseAdmin

  const { error } = await supabase.from("enrollments").insert({
    student_id: studentId,
    course_id: courseId,
  })

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      return { type: "error", message: "This student is already enrolled in this course." }
    }
    return { type: "error", message: `Database Error: Failed to create enrollment. ${error.message}` }
  }

  revalidatePath("/dashboard")
  return { type: "success", message: "Enrollment created successfully." }
}

export async function deleteEnrollment(enrollmentId: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete enrollment. ${error.message}` }
  }

  revalidatePath("/dashboard")
  return { type: "success", message: "Enrollment deleted successfully." }
}

// --- SESSION MANAGEMENT ---

const sessionSchema = z.object({
  course_id: z.string(),
  session_name: z.string(),
  session_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  attendance_method: z.enum(["qr_code", "facial_recognition", "hybrid"]),
  lecturer_id: z.string(),
  location: z.string().optional(),
  capacity: z.string().optional(),
  description: z.string().optional(),
});

export async function createSession(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = sessionSchema.safeParse({
    course_id: formData.get('course_id'),
    session_name: formData.get('session_name'),
    session_date: formData.get('session_date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    attendance_method: formData.get('attendance_method'),
    lecturer_id: formData.get('lecturer_id'),
    location: formData.get('location'),
    capacity: formData.get('capacity'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      message: 'Invalid form data. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = supabaseAdmin;

  const { session_date, start_time, end_time, ...rest } = validatedFields.data;

  // Combine date and time to create a local Date object, then convert to UTC.
  // This ensures all timestamps are stored in a consistent timezone.
  const getUTCDateTime = (dateStr: string, timeStr: string) => {
    const localDateTime = new Date(`${dateStr}T${timeStr}`);
    return {
      date: localDateTime.toISOString().split('T')[0], // YYYY-MM-DD in UTC
      time: localDateTime.toISOString().split('T')[1], // HH:mm:ss.sssZ in UTC
    };
  };

  const utcStart = getUTCDateTime(session_date, start_time);
  const utcEnd = getUTCDateTime(session_date, end_time);

  const { error } = await supabase.from('attendance_sessions').insert({
    course_id: validatedFields.data.course_id,
    session_name: validatedFields.data.session_name,
    session_date: utcStart.date,
    start_time: utcStart.time,
    end_time: utcEnd.time,
    attendance_method: validatedFields.data.attendance_method,
    lecturer_id: validatedFields.data.lecturer_id,
    location: validatedFields.data.location || null,
    capacity: validatedFields.data.capacity ? parseInt(validatedFields.data.capacity) : null,
    description: validatedFields.data.description || null,
  });

  if (error) {
    return {
      type: 'error' as const,
      message: `Database Error: Failed to create session. ${error.message}`,
    };
  }

  revalidatePath('/dashboard');
  return { type: 'success' as const, message: 'Session created successfully.' };
}

// ============================================================================
// ACADEMIC STRUCTURE CRUD OPERATIONS
// ============================================================================

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

// Course Assignment CRUD operations
export async function createCourseAssignment(prevState: FormState, formData: FormData): Promise<FormState> {
  console.log('Server action received course assignment form data:', {
    course_id: formData.get("course_id"),
    section_id: formData.get("section_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    is_mandatory: formData.get("is_mandatory"),
    max_students: formData.get("max_students")
  })

  const validatedFields = CourseAssignmentSchema.safeParse({
    course_id: formData.get("course_id"),
    section_id: formData.get("section_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    is_mandatory: formData.get("is_mandatory") === "true",
    max_students: formData.get("max_students") ? parseInt(formData.get("max_students") as string) : undefined,
  })

  if (!validatedFields.success) {
    console.log('Course assignment validation errors:', validatedFields.error.flatten().fieldErrors)
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase.from("course_sections").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create course assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course assignment created successfully." }
}

export async function updateCourseAssignment(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CourseAssignmentSchema.safeParse({
    course_id: formData.get("course_id"),
    section_id: formData.get("section_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    is_mandatory: formData.get("is_mandatory") === "true",
    max_students: formData.get("max_students") ? parseInt(formData.get("max_students") as string) : undefined,
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("course_sections").update(validatedFields.data).eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update course assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course assignment updated successfully." }
}

export async function deleteCourseAssignment(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("course_sections").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete course assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course assignment deleted successfully." }
}
