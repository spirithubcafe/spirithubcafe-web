import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { AdvancedLoading } from '@/components/ui/advanced-loading'

interface LoadingState {
  key: string
  message?: string
  variant?: 'spinner' | 'pulse' | 'coffee' | 'skeleton' | 'progress'
  progress?: number
  priority?: 'high' | 'medium' | 'low'
}

interface GlobalLoadingContextType {
  // State
  isLoading: boolean
  loadingStates: LoadingState[]
  currentLoading: LoadingState | null
  
  // Actions
  startLoading: (key: string, options?: Partial<LoadingState>) => void
  stopLoading: (key: string) => void
  updateLoading: (key: string, options: Partial<LoadingState>) => void
  clearAllLoading: () => void
  
  // Utilities
  getLoadingState: (key: string) => LoadingState | undefined
  isKeyLoading: (key: string) => boolean
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined)

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([])

  // Calculate current loading state based on priority
  const currentLoading = loadingStates.length > 0 
    ? loadingStates.reduce((highest, current) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        const currentWeight = priorityWeight[current.priority || 'medium']
        const highestWeight = priorityWeight[highest.priority || 'medium']
        return currentWeight > highestWeight ? current : highest
      })
    : null

  const isLoading = loadingStates.length > 0

  const startLoading = useCallback((key: string, options: Partial<LoadingState> = {}) => {
    setLoadingStates(prev => {
      // Remove existing state with same key
      const filtered = prev.filter(state => state.key !== key)
      
      // Add new loading state
      const newState: LoadingState = {
        key,
        message: 'Loading...',
        variant: 'coffee',
        priority: 'medium',
        ...options
      }
      
      return [...filtered, newState]
    })
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => prev.filter(state => state.key !== key))
  }, [])

  const updateLoading = useCallback((key: string, options: Partial<LoadingState>) => {
    setLoadingStates(prev => 
      prev.map(state => 
        state.key === key 
          ? { ...state, ...options }
          : state
      )
    )
  }, [])

  const clearAllLoading = useCallback(() => {
    setLoadingStates([])
  }, [])

  const getLoadingState = useCallback((key: string) => {
    return loadingStates.find(state => state.key === key)
  }, [loadingStates])

  const isKeyLoading = useCallback((key: string) => {
    return loadingStates.some(state => state.key === key)
  }, [loadingStates])

  const value: GlobalLoadingContextType = {
    isLoading,
    loadingStates,
    currentLoading,
    startLoading,
    stopLoading,
    updateLoading,
    clearAllLoading,
    getLoadingState,
    isKeyLoading
  }

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      
      {/* Global loading overlay */}
      {currentLoading && (
        <AdvancedLoading
          variant={currentLoading.variant}
          message={currentLoading.message}
          progress={currentLoading.progress}
          showProgress={currentLoading.progress !== undefined}
          fullScreen
          overlay
          animated
        />
      )}
    </GlobalLoadingContext.Provider>
  )
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext)
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider')
  }
  return context
}

// Hook for async operations with loading
export function useAsyncOperation() {
  const { startLoading, stopLoading, updateLoading } = useGlobalLoading()

  const executeWithLoading = useCallback(async function<T>(
    operation: () => Promise<T>,
    key: string,
    options?: {
      message?: string
      variant?: 'spinner' | 'pulse' | 'coffee' | 'skeleton' | 'progress'
      showProgress?: boolean
    }
  ): Promise<T> {
    const { message = 'Processing...', variant = 'coffee', showProgress = false } = options || {}
    
    try {
      startLoading(key, { message, variant, priority: 'high' })
      
      if (showProgress) {
        // Simulate progress updates
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20
          if (progress > 90) progress = 90
          updateLoading(key, { progress })
        }, 200)
        
        const result = await operation()
        
        clearInterval(progressInterval)
        updateLoading(key, { progress: 100 })
        
        // Brief delay to show completion
        await new Promise(resolve => setTimeout(resolve, 300))
        
        return result
      } else {
        return await operation()
      }
    } finally {
      stopLoading(key)
    }
  }, [startLoading, stopLoading, updateLoading])

  return { executeWithLoading }
}
