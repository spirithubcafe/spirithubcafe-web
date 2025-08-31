import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCacheManager } from '@/hooks/useAdvancedCache'
import { AdvancedLoading } from '@/components/ui/advanced-loading'
import { 
  Activity, 
  TrendingDown, 
  Zap, 
  Eye,
  Database,
  Wifi,
  Download,
  Monitor,
  Gauge,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Timer
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  threshold: number
  status: 'good' | 'warning' | 'poor'
  description: string
}

export default function PerformanceDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  
  const {
    stats: cacheStats,
    loading: cacheLoading,
    refreshStats,
    clearCache
  } = useCacheManager()

  // Load performance metrics from browser APIs
  const loadPerformanceMetrics = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const metrics = {
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      networkRequests: performance.getEntriesByType('resource').length,
      bundleSize: performance.getEntriesByType('resource')
        .filter(r => r.name.includes('.js'))
        .reduce((total, r) => total + (r as any).transferSize || 0, 0)
    }
    
    setPerformanceMetrics(metrics)
  }

  // Initialize dashboard
  useEffect(() => {
    const initDashboard = async () => {
      try {
        loadPerformanceMetrics()
        await refreshStats()
      } catch (error) {
        console.error('Failed to initialize performance dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initDashboard()
  }, [refreshStats])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadPerformanceMetrics()
      refreshStats()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, refreshStats])

  const formatMetric = (value: number, unit: string) => {
    if (unit === 'ms') {
      return value < 1000 ? `${value.toFixed(0)}ms` : `${(value / 1000).toFixed(1)}s`
    }
    if (unit === 'bytes') {
      if (value < 1024) return `${value}B`
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`
      return `${(value / 1024 / 1024).toFixed(1)}MB`
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }
    return `${value.toFixed(2)}${unit}`
  }

  const getMetricStatus = (value: number, threshold: number, higherIsBetter = false): 'good' | 'warning' | 'poor' => {
    if (higherIsBetter) {
      if (value >= threshold) return 'good'
      if (value >= threshold * 0.7) return 'warning'
      return 'poor'
    } else {
      if (value <= threshold) return 'good'
      if (value <= threshold * 1.5) return 'warning'
      return 'poor'
    }
  }

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'poor': return <TrendingDown className="w-4 h-4" />
    }
  }

  const performanceMetricsList: PerformanceMetric[] = performanceMetrics ? [
    {
      name: 'Page Load Time',
      value: performanceMetrics.pageLoadTime,
      unit: 'ms',
      threshold: 3000,
      status: getMetricStatus(performanceMetrics.pageLoadTime, 3000),
      description: 'Total time to fully load the page'
    },
    {
      name: 'DOM Content Loaded',
      value: performanceMetrics.domContentLoaded,
      unit: 'ms',
      threshold: 1500,
      status: getMetricStatus(performanceMetrics.domContentLoaded, 1500),
      description: 'Time until DOM is fully loaded'
    },
    {
      name: 'First Paint',
      value: performanceMetrics.firstPaint,
      unit: 'ms',
      threshold: 1000,
      status: getMetricStatus(performanceMetrics.firstPaint, 1000),
      description: 'Time until first pixel is painted'
    },
    {
      name: 'First Contentful Paint',
      value: performanceMetrics.firstContentfulPaint,
      unit: 'ms',
      threshold: 1500,
      status: getMetricStatus(performanceMetrics.firstContentfulPaint, 1500),
      description: 'Time until first content is visible'
    },
    {
      name: 'Cache Hit Rate',
      value: cacheStats?.hitRate || 0,
      unit: '%',
      threshold: 80,
      status: getMetricStatus(cacheStats?.hitRate || 0, 80, true),
      description: 'Percentage of requests served from cache'
    },
    {
      name: 'Bundle Size',
      value: performanceMetrics.bundleSize,
      unit: 'bytes',
      threshold: 1024 * 1024, // 1MB
      status: getMetricStatus(performanceMetrics.bundleSize, 1024 * 1024),
      description: 'Size of JavaScript bundles'
    },
    {
      name: 'Network Requests',
      value: performanceMetrics.networkRequests,
      unit: '',
      threshold: 50,
      status: getMetricStatus(performanceMetrics.networkRequests, 50),
      description: 'Number of network requests made'
    }
  ] : []

  const handleClearMetrics = async () => {
    if (!confirm('This will clear all performance metrics. Are you sure?')) {
      return
    }
    
    try {
      await clearCache()
      loadPerformanceMetrics()
      toast.success('Performance metrics cleared successfully!')
    } catch (error) {
      toast.error('Failed to clear metrics')
    }
  }

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      performanceMetrics: performanceMetricsList,
      cacheStats,
      recommendations: generateRecommendations()
    }
    
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Performance report downloaded!')
  }

  const generateRecommendations = () => {
    const recommendations = []
    
    if ((cacheStats?.hitRate || 0) < 70) {
      recommendations.push('Consider implementing more aggressive caching strategies')
    }
    
    if (performanceMetrics?.pageLoadTime > 3000) {
      recommendations.push('Optimize page load time by compressing assets and reducing bundle size')
    }
    
    if (performanceMetrics?.firstContentfulPaint > 1500) {
      recommendations.push('Improve first contentful paint by optimizing critical rendering path')
    }
    
    if (performanceMetrics?.networkRequests > 50) {
      recommendations.push('Reduce network requests by bundling resources and using HTTP/2')
    }
    
    return recommendations
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdvancedLoading
          variant="pulse"
          size="lg"
          message="Loading performance dashboard..."
          animated
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time performance monitoring and optimization insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            title="Select time range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadPerformanceMetrics()
              refreshStats()
            }}
            disabled={cacheLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMetric(performanceMetrics?.pageLoadTime || 0, 'ms')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total load time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatMetric(cacheStats?.hitRate || 0, '%')}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.itemCount || 0} cached items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bundle Size</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatMetric(performanceMetrics?.bundleSize || 0, 'bytes')}
            </div>
            <p className="text-xs text-muted-foreground">
              JavaScript bundle size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Requests</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {performanceMetrics?.networkRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total requests made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Detailed performance indicators and Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceMetricsList.map((metric) => (
              <div
                key={metric.name}
                className={`p-4 border rounded-lg ${getStatusColor(metric.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatMetric(metric.value, metric.unit)}
                </div>
                <p className="text-xs opacity-80">
                  {metric.description}
                </p>
                <div className="mt-2 text-xs opacity-60">
                  Target: {formatMetric(metric.threshold, metric.unit)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network & Resource Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Network Performance
            </CardTitle>
            <CardDescription>
              Network-related performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Connection Type</span>
                <Badge variant="outline">
                  {(navigator as any).connection?.effectiveType || 'Unknown'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Downlink Speed</span>
                <span className="text-sm">
                  {(navigator as any).connection?.downlink || 'Unknown'} Mbps
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">RTT</span>
                <span className="text-sm">
                  {(navigator as any).connection?.rtt || 'Unknown'} ms
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Data Saver</span>
                <Badge variant={(navigator as any).connection?.saveData ? 'destructive' : 'default'}>
                  {(navigator as any).connection?.saveData ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Resource Usage
            </CardTitle>
            <CardDescription>
              Memory and resource consumption metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Used Heap Size</span>
                <span className="text-sm">
                  {formatMetric((performance as any).memory?.usedJSHeapSize || 0, 'bytes')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Heap Size</span>
                <span className="text-sm">
                  {formatMetric((performance as any).memory?.totalJSHeapSize || 0, 'bytes')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Heap Limit</span>
                <span className="text-sm">
                  {formatMetric((performance as any).memory?.jsHeapSizeLimit || 0, 'bytes')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memory Usage</span>
                <Badge variant={
                  ((performance as any).memory?.usedJSHeapSize || 0) / 
                  ((performance as any).memory?.jsHeapSizeLimit || 1) < 0.8 ? 'default' : 'destructive'
                }>
                  {(((performance as any).memory?.usedJSHeapSize || 0) / 
                    ((performance as any).memory?.jsHeapSizeLimit || 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Recommendations
          </CardTitle>
          <CardDescription>
            Automated suggestions to improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generateRecommendations().map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{recommendation}</p>
              </div>
            ))}
            
            {generateRecommendations().length === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">
                  No performance issues detected. Your application is performing well!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="destructive"
          onClick={handleClearMetrics}
          disabled={cacheLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Metrics
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <Timer className="h-4 w-4 mr-2" />
          Restart Monitoring
        </Button>
      </div>
    </div>
  )
}
