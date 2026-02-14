"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionStatusBadge = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ActionStatusBadge = function (_a) {
    var resolved = _a.resolved, _b = _a.size, size = _b === void 0 ? 'md' : _b;
    //   const { t } = useTranslation();
    var getSizeClasses = function () {
        switch (size) {
            case 'sm':
                return 'px-2 py-1 text-xs';
            case 'lg':
                return 'px-4 py-2 text-base';
            default:
                return 'px-3 py-1.5 text-sm';
        }
    };
    if (resolved) {
        return (<span className={"inline-flex items-center gap-1.5 rounded-full font-semibold border bg-green-100 text-green-800 border-green-300 ".concat(getSizeClasses())}>
        <i className="fas fa-check-circle"></i>
        <span>"Rezolvată"</span>
      </span>);
    }
    return (<span className={"inline-flex items-center gap-1.5 rounded-full font-semibold border bg-yellow-100 text-yellow-800 border-yellow-300 ".concat(getSizeClasses())}>
      <i className="fas fa-clock"></i>
      <span>În Așteptare</span>
    </span>);
};
exports.ActionStatusBadge = ActionStatusBadge;
