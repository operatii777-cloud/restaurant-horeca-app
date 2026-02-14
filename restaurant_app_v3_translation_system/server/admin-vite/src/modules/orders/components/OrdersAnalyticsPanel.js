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
exports.OrdersAnalyticsPanel = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var StatCard_1 = require("@/shared/components/StatCard");
var httpClient_1 = require("@/shared/api/httpClient");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./OrdersAnalyticsPanel.css");
var OrdersAnalyticsPanel = function (_a) {
    var _b, _c, _d, _e;
    var onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _f = (0, react_1.useState)('week'), period = _f[0], setPeriod = _f[1];
    var _g = (0, react_1.useState)({
        start: null,
        end: null,
    }), customRange = _g[0], setCustomRange = _g[1];
    var _h = (0, react_1.useState)(null), predictions = _h[0], setPredictions = _h[1];
    var _j = (0, react_1.useState)(false), predictionLoading = _j[0], setPredictionLoading = _j[1];
    var _k = (0, react_1.useState)(null), correlation = _k[0], setCorrelation = _k[1];
    var _l = (0, react_1.useState)(false), correlationLoading = _l[0], setCorrelationLoading = _l[1];
    var analyticsEndpoint = (0, react_1.useMemo)(function () {
        var params = new URLSearchParams({ period: period });
        if (period === 'custom') {
            if (!customRange.start || !customRange.end) {
                return null;
            }
            params.set('startDate', customRange.start);
            params.set('endDate', customRange.end);
        }
        return "/api/analytics/cancellation-stats?".concat(params.toString());
    }, [customRange.end, customRange.start, period]);
    var _m = (0, useApiQuery_1.useApiQuery)(analyticsEndpoint), analytics = _m.data, loading = _m.loading, error = _m.error, refetch = _m.refetch;
    // Previne infinite loop: loghează erori doar o dată
    var lastErrorRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (error && error !== lastErrorRef.current) {
            lastErrorRef.current = error;
            onFeedback(error, 'error');
        }
        else if (!error) {
            lastErrorRef.current = null;
        }
    }, [error, onFeedback]);
    var hourlyData = (0, react_1.useMemo)(function () {
        var _a;
        return ((_a = analytics === null || analytics === void 0 ? void 0 : analytics.hourly_distribution) !== null && _a !== void 0 ? _a : []).map(function (bucket) { return ({
            label: "".concat(bucket.hour, ":00"),
            value: bucket.count,
        }); });
    }, [analytics === null || analytics === void 0 ? void 0 : analytics.hourly_distribution]);
    var reasonsData = (0, react_1.useMemo)(function () {
        var _a, _b;
        var total = ((_a = analytics === null || analytics === void 0 ? void 0 : analytics.cancellation_reasons) !== null && _a !== void 0 ? _a : []).reduce(function (sum, item) { return sum + item.count; }, 0);
        if (!total)
            return [];
        return ((_b = analytics === null || analytics === void 0 ? void 0 : analytics.cancellation_reasons) !== null && _b !== void 0 ? _b : []).map(function (item) {
            var _a;
            return ({
                name: (_a = item.reason) !== null && _a !== void 0 ? _a : 'Nespecificat',
                value: Number(((item.count / total) * 100).toFixed(2)),
            });
        });
    }, [analytics === null || analytics === void 0 ? void 0 : analytics.cancellation_reasons]);
    var trendsData = (0, react_1.useMemo)(function () {
        var _a;
        return ((_a = analytics === null || analytics === void 0 ? void 0 : analytics.trends) !== null && _a !== void 0 ? _a : []).map(function (item) { return ({
            label: item.date,
            value: item.count,
        }); });
    }, [analytics === null || analytics === void 0 ? void 0 : analytics.trends]);
    var handleFetchPredictions = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setPredictionLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/analytics/cancellation-predictions')];
                case 2:
                    response = _a.sent();
                    setPredictions(response.data);
                    onFeedback('Predicțiile au fost generate.', 'success');
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Eroare la generarea predicțiilor:', err_1);
                    onFeedback('Nu s-au putut genera predicțiile de anulare.', 'error');
                    return [3 /*break*/, 5];
                case 4:
                    setPredictionLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [onFeedback]);
    var handleFetchCorrelation = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCorrelationLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/analytics/stock-cancellation-correlation')];
                case 2:
                    response = _a.sent();
                    setCorrelation(response.data);
                    onFeedback('Analiza corelațiilor stoc-anulare a fost încărcată.', 'success');
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error('Eroare la analiza corelațiilor:', err_2);
                    onFeedback('Nu s-au putut încărca corelațiile stoc-anulare.', 'error');
                    return [3 /*break*/, 5];
                case 4:
                    setCorrelationLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [onFeedback]);
    var handlePeriodChange = (0, react_1.useCallback)(function (value) {
        setPeriod(value);
        if (value !== 'custom') {
            setCustomRange({ start: null, end: null });
        }
    }, []);
    return (<div className="orders-analytics-panel">
      <section className="analytics-controls">
        <div className="analytics-period">
          <span>Perioadă analiză</span>
          <div className="analytics-period__buttons">
            {['day', 'week', 'month', 'year', 'custom'].map(function (option) { return (<button key={option} type="button" className={(0, classnames_1.default)('btn btn-chip', { 'is-active': period === option })} onClick={function () { return handlePeriodChange(option); }}>
                {option === 'day'
                ? 'Astăzi'
                : option === 'week'
                    ? 'Ultima săptămână'
                    : option === 'month'
                        ? 'Ultima lună'
                        : option === 'year'
                            ? 'Ultimul an'
                            : 'Personalizat'}
              </button>); })}
          </div>
        </div>

        {period === 'custom' ? (<div className="analytics-range">
            <label htmlFor="analytics-start">De la</label>
            <input id="analytics-start" type="date" value={(_b = customRange.start) !== null && _b !== void 0 ? _b : ''} onChange={function (event) { return setCustomRange(function (prev) { return (__assign(__assign({}, prev), { start: event.target.value || null })); }); }}/>
            <label htmlFor="analytics-end">Până la</label>
            <input id="analytics-end" type="date" value={(_c = customRange.end) !== null && _c !== void 0 ? _c : ''} onChange={function (event) { return setCustomRange(function (prev) { return (__assign(__assign({}, prev), { end: event.target.value || null })); }); }}/>
            <button type="button" className="btn btn-primary" onClick={function () { return refetch(); }}>Aplică</button>
          </div>) : null}

        <div className="analytics-actions">
          <button type="button" className="btn btn-ghost" onClick={function () { return refetch(); }}>Reîmprospătează</button>
          <button type="button" className="btn btn-ghost" onClick={handleFetchPredictions} disabled={predictionLoading}>
            {predictionLoading ? 'Se calculează…' : '🔮 Predicții anulări'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleFetchCorrelation} disabled={correlationLoading}>
            {correlationLoading ? 'Se analizează…' : '🔗 Corelație stoc'}
          </button>
        </div>
      </section>

      {loading ? <p>Se încarcă datele analize...</p> : null}
      {!loading && !analytics ? <InlineAlert_1.InlineAlert variant="info" message="Selectați o perioadă pentru a vedea statisticile."/> : null}

      {analytics ? (<div className="analytics-content">
          <section className="analytics-stats">
            <StatCard_1.StatCard title="Total comenzi" helper={"Interval: ".concat(analytics.period)} value={"".concat(analytics.general_stats.total_orders)} icon={<span>📦</span>}/>
            <StatCard_1.StatCard title="Anulări" helper={analytics.general_stats.cancelled_orders > 0
                ? "".concat(analytics.general_stats.cancelled_orders, " (").concat(analytics.general_stats.cancellation_rate.toFixed(2), "%)")
                : 'Fără anulări'} value={"".concat(analytics.general_stats.cancelled_orders)} trendDirection={analytics.general_stats.cancelled_orders > 0 ? 'down' : 'flat'} trendLabel={analytics.general_stats.cancelled_orders > 0 ? 'Impact' : 'OK'} icon={<span>❌</span>}/>
            <StatCard_1.StatCard title="Valoare pierdută" helper="Din comenzile anulate" value={"".concat(analytics.general_stats.cancelled_value.toFixed(2), " RON")} icon={<span>💸</span>}/>
            <StatCard_1.StatCard title="Timp mediu anulare" helper="minute" value={"".concat(analytics.general_stats.avg_cancel_time_minutes, " min")} icon={<span>⏱️</span>}/>
          </section>

          <section className="analytics-grid">
            <div className="analytics-card">
              <header>
                <h3>Distribuție orară</h3>
                <span>Număr de anulări pe oră</span>
              </header>
              {hourlyData.length ? (<MiniBarChart_1.MiniBarChart data={hourlyData} tooltipFormatter={function (value) { return ["Valoare", 'Anulări']; }}/>) : (<p>Nu există date</p>)}
            </div>

            <div className="analytics-card">
              <header>
                <h3>Motive anulare</h3>
                <span>Top 10 motive</span>
              </header>
              {reasonsData.length ? <MiniDonutChart_1.MiniDonutChart data={reasonsData}/> : <p>Nu există motive definite</p>}
            </div>

            <div className="analytics-card">
              <header>
                <h3>Tendințe</h3>
                <span>Evoluția zilnică a anulărilor</span>
              </header>
              {trendsData.length ? (<MiniBarChart_1.MiniBarChart data={trendsData} tooltipFormatter={function (value) { return ["Valoare", 'Anulări']; }}/>) : (<p>Nu există date pentru tendințe</p>)}
            </div>

            <div className="analytics-card">
              <header>
                <h3>Top produse anulate</h3>
              </header>
              <ul className="analytics-top-list">
                {((_d = analytics.top_cancelled_products) !== null && _d !== void 0 ? _d : []).map(function (product) { return (<li key={product.name}>
                    <span>{product.name}</span>
                    <strong>{product.cancellation_count}</strong>
                  </li>); })}
                {!((_e = analytics.top_cancelled_products) === null || _e === void 0 ? void 0 : _e.length) ? <li>Nu există produse în listă</li> : null}
              </ul>
            </div>
          </section>

          {/* Breakdown pe Tip Comandă - NOU */}
          {analytics.breakdown_by_type && analytics.breakdown_by_type.length > 0 && (<section className="analytics-breakdown">
              <div className="analytics-card">
                <header>
                  <h3>Breakdown pe tip comandă</h3>
                  <span>Anulări per tip de comandă</span>
                </header>
                <div className="breakdown-grid">
                  {analytics.breakdown_by_type.map(function (item, idx) {
                    var _a, _b;
                    return (<div key={idx} className="breakdown-item">
                      <div className="breakdown-icon">
                        {item.type === 'DELIVERY' ? '🛵' :
                            item.type === 'DRIVE_THRU' ? '🚗' :
                                item.type === 'TAKEOUT' ? '📦' : '🍽️'}
                      </div>
                      <div className="breakdown-info">
                        <strong>{item.type || 'N/A'}</strong>
                        <div className="breakdown-stats">
                          <span>{item.count || 0} anulări</span>
                          <span>{((_a = item.value) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '0.00'} RON</span>
                          <span>{((_b = item.percentage) === null || _b === void 0 ? void 0 : _b.toFixed(1)) || '0'}%</span>
                        </div>
                      </div>
                    </div>);
                })}
                </div>
              </div>
            </section>)}
        </div>) : null}

      {predictions ? (<section className="analytics-predictions">
          <header>
            <h3>Predicții anulări</h3>
            <span>
              Interval analizat: {new Date(predictions.analysis_period.start).toLocaleDateString('ro-RO')} –' '
              {new Date(predictions.analysis_period.end).toLocaleDateString('ro-RO')}
            </span>
          </header>
          <div className="analytics-predictions__grid">
            <StatCard_1.StatCard title="Rată curentă" helper="Ultimele 7 zile" value={predictions.trend_analysis.current_rate} icon={<span>📈</span>}/>
            <StatCard_1.StatCard title="Rată precedentă" helper="Zilele 8-14" value={predictions.trend_analysis.previous_rate} icon={<span>📉</span>}/>
            <StatCard_1.StatCard title="Tendință" helper={predictions.trend_analysis.trend_description} value={predictions.predictions.next_week_rate} icon={<span>🔮</span>}/>
          </div>

          {predictions.alerts && predictions.alerts.length > 0 ? (<div className="analytics-alerts">
              {predictions.alerts.map(function (alert, index) { return (<div key={"".concat(alert.type, "-Alert")} className={(0, classnames_1.default)('analytics-alert', "is-".concat(alert.severity))}>
                  <strong>{alert.message}</strong>
                </div>); })}
            </div>) : null}

          {predictions.recommendations && predictions.recommendations.length > 0 ? (<ul className="analytics-recommendations">
              {predictions.recommendations.map(function (item, index) { return (<li key={"Item-".concat(index)}>{item}</li>); })}
            </ul>) : null}
        </section>) : null}

      {correlation ? (<section className="analytics-correlation">
          <header>
            <h3>Corelație stoc – anulări</h3>
            <span>
              {correlation.generated_at && new Date(correlation.generated_at).getTime() > 0
                ? "Analiz\u0103 generat\u0103 la ".concat(new Date(correlation.generated_at).toLocaleString('ro-RO'))
                : 'Analiză generată recent'}
            </span>
          </header>
          <div className="analytics-correlation__table">
            <div className="analytics-correlation__header">
              <span>Produs</span>
              <span>Anulări</span>
              <span>Stoc curent</span>
              <span>Risc</span>
            </div>
            <div className="analytics-correlation__body">
              {(correlation === null || correlation === void 0 ? void 0 : correlation.items) && correlation.items.length > 0 ? (correlation.items.map(function (item) { return (<div key={item.id} className="analytics-correlation__row">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.category}</small>
                      {item.recommendation ? <p>{item.recommendation}</p> : null}
                    </div>
                    <span>{item.total_cancellations}</span>
                    <span>
                      {item.current_stock}/{item.min_stock}
                    </span>
                    <span className={(0, classnames_1.default)('risk-badge', "risk-".concat(item.risk_level))}>{item.risk_level}</span>
                  </div>); })) : (<p>Nu au fost identificate produse în risc</p>)}
            </div>
          </div>
        </section>) : null}
    </div>);
};
exports.OrdersAnalyticsPanel = OrdersAnalyticsPanel;
