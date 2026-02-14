"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HappyHourStatsCard = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_bootstrap_1 = require("react-bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var HappyHourStatsCard = function (_a) {
    var stats = _a.stats, onRefresh = _a.onRefresh;
    //   const { t } = useTranslation();
    return (<react_bootstrap_1.Card className="mb-4">
      <react_bootstrap_1.Card.Header className="bg-info text-white">
        <i className="fas fa-chart-bar me-2"></i>
        Statistici Happy Hour
      </react_bootstrap_1.Card.Header>
      <react_bootstrap_1.Card.Body>
        <p className="text-muted small">"performanta happy hour urilor active"</p>
        <react_bootstrap_1.Button variant="info" size="sm" className="w-100 mb-3" onClick={onRefresh}>
          <i className="fas fa-sync me-2"></i>"actualizeaza statistici"</react_bootstrap_1.Button>
        {stats.length === 0 ? (<p className="text-muted text-center py-3">
            <i className="fas fa-info-circle me-2"></i>"nu exista statistici disponibile"</p>) : (<div className="stats-list">
            {stats.map(function (stat) { return (<div key={stat.id} className="stat-item mb-3 p-2 border rounded">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{stat.name}</strong>
                    <br />
                    <small className="text-muted">
                      {stat.start_time} - {stat.end_time}
                    </small>
                  </div>
                  <div className="text-end">
                    <react_bootstrap_1.Badge bg="primary">{stat.usage_count} utilizări</react_bootstrap_1.Badge>
                  </div>
                </div>
                <div className="mt-2 row text-center">
                  <div className="col-4">
                    <small className="text-muted d-block">Total Discount</small>
                    <strong>{stat.total_discount.toFixed(2)} RON</strong>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">"total revenue"</small>
                    <strong>{stat.total_revenue.toFixed(2)} RON</strong>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Avg Discount</small>
                    <strong>{stat.avg_discount.toFixed(2)} RON</strong>
                  </div>
                </div>
              </div>); })}
          </div>)}
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
};
exports.HappyHourStatsCard = HappyHourStatsCard;
