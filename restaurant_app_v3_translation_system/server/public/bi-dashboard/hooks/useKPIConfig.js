// hooks/useKPIConfig.js
// FAZA 2C - Săptămâna 5: React Hook pentru KPI Configuration

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pentru gestionarea configurației KPI-urilor
 * 
 * Returns:
 * {
 *   enabled_kpis: array,
 *   kpi_customization: object,
 *   dashboard_layout: object,
 *   available_kpis: array,
 *   categories: array,
 *   loading: boolean,
 *   error: string|null,
 *   updateConfig: function,
 *   enableKPI: function,
 *   disableKPI: function,
 *   customizeKPI: function
 * }
 * 
 * Usage:
 * ```jsx
 * const { enabled_kpis, available_kpis, enableKPI, disableKPI } = useKPIConfig();
 * 
 * // Enable a KPI
 * await enableKPI('gross_revenue');
 * 
 * // Disable a KPI
 * await disableKPI('net_profit');
 * 
 * // Customize a KPI
 * await customizeKPI('gross_revenue', {
 *   label_ro: 'Venituri Totale',
 *   color: '#00ff00'
 * });
 * ```
 */
export function useKPIConfig() {
    const [state, setState] = useState({
        enabled_kpis: [],
        kpi_customization: {},
        dashboard_layout: {},
        available_kpis: [],
        categories: [],
        loading: true,
        error: null
    });
    
    const fetchConfig = useCallback(async () => {
        try {
            const response = await fetch('/api/bi/config');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch KPI config');
            }
            
            setState({
                enabled_kpis: data.data.enabled_kpis,
                kpi_customization: data.data.kpi_customization,
                dashboard_layout: data.data.dashboard_layout,
                available_kpis: data.data.available_kpis,
                categories: data.data.categories,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error('[useKPIConfig] Error fetching config:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, []);
    
    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);
    
    /**
     * Actualizează configurația completă
     * @param {object} newConfig - Obiect cu enabled_kpis, kpi_customization, dashboard_layout
     */
    async function updateConfig(newConfig) {
        try {
            const response = await fetch('/api/bi/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newConfig)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to update config');
            }
            
            // Refresh config
            await fetchConfig();
            
            return { success: true };
            
        } catch (error) {
            console.error('[useKPIConfig] Error updating config:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Activează un KPI
     * @param {string} kpiId - ID-ul KPI-ului
     */
    async function enableKPI(kpiId) {
        if (!kpiId) return { success: false, error: 'KPI ID is required' };
        if (state.enabled_kpis.includes(kpiId)) {
            return { success: true, message: 'KPI already enabled' };
        }
        
        const newEnabledKPIs = [...state.enabled_kpis, kpiId];
        
        return await updateConfig({
            enabled_kpis: newEnabledKPIs,
            kpi_customization: state.kpi_customization,
            dashboard_layout: state.dashboard_layout
        });
    }
    
    /**
     * Dezactivează un KPI
     * @param {string} kpiId - ID-ul KPI-ului
     */
    async function disableKPI(kpiId) {
        if (!kpiId) return { success: false, error: 'KPI ID is required' };
        
        const newEnabledKPIs = state.enabled_kpis.filter(id => id !== kpiId);
        
        return await updateConfig({
            enabled_kpis: newEnabledKPIs,
            kpi_customization: state.kpi_customization,
            dashboard_layout: state.dashboard_layout
        });
    }
    
    /**
     * Customizează un KPI (label, color, icon, etc.)
     * @param {string} kpiId - ID-ul KPI-ului
     * @param {object} customization - Obiect cu proprietăți custom (label_ro, label_en, color, icon, etc.)
     */
    async function customizeKPI(kpiId, customization) {
        if (!kpiId) return { success: false, error: 'KPI ID is required' };
        
        const newCustomization = {
            ...state.kpi_customization,
            [kpiId]: {
                ...state.kpi_customization[kpiId],
                ...customization
            }
        };
        
        return await updateConfig({
            enabled_kpis: state.enabled_kpis,
            kpi_customization: newCustomization,
            dashboard_layout: state.dashboard_layout
        });
    }
    
    /**
     * Actualizează layout-ul dashboard-ului
     * @param {object} layout - Obiect cu proprietăți de layout (grid, order, etc.)
     */
    async function updateLayout(layout) {
        return await updateConfig({
            enabled_kpis: state.enabled_kpis,
            kpi_customization: state.kpi_customization,
            dashboard_layout: layout
        });
    }
    
    /**
     * Verifică dacă un KPI este activat
     * @param {string} kpiId - ID-ul KPI-ului
     */
    function isKPIEnabled(kpiId) {
        return state.enabled_kpis.includes(kpiId);
    }
    
    /**
     * Obține customization pentru un KPI
     * @param {string} kpiId - ID-ul KPI-ului
     */
    function getKPICustomization(kpiId) {
        return state.kpi_customization[kpiId] || {};
    }
    
    /**
     * Obține KPI-uri disponibile filtrate după categorie
     * @param {string} category - Categoria dorită
     */
    function getKPIsByCategory(category) {
        return state.available_kpis.filter(kpi => kpi.category === category);
    }
    
    return {
        enabled_kpis: state.enabled_kpis,
        kpi_customization: state.kpi_customization,
        dashboard_layout: state.dashboard_layout,
        available_kpis: state.available_kpis,
        categories: state.categories,
        loading: state.loading,
        error: state.error,
        updateConfig,
        enableKPI,
        disableKPI,
        customizeKPI,
        updateLayout,
        isKPIEnabled,
        getKPICustomization,
        getKPIsByCategory,
        refresh: fetchConfig
    };
}

export default useKPIConfig;

