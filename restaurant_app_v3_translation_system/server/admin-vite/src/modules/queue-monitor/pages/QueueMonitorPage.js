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
exports.default = QueueMonitorPage;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./QueueMonitorPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
function QueueMonitorPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var loadQueueMonitor = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    setError(null);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/queue/monitor')];
                case 1:
                    response = _c.sent();
                    setData(response.data);
                    setLoading(false);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _c.sent();
                    console.error('❌ Eroare la încărcarea Queue Monitor:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Eroare la încărcarea datelor');
                    setLoading(false);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadQueueMonitor();
        var interval = setInterval(loadQueueMonitor, 3000); // Auto-refresh every 3 seconds
        return function () { return clearInterval(interval); };
    }, []);
    var getTimeAgo = function (timestamp) {
        var now = Date.now();
        var diff = now - timestamp;
        var seconds = Math.floor(diff / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        if (hours > 0)
            return "".concat(hours, "o");
        if (minutes > 0)
            return "".concat(minutes, "m");
        return "".concat(seconds, "s");
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString('ro-RO');
    };
    if (loading && !data) {
        return (<div className="queue-monitor-page">
        <PageHeader_1.PageHeader title='📊 monitor coada' description="Monitorizare coadă comenzi și job-uri"/>
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">Se încarcă datele...</p>
        </div>
      </div>);
    }
    if (error && !data) {
        return (<div className="queue-monitor-page">
        <PageHeader_1.PageHeader title='📊 monitor coada' description="Monitorizare coadă comenzi și job-uri"/>
        <react_bootstrap_1.Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <react_bootstrap_1.Button variant="outline-danger" size="sm" className="ms-3" onClick={loadQueueMonitor}>
            <i className="fas fa-redo me-1"></i>Reîncearcă</react_bootstrap_1.Button>
        </react_bootstrap_1.Alert>
      </div>);
    }
    var queueType = (data === null || data === void 0 ? void 0 : data.queueType) || 'none';
    var stats = data === null || data === void 0 ? void 0 : data.stats;
    var queueItems = (data === null || data === void 0 ? void 0 : data.queueItems) || [];
    var failedJobs = (data === null || data === void 0 ? void 0 : data.failedJobs) || [];
    // Calculate metrics
    var queueSize = (stats === null || stats === void 0 ? void 0 : stats.currentQueueSize) || 0;
    var processed = (stats === null || stats === void 0 ? void 0 : stats.processed) || 0;
    var failed = (stats === null || stats === void 0 ? void 0 : stats.failed) || 0;
    var avgTime = (stats === null || stats === void 0 ? void 0 : stats.avgProcessingTime) || 0;
    var retries = (stats === null || stats === void 0 ? void 0 : stats.retried) || 0;
    var todayTotal = (stats === null || stats === void 0 ? void 0 : stats.todayTotal) || processed + failed;
    var successRate = todayTotal > 0 ? ((processed / todayTotal) * 100).toFixed(1) : 100;
    var throughput = todayTotal > 0 ? Math.round(todayTotal / (new Date().getHours() + 1)) : 0;
    var queueLoad = ((queueSize / 1000) * 100).toFixed(1);
    // Chart data for orders by status
    var ordersByStatus = (stats === null || stats === void 0 ? void 0 : stats.ordersByStatus) || {};
    var chartData = {
        labels: ['Pending', 'Processing', 'Completed', 'Failed'],
        datasets: [
            {
                label: 'Comenzi',
                data: [
                    ordersByStatus.pending || 0,
                    ordersByStatus.processing || 0,
                    ordersByStatus.completed || 0,
                    ordersByStatus.failed || 0,
                ],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    var getQueueStatus = function () {
        if (queueType === 'memory') {
            return { text: 'Active (In-Memory)', icon: 'fas fa-check-circle', color: 'text-success' };
        }
        else if (queueType === 'redis') {
            return { text: 'Active (Redis)', icon: 'fas fa-check-circle', color: 'text-success' };
        }
        else {
            return { text: 'No queue active', icon: 'fas fa-times-circle', color: 'text-danger' };
        }
    };
    var status = getQueueStatus();
    return (<div className="queue-monitor-page">
      <PageHeader_1.PageHeader title='📊 monitor coada' description="Monitorizare coadă comenzi și job-uri în timp real"/>

      {error && (<react_bootstrap_1.Alert variant="warning" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Status Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white" style={{ background: 'linear-gradient(45deg, #6a11cb, #2575fc)' }}>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queueType === 'none' ? 'Disabled' : 'Queue'}</h4>
                  <small>Queue System</small>
                </div>
                <i className="fas fa-layer-group fa-2x"></i>
              </div>
              <small className={"mt-2 d-block ".concat(status.color)}>
                <i className={"".concat(status.icon, " me-1")}></i>
                {status.text}
              </small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white bg-warning">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queueSize}</h4>
                  <small>În Coadă</small>
                </div>
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Comenzi în așteptare</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white bg-success">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{processed}</h4>
                  <small>Procesate astazi</small>
                </div>
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">~{avgTime}ms avg</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="metric-card text-white bg-danger">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{failed}</h4>
                  <small>Failed</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Necesită atenție</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Main Content */}
      <react_bootstrap_1.Row>
        {/* Queue Items (Live) */}
        <react_bootstrap_1.Col md={7}>
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-tasks me-1"></i> Comenzi în Coadă (Live)
              </h5>
              <react_bootstrap_1.Badge bg="primary">{queueItems.length}</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body style={{ maxHeight: '400px', overflowY: "Auto" }}>
              {queueItems.length === 0 ? (<div className="text-center text-muted py-4">
                  <i className="fas fa-inbox fa-3x mb-2"></i>
                  <p>Coada este goală</p>
                </div>) : (<react_bootstrap_1.Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>ID Comandă</th>
                      <th>Timp</th>
                      <th>Retries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.map(function (item) { return (<tr key={item.id}>
                        <td>
                          <react_bootstrap_1.Badge bg={item.status === 'processing' ? 'warning' : 'secondary'}>
                            {item.status}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td><strong>#{item.orderId}</strong></td>
                        <td>{getTimeAgo(item.addedAt)} ago</td>
                        <td>{item.retries || 0}/3</td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Card.Footer className="text-end">
              <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={loadQueueMonitor}>
                <i className="fas fa-sync-alt me-1"></i>Reîmprospătează</react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Footer>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        {/* Failed Jobs */}
        <react_bootstrap_1.Col md={5}>
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-exclamation-circle me-1"></i> Failed Jobs
              </h5>
              <react_bootstrap_1.Badge bg="danger">{failedJobs.length}</react_bootstrap_1.Badge>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body style={{ maxHeight: '400px', overflowY: "Auto" }}>
              {failedJobs.length === 0 ? (<div className="text-center text-success py-4">
                  <i className="fas fa-check-circle fa-3x mb-2"></i>
                  <p>Niciun job eșuat</p>
                </div>) : (<div className="list-group">
                  {failedJobs.map(function (job) { return (<div key={job.jobId} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Comanda #{job.orderId}</h6>
                          <p className="mb-1 text-danger small">{job.error}</p>
                          <small className="text-muted">{formatDate(job.failedAt)}</small>
                        </div>
                        <react_bootstrap_1.Badge bg="warning">Reîncercări: {job.retries}</react_bootstrap_1.Badge>
                      </div>
                    </div>); })}
                </div>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Charts and Performance Metrics */}
      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-1"></i> Comenzi pe Status (Astăzi)
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div style={{ height: '300px' }}>
                <react_chartjs_2_1.Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }}/>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-tachometer-alt me-1"></i>Performance Metrics</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Row className="text-center">
                <react_bootstrap_1.Col md={6} className="mb-3">
                  <h6 className="text-muted">Throughput</h6>
                  <h3 className="text-primary">{throughput}</h3>
                  <small>comenzi/oră</small>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6} className="mb-3">
                  <h6 className="text-muted">Success Rate</h6>
                  <h3 className="text-success">{successRate}%</h3>
                  <small>procesate cu succes</small>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <h6 className="text-muted">Retries</h6>
                  <h3 className="text-warning">{retries}</h3>
                  <small>reîncercări totale</small>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <h6 className="text-muted">Queue Load</h6>
                  <h3 className="text-info">{queueLoad}%</h3>
                  <small>capacitate utilizată</small>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Auto-refresh indicator */}
      <div className="text-center text-muted mt-4">
        <i className="fas fa-sync-alt me-2"></i>
        Actualizare automată la fiecare 3 secunde
      </div>
    </div>);
}
