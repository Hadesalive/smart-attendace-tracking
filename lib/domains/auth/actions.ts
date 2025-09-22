"use server"

import { supabaseAdmin } from "../../supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schemas
const UserSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  fullName: z.string().min(2, { message: "Full name is required." }),
  role: z.enum(["admin", "lecturer", "student"], { message: "A valid role must be selected." }),
  // Student-specific fields
  student_id: z.string().optional(),
  program_id: z.string().optional(),
  academic_year_id: z.string().optional(),
  semester_id: z.string().optional(),
  section_id: z.string().optional(), // Physical class section
  year_level: z.number().optional(),
  gpa: z.number().optional(),
  enrollment_date: z.string().optional(),
  graduation_date: z.string().optional(),
  // Lecturer-specific fields
  employee_id: z.string().optional(),
  department_id: z.string().optional(),
  position: z.string().optional(),
  hire_date: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience_years: z.number().optional(),
  bio: z.string().optional(),
  research_interests: z.string().optional(),
  // Admin-specific fields
  admin_level: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

// --- USER MANAGEMENT ---

// Update user profile (both users table and role-specific profile)
export async function updateUserProfile(userId: string, userData: any) {
  try {
    console.log('🔍 updateUserProfile called with:', { userId, userData })
    const { role, ...profileData } = userData
    console.log('🔍 Extracted role:', role, 'profileData:', profileData)
    
    // Update users table with basic info (only fields that exist in users table)
    const userUpdateData: any = {}
    if (userData.name) userUpdateData.full_name = userData.name
    if (userData.email) userUpdateData.email = userData.email
    if (userData.department) userUpdateData.department = userData.department
    // Note: phone, bio, status fields don't exist in users table - they're in profile tables
    
    console.log('🔍 User update data:', userUpdateData)

    if (Object.keys(userUpdateData).length > 0) {
      console.log('🔍 Updating users table:', userUpdateData)
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .update(userUpdateData)
        .eq('id', userId)
        .select()

      if (userError) {
        console.error('❌ Users table update error:', userError)
        throw userError
      }
      console.log('✅ Users table updated:', userData)
    } else {
      console.log('⚠️ No user data to update')
    }

    // Update role-specific profile
    if (role === 'student') {
      const studentProfileData: any = {}
      if (profileData.student_id) studentProfileData.student_id = profileData.student_id
      if (profileData.program_id) studentProfileData.program_id = profileData.program_id
      if (profileData.academic_year_id) studentProfileData.academic_year_id = profileData.academic_year_id
      if (profileData.section_id) studentProfileData.section_id = profileData.section_id
      if (profileData.gpa) studentProfileData.gpa = profileData.gpa
      if (profileData.enrollment_date) studentProfileData.enrollment_date = profileData.enrollment_date
      if (profileData.graduation_date) studentProfileData.expected_graduation = profileData.graduation_date

      if (Object.keys(studentProfileData).length > 0) {
        console.log('🔍 Updating student profile:', studentProfileData)
        
        // Check if profile exists first
        const { data: existingProfile, error: checkError } = await supabaseAdmin
          .from('student_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking student profile:', checkError)
          throw checkError
        }

        if (existingProfile) {
          // Profile exists, update it
          const { data: studentData, error: studentError } = await supabaseAdmin
            .from('student_profiles')
            .update(studentProfileData)
            .eq('user_id', userId)
            .select()

          if (studentError) {
            console.error('❌ Student profile update error:', studentError)
            throw studentError
          }
          console.log('✅ Student profile updated:', studentData)
        } else {
          // Profile doesn't exist, create it
          console.log('🔍 Creating new student profile')
          const { data: studentData, error: studentError } = await supabaseAdmin
            .from('student_profiles')
            .insert({ user_id: userId, ...studentProfileData })
            .select()

          if (studentError) {
            console.error('❌ Student profile creation error:', studentError)
            throw studentError
          }
          console.log('✅ Student profile created:', studentData)
        }
      }
    } else if (role === 'lecturer') {
      const lecturerProfileData: any = {}
      if (profileData.employee_id) lecturerProfileData.employee_id = profileData.employee_id
      if (profileData.department_id) lecturerProfileData.department_id = profileData.department_id
      if (profileData.position) lecturerProfileData.position = profileData.position
      if (profileData.hire_date) lecturerProfileData.hire_date = profileData.hire_date
      if (profileData.bio) lecturerProfileData.bio = profileData.bio
      if (profileData.research_interests) lecturerProfileData.research_interests = [profileData.research_interests]
      if (profileData.qualification) lecturerProfileData.qualifications = [profileData.qualification]

      if (Object.keys(lecturerProfileData).length > 0) {
        console.log('🔍 Updating lecturer profile:', lecturerProfileData)
        
        // Check if profile exists first
        const { data: existingProfile, error: checkError } = await supabaseAdmin
          .from('lecturer_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking lecturer profile:', checkError)
          throw checkError
        }

        if (existingProfile) {
          // Profile exists, update it
          const { data: lecturerData, error: lecturerError } = await supabaseAdmin
            .from('lecturer_profiles')
            .update(lecturerProfileData)
            .eq('user_id', userId)
            .select()

          if (lecturerError) {
            console.error('❌ Lecturer profile update error:', lecturerError)
            throw lecturerError
          }
          console.log('✅ Lecturer profile updated:', lecturerData)
        } else {
          // Profile doesn't exist, create it
          console.log('🔍 Creating new lecturer profile')
          const { data: lecturerData, error: lecturerError } = await supabaseAdmin
            .from('lecturer_profiles')
            .insert({ user_id: userId, ...lecturerProfileData })
            .select()

          if (lecturerError) {
            console.error('❌ Lecturer profile creation error:', lecturerError)
            throw lecturerError
          }
          console.log('✅ Lecturer profile created:', lecturerData)
        }
      }
    } else if (role === 'admin') {
      const adminProfileData: any = {}
      if (profileData.employee_id) adminProfileData.employee_id = profileData.employee_id
      if (profileData.department_id) adminProfileData.department_id = profileData.department_id
      if (profileData.access_level) adminProfileData.admin_level = profileData.access_level

      if (Object.keys(adminProfileData).length > 0) {
        console.log('🔍 Updating admin profile:', adminProfileData)
        
        // Check if profile exists first
        const { data: existingProfile, error: checkError } = await supabaseAdmin
          .from('admin_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking admin profile:', checkError)
          throw checkError
        }

        if (existingProfile) {
          // Profile exists, update it
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('admin_profiles')
            .update(adminProfileData)
            .eq('user_id', userId)
            .select()

          if (adminError) {
            console.error('❌ Admin profile update error:', adminError)
            throw adminError
          }
          console.log('✅ Admin profile updated:', adminData)
        } else {
          // Profile doesn't exist, create it
          console.log('🔍 Creating new admin profile')
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('admin_profiles')
            .insert({ user_id: userId, ...adminProfileData })
            .select()

          if (adminError) {
            console.error('❌ Admin profile creation error:', adminError)
            throw adminError
          }
          console.log('✅ Admin profile created:', adminData)
        }
      }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function createUser(prevState: any, formData: FormData) {
  const parsedData = {
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    // Student fields - Convert null to undefined
    student_id: formData.get("student_id") ? formData.get("student_id") as string : undefined,
    program_id: formData.get("program_id") ? formData.get("program_id") as string : undefined,
    academic_year_id: formData.get("academic_year_id") ? formData.get("academic_year_id") as string : undefined,
    semester_id: formData.get("semester_id") ? formData.get("semester_id") as string : undefined,
    section_id: formData.get("section_id") ? formData.get("section_id") as string : undefined, // Physical class section
    year_level: formData.get("year_level") ? parseInt(formData.get("year_level") as string) : undefined,
    gpa: formData.get("gpa") ? parseFloat(formData.get("gpa") as string) : undefined,
    enrollment_date: formData.get("enrollment_date") ? formData.get("enrollment_date") as string : undefined,
    graduation_date: formData.get("graduation_date") ? formData.get("graduation_date") as string : undefined,
    // Lecturer fields
    employee_id: formData.get("employee_id") ? formData.get("employee_id") as string : undefined,
    department_id: formData.get("department_id") ? formData.get("department_id") as string : undefined,
    position: formData.get("position") ? formData.get("position") as string : undefined,
    hire_date: formData.get("hire_date") ? formData.get("hire_date") as string : undefined,
    specialization: formData.get("specialization") ? formData.get("specialization") as string : undefined,
    qualification: formData.get("qualification") ? formData.get("qualification") as string : undefined,
    experience_years: formData.get("experience_years") ? parseInt(formData.get("experience_years") as string) : undefined,
    bio: formData.get("bio") ? formData.get("bio") as string : undefined,
    research_interests: formData.get("research_interests") ? formData.get("research_interests") as string : undefined,
    // Admin fields
    admin_level: formData.get("admin_level") ? formData.get("admin_level") as string : undefined,
    permissions: formData.get("permissions") ? (() => {
      try {
        return JSON.parse(formData.get("permissions") as string)
      } catch {
        return undefined
      }
    })() : undefined,
  }

  const validatedFields = UserSchema.safeParse(parsedData)

  if (!validatedFields.success) {
    return { type: "error", message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { 
    email, 
    password, 
    fullName, 
    role,
    // Student fields
    student_id,
    program_id,
    academic_year_id,
    semester_id,
    section_id, // Physical class section
    year_level,
    gpa,
    enrollment_date,
    graduation_date,
    // Lecturer fields
    employee_id,
    department_id,
    position,
    hire_date,
    specialization,
    qualification,
    experience_years,
    bio,
    research_interests,
    // Admin fields
    admin_level,
    permissions
  } = validatedFields.data

  const supabase = supabaseAdmin

  try {
    // Create user in auth system
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for simplicity
    })

    if (authError) throw new Error(authError.message)
    if (!authData.user) throw new Error("User was not created in the authentication system.")

    const userId = authData.user.id

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      full_name: fullName,
      email,
      role,
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      throw new Error(profileError.message)
    }

    // Create role-specific profile
    if (role === 'student' && student_id && program_id && academic_year_id) {
      const { error: studentProfileError } = await supabase.from("student_profiles").insert({
        user_id: userId,
        student_id,
        program_id,
        academic_year_id,
        section_id: section_id || null, // Physical class section (includes semester info)
        enrollment_date: enrollment_date || new Date().toISOString().split('T')[0],
        expected_graduation: graduation_date,
        academic_status: 'active',
        gpa: gpa || 0,
        credits_completed: 0,
        credits_required: 120
      })

      if (studentProfileError) {
        console.error('Error creating student profile:', studentProfileError)
        // Don't delete the user, just log the error
      }
    } else if (role === 'lecturer' && employee_id) {
      const { error: lecturerProfileError } = await supabase.from("lecturer_profiles").insert({
        user_id: userId,
        employee_id,
        department_id,
        position: position || 'Lecturer',
        hire_date: hire_date || new Date().toISOString().split('T')[0],
        specialization: specialization || 'General',
        years_experience: experience_years || 0,
        qualifications: qualification || '',
        research_interests: research_interests || '',
        bio: bio || '',
        status: 'active'
      })

      if (lecturerProfileError) {
        console.error('Error creating lecturer profile:', lecturerProfileError)
        // Don't delete the user, just log the error
      }
    } else if (role === 'admin' && employee_id) {
      const { error: adminProfileError } = await supabase.from("admin_profiles").insert({
        user_id: userId,
        employee_id,
        department_id,
        admin_level: admin_level || 'admin',
        permissions: permissions || ['user_management', 'course_management']
      })

      if (adminProfileError) {
        console.error('Error creating admin profile:', adminProfileError)
        // Don't delete the user, just log the error
      }
    }

    revalidatePath("/dashboard")
    return { type: "success", message: `Successfully created user: ${fullName}` }
  } catch (e: any) {
    return { type: "error", message: `Error creating user: ${e.message}` }
  }
}

