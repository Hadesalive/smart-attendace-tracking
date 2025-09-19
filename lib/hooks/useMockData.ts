"use client"

import { useEffect } from 'react'
import { useData } from '@/lib/contexts/DataContext'
import { initializeMockData } from '@/lib/data/mockData'

export function useMockData() {
  const { dispatch, state } = useData()

  useEffect(() => {
    // Only initialize if we don't have data yet
    if (state.users.length === 0 && !state.loading) {
      initializeMockData(dispatch)
    }
  }, [dispatch, state.users.length, state.loading])

  return {
    isInitialized: state.users.length > 0,
    lastUpdated: state.lastUpdated
  }
}
