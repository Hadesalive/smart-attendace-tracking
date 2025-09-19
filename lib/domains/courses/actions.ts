"use server"

import { supabaseAdmin } from "../../supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schemas
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

// --- COURSE MANAGEMENT ---
export async function createCourse(prevState: any, formData: FormData) {
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

export async function updateCourse(prevState: any, formData: FormData) {
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
export async function createEnrollment(prevState: any, formData: FormData) {
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

// Course Assignment CRUD operations
export async function createCourseAssignment(prevState: any, formData: FormData) {
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

export async function updateCourseAssignment(id: string, prevState: any, formData: FormData) {
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
