import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './UICustomizationPage.css';

interface UITheme {
  id?: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  is_active: boolean;
  is_default: boolean;
}

interface UISettings {
  id?: number;
  theme_id?: number;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  custom_js?: string;
}

export const UICustomizationPage: React.FC = () => {
  const [themes, setThemes] = useState<UITheme[]>([]);
  const [settings, setSettings] = useState<UISettings>({});
  const [loading, setLoading] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<UITheme | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: themesData, refetch: refetchThemes } = useApiQuery<UITheme[]>('/api/settings/ui/themes');
  const { data: settingsData, refetch: refetchSettings } = useApiQuery<UISettings>('/api/settings/ui');
  const createThemeMutation = useApiMutation();
  const updateSettingsMutation = useApiMutation();

  useEffect(() => {
    if (themesData) {
      setThemes(themesData);
    }
    if (settingsData) {
      setSettings(settingsData);
    }
    if (themesData && settingsData) {
      setLoading(false);
    }
  }, [themesData, settingsData]);

  useEffect(() => {
    // Verifică dark mode din localStorage sau din settings
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  const handleSaveTheme = async (theme: UITheme) => {
    try {
      if (editingTheme?.id) {
        await createThemeMutation.mutate({
          url: `/api/settings/ui/themes/${editingTheme.id}`,
          method: 'PUT',
          data: theme
        });
        setAlert({ type: 'success', message: 'Temă actualizată cu succes!' });
      } else {
        await createThemeMutation.mutate({
          url: '/api/settings/ui/themes',
          method: 'POST',
          data: theme
        });
        setAlert({ type: 'success', message: 'Temă creată cu succes!' });
      }
      setShowThemeModal(false);
      setEditingTheme(null);
      refetchThemes();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutate({
        url: '/api/settings/ui',
        method: 'PUT',
        data: settings
      });
      setAlert({ type: 'success', message: 'Setări UI salvate cu succes!' });
      refetchSettings();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleSelectTheme = async (themeId: number) => {
    try {
      await updateSettingsMutation.mutate({
        url: '/api/settings/ui',
        method: 'PUT',
        data: { ...settings, theme_id: themeId }
      });
      setAlert({ type: 'success', message: 'Temă aplicată cu succes!' });
      refetchSettings();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la aplicare' });
    }
  };

  if (loading) {
    return <div className="ui-customization-page">Se încarcă...</div>;
  }

  return (
    <div className="ui-customization-page">
      <PageHeader
        title="Personalizare UI"
        description="Configurare teme, culori, logo și dark mode"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="ui-customization-page__content">
        <div className="ui-section">
          <h3>Dark Mode</h3>
          <div className="dark-mode-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleToggleDarkMode}
              />
              <span className="slider"></span>
            </label>
            <span>{darkMode ? 'Dark Mode Activ' : 'Light Mode Activ'}</span>
          </div>
        </div>

        <div className="ui-section">
          <div className="section-header">
            <h3>Teme UI</h3>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTheme(null);
                setShowThemeModal(true);
              }}
            >
              ➕ Adaugă Temă
            </button>
          </div>
          <div className="themes-grid">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${settings.theme_id === theme.id ? 'theme-card--active' : ''}`}
                onClick={() => theme.id && handleSelectTheme(theme.id)}
              >
                <div
                  className="theme-preview"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary_color} 0%, ${theme.secondary_color} 100%)`,
                  }}
                >
                  <div className="theme-preview__colors">
                    <div
                      className="color-dot"
                      style={{ backgroundColor: theme.primary_color }}
                    />
                    <div
                      className="color-dot"
                      style={{ backgroundColor: theme.secondary_color }}
                    />
                    <div
                      className="color-dot"
                      style={{ backgroundColor: theme.accent_color }}
                    />
                  </div>
                </div>
                <div className="theme-card__body">
                  <h4>{theme.name}</h4>
                  {theme.is_default && <span className="badge badge-info">Default</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ui-section">
          <h3>Setări UI</h3>
          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="text"
              value={settings.logo_url || ''}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="form-group">
            <label>Favicon URL</label>
            <input
              type="text"
              value={settings.favicon_url || ''}
              onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
          <div className="form-group">
            <label>CSS Personalizat</label>
            <textarea
              value={settings.custom_css || ''}
              onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
              rows={5}
              placeholder="/* CSS personalizat */"
            />
          </div>
          <div className="form-group">
            <label>JavaScript Personalizat</label>
            <textarea
              value={settings.custom_js || ''}
              onChange={(e) => setSettings({ ...settings, custom_js: e.target.value })}
              rows={5}
              placeholder="// JavaScript personalizat"
            />
          </div>
          <div className="ui-actions">
            <button className="btn btn-primary" onClick={handleSaveSettings}>
              💾 Salvează Setări
            </button>
          </div>
        </div>
      </div>

      {showThemeModal && (
        <ThemeModal
          theme={editingTheme}
          onSave={handleSaveTheme}
          onClose={() => {
            setShowThemeModal(false);
            setEditingTheme(null);
          }}
        />
      )}
    </div>
  );
};

interface ThemeModalProps {
  theme: UITheme | null;
  onSave: (theme: UITheme) => void;
  onClose: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ theme, onSave, onClose }) => {
  const [formData, setFormData] = useState<UITheme>({
    name: theme?.name || '',
    primary_color: theme?.primary_color || '#007bff',
    secondary_color: theme?.secondary_color || '#6c757d',
    background_color: theme?.background_color || '#ffffff',
    text_color: theme?.text_color || '#212529',
    accent_color: theme?.accent_color || '#28a745',
    is_active: theme?.is_active ?? true,
    is_default: theme?.is_default ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{theme ? 'Editare Temă' : 'Adaugă Temă'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Culoare Principală</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Culoare Secundară</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Culoare Accent</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                />
                <input
                  type="text"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Culoare Text</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Culoare Fundal</label>
            <div className="color-input-group">
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              />
              <input
                type="text"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              />
            </div>
          </div>
          <div className="theme-preview-box" style={{ background: formData.background_color, color: formData.text_color }}>
            <div style={{ background: formData.primary_color, padding: '1rem', borderRadius: '4px' }}>
              Preview Temă
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Anulează
            </button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

