// components/BrandingPanel.jsx
// FAZA 2D - Săptămâna 7: Branding Configuration Panel

import React, { useState, useEffect } from 'react';
import { useBranding } from '../hooks';
import './BrandingPanel.css';

/**
 * Branding Panel - UI pentru configurarea branding-ului tenant-ului
 * 
 * Props:
 * - onClose: callback când panelul se închide
 * - onSave: callback când branding-ul este salvat
 * 
 * Usage:
 * ```jsx
 * <BrandingPanel 
 *   onClose={() => setShowBranding(false)}
 *   onSave={() => refreshApp()}
 * />
 * ```
 */
export function BrandingPanel({ onClose, onSave }) {
    const { branding, loading, updateBranding, applyBranding } = useBranding();
    
    const [formData, setFormData] = useState({
        logo_url: '',
        primary_color: '#1976d2',
        secondary_color: '#dc004e',
        accent_color: '#ffa726',
        background_color: '#f5f5f5',
        text_color: '#333333',
        font_family: 'Inter, system-ui, sans-serif',
        theme: 'light'
    });
    
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    
    // Load existing branding
    useEffect(() => {
        if (branding) {
            setFormData(branding);
            if (branding.logo_url) {
                setLogoPreview(branding.logo_url);
            }
        }
    }, [branding]);
    
    // Handle color change
    function handleColorChange(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Live preview
        if (showPreview) {
            document.documentElement.style.setProperty(`--${field.replace('_', '-')}`, value);
        }
    }
    
    // Handle font change
    function handleFontChange(value) {
        setFormData(prev => ({ ...prev, font_family: value }));
        
        if (showPreview) {
            document.documentElement.style.setProperty('--font-family', value);
        }
    }
    
    // Handle theme change
    function handleThemeChange(value) {
        setFormData(prev => ({ ...prev, theme: value }));
        
        if (showPreview) {
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${value}`);
        }
    }
    
    // Handle logo upload
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Te rog să încarci un fișier imagine (PNG, JPG, SVG)');
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Fișierul este prea mare. Mărimea maximă este 2MB.');
            return;
        }
        
        setLogoFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    // Handle save
    async function handleSave() {
        setSaving(true);
        
        try {
            // TODO: Upload logo to server if logoFile exists
            // const uploadedLogoUrl = await uploadLogo(logoFile);
            
            const newBranding = {
                ...formData,
                logo_url: logoPreview || formData.logo_url
            };
            
            const result = await updateBranding(newBranding);
            
            if (result.success) {
                applyBranding();
                if (onSave) onSave();
                if (onClose) onClose();
            } else {
                alert(`Eroare la salvare: ${result.error}`);
            }
        } catch (error) {
            console.error('[BrandingPanel] Save error:', error);
            alert('Eroare la salvarea branding-ului');
        }
        
        setSaving(false);
    }
    
    // Reset to defaults
    function handleReset() {
        if (!confirm('Sigur vrei să resetezi branding-ul la valorile implicite?')) return;
        
        const defaults = {
            logo_url: '',
            primary_color: '#1976d2',
            secondary_color: '#dc004e',
            accent_color: '#ffa726',
            background_color: '#f5f5f5',
            text_color: '#333333',
            font_family: 'Inter, system-ui, sans-serif',
            theme: 'light'
        };
        
        setFormData(defaults);
        setLogoFile(null);
        setLogoPreview(null);
        
        // Apply immediately for preview
        Object.entries(defaults).forEach(([key, value]) => {
            const cssVar = `--${key.replace('_', '-')}`;
            document.documentElement.style.setProperty(cssVar, value);
        });
        
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add('theme-light');
    }
    
    if (loading) {
        return (
            <div className="branding-panel">
                <div className="branding-panel__loading">
                    <div className="spinner"></div>
                    <p>Se încarcă branding...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="branding-panel">
            {/* Header */}
            <div className="branding-panel__header">
                <h2>🎨 Configurare Branding</h2>
                <div className="header-actions">
                    <label className="toggle-preview">
                        <input
                            type="checkbox"
                            checked={showPreview}
                            onChange={(e) => setShowPreview(e.target.checked)}
                        />
                        Live Preview
                    </label>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>
            </div>
            
            {/* Content */}
            <div className="branding-panel__content">
                
                {/* Logo Section */}
                <section className="branding-section">
                    <h3 className="section-title">Logo</h3>
                    
                    <div className="logo-upload">
                        {logoPreview && (
                            <div className="logo-preview">
                                <img src={logoPreview} alt="Logo preview" />
                            </div>
                        )}
                        
                        <div className="upload-actions">
                            <label className="btn btn-secondary">
                                📁 {logoPreview ? 'Schimbă Logo' : 'Încarcă Logo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            
                            {logoPreview && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        setLogoFile(null);
                                        setLogoPreview(null);
                                    }}
                                >
                                    🗑️ Șterge
                                </button>
                            )}
                        </div>
                        
                        <p className="upload-hint">
                            Format: PNG, JPG, SVG • Mărime max: 2MB • Dimensiune recomandată: 200x60px
                        </p>
                    </div>
                </section>
                
                {/* Colors Section */}
                <section className="branding-section">
                    <h3 className="section-title">Culori</h3>
                    
                    <div className="color-grid">
                        <div className="color-item">
                            <label>Culoare Primară</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={formData.primary_color}
                                    onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                    placeholder="#1976d2"
                                />
                            </div>
                        </div>
                        
                        <div className="color-item">
                            <label>Culoare Secundară</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={formData.secondary_color}
                                    onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={formData.secondary_color}
                                    onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                    placeholder="#dc004e"
                                />
                            </div>
                        </div>
                        
                        <div className="color-item">
                            <label>Culoare Accent</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={formData.accent_color}
                                    onChange={(e) => handleColorChange('accent_color', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={formData.accent_color}
                                    onChange={(e) => handleColorChange('accent_color', e.target.value)}
                                    placeholder="#ffa726"
                                />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Typography Section */}
                <section className="branding-section">
                    <h3 className="section-title">Tipografie</h3>
                    
                    <div className="font-selector">
                        <label>Font Family</label>
                        <select
                            value={formData.font_family}
                            onChange={(e) => handleFontChange(e.target.value)}
                        >
                            <option value="Inter, system-ui, sans-serif">Inter (Default)</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Lato, sans-serif">Lato</option>
                            <option value="Montserrat, sans-serif">Montserrat</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="Raleway, sans-serif">Raleway</option>
                            <option value="Georgia, serif">Georgia (Serif)</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Courier New, monospace">Courier New (Mono)</option>
                        </select>
                        
                        <div className="font-preview" style={{ fontFamily: formData.font_family }}>
                            <p className="preview-large">Aa Bb Cc 123</p>
                            <p className="preview-text">
                                The quick brown fox jumps over the lazy dog.
                            </p>
                        </div>
                    </div>
                </section>
                
                {/* Theme Section */}
                <section className="branding-section">
                    <h3 className="section-title">Temă</h3>
                    
                    <div className="theme-selector">
                        <label className={`theme-option ${formData.theme === 'light' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={formData.theme === 'light'}
                                onChange={(e) => handleThemeChange(e.target.value)}
                            />
                            <div className="theme-preview theme-preview--light">
                                <span className="preview-icon">☀️</span>
                                <span className="preview-label">Light Mode</span>
                            </div>
                        </label>
                        
                        <label className={`theme-option ${formData.theme === 'dark' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={formData.theme === 'dark'}
                                onChange={(e) => handleThemeChange(e.target.value)}
                            />
                            <div className="theme-preview theme-preview--dark">
                                <span className="preview-icon">🌙</span>
                                <span className="preview-label">Dark Mode</span>
                            </div>
                        </label>
                    </div>
                </section>
            </div>
            
            {/* Footer */}
            <div className="branding-panel__footer">
                <button
                    className="btn btn-danger"
                    onClick={handleReset}
                >
                    🔄 Reset la Implicit
                </button>
                
                <div className="footer-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Se salvează...' : '💾 Salvează'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Anulează
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BrandingPanel;

