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
exports.KioskLoginHistoryPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./KioskLoginHistoryPage.css");
var KioskLoginHistoryPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), history = _a[0], setHistory = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)({
        date: '',
        username: '',
    }), filters = _d[0], setFilters = _d[1];
    (0, react_1.useEffect)(function () {
        loadHistory();
    }, [filters]);
    var loadHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, err_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    params = new URLSearchParams();
                    if (filters.date)
                        params.append('date', filters.date);
                    if (filters.username)
                        params.append('username', filters.username);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/kiosk/login-history?".concat(params.toString()))];
                case 2:
                    response = _d.sent();
                    setHistory(((_a = response.data) === null || _a === void 0 ? void 0 : _a.history) || []);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _d.sent();
                    console.error('❌ Eroare la încărcarea istoricului login:', err_1);
                    setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Nu s-a putut încărca istoricul login-urilor.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var formatDateTime = function (dateTime) {
        if (!dateTime)
            return '—';
        var date = new Date(dateTime);
        return date.toLocaleString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };
    var formatDuration = function (loginTime, logoutTime) {
        if (!logoutTime)
            return 'În sesiune';
        var login = new Date(loginTime).getTime();
        var logout = new Date(logoutTime).getTime();
        var diff = Math.floor((logout - login) / 1000); // secunde
        var hours = Math.floor(diff / 3600);
        var minutes = Math.floor((diff % 3600) / 60);
        var seconds = diff % 60;
        if (hours > 0) {
            return "\"Hours\"h \"Minutes\"m \"Seconds\"s";
        }
        else if (minutes > 0) {
            return "\"Minutes\"m \"Seconds\"s";
        }
        else {
            return "\"Seconds\"s";
        }
    };
    var getRoleBadgeColor = function (role) {
        switch (role) {
            case 'admin':
                return 'badge-danger';
            case "Supervisor":
                return 'badge-warning';
            case 'waiter':
                return 'badge-info';
            default:
                return 'badge-secondary';
        }
    };
    var getRoleLabel = function (role) {
        switch (role) {
            case 'admin':
                return 'Admin';
            case "Supervisor":
                return 'Supervisor';
            case 'waiter':
                return 'Ospătar';
            default:
                return role;
        }
    };
    return (<div className="kiosk-login-history-page">
      <PageHeader_1.PageHeader title="Istoric Login KIOSK" subtitle="vizualizeaza istoricul autentificarilor si sesiuni"/>

      <div className="kiosk-login-history-filters">
        <div className="kiosk-login-history-filter">
          <label>Data</label>
          <input type="date" value={filters.date} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { date: e.target.value })); }} className="kiosk-login-history-input"/>
        </div>
        <div className="kiosk-login-history-filter">
          <label>Username</label>
          <input type="text" value={filters.username} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { username: e.target.value })); }} placeholder="filtreaza dupa username" className="kiosk-login-history-input"/>
        </div>
        <div className="kiosk-login-history-filter">
          <button onClick={function () { return setFilters({ date: '', username: '' }); }} className="kiosk-login-history-clear-btn">Șterge filtre</button>
        </div>
      </div>

      {error && (<div className="kiosk-login-history-error">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>)}

      {loading ? (<div className="kiosk-login-history-loading">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>"se incarca istoricul"</p>
        </div>) : (<div className="kiosk-login-history-table-container">
          {history.length === 0 ? (<div className="kiosk-login-history-empty">
              <i className="fas fa-history fa-3x mb-3"></i>
              <p>Nu există înregistrări de login</p>
            </div>) : (<table className="kiosk-login-history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Rol</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>"Durată"</th>
                  <th>"Device"</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {history.map(function (entry) { return (<tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>
                      <strong>{entry.username}</strong>
                    </td>
                    <td>
                      <span className={"badge ".concat(getRoleBadgeColor(entry.role))}>
                        {getRoleLabel(entry.role)}
                      </span>
                    </td>
                    <td>{formatDateTime(entry.login_time)}</td>
                    <td>{formatDateTime(entry.logout_time)}</td>
                    <td>
                      <span className={entry.logout_time
                        ? 'kiosk-login-history-duration'
                        : 'kiosk-login-history-active'}>
                        {formatDuration(entry.login_time, entry.logout_time)}
                      </span>
                    </td>
                    <td>{entry.device_id || '—'}</td>
                    <td>{entry.ip || '—'}</td>
                  </tr>); })}
              </tbody>
            </table>)}
        </div>)}

      {!loading && history.length > 0 && (<div className="kiosk-login-history-stats">
          <div className="kiosk-login-history-stat">
            <span className="kiosk-login-history-stat-label">"total inregistrari"</span>
            <span className="kiosk-login-history-stat-value">{history.length}</span>
          </div>
          <div className="kiosk-login-history-stat">
            <span className="kiosk-login-history-stat-label">Sesiuni active:</span>
            <span className="kiosk-login-history-stat-value">
              {history.filter(function (h) { return !h.logout_time; }).length}
            </span>
          </div>
        </div>)}
    </div>);
};
exports.KioskLoginHistoryPage = KioskLoginHistoryPage;
