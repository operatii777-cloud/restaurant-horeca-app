import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { checkKioskSession } from '../api/KioskApi';
import { KioskStandByBoundary } from './KioskStandByBoundary';
import { KioskLoginModal } from '../components/KioskLoginModal';
import { KioskThemeProvider } from '../context/KioskThemeContext';
import '../kiosk.css';

/**
 * KIOSK Layout - Modul complet separat de AdminV4
 * Fullscreen, touch-friendly, fără sidebar AdminV4
 * Cu StandBy + AutoLock + Audit
 * 
 * PERMITE acces la /kiosk/tables fără autentificare (pentru vizualizare StandBy)
 * BLOCHAZĂ toate celelalte rute fără autentificare
 */
export const KioskLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [session, setSession] = React.useState(() => {
    try {
      const savedUser = localStorage.getItem('kiosk_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (Date.now() - (user.timestamp || 0) < 8 * 60 * 60 * 1000) {
          console.log('✅ KioskLayout - User restaurat din localStorage:', user.username);
          const currentSession = checkKioskSession();
          if (!currentSession) {
            const tempSession = {
              username: user.username,
              role: user.role,
              timestamp: Date.now(),
              fromLocalStorage: true
            };
            sessionStorage.setItem('kiosk_session', JSON.stringify(tempSession));
            return tempSession;
          }
          return currentSession;
        } else {
          localStorage.removeItem('kiosk_user');
        }
      }
    } catch (err) {
      console.error('❌ Eroare la citirea user din localStorage:', err);
    }
    return checkKioskSession();
  });

  // Efect pentru restaurare user - OBLIGATORIU la începutul componentului
  React.useEffect(() => {
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
              if (typeof window !== 'undefined') {
                window.__KIOSK_STANDBY__ = false;
              }
            } else {
              setSession(currentSession);
            }
          } else {
            localStorage.removeItem('kiosk_user');
          }
        }
      } catch (err) {
        console.error('❌ Eroare la restaurarea user din localStorage:', err);
      }
    };
    restoreUser();
  }, []);

  // Efect pentru ascunderea TopBar Admin V4 - OBLIGATORIU
  React.useEffect(() => {
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
    // Doar un interval rar pentru a preveni interferențele
    const interval = setInterval(hideAdminV4, 1000);
    return () => clearInterval(interval);
  }, []);
  
  console.log('🔍 KioskLayout render - pathname:', location.pathname, 'session:', session);
  
  // Verificări de rute
  const isOrderPage = location.pathname.startsWith('/kiosk/order/');
  const isTablesPage = location.pathname.startsWith('/kiosk/tables');
  const isLoginPage = location.pathname.startsWith('/kiosk/login');
  const isPublicPage = isOrderPage || isTablesPage || isLoginPage;
  
  // Verificare sesiune pentru rute private
  const needsLogin = !session && !isPublicPage;
  
  // Verificare rol
  let invalidRole = false;
  if (session) {
    const allowedRoles = ['waiter', 'supervisor', 'admin'];
    if (!allowedRoles.includes(session.role)) {
      invalidRole = true;
    }
  }

  // Redirect pentru rol invalid
  React.useEffect(() => {
    if (invalidRole && !isTablesPage) {
      window.location.href = '/kiosk/tables';
    }
  }, [invalidRole, isTablesPage]);

  // Render layout
  return (
    <KioskThemeProvider>
      <div className="kiosk-layout">
        <KioskStandByBoundary>
          <KioskLoginModal show={needsLogin} />
          {!needsLogin && <Outlet />}
        </KioskStandByBoundary>
      </div>
    </KioskThemeProvider>
  );
};
