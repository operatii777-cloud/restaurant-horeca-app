import { useEffect, useRef, useCallback } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { useNavigate } from 'react-router-dom';
import { kioskLogout, checkKioskSession } from '../api/KioskApi';

/**
 * KioskAutoLockManager - Manager global de inactivitate
 * T1 = 30 sec → StandBy
 * T2 = 5 min → AutoLogout
 */
export const KioskAutoLockManager = ({ onStandBy, onAutoLogout, isLocked, onActivity }) => {
  const navigate = useNavigate();
  const standbyTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const loginHistoryIdRef = useRef(null);

  // Timere: 30 sec pentru StandBy, 5 min pentru AutoLogout
  const STANDBY_TIMEOUT = 30 * 1000; // 30 secunde
  const AUTO_LOGOUT_TIMEOUT = 5 * 60 * 1000; // 5 minute

  // Funcție pentru resetarea timerelor
  const resetTimers = useCallback(() => {
    // Salvează login history ID dacă există
    const session = checkKioskSession();
    if (session && !loginHistoryIdRef.current) {
      // Încearcă să obțină ultimul login history ID
      // Aceasta va fi setată după login
    }

    // Resetează StandBy timer
    if (standbyTimerRef.current) {
      clearTimeout(standbyTimerRef.current);
    }

    // Resetează AutoLogout timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Dacă nu suntem în lock, resetăm timerele
    if (!isLocked) {
      lastActivityRef.current = Date.now();

      // Setează StandBy timer (T1)
      standbyTimerRef.current = setTimeout(() => {
        if (onStandBy) {
          onStandBy();
        }
      }, STANDBY_TIMEOUT);

      // Setează AutoLogout timer (T2)
      logoutTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, AUTO_LOGOUT_TIMEOUT);
    }

    // Notifică activitate
    if (onActivity) {
      onActivity();
    }
  }, [isLocked, onStandBy, onActivity]);

  // Funcție pentru AutoLogout
  const handleAutoLogout = useCallback(async () => {
    try {
      // Log logout history
      if (loginHistoryIdRef.current) {
        try {
          await httpClient.post(`/api/kiosk/logout-history/${loginHistoryIdRef.current}`);
        } catch (err) {
          console.error('❌ Eroare la logarea logout:', err);
        }
      }

      // Logout
      kioskLogout();
      
      // Callback
      if (onAutoLogout) {
        onAutoLogout();
      }

      // Redirect la login
      navigate('/kiosk/login', { replace: true });
    } catch (err) {
      console.error('❌ Eroare la autologout:', err);
      // Continuă cu logout chiar dacă logging-ul eșuează
      kioskLogout();
      navigate('/kiosk/login', { replace: true });
    }
  }, [navigate, onAutoLogout]);

  // Setează login history ID (apelat după login)
  const setLoginHistoryId = useCallback((id) => {
    loginHistoryIdRef.current = id;
  });

  // Event listeners pentru activitate
  useEffect(() => {
    const events = ['mousemove', 'touchstart', 'click', 'keypress', 'scroll', 'mousedown', 'keydown'];

    const handleActivity = () => {
      resetTimers();
    };

    // Adaugă event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Inițializează timerele
    resetTimers();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (standbyTimerRef.current) {
        clearTimeout(standbyTimerRef.current);
      }

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [resetTimers]);

  // Export funcție pentru setarea login history ID
  useEffect(() => {
    // Expune funcția global pentru a putea fi apelată din alte componente
    window.__kioskSetLoginHistoryId = setLoginHistoryId;
    return () => {
      delete window.__kioskSetLoginHistoryId;
    };
  }, [setLoginHistoryId]);

  return null; // Component invisibil
};

