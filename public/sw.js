// Enhanced Service Worker for SpiritHub Cafe
const CACHE_VERSION = 'spirithub-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const API_CACHE = `${CACHE_VERSION}-api`

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/shop',
  '/about',
  '/contact',
  '/manifest.json',
  '/images/logo.png',
  '/images/favicon.png',
  '/images/logo-s.png'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// Route strategies
const ROUTE_STRATEGIES = [
  { pattern: /\.(js|css|woff2|woff|ttf)$/, strategy: CACHE_STRATEGIES.CACHE_FIRST, cache: STATIC_CACHE },
  { pattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/, strategy: CACHE_STRATEGIES.CACHE_FIRST, cache: IMAGE_CACHE },
  { pattern: /\/api\//, strategy: CACHE_STRATEGIES.NETWORK_FIRST, cache: API_CACHE, maxAge: 5 * 60 * 1000 },
  { pattern: /\/(shop|about|contact|dashboard)/, strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, cache: DYNAMIC_CACHE }
]

// Install event
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName.includes('spirithub') && !cacheName.includes(CACHE_VERSION)) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        // Notify all clients that an update is available
        return self.clients.matchAll()
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATE_AVAILABLE' })
        })
        return self.clients.claim()
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Find matching strategy
  const routeStrategy = ROUTE_STRATEGIES.find(route => route.pattern.test(url.pathname + url.search))
  
  if (routeStrategy) {
    event.respondWith(handleRequest(request, routeStrategy))
  } else {
    // Default strategy for unmatched routes
    event.respondWith(handleRequest(request, {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST,
      cache: DYNAMIC_CACHE
    }))
  }
})

// Handle requests based on strategy
async function handleRequest(request, { strategy, cache: cacheName, maxAge }) {
  const cache = await caches.open(cacheName)
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request, cache)
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request, cache, maxAge)
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(request, cache)
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request)
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cache.match(request)
      
    default:
      return handleNetworkFirst(request, cache)
  }
}

// Cache first strategy
async function handleCacheFirst(request, cache) {
  try {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.warn('Cache first failed:', error)
    const cached = await cache.match(request)
    return cached || new Response('Offline', { status: 503 })
  }
}

// Network first strategy
async function handleNetworkFirst(request, cache, maxAge) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Add timestamp for maxAge check
      const responseToCache = response.clone()
      if (maxAge) {
        responseToCache.headers.set('sw-cached-at', Date.now().toString())
      }
      cache.put(request, responseToCache)
    }
    return response
  } catch (error) {
    console.warn('Network first failed, trying cache:', error)
    const cached = await cache.match(request)
    
    // Check if cached response is still valid
    if (cached && maxAge) {
      const cachedAt = cached.headers.get('sw-cached-at')
      if (cachedAt && Date.now() - parseInt(cachedAt) > maxAge) {
        console.log('Cached response expired')
        return new Response('Offline', { status: 503 })
      }
    }
    
    return cached || new Response('Offline', { status: 503 })
  }
}

// Stale while revalidate strategy
async function handleStaleWhileRevalidate(request, cache) {
  const cached = await cache.match(request)
  
  // Start fetch in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => {
      // Silently fail background fetch
    })
  
  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered')
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle offline actions when back online
  try {
    // You can implement offline form submissions, data sync, etc.
    console.log('📡 Handling background sync...')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/images/icon.png',
      badge: '/images/favicon.png',
      data: data.data
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Message handler for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {}
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_CACHE_STATS':
      handleGetCacheStats(event)
      break
      
    case 'CLEAR_CACHE':
      handleClearCache(event, payload)
      break
      
    case 'PRELOAD_RESOURCES':
      handlePreloadResources(event, payload)
      break
  }
})

async function handleGetCacheStats(event) {
  try {
    const cacheNames = await caches.keys()
    const stats = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        return { name, count: keys.length }
      })
    )
    
    event.ports[0].postMessage({ type: 'CACHE_STATS', payload: stats })
  } catch (error) {
    event.ports[0].postMessage({ type: 'ERROR', payload: error.message })
  }
}

async function handleClearCache(event, cacheName) {
  try {
    if (cacheName) {
      await caches.delete(cacheName)
    } else {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }
    
    event.ports[0].postMessage({ type: 'CACHE_CLEARED', payload: cacheName })
  } catch (error) {
    event.ports[0].postMessage({ type: 'ERROR', payload: error.message })
  }
}

async function handlePreloadResources(event, urls) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    await cache.addAll(urls)
    
    event.ports[0].postMessage({ type: 'RESOURCES_PRELOADED', payload: urls })
  } catch (error) {
    event.ports[0].postMessage({ type: 'ERROR', payload: error.message })
  }
}
