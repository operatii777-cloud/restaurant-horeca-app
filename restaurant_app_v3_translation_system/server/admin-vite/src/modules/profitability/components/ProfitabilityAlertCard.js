"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Profitability Alert Card Component
 * Card pentru afișarea alertelor (high food cost, low margin, spikes, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitabilityAlertCard = void 0;
var react_bootstrap_1 = require("react-bootstrap");
var lucide_react_1 = require("lucide-react");
require("./ProfitabilityAlertCard.css");
var ProfitabilityAlertCard = function (_a) {
    var alerts = _a.alerts, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.maxAlerts, maxAlerts = _c === void 0 ? 5 : _c;
    //   const { t } = useTranslation();
    if (loading) {
        return (<react_bootstrap_1.Card className="profitability-alert-card">
        <react_bootstrap_1.Card.Header>
          <h6 className="mb-0">⚠️ Alerte COGS</h6>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <div className="alert-skeleton">
            {[1, 2, 3].map(function (i) { return (<div key={i} className="alert-skeleton-item"></div>); })}
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>);
    }
    var displayedAlerts = alerts.slice(0, maxAlerts);
    var hasAlerts = displayedAlerts.length > 0;
    var getAlertIcon = function (type) {
        //   const { t } = useTranslation();
        switch (type) {
            case 'high_food_cost':
                return <lucide_react_1.AlertTriangle size={18}/>;
            case 'low_margin':
                return <lucide_react_1.TrendingDown size={18}/>;
            case 'spike_cogs':
                return <lucide_react_1.TrendingUp size={18}/>;
            case 'category_alert':
                return <lucide_react_1.AlertCircle size={18}/>;
            default:
                return <lucide_react_1.AlertTriangle size={18}/>;
        }
    };
    return (<react_bootstrap_1.Card className="profitability-alert-card">
      <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          ⚠️ Alerte COGS
          {hasAlerts && (<react_bootstrap_1.Badge bg="danger" className="ms-2">
              {alerts.length}
            </react_bootstrap_1.Badge>)}
        </h6>
      </react_bootstrap_1.Card.Header>
      <react_bootstrap_1.Card.Body>
        {!hasAlerts ? (<div className="no-alerts">
            <lucide_react_1.AlertCircle size={32} className="text-muted mb-2"/>
            <p className="text-muted mb-0">"nu exista alerte in acest moment"</p>
          </div>) : (<div className="alert-list">
            {displayedAlerts.map(function (alert, index) { return (<div key={index} className={"alert-item alert-item--".concat(alert.severity)}>
                <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
                <react_bootstrap_1.Badge bg={alert.severity === 'danger' ? 'danger' : 'warning'} className="alert-badge">
                  {alert.severity === 'danger' ? 'Critic' : 'Atenție'}
                </react_bootstrap_1.Badge>
              </div>); })}
            {alerts.length > maxAlerts && (<div className="alert-more">
                +{alerts.length - maxAlerts} alerte suplimentare
              </div>)}
          </div>)}
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
};
exports.ProfitabilityAlertCard = ProfitabilityAlertCard;
