import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { registerServiceWorker } from './utils/service-worker'

// Filter out verbose console logs
if (import.meta.env.DEV) {
  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error
  
  console.log = (...args) => {
    // Filter out workbox logs and other verbose logs
    if (args[0] && typeof args[0] === 'string') {
      const logText = args[0]
      if (logText.includes('workbox') ||
          logText.includes('🚀 Installing update') ||
          logText.includes('Timer \'Firestore Query\'') ||
          logText.includes('SettingsService -') ||
          logText.includes('Failed to preload')) {
        return
      }
    }
    originalLog.apply(console, args)
  }
  
  console.warn = (...args) => {
    // Filter out quota warnings, preload warnings, and Firebase warnings
    if (args[0] && typeof args[0] === 'string') {
      const warnText = args[0]
      if (warnText.includes('Failed to persist cache item') ||
          warnText.includes('Failed to preload') ||
          warnText.includes('QuotaExceededError') ||
          warnText.includes('⚠️ Firebase quota exceeded') ||
          warnText.includes('⚠️ Permission denied') ||
          warnText.includes('⚠️ Firebase unavailable')) {
        return
      }
    }
    originalWarn.apply(console, args)
  }
  
  console.error = (...args) => {
    // Filter out non-critical 404s and quota errors
    if (args[0] && typeof args[0] === 'string') {
      const errorText = args[0]
      if (errorText.includes('api/analytics/performance') ||
          errorText.includes('api/categories') ||
          errorText.includes('api/products') ||
          errorText.includes('api/settings/homepage') ||
          errorText.includes('Quota exceeded') ||
          errorText.includes('resource-exhausted') ||
          errorText.includes('❌ Firestore operation failed (getFooterPages)') ||
          errorText.includes('❌ Firestore operation failed (getDocument)') ||
          errorText.includes('Error getting hero settings')) {
        return
      }
    }
    originalError.apply(console, args)
  }
}

// Register Service Worker for caching
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
