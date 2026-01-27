import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const KioskLoginModalContext = createContext(null);

export const KioskLoginModalProvider = ({ children }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const loginSuccessCallbacksRef = useRef([]);

  const openLoginModal = useCallback(() => {
    console.log('🔓 KioskLoginModalContext - openLoginModal apelat');
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    console.log('🔒 KioskLoginModalContext - closeLoginModal apelat');
    setShowLoginModal(false);
  }, []);

  const onLoginSuccess = useCallback((session) => {
    console.log('✅ KioskLoginModalContext - onLoginSuccess, callbacks:', loginSuccessCallbacksRef.current.length);
    // Apelează toate callback-urile înregistrate
    loginSuccessCallbacksRef.current.forEach(callback => {
      try {
        callback(session);
      } catch (err) {
        console.error('❌ Eroare la apelarea callback-ului login success:', err);
      }
    });
  }, []);

  const registerLoginSuccessCallback = useCallback((callback) => {
    if (typeof callback === 'function') {
      loginSuccessCallbacksRef.current.push(callback);
      console.log('✅ Callback înregistrat, total:', loginSuccessCallbacksRef.current.length);
      // Returnează funcție de cleanup
      return () => {
        loginSuccessCallbacksRef.current = loginSuccessCallbacksRef.current.filter(cb => cb !== callback);
      };
    }
  }, []);

  return (
    <KioskLoginModalContext.Provider
      value={{
        showLoginModal,
        openLoginModal,
        closeLoginModal,
        setShowLoginModal, // Pentru compatibilitate
        onLoginSuccess,
        registerLoginSuccessCallback,
      }}
    >
      {children}
    </KioskLoginModalContext.Provider>
  );
};

export const useKioskLoginModal = () => {
  const context = useContext(KioskLoginModalContext);
  if (!context) {
    console.warn('⚠️ useKioskLoginModal folosit în afara KioskLoginModalProvider');
    return {
      showLoginModal: false,
      openLoginModal: () => console.warn('⚠️ openLoginModal nu este disponibil'),
      closeLoginModal: () => console.warn('⚠️ closeLoginModal nu este disponibil'),
      setShowLoginModal: () => console.warn('⚠️ setShowLoginModal nu este disponibil'),
      onLoginSuccess: () => console.warn('⚠️ onLoginSuccess nu este disponibil'),
      registerLoginSuccessCallback: () => console.warn('⚠️ registerLoginSuccessCallback nu este disponibil'),
    };
  }
  return context;
};

