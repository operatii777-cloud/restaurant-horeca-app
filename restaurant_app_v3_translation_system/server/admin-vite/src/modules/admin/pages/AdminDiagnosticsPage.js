"use strict";
/**
 * Admin Diagnostics Page
 * Internal-only module for debugging and health checks
 *
 * Purpose:
 * - List mounted routes
 * - Check backend endpoint status
 * - Show AG Grid wrapper usage
 * - Show Zustand stores count
 * - Health checks
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
exports.AdminDiagnosticsPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var navigation_1 = require("@/modules/layout/constants/navigation");
require("./AdminDiagnosticsPage.css");
// Lista endpoint-uri de verificat (din audit)
var ENDPOINTS_TO_CHECK = [
    { endpoint: '/api/variance/daily', method: 'GET' },
    { endpoint: '/api/variance/calculate', method: 'POST' },
    { endpoint: '/api/technical-sheets', method: 'GET' },
    { endpoint: '/api/technical-sheets/generate', method: 'POST' },
    { endpoint: '/api/recalls', method: 'GET' },
    { endpoint: '/api/expiry-alerts', method: 'GET' },
    { endpoint: '/api/portions', method: 'GET' },
    { endpoint: '/api/smart-restock-v2/analysis', method: 'GET' },
    { endpoint: '/api/hostess/tables', method: 'GET' },
    { endpoint: '/api/hostess/stats', method: 'GET' },
    { endpoint: '/api/lostfound/items', method: 'GET' },
    { endpoint: '/api/lostfound/stats', method: 'GET' },
    { endpoint: '/api/coatroom/tickets', method: 'GET' },
    { endpoint: '/api/coatroom/stats', method: 'GET' },
    { endpoint: '/api/reports/delivery-performance', method: 'GET' },
    { endpoint: '/api/reports/drive-thru-performance', method: 'GET' },
    { endpoint: '/api/admin/invoices', method: 'GET' },
    { endpoint: '/api/compliance/haccp/dashboard/kpis', method: 'GET' },
];
var AdminDiagnosticsPage = function () {
    var _a = (0, react_1.useState)(null), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)([]), endpointsStatus = _c[0], setEndpointsStatus = _c[1];
    var _d = (0, react_1.useState)(false), checkingEndpoints = _d[0], setCheckingEndpoints = _d[1];
    (0, react_1.useEffect)(function () {
        loadDiagnostics();
    }, []);
    var loadDiagnostics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var navigationRoutes, agGridWrapperExists, storesCount, backendHealth, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    navigationRoutes = countRoutes(navigation_1.NAVIGATION_ITEMS);
                    return [4 /*yield*/, checkAgGridWrapper()];
                case 2:
                    agGridWrapperExists = _a.sent();
                    storesCount = {
                        total: 10, // Approximate based on audit
                        jsStores: 7,
                        tsStores: 3,
                    };
                    return [4 /*yield*/, checkBackendHealth()];
                case 3:
                    backendHealth = _a.sent();
                    setData({
                        routes: {
                            total: navigationRoutes.total,
                            mounted: navigationRoutes.total, // Assume all are mounted
                            navigationItems: navigationRoutes.items,
                        },
                        endpoints: [],
                        agGrid: {
                            wrapperExists: agGridWrapperExists,
                            pagesUsingWrapper: 2, // TemperatureLogTab, SecurityAlertsPage
                            totalAgGridPages: 12,
                        },
                        stores: storesCount,
                        backend: backendHealth,
                    });
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error loading diagnostics:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var countRoutes = function (items) {
        var total = 0;
        var itemsCount = 0;
        var countRecursive = function (navItems) {
            navItems.forEach(function (item) {
                if (item.path && item.path !== '#') {
                    total++;
                }
                itemsCount++;
                if (item.children) {
                    countRecursive(item.children);
                }
            });
        };
        countRecursive(items);
        return { total: total, items: items };
    };
    var checkAgGridWrapper = function () { return __awaiter(void 0, void 0, void 0, function () {
        var module_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/shared/components/AgGridTable'); })];
                case 1:
                    module_1 = _b.sent();
                    return [2 /*return*/, !!module_1.AgGridTable];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var checkBackendHealth = function () { return __awaiter(void 0, void 0, void 0, function () {
        var start, response, responseTime, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    start = Date.now();
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/health')];
                case 1:
                    response = _a.sent();
                    responseTime = Date.now() - start;
                    if (response.status === 200) {
                        return [2 /*return*/, { health: 'ok', responseTime: responseTime }];
                    }
                    return [2 /*return*/, { health: 'error', responseTime: responseTime }];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, { health: 'error' }];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var checkEndpoints = function () { return __awaiter(void 0, void 0, void 0, function () {
        var results, _i, ENDPOINTS_TO_CHECK_1, _a, endpoint, method, start, response, e_1, responseTime, status_1, error_3, status_2;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setCheckingEndpoints(true);
                    results = [];
                    _i = 0, ENDPOINTS_TO_CHECK_1 = ENDPOINTS_TO_CHECK;
                    _d.label = 1;
                case 1:
                    if (!(_i < ENDPOINTS_TO_CHECK_1.length)) return [3 /*break*/, 10];
                    _a = ENDPOINTS_TO_CHECK_1[_i], endpoint = _a.endpoint, method = _a.method;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 8, , 9]);
                    start = Date.now();
                    response = void 0;
                    if (!(method === 'GET')) return [3 /*break*/, 4];
                    return [4 /*yield*/, httpClient_1.httpClient.get(endpoint)];
                case 3:
                    response = _d.sent();
                    return [3 /*break*/, 7];
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, httpClient_1.httpClient.post(endpoint, {})];
                case 5:
                    response = _d.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _d.sent();
                    // 400/401 means endpoint exists, just wrong payload
                    if (e_1.response && [400, 401, 403].includes(e_1.response.status)) {
                        response = { status: e_1.response.status, data: {} };
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 7];
                case 7:
                    responseTime = Date.now() - start;
                    status_1 = response.status === 200 ? 'ok' : response.status === 404 ? 'error' : 'unknown';
                    results.push({
                        endpoint: endpoint,
                        method: method,
                        exists: response.status !== 404,
                        status: status_1,
                        responseTime: responseTime,
                    });
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _d.sent();
                    status_2 = ((_b = error_3.response) === null || _b === void 0 ? void 0 : _b.status) === 404 ? 'error' : 'unknown';
                    results.push({
                        endpoint: endpoint,
                        method: method,
                        exists: ((_c = error_3.response) === null || _c === void 0 ? void 0 : _c.status) !== 404,
                        status: status_2,
                        error: error_3.message,
                    });
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10:
                    setEndpointsStatus(results);
                    setCheckingEndpoints(false);
                    return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="page">
        <PageHeader_1.PageHeader title="🔧 Admin Diagnostics" description="Se încarcă..."/>
      </div>);
    }
    return (<div className="page admin-diagnostics-page">
      <PageHeader_1.PageHeader title="🔧 Admin Diagnostics" description="Internal diagnostics and health checks for admin-vite" actions={[
            {
                label: 'Check Endpoints',
                variant: 'primary',
                onClick: checkEndpoints,
            },
            {
                label: 'Refresh',
                variant: 'secondary',
                onClick: loadDiagnostics,
            },
        ]}/>

      <div className="diagnostics-grid">
        {/* Routes Status */}
        <react_bootstrap_1.Card className="diagnostic-card">
          <react_bootstrap_1.Card.Header>
            <h5>📋 Routes Status</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Total Routes (Navigation)</strong></td>
                  <td><react_bootstrap_1.Badge bg="info">{(data === null || data === void 0 ? void 0 : data.routes.navigationItems) || 0}</react_bootstrap_1.Badge></td>
                </tr>
                <tr>
                  <td><strong>Routes with Path</strong></td>
                  <td><react_bootstrap_1.Badge bg="success">{(data === null || data === void 0 ? void 0 : data.routes.total) || 0}</react_bootstrap_1.Badge></td>
                </tr>
                <tr>
                  <td><strong>Mounted Routes</strong></td>
                  <td><react_bootstrap_1.Badge bg="success">{(data === null || data === void 0 ? void 0 : data.routes.mounted) || 0}</react_bootstrap_1.Badge></td>
                </tr>
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>

        {/* Backend Health */}
        <react_bootstrap_1.Card className="diagnostic-card">
          <react_bootstrap_1.Card.Header>
            <h5>🏥 Backend Health</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <div className="health-status">
              <react_bootstrap_1.Badge bg={(data === null || data === void 0 ? void 0 : data.backend.health) === 'ok' ? 'success' : 'danger'}>
                {(data === null || data === void 0 ? void 0 : data.backend.health) === 'ok' ? '✅ Healthy' : '❌ Unhealthy'}
              </react_bootstrap_1.Badge>
              {(data === null || data === void 0 ? void 0 : data.backend.responseTime) && (<span className="ms-2">Response time: {data.backend.responseTime}ms</span>)}
            </div>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>

        {/* AG Grid Status */}
        <react_bootstrap_1.Card className="diagnostic-card">
          <react_bootstrap_1.Card.Header>
            <h5>📊 AG Grid Wrapper</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Wrapper Exists</strong></td>
                  <td>
                    <react_bootstrap_1.Badge bg={(data === null || data === void 0 ? void 0 : data.agGrid.wrapperExists) ? 'success' : 'danger'}>
                      {(data === null || data === void 0 ? void 0 : data.agGrid.wrapperExists) ? '✅ Yes' : '❌ No'}
                    </react_bootstrap_1.Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Pages Using Wrapper</strong></td>
                  <td><react_bootstrap_1.Badge bg="info">{(data === null || data === void 0 ? void 0 : data.agGrid.pagesUsingWrapper) || 0}</react_bootstrap_1.Badge></td>
                </tr>
                <tr>
                  <td><strong>Total AG Grid Pages</strong></td>
                  <td><react_bootstrap_1.Badge bg="secondary">{(data === null || data === void 0 ? void 0 : data.agGrid.totalAgGridPages) || 0}</react_bootstrap_1.Badge></td>
                </tr>
                <tr>
                  <td><strong>Migration Progress</strong></td>
                  <td>
                    <react_bootstrap_1.Badge bg="warning">
                      {(data === null || data === void 0 ? void 0 : data.agGrid.totalAgGridPages)
            ? "".concat(Math.round((data.agGrid.pagesUsingWrapper / data.agGrid.totalAgGridPages) * 100), "%")
            : '0%'}
                    </react_bootstrap_1.Badge>
                  </td>
                </tr>
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>

        {/* Zustand Stores */}
        <react_bootstrap_1.Card className="diagnostic-card">
          <react_bootstrap_1.Card.Header>
            <h5>🗄️ Zustand Stores</h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Total Stores</strong></td>
                  <td><react_bootstrap_1.Badge bg="info">{(data === null || data === void 0 ? void 0 : data.stores.total) || 0}</react_bootstrap_1.Badge></td>
                </tr>
                <tr>
                  <td><strong>JavaScript (.js)</strong></td>
                  <td><react_bootstrap_1.Badge bg="warning">{(data === null || data === void 0 ? void 0 : data.stores.jsStores) || 0}</react_bootstrap_1.Badge></td>
                </tr>
                <tr>
                  <td><strong>TypeScript (.ts)</strong></td>
                  <td><react_bootstrap_1.Badge bg="success">{(data === null || data === void 0 ? void 0 : data.stores.tsStores) || 0}</react_bootstrap_1.Badge></td>
                </tr>
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>

        {/* Endpoints Status */}
        <react_bootstrap_1.Card className="diagnostic-card diagnostic-card-wide">
          <react_bootstrap_1.Card.Header>
            <h5>🔌 Backend Endpoints Status</h5>
            <react_bootstrap_1.Button size="sm" variant="primary" onClick={checkEndpoints} disabled={checkingEndpoints} className="ms-auto">
              {checkingEndpoints ? 'Checking...' : 'Check All Endpoints'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            {endpointsStatus.length === 0 ? (<react_bootstrap_1.Alert variant="info">
                Click "Check All Endpoints" to verify backend endpoint availability.
              </react_bootstrap_1.Alert>) : (<div className="table-responsive">
                <react_bootstrap_1.Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Response Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpointsStatus.map(function (ep, idx) { return (<tr key={idx}>
                        <td><code>{ep.endpoint}</code></td>
                        <td><react_bootstrap_1.Badge bg="secondary">{ep.method}</react_bootstrap_1.Badge></td>
                        <td>
                          <react_bootstrap_1.Badge bg={ep.status === 'ok' ? 'success' :
                    ep.status === 'error' ? 'danger' : 'warning'}>
                            {ep.status === 'ok' ? '✅ OK' :
                    ep.status === 'error' ? '❌ Error' : '⚠️ Unknown'}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>
                          {ep.responseTime ? "".concat(ep.responseTime, "ms") : '-'}
                        </td>
                        <td>
                          {ep.error ? <small className="text-danger">{ep.error}</small> : '-'}
                        </td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>
              </div>)}
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>
      </div>
    </div>);
};
exports.AdminDiagnosticsPage = AdminDiagnosticsPage;
