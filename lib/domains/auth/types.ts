import { User } from '@/lib/types/shared'

export interface AuthState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
}

export interface AuthContextType {
  state: AuthState
  loadCurrentUser: () => Promise<void>
  fetchUsers: () => Promise<void>
  createUser: (data: any) => Promise<void>
  updateUser: (id: string, data: any) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}
