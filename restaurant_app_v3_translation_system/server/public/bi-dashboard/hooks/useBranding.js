// hooks/useBranding.js
// FAZA 2C - Săptămâna 5: React Hook pentru Branding

import { useState, useEffect } from 'react';

/**
 * Hook pentru gestionarea branding-ului tenant-ului
 * 
 * Returns:
 * {
 *   branding: {
 *     logo_url, primary_color, secondary_color, accent_color,
 *     font_family, theme
 *   },
 *   loading: boolean,
 *   error: string|null,
 *   applyBranding: function - aplică CSS variables automat
 * }
 * 
 * Usage:
 * ```jsx
 * const { branding, loading, applyBranding } = useBranding();
 * 
 * useEffect(() => {
 *   if (branding) {
 *     applyBranding();
 *   }
 * }, [branding]);
 * ```
 */
export function useBranding() {
    const [state, setState] = useState({
        branding: null,
        loading: true,
        error: null
    });
    
    useEffect(() => {
        fetchBranding();
    }, []);
    
    async function fetchBranding() {
        try {
            // Fetch branding from tenant
            const response = await fetch('/api/tenants/branding');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            setState({
                branding: data.branding,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error('[useBranding] Error fetching branding:', error);
            
            // Fallback: default branding
            setState({
                branding: {
                    logo_url: null,
                    primary_color: '#1976d2',
                    secondary_color: '#dc004e',
                    accent_color: '#ffa726',
                    background_color: '#f5f5f5',
                    text_color: '#333333',
                    font_family: 'Inter, system-ui, sans-serif',
                    theme: 'light'
                },
                loading: false,
                error: null // Nu afișăm eroarea, folosim fallback
            });
        }
    }
    
    /**
     * Aplică branding-ul ca CSS variables în :root
     */
    function applyBranding() {
        if (!state.branding) return;
        
        const root = document.documentElement;
        const { branding } = state;
        
        // Set CSS variables
        root.style.setProperty('--primary-color', branding.primary_color);
        root.style.setProperty('--secondary-color', branding.secondary_color);
        root.style.setProperty('--accent-color', branding.accent_color);
        root.style.setProperty('--background-color', branding.background_color);
        root.style.setProperty('--text-color', branding.text_color);
        root.style.setProperty('--font-family', branding.font_family);
        
        // Apply theme class
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${branding.theme || 'light'}`);
        
        console.log('[useBranding] Branding applied:', branding);
    }
    
    /**
     * Actualizează branding-ul (pentru Settings page)
     * @param {object} newBranding - Obiect cu noile valori de branding
     */
    async function updateBranding(newBranding) {
        try {
            const response = await fetch('/api/tenants/branding', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBranding)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            setState(prev => ({
                ...prev,
                branding: data.branding,
                error: null
            }));
            
            // Re-apply branding
            applyBranding();
            
            return { success: true };
            
        } catch (error) {
            console.error('[useBranding] Error updating branding:', error);
            return { success: false, error: error.message };
        }
    }
    
    return {
        branding: state.branding,
        loading: state.loading,
        error: state.error,
        applyBranding,
        updateBranding,
        refresh: fetchBranding
    };
}

/**
 * Hook pentru theme toggle (light/dark)
 */
export function useTheme() {
    const [theme, setThemeState] = useState(() => {
        // Check localStorage
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    });
    
    useEffect(() => {
        // Apply theme class
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    function toggleTheme() {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    }
    
    function setTheme(newTheme) {
        if (newTheme === 'light' || newTheme === 'dark') {
            setThemeState(newTheme);
        }
    }
    
    return {
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark'
    };
}

export default useBranding;

