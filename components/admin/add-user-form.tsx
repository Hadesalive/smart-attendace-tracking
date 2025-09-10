"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createUser } from "@/lib/actions/admin"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect } from "react"

type FormState = {
  message: string | null;
  errors: {
    email?: string[];
    password?: string[];
    fullName?: string[];
    role?: string[];
  } | null;
};

const initialState: FormState = { message: null, errors: null };

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? "Creating User..." : "Create User"}
    </Button>
  )
}

export function AddUserForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const [state, formAction] = useActionState(createUser, initialState)

  useEffect(() => {
    if (!state) return;
    if (state.message?.startsWith("Successfully")) {
      toast.success(state.message);
      onFormSubmit(); // Close dialog and refresh data
    } else if (state.message) {
      // Display a generic error message or validation summary
      toast.error(state.message);
    }
  }, [state, onFormSubmit]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" placeholder="John Doe" required />
        {state.errors?.fullName && <p className="text-sm text-red-500 mt-1">{state.errors.fullName[0]}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="user@example.com" required />
        {state.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        {state.errors?.password && <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>}
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select name="role" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="lecturer">Lecturer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.role && <p className="text-sm text-red-500 mt-1">{state.errors.role[0]}</p>}
      </div>
      <SubmitButton />
    </form>
  )
}
