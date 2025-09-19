"use server"

import { supabaseAdmin } from "../../supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Session Schema
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

export async function createSession(prevState: any, formData: FormData) {
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
