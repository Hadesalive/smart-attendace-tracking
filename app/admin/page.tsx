import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirect to dashboard - this keeps URLs clean
  redirect("/dashboard")
}