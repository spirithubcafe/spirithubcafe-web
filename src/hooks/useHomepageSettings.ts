import { useState, useEffect, useCallback } from 'react'
import { settingsService, type HomepageSettings } from '@/services/settings'

export function useHomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const homepageSettings = await settingsService.getHomepageSettings()
      console.log('useHomepageSettings - Loaded settings:', homepageSettings)
      setSettings(homepageSettings)
    } catch (error) {
      console.error('Error loading homepage settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateSettings = async (newSettings: HomepageSettings) => {
    try {
      await settingsService.updateHomepageSettings(newSettings)
      setSettings(newSettings)
      console.log('useHomepageSettings - Settings updated successfully')
      
      // Force a reload to make sure we have the latest data
      setTimeout(() => {
        loadSettings()
      }, 500)
    } catch (error) {
      console.error('Error updating homepage settings:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    refetch: loadSettings
  }
}