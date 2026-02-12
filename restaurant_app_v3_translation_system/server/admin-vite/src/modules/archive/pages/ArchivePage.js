"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ArchivePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var OrdersArchivePanel_1 = require("@/modules/orders/components/OrdersArchivePanel");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./ArchivePage.css");
var ArchivePage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)([]), automationRules = _c[0], setAutomationRules = _c[1];
    var _d = (0, react_1.useState)(null), feedback = _d[0], setFeedback = _d[1];
    var _e = (0, react_1.useState)('archive'), activeTab = _e[0], setActiveTab = _e[1];
    (0, react_1.useEffect)(function () {
        loadArchiveStats();
        loadAutomationRules();
    }, []);
    var loadArchiveStats = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/archive-stats')];
                case 2:
                    response = _a.sent();
                    // Endpointul returnează: { activeOrders, archivedOrders, oldestArchive, totalSize }
                    if (response.data) {
                        data = response.data;
                        setStats({
                            total_archived_orders: data.archivedOrders || 0,
                            total_archived_revenue: 0, // Nu este disponibil în endpoint
                            oldest_archived_date: data.oldestArchive || null,
                            newest_archived_date: null, // Nu este disponibil în endpoint
                            archived_orders_by_month: [], // Nu este disponibil în endpoint
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading archive stats:', error_1);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea statisticilor arhivă. Asigură-te că serverul rulează.' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadAutomationRules = function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockRules;
        return __generator(this, function (_a) {
            try {
                mockRules = [
                    {
                        id: 1,
                        name: 'Arhivare Automată Comenzi',
                        type: 'archive',
                        schedule: 'Lunar (la sfârșitul lunii)',
                        enabled: true,
                        last_run: '2025-10-31',
                        next_run: '2025-11-30',
                    },
                    {
                        id: 2,
                        name: 'Backup Automat Baza de Date',
                        type: 'backup',
                        schedule: 'Zilnic (02:00)',
                        enabled: true,
                        last_run: '2025-11-21',
                        next_run: '2025-11-22',
                    },
                    {
                        id: 3,
                        name: 'Curățare Log-uri Vechi',
                        type: 'cleanup',
                        schedule: 'Săptămânal (Duminică 03:00)',
                        enabled: false,
                        last_run: '2025-11-17',
                        next_run: '2025-11-24',
                    },
                ];
                setAutomationRules(mockRules);
            }
            catch (error) {
                console.error('Error loading automation rules:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleArchiveOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!confirm('Sigur doriți să arhivați comenzile vechi? Această acțiune nu poate fi anulată.')) {
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/archive-orders')];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setFeedback({ type: 'success', message: 'Comenzile au fost arhivate cu succes!' });
                        loadArchiveStats();
                    }
                    else {
                        setFeedback({ type: 'error', message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la arhivare' });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _e.sent();
                    console.error('Error archiving orders:', error_2);
                    setFeedback({ type: 'error', message: ((_d = (_c = error_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la arhivarea comenzilor' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var toggleAutomationRule = function (ruleId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setAutomationRules(function (prev) {
                return prev.map(function (rule) { return (rule.id === ruleId ? __assign(__assign({}, rule), { enabled: !rule.enabled }) : rule); });
            });
            // Aici ar trebui să fie un API call pentru a actualiza regula
            setFeedback({ type: 'info', message: 'Regula de automatizare a fost actualizată' });
            return [2 /*return*/];
        });
    }); };
    var formatCurrency = function (value) {
        return "".concat(value.toFixed(2), " RON");
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('ro-RO');
    };
    return (<div className="archive-page">
      <PageHeader_1.PageHeader title='📦 arhiva & automatizari' description="Gestionare arhivă comenzi și automatizări sistem"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'} dismissible onClose={function () { return setFeedback(null); }} className="mt-3">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      {/* Statistics */}
      {stats && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Total Comenzi Arhivate</h6>
                <h4>{stats.total_archived_orders || 0}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>Venituri Arhivate</h6>
                <h4>{formatCurrency(stats.total_archived_revenue || 0)}</h4>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>"cea mai veche comanda"</h6>
                <h6 className="text-muted">
                  {stats.oldest_archived_date ? formatDate(stats.oldest_archived_date) : '"”'}
                </h6>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center">
              <react_bootstrap_1.Card.Body>
                <h6>"cea mai recenta comanda"</h6>
                <h6 className="text-muted">
                  {stats.newest_archived_date ? formatDate(stats.newest_archived_date) : '"”'}
                </h6>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Tabs */}
      <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
        <react_bootstrap_1.Tab eventKey="archive" title='📦 arhiva comenzi'>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Arhivă Comenzi</h5>
              <react_bootstrap_1.Button variant="warning" onClick={handleArchiveOrders} disabled={loading}>
                <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-archive', " me-2")}></i>
                {loading ? 'Se arhivează...' : 'Arhivează Comenzi Vechi'}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <OrdersArchivePanel_1.OrdersArchivePanel onFeedback={function (message, type) { return setFeedback({ type: type, message: message }); }}/>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="automations" title='âš™ï¸ automatizari'>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"reguli automatizare"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Alert variant="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>"automatizarile va permit sa programati actiuni per"</react_bootstrap_1.Alert>

              {automationRules.length === 0 ? (<react_bootstrap_1.Alert variant="info">"nu exista reguli de automatizare configurate"</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Tip</th>
                      <th>Programare</th>
                      <th>"ultima executie"</th>
                      <th>"urmatoarea executie"</th>
                      <th>Status</th>
                      <th>"Acțiuni"</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationRules.map(function (rule) { return (<tr key={rule.id}>
                        <td><strong>{rule.name}</strong></td>
                        <td>
                          <react_bootstrap_1.Badge bg={rule.type === 'archive' ? 'primary' : rule.type === 'backup' ? 'success' : 'info'}>
                            {rule.type === 'archive' ? 'Arhivare' : rule.type === 'backup' ? 'Backup' : 'Curățare'}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>{rule.schedule}</td>
                        <td>{rule.last_run ? formatDate(rule.last_run) : 'Niciodată'}</td>
                        <td>{rule.next_run ? formatDate(rule.next_run) : '"”'}</td>
                        <td>
                          <react_bootstrap_1.Badge bg={rule.enabled ? 'success' : 'secondary'}>
                            {rule.enabled ? 'Activ' : 'Inactiv'}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>
                          <react_bootstrap_1.Button variant={rule.enabled ? 'warning' : 'success'} size="sm" onClick={function () { return toggleAutomationRule(rule.id); }}>
                            <i className={"fas fa-".concat(rule.enabled ? 'pause' : 'play', " me-1")}></i>
                            {rule.enabled ? 'Dezactivează' : 'Activează'}
                          </react_bootstrap_1.Button>
                        </td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>

        <react_bootstrap_1.Tab eventKey="statistics" title="📊 Statistici">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">"statistici arhiva pe luna"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : (stats === null || stats === void 0 ? void 0 : stats.archived_orders_by_month) && stats.archived_orders_by_month.length > 0 ? (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>"Lună"</th>
                      <th>"numar comenzi"</th>
                      <th>Venituri</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.archived_orders_by_month.map(function (month, index) { return (<tr key={index}>
                        <td><strong>{month.month}</strong></td>
                        <td>{month.count}</td>
                        <td><strong>{formatCurrency(month.revenue)}</strong></td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>) : (<react_bootstrap_1.Alert variant="info">"nu exista date pentru statistici"</react_bootstrap_1.Alert>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Tab>
      </react_bootstrap_1.Tabs>
    </div>);
};
exports.ArchivePage = ArchivePage;
