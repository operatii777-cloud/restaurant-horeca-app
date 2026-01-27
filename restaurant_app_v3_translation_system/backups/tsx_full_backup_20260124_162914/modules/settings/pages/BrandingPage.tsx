// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.6 - Branding Manager Page
 * 
 * UI for managing tenant branding (logo, colors, fonts, theme).
 */

import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';

interface BrandingConfig {
  tenant_id: number;
  brand_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  font_family: string;
  font_size_base: string;
  layout_type: string;
  custom_css: string | null;
  colors: Record<string, string>; // { primary: '#3B82F6', secondary: '#10B981', ... }
  primary_color?: string; // For backward compatibility
  secondary_color?: string; // For backward compatibility
}

export const BrandingPage = () => {
//   const { t } = useTranslation();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<BrandingConfig>>({});

  useEffect(() => {
    fetchBranding();
  }, []);

  useEffect(() => {
    if (branding) {
      // Inject CSS variables for live preview
      injectThemeVariables(branding);
    }
  }, [branding]);

  const fetchBranding = async () => {
    try {
      setIsLoading(true);
      const response = await httpClient.get('/api/config/branding');
      if (response.data?.success) {
        const brandingData = response.data.branding;
        setBranding(brandingData);
        setFormData(brandingData);
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const injectThemeVariables = (config: BrandingConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.primary_color || '#3B82F6');
    root.style.setProperty('--secondary-color', config.secondary_color || '#10B981');
    root.style.setProperty('--font-family', config.font_family || 'Inter, sans-serif');
    root.style.setProperty('--font-size-base', config.font_size_base || '16px');
    
    if (config.custom_css) {
      // Inject custom CSS
      let styleElement = document.getElementById('custom-branding-css');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-branding-css';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = config.custom_css;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await httpClient.put('/api/config/branding', formData);
      if (response.data?.success) {
        setBranding(response.data.branding);
        setFormData(response.data.branding);
        alert('Branding saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving branding:', error);
      alert(error.response?.data?.error || 'Error saving branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Implement actual file upload with multer
    // For now, just update the form data
    const reader = new FileReader();
    reader.onloadend = () => {
      const logoUrl = reader.result as string;
      setFormData({ ...formData, logo_url: logoUrl });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading branding configuration...</div>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="p-6">
        <div className="text-center">Error loading branding configuration</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Branding & Theme</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand Name</label>
            <input
              type="text"
              value={formData.brand_name || ''}
              onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="restaurant app"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  className="h-16 w-auto object-contain border rounded p-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-sm"
              />
            </div>
          </div>

          {/* Favicon Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Favicon</label>
            <div className="flex items-center gap-4">
              {formData.favicon_url && (
                <img
                  src={formData.favicon_url}
                  alt="Favicon"
                  className="h-8 w-8 object-contain border rounded p-1"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, favicon_url: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-sm"
              />
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors?.primary || formData.primary_color || '#3B82F6'}
                onChange={(e) => {
                  const newColors = { ...formData.colors, primary: e.target.value };
                  setFormData({ ...formData, colors: newColors, primary_color: e.target.value });
                }}
                className="h-10 w-20 border rounded"
              />
              <input
                type="text"
                value={formData.colors?.primary || formData.primary_color || '#3B82F6'}
                onChange={(e) => {
                  const newColors = { ...formData.colors, primary: e.target.value };
                  setFormData({ ...formData, colors: newColors, primary_color: e.target.value });
                }}
                className="flex-1 border rounded px-3 py-2"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors?.secondary || formData.secondary_color || '#10B981'}
                onChange={(e) => {
                  const newColors = { ...formData.colors, secondary: e.target.value };
                  setFormData({ ...formData, colors: newColors, secondary_color: e.target.value });
                }}
                className="h-10 w-20 border rounded"
              />
              <input
                type="text"
                value={formData.colors?.secondary || formData.secondary_color || '#10B981'}
                onChange={(e) => {
                  const newColors = { ...formData.colors, secondary: e.target.value };
                  setFormData({ ...formData, colors: newColors, secondary_color: e.target.value });
                }}
                className="flex-1 border rounded px-3 py-2"
                placeholder="#10B981"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={formData.font_family || 'Inter, sans-serif'}
              onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">"open sans"</option>
              <option value="Lato, sans-serif">"Lato"</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Poppins, sans-serif">Poppins</option>
            </select>
          </div>

          {/* Font Size Base */}
          <div>
            <label className="block text-sm font-medium mb-2">Base Font Size</label>
            <input
              type="text"
              value={formData.font_size_base || '16px'}
              onChange={(e) => setFormData({ ...formData, font_size_base: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="16px"
            />
          </div>

          {/* Layout Type */}
          <div>
            <label className="block text-sm font-medium mb-2">"layout type"</label>
            <select
              value={formData.layout_type || "Default"}
              onChange={(e) => setFormData({ ...formData, layout_type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="default">"Default"</option>
              <option value="compact">Compact</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block text-sm font-medium mb-2">"custom css"</label>
            <textarea
              value={formData.custom_css || ''}
              onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
              className="w-full border rounded px-3 py-2 font-mono text-sm"
              rows={8}
              placeholder="/* Custom CSS here */"
            />
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
          <div className="border rounded-lg p-6 bg-white shadow">
            <div className="space-y-4">
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b pb-4">
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="h-8 w-auto" />
                )}
                <span className="text-lg font-semibold">{formData.brand_name || 'Restaurant App'}</span>
              </div>

              {/* Preview Buttons */}
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: formData.colors?.primary || formData.primary_color || '#3B82F6' }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: formData.colors?.secondary || formData.secondary_color || '#10B981' }}
                >
                  Secondary Button
                </button>
              </div>

              {/* Preview Text */}
              <div style={{ fontFamily: formData.font_family || 'Inter, sans-serif' }}>
                <p className="text-base mb-2">
                  This is a preview of how your branding will look. The font family, colors, and
                  styling will be applied throughout the application.
                </p>
                <p className="text-sm text-gray-600">
                  Font size: {formData.font_size_base || '16px'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



