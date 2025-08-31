import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { registerServiceWorker } from './utils/service-worker'

// Filter out workbox console logs
if (import.meta.env.DEV) {
  const originalLog = console.log
  console.log = (...args) => {
    // Filter out workbox logs
    if (args[0] && typeof args[0] === 'string' && args[0].includes('workbox')) {
      return
    }
    originalLog.apply(console, args)
  }
}

// Register Service Worker for caching
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
