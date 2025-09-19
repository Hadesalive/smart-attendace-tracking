import { supabase } from '@/lib/supabase'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error
  }

  if (error?.code) {
    return new ApiError(error.message || 'Database error', 400, error.code)
  }

  if (error?.message) {
    return new ApiError(error.message, 500)
  }

  return new ApiError('An unexpected error occurred', 500)
}

export const createApiResponse = <T>(data?: T, error?: string): ApiResponse<T> => {
  return {
    data,
    error,
    success: !error
  }
}

export const withErrorHandling = async <T>(
  operation: () => Promise<T>
): Promise<ApiResponse<T>> => {
  try {
    const data = await operation()
    return createApiResponse<T>(data)
  } catch (error) {
    const apiError = handleApiError(error)
    return createApiResponse<T>(undefined as T, apiError.message)
  }
}

export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new ApiError(`${fieldName} is required`, 400, 'VALIDATION_ERROR')
  }
}

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ApiError('Invalid email format', 400, 'VALIDATION_ERROR')
  }
}

export const validateUuid = (uuid: string, fieldName: string = 'ID'): void => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new ApiError(`Invalid ${fieldName} format`, 400, 'VALIDATION_ERROR')
  }
}

export const validatePagination = (page: number, limit: number): void => {
  if (page < 1) {
    throw new ApiError('Page must be greater than 0', 400, 'VALIDATION_ERROR')
  }
  if (limit < 1 || limit > 100) {
    throw new ApiError('Limit must be between 1 and 100', 400, 'VALIDATION_ERROR')
  }
}

export const buildQuery = (baseQuery: any, filters: Record<string, any> = {}) => {
  let query = baseQuery

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else if (typeof value === 'string' && value.includes('*')) {
        query = query.ilike(key, value.replace(/\*/g, '%'))
      } else {
        query = query.eq(key, value)
      }
    }
  })

  return query
}

export const paginateQuery = (query: any, page: number, limit: number) => {
  const from = (page - 1) * limit
  const to = from + limit - 1
  return query.range(from, to)
}

export const getSupabaseClient = () => {
  return supabase
}

export const checkAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new ApiError('Authentication required', 401, 'AUTH_ERROR')
  }
  return user
}

export const checkRole = async (allowedRoles: string[]) => {
  const user = await checkAuth()
  
  // This would typically check user role from database
  // For now, we'll assume the role is stored in user metadata
  const userRole = user.user_metadata?.role || 'student'
  
  if (!allowedRoles.includes(userRole)) {
    throw new ApiError('Insufficient permissions', 403, 'PERMISSION_ERROR')
  }
  
  return user
}
