/**
 * 🌐 Sistem de Traducere Modular pentru Restaurant App
 * 
 * Acest sistem permite încărcarea traducerilor din fișiere JSON separate,
 * în loc de hardcoding în HTML. Similar cu sistemul Flutter/Dart.
 * 
 * @version 2.0.0 (UPGRADED - V3.0.0 System)
 * @author Restaurant App Team
 * @date 2025-10-21
 * 
 * UPGRADE v2.0.0:
 * - ✅ Missing keys handler cu raportare automată la server
 * - ✅ Debounced reporting pentru performanță
 * - ✅ Compatibilitate cu JSON fără meta (format simplificat)
 * - ✅ Funcție scurtă t() pentru uz rapid
 * - ✅ Nested keys support îmbunătățit
 */

class TranslationManager {
    constructor() {
        // ✅ FIX: Verifică atât 'selectedLanguage' (pentru sincronizare cu comanda.html) cât și 'language'
        this.currentLanguage = localStorage.getItem('selectedLanguage') || localStorage.getItem('language') || 'ro';
        this.translations = {};
        this.loadingPromises = {};
        this.isInitialized = false;
        this.isReady = false; // ✅ FIX: Flag pentru Playwright tests
        
        // ✅ NOU: Tracking pentru missing keys
        this.missingKeys = new Set();
        this.reportedKeys = new Set();
        
        // Configurare
        this.config = {
            fallbackLanguage: 'ro',
            supportedLanguages: ['ro', 'en'],
            translationPath: '/translation/',
            cacheTimeout: 5 * 60 * 1000, // 5 minute cache
            debug: false,
            // ✅ NOU: Configurare missing keys
            reportMissingKeys: true,
            reportDebounceTime: 2000  // 2 secunde debounce
        };
        
        this.log('TranslationManager v2.0.0 initialized');
    }

    /**
     * Logging pentru debug
     */
    log(message, ...args) {
        if (this.config.debug) {
            console.log(`[TranslationManager] ${message}`, ...args);
        }
    }

    /**
     * Încarcă traducerile pentru o limbă specifică
     * @param {string} language - Codul limbii (ro, en, etc.)
     * @returns {Promise<Object>} Obiectul cu traducerile
     */
    async loadLanguage(language) {
        if (!this.config.supportedLanguages.includes(language)) {
            this.log(`Language ${language} not supported, falling back to ${this.config.fallbackLanguage}`);
            language = this.config.fallbackLanguage;
        }

        // Verifică cache
        if (this.translations[language] && this.isCacheValid(language)) {
            this.log(`Using cached translations for ${language}`);
            return this.translations[language];
        }

        // Verifică dacă există deja o încărcare în curs
        if (this.loadingPromises[language]) {
            this.log(`Waiting for existing load promise for ${language}`);
            return await this.loadingPromises[language];
        }

        // Începe încărcarea
        this.loadingPromises[language] = this._loadLanguageFile(language);
        
        try {
            const translations = await this.loadingPromises[language];
            this.translations[language] = translations;
            this.translations[language]._cacheTimestamp = Date.now();
            this.log(`Successfully loaded translations for ${language}`);
            return translations;
        } catch (error) {
            this.log(`Error loading ${language}:`, error);
            delete this.loadingPromises[language];
            
            // Fallback la limba default
            if (language !== this.config.fallbackLanguage) {
                this.log(`Falling back to ${this.config.fallbackLanguage}`);
                return await this.loadLanguage(this.config.fallbackLanguage);
            }
            throw error;
        } finally {
            delete this.loadingPromises[language];
        }
    }

