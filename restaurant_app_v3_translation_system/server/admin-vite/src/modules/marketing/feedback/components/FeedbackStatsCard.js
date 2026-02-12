"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackStatsCard = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_bootstrap_1 = require("react-bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var FeedbackStatsCard = function (_a) {
    var stats = _a.stats;
    //   const { t } = useTranslation();
    var getRatingColor = function (rating) {
        var colors = {
            5: 'success',
            4: 'info',
            3: 'warning',
            2: 'danger',
            1: 'danger',
        };
        return colors[rating] || 'secondary';
    };
    return (<react_bootstrap_1.Card className="mb-4">
      <react_bootstrap_1.Card.Header className="bg-primary text-white">
        <i className="fas fa-chart-bar me-2"></i>
        Statistici Feedback
      </react_bootstrap_1.Card.Header>
      <react_bootstrap_1.Card.Body>
        <div className="text-center mb-4">
          <h2 className="mb-0">{stats.avg_rating.toFixed(1)}</h2>
          <p className="text-muted mb-0">Rating Mediu</p>
          <div className="mt-2">
            {'★'.repeat(Math.round(stats.avg_rating))}
            {'☆'.repeat(5 - Math.round(stats.avg_rating))}
          </div>
        </div>

        <div className="mb-3">
          <strong>Total Feedback-uri:</strong> {stats.total_feedback}
        </div>

        <div className="mt-4">
          <strong className="d-block mb-2">"distributie rating uri"</strong>
          {stats.rating_distribution.map(function (dist) { return (<div key={dist.rating} className="d-flex align-items-center mb-2">
              <div className="me-2" style={{ width: '60px' }}>
                <react_bootstrap_1.Badge bg={getRatingColor(dist.rating)}>
                  {'★'.repeat(dist.rating)}
                </react_bootstrap_1.Badge>
              </div>
              <div className="flex-grow-1">
                <div className="progress" style={{ height: '20px' }}>
                  <div className={"progress-bar bg-".concat(getRatingColor(dist.rating))} role="progressbar" style={{
                width: "".concat((dist.count / stats.total_feedback) * 100, "%"),
            }} aria-label={"".concat(dist.rating, " stele: ").concat(dist.count, " feedback-uri")}>
                    {dist.count}
                  </div>
                </div>
              </div>
            </div>); })}
        </div>
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
};
exports.FeedbackStatsCard = FeedbackStatsCard;
