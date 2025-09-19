"use client"

import { useSearchParams } from "next/navigation"
import LoginForm from "@/components/auth/login-form"

export default function Home() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  
  return <LoginForm redirectUrl={redirect} />
}
