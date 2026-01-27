/**
 * Sistem simplu de traduceri
 * Auto-generat de fix-i18n-complete.js
 */

import translations from '../i18n/ro.json';

/**
 * Traduce o cheie
 * @param key - Cheia de traducere
 * @param fallback - Text implicit dacă cheia nu există
 * @returns Traducerea sau fallback
 */
export function translate(key: string, fallback?: string): string {
  return translations[key as keyof typeof translations] || fallback || key;
}

// Alias scurt
export const t = translate;

// Export traduceri pentru utilizări speciale
export { translations };
