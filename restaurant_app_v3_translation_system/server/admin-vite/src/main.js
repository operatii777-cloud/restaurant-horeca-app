"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// 🛡️ CRITICAL: Import polyfills FIRST - before any other imports
require("@/polyfills/useIsomorphicEffectFix");
var react_1 = require("react");
var client_1 = require("react-dom/client");
var react_router_dom_1 = require("react-router-dom");
var react_query_1 = require("@tanstack/react-query");
var App_1 = require("@/app/App");
var ErrorBoundary_1 = require("@/components/ErrorBoundary");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("@/styles/global.css");
require("@/styles/enterprise-polish.css");
require("@/shared/styles/inline-styles.css");
// Enterprise polish: micro-interactions, animations, accessibility
// PHASE S10 - Initialize Order Event Bridge
var orderEvents_1 = require("@/core/sockets/orderEvents");
// 🛡️ CRITICAL: Ensure React is available globally for react-bootstrap, zustand, and other hooks
if (typeof window !== 'undefined') {
    var globalScope = window;
    globalScope.React = react_1.default;
    globalScope.ReactDOM = client_1.default;
    // Also expose on globalThis for any module that might check there
    if (typeof globalThis !== 'undefined') {
        globalThis.React = react_1.default;
        globalThis.ReactDOM = client_1.default;
    }
    // AGGRESSIVE: Make sure React.Children exists and is mutable BEFORE anything else runs
    try {
        if (!react_1.default.Children || typeof react_1.default.Children !== 'object') {
            console.warn('⚠️ React.Children is missing in main.tsx, creating placeholder');
            react_1.default.Children = {
                map: function (children, fn) { return children; },
                forEach: function (children, fn) { },
                count: function (children) { return 0; },
                only: function (children) { return children; },
                toArray: function (children) { return Array.isArray(children) ? children : [children]; },
            };
        }
    }
    catch (e) {
        console.error('❌ Failed to ensure React.Children in main.tsx:', e);
    }
}
console.log('🚀 main.tsx - Început montare React');
console.log('🔍 main.tsx - window.location.pathname:', window.location.pathname);
console.log('✓ React available:', typeof window.React);
console.log('✓ React.Children available:', typeof ((_a = window.React) === null || _a === void 0 ? void 0 : _a.Children));
var rootElement = document.getElementById('root');
if (!rootElement) {
    console.error('❌ Elementul #root nu a fost găsit în index.html');
    throw new Error('Elementul #root nu a fost găsit în index.html');
}
console.log('✅ rootElement găsit:', rootElement);
// ✅ Setează tema din localStorage sau default light
var savedTheme = localStorage.getItem('admin_theme') || 'light';
rootElement.setAttribute('data-theme', savedTheme);
document.documentElement.setAttribute('data-theme', savedTheme);
document.body.setAttribute('data-theme', savedTheme);
// Configurează React Query Client
var queryClient = new react_query_1.QueryClient({
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
var isKioskPath = window.location.pathname.startsWith('/kiosk');
var isAdminVitePath = window.location.pathname.startsWith('/admin-vite');
var isAdminV4Path = window.location.pathname.includes('/adminv4.html') || window.location.pathname === '/adminv4.html';
// Dacă path-ul nu începe cu /admin-vite sau /kiosk, și nu este /adminv4.html, atunci nu are basename
var basename = isKioskPath ? '' : (isAdminVitePath ? '/admin-vite' : '');
console.log('🔧 Router basename:', basename, '(isKiosk:', isKioskPath, ')');
// PHASE S10 - Initialize Order Event Bridge
(0, orderEvents_1.initOrderEventBridge)();
console.log('✅ Order Event Bridge initialized');
try {
    client_1.default.createRoot(rootElement).render(<react_1.default.StrictMode>
      <ThemeContext_1.ThemeProvider>
        <ErrorBoundary_1.ErrorBoundary>
          <react_query_1.QueryClientProvider client={queryClient}>
            <react_router_dom_1.BrowserRouter basename={basename}>
              <App_1.default />
            </react_router_dom_1.BrowserRouter>
          </react_query_1.QueryClientProvider>
        </ErrorBoundary_1.ErrorBoundary>
      </ThemeContext_1.ThemeProvider>
    </react_1.default.StrictMode>);
    console.log('✅ React montat cu succes');
}
catch (error) {
    console.error('❌ Eroare la montarea React:', error);
    throw error;
}
