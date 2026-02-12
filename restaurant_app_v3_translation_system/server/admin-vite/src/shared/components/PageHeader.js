"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHeader = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
require("./PageHeader.css");
var PageHeader = function (_a) {
    var title = _a.title, description = _a.description, _b = _a.actions, actions = _b === void 0 ? [] : _b, children = _a.children;
    //   const { t } = useTranslation();
    return (<div className="page-header">
      <div>
        <h2 className="page-header__title">{title}</h2>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      <div className="page-header__actions">
        {children}
        {actions.length > 0 && actions.map(function (_a) {
            var label = _a.label, _b = _a.variant, variant = _b === void 0 ? 'secondary' : _b, onClick = _a.onClick;
            return (<button key={label} type="button" className={"page-header__button page-header__button--".concat(variant)} onClick={onClick}>
            {label}
          </button>);
        })}
      </div>
    </div>);
};
exports.PageHeader = PageHeader;
