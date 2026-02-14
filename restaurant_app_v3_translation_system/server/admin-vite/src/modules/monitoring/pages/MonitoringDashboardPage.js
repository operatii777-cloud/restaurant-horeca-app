"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MONITORING DASHBOARD PAGE
 *
 * Dashboard pentru monitoring sistem (uptime, memory, database, performance)
 * ═══════════════════════════════════════════════════════════════════════════
 */
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
exports.MonitoringDashboardPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var monitoringApi_1 = require("../api/monitoringApi");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./MonitoringDashboardPage.css");
var MonitoringDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), health = _b[0], setHealth = _b[1];
    var _c = (0, react_1.useState)([]), alerts = _c[0], setAlerts = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), refreshInterval = _e[0], setRefreshInterval = _e[1];
    (0, react_1.useEffect)(function () {
        loadData();
        // Auto-refresh every 30 seconds
        var interval = setInterval(function () {
            loadData();
        }, 30 * 1000);
        setRefreshInterval(interval);
        return function () {
            if (interval)
                clearInterval(interval);
        };
    }, []);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, healthResponse, alertsResponse, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setError(null);
                    return [4 /*yield*/, Promise.all([
                            monitoringApi_1.monitoringApi.getHealth(),
                            monitoringApi_1.monitoringApi.getAlerts(),
                        ])];
                case 1:
                    _a = _b.sent(), healthResponse = _a[0], alertsResponse = _a[1];
                    if (healthResponse.data.success) {
                        setHealth(healthResponse.data.data);
                    }
                    if (alertsResponse.data.success) {
                        setAlerts(alertsResponse.data.alerts);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _b.sent();
                    console.error('Error loading monitoring data:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea datelor de monitoring');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatBytes = function (bytes) {
        if (bytes === 0)
            return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return "".concat(parseFloat((bytes / Math.pow(k, i)).toFixed(2)), " ").concat(sizes[i]);
    };
    var getStatusVariant = function (status) {
        if (status === 'ok' || status === 'healthy')
            return 'success';
        if (status === 'warning' || status === 'slow')
            return 'warning';
        return 'danger';
    };
    var getStatusBadge = function (status) {
        var variant = getStatusVariant(status);
        var label = status === 'ok' ? 'OK' : status === 'healthy' ? 'Healthy' : status.toUpperCase();
        return <react_bootstrap_1.Badge bg={variant}>{label}</react_bootstrap_1.Badge>;
    };
    if (loading && !health) {
        return (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <react_bootstrap_1.Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </react_bootstrap_1.Spinner>
      </div>);
    }
    if (error && !health) {
        return (<div className="alert alert-danger">
        <h4>Eroare</h4>
        <p>{error}</p>
        <react_bootstrap_1.Button onClick={loadData}>Reîncarcă</react_bootstrap_1.Button>
      </div>);
    }
    if (!health)
        return null;
    return (<div className="monitoring-dashboard-page">
      <PageHeader_1.PageHeader title="Dashboard Monitorizare și Performanță" subtitle="Prezentare generală, metrici de performanță și stare sistem"/>

      {/* Overall Status */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">
            Prezentare Generală
            {getStatusBadge(health.status)}
          </h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Timp de funcționare</h6>
                <h4>{health.uptime.formatted}</h4>
                <small className="text-muted">
                  {health.uptime.days} zile, {health.uptime.hours % 24} ore
                </small>
              </div>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Memorie utilizată</h6>
                <h4>{health.memory.usage_percent.toFixed(1)}%</h4>
                <react_bootstrap_1.ProgressBar now={health.memory.usage_percent} variant={getStatusVariant(health.memory.status)} className="mt-2"/>
                <small className="text-muted">
                  {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
                </small>
              </div>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Bază de date</h6>
                <h4>{health.database.response_time_ms}ms</h4>
                {getStatusBadge(health.database.status_level)}
                <small className="text-muted d-block mt-1">
                  {health.database.table_count} tabele
                </small>
              </div>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <div className="status-item">
                <h6 className="text-muted">Performanță sistem</h6>
                <h4>{health.performance.avg_response_time}ms</h4>
                {getStatusBadge(health.performance.status)}
                <small className="text-muted d-block mt-1">
                  {health.performance.sample_count} sample-uri
                </small>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Detailed Metrics */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Detalii memorie</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover size="sm">
                <tbody>
                  <tr>
                    <td><strong>Totală</strong></td>
                    <td>{formatBytes(health.memory.total)}</td>
                  </tr>
                  <tr>
                    <td><strong>Folosit</strong></td>
                    <td>{formatBytes(health.memory.used)}</td>
                  </tr>
                  <tr>
                    <td><strong>Liber</strong></td>
                    <td>{formatBytes(health.memory.free)}</td>
                  </tr>
                  <tr>
                    <td><strong>Utilizare</strong></td>
                    <td>
                      <react_bootstrap_1.ProgressBar now={health.memory.usage_percent} variant={getStatusVariant(health.memory.status)} label={"".concat(health.memory.usage_percent.toFixed(1), "%")}/>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(health.memory.status)}</td>
                  </tr>
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Detalii bază de date</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover size="sm">
                <tbody>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(health.database.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Timp de Răspuns</strong></td>
                    <td>{health.database.response_time_ms}ms</td>
                  </tr>
                  <tr>
                    <td><strong>Număr Tabele</strong></td>
                    <td>{health.database.table_count}</td>
                  </tr>
                  <tr>
                    <td><strong>Nivel Status</strong></td>
                    <td>{getStatusBadge(health.database.status_level)}</td>
                  </tr>
                  {health.database.error && (<tr>
                      <td colSpan={2} className="text-danger">
                        <small>{health.database.error}</small>
                      </td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Performance Metrics */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={12}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Metrici performanță</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover>
                <thead>
                  <tr>
                    <th>Metrică</th>
                    <th>Valoare</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Timp mediu de răspuns</strong></td>
                    <td>{health.performance.avg_response_time}ms</td>
                    <td>{health.performance.min_response_time}ms</td>
                    <td>{health.performance.max_response_time}ms</td>
                    <td>{getStatusBadge(health.performance.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Număr probe</strong></td>
                    <td colSpan={3}>{health.performance.sample_count}</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Monitoring Alerts */}
      {alerts.length > 0 && (<react_bootstrap_1.Card>
          <react_bootstrap_1.Card.Header>
            <h5 className="mb-0">
              Monitor coadă
              <react_bootstrap_1.Badge bg="warning" className="ms-2">{alerts.length}</react_bootstrap_1.Badge>
            </h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped hover size="sm">
              <thead>
                <tr>
                  <th>Severitate</th>
                  <th>Tip</th>
                  <th>Mesaj</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(function (alert, index) { return (<tr key={index}>
                    <td>
                      <react_bootstrap_1.Badge bg={getStatusVariant(alert.severity.toLowerCase())}>
                        {alert.severity}
                      </react_bootstrap_1.Badge>
                    </td>
                    <td>{alert.type}</td>
                    <td>{alert.message}</td>
                    <td>{new Date(alert.timestamp).toLocaleString('ro-RO')}</td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* Refresh Button */}
      <div className="text-center mt-4">
        <react_bootstrap_1.Button onClick={loadData} disabled={loading}>
          {loading ? (<>
              <react_bootstrap_1.Spinner size="sm" className="me-2"/>Se încarcă...</>) : ('Reîncarcă datele')}
        </react_bootstrap_1.Button>
        <small className="d-block text-muted mt-2">
          Actualizare automată la fiecare 30 de secunde
        </small>
      </div>
    </div>);
};
exports.MonitoringDashboardPage = MonitoringDashboardPage;
