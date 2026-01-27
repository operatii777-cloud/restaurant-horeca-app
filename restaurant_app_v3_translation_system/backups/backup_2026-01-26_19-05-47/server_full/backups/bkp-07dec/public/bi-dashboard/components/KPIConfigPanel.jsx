// components/KPIConfigPanel.jsx
// FAZA 2C - Săptămâna 6: KPI Configuration Panel

import React, { useState } from 'react';
import { useKPIConfig } from '../hooks';
import './KPIConfigPanel.css';

/**
 * KPI Configuration Panel - UI pentru configurarea KPI-urilor
 * 
 * Props:
 * - onClose: callback când panelul se închide
 * - onSave: callback când configurația este salvată
 * 
 * Usage:
 * ```jsx
 * <KPIConfigPanel 
 *   onClose={() => setShowConfig(false)}
 *   onSave={() => refreshDashboard()}
 * />
 * ```
 */
export function KPIConfigPanel({ onClose, onSave }) {
    const {
        enabled_kpis,
        kpi_customization,
        available_kpis,
        categories,
        loading,
        error,
        enableKPI,
        disableKPI,
        customizeKPI,
        getKPIsByCategory
    } = useKPIConfig();
    
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingKPI, setEditingKPI] = useState(null);
    const [customizations, setCustomizations] = useState({});
    const [saving, setSaving] = useState(false);
    
    // Handle KPI toggle
    async function handleToggleKPI(kpiId, isEnabled) {
        if (isEnabled) {
            await disableKPI(kpiId);
        } else {
            await enableKPI(kpiId);
        }
    }
    
    // Handle customization
    async function handleSaveCustomization(kpiId) {
        setSaving(true);
        
        const custom = customizations[kpiId] || {};
        const result = await customizeKPI(kpiId, custom);
        
        if (result.success) {
            setEditingKPI(null);
            setCustomizations(prev => {
                const newCustom = { ...prev };
                delete newCustom[kpiId];
                return newCustom;
            });
        }
        
        setSaving(false);
    }
    
    // Get KPIs to display
    const displayKPIs = selectedCategory === 'all' 
        ? available_kpis 
        : getKPIsByCategory(selectedCategory);
    
    if (loading) {
        return (
            <div className="kpi-config-panel">
                <div className="kpi-config-panel__loading">
                    <div className="spinner"></div>
                    <p>Se încarcă configurația...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="kpi-config-panel">
            {/* Header */}
            <div className="kpi-config-panel__header">
                <h2>⚙️ Configurare KPI-uri</h2>
                <button className="btn-close" onClick={onClose}>✕</button>
            </div>
            
            {/* Category Filter */}
            <div className="kpi-config-panel__categories">
                <button
                    className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                >
                    Toate ({available_kpis.length})
                </button>
                {categories.map(cat => {
                    const count = getKPIsByCategory(cat).length;
                    return (
                        <button
                            key={cat}
                            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {getCategoryLabel(cat)} ({count})
                        </button>
                    );
                })}
            </div>
            
            {/* KPI List */}
            <div className="kpi-config-panel__list">
                {displayKPIs.map(kpi => {
                    const isEnabled = enabled_kpis.includes(kpi.id);
                    const isEditing = editingKPI === kpi.id;
                    const custom = customizations[kpi.id] || kpi_customization[kpi.id] || {};
                    
                    return (
                        <div 
                            key={kpi.id}
                            className={`kpi-item ${isEnabled ? 'enabled' : 'disabled'}`}
                        >
                            {/* KPI Header */}
                            <div className="kpi-item__header">
                                <div className="kpi-item__info">
                                    <span className="kpi-item__icon">{kpi.icon}</span>
                                    <div className="kpi-item__text">
                                        <h4 className="kpi-item__name">
                                            {custom.label_ro || kpi.label.ro}
                                        </h4>
                                        <p className="kpi-item__description">
                                            {kpi.description.ro}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="kpi-item__actions">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={() => handleToggleKPI(kpi.id, isEnabled)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    
                                    {isEnabled && (
                                        <button
                                            className="btn-edit"
                                            onClick={() => setEditingKPI(isEditing ? null : kpi.id)}
                                        >
                                            {isEditing ? '✕' : '✏️'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Customization Form */}
                            {isEnabled && isEditing && (
                                <div className="kpi-item__customize">
                                    <div className="customize-row">
                                        <label>Nume personalizat (RO):</label>
                                        <input
                                            type="text"
                                            value={customizations[kpi.id]?.label_ro || custom.label_ro || kpi.label.ro}
                                            onChange={(e) => setCustomizations(prev => ({
                                                ...prev,
                                                [kpi.id]: { ...prev[kpi.id], label_ro: e.target.value }
                                            }))}
                                            placeholder={kpi.label.ro}
                                        />
                                    </div>
                                    
                                    <div className="customize-row">
                                        <label>Nume personalizat (EN):</label>
                                        <input
                                            type="text"
                                            value={customizations[kpi.id]?.label_en || custom.label_en || kpi.label.en}
                                            onChange={(e) => setCustomizations(prev => ({
                                                ...prev,
                                                [kpi.id]: { ...prev[kpi.id], label_en: e.target.value }
                                            }))}
                                            placeholder={kpi.label.en}
                                        />
                                    </div>
                                    
                                    <div className="customize-row">
                                        <label>Culoare:</label>
                                        <input
                                            type="color"
                                            value={customizations[kpi.id]?.color || custom.color || kpi.defaultColor}
                                            onChange={(e) => setCustomizations(prev => ({
                                                ...prev,
                                                [kpi.id]: { ...prev[kpi.id], color: e.target.value }
                                            }))}
                                        />
                                        <span className="color-preview" style={{ 
                                            backgroundColor: customizations[kpi.id]?.color || custom.color || kpi.defaultColor 
                                        }}></span>
                                    </div>
                                    
                                    <div className="customize-actions">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleSaveCustomization(kpi.id)}
                                            disabled={saving}
                                        >
                                            {saving ? 'Salvare...' : 'Salvează'}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditingKPI(null);
                                                setCustomizations(prev => {
                                                    const newCustom = { ...prev };
                                                    delete newCustom[kpi.id];
                                                    return newCustom;
                                                });
                                            }}
                                        >
                                            Anulează
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Meta Info */}
                            <div className="kpi-item__meta">
                                <span className="meta-badge">{kpi.category}</span>
                                <span className="meta-badge">{kpi.unit}</span>
                                <span className="meta-badge">Plan: {kpi.minPlan}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Footer */}
            <div className="kpi-config-panel__footer">
                <div className="footer-info">
                    <span className="info-item">
                        ✅ {enabled_kpis.length} KPI-uri activate
                    </span>
                    <span className="info-item">
                        📊 {available_kpis.length} KPI-uri disponibile
                    </span>
                </div>
                <div className="footer-actions">
                    <button className="btn btn-primary" onClick={onSave}>
                        Salvează & Închide
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Anulează
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper Functions
function getCategoryLabel(category) {
    const labels = {
        revenue: '💰 Venituri',
        cost: '📦 Costuri',
        profit: '💎 Profit',
        customer: '👥 Clienți',
        efficiency: '⚡ Eficiență'
    };
    return labels[category] || category;
}

export default KPIConfigPanel;

