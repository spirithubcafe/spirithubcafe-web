import { useEffect, useState } from 'react'
import perf, { type Metric } from '../utils/performance-monitor'

function fmt(ms: number) {
  const n = Math.round(ms)
  if (n < 1000) return `${n} ms`
  return `${(n / 1000).toFixed(2)} s`
}

export default function PerformanceWidget() {
  const [metrics, setMetrics] = useState<Record<string, number>>({})

  useEffect(() => {
    const unsub = perf.subscribe((m: Metric) => {
      setMetrics(prev => ({ ...prev, [m.name]: Math.round(m.value) }))
    })
    return () => { unsub() }
  }, [])

  // Slightly bigger, clearer widget
  const style: React.CSSProperties = {
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 9999,
    background: 'rgba(17,24,39,0.95)',
    color: 'white',
    padding: '12px 14px',
    borderRadius: 10,
    fontSize: 14,
    lineHeight: '1.25',
    minWidth: 220,
    boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)'
  }

  const headerStyle: React.CSSProperties = { fontWeight: 700, marginBottom: 8, fontSize: 15 }
  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }
  const labelStyle: React.CSSProperties = { opacity: 0.95 }
  const valueStyle: React.CSSProperties = { fontFamily: 'monospace', fontWeight: 600 }

  return (
    <div style={style} aria-hidden>
      <div style={headerStyle}>Performance</div>
      <div style={rowStyle}>
        <div style={labelStyle}>Page load time</div>
        <div style={valueStyle}>{metrics.pageLoad ? fmt(metrics.pageLoad) : '—'}</div>
      </div>
      <div style={rowStyle}>
        <div style={labelStyle}>first contentful paint</div>
        <div style={valueStyle}>{metrics.fcp ? fmt(metrics.fcp) : '—'}</div>
      </div>
      <div style={rowStyle}>
        <div style={labelStyle}>largest contentful paint</div>
        <div style={valueStyle}>{metrics.lcp ? fmt(metrics.lcp) : '—'}</div>
      </div>
      <div style={rowStyle}>
        <div style={labelStyle}>First input delay</div>
        <div style={valueStyle}>{metrics.fid ? fmt(metrics.fid) : '—'}</div>
      </div>
    </div>
  )
}
