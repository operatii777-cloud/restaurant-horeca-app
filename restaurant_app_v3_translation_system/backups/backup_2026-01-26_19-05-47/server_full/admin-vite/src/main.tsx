// 🛡️ CRITICAL: Import polyfills FIRST - before any other imports
import '@/polyfills/useIsomorphicEffectFix';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/app/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import '@/styles/global.css';
import '@/styles/enterprise-polish.css';
import '@/shared/styles/inline-styles.css';
// Enterprise polish: micro-interactions, animations, accessibility
// PHASE S10 - Initialize Order Event Bridge
import { initOrderEventBridge } from '@/core/sockets/orderEvents';

// 🛡️ CRITICAL: Ensure React is available globally for react-bootstrap, zustand, and other hooks
if (typeof window !== 'undefined') {
  const globalScope = window as any;
  globalScope.React = React;
  globalScope.ReactDOM = ReactDOM;
  
  // Also expose on globalThis for any module that might check there
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).React = React;
    (globalThis as any).ReactDOM = ReactDOM;
  }
  
  // AGGRESSIVE: Make sure React.Children exists and is mutable BEFORE anything else runs
  try {
    if (!React.Children || typeof React.Children !== 'object') {
      console.warn('⚠️ React.Children is missing in main.tsx, creating placeholder');
      (React as any).Children = {
        map: (children: any, fn: any) => children,
        forEach: (children: any, fn: any) => {},
        count: (children: any) => 0,
        only: (children: any) => children,
        toArray: (children: any) => Array.isArray(children) ? children : [children],
      };
    }
  } catch (e) {
    console.error('❌ Failed to ensure React.Children in main.tsx:', e);
  }
}

console.log('🚀 main.tsx - Început montare React');
console.log('🔍 main.tsx - window.location.pathname:', window.location.pathname);
console.log('✓ React available:', typeof (window as any).React);
console.log('✓ React.Children available:', typeof (window as any).React?.Children);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Elementul #root nu a fost găsit în index.html');
  throw new Error('Elementul #root nu a fost găsit în index.html');
}

console.log('✅ rootElement găsit:', rootElement);

// ✅ Setează tema din localStorage sau default light
const savedTheme = localStorage.getItem('admin_theme') || 'light';
rootElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-theme', savedTheme);
document.body.setAttribute('data-theme', savedTheme);

// Configurează React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minute
    },
  },
});

// Determină basename dinamic bazat pe URL curent
// KIOSK la /kiosk/* nu are basename
// Admin la /admin-vite/* are basename /admin-vite
// Admin la /adminv4.html sau rute directe (fără prefix) nu au basename
const isKioskPath = window.location.pathname.startsWith('/kiosk');
const isAdminVitePath = window.location.pathname.startsWith('/admin-vite');
const isAdminV4Path = window.location.pathname.includes('/adminv4.html') || window.location.pathname === '/adminv4.html';
// Dacă path-ul nu începe cu /admin-vite sau /kiosk, și nu este /adminv4.html, atunci nu are basename
const basename = isKioskPath ? '' : (isAdminVitePath ? '/admin-vite' : '');

console.log('🔧 Router basename:', basename, '(isKiosk:', isKioskPath, ')');

// PHASE S10 - Initialize Order Event Bridge
initOrderEventBridge();
console.log('✅ Order Event Bridge initialized');

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter basename={basename}>
              <App />
            </BrowserRouter>
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </React.StrictMode>,
  );
  console.log('✅ React montat cu succes');
} catch (error) {
  console.error('❌ Eroare la montarea React:', error);
  throw error;
}
