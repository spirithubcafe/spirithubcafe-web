// Lightweight real-time performance monitor (no external deps)
// Exposes initPerformanceMonitoring() to start observers and
// subscribe(fn) to receive metric updates.

type MetricName = 'pageLoad' | 'fcp' | 'lcp' | 'fid'

export type Metric = {
  name: MetricName
  value: number // milliseconds
  id?: string
  entries?: PerformanceEntry[]
}

type Subscriber = (m: Metric) => void

const subscribers = new Set<Subscriber>()

function notify(metric: Metric) {
  subscribers.forEach(s => {
    try { s(metric) } catch (e) { /* ignore subscriber errors */ }
  })
  // Also log compactly to console for quick debugging
  if (import.meta.env.DEV) {
    console.info('[perf]', metric.name, Math.round(metric.value), 'ms')
  }
  // Optionally POST to server endpoint if set
  const endpoint = (import.meta.env as any).VITE_PERF_REPORT_ENDPOINT
  if (endpoint) {
    try {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true,
      })
    } catch (e) {
      // swallow network errors
    }
  }
}

export function subscribe(fn: Subscriber) {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}

export function initPerformanceMonitoring() {
  try {
    // Page load time (navigation)
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0]
      const load = nav.loadEventEnd && nav.startTime >= 0 ? nav.loadEventEnd - nav.startTime : nav.duration
      if (!Number.isNaN(load)) notify({ name: 'pageLoad', value: Math.round(load), entries: [nav] })
    } else if ((performance as any).timing) {
      // legacy fallback
      const t = (performance as any).timing
      const load = t.loadEventEnd - t.navigationStart
      if (load > 0) notify({ name: 'pageLoad', value: Math.round(load) })
    }

    // First Contentful Paint (FCP)
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as PerformanceEntry).name === 'first-contentful-paint') {
            notify({ name: 'fcp', value: Math.round(entry.startTime), entries: [entry] })
          }
        }
      })
      po.observe({ type: 'paint', buffered: true })
    } catch (e) {
      // ignore if PerformanceObserver or entry type not supported
    }

    // Largest Contentful Paint (LCP)
    try {
      let lastLCP: PerformanceEntry | null = null
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length) {
          lastLCP = entries[entries.length - 1]
          notify({ name: 'lcp', value: Math.round(lastLCP.startTime), entries: [lastLCP] })
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // Finalize LCP on pagehide/visibilitychange
      const finalize = () => {
        if (lastLCP) notify({ name: 'lcp', value: Math.round(lastLCP.startTime), entries: [lastLCP] })
      }
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') finalize() })
      addEventListener('pagehide', finalize)
    } catch (e) {
      // ignore
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEventTiming[]) {
          // processingStart - startTime is the delay
          const fid = Math.round(entry.processingStart - entry.startTime)
          notify({ name: 'fid', value: fid, entries: [entry] })
        }
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
    } catch (e) {
      // fallback: approximate using Event Timing not available
    }
  } catch (err) {
    // swallow overall errors to avoid breaking the app
    if (import.meta.env.DEV) console.warn('initPerformanceMonitoring error', err)
  }
}

export default {
  initPerformanceMonitoring,
  subscribe,
}
