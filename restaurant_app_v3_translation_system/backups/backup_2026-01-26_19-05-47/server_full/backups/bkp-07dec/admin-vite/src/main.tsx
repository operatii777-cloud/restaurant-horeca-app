import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/app/App';
import '@/styles/global.css';

console.log('🚀 main.tsx - Început montare React');
console.log('🔍 main.tsx - window.location.pathname:', window.location.pathname);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Elementul #root nu a fost găsit în index.html');
  throw new Error('Elementul #root nu a fost găsit în index.html');
}

console.log('✅ rootElement găsit:', rootElement);

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
// KIOSK la /kiosk/* nu are basename, Admin la /admin-vite/* are basename
const isKioskPath = window.location.pathname.startsWith('/kiosk');
const basename = isKioskPath ? '' : '/admin-vite';

console.log('🔧 Router basename:', basename, '(isKiosk:', isKioskPath, ')');

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
  console.log('✅ React montat cu succes');
} catch (error) {
  console.error('❌ Eroare la montarea React:', error);
  throw error;
}
