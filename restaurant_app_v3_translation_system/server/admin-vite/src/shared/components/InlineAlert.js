"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineAlert = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
require("./InlineAlert.css");
var InlineAlert = function (_a) {
    var _b;
    var message = _a.message, title = _a.title, _c = _a.type, type = _c === void 0 ? 'info' : _c, variant = _a.variant, actionLabel = _a.actionLabel, onAction = _a.onAction, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var visualVariant = (_b = variant !== null && variant !== void 0 ? variant : type) !== null && _b !== void 0 ? _b : 'info';
    var hasActions = Boolean((actionLabel && onAction) || onClose);
    return (<div className={"inline-alert inline-alert--".concat(visualVariant)} role="status">
      {title ? <strong className="inline-alert__title">{title}</strong> : null}
      <span className="inline-alert__message">{message}</span>
      {hasActions ? (<span className="inline-alert__actions">
          {actionLabel && onAction ? (<button type="button" className="inline-alert__button" onClick={onAction}>
              {actionLabel}
            </button>) : null}
          {onClose ? (<button type="button" className="inline-alert__close" onClick={onClose} aria-label="inchide alerta">
              ✕
            </button>) : null}
        </span>) : null}
    </div>);
};
exports.InlineAlert = InlineAlert;
