"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AdminDrawer - Drawer detalii în dreapta
 * Boogit-like: drawer pentru detalii, acțiuni rapide
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDrawer = void 0;
var react_1 = require("react");
require("./AdminDrawer.css");
var AdminDrawer = function (_a) {
    var open = _a.open, onClose = _a.onClose, title = _a.title, children = _a.children, _b = _a.width, width = _b === void 0 ? 420 : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    (0, react_1.useEffect)(function () {
        if (open) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return function () {
            document.body.style.overflow = '';
        };
    }, [open]);
    if (!open)
        return null;
    return (<>
      <div className="admin-drawer__backdrop" onClick={onClose}/>
      <div className={"admin-drawer ".concat(className)} style={{ width: "".concat(width, "px") }}>
        <div className="admin-drawer__header">
          <h2 className="admin-drawer__title">{title}</h2>
          <button className="admin-drawer__close" onClick={onClose} aria-label="Închide">
            ×
          </button>
        </div>
        <div className="admin-drawer__body">
          {children}
        </div>
      </div>
    </>);
};
exports.AdminDrawer = AdminDrawer;
