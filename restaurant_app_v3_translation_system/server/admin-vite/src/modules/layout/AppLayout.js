"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AppLayout - Shell simplu (DOAR TopBar + HorizontalNav + Outlet)
 * NU mai controlează spacing/theme - ExcelPageLayout controlează TOT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLayout = void 0;
var react_router_dom_1 = require("react-router-dom");
var HorizontalNav_1 = require("@/modules/layout/components/HorizontalNav");
var TopBar_1 = require("@/modules/layout/components/TopBar");
var ToastContainer_1 = require("@/shared/components/ToastContainer");
var useToast_1 = require("@/shared/hooks/useToast");
var ThemeWrapper_1 = require("@/shared/components/ThemeWrapper");
require("./AppLayout.css");
var IncomingCallModal_1 = require("@/modules/call-center/components/IncomingCallModal");
var AppLayout = function () {
    //   const { t } = useTranslation();
    var location = (0, react_router_dom_1.useLocation)();
    var _a = (0, useToast_1.useToast)(), toasts = _a.toasts, removeToast = _a.removeToast;
    console.log('🔍 AppLayout render - pathname:', location.pathname);
    // Pentru rutele KIOSK, nu renderăm AppLayout UI, doar Outlet
    if (location.pathname.startsWith('/kiosk')) {
        console.log('✅ AppLayout: Rută KIOSK detectată, bypass AppLayout UI');
        return (<>
        <react_router_dom_1.Outlet />
        <ToastContainer_1.default toasts={toasts} onRemove={removeToast}/>
      </>);
    }
    console.log('✅ AppLayout renderizat pentru:', location.pathname);
    return (<ThemeWrapper_1.ThemeWrapper>
      <div className="layout">
        {/* PHASE PRODUCTION-READY: Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">Sari la conținutul principal</a>

        <TopBar_1.TopBar />
        <HorizontalNav_1.HorizontalNav />
        <div className="layout__content">
          <main id="main-content" className="layout__main" role="main" aria-label="Conținut principal" data-testid="admin-main-content">
            <div className="layout__main-wrapper">
              <react_router_dom_1.Outlet />
            </div>
          </main>
        </div>
        <ToastContainer_1.default toasts={toasts} onRemove={removeToast}/>
        <IncomingCallModal_1.IncomingCallModal />
      </div>
    </ThemeWrapper_1.ThemeWrapper>);
};
exports.AppLayout = AppLayout;
