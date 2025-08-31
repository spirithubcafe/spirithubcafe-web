import { useEffect, useCallback, useState } from 'react'
import { advancedCacheManager } from '@/hooks/useAdvancedCache'
import { useGlobalLoading } from '@/contexts/global-loading-provider'

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  
  // Custom metrics
  pageLoadTime: number
  domContentLoaded: number
  resourcesLoaded: number
  cacheHitRate: number
  bundleSize?: number
  
  // Network metrics
  connectionType?: string
  effectiveType?: string
  
  // User experience
  interactionCount: number
  errorCount: number
  
  timestamp: number
}

interface PerformanceConfig {
  enableCoreWebVitals?: boolean
  enableResourceTiming?: boolean
  enableUserTiming?: boolean
  enableCacheMetrics?: boolean
  reportInterval?: number
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

export function usePerformanceMonitor(config: PerformanceConfig = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const { isLoading } = useGlobalLoading()
  
  const {
    enableCoreWebVitals = true,
    enableResourceTiming = true,
    enableCacheMetrics = true,
    reportInterval = 5000,
    onMetricsUpdate
  } = config

  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
      resourcesLoaded: performance.getEntriesByType('resource').length,
      cacheHitRate: 0,
      interactionCount: 0,
      errorCount: 0,
      timestamp: Date.now()
    }

    // Core Web Vitals
    if (enableCoreWebVitals && 'web-vitals' in window) {
      // FCP
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime
      }
      
      // LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime
      }
    }

    // Cache metrics
    if (enableCacheMetrics) {
      const cacheStats = advancedCacheManager.getStats()
      metrics.cacheHitRate = cacheStats.hitRate
    }

    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      metrics.connectionType = connection?.type || 'unknown'
      metrics.effectiveType = connection?.effectiveType || 'unknown'
    }

    // Resource timing
    if (enableResourceTiming) {
      const resources = performance.getEntriesByType('resource')
      const totalSize = resources.reduce((sum, resource: any) => {
        return sum + (resource.transferSize || 0)
      }, 0)
      metrics.bundleSize = totalSize
    }

    return metrics
  }, [enableCoreWebVitals, enableResourceTiming, enableCacheMetrics])

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return
    
    setIsMonitoring(true)
    
    // Initial metrics calculation
    const initialMetrics = calculateMetrics()
    setMetrics(initialMetrics)
    
    if (onMetricsUpdate) {
      onMetricsUpdate(initialMetrics)
    }

    // Set up periodic reporting
    const interval = setInterval(() => {
      const currentMetrics = calculateMetrics()
      setMetrics(currentMetrics)
      
      if (onMetricsUpdate) {
        onMetricsUpdate(currentMetrics)
      }
    }, reportInterval)

    // Performance observer for Core Web Vitals
    if (enableCoreWebVitals && 'PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          setMetrics(prev => prev ? { ...prev, lcp: lastEntry.startTime } : null)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            setMetrics(prev => prev ? { ...prev, fid: entry.processingStart - entry.startTime } : null)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // CLS Observer
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              setMetrics(prev => prev ? { ...prev, cls: clsValue } : null)
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('Performance Observer not supported:', error)
      }
    }

    return () => {
      clearInterval(interval)
      setIsMonitoring(false)
    }
  }, [isMonitoring, calculateMetrics, onMetricsUpdate, reportInterval, enableCoreWebVitals])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  const getPerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100
    
    // LCP scoring (0-2.5s = good, 2.5-4s = needs improvement, >4s = poor)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30
      else if (metrics.lcp > 2500) score -= 15
    }
    
    // FID scoring (0-100ms = good, 100-300ms = needs improvement, >300ms = poor)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25
      else if (metrics.fid > 100) score -= 10
    }
    
    // CLS scoring (0-0.1 = good, 0.1-0.25 = needs improvement, >0.25 = poor)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25
      else if (metrics.cls > 0.1) score -= 10
    }
    
    // Page load time scoring
    if (metrics.pageLoadTime > 3000) score -= 20
    else if (metrics.pageLoadTime > 1500) score -= 10
    
    return Math.max(0, score)
  }, [])

  const reportToAnalytics = useCallback((metrics: PerformanceMetrics) => {
    // Report to Google Analytics or other analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        page_load_time: metrics.pageLoadTime,
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        cache_hit_rate: metrics.cacheHitRate,
        custom_parameter: getPerformanceScore(metrics)
      })
    }
    
    // Disable external analytics endpoint for now
    // if (process.env.NODE_ENV === 'production') {
    //   fetch('/api/analytics/performance', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(metrics)
    //   }).catch(() => {
    //     // Silently fail analytics reporting
    //   })
    // }
  }, [getPerformanceScore])

  // Auto-start monitoring when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Wait for page to fully load
      if (document.readyState === 'complete') {
        startMonitoring()
      } else {
        window.addEventListener('load', startMonitoring)
        return () => window.removeEventListener('load', startMonitoring)
      }
    }
  }, [startMonitoring])

  // Report metrics when they update
  useEffect(() => {
    if (metrics && process.env.NODE_ENV === 'production') {
      reportToAnalytics(metrics)
    }
  }, [metrics, reportToAnalytics])

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceScore: metrics ? getPerformanceScore(metrics) : 0,
    isPageLoading: isLoading
  }
}

// Utility function to format metrics for display
export function formatMetrics(metrics: PerformanceMetrics): Record<string, string> {
  return {
    'Page Load Time': `${(metrics.pageLoadTime / 1000).toFixed(2)}s`,
    'DOM Content Loaded': `${(metrics.domContentLoaded / 1000).toFixed(2)}s`,
    'First Contentful Paint': metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)}s` : 'N/A',
    'Largest Contentful Paint': metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : 'N/A',
    'First Input Delay': metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
    'Cumulative Layout Shift': metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
    'Resources Loaded': metrics.resourcesLoaded.toString(),
    'Cache Hit Rate': `${metrics.cacheHitRate.toFixed(1)}%`,
    'Bundle Size': metrics.bundleSize ? `${(metrics.bundleSize / 1024).toFixed(1)}KB` : 'N/A',
    'Connection': `${metrics.connectionType || 'Unknown'} (${metrics.effectiveType || 'Unknown'})`
  }
}
