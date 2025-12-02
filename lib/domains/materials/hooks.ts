"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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
      
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          courses!materials_course_id_fkey(course_code, course_name),
          users!materials_uploaded_by_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to match interface
      const transformedMaterials = (data || []).map(material => ({
        ...material,
        course_code: material.courses?.course_code,
        course_name: material.courses?.course_name,
        author_name: material.users?.full_name,
        author_email: material.users?.email
      }))
      
      setState(prev => ({ ...prev, materials: transformedMaterials, loading: false }))
    } catch (error) {
      console.error('❌ Error fetching materials:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch materials', 
        loading: false 
      }))
    }
  }, [])

  const createMaterial = useCallback(async (
    material: Omit<Material, 'id' | 'created_at' | 'updated_at'>,
    file?: File
  ) => {
    try {
      let fileUrl = material.file_url
      let fileSize = material.file_size
      let fileType = material.file_type

      // Upload file to Supabase Storage if provided
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `materials/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath)

        fileUrl = publicUrl
        fileSize = file.size
        fileType = file.type
      }

      // Insert material record
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          ...material,
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType
        }])
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        materials: [data, ...prev.materials]
      }))

      return data
    } catch (error) {
      console.error('❌ Error creating material:', error)
      throw error
    }
  }, [])

  const updateMaterial = useCallback(async (
    id: string, 
    updates: Partial<Material>
  ) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        materials: prev.materials.map(m => m.id === id ? data : m)
      }))

      return data
    } catch (error) {
      console.error('❌ Error updating material:', error)
      throw error
    }
  }, [])

  const deleteMaterial = useCallback(async (id: string) => {
    try {
      // Get material to find file URL
      const material = state.materials.find(m => m.id === id)
      
      // Delete file from storage if exists
      if (material?.file_url && material.file_url.includes('supabase')) {
        const filePath = material.file_url.split('/').pop()
        if (filePath) {
          await supabase.storage
            .from('course-materials')
            .remove([`materials/${filePath}`])
        }
      }

      // Delete database record
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m.id !== id)
      }))
    } catch (error) {
      console.error('❌ Error deleting material:', error)
      throw error
    }
  }, [state.materials])

  const fetchMaterialsByCourse = useCallback(async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          courses!materials_course_id_fkey(course_code, course_name)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching materials by course:', error)
      return []
    }
  }, [])

  const getMaterialsByCourse = useCallback((courseId: string): Material[] => {
    return state.materials.filter(material => material.course_id === courseId)
  }, [state.materials])

  const getMaterialsByType = useCallback((type: string): Material[] => {
    return state.materials.filter(material => material.material_type === type)
  }, [state.materials])

  const incrementDownloadCount = useCallback(async (id: string) => {
    try {
      // First get the current material to get the current download count
      const { data: material, error: fetchError } = await supabase
        .from('materials')
        .select('download_count')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentCount = material?.download_count || 0
      
      // Update with incremented count
      const { error } = await supabase
        .from('materials')
        .update({ download_count: currentCount + 1 })
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        materials: prev.materials.map(m => 
          m.id === id 
            ? { ...m, download_count: currentCount + 1 }
            : m
        )
      }))
    } catch (error) {
      console.error('❌ Error incrementing download count:', error)
      throw error
    }
  }, [])

  return {
    state,
    fetchMaterials,
    fetchMaterialsByCourse,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialsByCourse,
    getMaterialsByType,
    incrementDownloadCount
  }
}
