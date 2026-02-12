"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Charts Component
 *
 * Charts for e-Factura statistics (S11 Part 5).
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
exports.EFacturaCharts = EFacturaCharts;
var react_1 = require("react");
var efacturaApi_1 = require("@/core/api/efacturaApi");
require("./EFacturaCharts.css");
function EFacturaCharts() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), chartData = _a[0], setChartData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        loadChartData();
    }, []);
    var loadChartData = function () { return __awaiter(_this, void 0, void 0, function () {
        var today, firstDay, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    today = new Date();
                    firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    return [4 /*yield*/, efacturaApi_1.efacturaApi.getChartData(firstDay.toISOString().split('T')[0], today.toISOString().split('T')[0])];
                case 1:
                    data = _a.sent();
                    setChartData(data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('EFacturaCharts Error loading chart data:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="efactura-charts-loading">
        <p>"se incarca graficele"</p>
      </div>);
    }
    if (chartData.length === 0) {
        return null;
    }
    // Simple bar chart visualization
    var maxValue = Math.max.apply(Math, chartData.map(function (d) { return Math.max(d.accepted, d.rejected, d.error); }));
    return (<div className="efactura-charts">
      <div className="chart-container">
        <h3 className="chart-title">Facturi pe Zile (Luna Curentă)</h3>
        <div className="chart-bars">
          {chartData.map(function (data, idx) { return (<div key={idx} className="chart-bar-group">
              <div className="chart-bar-label">
                {new Date(data.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}
              </div>
              <div className="chart-bars-container">
                <div className="chart-bar chart-bar--accepted" style={{
                height: "".concat((data.accepted / maxValue) * 100, "%"),
            }} title={"Acceptate: ".concat(data.accepted)}/>
                <div className="chart-bar chart-bar--rejected" style={{
                height: "".concat((data.rejected / maxValue) * 100, "%"),
            }} title={"Respinse: ".concat(data.rejected)}/>
                <div className="chart-bar chart-bar--error" style={{
                height: "".concat((data.error / maxValue) * 100, "%"),
            }} title={"Erori: ".concat(data.error)}/>
              </div>
            </div>); })}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color legend-color--accepted"></span>
            <span>Acceptate</span>
          </div>
          <div className="legend-item">
            <span className="legend-color legend-color--rejected"></span>
            <span>Respinse</span>
          </div>
          <div className="legend-item">
            <span className="legend-color legend-color--error"></span>
            <span>Erori</span>
          </div>
        </div>
      </div>
    </div>);
}
