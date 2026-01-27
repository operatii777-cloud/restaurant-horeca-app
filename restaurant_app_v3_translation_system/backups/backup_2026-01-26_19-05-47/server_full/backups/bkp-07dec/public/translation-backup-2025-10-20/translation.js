/**
 * 🌐 Sistem de Traducere Modular pentru Restaurant App
 * 
 * Acest sistem permite încărcarea traducerilor din fișiere JSON separate,
 * în loc de hardcoding în HTML. Similar cu sistemul Flutter/Dart.
 * 
 * @version 1.0.0
 * @author Restaurant App Team
 * @date 2025-10-20
 */

class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'ro';
        this.translations = {};
        this.loadingPromises = {};
        this.isInitialized = false;
        
        // Configurare
        this.config = {
            fallbackLanguage: 'ro',
            supportedLanguages: ['ro', 'en'],
            translationPath: '/translation/',
            cacheTimeout: 5 * 60 * 1000, // 5 minute cache
            debug: false
        };
        
        this.log('TranslationManager initialized');
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
            
            // Validare structură
            if (!translations.meta || !translations.meta.language) {
                throw new Error('Invalid translation file structure');
            }
            
            return translations;
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
     * Obține o traducere pentru o cheie specifică
     * @param {string} key - Cheia de traducere (ex: "header.adminPanel")
     * @param {string} language - Limba dorită (opțional)
     * @returns {string} Textul tradus
     */
    async getTranslation(key, language = null) {
        const targetLanguage = language || this.currentLanguage;
        
        // Încarcă traducerile dacă nu sunt disponibile
        if (!this.translations[targetLanguage]) {
            await this.loadLanguage(targetLanguage);
        }
        
        const translations = this.translations[targetLanguage];
        if (!translations) {
            this.log(`No translations available for ${targetLanguage}`);
            return key; // Returnează cheia dacă nu găsește traducerea
        }
        
        // Navighează prin obiect folosind notația cu puncte
        const value = this._getNestedValue(translations, key);
        
        if (value === undefined) {
            this.log(`Translation key not found: ${key} in ${targetLanguage}`);
            
            // Încearcă fallback la limba default
            if (targetLanguage !== this.config.fallbackLanguage) {
                this.log(`Trying fallback to ${this.config.fallbackLanguage}`);
                return await this.getTranslation(key, this.config.fallbackLanguage);
            }
            
            return key; // Returnează cheia dacă nu găsește traducerea
        }
        
        return value;
    }

    /**
     * Obține o valoare din obiect folosind notația cu puncte
     * @private
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
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
        localStorage.setItem('language', language);
        
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
            this.log('Localization system initialized successfully');
            
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

window.getTranslation = async (key, language) => {
    return await window.translationManager.getTranslation(key, language);
};

// Auto-inițializare când DOM-ul este gata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.translationManager.initialize();
    });
} else {
    window.translationManager.initialize();
}

// Export pentru module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
}
