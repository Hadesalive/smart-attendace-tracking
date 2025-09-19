"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"

function HomeContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  
  return <LoginForm redirectUrl={redirect} />
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
