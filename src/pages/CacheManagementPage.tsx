import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCacheManager } from '@/hooks/useCacheManager'
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
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CacheManagementPage() {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'
  
  const {
    loading,
    cacheStats,
    loadCacheStats,
    clearAllCaches,
    clearSpecificCache,
    forceUpdateServiceWorker,
    preloadCriticalResources
  } = useCacheManager()

  useEffect(() => {
    // Load cache stats on mount
    if ('caches' in window) {
      loadCacheStats()
    } else {
      toast.error('Cache API is not supported in this browser')
    }
  }, [loadCacheStats])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadCacheStats()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, loadCacheStats])

  const handleClearAllCaches = async () => {
    if (!confirm('This will remove all cached data including offline resources, API responses, and static assets. Are you sure you want to continue?')) {
      return
    }
    
    const success = await clearAllCaches()
    if (success) {
      // Don't reload immediately, just show success message
      toast.success('All caches cleared successfully! You may need to refresh the page manually if you experience any issues.')
    }
  }

  const handleForceUpdate = async () => {
    toast.loading('Updating application...', { id: 'force-update' })
    const success = await forceUpdateServiceWorker()
    
    if (success) {
      toast.success('Application updated successfully!', { id: 'force-update' })
    } else {
      toast.error('Failed to update application', { id: 'force-update' })
    }
  }

  const getCacheStatusColor = (cacheName: string) => {
    if (cacheName.includes('workbox') || cacheName.includes('runtime')) return 'bg-blue-500'
    if (cacheName.includes('static') || cacheName.includes('assets')) return 'bg-green-500'
    if (cacheName.includes('api') || cacheName.includes('data')) return 'bg-purple-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cache Management</h1>
          <p className="text-muted-foreground">
            Manage application caches, storage, and performance optimization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
            onClick={loadCacheStats}
            disabled={loading}
          >
            {loading ? (
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
              You are running in development mode. Some cache features may work differently 
              than in production. Service Worker updates will reload the page instead of 
              updating in background.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cache Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Caches</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.totalCaches || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active cache stores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.totalSize || '0 Bytes'}</div>
            <p className="text-xs text-muted-foreground">
              Disk space used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Background sync enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Update</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDevelopment ? 'Dev Mode' : 'Enabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDevelopment ? 'Manual updates only' : 'Silent updates active'}
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
              Clear Caches
            </CardTitle>
            <CardDescription>
              Remove all cached data to free up storage space
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="destructive" 
              className="w-full" 
              disabled={loading}
              onClick={handleClearAllCaches}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Caches
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={preloadCriticalResources}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Preload Critical Resources
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                loadCacheStats()
                toast.success('Cache statistics refreshed')
              }}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Statistics
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
              Force update and manage application versions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="default"
              className="w-full"
              onClick={handleForceUpdate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isDevelopment ? 'Reload Application' : 'Force Application Update'}
            </Button>

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                  {isDevelopment ? 'Development Mode' : 'Auto-Update Enabled'}
                </span>
              </div>
              <p>
                {isDevelopment 
                  ? 'In development mode, the application will reload to apply changes. Auto-updates are disabled.'
                  : 'The application automatically checks for updates every 60 seconds and applies them silently without user intervention.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Cache Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Details
          </CardTitle>
          <CardDescription>
            Individual cache stores and their properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading cache information...</span>
            </div>
          ) : cacheStats?.caches && cacheStats.caches.length > 0 ? (
            <div className="space-y-4">
              {cacheStats.caches.map((cache, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getCacheStatusColor(cache.name)} text-white`}>
                      Cache
                    </Badge>
                    <div>
                      <h4 className="font-medium">{cache.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {cache.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cache.lastModified}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSpecificCache(cache.name)}
                    disabled={loading}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No caches found</p>
              <p className="text-sm text-muted-foreground">
                Caches will appear here as the application creates them
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Storage Information
          </CardTitle>
          <CardDescription>
            Browser storage usage and limits
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
              <h4 className="font-medium mb-2">IndexedDB</h4>
              <p className="text-sm text-muted-foreground">
                Available for offline data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
