import { useState, useEffect } from 'react'
import { AdvancedLoading, LoadingWrapper } from '@/components/ui/advanced-loading'
import { useCacheManager } from '@/hooks/useAdvancedCache'

interface PageLoaderProps {
  loading: boolean
  children: React.ReactNode
  loadingMessage?: string
  variant?: 'spinner' | 'pulse' | 'coffee' | 'skeleton' | 'progress'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showProgress?: boolean
  minLoadingTime?: number
  preloadCritical?: boolean
}

export function PageLoader({
  loading,
  children,
  loadingMessage = 'Loading page...',
  variant = 'coffee',
  size = 'lg',
  showProgress = false,
  minLoadingTime = 500,
  preloadCritical = false
}: PageLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [actualLoading, setActualLoading] = useState(loading)
  const { stats, preloadCritical: preload } = useCacheManager()

  // Simulate progress for better UX
  useEffect(() => {
    if (loading) {
      setActualLoading(true)
      setProgress(0)
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 200)

      return () => clearInterval(interval)
    } else {
      setProgress(100)
      
      // Ensure minimum loading time for smooth UX
      const timer = setTimeout(() => {
        setActualLoading(false)
      }, minLoadingTime)
      
      return () => clearTimeout(timer)
    }
  }, [loading, minLoadingTime])

  // Preload critical resources if requested
  useEffect(() => {
    if (preloadCritical && !loading) {
      const criticalUrls = [
        '/images/logo.png',
        '/images/favicon.png',
        '/manifest.json'
      ]
      preload(criticalUrls)
    }
  }, [preloadCritical, loading, preload])

  if (actualLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <AdvancedLoading
          variant={variant}
          size={size}
          fullScreen
          message={loadingMessage}
          progress={showProgress ? progress : undefined}
          showProgress={showProgress}
          animated
        />
        
        {/* Cache stats for debugging in development */}
        {process.env.NODE_ENV === 'development' && stats && (
          <div className="fixed bottom-4 left-4 text-xs text-muted-foreground bg-background/80 p-2 rounded">
            Cache: {stats.itemCount} items, {(stats.totalSize / 1024).toFixed(1)}KB, {stats.hitRate.toFixed(1)}% hit rate
          </div>
        )}
      </div>
    )
  }

  return (
    <LoadingWrapper
      loading={false}
      minLoadingTime={minLoadingTime}
    >
      {children}
    </LoadingWrapper>
  )
}

// Hook for page loading state
export function usePageLoader(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const startLoading = (key?: string) => {
    if (key) {
      setLoadingStates(prev => ({ ...prev, [key]: true }))
    }
    setLoading(true)
  }

  const stopLoading = (key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const newStates = { ...prev, [key]: false }
        const hasActiveLoading = Object.values(newStates).some(Boolean)
        setLoading(hasActiveLoading)
        return newStates
      })
    } else {
      setLoadingStates({})
      setLoading(false)
    }
  }

  const setPageLoading = (isLoading: boolean, key?: string) => {
    if (isLoading) {
      startLoading(key)
    } else {
      stopLoading(key)
    }
  }

  return {
    loading,
    loadingStates,
    startLoading,
    stopLoading,
    setPageLoading
  }
}

// Component for route-based loading
interface RouteLoaderProps {
  children: React.ReactNode
  loadingMessage?: string
  variant?: 'spinner' | 'pulse' | 'coffee' | 'skeleton' | 'progress'
}

export function RouteLoader({
  children,
  loadingMessage = 'Loading page...',
  variant = 'coffee'
}: RouteLoaderProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <PageLoader
      loading={loading}
      loadingMessage={loadingMessage}
      variant={variant}
      minLoadingTime={300}
      preloadCritical
    >
      {children}
    </PageLoader>
  )
}
