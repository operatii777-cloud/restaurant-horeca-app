import { Outlet, useLocation } from 'react-router-dom';
import { HorizontalNav } from '@/modules/layout/components/HorizontalNav';
import { TopBar } from '@/modules/layout/components/TopBar';
import './AppLayout.css';

export const AppLayout = () => {
  const location = useLocation();
  
  console.log('🔍 AppLayout render - pathname:', location.pathname);
  
  // Pentru rutele KIOSK, nu renderăm AppLayout UI, doar Outlet
  // Aceasta permite KioskMainLayout să fie randat corect
  if (location.pathname.startsWith('/kiosk')) {
    console.log('✅ AppLayout: Rută KIOSK detectată, bypass AppLayout UI');
    return <Outlet />;
  }
  
  console.log('✅ AppLayout renderizat pentru:', location.pathname);
  
  return (
    <div className="layout">
      <TopBar />
      <HorizontalNav />
      <div className="layout__content">
        <main className="layout__main">
          <div className="layout__main-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
