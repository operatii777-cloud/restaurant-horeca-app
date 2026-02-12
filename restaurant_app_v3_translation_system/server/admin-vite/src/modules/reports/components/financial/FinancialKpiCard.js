"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S15 — Financial KPI Card Component
 *
 * Reusable KPI card for financial metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialKpiCard = FinancialKpiCard;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./FinancialKpiCard.css");
function FinancialKpiCard(_a) {
    var title = _a.title, value = _a.value, subtitle = _a.subtitle, trend = _a.trend, _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.format, format = _c === void 0 ? 'currency' : _c;
    //   const { t } = useTranslation();
    var formatValue = function (val) {
        if (val === undefined || val === null) {
            return '0.00 RON'; // Default pentru valori undefined/null
        }
        if (typeof val === 'string')
            return val;
        if (isNaN(val))
            return '0.00 RON'; // Default pentru NaN
        switch (format) {
            case 'currency':
                return "".concat(Number(val).toFixed(2), " RON");
            case 'percent':
                return "".concat(Number(val).toFixed(1), "%");
            case 'number':
                return Number(val).toLocaleString('ro-RO');
            default:
                return String(val);
        }
    };
    var getTrendIcon = function () {
        if (!trend)
            return null;
        switch (trend) {
            case 'up':
                return <i className="fas fa-arrow-up text-success ms-2"></i>;
            case 'down':
                return <i className="fas fa-arrow-down text-danger ms-2"></i>;
            case 'neutral':
                return <i className="fas fa-minus text-muted ms-2"></i>;
        }
    };
    return (<react_bootstrap_1.Card className={"financial-kpi-card financial-kpi-card--\"Variant\""}>
      <react_bootstrap_1.Card.Body>
        <div className="financial-kpi-title">{title}</div>
        <div className="financial-kpi-value">
          {formatValue(value)}
          {getTrendIcon()}
        </div>
        {subtitle && <div className="financial-kpi-subtitle">{subtitle}</div>}
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
}
