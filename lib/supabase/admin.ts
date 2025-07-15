import { createClient } from "@supabase/supabase-js"

// This admin client is used for server-side operations that require elevated privileges,
// such as creating users, bypassing RLS, etc. It uses the SERVICE_ROLE_KEY.
// IMPORTANT: This client should NEVER be used on the client-side.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!serviceRoleKey) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
