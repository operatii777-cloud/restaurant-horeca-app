"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideDrawer = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./SideDrawer.css");
var SideDrawer = function (_a) {
    var title = _a.title, description = _a.description, open = _a.open, _b = _a.width, width = _b === void 0 ? 520 : _b, onClose = _a.onClose, footer = _a.footer, children = _a.children;
    //   const { t } = useTranslation();
    (0, react_1.useEffect)(function () {
        if (!open)
            return;
        var handler = function (event) {
            //   const { t } = useTranslation();
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handler);
        return function () { return window.removeEventListener('keydown', handler); };
    }, [open, onClose]);
    return (<div className={"side-drawer ".concat(open ? 'side-drawer--open' : '')} role="dialog" aria-modal="true">
      <div className="side-drawer__backdrop" onClick={onClose}/>
      <aside className="side-drawer__panel" style={{ width: width }}>
        <header className="side-drawer__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="side-drawer__close" onClick={onClose} aria-label="inchide panelul">
            ✕
          </button>
        </header>
        <div className="side-drawer__content">{children}</div>
        {footer ? <footer className="side-drawer__footer">{footer}</footer> : null}
      </aside>
    </div>);
};
exports.SideDrawer = SideDrawer;
