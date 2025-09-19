import { Material } from '@/lib/types/shared'

export const getMaterialsByCourse = (materials: Material[], courseId: string): Material[] => {
  return materials.filter(material => material.course_id === courseId)
}

export const getMaterialsByType = (materials: Material[], type: string): Material[] => {
  return materials.filter(material => material.material_type === type)
}

export const getMaterialsByAuthor = (materials: Material[], authorId: string): Material[] => {
  // Note: Material interface doesn't have author_id field, this would need to be added to the interface
  return materials.filter(material => (material as any).author_id === authorId)
}

export const sortMaterialsByDate = (materials: Material[]): Material[] => {
  return [...materials].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export const sortMaterialsByTitle = (materials: Material[]): Material[] => {
  return [...materials].sort((a, b) => a.title.localeCompare(b.title))
}

export const getMaterialsByDateRange = (materials: Material[], startDate: string, endDate: string): Material[] => {
  return materials.filter(material => {
    const materialDate = new Date(material.created_at)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return materialDate >= start && materialDate <= end
  })
}

export const getMaterialStats = (materials: Material[]) => {
  const totalMaterials = materials.length
  const materialsByType = materials.reduce((acc, material) => {
    acc[material.material_type] = (acc[material.material_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const recentMaterials = materials.filter(material => {
    const materialDate = new Date(material.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return materialDate >= weekAgo
  }).length

  return {
    totalMaterials,
    materialsByType,
    recentMaterials,
    averageMaterialsPerCourse: totalMaterials > 0 ? totalMaterials / new Set(materials.map(m => m.course_id)).size : 0
  }
}

export const searchMaterials = (materials: Material[], query: string): Material[] => {
  const lowercaseQuery = query.toLowerCase()
  return materials.filter(material => 
    material.title.toLowerCase().includes(lowercaseQuery) ||
    material.description?.toLowerCase().includes(lowercaseQuery)
  )
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const getFileTypeIcon = (filename: string): string => {
  const extension = getFileExtension(filename)
  
  const iconMap: { [key: string]: string } = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'ppt': '📊',
    'pptx': '📊',
    'xls': '📈',
    'xlsx': '📈',
    'txt': '📄',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'mp4': '🎥',
    'avi': '🎥',
    'mov': '🎥',
    'mp3': '🎵',
    'wav': '🎵',
    'zip': '📦',
    'rar': '📦'
  }
  
  return iconMap[extension] || '📄'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  return imageExtensions.includes(getFileExtension(filename))
}

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  return videoExtensions.includes(getFileExtension(filename))
}

export const isAudioFile = (filename: string): boolean => {
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma']
  return audioExtensions.includes(getFileExtension(filename))
}

export const isDocumentFile = (filename: string): boolean => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
  return documentExtensions.includes(getFileExtension(filename))
}
