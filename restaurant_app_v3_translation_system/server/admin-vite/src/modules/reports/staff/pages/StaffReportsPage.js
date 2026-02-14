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
exports.StaffReportsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var StaffReportsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), reports = _a[0], setReports = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        loadStaffReport();
    }, []);
    var loadStaffReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var endDate, startDate, start, res, data, byWaiter_1, staffReports, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    endDate = new Date().toISOString().split('T')[0];
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    start = startDate.toISOString().split('T')[0];
                    return [4 /*yield*/, fetch("/api/orders?startDate=\"Start\"&endDate=".concat(endDate, "&limit=1000"))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success && data.data) {
                        byWaiter_1 = {};
                        data.data.forEach(function (order) {
                            var waiter = order.waiter_name || 'Necunoscut';
                            if (!byWaiter_1[waiter]) {
                                byWaiter_1[waiter] = { count: 0, total: 0 };
                            }
                            byWaiter_1[waiter].count++;
                            byWaiter_1[waiter].total += parseFloat(order.total_price) || 0;
                        });
                        staffReports = Object.entries(byWaiter_1).map(function (_a) {
                            var waiter = _a[0], stats = _a[1];
                            return ({
                                waiter: waiter,
                                count: stats.count,
                                total: stats.total,
                                average: stats.total / stats.count
                            });
                        });
                        setReports(staffReports);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var columnDefs = [
        { field: 'waiter', headerName: 'Ospătar', width: 200 },
        { field: 'count', headerName: 'Nr. Comenzi', width: 150 },
        { field: 'total', headerName: 'Total Vânzări', width: 150, valueFormatter: function (params) { return "".concat(params.value.toFixed(2), " RON"); } },
        { field: 'average', headerName: 'Medie/Comandă', width: 150, valueFormatter: function (params) { return "".concat(params.value.toFixed(2), " RON"); } }
    ];
    return (<div className="staff-reports-page padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-users me-2"></i>Rapoarte Personal</h1>
        <button className="btn btn-primary" onClick={loadStaffReport}>
          <i className="fas fa-sync me-1"></i>Reîncarcă</button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={reports} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true }} loading={loading}/>
      </div>
    </div>);
};
exports.StaffReportsPage = StaffReportsPage;
