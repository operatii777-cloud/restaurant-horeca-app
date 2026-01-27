import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { KioskAutoLockManager } from '../components/KioskAutoLockManager';
import { KioskLoginModal } from '../components/KioskLoginModal';
import { checkKioskSession } from '../api/KioskApi';
import { KioskLoginModalProvider, useKioskLoginModal } from '../context/KioskLoginModalContext';
import '../kiosk.css';

/**
 * KioskStandByBoundaryInner - Component intern care folosește contextul
 * IMPORTANT: Toate hook-urile TREBUIE apelate înainte de orice return condiționat!
 */
const KioskStandByBoundaryInner = ({ children }) => {
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(false);
  const { showLoginModal, setShowLoginModal, onLoginSuccess: contextOnLoginSuccess } = useKioskLoginModal();
  const [hasSession, setHasSession] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  
  // Calculează tipul de pagină - NU este un hook, doar o variabilă
  const isOrderPage = location.pathname.startsWith('/kiosk/order/');
  const isTablesPage = location.pathname === '/kiosk/tables';
  const isLoginPage = location.pathname === '/kiosk/login';
  
  // Funcție pentru verificarea sesiunii - DOAR actualizează state dacă e diferit
  const checkAndUpdateSession = useCallback(() => {
    const session = checkKioskSession();
    // Doar actualizează dacă s-a schimbat pentru a evita re-renders
    setCurrentSession(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(session)) {
        return session;
      }
      return prev;
    });
    setHasSession(prev => {
      const newVal = !!session;
      return prev !== newVal ? newVal : prev;
    });
    if (session && isLocked) {
      setShowLoginModal(false);
      setIsLocked(false);
    }
    return session;
  }, [setShowLoginModal, isLocked]);

  // Effect 1: Dezactivează StandBy pentru OrderPage
  useEffect(() => {
    if (isOrderPage && isLocked) {
      console.log('🔓 KioskStandByBoundary FIX — unlocked for OrderPage');
      setIsLocked(false);
    }
  }, [isOrderPage, isLocked]);

  // Effect 2: Verifică sesiunea la mount și la schimbări de rută
  useEffect(() => {
    const session = checkKioskSession();
    const hasValidSession = !!session;
    setHasSession(hasValidSession);
    setCurrentSession(session);
    
    if (hasValidSession) {
      setIsLocked(false);
      setShowLoginModal(false);
      return;
    }
    
    // StandBy pe tables dacă nu există sesiune
    if (!hasValidSession && isTablesPage) {
      setIsLocked(true);
    }
  }, [location.pathname, setShowLoginModal, isTablesPage]);

  // Effect 3: Verifică sesiunea periodic (rar, pentru a evita re-renders)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateSession();
    }, 5000); // Verifică la fiecare 5 secunde
    return () => clearInterval(interval);
  }, [checkAndUpdateSession]);

  // Effect 4: Flag global StandBy
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__KIOSK_STANDBY__ = isLocked && !currentSession;
    }
  }, [isLocked, currentSession]);

  // Handler pentru StandBy (inactivitate)
  const handleStandBy = useCallback(() => {
    setIsLocked(true);
  }, []);

  // Handler pentru unlock request
  const handleUnlockRequest = useCallback(() => {
    setShowLoginModal(true);
  }, [setShowLoginModal]);

  // Handler pentru login success
  const handleLoginSuccess = useCallback((session) => {
    console.log('🔓 KioskStandByBoundary - handleLoginSuccess apelat');
    let verifiedSession = checkKioskSession();
    if (!verifiedSession && session) {
      sessionStorage.setItem('kiosk_session', JSON.stringify(session));
      verifiedSession = session;
    }
    
    if (window.__kioskSetLoginHistoryId && session?.login_history_id) {
      window.__kioskSetLoginHistoryId(session.login_history_id);
    }
    
    setIsLocked(false);
    setShowLoginModal(false);
    setHasSession(true);
    setCurrentSession(verifiedSession || session);
    
    if (contextOnLoginSuccess) {
      contextOnLoginSuccess(session);
    }
  }, [setShowLoginModal, contextOnLoginSuccess]);

  // Handler pentru AutoLogout
  const handleAutoLogout = useCallback(() => {
    setIsLocked(false);
    setShowLoginModal(false);
    setHasSession(false);
    setCurrentSession(null);
    window.location.href = '/kiosk/tables';
  }, [setShowLoginModal]);

  // Calculează dacă trebuie afișat StandBy
  const shouldShowStandBy = useMemo(() => {
    return !isLoginPage && !isOrderPage && !currentSession && (isLocked || isTablesPage);
  }, [isLoginPage, isOrderPage, currentSession, isLocked, isTablesPage]);

  // Debug redus pentru a evita flood în consolă

  // ACUM putem face return-uri condiționate - DUPĂ ce toate hook-urile au fost apelate
  // Pentru OrderPage, returnează direct children fără overlay
  if (isOrderPage) {
    return <>{children}</>;
  }

  return (
    <>
      <KioskAutoLockManager
        onStandBy={handleStandBy}
        onAutoLogout={handleAutoLogout}
      />
      
      {children}
      
      {/* Card StandBy mic în dreapta sus */}
      {shouldShowStandBy && (
        <div 
          onClick={handleUnlockRequest}
          style={{
            position: 'fixed',
            top: '18px',
            right: '18px',
            zIndex: 1000000,
            background: '#ffffff',
            padding: '12px 18px',
            minWidth: '160px',
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            border: '1px solid #e6e6e6'
          }}
        >
          <span style={{ fontSize: '22px' }}>🔒</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>StandBy</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Login necesar</div>
          </div>
        </div>
      )}
      
      <KioskLoginModal
        show={showLoginModal}
        onHide={() => {
          if (!currentSession && isTablesPage) {
            setIsLocked(true);
          }
          setShowLoginModal(false);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

/**
 * KioskStandByBoundary - Wrapper global pentru StandBy + AutoLock
 */
export const KioskStandByBoundary = ({ children }) => {
  return (
    <KioskLoginModalProvider>
      <KioskStandByBoundaryInner>{children}</KioskStandByBoundaryInner>
    </KioskLoginModalProvider>
  );
};
