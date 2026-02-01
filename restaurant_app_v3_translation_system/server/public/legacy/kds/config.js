// public/config.js
const SERVER_IP = window.location.origin;

// ========== WHITE-LABEL DYNAMIC CONFIGURATION ==========
// Configuration loaded from API (branding.json + restaurant.json)
// Updated: 28 October 2025

let BRAND_CONFIG = {
    // Defaults (overwritten by API)
    restaurantName: 'Trattoria',
    brandName: 'Trattoria Restaurant',
    appName: 'Restaurant Management System',
    shortName: 'TRATTORIA',
    tagline: 'Gustul autentic al Italiei',
    version: '1.0.0',

    phone: '+40 123 456 789',
    email: 'contact@trattoria.ro',
    address: 'Str. Exemplu nr. 10, București',

    facebook: 'https://facebook.com/trattoria',
    instagram: 'https://instagram.com/trattoria',

    primaryColor: '#8B4513',
    secondaryColor: '#DAA520',
    accentColor: '#CD853F',

    features: {
        delivery: true,
        takeaway: true,
        reservations: true,
        loyalty: true,
        analytics: true
    }
};

// Global configuration object (loaded from API)
let APP_CONFIG = {
    branding: {},
    restaurant: {},
    loaded: false
};

/**
 * Load white-label configuration from API
 * Called automatically on page load
 */
async function loadWhiteLabelConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            console.warn('⚠️  Failed to load white-label config, using defaults');
            return;
        }

        const result = await response.json();
        if (result.success && result.data) {
            APP_CONFIG.branding = result.data.branding;
            APP_CONFIG.restaurant = result.data.restaurant;
            APP_CONFIG.loaded = true;

            // Update BRAND_CONFIG for backward compatibility
            if (APP_CONFIG.branding) {
                BRAND_CONFIG.restaurantName = APP_CONFIG.branding.restaurant_name || BRAND_CONFIG.restaurantName;
                BRAND_CONFIG.brandName = APP_CONFIG.branding.brand_name || BRAND_CONFIG.brandName;
                BRAND_CONFIG.appName = APP_CONFIG.branding.app_name || BRAND_CONFIG.appName;
                BRAND_CONFIG.shortName = APP_CONFIG.branding.short_name || BRAND_CONFIG.shortName;
                BRAND_CONFIG.tagline = APP_CONFIG.branding.tagline || BRAND_CONFIG.tagline;
                BRAND_CONFIG.version = APP_CONFIG.branding.version || BRAND_CONFIG.version;

                if (APP_CONFIG.branding.contact) {
                    BRAND_CONFIG.phone = APP_CONFIG.branding.contact.phone || BRAND_CONFIG.phone;
                    BRAND_CONFIG.email = APP_CONFIG.branding.contact.email || BRAND_CONFIG.email;
                    BRAND_CONFIG.address = APP_CONFIG.branding.contact.address?.street || BRAND_CONFIG.address;
                }

                if (APP_CONFIG.branding.social) {
                    BRAND_CONFIG.facebook = APP_CONFIG.branding.social.facebook || BRAND_CONFIG.facebook;
                    BRAND_CONFIG.instagram = APP_CONFIG.branding.social.instagram || BRAND_CONFIG.instagram;
                }

                if (APP_CONFIG.branding.colors) {
                    BRAND_CONFIG.primaryColor = APP_CONFIG.branding.colors.primary || BRAND_CONFIG.primaryColor;
                    BRAND_CONFIG.secondaryColor = APP_CONFIG.branding.colors.secondary || BRAND_CONFIG.secondaryColor;
                    BRAND_CONFIG.accentColor = APP_CONFIG.branding.colors.accent || BRAND_CONFIG.accentColor;
                }
            }

            if (APP_CONFIG.restaurant && APP_CONFIG.restaurant.features) {
                BRAND_CONFIG.features = APP_CONFIG.restaurant.features;
            }

            // Apply CSS variables
            applyBrandingCSS();

            console.log('✅ White-label configuration loaded');
        }
    } catch (error) {
        console.error('❌ Error loading white-label config:', error);
    }
}

