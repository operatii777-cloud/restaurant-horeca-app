"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🌤️ WEATHER FORECAST PAGE - Predicții vânzări bazate pe vreme
 */
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
exports.WeatherForecastPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./WeatherForecastPage.css");
var WeatherForecastPage = function () {
    var _a, _b;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), weather = _d[0], setWeather = _d[1];
    var _e = (0, react_1.useState)([]), predictions = _e[0], setPredictions = _e[1];
    var _f = (0, react_1.useState)(null), recommendations = _f[0], setRecommendations = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var _h = (0, react_1.useState)(false), showSettings = _h[0], setShowSettings = _h[1];
    var _j = (0, react_1.useState)({
        lat: 44.4268,
        lon: 26.1025,
        city: 'București, RO'
    }), settings = _j[0], setSettings = _j[1];
    var _k = (0, react_1.useState)(false), savingSettings = _k[0], setSavingSettings = _k[1];
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var weatherRes, weatherData, temp, condition, predRes, predData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    return [4 /*yield*/, fetch('/api/weather-forecast/current')];
                case 2:
                    weatherRes = _a.sent();
                    if (!weatherRes.ok) {
                        throw new Error("HTTP error! status: ".concat(weatherRes.status));
                    }
                    return [4 /*yield*/, weatherRes.json()];
                case 3:
                    weatherData = _a.sent();
                    console.log('Weather data received:', weatherData);
                    if (!(weatherData.success && weatherData.weather)) return [3 /*break*/, 6];
                    setWeather(weatherData.weather);
                    temp = weatherData.weather.temperature || 22;
                    condition = weatherData.weather.condition || 'normal';
                    return [4 /*yield*/, fetch("/api/weather-forecast/predictions?temperature=".concat(temp, "&condition=").concat(condition))];
                case 4:
                    predRes = _a.sent();
                    if (!predRes.ok) {
                        throw new Error("HTTP error! status: ".concat(predRes.status));
                    }
                    return [4 /*yield*/, predRes.json()];
                case 5:
                    predData = _a.sent();
                    console.log('Predictions data received:', predData);
                    if (predData.success) {
                        setPredictions(predData.predictions || []);
                        setRecommendations(predData.recommendations);
                    }
                    else {
                        console.warn('Predictions API returned success: false', predData);
                    }
                    return [3 /*break*/, 7];
                case 6:
                    console.warn('Weather API returned success: false or no weather data', weatherData);
                    setError('Nu s-au putut încărca datele meteo. Verifică conexiunea la internet.');
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    err_1 = _a.sent();
                    console.error('Error loading weather data:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea datelor meteo');
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var loadSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/weather-forecast/settings')];
                case 1:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success && data.settings) {
                        setSettings(data.settings);
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error('Error loading settings:', err_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var saveSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSavingSettings(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch('/api/weather-forecast/settings', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(settings)
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) {
                        throw new Error('Eroare la salvarea setărilor');
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (!data.success) return [3 /*break*/, 5];
                    setShowSettings(false);
                    // Reîncarcă datele meteo cu noile coordonate
                    return [4 /*yield*/, loadData()];
                case 4:
                    // Reîncarcă datele meteo cu noile coordonate
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    err_3 = _a.sent();
                    console.error('Error saving settings:', err_3);
                    alert('Eroare la salvarea setărilor: ' + err_3.message);
                    return [3 /*break*/, 8];
                case 7:
                    setSavingSettings(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadSettings().then(function () {
            loadData();
        });
    }, []);
    var getWeatherIcon = function (category) {
        var icons = {
            hot: '☀️',
            cold: '❄️',
            rainy: '🌧️',
            sunny: '🌞',
            normal: '⛅',
        };
        return icons[category] || '🌤️';
    };
    var getTrendColor = function (trend) {
        if (trend === 'increase')
            return '#22c55e';
        if (trend === 'decrease')
            return '#ef4444';
        return '#6b7280';
    };
    if (loading) {
        return (<div className="weather-forecast-page">
        <PageHeader_1.PageHeader title="🌤️ Weather Forecast" description="Se încarcă datele..."/>
        <div className="loading">⏳ Se analizează vremea...</div>
      </div>);
    }
    return (<div className="weather-forecast-page" data-page-ready="true">
      <PageHeader_1.PageHeader title="🌤️ Weather-Based Sales Forecasting" description="Predicții vânzări bazate pe condițiile meteo" actions={[
            { label: '⚙️ Setări Locație', variant: 'primary', onClick: function () { return setShowSettings(true); } },
            { label: '🔄 Refresh', variant: 'secondary', onClick: loadData },
        ]}/>

      {/* Settings Modal */}
      {showSettings && (<div className="settings-modal-overlay" onClick={function () { return setShowSettings(false); }}>
          <div className="settings-modal" onClick={function (e) { return e.stopPropagation(); }}>
            <div className="settings-modal-header">
              <h3>⚙️ Setări Locație pentru Weather Forecast</h3>
              <button className="close-btn" onClick={function () { return setShowSettings(false); }}>×</button>
            </div>
            <div className="settings-modal-body">
              <p className="settings-info">
                Introduceți coordonatele locației restaurantului pentru a obține date meteo precise.
                Puteți găsi coordonatele pe <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>.
              </p>
              <div className="settings-form">
                <div className="form-group">
                  <label>Oraș / Locație</label>
                  <input type="text" value={settings.city} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { city: e.target.value })); }} placeholder="ex bucuresti ro"/>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>"Latitudine"</label>
                    <input type="number" step="0.0001" value={settings.lat} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { lat: parseFloat(e.target.value) || 0 })); }} placeholder="ex: 44.4268"/>
                  </div>
                  <div className="form-group">
                    <label>Longitudine</label>
                    <input type="number" step="0.0001" value={settings.lon} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { lon: parseFloat(e.target.value) || 0 })); }} placeholder="ex: 26.1025"/>
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-cancel" onClick={function () { return setShowSettings(false); }}>"Anulează"</button>
                  <button className="btn-save" onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>)}

      {error && <div className="error">{error}</div>}

      {/* Current Weather Card */}
      {weather && (<div className="weather-card">
          <div className="weather-main">
            <span className="weather-icon">{getWeatherIcon(weather.category)}</span>
            <div className="weather-temp">
              <span className="temp-value">{weather.temperature}°C</span>
              <span className="temp-feels">Simțit: {weather.feels_like}°C</span>
            </div>
          </div>
          <div className="weather-details">
            <div className="weather-detail">
              <span className="detail-label">📍 Locație</span>
              <span className="detail-value">{weather.city}</span>
            </div>
            <div className="weather-detail">
              <span className="detail-label">💨 Vânt</span>
              <span className="detail-value">{weather.wind_speed} km/h</span>
            </div>
            <div className="weather-detail">
              <span className="detail-label">💧 Umiditate</span>
              <span className="detail-value">{weather.humidity}%</span>
            </div>
            <div className="weather-detail">
              <span className="detail-label">📝 Condiții</span>
              <span className="detail-value">{weather.description}</span>
            </div>
          </div>
          <div className={"weather-category cat-".concat(weather.category)}>
            Categorie: <strong>{weather.category.toUpperCase()}</strong>
          </div>
        </div>)}

      {/* Recommendations */}
      {recommendations && (<div className="recommendations-section">
          <h2>💡 Recomandări</h2>
          <div className="tip-card">
            {recommendations.general_tip}
          </div>
          <div className="boost-reduce-grid">
            <div className="boost-card">
              <h3>📈 Promovați</h3>
              <div className="category-tags">
                {(_a = recommendations.boost_categories) === null || _a === void 0 ? void 0 : _a.map(function (cat) { return (<span key={cat} className="tag boost">{cat}</span>); })}
              </div>
            </div>
            <div className="reduce-card">
              <h3>📉 Reduceți producția</h3>
              <div className="category-tags">
                {((_b = recommendations.reduce_categories) === null || _b === void 0 ? void 0 : _b.length) > 0 ? (recommendations.reduce_categories.map(function (cat) { return (<span key={cat} className="tag reduce">{cat}</span>); })) : (<span className="no-items">"nicio categorie afectata negativ"</span>)}
              </div>
            </div>
          </div>
        </div>)}

      {/* Predictions Table */}
      <div className="predictions-section">
        <h2>📊 Predicții pe Categorii</h2>
        <div className="predictions-grid">
          {predictions.map(function (pred) { return (<div key={pred.category} className={"prediction-card trend-".concat(pred.trend)}>
              <div className="pred-header">
                <span className="pred-category">{pred.category || 'Necategorizat'}</span>
                <span className="pred-trend" style={{ color: getTrendColor(pred.trend) }}>
                  {pred.trend_icon} {pred.trend === 'increase' ? '+' : pred.trend === 'decrease' ? '-' : ''}{Math.round((pred.predicted_multiplier - 1) * 100)}%
                </span>
              </div>
              <div className="pred-metrics">
                <div className="metric">
                  <span className="metric-label">"comenzi baza"</span>
                  <span className="metric-value">{pred.baseline_orders}</span>
                </div>
                <div className="metric highlight">
                  <span className="metric-label">"Predicție"</span>
                  <span className="metric-value" style={{ color: getTrendColor(pred.trend) }}>
                    {pred.predicted_orders}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Venituri Est.</span>
                  <span className="metric-value">{pred.predicted_revenue} RON</span>
                </div>
              </div>
              <div className="pred-recommendation">
                💡 {pred.recommendation}
              </div>
            </div>); })}
        </div>
      </div>

      {/* Info Note */}
      <div className="info-note">
        ℹ️ <strong>"Notă:"</strong>"date meteo reale de la"<strong>"open meteo"</strong> (gratuit, fără API key necesar).
        Pentru alte locații, modificați coordonatele în backend.
      </div>
    </div>);
};
exports.WeatherForecastPage = WeatherForecastPage;
exports.default = exports.WeatherForecastPage;
