/**
 * TRANSLATION AUTO-APPLY - Aplicare automată traduceri pentru TOATE interfețele
 * 
 * Procesează automat elementele cu data-translate când limba se schimbă
 * Funcționează cu TranslationManager sau sistem de traduceri local
 */

(function() {
    'use strict';
    
    console.log('🌍 [TranslationAutoApply] Initialization...');
    
    // Helper: Obține traducere din sistem
    function getTranslation(key) {
        // Metodă 1: window.t() (TranslationManager)
        if (typeof window.t === 'function') {
            const translation = window.t(key);
            if (translation && translation !== key) {
                return translation;
            }
        }
        
        // Metodă 2: window.translations (sistem local)
        const lang = localStorage.getItem('selectedLanguage') || 'ro';
        if (window.translations && window.translations[lang]) {
            // Caută în toate secțiunile
            const sections = window.translations[lang];
            for (const section in sections) {
                if (typeof sections[section] === 'object') {
                    const keyPart = key.includes('.') ? key.split('.')[1] : key;
                    if (sections[section][keyPart]) {
                        return sections[section][keyPart];
                    }
                }
            }
        }
        
        // Metodă 3: window.translationManager
        if (window.translationManager && window.translationManager.initialized) {
            const translation = window.translationManager.t(key);
            if (translation && translation !== key) {
                return translation;
            }
        }
        
        return null;
    }
    
    // Funcție principală: Aplică traduceri pentru toate elementele cu data-translate
    function applyAllDataTranslate() {
        const lang = localStorage.getItem('selectedLanguage') || 'ro';
        let count = 0;
        
        // 1. Procesează data-translate (textContent)
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key) {
                const translation = getTranslation(key);
                if (translation) {
                    // Păstrează elementele copil (ex: iconițe, span-uri)
                    const hasChildElements = element.querySelector('*');
                    if (!hasChildElements) {
                        element.textContent = translation;
                    } else {
                        // Înlocuiește doar text nodes, păstrează elementele
                        const textNodes = Array.from(element.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                        if (textNodes.length > 0) {
                            textNodes[0].textContent = translation;
                        }
                    }
                    count++;
                }
            }
        });
        
        // 2. Procesează data-translate-placeholder (placeholder attribute)
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (key) {
                const translation = getTranslation(key);
                if (translation) {
                    element.setAttribute('placeholder', translation);
                    count++;
                }
            }
        });
        
        // 3. Procesează data-translate-title (title attribute)
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.getAttribute('data-translate-title');
            if (key) {
                const translation = getTranslation(key);
                if (translation) {
                    element.setAttribute('title', translation);
                    count++;
                }
            }
        });
        
        if (count > 0) {
            console.log(`✅ [TranslationAutoApply] Applied ${count} translations for language: ${lang}`);
        }
    }
    
    // Monitorizare schimbări în localStorage (limba)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        const oldValue = localStorage.getItem(key);
        originalSetItem.apply(this, arguments);
        
        // Dacă limba s-a schimbat, re-aplică traducerile
        if ((key === 'selectedLanguage' || key === 'language') && oldValue !== value) {
            console.log(`🌍 [TranslationAutoApply] Language changed to: ${value}`);
            setTimeout(() => applyAllDataTranslate(), 200);
        }
    };
    
    // Aplicare inițială
    function initialize() {
        // Așteaptă ca TranslationManager sau translations să fie disponibile
        if (!window.t && !window.translations && !window.translationManager) {
            setTimeout(initialize, 100);
            return;
        }
        
        console.log('✅ [TranslationAutoApply] Initialized');
        applyAllDataTranslate();
        
        // Re-aplică când DOM se modifică (pentru conținut dinamic) - DEBOUNCED
        let observerTimeout = null;
        const observer = new MutationObserver(() => {
            clearTimeout(observerTimeout);
            observerTimeout = setTimeout(() => {
                applyAllDataTranslate();
            }, 1000); // Debounce 1s pentru a preveni loop infinit
        });
        
        // ⚠️ DEZACTIVAT temporar - cauzează loop infinit în unele interfețe
        // observer.observe(document.body, {
        //     childList: true,
        //     subtree: true
        // });
    }
    
    // Start când DOM e gata
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Export pentru debugging
    window.TranslationAutoApply = {
        apply: applyAllDataTranslate,
        getTranslation: getTranslation
    };
    
})();

