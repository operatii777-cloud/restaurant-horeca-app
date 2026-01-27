// components/ThemeToggle.jsx
// FAZA 2C - Săptămâna 6: Theme Toggle Component

import React from 'react';
import { useTheme } from '../hooks';
import './ThemeToggle.css';

/**
 * Theme Toggle Component - Buton pentru schimbarea temei (light/dark)
 * 
 * Props:
 * - position: 'header' | 'floating' (default: 'header')
 * - showLabel: boolean (default: false)
 * 
 * Usage:
 * ```jsx
 * <ThemeToggle position="header" showLabel={true} />
 * ```
 */
export function ThemeToggle({ position = 'header', showLabel = false }) {
    const { theme, toggleTheme, isDark } = useTheme();
    
    return (
        <button
            className={`theme-toggle theme-toggle--${position}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <span className="theme-toggle__icon">
                {isDark ? '☀️' : '🌙'}
            </span>
            {showLabel && (
                <span className="theme-toggle__label">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
            )}
        </button>
    );
}

export default ThemeToggle;

