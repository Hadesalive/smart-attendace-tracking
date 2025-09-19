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
