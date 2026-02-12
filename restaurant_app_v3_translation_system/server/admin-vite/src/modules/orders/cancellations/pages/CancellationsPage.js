"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancellationsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var OrdersAnalyticsPanel_1 = require("../../components/OrdersAnalyticsPanel");
var CancellationsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), feedback = _a[0], setFeedback = _a[1];
    var handleFeedback = function (message, type) {
        setFeedback({ message: message, type: type });
        setTimeout(function () { return setFeedback(null); }, 5000);
    };
    return (<div className="cancellations-page padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-chart-line me-2"></i>Analiza anulări</h1>
      </div>

      {feedback && (<div className={"alert alert-".concat(feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info')} role="alert">
          {feedback.message}
        </div>)}

      <OrdersAnalyticsPanel_1.OrdersAnalyticsPanel onFeedback={handleFeedback}/>
    </div>);
};
exports.CancellationsPage = CancellationsPage;
