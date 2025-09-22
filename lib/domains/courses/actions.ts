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
  program_id: z.string().uuid({ message: "Program is required." }),
  academic_year_id: z.string().uuid({ message: "Academic year is required." }),
  semester_id: z.string().uuid({ message: "Semester is required." }),
  year: z.number().min(1).max(4, { message: "Year must be between 1 and 4." }),
  is_mandatory: z.boolean().optional(),
  max_students: z.number().min(1).optional(),
})

const EnrollmentSchema = z.object({
  studentId: z.string().uuid({ message: "A student must be selected." }),
  courseId: z.string().uuid({ message: "A course must be selected." }),
})

const LecturerAssignmentSchema = z.object({
  lecturer_id: z.string().uuid({ message: "Lecturer is required." }),
  course_id: z.string().uuid({ message: "Course is required." }),
  academic_year_id: z.string().uuid({ message: "Academic year is required." }),
  semester_id: z.string().uuid({ message: "Semester is required." }),
  program_id: z.string().uuid({ message: "Program is required." }),
  section_id: z.string().uuid({ message: "Section is required." }),
  is_primary: z.boolean().optional(),
  teaching_hours_per_week: z.number().min(1).max(20).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

// --- COURSE MANAGEMENT ---
export async function createCourse(prevState: any, formData: FormData) {

  const validatedFields = CourseSchema.safeParse({
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    credits: parseInt(formData.get("credits") as string) || 3,
    department: formData.get("department") || undefined,
    lecturer_id: formData.get("lecturer_id") || undefined,
  })

  if (!validatedFields.success) {
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

  const validatedFields = CourseSchema.safeParse({
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    credits: parseInt(formData.get("credits") as string) || 3,
    department: formData.get("department") || undefined,
    lecturer_id: formData.get("lecturer_id") || undefined,
  })

  if (!validatedFields.success) {
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

// Section enrollment schema
const SectionEnrollmentSchema = z.object({
  student_id: z.string().uuid({ message: "Student is required." }),
  section_id: z.string().uuid({ message: "Section is required." }),
  enrollment_date: z.string().min(1, { message: "Enrollment date is required." }),
  status: z.enum(['active', 'dropped', 'completed']).optional(),
  grade: z.string().optional(),
  notes: z.string().optional(),
})

export async function createSectionEnrollment(prevState: any, formData: FormData) {
  const validatedFields = SectionEnrollmentSchema.safeParse({
    student_id: formData.get("student_id"),
    section_id: formData.get("section_id"),
    enrollment_date: formData.get("enrollment_date"),
    status: formData.get("status") || "active",
    grade: formData.get("grade") || "",
    notes: formData.get("notes") || "",
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin

  // Check if student is already enrolled in another section of the same program/semester
  const { data: sectionData } = await supabase
    .from('sections')
    .select('program_id, semester_id, academic_year_id')
    .eq('id', validatedFields.data.section_id)
    .single()

  if (sectionData) {
    // Check for existing enrollment in same program/semester
    const { data: existingEnrollments } = await supabase
      .from('section_enrollments')
      .select(`
        id,
        sections!inner(program_id, semester_id, academic_year_id)
      `)
      .eq('student_id', validatedFields.data.student_id)
      .eq('status', 'active')

    const hasExistingEnrollment = existingEnrollments?.some(enrollment => {
      const sections = Array.isArray(enrollment.sections) ? enrollment.sections[0] : enrollment.sections
      return sections?.program_id === sectionData.program_id &&
             sections?.semester_id === sectionData.semester_id &&
             sections?.academic_year_id === sectionData.academic_year_id
    })

    if (hasExistingEnrollment) {
      return { type: "error", message: "Student is already enrolled in another section of the same program for this semester." }
    }
  }

  const { error } = await supabase.from("section_enrollments").insert({
    student_id: validatedFields.data.student_id,
    section_id: validatedFields.data.section_id,
    enrollment_date: validatedFields.data.enrollment_date,
    status: validatedFields.data.status,
    grade: validatedFields.data.grade,
    notes: validatedFields.data.notes,
  })

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      return { type: "error", message: "This student is already enrolled in this section." }
    }
    return { type: "error", message: `Database Error: Failed to create section enrollment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Section enrollment created successfully." }
}

export async function updateSectionEnrollment(
  prevState: any,
  formData: FormData
): Promise<{ type: "success" | "error"; message: string }> {
  const supabase = supabaseAdmin

  try {
    const enrollmentId = formData.get("id") as string
    const studentId = formData.get("student_id") as string
    const sectionId = formData.get("section_id") as string
    const enrollmentDate = formData.get("enrollment_date") as string
    const status = formData.get("status") as string
    const grade = formData.get("grade") as string
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!enrollmentId || !studentId || !sectionId || !enrollmentDate || !status) {
      return { type: "error", message: "Missing required fields" }
    }

    // Validate enrollment data
    const enrollmentData = {
      student_id: studentId,
      section_id: sectionId,
      enrollment_date: enrollmentDate,
      status: status as 'active' | 'dropped' | 'completed',
      grade: grade || null,
      notes: notes || null
    }

    const validatedData = SectionEnrollmentSchema.parse(enrollmentData)

    // Update the section enrollment
    const { error } = await supabase
      .from("section_enrollments")
      .update(validatedData)
      .eq("id", enrollmentId)

    if (error) {
      return { type: "error", message: `Database Error: Failed to update section enrollment. ${error.message}` }
    }

    revalidatePath("/admin/academic")
    return { type: "success", message: "Section enrollment updated successfully." }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return { type: "error", message: `Database Error: Failed to update section enrollment. ${errorMessage}` }
  }
}

export async function deleteSectionEnrollment(enrollmentId: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("section_enrollments").delete().eq("id", enrollmentId)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete section enrollment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Section enrollment deleted successfully." }
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
  // Debug: Log the form data being received
  const formDataObj = {
    course_id: formData.get("course_id"),
    program_id: formData.get("program_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    year: formData.get("year") ? parseInt(formData.get("year") as string) : 1,
    is_mandatory: formData.get("is_mandatory") === "true",
    max_students: formData.get("max_students") ? parseInt(formData.get("max_students") as string) : undefined,
  }
  

  const validatedFields = CourseAssignmentSchema.safeParse(formDataObj)

  if (!validatedFields.success) {
    const validationErrors = validatedFields.error.flatten().fieldErrors
    return { type: "error", message: "Validation failed.", errors: validationErrors }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase.from("course_assignments").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create course assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course assignment created successfully." }
}

export async function updateCourseAssignment(id: string, prevState: any, formData: FormData) {
  const validatedFields = CourseAssignmentSchema.safeParse({
    course_id: formData.get("course_id"),
    program_id: formData.get("program_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    year: formData.get("year") ? parseInt(formData.get("year") as string) : 1,
    is_mandatory: formData.get("is_mandatory") === "true",
    max_students: formData.get("max_students") ? parseInt(formData.get("max_students") as string) : undefined,
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin
  const { error } = await supabase.from("course_assignments").update(validatedFields.data).eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update course assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course assignment updated successfully." }
}

export async function deleteCourseAssignment(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("course_assignments").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete course assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Course assignment deleted successfully." }
}

// --- LECTURER ASSIGNMENT MANAGEMENT ---
export async function createLecturerAssignment(prevState: any, formData: FormData) {
  const validatedFields = LecturerAssignmentSchema.safeParse({
    lecturer_id: formData.get("lecturer_id"),
    course_id: formData.get("course_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    program_id: formData.get("program_id"),
    section_id: formData.get("section_id"),
    is_primary: formData.get("is_primary") === "true",
    teaching_hours_per_week: formData.get("teaching_hours_per_week") ? parseInt(formData.get("teaching_hours_per_week") as string) : undefined,
    start_date: formData.get("start_date") || undefined,
    end_date: formData.get("end_date") || undefined,
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase.from("lecturer_assignments").insert([validatedFields.data])

  if (error) {
    return { type: "error", message: `Database Error: Failed to create lecturer assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Lecturer assignment created successfully." }
}

export async function updateLecturerAssignment(prevState: any, formData: FormData) {
  const id = formData.get("id") as string
  
  if (!id) {
    return { type: "error", message: "Assignment ID is required for update." }
  }

  const validatedFields = LecturerAssignmentSchema.safeParse({
    lecturer_id: formData.get("lecturer_id"),
    course_id: formData.get("course_id"),
    academic_year_id: formData.get("academic_year_id"),
    semester_id: formData.get("semester_id"),
    program_id: formData.get("program_id"),
    section_id: formData.get("section_id"),
    is_primary: formData.get("is_primary") === "true",
    teaching_hours_per_week: formData.get("teaching_hours_per_week") ? parseInt(formData.get("teaching_hours_per_week") as string) : undefined,
    start_date: formData.get("start_date") || undefined,
    end_date: formData.get("end_date") || undefined,
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase.from("lecturer_assignments").update(validatedFields.data).eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update lecturer assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Lecturer assignment updated successfully." }
}

export async function deleteLecturerAssignment(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("lecturer_assignments").delete().eq("id", id)

  if (error) {
    return { type: "error", message: `Database Error: Failed to delete lecturer assignment. ${error.message}` }
  }

  revalidatePath("/admin/academic")
  return { type: "success", message: "Lecturer assignment deleted successfully." }
}
