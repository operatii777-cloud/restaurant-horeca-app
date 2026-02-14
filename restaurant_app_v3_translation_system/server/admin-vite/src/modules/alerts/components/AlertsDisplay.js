"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALERTS DISPLAY COMPONENT
 *
 * Component React pentru afișare alerte real-time
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsDisplay = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var useAlerts_1 = require("../hooks/useAlerts");
var react_toastify_1 = require("react-toastify");
require("./AlertsDisplay.css");
var AlertsDisplay = function (_a) {
    var _b = _a.maxVisible, maxVisible = _b === void 0 ? 10 : _b, _c = _a.showToast, showToast = _c === void 0 ? true : _c, _d = _a.autoDismiss, autoDismiss = _d === void 0 ? false : _d, _e = _a.dismissDelay, dismissDelay = _e === void 0 ? 5000 : _e;
    // Eliminat hook-ul de traduceri, folosim doar text static
    var _f = (0, useAlerts_1.useAlerts)(), alerts = _f.alerts, isConnected = _f.isConnected, removeAlert = _f.removeAlert, clearAlerts = _f.clearAlerts, criticalCount = _f.criticalCount, warningCount = _f.warningCount, infoCount = _f.infoCount, totalCount = _f.totalCount;
    // Show toast notifications for new alerts
    (0, react_1.useEffect)(function () {
        if (!showToast || alerts.length === 0)
            return;
        var latestAlert = alerts[0];
        // Only show toast for critical and warning alerts
        if (latestAlert.severity === 'CRITICAL' || latestAlert.severity === 'WARNING') {
            var toastOptions = {
                type: (latestAlert.severity === 'CRITICAL' ? 'error' : 'warning'),
                autoClose: dismissDelay,
                position: 'top-right',
            };
            (0, react_toastify_1.toast)(latestAlert.message, toastOptions);
        }
    }, [alerts, showToast, dismissDelay]);
    // Auto-dismiss alerts after delay
    (0, react_1.useEffect)(function () {
        if (!autoDismiss)
            return;
        var timer = setTimeout(function () {
            // Remove oldest alerts (keep only recent ones)
            if (alerts.length > maxVisible) {
                alerts.slice(maxVisible).forEach(function (_, index) {
                    removeAlert(maxVisible + index);
                });
            }
        }, dismissDelay);
        return function () { return clearTimeout(timer); };
    }, [alerts, autoDismiss, dismissDelay, maxVisible, removeAlert]);
    var getSeverityVariant = function (severity) {
        switch (severity) {
            case 'CRITICAL':
                return 'danger';
            case 'WARNING':
                return 'warning';
            default:
                return 'info';
        }
    };
    var getSeverityIcon = function (severity) {
        switch (severity) {
            case 'CRITICAL':
                return '🚨';
            case 'WARNING':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };
    var visibleAlerts = alerts.slice(0, maxVisible);
    return (<react_bootstrap_1.Card className="alerts-display-card">
      <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Alerte Sistem</h5>
          <small className="text-muted">
            {isConnected ? (<react_bootstrap_1.Badge bg="success">Conectat</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">Deconectat</react_bootstrap_1.Badge>)}
          </small>
        </div>
        <div className="d-flex gap-2">
          {criticalCount > 0 && (<react_bootstrap_1.Badge bg="danger">{criticalCount} Critice</react_bootstrap_1.Badge>)}
          {warningCount > 0 && (<react_bootstrap_1.Badge bg="warning" text="dark">{warningCount} Avertismente</react_bootstrap_1.Badge>)}
          {infoCount > 0 && (<react_bootstrap_1.Badge bg="info">{infoCount} Info</react_bootstrap_1.Badge>)}
          {totalCount > 0 && (<react_bootstrap_1.Button variant="outline-secondary" size="sm" onClick={clearAlerts}>Șterge toate</react_bootstrap_1.Button>)}
        </div>
      </react_bootstrap_1.Card.Header>
      <react_bootstrap_1.Card.Body className="alerts-body">
        {visibleAlerts.length === 0 ? (<div className="text-center text-muted py-4">
            <p className="mb-0">Nu există alerte</p>
            <small>Sistemul funcționează normal</small>
          </div>) : (<div className="alerts-list">
            {visibleAlerts.map(function (alert, index) { return (<react_bootstrap_1.Alert key={"".concat(alert.timestamp, "-\"Index\"")} variant={getSeverityVariant(alert.severity)} className="alert-item" dismissible onClose={function () { return removeAlert(index); }}>
                <div className="d-flex align-items-start">
                  <span className="alert-icon me-2">{getSeverityIcon(alert.severity)}</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong>{alert.message}</strong>
                      <small className="text-muted ms-2">
                        {new Date(alert.timestamp).toLocaleTimeString('ro-RO')}
                      </small>
                    </div>
                    {alert.data && Object.keys(alert.data).length > 0 && (<details className="mt-2">
                        <summary className="text-muted" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>Detalii</summary>
                        <pre className="mt-2 mb-0" style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: "Auto" }}>
                          {JSON.stringify(alert.data, null, 2)}
                        </pre>
                      </details>)}
                  </div>
                </div>
              </react_bootstrap_1.Alert>); })}
          </div>)}
        {alerts.length > maxVisible && (<div className="text-center mt-3">
            <small className="text-muted">
              Afișate {maxVisible} din {totalCount} alerte
            </small>
          </div>)}
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
};
exports.AlertsDisplay = AlertsDisplay;
