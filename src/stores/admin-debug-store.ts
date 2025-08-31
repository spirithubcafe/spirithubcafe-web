import { useState, useEffect } from 'react';

interface AdminDebugSettings {
  enableDebugMode: boolean;
}

const STORAGE_KEY = 'admin-debug-settings';

// Default settings
const defaultSettings: AdminDebugSettings = {
  enableDebugMode: false,
};

// Get settings from localStorage
const getStoredSettings = (): AdminDebugSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse admin debug settings from localStorage:', error);
  }
  
  return defaultSettings;
};

// Save settings to localStorage
const saveSettings = (settings: AdminDebugSettings): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save admin debug settings to localStorage:', error);
  }
};

// Hook for managing admin debug settings
export const useAdminDebugSettings = () => {
  const [settings, setSettings] = useState<AdminDebugSettings>(getStoredSettings);

  // Update localStorage when settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const toggleDebugMode = () => {
    setSettings(prev => ({ ...prev, enableDebugMode: !prev.enableDebugMode }));
  };

  const resetAllSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    ...settings,
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
  
  // In production, only allow for admins with debug enabled
  return isAdmin && (debugEnabled ?? false);
};

// Specific tool visibility check
export const shouldShowDebugTool = (
  toolType: 'console',
  userRole?: string
): boolean => {
  const settings = getStoredSettings();
  
  if (!canShowDebugTools(userRole, settings.enableDebugMode)) {
    return false;
  }
  
  switch (toolType) {
    case 'console':
      return settings.enableDebugMode;
    default:
      return false;
  }
};
