// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PWA Install Utility
 * Funcții pentru gestionarea instalării PWA
 */

let deferredPrompt: any = null;

export const initPWAInstall = () => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Previne afișarea automată a prompt-ului
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 PWA install prompt available');
    
    // Emite un event custom pentru a notifica UI-ul
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};

/**
 * Afișează prompt-ul de instalare PWA
 * @returns Promise<boolean> - true dacă utilizatorul a acceptat instalarea
 */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.warn('⚠️ PWA install prompt not available');
    return false;
  }

  try {
    // Afișează prompt-ul
    deferredPrompt.prompt();
    
    // Așteaptă răspunsul utilizatorului
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: "Outcome"`);
    
    // Șterge prompt-ul folosit
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

/**
 * Verifică dacă aplicația este instalată ca PWA
 */
export const isPWAInstalled = (): boolean => {
  // Verifică dacă rulează în standalone mode (instalat)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Verifică dacă este în fullscreen mode (iOS)
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
};

/**
 * Verifică dacă prompt-ul de instalare este disponibil
 */
export const isInstallPromptAvailable = (): boolean => {
  return deferredPrompt !== null;
};

