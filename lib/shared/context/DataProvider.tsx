"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { GlobalState, GlobalContextType } from './types'

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalState>({
    currentUser: null,
    loading: false,
    error: null,
    lastUpdated: 0
  })

  const updateState = useCallback((newState: Partial<GlobalState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }, [])

  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, lastUpdated: Date.now() }))
  }, [])

  const contextValue: GlobalContextType = {
    state,
    setState: updateState,
    refreshData
  }

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useGlobalData() {
  const context = useContext(GlobalContext)
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a DataProvider')
  }
  return context
}
