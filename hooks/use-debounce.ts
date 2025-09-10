"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UseDebounceOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

interface UseDebounceReturn<T> {
  debouncedValue: T
  isDebouncing: boolean
  cancel: () => void
  flush: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DELAY = 300
const DEFAULT_OPTIONS: UseDebounceOptions = {
  delay: DEFAULT_DELAY,
  leading: false,
  trailing: true,
  maxWait: undefined
} as const

// Note: Sierra Leone constants are now available from lib/utils/constants

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for debouncing values
 * 
 * @param value - Value to debounce
 * @param options - Debounce options
 * @returns Object with debounced value and control functions
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const { debouncedValue, isDebouncing } = useDebounce(searchTerm, { delay: 500 })
 * 
 * // Use debouncedValue for API calls
 * useEffect(() => {
 *   if (debouncedValue) {
 *     searchAPI(debouncedValue)
 *   }
 * }, [debouncedValue])
 * ```
 */
export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const delay = options.delay ?? DEFAULT_DELAY
  const leading = options.leading ?? false
  const trailing = options.trailing ?? true
  const maxWait = options.maxWait

  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [isDebouncing, setIsDebouncing] = useState(false)
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallTimeRef = useRef<number | null>(null)
  const lastInvokeTimeRef = useRef<number>(0)

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxTimeoutRef.current !== null) {
      clearTimeout(maxTimeoutRef.current)
      maxTimeoutRef.current = null
    }
    setIsDebouncing(false)
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setDebouncedValue(value)
    setIsDebouncing(false)
    lastInvokeTimeRef.current = Date.now()
  }, [value])

  useEffect(() => {
    const now = Date.now()
    const isInvoking = leading && lastCallTimeRef.current === null

    if (isInvoking) {
      lastInvokeTimeRef.current = now
      setDebouncedValue(value)
      setIsDebouncing(false)
    } else {
      setIsDebouncing(true)
    }

    lastCallTimeRef.current = now

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    const shouldInvoke = () => {
      const timeSinceLastCall = now - (lastCallTimeRef.current || 0)
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current

      return (
        lastCallTimeRef.current === null ||
        timeSinceLastCall >= delay ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      )
    }

    if (shouldInvoke()) {
      lastInvokeTimeRef.current = now
      setDebouncedValue(value)
      setIsDebouncing(false)
    } else if (trailing) {
      timeoutRef.current = setTimeout(() => {
        lastInvokeTimeRef.current = Date.now()
        setDebouncedValue(value)
        setIsDebouncing(false)
      }, delay)
    }

    if (maxWait !== undefined) {
      if (maxTimeoutRef.current !== null) {
        clearTimeout(maxTimeoutRef.current)
      }
      maxTimeoutRef.current = setTimeout(() => {
        lastInvokeTimeRef.current = Date.now()
        setDebouncedValue(value)
        setIsDebouncing(false)
      }, maxWait)
    }

    return cancel
  }, [value, delay, leading, trailing, maxWait, cancel])

  return {
    debouncedValue,
    isDebouncing,
    cancel,
    flush
  }
}

/**
 * Custom hook for debouncing callback functions
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional options
 * @returns Debounced function
 * 
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
 *   searchAPI(searchTerm)
 * }, 500)
 * 
 * // Use in event handlers
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = DEFAULT_DELAY,
  options: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  } = {}
): T & {
  cancel: () => void
  flush: () => void
} {
  const leading = options.leading ?? false
  const trailing = options.trailing ?? true
  const maxWait = options.maxWait

  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallTimeRef = useRef<number | null>(null)
  const lastInvokeTimeRef = useRef<number>(0)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxTimeoutRef.current !== null) {
      clearTimeout(maxTimeoutRef.current)
      maxTimeoutRef.current = null
    }
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    callbackRef.current()
    lastInvokeTimeRef.current = Date.now()
  }, [])

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    const isInvoking = leading && lastCallTimeRef.current === null

    if (isInvoking) {
      lastInvokeTimeRef.current = now
      callbackRef.current(...args)
    }

    lastCallTimeRef.current = now

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    const shouldInvoke = () => {
      const timeSinceLastCall = now - (lastCallTimeRef.current || 0)
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current

      return (
        lastCallTimeRef.current === null ||
        timeSinceLastCall >= delay ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      )
    }

    if (shouldInvoke()) {
      lastInvokeTimeRef.current = now
      callbackRef.current(...args)
    } else if (trailing) {
      timeoutRef.current = setTimeout(() => {
        lastInvokeTimeRef.current = Date.now()
        callbackRef.current(...args)
      }, delay)
    }

    if (maxWait !== undefined) {
      if (maxTimeoutRef.current !== null) {
        clearTimeout(maxTimeoutRef.current)
      }
      maxTimeoutRef.current = setTimeout(() => {
        lastInvokeTimeRef.current = Date.now()
        callbackRef.current(...args)
      }, maxWait)
    }
  }, [delay, leading, trailing, maxWait])

  // Add cancel and flush methods
  Object.assign(debouncedCallback, {
    cancel,
    flush
  })

  return debouncedCallback as T & {
    cancel: () => void
    flush: () => void
  }
}

/**
 * Custom hook for debouncing async functions
 * 
 * @param asyncCallback - Async function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional options
 * @returns Debounced async function
 * 
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedAsyncCallback(async (data: FormData) => {
 *   await saveToAPI(data)
 * }, 1000)
 * 
 * // Use in form handlers
 * const handleSave = async () => {
 *   await debouncedSave(formData)
 * }
 * ```
 */
export function useDebouncedAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  asyncCallback: T,
  delay: number = DEFAULT_DELAY,
  options: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  } = {}
): T & {
  cancel: () => void
  flush: () => Promise<void>
} {
  const leading = options.leading ?? false
  const trailing = options.trailing ?? true
  const maxWait = options.maxWait

  const callbackRef = useRef(asyncCallback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallTimeRef = useRef<number | null>(null)
  const lastInvokeTimeRef = useRef<number>(0)
  const pendingPromiseRef = useRef<Promise<any> | null>(null)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = asyncCallback
  }, [asyncCallback])

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxTimeoutRef.current !== null) {
      clearTimeout(maxTimeoutRef.current)
      maxTimeoutRef.current = null
    }
  }, [])

  const flush = useCallback(async () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (pendingPromiseRef.current !== null) {
      await pendingPromiseRef.current
    }
    lastInvokeTimeRef.current = Date.now()
  }, [])

  const debouncedAsyncCallback = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now()
    const isInvoking = leading && lastCallTimeRef.current === null

    if (isInvoking) {
      lastInvokeTimeRef.current = now
      pendingPromiseRef.current = callbackRef.current(...args)
      return pendingPromiseRef.current
    }

    lastCallTimeRef.current = now

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    const shouldInvoke = () => {
      const timeSinceLastCall = now - (lastCallTimeRef.current || 0)
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current

      return (
        lastCallTimeRef.current === null ||
        timeSinceLastCall >= delay ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      )
    }

    if (shouldInvoke()) {
      lastInvokeTimeRef.current = now
      pendingPromiseRef.current = callbackRef.current(...args)
      return pendingPromiseRef.current
    } else if (trailing) {
      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            lastInvokeTimeRef.current = Date.now()
            const result = await callbackRef.current(...args)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, delay)
      })
    }

    if (maxWait !== undefined) {
      if (maxTimeoutRef.current !== null) {
        clearTimeout(maxTimeoutRef.current)
      }
      maxTimeoutRef.current = setTimeout(async () => {
        lastInvokeTimeRef.current = Date.now()
        await callbackRef.current(...args)
      }, maxWait)
    }

    return Promise.resolve() as ReturnType<T>
  }, [delay, leading, trailing, maxWait])

  // Add cancel and flush methods
  Object.assign(debouncedAsyncCallback, {
    cancel,
    flush
  })

  return debouncedAsyncCallback as T & {
    cancel: () => void
    flush: () => Promise<void>
  }
}