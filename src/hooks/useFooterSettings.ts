import { useState, useEffect } from 'react'
import { settingsService, type FooterSettings } from '@/services/settings'

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()

    // Listen for footer settings updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'footer-settings-updated') {
        loadSettings()
      }
    }

    const handleCustomEvent = () => {
      loadSettings()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('footer-settings-updated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('footer-settings-updated', handleCustomEvent)
    }
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const footerSettings = await settingsService.getFooterSettings()
      
      setSettings(footerSettings)
    } catch (err) {
       setError('Failed to load footer settings')
      // Use default settings as fallback
      const defaultSettings = settingsService.getDefaultFooterSettings()
       setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: FooterSettings): Promise<boolean> => {
    try {
      await settingsService.updateFooterSettings(newSettings)
      setSettings(newSettings)
      
      // Force re-render by dispatching event
      window.dispatchEvent(new CustomEvent('footer-settings-updated'))
      
      return true
    } catch (err) {
       setError('Failed to update footer settings')
      return false
    }
  }

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings
  }
}
