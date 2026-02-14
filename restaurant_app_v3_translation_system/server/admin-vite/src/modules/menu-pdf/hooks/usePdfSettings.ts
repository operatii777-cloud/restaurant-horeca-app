// hooks/usePdfSettings.ts
import { useState, useCallback, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';

export interface PdfSettings {
  // Font settings
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  
  // Color scheme
  headerColor: string;
  backgroundColor: string;
  textColor: string;
  priceColor: string;
  
  // Layout
  layout: 'single-column' | 'two-column' | 'three-column';
  orientation: 'portrait' | 'landscape';
  
  // Spacing
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  categorySpacing: number;
  productSpacing: number;
  
  // Content
  showPrices: boolean;
  showDescriptions: boolean;
  showImages: boolean;
  
  // Advanced
  pageSize: 'A4' | 'Letter' | 'A5';
  template: 'modern' | 'classic' | 'elegant' | 'minimal';
}

export const defaultSettings: PdfSettings = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 12,
  fontWeight: 'normal',
  headerColor: '#2c3e50',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  priceColor: '#27ae60',
  layout: 'single-column',
  orientation: 'portrait',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  categorySpacing: 15,
  productSpacing: 8,
  showPrices: true,
  showDescriptions: false,
  showImages: true,
  pageSize: 'A4',
  template: 'modern',
};

export interface UsePdfSettingsResult {
  settings: PdfSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<PdfSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePdfSettings(): UsePdfSettingsResult {
  const [settings, setSettings] = useState<PdfSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get<{ success: boolean; settings?: PdfSettings }>(
        '/api/menu/pdf/builder/settings'
      );
      
      if (response.data.success && response.data.settings) {
        setSettings({ ...defaultSettings, ...response.data.settings });
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eroare la încărcarea setărilor';
      console.warn('Settings not found, using defaults:', message);
      setError(null); // Don't show error, just use defaults
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<PdfSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await httpClient.post('/api/menu/pdf/builder/settings', { settings: updatedSettings });
      setSettings(updatedSettings);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la salvarea setărilor');
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    try {
      await httpClient.post('/api/menu/pdf/builder/settings', { settings: defaultSettings });
      setSettings(defaultSettings);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la resetarea setărilor');
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    refetch: fetchSettings,
  };
}
