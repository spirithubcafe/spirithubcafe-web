import { useState, useEffect } from 'react'
import { settingsService, type FooterSettings } from '@/services/settings'

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const footerSettings = await settingsService.getFooterSettings()
      setSettings(footerSettings)
    } catch (err) {
      console.error('Error loading footer settings:', err)
      setError('Failed to load footer settings')
      // Use default settings as fallback
      setSettings(settingsService.getDefaultFooterSettings())
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: FooterSettings): Promise<boolean> => {
    try {
      await settingsService.updateFooterSettings(newSettings)
      setSettings(newSettings)
      return true
    } catch (err) {
      console.error('Error updating footer settings:', err)
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
