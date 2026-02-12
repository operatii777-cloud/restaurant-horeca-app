"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AdminErrorState - Error state compact
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminErrorState = void 0;
var react_1 = require("react");
require("./AdminStates.css");
var AdminErrorState = function (_a) {
    var _b = _a.title, title = _b === void 0 ? 'Eroare' : _b, message = _a.message, onRetry = _a.onRetry;
    return (<div className="admin-state admin-state--error">
      <div className="admin-state__icon">⚠️</div>
      <h3 className="admin-state__title">{title}</h3>
      <p className="admin-state__message">{message}</p>
      {onRetry && (<button className="admin-state__action" onClick={onRetry}>"Reîncearcă"</button>)}
    </div>);
};
exports.AdminErrorState = AdminErrorState;
