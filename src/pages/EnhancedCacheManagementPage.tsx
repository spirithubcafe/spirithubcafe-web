import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCacheManager } from '@/hooks/useAdvancedCache'
import { useServiceWorker } from '@/utils/service-worker'
import { AdvancedLoading } from '@/components/ui/advanced-loading'
import { 
  Trash2, 
  RefreshCw, 
  Database, 
  HardDrive, 
  Download, 
  Activity,
  Clock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnhancedCacheManagementPage() {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'
  
  const {
    stats: cacheStats,
    loading: cacheLoading,
    clearCache,
    cleanupExpired,
    preloadCritical,
    refreshStats
  } = useCacheManager()

  const {
    isRegistered: swRegistered,
    isUpdating: swUpdating,
    updateAvailable: swUpdateAvailable,
    updateServiceWorker,
    getCacheStats: getSWCacheStats,
    clearCache: clearSWCache,
    preloadResources: preloadSWResources,
    isSupported: swSupported
  } = useServiceWorker()

  const [swCacheStats, setSWCacheStats] = useState<any>(null)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load Service Worker cache stats
  useEffect(() => {
    if (swRegistered) {
      getSWCacheStats()
        .then(stats => setSWCacheStats(stats))
        .catch(() => setSWCacheStats(null))
    }
  }, [swRegistered, getSWCacheStats])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshStats()
      if (swRegistered) {
        getSWCacheStats()
          .then(stats => setSWCacheStats(stats))
          .catch(() => setSWCacheStats(null))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshStats, swRegistered, getSWCacheStats])

  const handleClearAllCaches = async () => {
    if (!confirm('This will remove all cached data including offline resources. Are you sure?')) {
      return
    }
    
    const loadingKey = 'clear-all-caches'
    toast.loading('Clearing all caches...', { id: loadingKey })
    
    try {
      // Clear application cache
      await clearCache()
      
      // Clear Service Worker caches
      if (swRegistered) {
        await clearSWCache()
      }
      
      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await window.caches.keys()
        await Promise.all(cacheNames.map(name => window.caches.delete(name)))
      }
      
      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      toast.success('All caches cleared successfully!', { id: loadingKey })
    } catch (error) {
      toast.error('Failed to clear some caches', { id: loadingKey })
    }
  }

  const handlePreloadCritical = async () => {
    const loadingKey = 'preload-critical'
    toast.loading('Preloading critical resources...', { id: loadingKey })
    
    try {
      // Preload via application cache
      await preloadCritical([
        '/images/logo.png',
        '/images/favicon.png',
        '/manifest.json'
      ])
      
      // Preload via Service Worker
      if (swRegistered) {
        await preloadSWResources([
          '/',
          '/shop',
          '/about',
          '/contact'
        ])
      }
      
      toast.success('Critical resources preloaded successfully!', { id: loadingKey })
    } catch (error) {
      toast.error('Failed to preload some resources', { id: loadingKey })
    }
  }

  const handleForceUpdate = async () => {
    if (swUpdateAvailable || swRegistered) {
      const loadingKey = 'force-update'
      toast.loading('Updating application...', { id: loadingKey })
      
      try {
        await updateServiceWorker()
        toast.success('Application updated successfully!', { id: loadingKey })
      } catch (error) {
        toast.error('Failed to update application', { id: loadingKey })
      }
    } else {
      window.location.reload()
    }
  }

  const getCacheStatusColor = (cacheName: string) => {
    if (cacheName.includes('static') || cacheName.includes('assets')) return 'bg-green-500'
    if (cacheName.includes('api') || cacheName.includes('data')) return 'bg-blue-500'
    if (cacheName.includes('image')) return 'bg-purple-500'
    return 'bg-gray-500'
  }

  if (cacheLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdvancedLoading
          variant="coffee"
          size="lg"
          message="Loading cache management..."
          animated
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Cache Management</h1>
          <p className="text-muted-foreground">
            Advanced caching system with Service Worker integration
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          
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
              refreshStats()
              if (swRegistered) {
                getSWCacheStats().then(stats => setSWCacheStats(stats))
              }
            }}
            disabled={cacheLoading}
          >
            {cacheLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Development Warning */}
      {isDevelopment && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Development Mode</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              Some cache features work differently in development. Service Worker may not be active.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cache Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Cache</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.itemCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.hitRate?.toFixed(1) || 0}% hit rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
            <CheckCircle className={`h-4 w-4 ${swRegistered ? 'text-green-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {swSupported ? (swRegistered ? 'Active' : 'Inactive') : 'Unsupported'}
            </div>
            <p className="text-xs text-muted-foreground">
              {swCacheStats?.length || 0} cache stores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats ? (cacheStats.totalSize / 1024).toFixed(1) : 0}KB
            </div>
            <p className="text-xs text-muted-foreground">
              Application data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.hitRate ? 'Optimized' : 'Standard'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cache efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Cache Management
            </CardTitle>
            <CardDescription>
              Clear caches and manage storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="destructive" 
              className="w-full" 
              disabled={cacheLoading}
              onClick={handleClearAllCaches}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Caches
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handlePreloadCritical}
              disabled={cacheLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Preload Critical Resources
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={cleanupExpired}
              disabled={cacheLoading}
            >
              <Clock className="h-4 w-4 mr-2" />
              Cleanup Expired Items
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Application Updates
            </CardTitle>
            <CardDescription>
              Manage application versions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="default"
              className="w-full"
              onClick={handleForceUpdate}
              disabled={swUpdating}
            >
              {swUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {swUpdateAvailable ? 'Install Update' : 'Force Refresh'}
            </Button>

            {swUpdateAvailable && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Update Available</span>
                </div>
                <p>A new version of the application is ready to install.</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Auto-Update Status</span>
              </div>
              <p>
                {isDevelopment 
                  ? 'Development mode - manual updates only' 
                  : 'Production mode - automatic background updates'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Worker Cache Details */}
      {swCacheStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Service Worker Cache Details
            </CardTitle>
            <CardDescription>
              Individual cache stores managed by the Service Worker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {swCacheStats.map((cache: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getCacheStatusColor(cache.name)} text-white`}>
                      SW Cache
                    </Badge>
                    <div>
                      <h4 className="font-medium">{cache.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cache.count} items
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSWCache(cache.name)}
                    disabled={cacheLoading}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browser Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Browser Storage
          </CardTitle>
          <CardDescription>
            Local storage and session storage usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Local Storage</h4>
              <p className="text-sm text-muted-foreground">
                {localStorage.length} items stored
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Session Storage</h4>
              <p className="text-sm text-muted-foreground">
                {sessionStorage.length} items stored
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Cache API</h4>
              <p className="text-sm text-muted-foreground">
                {'caches' in window ? 'Supported' : 'Not supported'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