// --- PASSWORD MANAGEMENT ---
export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const supabase = supabaseAdmin
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw new Error(error.message)

    revalidatePath("/admin/users")
    return { type: "success", message: "Password reset successfully" }
  } catch (e: any) {
    return { type: "error", message: `Error resetting password: ${e.message}` }
  }
}

// --- ACCOUNT STATUS MANAGEMENT ---
export async function updateUserStatus(userId: string, isActive: boolean) {
  try {
    const supabase = supabaseAdmin
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        account_active: isActive
      }
    })

    if (error) throw new Error(error.message)

    revalidatePath("/admin/users")
    return { type: "success", message: `Account ${isActive ? 'activated' : 'deactivated'} successfully` }
  } catch (e: any) {
    return { type: "error", message: `Error updating account status: ${e.message}` }
  }
}

// --- GET USER AUTH STATUS ---
export async function getUserAuthStatus(userId: string) {
  try {
    const supabase = supabaseAdmin
    
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) throw new Error(error.message)

    return { 
      type: "success", 
      data: {
        isActive: data.user?.user_metadata?.account_active !== false,
        lastLogin: data.user?.last_sign_in_at,
        emailConfirmed: data.user?.email_confirmed_at !== null
      }
    }
  } catch (e: any) {
    return { type: "error", message: `Error getting user status: ${e.message}` }
  }
}
