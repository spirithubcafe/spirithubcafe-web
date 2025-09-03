import { usePerformanceMonitor, formatMetrics } from '@/hooks/useEnhancedPerformanceMonitoring'

export function PerformanceMonitor() {
  const { metrics, getPerformanceScore } = usePerformanceMonitor({
    enableCoreWebVitals: true,
    enableResourceTiming: true,
    enableCacheMetrics: true,
    reportInterval: 2000
  })

  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null
  }

  const formattedMetrics = formatMetrics(metrics)
  const score = getPerformanceScore

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2 text-green-400">
        Performance Score: {score}/100
      </h3>
      <div className="space-y-1">
        {Object.entries(formattedMetrics).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-300">{key}:</span>
            <span className="text-yellow-300">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
