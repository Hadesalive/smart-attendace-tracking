import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "lecturer" | "student"
          student_id: string | null
          department: string | null
          profile_image_url: string | null
          face_encoding: string | null
          created_at: string
          updated_at: string
        }
      }
      courses: {
        Row: {
          id: string
          course_code: string
          course_name: string
          lecturer_id: string
          department: string | null
          credits: number
          created_at: string
        }
      }
      attendance_sessions: {
        Row: {
          id: string
          course_id: string
          lecturer_id: string
          session_name: string
          session_date: string
          start_time: string
          end_time: string
          qr_code: string | null
          is_active: boolean
          attendance_method: "qr_code" | "facial_recognition" | "hybrid"
          created_at: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          session_id: string
          student_id: string
          marked_at: string
          method_used: "qr_code" | "facial_recognition"
          location_data: any
          confidence_score: number | null
        }
      }
    }
  }
}
