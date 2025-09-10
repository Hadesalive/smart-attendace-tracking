"use client"

import { useState, useEffect, useCallback } from "react"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UseLocalStorageOptions<T> {
  defaultValue?: T
  serializer?: {
    serialize: (value: T) => string
    deserialize: (value: string) => T
  }
  syncAcrossTabs?: boolean
}

interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
  isLoaded: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SERIALIZER = {
  serialize: JSON.stringify,
  deserialize: JSON.parse
} as const

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing localStorage with type safety
 * 
 * @param key - localStorage key
 * @param options - Configuration options
 * @returns Object with value, setValue, removeValue, and isLoaded
 * 
 * @example
 * ```tsx
 * const { value, setValue, removeValue, isLoaded } = useLocalStorage('user-preferences', {
 *   defaultValue: { theme: 'light', language: 'en' }
 * })
 * 
 * // Update value
 * setValue({ theme: 'dark', language: 'es' })
 * 
 * // Remove from localStorage
 * removeValue()
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    defaultValue,
    serializer = DEFAULT_SERIALIZER,
    syncAcrossTabs = true
  } = options

  const [value, setValueState] = useState<T | undefined>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Get value from localStorage
  const getStoredValue = useCallback((): T | undefined => {
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) return defaultValue
      return serializer.deserialize(item)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }, [key, serializer, defaultValue])

  // Set value in localStorage
  const setStoredValue = useCallback((newValue: T) => {
    try {
      if (newValue === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, serializer.serialize(newValue))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, serializer])

  // Initialize value from localStorage
  useEffect(() => {
    const storedValue = getStoredValue()
    setValueState(storedValue)
    setIsLoaded(true)
  }, [getStoredValue])

  // Listen for changes across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = serializer.deserialize(e.newValue)
          setValueState(newValue)
        } catch (error) {
          console.warn(`Error deserializing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, serializer, syncAcrossTabs])

  // Set value function
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const valueToStore = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value as T)
      : newValue

    setValueState(valueToStore)
    setStoredValue(valueToStore)
  }, [value, setStoredValue])

  // Remove value function
  const removeValue = useCallback(() => {
    setValueState(undefined)
    setStoredValue(undefined as T)
  }, [setStoredValue])

  return {
    value: value as T,
    setValue,
    removeValue,
    isLoaded
  }
}

/**
 * Custom hook for managing sessionStorage with type safety
 * 
 * @param key - sessionStorage key
 * @param options - Configuration options
 * @returns Object with value, setValue, removeValue, and isLoaded
 * 
 * @example
 * ```tsx
 * const { value, setValue } = useSessionStorage('form-data', {
 *   defaultValue: { name: '', email: '' }
 * })
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    defaultValue,
    serializer = DEFAULT_SERIALIZER
  } = options

  const [value, setValueState] = useState<T | undefined>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Get value from sessionStorage
  const getStoredValue = useCallback((): T | undefined => {
    try {
      const item = window.sessionStorage.getItem(key)
      if (item === null) return defaultValue
      return serializer.deserialize(item)
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return defaultValue
    }
  }, [key, serializer, defaultValue])

  // Set value in sessionStorage
  const setStoredValue = useCallback((newValue: T) => {
    try {
      if (newValue === undefined) {
        window.sessionStorage.removeItem(key)
      } else {
        window.sessionStorage.setItem(key, serializer.serialize(newValue))
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, serializer])

  // Initialize value from sessionStorage
  useEffect(() => {
    const storedValue = getStoredValue()
    setValueState(storedValue)
    setIsLoaded(true)
  }, [getStoredValue])

  // Set value function
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const valueToStore = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value as T)
      : newValue

    setValueState(valueToStore)
    setStoredValue(valueToStore)
  }, [value, setStoredValue])

  // Remove value function
  const removeValue = useCallback(() => {
    setValueState(undefined)
    setStoredValue(undefined as T)
  }, [setStoredValue])

  return {
    value: value as T,
    setValue,
    removeValue,
    isLoaded
  }
}

/**
 * Custom hook for managing multiple localStorage keys
 * 
 * @param keys - Array of localStorage keys to manage
 * @param options - Configuration options
 * @returns Object with values, setValue, removeValue, and isLoaded
 * 
 * @example
 * ```tsx
 * const { values, setValue, removeValue } = useMultipleLocalStorage(['theme', 'language'], {
 *   defaultValue: { theme: 'light', language: 'en' }
 * })
 * 
 * // Set specific key
 * setValue('theme', 'dark')
 * 
 * // Get specific value
 * const theme = values.theme
 * ```
 */
export function useMultipleLocalStorage<T extends Record<string, any>>(
  keys: (keyof T)[],
  options: UseLocalStorageOptions<T> = {}
): {
  values: Partial<T>
  setValue: <K extends keyof T>(key: K, value: T[K]) => void
  removeValue: (key: keyof T) => void
  removeAllValues: () => void
  isLoaded: boolean
} {
  const [values, setValues] = useState<Partial<T>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize all values
  useEffect(() => {
    const initialValues: Partial<T> = {}
    let allLoaded = true

    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key as string)
        if (item !== null) {
          initialValues[key] = JSON.parse(item)
        } else if (options.defaultValue?.[key] !== undefined) {
          initialValues[key] = options.defaultValue[key]
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${String(key)}":`, error)
        allLoaded = false
      }
    })

    setValues(initialValues)
    setIsLoaded(allLoaded)
  }, [keys, options.defaultValue])

  // Set value function
  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    try {
      window.localStorage.setItem(String(key), JSON.stringify(value))
      setValues(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.warn(`Error setting localStorage key "${String(key)}":`, error)
    }
  }, [])

  // Remove value function
  const removeValue = useCallback((key: keyof T) => {
    try {
      window.localStorage.removeItem(String(key))
      setValues(prev => {
        const newValues = { ...prev }
        delete newValues[key]
        return newValues
      })
    } catch (error) {
      console.warn(`Error removing localStorage key "${String(key)}":`, error)
    }
  }, [])

  // Remove all values function
  const removeAllValues = useCallback(() => {
    try {
      keys.forEach(key => {
        window.localStorage.removeItem(String(key))
      })
      setValues({})
    } catch (error) {
      console.warn('Error removing all localStorage keys:', error)
    }
  }, [keys])

  return {
    values,
    setValue,
    removeValue,
    removeAllValues,
    isLoaded
  }
}
