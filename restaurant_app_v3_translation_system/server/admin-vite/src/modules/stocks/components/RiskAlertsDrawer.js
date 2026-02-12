"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAlertsDrawer = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var SideDrawer_1 = require("@/shared/components/SideDrawer");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./RiskAlertsDrawer.css");
var RiskAlertsDrawer = function (_a) {
    var open = _a.open, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), alerts = _b[0], setAlerts = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), filterType = _d[0], setFilterType = _d[1];
    var _e = (0, react_1.useState)(''), filterSeverity = _e[0], setFilterSeverity = _e[1];
    (0, react_1.useEffect)(function () {
        if (open) {
            loadRiskAlerts();
        }
    }, [open, filterType, filterSeverity]);
    var loadRiskAlerts = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/inventory/risk-alerts', {
                            params: {
                                risk_type: filterType || undefined,
                                severity: filterSeverity || undefined,
                            },
                        })];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setAlerts(response.data.data || []);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea alertelor de risc:', error_1);
                    // Fallback pentru development
                    setAlerts([
                        {
                            id: 1,
                            ingredient_name: 'Mozzarella',
                            location: 'Bucătărie Principală',
                            risk_type: 'negative_stock',
                            severity: 'critical',
                            message: 'Stoc negativ detectat!',
                            current_value: -5,
                            expected_value: 50,
                            variance_percent: -110,
                            last_updated: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            ingredient_name: 'Sos roșii',
                            location: 'Bucătărie Principală',
                            risk_type: 'high_variance',
                            severity: 'warning',
                            message: 'Varianță mare la inventar (25%)',
                            current_value: 125,
                            expected_value: 100,
                            variance_percent: 25,
                            last_updated: new Date().toISOString(),
                        },
                        {
                            id: 3,
                            ingredient_name: 'Ulei de măsline',
                            location: 'Bar',
                            risk_type: 'low_turnover',
                            severity: 'info',
                            message: 'Rotație scăzută - posibil stoc vechi',
                            current_value: 80,
                            expected_value: 80,
                            variance_percent: 0,
                            last_updated: new Date().toISOString(),
                        },
                    ]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filterType, filterSeverity]);
    var getRiskTypeLabel = function (type) {
        var labels = {
            negative_stock: 'Stoc Negativ',
            high_variance: 'Varianță Mare',
            expiring_soon: 'Expiră Curând',
            low_turnover: 'Rotație Scăzută',
            cost_increase: 'Creștere Cost',
        };
        return labels[type] || type;
    };
    var getSeverityBadge = function (severity) {
        var badges = {
            critical: { bg: 'danger', label: 'Critic' },
            warning: { bg: 'warning', label: 'Avertisment' },
            info: { bg: 'info', label: 'Informare' },
        };
        var badge = badges[severity] || badges.info;
        return <span className={"badge bg-".concat(badge.bg)}>{badge.label}</span>;
    };
    var filteredAlerts = alerts.filter(function (alert) {
        if (filterType && alert.risk_type !== filterType)
            return false;
        if (filterSeverity && alert.severity !== filterSeverity)
            return false;
        return true;
    });
    var criticalCount = alerts.filter(function (a) { return a.severity === 'critical'; }).length;
    var warningCount = alerts.filter(function (a) { return a.severity === 'warning'; }).length;
    var infoCount = alerts.filter(function (a) { return a.severity === 'info'; }).length;
    return (<SideDrawer_1.SideDrawer open={open} onClose={onClose} title="alerte risc stocuri" width="600px">
      <div className="risk-alerts-drawer">
        {/* Summary */}
        <div className="risk-alerts-summary mb-3">
          <div className="row g-2">
            <div className="col-4">
              <div className="alert alert-danger mb-0 text-center">
                <strong>{criticalCount}</strong>
                <br />
                <small>Critice</small>
              </div>
            </div>
            <div className="col-4">
              <div className="alert alert-warning mb-0 text-center">
                <strong>{warningCount}</strong>
                <br />
                <small>Avertismente</small>
              </div>
            </div>
            <div className="col-4">
              <div className="alert alert-info mb-0 text-center">
                <strong>{infoCount}</strong>
                <br />
                <small>"Informări"</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtre */}
        <div className="risk-alerts-filters mb-3">
          <div className="row g-2">
            <div className="col-6">
              <select className="form-select form-select-sm" value={filterType} onChange={function (e) { return setFilterType(e.target.value); }} title="Filtru tip alertă">
                <option value="">"toate tipurile"</option>
                <option value="negative_stock">Stoc Negativ</option>
                <option value="high_variance">"varianta mare"</option>
                <option value="expiring_soon">Expiră Curând</option>
                <option value="low_turnover">"rotatie scazuta"</option>
                <option value="cost_increase">"crestere cost"</option>
              </select>
            </div>
            <div className="col-6">
              <select className="form-select form-select-sm" value={filterSeverity} onChange={function (e) { return setFilterSeverity(e.target.value); }} title="Filtru severitate">
                <option value="">"toate severitatile"</option>
                <option value="critical">Critic</option>
                <option value="warning">Avertisment</option>
                <option value="info">Informare</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista Alerte */}
        {loading ? (<div className="text-center py-4">
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p className="mt-2">"se incarca alertele"</p>
          </div>) : filteredAlerts.length > 0 ? (<div className="risk-alerts-list">
            {filteredAlerts.map(function (alert) { return (<div key={alert.id} className={"risk-alert-item risk-alert-item--".concat(alert.severity, " mb-3")}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">
                      {alert.ingredient_name}
                      {getSeverityBadge(alert.severity)}
                    </h6>
                    <small className="text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {alert.location}
                    </small>
                  </div>
                  <small className="text-muted">
                    {new Date(alert.last_updated).toLocaleDateString('ro-RO')}
                  </small>
                </div>
                <div className="mb-2">
                  <strong>Tip Risc:</strong> {getRiskTypeLabel(alert.risk_type)}
                </div>
                <div className="mb-2">
                  <strong>Mesaj:</strong> {alert.message}
                </div>
                {alert.risk_type === 'high_variance' || alert.risk_type === 'negative_stock' ? (<div className="row g-2">
                    <div className="col-4">
                      <small className="text-muted">"Așteptat:"</small>
                      <div>{alert.expected_value}</div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Real:</small>
                      <div className={alert.current_value < 0 ? 'text-danger' : ''}>
                        {alert.current_value}
                      </div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">"Varianță:"</small>
                      <div className={alert.variance_percent > 10 || alert.variance_percent < -10
                        ? 'text-danger'
                        : alert.variance_percent > 5 || alert.variance_percent < -5
                            ? 'text-warning'
                            : ''}>
                        {alert.variance_percent > 0 ? '+' : ''}
                        {alert.variance_percent.toFixed(1)}%
                      </div>
                    </div>
                  </div>) : null}
              </div>); })}
          </div>) : (<div className="text-center text-muted py-4">
            <i className="fas fa-check-circle fa-2x mb-2"></i>
            <p>"nu exista alerte de risc pentru filtrele selectate"</p>
          </div>)}
      </div>
    </SideDrawer_1.SideDrawer>);
};
exports.RiskAlertsDrawer = RiskAlertsDrawer;
