"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = StatCard;
require("./StatCard.css");
var trendIconMap = {
    up: '▲',
    down: '▼',
    flat: '◆',
};
function StatCard(_a) {
    var title = _a.title, value = _a.value, helper = _a.helper, trendLabel = _a.trendLabel, trendValue = _a.trendValue, _b = _a.trendDirection, trendDirection = _b === void 0 ? 'flat' : _b, icon = _a.icon, footer = _a.footer, children = _a.children;
    //   const { t } = useTranslation();
    return (<article className="stat-card">
      <header className="stat-card__header">
        <div className="stat-card__icon" aria-hidden="true">
          {icon !== null && icon !== void 0 ? icon : '📊'}
        </div>
        <div className="stat-card__meta">
          <span className="stat-card__title">{title}</span>
          {helper ? <small className="stat-card__helper">{helper}</small> : null}
        </div>
      </header>

      <div className="stat-card__value">{value}</div>

      {trendLabel && trendValue ? (<div className={"stat-card__trend stat-card__trend--".concat(trendDirection)}>
          <span className="stat-card__trend-icon" aria-hidden="true">
            {trendIconMap[trendDirection]}
          </span>
          <span className="stat-card__trend-value">{trendValue}</span>
          <span className="stat-card__trend-label">{trendLabel}</span>
        </div>) : null}

      {children ? <div className="stat-card__content">{children}</div> : null}
      {footer ? <footer className="stat-card__footer">{footer}</footer> : null}
    </article>);
}
