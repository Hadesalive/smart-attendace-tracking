"use client"

import { useState, useCallback } from 'react'
import { Material } from '@/lib/types/shared'
import { MaterialsState, MaterialsContextType } from './types'

export function useMaterials() {
  const [state, setState] = useState<MaterialsState>({
    materials: [],
    loading: false,
    error: null
  })

  const fetchMaterials = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      // This would typically fetch from an API
      // For now, we'll just set loading to false
      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      console.error('Error fetching materials:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch materials', 
        loading: false 
      }))
    }
  }, [])

  const createMaterial = useCallback((material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    const newMaterial: Material = {
      ...material,
      id: `material_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setState(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }))
  }, [])

  const updateMaterial = useCallback((material: Material) => {
    setState(prev => ({
      ...prev,
      materials: prev.materials.map(m => 
        m.id === material.id ? material : m
      )
    }))
  }, [])

  const deleteMaterial = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id)
    }))
  }, [])

  const getMaterialsByCourse = useCallback((courseId: string): Material[] => {
    return state.materials.filter(material => material.course_id === courseId)
  }, [state.materials])

  const getMaterialsByType = useCallback((type: string): Material[] => {
    return state.materials.filter(material => material.material_type === type)
  }, [state.materials])

  return {
    state,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialsByCourse,
    getMaterialsByType
  }
}
