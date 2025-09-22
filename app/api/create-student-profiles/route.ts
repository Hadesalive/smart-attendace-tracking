import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting to create student profiles...')

    // First, get all users with role 'student'
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'student')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    console.log(`📊 Found ${users.length} student users`)

    // Get programs, academic years, and semesters to assign to students
    const { data: programs } = await supabaseAdmin.from('programs').select('*').limit(1)
    const { data: academicYears } = await supabaseAdmin.from('academic_years').select('*').limit(1)
    const { data: semesters } = await supabaseAdmin.from('semesters').select('*').limit(1)
    const { data: sections } = await supabaseAdmin.from('sections').select('*').limit(1)

    if (!programs?.length || !academicYears?.length || !semesters?.length || !sections?.length) {
      console.error('❌ Missing required data: programs, academic years, semesters, or sections')
      return NextResponse.json({ 
        error: 'Missing required data: programs, academic years, semesters, or sections' 
      }, { status: 400 })
    }

    const program = programs[0]
    const academicYear = academicYears[0]
    const semester = semesters[0]
    const section = sections[0]

    console.log('📋 Using program:', program.program_name)
    console.log('📋 Using academic year:', academicYear.year_name)
    console.log('📋 Using semester:', semester.semester_name)

    // Create student profiles for each student user
    const studentProfiles = users.map((user, index) => ({
      user_id: user.id,
      student_id: user.student_id || `STU${Date.now()}${index}`,
      program_id: program.id,
      section_id: section.id,
      academic_year_id: academicYear.id,
      enrollment_date: new Date().toISOString().split('T')[0],
      expected_graduation: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 years from now
      academic_status: 'active',
      gpa: Math.round((Math.random() * 2 + 2) * 100) / 100, // Random GPA between 2.0 and 4.0
      credits_completed: Math.floor(Math.random() * 60) + 15, // Random credits between 15 and 75
      credits_required: 120
    }))

    console.log('📝 Creating student profiles...')

    // Insert student profiles
    const { data: insertedProfiles, error: insertError } = await supabaseAdmin
      .from('student_profiles')
      .insert(studentProfiles)
      .select()

    if (insertError) {
      console.error('❌ Error creating student profiles:', insertError)
      return NextResponse.json({ error: 'Failed to create student profiles' }, { status: 500 })
    }

    console.log(`✅ Successfully created ${insertedProfiles.length} student profiles`)

    return NextResponse.json({ 
      success: true, 
      message: `Created ${insertedProfiles.length} student profiles`,
      profiles: insertedProfiles
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