/**
 * Apply branding CSS variables to document
 */
function applyBrandingCSS() {
    if (!APP_CONFIG.branding || !APP_CONFIG.branding.colors) return;

    const root = document.documentElement;
    const colors = APP_CONFIG.branding.colors;
    const fonts = APP_CONFIG.branding.fonts || {};

    // Apply colors
    if (colors.primary) root.style.setProperty('--primary-color', colors.primary);
    if (colors.secondary) root.style.setProperty('--secondary-color', colors.secondary);
    if (colors.accent) root.style.setProperty('--accent-color', colors.accent);
    if (colors.success) root.style.setProperty('--success-color', colors.success);
    if (colors.warning) root.style.setProperty('--warning-color', colors.warning);
    if (colors.danger) root.style.setProperty('--danger-color', colors.danger);
    if (colors.info) root.style.setProperty('--info-color', colors.info);
    if (colors.light) root.style.setProperty('--light-color', colors.light);
    if (colors.dark) root.style.setProperty('--dark-color', colors.dark);
    if (colors.background) root.style.setProperty('--background-color', colors.background);
    if (colors.text) root.style.setProperty('--text-color', colors.text);

    // Apply fonts
    if (fonts.primary) root.style.setProperty('--font-primary', fonts.primary);
    if (fonts.secondary) root.style.setProperty('--font-secondary', fonts.secondary);
    if (fonts.heading) root.style.setProperty('--font-heading', fonts.heading);
    if (fonts.base_size) root.style.setProperty('--font-size-base', fonts.base_size);

    // Apply theme
    if (APP_CONFIG.branding.theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${APP_CONFIG.branding.theme}`);
    }

    console.log('✅ Branding CSS variables applied');
}

// Load config on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWhiteLabelConfig);
} else {
    loadWhiteLabelConfig();
}

// Debug Configuration
const DEBUG_CONFIG = {
    environment: 'development', // 'development' | 'production'
    debug: true, // activează debug logging
    verboseLogging: false, // logging detaliat
    enableConsoleWrapper: true, // folosește console wrapper
    enableLogger: true, // folosește logger profesional
    logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
    storage: false, // salvează logs în localStorage
    maxLogs: 1000
};

// Contact Information (Extended)
const CONTACT_INFO = {
    phones: ['+40 123 456 789', '+40 987 654 321'],
    emails: ['contact@trattoria.ro', 'orders@trattoria.ro'],
    address: {
        street: 'Str. Exemplu nr. 10',
        city: 'București',
        county: 'București',
        postalCode: '010000',
        country: 'România'
    },
    workingHours: {
        monday: '10:00 - 22:00',
        tuesday: '10:00 - 22:00',
        wednesday: '10:00 - 22:00',
        thursday: '10:00 - 22:00',
        friday: '10:00 - 23:00',
        saturday: '10:00 - 23:00',
        sunday: '12:00 - 21:00'
    }
};

// Theme Configuration (Extended)
const THEME_CONFIG = {
    colors: {
        primary: '#8B4513',      // Culoarea principală
        secondary: '#DAA520',   // Culoarea secundară
        accent: '#CD853F',      // Accent
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40'
    },
    fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif',
        heading: 'Arial, sans-serif'
    }
};

// Assets Configuration
const ASSETS_CONFIG = {
    logo: {
        main: '/assets/logo/logo.png',
        white: '/assets/logo/logo-white.png',
        icon: '/assets/logo/icon.png',
        favicon: '/assets/logo/favicon.ico'
    },
    images: {
        placeholder: '/assets/images/placeholder.jpg',
        background: '/assets/images/bg.jpg'
    }
};

// Language Configuration
const LANGUAGE_CONFIG = {
    default: 'ro',
    supported: ['ro', 'en'],
    translations: {
        ro: {
            welcome: 'Bine ați venit',
            menu: 'Meniu',
            orders: 'Comenzi',
            settings: 'Setări'
        },
        en: {
            welcome: 'Welcome',
            menu: 'Menu',
            orders: 'Orders',
            settings: 'Settings'
        }
    }
};
