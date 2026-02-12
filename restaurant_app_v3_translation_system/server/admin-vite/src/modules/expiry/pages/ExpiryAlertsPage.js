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
exports.ExpiryAlertsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var ExpiryAlertsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), alerts = _a[0], setAlerts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        loadAlerts();
        var interval = setInterval(loadAlerts, 60000); // Refresh every minute
        return function () { return clearInterval(interval); };
    }, []);
    var loadAlerts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/expiry-alerts')];
                case 1:
                    response = _b.sent();
                    setAlerts(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error loading expiry alerts:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getAlertBadge = function (level) {
        var variants = {
            'green': 'success',
            'yellow': 'warning',
            'orange': 'warning',
            'red': 'danger',
            'expired': 'dark'
        };
        return <react_bootstrap_1.Badge bg={variants[level]}>{level.toUpperCase()}</react_bootstrap_1.Badge>;
    };
    var markResolved = function (alertId, resolutionType) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/expiry-alerts/".concat(alertId, "/resolve"), {
                            resolution_type: resolutionType
                        })];
                case 1:
                    _a.sent();
                    loadAlerts();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error resolving alert:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="expiry-alerts-page page">
      <PageHeader_1.PageHeader title="Alerte Expirare (FEFO)" subtitle="Monitorizare expirări și FEFO (First Expired First Out)"/>

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>Alerte Active</h5>
            <react_bootstrap_1.Button variant="primary" onClick={loadAlerts}>
              <i className="fas fa-sync me-2"></i>
              Refresh
            </react_bootstrap_1.Button>
          </div>

          {alerts.length === 0 ? (<react_bootstrap_1.Alert variant="success">
              ✓ Nu există alerte de expirare!
            </react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped bordered hover>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Lot</th>
                  <th>Expirare</th>
                  <th>"zile ramase"</th>
                  <th>Alert</th>
                  <th>Cantitate</th>
                  <th>Valoare</th>
                  <th>Locație</th>
                  <th>Acțiune</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(function (alert) {
                var _a;
                return (<tr key={alert.id} className={alert.alert_level === 'red' ? 'table-danger' : ''}>
                    <td><strong>{alert.ingredient_name}</strong></td>
                    <td>{alert.batch_number}</td>
                    <td>{new Date(alert.expiry_date).toLocaleDateString('ro-RO')}</td>
                    <td>
                      <react_bootstrap_1.Badge bg={alert.days_until_expiry < 0 ? 'dark' : alert.days_until_expiry <= 1 ? 'danger' : 'warning'}>
                        {alert.days_until_expiry} zile
                      </react_bootstrap_1.Badge>
                    </td>
                    <td>{getAlertBadge(alert.alert_level)}</td>
                    <td>{alert.remaining_quantity} {alert.unit}</td>
                    <td>{(_a = alert.value_at_risk) === null || _a === void 0 ? void 0 : _a.toFixed(2)} RON</td>
                    <td>{alert.location_name}</td>
                    <td className="small">{alert.action_recommended}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <react_bootstrap_1.Button size="sm" variant="success" onClick={function () { return markResolved(alert.id, 'used'); }}>
                          ✓ Folosit
                        </react_bootstrap_1.Button>
                        <react_bootstrap_1.Button size="sm" variant="danger" onClick={function () { return markResolved(alert.id, 'discarded'); }}>
                          🗑️ Aruncat
                        </react_bootstrap_1.Button>
                      </div>
                    </td>
                  </tr>);
            })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.ExpiryAlertsPage = ExpiryAlertsPage;
