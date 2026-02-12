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
exports.FeedbackPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FeedbackPage.css");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.LineElement, chart_js_1.PointElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var FeedbackPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    //   const { t } = useTranslation();
    var _j = (0, react_1.useState)([]), feedbacks = _j[0], setFeedbacks = _j[1];
    var _k = (0, react_1.useState)(null), stats = _k[0], setStats = _k[1];
    var _l = (0, react_1.useState)(true), loading = _l[0], setLoading = _l[1];
    var _m = (0, react_1.useState)(null), error = _m[0], setError = _m[1];
    var _o = (0, react_1.useState)({
        rating: '',
        period: 'overall',
        limit: 100,
    }), filters = _o[0], setFilters = _o[1];
    var _p = (0, react_1.useState)(null), selectedFeedback = _p[0], setSelectedFeedback = _p[1];
    var _q = (0, react_1.useState)(false), showDetailsModal = _q[0], setShowDetailsModal = _q[1];
    var ratingDistChartRef = (0, react_1.useRef)(null);
    var ratingTrendChartRef = (0, react_1.useRef)(null);
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, data, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    params = {
                        limit: filters.limit,
                        period: filters.period,
                    };
                    if (filters.rating)
                        params.rating = parseInt(filters.rating);
                    return [4 /*yield*/, fetch("/api/feedback/recent?".concat(new URLSearchParams(params).toString()))];
                case 2:
                    response = _c.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _c.sent();
                    if (data.success !== false) {
                        setFeedbacks(data.recentFeedback || []);
                        setStats(data);
                    }
                    else {
                        setError('Eroare la încărcarea datelor');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _c.sent();
                    console.error('❌ Eroare la încărcarea feedback-urilor:', err_1);
                    setError(((_b = (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [filters]);
    (0, react_1.useEffect)(function () {
        void loadData();
    }, [loadData]);
    var getRatingBadge = function (rating) {
        var colors = {
            5: 'success',
            4: 'info',
            3: 'warning',
            2: 'danger',
            1: 'danger',
        };
        return colors[rating] || 'secondary';
    };
    var getRatingStars = function (rating) {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };
    var changePeriod = function (period) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { period: period })); });
    };
    var filterByRating = function (rating) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { rating: rating === 'all' ? '' : String(rating) })); });
    };
    var viewFeedbackDetails = function (feedback) {
        setSelectedFeedback({
            id: feedback.id,
            orderId: feedback.order_id || 0,
            client: feedback.customer_token || 'N/A',
            table: 'N/A', // table_number nu este în tipul Feedback
            rating: feedback.rating,
            comment: feedback.comment || 'Fără comentariu',
            date: new Date(feedback.timestamp).toLocaleString('ro-RO'),
        });
        setShowDetailsModal(true);
    };
    // Chart data pentru distribuție rating-uri
    var ratingDistributionData = stats ? {
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [
            {
                label: 'Număr Feedback-uri',
                data: [
                    ((_a = stats.ratingDistribution) === null || _a === void 0 ? void 0 : _a[1]) || 0,
                    ((_b = stats.ratingDistribution) === null || _b === void 0 ? void 0 : _b[2]) || 0,
                    ((_c = stats.ratingDistribution) === null || _c === void 0 ? void 0 : _c[3]) || 0,
                    ((_d = stats.ratingDistribution) === null || _d === void 0 ? void 0 : _d[4]) || 0,
                    ((_e = stats.ratingDistribution) === null || _e === void 0 ? void 0 : _e[5]) || 0,
                ],
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(253, 126, 20, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(23, 162, 184, 0.8)',
                ],
            },
        ],
    } : null;
    // Chart data pentru trend (placeholder - ar trebui să fie date reale pentru ultimele 7 zile)
    var ratingTrendData = {
        labels: ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'],
        datasets: [
            {
                label: 'Rating Mediu',
                data: [4.2, 4.5, 4.3, 4.6, 4.4, 4.7, 4.5],
                borderColor: 'rgba(23, 162, 184, 1)',
                backgroundColor: 'rgba(23, 162, 184, 0.2)',
                tension: 0.4,
            },
        ],
    };
    var periodLabels = {
        today: 'Astăzi',
        week: 'Săptămâna aceasta',
        month: 'Luna aceasta',
        quarter: 'Trimestru',
        semester: 'Semestru',
        year: 'An',
        overall: 'Toate timpurile',
    };
    var periodLabel = periodLabels[filters.period] || 'Toate timpurile';
    var lowRatings = stats ? (((_f = stats.ratingDistribution) === null || _f === void 0 ? void 0 : _f[1]) || 0) + (((_g = stats.ratingDistribution) === null || _g === void 0 ? void 0 : _g[2]) || 0) : 0;
    var excellentRatings = stats ? ((_h = stats.ratingDistribution) === null || _h === void 0 ? void 0 : _h[5]) || 0 : 0;
    if (loading) {
        return (<div className="feedback-page">
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">Se încarcă feedback-urile...</p>
        </div>
      </div>);
    }
    return (<div className="feedback-page" data-page-ready="true">
      <PageHeader_1.PageHeader title="Feedback Clienți" description="Vizualizează și analizează feedback-urile clienților." actions={[
            {
                label: '↻ Reîncarcă',
                variant: 'secondary',
                onClick: function () { return void loadData(); },
            },
        ]}/>

      {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

      {/* Statistici Rapide */}
      <div className="row mb-4">
        <div className="col-md-3">
          <react_bootstrap_1.Card className="metric-card text-white bg-warning">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{(stats === null || stats === void 0 ? void 0 : stats.total) || 0}</h4>
                  <small>Feedback-uri ({periodLabel})</small>
                </div>
                <i className="fas fa-comment-dots fa-2x text-warning"></i>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="metric-card text-white bg-success">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{((stats === null || stats === void 0 ? void 0 : stats.averageRating) || 0).toFixed(1)}★</h4>
                  <small>Rating Mediu ({periodLabel})</small>
                </div>
                <i className="fas fa-star fa-2x" style={{ color: '#ffd700' }}></i>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="metric-card text-white bg-danger">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{lowRatings}</h4>
                  <small>Rating-uri Scăzute (≤2★)</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="metric-card text-white bg-info">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{excellentRatings}</h4>
                  <small>Rating-uri Excelente (5★)</small>
                </div>
                <i className="fas fa-heart fa-2x" style={{ color: '#ff69b4' }}></i>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      {/* Grafice */}
      <div className="row mb-4">
        <div className="col-md-6">
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-primary text-white">
              <i className="fas fa-chart-bar me-1"></i> Distribuție Rating-uri ({periodLabel})
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {ratingDistributionData && (<react_chartjs_2_1.Bar data={ratingDistributionData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                },
            }} height={250}/>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-6">
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-info text-white">
              <i className="fas fa-chart-line me-1"></i> Trend Rating-uri (Ultimele 7 Zile)
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_chartjs_2_1.Line data={ratingTrendData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: { beginAtZero: true, max: 5 },
            },
        }} height={250}/>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      {/* Lista Feedback-uri */}
      <div className="row">
        <div className="col-md-12">
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
              <span>
                <i className="fas fa-comments me-1"></i> Feedback-uri Recente
              </span>
              <div className="d-flex gap-3 align-items-center">
                {/* Dropdown Perioadă */}
                <react_bootstrap_1.Form.Select value={filters.period} onChange={function (e) { return changePeriod(e.target.value); }} className="form-select-sm feedback-period-select" style={{
            width: '200px',
            backgroundColor: '#343a40',
            color: 'white',
            borderColor: '#6c757d',
            textDecoration: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            paddingRight: '2rem',
            backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1rem 1rem'
        }}>
                  <option value="today">📅 Astăzi</option>
                  <option value="week">📆 Săptămâna aceasta</option>
                  <option value="month">🗓️ Luna aceasta</option>
                  <option value="quarter">📊 Trimestru (3 luni)</option>
                  <option value="semester">🗂️ Semestru (6 luni)</option>
                  <option value="year">📅 An (12 luni)</option>
                  <option value="overall">🌍 TOATE TIMPURILE</option>
                </react_bootstrap_1.Form.Select>

                {/* Filtre Rating */}
                <div className="btn-group btn-group-sm" role="group">
                  <react_bootstrap_1.Button variant={filters.rating === '' ? 'light' : 'outline-light'} onClick={function () { return filterByRating('all'); }}>Toate</react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant={filters.rating === '5' ? 'light' : 'outline-light'} onClick={function () { return filterByRating(5); }}>
                    5★
                  </react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant={filters.rating === '4' ? 'light' : 'outline-light'} onClick={function () { return filterByRating(4); }}>
                    4★
                  </react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant={filters.rating === '3' ? 'light' : 'outline-light'} onClick={function () { return filterByRating(3); }}>
                    3★
                  </react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant={filters.rating === '2' ? 'light' : 'outline-light'} onClick={function () { return filterByRating(2); }}>
                    2★
                  </react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant={filters.rating === '1' ? 'light' : 'outline-light'} onClick={function () { return filterByRating(1); }}>
                    1★
                  </react_bootstrap_1.Button>
                </div>
              </div>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div className="table-responsive">
                {feedbacks.length === 0 ? (<div className="text-center py-4 text-muted">
                    <i className="fas fa-star fa-3x mb-3 opacity-50"></i>
                    <p>Nu există feedback-uri</p>
                  </div>) : (<react_bootstrap_1.Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Comandă</th>
                        <th>Client</th>
                        <th>Rating</th>
                        <th>Comentariu</th>
                        <th>Data</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map(function (feedback) {
                var ratingClass = feedback.rating <= 2
                    ? 'text-danger'
                    : feedback.rating >= 4
                        ? 'text-success'
                        : 'text-warning';
                return (<tr key={feedback.id} className="feedback-row" data-rating={feedback.rating}>
                            <td>#{feedback.id}</td>
                            <td>
                              {feedback.order_id ? (<code>#{feedback.order_id}</code>) : (<span className="text-muted">-</span>)}
                            </td>
                            <td>
                              {feedback.customer_token ? (<code className="small">{feedback.customer_token.substring(0, 8)}...</code>) : (<span className="text-muted">-</span>)}
                            </td>
                            <td className={"".concat(ratingClass, " fw-bold")}>
                              {getRatingStars(feedback.rating)} ({feedback.rating})
                            </td>
                            <td className="text-truncate" style={{ maxWidth: '300px' }} title={feedback.comment || ''}>
                              {feedback.comment || <em className="text-muted">Fără comentariu</em>}
                            </td>
                            <td className="small">
                              {new Date(feedback.timestamp).toLocaleString('ro-RO')}
                            </td>
                            <td>
                              <react_bootstrap_1.Button variant="primary" size="sm" onClick={function () { return viewFeedbackDetails(feedback); }}>
                                <i className="fas fa-eye"></i>
                              </react_bootstrap_1.Button>
                            </td>
                          </tr>);
            })}
                    </tbody>
                  </react_bootstrap_1.Table>)}
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      {/* Modal Detalii Feedback */}
      <react_bootstrap_1.Modal show={showDetailsModal} onHide={function () { return setShowDetailsModal(false); }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <i className="fas fa-star me-2"></i>Detalii Feedback</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedFeedback && (<div>
              <p>
                <strong>ID:</strong> #{selectedFeedback.id}
              </p>
              <p>
                <strong>Rating:</strong>' '
                <react_bootstrap_1.Badge bg={getRatingBadge(selectedFeedback.rating)}>
                  {getRatingStars(selectedFeedback.rating)} ({selectedFeedback.rating}/5)
                </react_bootstrap_1.Badge>
              </p>
              <p>
                <strong>Comandă:</strong> #{selectedFeedback.orderId}
              </p>
              <p>
                <strong>Client:</strong> {selectedFeedback.client}
              </p>
              <p>
                <strong>Masă:</strong> {selectedFeedback.table}
              </p>
              <p>
                <strong>Data:</strong> {selectedFeedback.date}
              </p>
              <p>
                <strong>Comentariu:</strong>
              </p>
              <p>{selectedFeedback.comment}</p>
            </div>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.FeedbackPage = FeedbackPage;
