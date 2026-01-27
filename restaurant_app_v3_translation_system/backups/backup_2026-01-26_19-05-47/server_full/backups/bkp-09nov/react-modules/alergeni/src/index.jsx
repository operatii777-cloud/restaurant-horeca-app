import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// DEBUGGING: Loghează fiecare execuție a scriptului
console.log('📜 Script index.jsx executed at:', new Date().toISOString());
console.log('🔍 Window mounted flag:', window.__REACT_ROOT_MOUNTED__);

// PREVINE MONTĂRI MULTIPLE - CHECK GLOBAL FLAG
if (window.__REACT_ROOT_MOUNTED__) {
  console.warn('⚠️ React already mounted! Skipping re-mount to prevent Error #31');
  console.trace('Re-mount attempt trace:');
} else {
  // Marchează ca montat IMEDIAT
  window.__REACT_ROOT_MOUNTED__ = true;
  
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('❌ Root container not found!');
    window.__REACT_ROOT_MOUNTED__ = false; // Reset flag on error
  } else {
    console.log('📦 Container found:', container);
    console.log('📦 Container innerHTML length before clear:', container.innerHTML.length);
    
    // Curăță complet container-ul
    container.innerHTML = '';
    
    console.log('📦 Container innerHTML length after clear:', container.innerHTML.length);
    
    try {
      // Creează root
      const root = ReactDOM.createRoot(container);
      console.log('✅ React root created');
      
      // Render fără StrictMode (care montează de 2 ori în dev)
      root.render(<App />);
      console.log('✅ Alergeni module mounted successfully');
      
      // Salvează root-ul pentru cleanup eventual
      window.__REACT_ROOT__ = root;
      
      // Expune funcțiile pentru sistemul modular
      window.showAlergeniForm = function() {
        console.log('✅ showAlergeniForm called from parent');
        return true;
      };
      
      window.hideAlergeniForm = function() {
        console.log('✅ hideAlergeniForm called from parent');
        return true;
      };
      
      // Marchează că funcțiile sunt gata
      window.moduleFunctionsReady = true;
      
      console.log('✅ Functions exposed to window');
      console.log('  → showAlergeniForm:', typeof window.showAlergeniForm);
      console.log('  → hideAlergeniForm:', typeof window.hideAlergeniForm);
      console.log('  → moduleFunctionsReady:', window.moduleFunctionsReady);
      
      // Notifică parent window că modulul este gata (dacă e în iframe)
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'MODULE_READY',
            module: 'alergeni',
            functions: ['showAlergeniForm', 'hideAlergeniForm'],
            timestamp: new Date().toISOString()
          }, '*');
          console.log('✅ Notified parent window via postMessage');
        } catch (e) {
          console.warn('⚠️ Could not notify parent:', e);
        }
      }
      
    } catch (error) {
      console.error('❌ Error mounting React:', error);
      window.__REACT_ROOT_MOUNTED__ = false; // Reset flag on error
      throw error;
    }
  }
}

// Cleanup la unload
window.addEventListener('beforeunload', () => {
  console.log('🧹 Cleaning up React root');
  if (window.__REACT_ROOT__) {
    try {
      window.__REACT_ROOT__.unmount();
    } catch (e) {
      console.warn('Unmount error (poate fi ignorat):', e);
    }
    window.__REACT_ROOT__ = null;
  }
  window.__REACT_ROOT_MOUNTED__ = false;
});
