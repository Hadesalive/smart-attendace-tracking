import { Material } from '@/lib/types/shared'

export interface MaterialsState {
  materials: Material[]
  loading: boolean
  error: string | null
}

export interface MaterialsContextType {
  state: MaterialsState
  fetchMaterials: () => Promise<void>
  createMaterial: (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => void
  updateMaterial: (material: Material) => void
  deleteMaterial: (id: string) => void
  getMaterialsByCourse: (courseId: string) => Material[]
  getMaterialsByType: (type: string) => Material[]
}
