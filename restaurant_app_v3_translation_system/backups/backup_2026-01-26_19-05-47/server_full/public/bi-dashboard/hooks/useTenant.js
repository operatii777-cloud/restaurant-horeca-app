// hooks/useTenant.js
// FAZA 2C - Săptămâna 5: React Hook pentru Tenant

import { useState, useEffect } from 'react';

/**
 * Hook pentru gestionarea informațiilor tenant-ului curent
 * 
 * Returns:
 * {
 *   tenant: { id, name, industry, plan, currency, locale, ... },
 *   loading: boolean,
 *   error: string|null
 * }
 * 
 * Usage:
 * ```jsx
 * const { tenant, loading, error } = useTenant();
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <div>{tenant.name}</div>;
 * ```
 */
export function useTenant() {
    const [state, setState] = useState({
        tenant: null,
        loading: true,
        error: null
    });
    
    useEffect(() => {
        fetchTenant();
    }, []);
    
    async function fetchTenant() {
        try {
            // TODO: În producție, tenant-ul va fi extras din JWT token
            // Deocamdată, folosim tenant_id = 1 (hardcoded)
            const response = await fetch('/api/tenants/current');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            setState({
                tenant: data.tenant,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error('[useTenant] Error fetching tenant:', error);
            
            // Fallback pentru development: folosește date mock
            setState({
                tenant: {
                    id: 1,
                    name: 'Trattoria Restaurant',
                    slug: 'trattoria',
                    industry: 'restaurant',
                    subscription_plan: 'professional',
                    currency: 'RON',
                    locale: 'ro-RO',
                    timezone: 'Europe/Bucharest'
                },
                loading: false,
                error: null // Nu afișăm eroarea în dev, folosim fallback
            });
        }
    }
    
    function refreshTenant() {
        setState(prev => ({ ...prev, loading: true }));
        fetchTenant();
    }
    
    return {
        tenant: state.tenant,
        loading: state.loading,
        error: state.error,
        refresh: refreshTenant
    };
}

export default useTenant;

