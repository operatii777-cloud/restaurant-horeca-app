// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AppLayout - Shell simplu (DOAR TopBar + HorizontalNav + Outlet)
 * NU mai controlează spacing/theme - ExcelPageLayout controlează TOT
 */

import { Outlet, useLocation } from 'react-router-dom';
import { HorizontalNav } from '@/modules/layout/components/HorizontalNav';
import { TopBar } from '@/modules/layout/components/TopBar';
import ToastContainer from '@/shared/components/ToastContainer';
import { useToast } from '@/shared/hooks/useToast';
import { ThemeWrapper } from '@/shared/components/ThemeWrapper';
import './AppLayout.css';
import { IncomingCallModal } from '@/modules/call-center/components/IncomingCallModal';

export const AppLayout = () => {
  //   const { t } = useTranslation();
  const location = useLocation();
  const { toasts, removeToast } = useToast();

  console.log('🔍 AppLayout render - pathname:', location.pathname);

  // Pentru rutele KIOSK, nu renderăm AppLayout UI, doar Outlet
  if (location.pathname.startsWith('/kiosk')) {
    console.log('✅ AppLayout: Rută KIOSK detectată, bypass AppLayout UI');
    return (
      <>
        <Outlet />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  console.log('✅ AppLayout renderizat pentru:', location.pathname);

  return (
    <ThemeWrapper>
      <div className="layout">
        {/* PHASE PRODUCTION-READY: Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">Sari la conținutul principal</a>

        <TopBar />
        <HorizontalNav />
        <div className="layout__content">
          <main
            id="main-content"
            className="layout__main"
            role="main"
            aria-label="Conținut principal"
            data-testid="admin-main-content"
          >
            <div className="layout__main-wrapper">
              <Outlet />
            </div>
          </main>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <IncomingCallModal />
      </div>
    </ThemeWrapper>
  );
};



