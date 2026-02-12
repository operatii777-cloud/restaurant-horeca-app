"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Profitability KPI Card Component
 * Card pentru afișarea KPI-urilor (Revenue, COGS, Profit, Food Cost %, Margin %)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitabilityKpiCard = void 0;
var react_bootstrap_1 = require("react-bootstrap");
var lucide_react_1 = require("lucide-react");
require("./ProfitabilityKpiCard.css");
var ProfitabilityKpiCard = function (_a) {
    var _b, _c;
    var kpi = _a.kpi, _d = _a.loading, loading = _d === void 0 ? false : _d;
    //   const { t } = useTranslation();
    if (loading) {
        return (<react_bootstrap_1.Card className="profitability-kpi-card profitability-kpi-card--loading">
        <react_bootstrap_1.Card.Body>
          <div className="kpi-skeleton">
            <div className="kpi-skeleton-title"></div>
            <div className="kpi-skeleton-value"></div>
            <div className="kpi-skeleton-subtitle"></div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>);
    }
    var colorClass = "profitability-kpi-card--".concat(kpi.color);
    var TrendIcon = ((_b = kpi.trend) === null || _b === void 0 ? void 0 : _b.isPositive) ? lucide_react_1.TrendingUp : lucide_react_1.TrendingDown;
    var trendClass = ((_c = kpi.trend) === null || _c === void 0 ? void 0 : _c.isPositive) ? 'trend-positive' : 'trend-negative';
    return (<react_bootstrap_1.Card className={"profitability-kpi-card ".concat(colorClass)}>
      <react_bootstrap_1.Card.Body>
        <div className="kpi-header">
          <h6 className="kpi-title">{kpi.title}</h6>
          {kpi.trend && (<span className={"kpi-trend ".concat(trendClass)}>
              <TrendIcon size={16}/>
              {kpi.trend.value}
            </span>)}
        </div>
        <div className="kpi-value">{kpi.value}</div>
        {kpi.subtitle && <div className="kpi-subtitle">{kpi.subtitle}</div>}
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
};
exports.ProfitabilityKpiCard = ProfitabilityKpiCard;
