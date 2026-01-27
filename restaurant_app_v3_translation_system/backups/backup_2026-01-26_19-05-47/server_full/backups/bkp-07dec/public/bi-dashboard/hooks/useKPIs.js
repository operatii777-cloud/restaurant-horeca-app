// hooks/useKPIs.js
// FAZA 2C - Săptămâna 5: React Hook pentru KPIs

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pentru gestionarea KPI-urilor
 * 
 * Options:
 * - period: 'today' | 'week' | 'month' | 'quarter' | 'year'
 * - kpis: array of KPI IDs to fetch (optional, fetches all if not specified)
 * - autoRefresh: boolean (default: false)
 * - refreshInterval: number in ms (default: 60000 - 1 minute)
 * 
 * Returns:
 * {
 *   metrics: array of KPI objects,
 *   categorized: object grouped by category,
 *   summary: { total, successful, failed },
 *   period: { start, end, type },
 *   loading: boolean,
 *   error: string|null,
 *   refresh: function
 * }
 * 
 * Usage:
 * ```jsx
 * const { metrics, loading, error, refresh } = useKPIs({
 *   period: 'month',
 *   kpis: ['gross_revenue', 'net_profit'],
 *   autoRefresh: true
 * });
 * ```
 */
export function useKPIs(options = {}) {
    const {
        period = 'month',
        kpis = null,
        autoRefresh = false,
        refreshInterval = 60000
    } = options;
    
    const [state, setState] = useState({
        metrics: [],
        categorized: {},
        summary: { total: 0, successful: 0, failed: 0 },
        period: null,
        loading: true,
        error: null
    });
    
    const fetchKPIs = useCallback(async () => {
        try {
            // Build URL with query params
            const params = new URLSearchParams();
            if (kpis && Array.isArray(kpis)) {
                params.append('kpis', kpis.join(','));
            }
            
            const response = await fetch(`/api/bi/dashboard?period=${period}&${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch KPIs');
            }
            
            setState({
                metrics: data.data.metrics,
                categorized: data.data.categorized,
                summary: data.data.summary,
                period: data.data.period,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error('[useKPIs] Error fetching KPIs:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, [period, kpis]);
    
    useEffect(() => {
        fetchKPIs();
    }, [fetchKPIs]);
    
    // Auto-refresh
    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            const intervalId = setInterval(fetchKPIs, refreshInterval);
            return () => clearInterval(intervalId);
        }
    }, [autoRefresh, refreshInterval, fetchKPIs]);
    
    return {
        metrics: state.metrics,
        categorized: state.categorized,
        summary: state.summary,
        period: state.period,
        loading: state.loading,
        error: state.error,
        refresh: fetchKPIs
    };
}

/**
 * Hook pentru un singur KPI cu istoric
 * 
 * @param {string} kpiId - ID-ul KPI-ului
 * @param {object} options - Opțiuni (days: number)
 */
export function useKPI(kpiId, options = {}) {
    const { days = 30 } = options;
    
    const [state, setState] = useState({
        kpi: null,
        definition: null,
        currentValue: null,
        formatted: null,
        history: [],
        loading: true,
        error: null
    });
    
    const fetchKPI = useCallback(async () => {
        if (!kpiId) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'KPI ID is required'
            }));
            return;
        }
        
        try {
            const response = await fetch(`/api/bi/kpis/${kpiId}?days=${days}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`KPI '${kpiId}' not found`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch KPI');
            }
            
            setState({
                kpi: data.data.kpi,
                definition: data.data.definition,
                currentValue: data.data.current_value,
                formatted: data.data.formatted,
                history: data.data.history,
                period: data.data.period,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error(`[useKPI] Error fetching KPI ${kpiId}:`, error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, [kpiId, days]);
    
    useEffect(() => {
        fetchKPI();
    }, [fetchKPI]);
    
    return {
        kpi: state.kpi,
        definition: state.definition,
        currentValue: state.currentValue,
        formatted: state.formatted,
        history: state.history,
        period: state.period,
        loading: state.loading,
        error: state.error,
        refresh: fetchKPI
    };
}

/**
 * Hook pentru trends (multiple KPIs pe timeline)
 * 
 * @param {array} kpiIds - Array cu ID-urile KPI-urilor
 * @param {object} options - Opțiuni (days: number)
 */
export function useKPITrends(kpiIds, options = {}) {
    const { days = 30 } = options;
    
    const [state, setState] = useState({
        trends: [],
        period: null,
        loading: true,
        error: null
    });
    
    const fetchTrends = useCallback(async () => {
        if (!kpiIds || kpiIds.length === 0) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'At least one KPI ID is required'
            }));
            return;
        }
        
        try {
            const params = new URLSearchParams({
                kpis: kpiIds.join(','),
                days: days
            });
            
            const response = await fetch(`/api/bi/trends?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch trends');
            }
            
            setState({
                trends: data.data.trends,
                period: data.data.period,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error('[useKPITrends] Error fetching trends:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, [kpiIds, days]);
    
    useEffect(() => {
        fetchTrends();
    }, [fetchTrends]);
    
    return {
        trends: state.trends,
        period: state.period,
        loading: state.loading,
        error: state.error,
        refresh: fetchTrends
    };
}

export default useKPIs;

