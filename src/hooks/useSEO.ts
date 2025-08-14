import { useState, useEffect } from 'react'
import { seoService } from '@/services/seo'
import type { SEOSettings, SEOAnalysis, SEOMeta } from '@/types/seo'

export function useSEOSettings() {
  const [settings, setSettings] = useState<SEOSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const seoSettings = await seoService.getSEOSettings()
      setSettings(seoSettings)
    } catch (err) {
      console.error('Error loading SEO settings:', err)
      setError('Failed to load SEO settings')
      setSettings(seoService.getDefaultSEOSettings())
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: SEOSettings): Promise<boolean> => {
    try {
      await seoService.updateSEOSettings(newSettings)
      setSettings(newSettings)
      return true
    } catch (err) {
      console.error('Error updating SEO settings:', err)
      setError('Failed to update SEO settings')
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

export function useSEOAnalysis(meta: SEOMeta) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)

  useEffect(() => {
    if (meta) {
      const result = seoService.analyzeSEO(meta)
      setAnalysis(result)
    }
  }, [meta])

  return analysis
}
