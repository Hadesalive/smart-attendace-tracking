"use server"

import { supabaseAdmin } from "../supabase/admin"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schemas
const UserSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  fullName: z.string().min(2, { message: "Full name is required." }),
  role: z.enum(["admin", "lecturer", "student"], { message: "A valid role must be selected." }),
})

const CourseSchema = z.object({
  courseName: z.string().min(3, { message: "Course name is required." }),
  courseCode: z.string().min(3, { message: "Course code is required." }),
  lecturerId: z.string().uuid({ message: "A lecturer must be selected." }),
})

const EnrollmentSchema = z.object({
  studentId: z.string().uuid({ message: "A student must be selected." }),
  courseId: z.string().uuid({ message: "A course must be selected." }),
})

// --- USER MANAGEMENT ---
export async function createUser(prevState: any, formData: FormData) {
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
  } catch (e: any) {
    return { type: "error", message: `Error creating user: ${e.message}` }
  }
}

// --- COURSE MANAGEMENT ---
export async function createCourse(prevState: any, formData: FormData) {
  const validatedFields = CourseSchema.safeParse({
    courseName: formData.get("courseName"),
    courseCode: formData.get("courseCode"),
    lecturerId: formData.get("lecturerId"),
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { courseName, courseCode, lecturerId } = validatedFields.data

  const supabase = supabaseAdmin

  const { error } = await supabase.from("courses").insert({
    course_name: courseName,
    course_code: courseCode,
    lecturer_id: lecturerId,
  })

  if (error) {
    return { type: "error", message: `Database Error: Failed to create course. ${error.message}` }
  }

  revalidatePath("/dashboard")
  return { type: "success", message: "Course created successfully." }
}

export async function updateCourse(prevState: any, formData: FormData) {
  const courseId = formData.get("courseId") as string
  const validatedFields = CourseSchema.safeParse({
    courseName: formData.get("courseName"),
    courseCode: formData.get("courseCode"),
    lecturerId: formData.get("lecturerId"),
  })

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { courseName, courseCode, lecturerId } = validatedFields.data

  const supabase = supabaseAdmin

  const { error } = await supabase
    .from("courses")
    .update({
      course_name: courseName,
      course_code: courseCode,
      lecturer_id: lecturerId,
    })
    .eq("id", courseId)

  if (error) {
    return { type: "error", message: `Database Error: Failed to update course. ${error.message}` }
  }

  revalidatePath("/dashboard")
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

// --- SESSION MANAGEMENT ---

const sessionSchema = z.object({
  course_id: z.string(),
  session_name: z.string(),
  session_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  attendance_method: z.enum(["qr_code", "facial_recognition", "hybrid"]),
  lecturer_id: z.string(),
});

export async function createSession(prevState: any, formData: FormData) {
  const validatedFields = sessionSchema.safeParse({
    course_id: formData.get('course_id'),
    session_name: formData.get('session_name'),
    session_date: formData.get('session_date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    attendance_method: formData.get('attendance_method'),
    lecturer_id: formData.get('lecturer_id'),
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
    ...rest,
    session_date: utcStart.date,
    start_time: utcStart.time,
    end_time: utcEnd.time,
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
