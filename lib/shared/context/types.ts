import { User } from '@/lib/types/shared'

export interface GlobalState {
  currentUser: User | null
  loading: boolean
  error: string | null
  lastUpdated: number
}

export interface GlobalContextType {
  state: GlobalState
  setState: (state: Partial<GlobalState>) => void
  refreshData: () => void
}
