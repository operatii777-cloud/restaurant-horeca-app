// Frontend Application Configuration
// This file contains default configuration values for the admin-vite application
// Values can be overridden via environment variables in production

export const config = {
  // API Configuration
  api: {
    // Base URL for API requests
    // In development, Vite proxy handles this
    // In production, uses same origin
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    
    // Timeout for API requests (ms)
    timeout: 30000,
  },

  // Application Configuration
  app: {
    // Application name
    name: 'Restaurant Admin',
    
    // Version
    version: '3.0.0',
    
    // Base path for routing
    // Automatically detected from window.location in main.tsx
    basePath: '/admin-vite',
    
    // Default locale
    defaultLocale: 'ro',
    
    // Available locales
    locales: ['ro', 'en'],
  },

  // Theme Configuration
  theme: {
    // Default theme
    default: 'light',
    
    // Storage key for theme persistence
    storageKey: 'admin_theme',
  },

  // React Query Configuration
  reactQuery: {
    defaultOptions: {
      queries: {
        // Don't refetch on window focus
        refetchOnWindowFocus: false,
        
        // Retry failed requests once
        retry: 1,
        
        // Cache time: 5 minutes
        staleTime: 5 * 60 * 1000,
      },
    },
  },

  // WebSocket Configuration
  socket: {
    // Socket.IO connection options
    options: {
      // Reconnection settings
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      
      // Timeout before connection error
      timeout: 20000,
      
      // Transport methods
      transports: ['websocket', 'polling'],
    },
  },

  // Feature Flags
  features: {
    // Enable experimental features
    experimental: false,
    
    // Enable debug mode
    debug: import.meta.env.DEV,
    
    // Enable service worker
    serviceWorker: true,
  },

  // Development Configuration
  dev: {
    // Show component boundaries
    showBoundaries: false,
    
    // Enable verbose logging
    verboseLogging: import.meta.env.DEV,
  },
} as const;

// Type-safe config accessor
export type AppConfig = typeof config;

// Export individual config sections for convenience
export const { api, app, theme, reactQuery, socket, features, dev } = config;

export default config;
