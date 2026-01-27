/**
 * 🔌 TRANSLATION COMPATIBILITY LAYER
 * 
 * Acest modul creează un bridge între codul vechi (translations[key][lang])
 * și noul TranslationManager V3.0.0.
 * 
 * Permite migrarea treptată fără a modifica mii de linii de cod existent!
 * 
 * @version 1.0.0
 * @date 2025-10-21
 * 
 * USAGE:
 * 1. Include DUPĂ translation.js:
 *    <script src="/translation/translation.js"></script>
 *    <script src="/translation/translation-compat.js"></script>
 * 
 * 2. Codul vechi funcționează automat:
 *    translations["Preț"]["ro"]  // → funcționează!
 *    translations["Preț"]["en"]  // → funcționează!
 */

(function() {
    'use strict';
    
    console.log('[TranslationCompat] Initializing compatibility layer...');
    
    // Așteaptă ca TranslationManager să fie disponibil
    function waitForTM() {
        return new Promise((resolve) => {
            if (window.translationManager && window.translationManager.isInitialized) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.translationManager && window.translationManager.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);
            }
        });
    }
    
    // Creează un handler pentru Proxy
    const translationsHandler = {
        get(target, key) {
            // Returnează un obiect care simulează translations[key][lang]
            return new Proxy({}, {
                get(innerTarget, lang) {
                    // Găsește cheia în TM
                    // Format nou: categorii.cheie (ex: "ui.pret", "ingredients.rosii")
                    // Căutăm în toate categoriile
                    
                    if (!window.translationManager || !window.translationManager.translations[lang]) {
                        console.warn(`[TranslationCompat] TM not ready or lang ${lang} not loaded, returning key`);
                        return key;
                    }
                    
                    const translations = window.translationManager.translations[lang];
                    
                    // Caută în toate categoriile
                    // Prima încercare: caută direct cheia normalizată
                    const normalizedKey = key
                        .toLowerCase()
                        .replace(/[^\w\s]/g, '')
                        .replace(/\s+/g, '_')
                        .substring(0, 100);
                    
                    // Caută în toate categoriile
                    for (const [category, values] of Object.entries(translations)) {
                        if (category === '_cacheTimestamp') continue;
                        
                        // Verifică cheie exactă
                        if (values[normalizedKey]) {
                            return values[normalizedKey];
                        }
                        
                        // Verifică și variante
                        for (const [k, v] of Object.entries(values)) {
                            if (k === normalizedKey || k.includes(normalizedKey) || normalizedKey.includes(k)) {
                                return v;
                            }
                        }
                    }
                    
                    // Nu am găsit - returnează cheia originală
                    console.warn(`[TranslationCompat] Translation not found: ${key} (${normalizedKey}) in ${lang}`);
                    return key;
                },
                
                // Suport pentru Object.keys(), etc.
                ownKeys() {
                    return ['ro', 'en'];
                },
                
                getOwnPropertyDescriptor(target, prop) {
                    return {
                        enumerable: true,
                        configurable: true
                    };
                }
            });
        },
        
        // Suport pentru Object.keys(translations), etc.
        ownKeys(target) {
            // Returnează toate cheile din toate categoriile
            const allKeys = new Set();
            const lang = window.translationManager?.currentLanguage || 'ro';
            const translations = window.translationManager?.translations[lang];
            
            if (translations) {
                Object.values(translations).forEach(category => {
                    if (typeof category === 'object') {
                        Object.keys(category).forEach(key => allKeys.add(key));
                    }
                });
            }
            
            return Array.from(allKeys);
        },
        
        has(target, key) {
            // Simulează translations[key] !== undefined
            const lang = window.translationManager?.currentLanguage || 'ro';
            const translations = window.translationManager?.translations[lang];
            
            if (!translations) return false;
            
            const normalizedKey = key
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 100);
            
            for (const [category, values] of Object.entries(translations)) {
                if (category === '_cacheTimestamp') continue;
                if (values[normalizedKey]) return true;
            }
            
            return false;
        },
        
        getOwnPropertyDescriptor(target, prop) {
            return {
                enumerable: true,
                configurable: true
            };
        }
    };
    
    // Creează Proxy-ul global `translations` IMEDIAT (sincron)
    // Proxy-ul va funcționa imediat, chiar dacă TM nu e încă gata
    window.translations = new Proxy({}, translationsHandler);
    console.log('[TranslationCompat] ✅ Compatibility layer created!');
    
    // Așteaptă TM să fie gata pentru logging
    waitForTM().then(() => {
        console.log('[TranslationCompat] ✅ TranslationManager is ready!');
        console.log('[TranslationCompat] Old code like translations["Preț"]["ro"] will now work!');
    });
    
    // Export pentru debugging
    window.translationCompatLayer = {
        version: '1.0.0',
        status: () => {
            console.log('TranslationManager initialized:', window.translationManager?.isInitialized);
            console.log('Current language:', window.translationManager?.currentLanguage);
            console.log('Loaded languages:', Object.keys(window.translationManager?.translations || {}));
        }
    };
    
})();