    /**
     * Încarcă fișierul JSON pentru o limbă
     * @private
     */
    async _loadLanguageFile(language) {
        const url = `${this.config.translationPath}${language}.json`;
        this.log(`Loading translation file: ${url}`);
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const translations = await response.json();
            
            // ✅ MODIFICAT: Suport pentru JSON cu sau fără meta
            // Formatul vechi avea meta.language, formatul nou e direct categorii
            if (translations.meta && translations.meta.language) {
                // Format vechi - folosește așa cum e
                this.log(`Loaded old format with meta for ${language}`);
                return translations;
            } else if (typeof translations === 'object' && Object.keys(translations).length > 0) {
                // ✅ Format nou (V3.0.0) - categorii direct (ui, ingredients, etc.)
                this.log(`Loaded new V3.0.0 format for ${language}`);
                return translations;
            } else {
                throw new Error('Invalid translation file structure');
            }
        } catch (error) {
            this.log(`Failed to load ${url}:`, error);
            throw error;
        }
    }

    /**
     * Verifică dacă cache-ul este valid
     * @private
     */
    isCacheValid(language) {
        if (!this.translations[language] || !this.translations[language]._cacheTimestamp) {
            return false;
        }
        
        const age = Date.now() - this.translations[language]._cacheTimestamp;
        return age < this.config.cacheTimeout;
    }

    /**
     * ✅ ÎMBUNĂTĂȚIT: Obține o traducere pentru o cheie specifică
     * @param {string} key - Cheia de traducere (ex: "ui.produs" sau "ingredients.rosii_cherry")
     * @param {Object} params - Parametri opționali (fallback, language, etc.)
     * @returns {string} Textul tradus
     */
    async getTranslation(key, params = {}) {
        const targetLanguage = params.language || this.currentLanguage;
        
        // Încarcă traducerile dacă nu sunt disponibile
        if (!this.translations[targetLanguage]) {
            await this.loadLanguage(targetLanguage);
        }
        
        const translations = this.translations[targetLanguage];
        if (!translations) {
            this.log(`No translations available for ${targetLanguage}`);
            this._reportMissingKey(key, params.fallback);
            return params.fallback || key;
        }
        
        // Navighează prin obiect folosind notația cu puncte
        const value = this._getNestedValue(translations, key);
        
        if (value === undefined || value === null) {
            this.log(`Translation key not found: ${key} in ${targetLanguage}`);
            
            // Încearcă fallback la limba default
            if (targetLanguage !== this.config.fallbackLanguage) {
                this.log(`Trying fallback to ${this.config.fallbackLanguage}`);
                return await this.getTranslation(key, { 
                    ...params, 
                    language: this.config.fallbackLanguage 
                });
            }
            
            // ✅ Raportează missing key
            this._reportMissingKey(key, params.fallback);
            
            // Returnează fallback sau cheia
            return params.fallback || key;
        }
        
        // ✅ Suport pentru interpolation (ex: "Hello {name}")
        if (params.replace && typeof value === 'string') {
            return this._interpolate(value, params.replace);
        }
        
        return value;
    }
    
    /**
     * ✅ NOU: Funcție scurtă pentru traducere (alias pentru getTranslation)
     * Usage: tm.t('ui.produs') sau tm.t('ui.hello', { replace: { name: 'John' } })
     * @param {string} key - Cheia de traducere
     * @param {Object} params - Parametri opționali
     * @returns {Promise<string>} Textul tradus
     */
    async t(key, params = {}) {
        return await this.getTranslation(key, params);
    }
    
    /**
     * ✅ NOU: Interpolation pentru parametri dinamici
     * @private
     */
    _interpolate(text, replacements) {
        let result = text;
        
        Object.keys(replacements).forEach(key => {
            const placeholder = `{${key}}`;
            result = result.replace(new RegExp(placeholder, 'g'), replacements[key]);
        });
        
        return result;
    }

    /**
     * ✅ ÎMBUNĂTĂȚIT: Obține o valoare din obiect folosind notația cu puncte
     * Suportă atât format vechi (cu meta) cât și format nou (categorii directe)
     * @private
     */
    _getNestedValue(obj, path) {
        // Skip meta dacă există (format vechi)
        let startObj = obj;
        if (obj.meta && obj.translations) {
            startObj = obj.translations;
        }
        
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, startObj);
    }
    
    /**
     * ✅ NOU: Raportează o cheie lipsă
     * @private
     */
    _reportMissingKey(key, originalTerm = null) {
        if (!this.config.reportMissingKeys) {
            return;
        }
        
        // Evită raportări duplicate
        if (this.reportedKeys.has(key)) {
            return;
        }
        
        this.missingKeys.add(key);
        
        if (this.config.debug) {
            console.warn(`[TranslationManager] Missing key: ${key}${originalTerm ? ` (${originalTerm})` : ''}`);
        }
        
        // Raportare debounced la server
        this._debouncedReportToServer();
    }
    
    /**
     * ✅ NOU: Raportare debounced la server pentru missing keys
     * @private
     */
    _debouncedReportToServer() {
        // Clear timeout existent
        if (this._reportTimeout) {
            clearTimeout(this._reportTimeout);
        }
        
        // Set nou timeout
        this._reportTimeout = setTimeout(() => {
            this._reportMissingKeysToServer();
        }, this.config.reportDebounceTime);
    }
    
    /**
     * ✅ NOU: Trimite missing keys la server
     * @private
     */
    async _reportMissingKeysToServer() {
        const keysToReport = Array.from(this.missingKeys).filter(key => !this.reportedKeys.has(key));
        
        if (keysToReport.length === 0) {
            return;
        }
        
        this.log(`Reporting ${keysToReport.length} missing keys to server`);
        
        try {
            const response = await fetch('/api/missing-translations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keys: keysToReport,
                    language: this.currentLanguage,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                // Marchează ca raportate
                keysToReport.forEach(key => this.reportedKeys.add(key));
                this.log(`Successfully reported ${keysToReport.length} missing keys`);
            } else {
                this.log(`Failed to report missing keys: HTTP ${response.status}`);
            }
        } catch (error) {
            // Fail silently - nu vrem să blocăm aplicația pentru raportare
            this.log('Error reporting missing keys:', error);
        }
    }

    /**
     * Schimbă limba curentă și aplică traducerile
     * @param {string} language - Noua limbă
     */
    async changeLanguage(language) {
        if (!this.config.supportedLanguages.includes(language)) {
            this.log(`Language ${language} not supported`);
            return;
        }
        
        this.log(`Changing language from ${this.currentLanguage} to ${language}`);
        this.currentLanguage = language;
        // ✅ FIX: Salvează în ambele chei pentru sincronizare
        localStorage.setItem('language', language);
        localStorage.setItem('selectedLanguage', language);
        
        // Încarcă traducerile pentru noua limbă
        await this.loadLanguage(language);
        
        // Aplică traducerile în interfață
        await this.applyTranslations();
        
        // Trigger event pentru alte componente
        this._triggerLanguageChangeEvent(language);
    }

    /**
     * Aplică traducerile în interfața utilizator
     */
    async applyTranslations() {
        this.log('Applying translations to UI');
        
        // Aplică traducerile la elementele cu data-translate
        const elements = document.querySelectorAll('[data-translate]');
        
        for (const element of elements) {
            const key = element.getAttribute('data-translate');
            const translation = await this.getTranslation(key);
            
            if (translation !== key) {
                element.textContent = translation;
            }
        }
        
        // Aplică traducerile pentru placeholders
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        
        for (const element of placeholderElements) {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = await this.getTranslation(key);
            
            if (translation !== key) {
                element.placeholder = translation;
            }
        }
        
        // Aplică traducerile pentru title attributes
        const titleElements = document.querySelectorAll('[data-translate-title]');
        
        for (const element of titleElements) {
            const key = element.getAttribute('data-translate-title');
            const translation = await this.getTranslation(key);
            
            if (translation !== key) {
                element.setAttribute('title', translation);
            }
        }
        
        // Aplică traducerile pentru alt attributes
        const altElements = document.querySelectorAll('[data-translate-alt]');
        
        for (const element of altElements) {
            const key = element.getAttribute('data-translate-alt');
            const translation = await this.getTranslation(key);
            
            if (translation !== key) {
                element.setAttribute('alt', translation);
            }
        }
        
        this.log(`Applied translations to ${elements.length} elements`);
    }

    /**
     * Trigger event pentru schimbarea limbii
     * @private
     */
    _triggerLanguageChangeEvent(language) {
        const event = new CustomEvent('languageChanged', {
            detail: { language: language }
        });
        document.dispatchEvent(event);
    }

    /**
     * Inițializează sistemul de localizare
     */
    async initialize() {
        if (this.isInitialized) {
            this.log('Already initialized');
            return;
        }
        
        this.log('Initializing localization system');
        
        try {
            // Încarcă limba curentă
            await this.loadLanguage(this.currentLanguage);
            
            // Aplică traducerile inițiale
            await this.applyTranslations();
            
            // Setează observer pentru conținut dinamic
            this._setupDynamicContentObserver();
            
            this.isInitialized = true;
            this.isReady = true; // ✅ FIX: Setează flag pentru Playwright tests
            this.log('Localization system initialized successfully');
            
            // ✅ Emit event pentru a notifica că TranslationManager e ready
            const readyEvent = new CustomEvent('translationManagerReady', {
                detail: { language: this.currentLanguage }
            });
            document.dispatchEvent(readyEvent);
            console.log('[TranslationManager] 🚀 Ready event dispatched');
            
        } catch (error) {
            this.log('Failed to initialize localization system:', error);
            throw error;
        }
    }

    /**
     * Configurează observer pentru conținut dinamic
     * @private
     */
    _setupDynamicContentObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldTranslate = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    // Verifică dacă au fost adăugate elemente cu data-translate
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.hasAttribute && node.hasAttribute('data-translate')) {
                                shouldTranslate = true;
                            } else if (node.querySelector && node.querySelector('[data-translate]')) {
                                shouldTranslate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldTranslate) {
                this.log('Dynamic content detected, applying translations');
                // Delay scurt pentru a permite completarea conținutului
                setTimeout(() => this.applyTranslations(), 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.log('Dynamic content observer setup complete');
    }

    /**
     * Obține limba curentă
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Obține limbile suportate
     */
    getSupportedLanguages() {
        return [...this.config.supportedLanguages];
    }

    /**
     * Verifică dacă o limbă este suportată
     */
    isLanguageSupported(language) {
        return this.config.supportedLanguages.includes(language);
    }

    /**
     * Șterge cache-ul pentru o limbă specifică
     */
    clearCache(language = null) {
        if (language) {
            delete this.translations[language];
            this.log(`Cache cleared for ${language}`);
        } else {
            this.translations = {};
            this.log('All cache cleared');
        }
    }

    /**
     * Configurează opțiuni
     */
    configure(options) {
        this.config = { ...this.config, ...options };
        this.log('Configuration updated:', this.config);
    }

    /**
     * Activează/dezactivează debug mode
     */
    setDebugMode(enabled) {
        this.config.debug = enabled;
        this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Creează instanța globală
window.translationManager = new TranslationManager();

// Funcții helper pentru compatibilitate cu codul existent
window.changeLanguage = async (language) => {
    await window.translationManager.changeLanguage(language);
};

window.getTranslation = async (key, params) => {
    return await window.translationManager.getTranslation(key, params);
};

// ✅ NOU: Shorthand pentru traducere rapidă
window.t = async (key, params) => {
    return await window.translationManager.t(key, params);
};

// ✅ NOU: Versiune sincronă pentru cazuri simple (folosește cache)
window.tSync = (key, fallback = null) => {
    const lang = window.translationManager.currentLanguage;
    const translations = window.translationManager.translations[lang];
    
    if (!translations) {
        return fallback || key;
    }
    
    const value = window.translationManager._getNestedValue(translations, key);
    return value !== undefined ? value : (fallback || key);
};

// Auto-inițializare când DOM-ul este gata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.translationManager.initialize();
        // Inject QrOMS branding badge after initialization
        try { if (typeof injectQrOmsBadge === 'function') injectQrOmsBadge(); } catch (_) {}
    });
} else {
    window.translationManager.initialize();
    // Inject QrOMS branding badge immediately if DOM is ready
    try { if (typeof injectQrOmsBadge === 'function') injectQrOmsBadge(); } catch (_) {}
}

