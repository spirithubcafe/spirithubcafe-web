import { useState, useEffect } from 'react';

interface AdminDebugSettings {
  showPerformanceBudget: boolean;
  showAuthDebugPanel: boolean;
  enableDebugMode: boolean;
}

const STORAGE_KEY = 'admin-debug-settings';

// Default settings
const defaultSettings: AdminDebugSettings = {
  showPerformanceBudget: false,
  showAuthDebugPanel: false,
  enableDebugMode: false,
};

// Get settings from localStorage
const getStoredSettings = (): AdminDebugSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to parse stored admin debug settings:', error);
  }
  
  return defaultSettings;
};

// Save settings to localStorage
const saveSettings = (settings: AdminDebugSettings): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save admin debug settings:', error);
  }
};

// Hook for managing admin debug settings
export const useAdminDebugSettings = () => {
  const [settings, setSettings] = useState<AdminDebugSettings>(getStoredSettings);

  // Update localStorage when settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const togglePerformanceBudget = () => {
    setSettings(prev => ({ ...prev, showPerformanceBudget: !prev.showPerformanceBudget }));
  };

  const toggleAuthDebugPanel = () => {
    setSettings(prev => ({ ...prev, showAuthDebugPanel: !prev.showAuthDebugPanel }));
  };

  const toggleDebugMode = () => {
    setSettings(prev => ({ ...prev, enableDebugMode: !prev.enableDebugMode }));
  };

  const resetAllSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    ...settings,
    togglePerformanceBudget,
    toggleAuthDebugPanel,
    toggleDebugMode,
    resetAllSettings,
  };
};

// Helper function to check if user is admin and debug is enabled
export const canShowDebugTools = (userRole?: string, debugEnabled?: boolean): boolean => {
  const isDev = import.meta.env.DEV;
  const isAdmin = userRole === 'admin';
  
  // In development, always allow debug tools for testing
  if (isDev) return true;
  
  // In production, only show if user is admin AND debug is explicitly enabled
  return isAdmin && (debugEnabled ?? false);
};

// Helper to check if specific debug tool should be shown
export const shouldShowDebugTool = (
  toolType: 'performance' | 'auth',
  userRole?: string
): boolean => {
  const settings = getStoredSettings();
  
  if (!canShowDebugTools(userRole, settings.enableDebugMode)) {
    return false;
  }
  
  switch (toolType) {
    case 'performance':
      return settings.showPerformanceBudget;
    case 'auth':
      return settings.showAuthDebugPanel;
    default:
      return false;
  }
};
