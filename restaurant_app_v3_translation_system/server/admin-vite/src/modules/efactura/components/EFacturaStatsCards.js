"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Stats Cards Component
 *
 * Statistics cards for e-Factura dashboard (S11 Part 5).
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
exports.EFacturaStatsCards = EFacturaStatsCards;
var react_1 = require("react");
var efacturaApi_1 = require("@/core/api/efacturaApi");
require("./EFacturaStatsCards.css");
function EFacturaStatsCards() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), stats = _a[0], setStats = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        loadStats();
        // Refresh every 30 seconds
        var interval = setInterval(loadStats, 30000);
        return function () { return clearInterval(interval); };
    }, []);
    var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var today, firstDay, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    today = new Date();
                    firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    return [4 /*yield*/, efacturaApi_1.efacturaApi.getStats(firstDay.toISOString().split('T')[0], today.toISOString().split('T')[0])];
                case 1:
                    data = _a.sent();
                    setStats(data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('EFacturaStatsCards Error loading stats:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading || !stats) {
        return (<div className="efactura-stats-cards">
        {[1, 2, 3, 4, 5].map(function (i) { return (<div key={i} className="efactura-stat-card efactura-stat-card--loading">
            <div className="stat-skeleton"></div>
          </div>); })}
      </div>);
    }
    return (<div className="efactura-stats-cards">
      <div className="efactura-stat-card efactura-stat-card--total">
        <div className="stat-label">Total Facturi</div>
        <div className="stat-value">{stats.totalInvoices}</div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--accepted">
        <div className="stat-label">Acceptate</div>
        <div className="stat-value">{stats.acceptedCount}</div>
        <div className="stat-amount">
          {stats.totalAmountAccepted.toFixed(2)} RON
        </div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--rejected">
        <div className="stat-label">Respinse</div>
        <div className="stat-value">{stats.rejectedCount}</div>
        <div className="stat-amount">
          {stats.totalAmountRejected.toFixed(2)} RON
        </div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--error">
        <div className="stat-label">Erori</div>
        <div className="stat-value">{stats.errorCount}</div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--pending">
        <div className="stat-label">"in coada"</div>
        <div className="stat-value">{stats.pendingCount + stats.queueCount}</div>
      </div>
    </div>);
}