// Export pentru module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
}

// =============================
// Global QrOMS branding badge
// =============================
function injectQrOmsBadge() {
    try {
        if (!document.body) return;
        if (document.getElementById('qroms-badge')) return; // avoid duplicates

        const badge = document.createElement('a');
        badge.id = 'qroms-badge';
        badge.href = 'https://qroms.app';
        badge.target = '_blank';
        badge.rel = 'noopener';
        badge.setAttribute('aria-label', 'Powered by QrOMS');
        badge.style.cssText = [
            'position:fixed',
            'top:10px',
            'right:12px',
            'display:flex',
            'align-items:center',
            'gap:8px',
            'background:rgba(255,255,255,0.9)',
            'backdrop-filter:blur(4px)',
            'border:1px solid rgba(0,0,0,0.08)',
            'border-radius:999px',
            'padding:6px 10px',
            'z-index:2147483647',
            'box-shadow:0 2px 8px rgba(0,0,0,0.12)',
            'color:#333',
            'text-decoration:none',
            'font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif',
            'font-size:12px',
            'line-height:1'
        ].join(';');

        const img = document.createElement('img');
        img.src = '/QrOMS.jpg';
        img.alt = 'QrOMS';
        img.style.cssText = 'width:18px;height:18px;object-fit:cover;border-radius:4px;';

        const label = document.createElement('span');
        label.textContent = 'Powered by QrOMS';

        badge.appendChild(img);
        badge.appendChild(label);
        document.body.appendChild(badge);
    } catch (e) {
        // fail silently
    }
}
