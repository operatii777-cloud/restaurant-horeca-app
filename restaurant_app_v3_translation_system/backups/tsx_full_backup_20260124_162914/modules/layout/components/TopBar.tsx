// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';

// LocationSwitcher moved to Transfer and Stocks pages
import './TopBar.css';

export const TopBar = () => {
//   const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Verifică dacă utilizatorul este deja autentificat
    const checkAuth = async () => {
      try {
        // Verifică dacă există session sau token
        const response = await httpClient.get('/api/admin/check-auth');
        if (response.data?.authenticated) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await httpClient.post('/api/admin/login', {
        username,
        password,
      });
      
      if (response.data?.success) {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      } else {
        setLoginError(response.data?.error || 'Date de autentificare incorecte');
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.error || 'Eroare la autentificare');
    }
  };

  const handleLogout = async () => {
    try {
      await httpClient.post('/api/admin/logout');
      setIsLoggedIn(false);
      window.location.href = '/admin';
    } catch (error) {
      // Logout chiar dacă există eroare
      setIsLoggedIn(false);
      window.location.href = '/admin';
    }
  };

  return (
    <>
      <header className="topbar topbar--compact">
        <div className="topbar__spacer" />
        <div className="topbar__right">
          {/* Theme Switcher */}
          <div style={{ 
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
            visibility: window.location.pathname.startsWith('/kiosk') ? 'hidden' : 'visible',
            minWidth: '220px'
          }}>
            <ThemeSwitcher size="md" />
          </div>
          
          {isLoggedIn ? (
            <button
              type="button"
              className="topbar__logout-btn"
              onClick={handleLogout}
              title="Deconectare"
            >
              🚪 Logout
            </button>
          ) : (
            <button
              type="button"
              className="topbar__login-btn"
              onClick={(e) => {
                // Verifică dacă suntem în KIOSK - nu deschide modalul Admin V4
                const isKiosk = window.location.pathname.startsWith('/kiosk');
                if (isKiosk) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('âš ï¸ TopBar login button apăsat în KIOSK - ignorat');
                  return;
                }
                setShowLoginModal(true);
              }}
              title="Conectare"
            >
              🔐 Login
            </button>
          )}
          
          {/* Logo */}
          <div className="topbar__logo">
            <span className="topbar__logo-icon">🍽️</span>
            <div className="topbar__logo-text">
              <span className="topbar__logo-title">Admin</span>
              <span className="topbar__logo-subtitle">Restaurant App v4</span>
            </div>
          </div>

          {/* Powered by QrOMS Badge */}
          <div className="topbar__qroms-badge">
            <a
              href="https://qroms.app"
              target="_blank"
              rel="noopener noreferrer"
              className="qroms-badge-link"
              aria-label="Powered by QrOMS"
            >
              <img 
                src="/admin-vite/QrOMS.jpg" 
                alt="QrOMS" 
                className="qroms-badge-img" 
                onError={(e) => {
                  // Dacă QrOMS.jpg nu există, încearcă Trattoria.jpg
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('QrOMS')) {
                    target.src = '/admin-vite/Trattoria.jpg';
                  } else {
                    // Dacă nici Trattoria.jpg nu există, ascunde imaginea
                    target.style.display = 'none';
                  }
                }}
              />
              <span className="qroms-badge-label">Powered by QrOMS</span>
            </a>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="topbar__login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="topbar__login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="topbar__login-modal-header">
              <h3>Conectare Admin</h3>
              <button
                type="button"
                className="topbar__login-modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                Ã—
              </button>
            </div>
            <form onSubmit={handleLogin} className="topbar__login-form">
              {loginError && (
                <div className="topbar__login-error">{loginError}</div>
              )}
              <div className="topbar__login-field">
                <label htmlFor="topbar-username">Utilizator:</label>
                <input
                  id="topbar-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="topbar__login-field">
                <label htmlFor="topbar-password">"Parolă:"</label>
                <input
                  id="topbar-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="topbar__login-actions">
                <button type="submit" className="topbar__login-submit">
                  Conectare
                </button>
                <button
                  type="button"
                  className="topbar__login-cancel"
                  onClick={() => setShowLoginModal(false)}
                >"Anulează"</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};




