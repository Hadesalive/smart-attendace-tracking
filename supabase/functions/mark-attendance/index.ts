import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  session_id: string;
  student_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      // These are automatically set in the Supabase Edge Function environment
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Pass the user's auth token to the database
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { session_id, student_id }: RequestBody = await req.json()

    if (!session_id || !student_id) {
      throw new Error('Missing session_id or student_id in the request body.')
    }

    // 1. Check if the session is valid and active (triggering deployment)
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('id, session_date, start_time, end_time, course_id, section_id')
      .eq('id', session_id)
      .single()

    if (sessionError) throw new Error(`Session validation error: ${sessionError.message}`)
    if (!session) throw new Error('Invalid or expired session.')

    const now = new Date()
    // Combine date and time strings to create valid ISO 8601 strings for accurate parsing
    const startTime = new Date(`${session.session_date}T${session.start_time}`)
    const endTime = new Date(`${session.session_date}T${session.end_time}`)

    if (now < startTime || now > endTime) {
      throw new Error(`Attendance can only be marked within the session time. Current time: ${now.toISOString()}, Session start: ${startTime.toISOString()}, Session end: ${endTime.toISOString()}`)
    }

    // 2. Check if the student is enrolled in the section for this session
    if (!session.section_id) {
      throw new Error('This session is not assigned to any section. Please contact your lecturer.')
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('section_enrollments')
      .select(`
        id,
        section_id,
        status,
        sections!inner(
          id,
          section_code,
          program_id
        )
      `)
      .eq('student_id', student_id)
      .eq('section_id', session.section_id)
      .eq('status', 'active')
      .maybeSingle()

    if (enrollmentError) throw new Error(`Section enrollment check error: ${enrollmentError.message}`)
    if (!enrollment) {
      console.log('Section enrollment check failed:', {
        student_id,
        session_section_id: session.section_id,
        course_id: session.course_id
      })
      throw new Error('You are not enrolled in this section or the session is not for your section.')
    }

    console.log('Section enrollment validated:', {
      student_id,
      section_id: enrollment.section_id,
      section_code: enrollment.sections?.section_code,
      status: enrollment.status
    })

    // 3. Check if attendance has already been marked (prevent duplicates)
    const { data: existingAttendance, error: existingAttendanceError } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('session_id', session_id)
      .eq('student_id', student_id)
      .maybeSingle()

    if (existingAttendanceError) throw new Error(`Duplicate check error: ${existingAttendanceError.message}`)
    if (existingAttendance) throw new Error('Attendance has already been marked for this session.')

    // 4. Insert the new attendance record
    const { error: insertError } = await supabase.from('attendance_records').insert({
      session_id,
      student_id,
      status: 'present',
      marked_at: new Date().toISOString(),
      method_used: 'qr_code', // Fulfill the not-null constraint
    })

    if (insertError) throw new Error(`Failed to mark attendance: ${insertError.message}`)

    return new Response(JSON.stringify({ message: 'Attendance marked successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Function Error:', error.message); // Log the specific error
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
