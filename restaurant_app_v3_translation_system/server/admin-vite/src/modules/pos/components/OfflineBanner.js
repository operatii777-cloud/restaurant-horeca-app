"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.B - Offline Banner Component
 *
 * Displays banner when offline mode is active
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineBanner = OfflineBanner;
var react_bootstrap_1 = require("react-bootstrap");
var lucide_react_1 = require("lucide-react");
function OfflineBanner(_a) {
    var isOffline = _a.isOffline, syncStatus = _a.syncStatus;
    //   const { t } = useTranslation();
    if (!isOffline) {
        return null;
    }
    return (<react_bootstrap_1.Alert variant="warning" className="mb-3 d-flex align-items-center gap-2">
      <lucide_react_1.WifiOff size={20}/>
      <div className="flex-grow-1">
        <strong>Mod Offline Activ</strong>
        <br />
        <small>"comenzile vor fi salvate local si sincronizate aut"</small>
      </div>
    </react_bootstrap_1.Alert>);
}
