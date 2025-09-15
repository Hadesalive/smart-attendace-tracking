"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { createUser } from "@/lib/actions/admin"
import { Box, Button, TextField, FormControl, InputLabel, FormHelperText, Stack, NativeSelect } from "@mui/material"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { toast } from "sonner"

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

export function AddUserForm({ onFormSubmit, defaultRole }: { onFormSubmit: () => void; defaultRole?: 'student' | 'lecturer' | 'admin' }) {
  const [state, formAction] = useActionState(createUser as any, initialState as any)

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
    <Box component="form" action={formAction} sx={{ mt: 1 }}>
      <Stack spacing={2.5}>
        <TextField
          id="fullName"
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          required
          variant="outlined"
          fullWidth
          error={Boolean(state.errors?.fullName)}
          helperText={state.errors?.fullName?.[0]}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="user@example.com"
          required
          variant="outlined"
          fullWidth
          error={Boolean(state.errors?.email)}
          helperText={state.errors?.email?.[0]}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          id="password"
          name="password"
          type="password"
          label="Password"
          required
          variant="outlined"
          fullWidth
          error={Boolean(state.errors?.password)}
          helperText={state.errors?.password?.[0]}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth required error={Boolean(state.errors?.role)}>
          <InputLabel htmlFor="role-native">Role</InputLabel>
          <NativeSelect
            id="role-native"
            inputProps={{ name: 'role', id: 'role-native' }}
            defaultValue={defaultRole}
          >
            <option aria-label="None" value="" />
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="admin">Admin</option>
          </NativeSelect>
          {state.errors?.role && (
            <FormHelperText>{state.errors.role[0]}</FormHelperText>
          )}
        </FormControl>

        <Box>
          <SubmitButton />
        </Box>
      </Stack>
    </Box>
  )
}
