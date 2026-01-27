import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { KioskSidebar } from './KioskSidebar';
import { KioskThemeProvider } from '../context/KioskThemeContext';
import { KioskLoginModalProvider } from '../context/KioskLoginModalContext';
import { checkKioskSession } from '../api/KioskApi';
import './KioskMainLayout.css';

/**
 * Layout principal pentru KIOSK cu Sidebar
 * Înlocuiește KioskLayout pentru rutele cu sidebar
 * Feature: Responsive sidebar collapse support
 */
export const KioskMainLayout = () => {
  const [session, setSession] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kiosk_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (Date.now() - (user.timestamp || 0) < 8 * 60 * 60 * 1000) {
          console.log('✅ KioskMainLayout - User restaurat:', user.username);
          return user;
        } else {
          localStorage.removeItem('kiosk_user');
        }
      }
    } catch (err) {
      console.error('❌ Eroare la citirea user:', err);
    }
    return checkKioskSession();
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('kiosk-sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kiosk-sidebar-collapsed') {
        setSidebarCollapsed(e.newValue === 'true');
      }
    };

    // Also poll for changes (for same-tab updates)
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem('kiosk-sidebar-collapsed');
        const newValue = saved ? JSON.parse(saved) : false;
        setSidebarCollapsed(prev => prev !== newValue ? newValue : prev);
      } catch {}
    }, 200);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Restaurare user din localStorage
  useEffect(() => {
    const restoreUser = () => {
      try {
        const savedUser = localStorage.getItem('kiosk_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (Date.now() - (user.timestamp || 0) < 8 * 60 * 60 * 1000) {
            const currentSession = checkKioskSession();
            if (!currentSession) {
              const tempSession = {
                username: user.username,
                role: user.role,
                timestamp: Date.now(),
                fromLocalStorage: true
              };
              sessionStorage.setItem('kiosk_session', JSON.stringify(tempSession));
              setSession(tempSession);
            } else {
              setSession(currentSession);
            }
          } else {
            localStorage.removeItem('kiosk_user');
          }
        }
      } catch (err) {
        console.error('❌ Eroare la restaurarea user:', err);
      }
    };
    restoreUser();
  }, []);

  // Ascunde TopBar și HorizontalNav din Admin V4
  useEffect(() => {
    const hideAdminV4 = () => {
      const topbar = document.querySelector('.topbar, [class*="topbar"]');
      const horizontalNav = document.querySelector('.horizontal-nav, [class*="horizontal-nav"]');
      if (topbar) {
        topbar.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important';
      }
      if (horizontalNav) {
        horizontalNav.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important';
      }
    };
    hideAdminV4();
    const interval = setInterval(hideAdminV4, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('kiosk_session');
    localStorage.removeItem('kiosk_user');
    setSession(null);
    window.location.href = '/kiosk/login';
  };

  console.log('🔍 KioskMainLayout render - session:', session);

  return (
    <KioskThemeProvider>
      <KioskLoginModalProvider>
        <div className={`kiosk-main-layout kiosk-layout ${sidebarCollapsed ? 'kiosk-main-layout--sidebar-collapsed' : ''}`}>
          <KioskSidebar user={session} onLogout={handleLogout} />
          <div className="kiosk-main-layout__content">
            <Outlet />
          </div>
        </div>
      </KioskLoginModalProvider>
    </KioskThemeProvider>
  );
};
