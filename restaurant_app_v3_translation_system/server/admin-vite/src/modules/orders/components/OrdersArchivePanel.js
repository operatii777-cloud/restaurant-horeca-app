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
exports.OrdersArchivePanel = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var StatCard_1 = require("@/shared/components/StatCard");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var httpClient_1 = require("@/shared/api/httpClient");
require("./OrdersArchivePanel.css");
var OrdersArchivePanel = function (_a) {
    var _b, _c, _d, _e;
    var onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _f = (0, useApiQuery_1.useApiQuery)('/api/admin/archive-stats'), data = _f.data, loading = _f.loading, error = _f.error, refetch = _f.refetch;
    var _g = (0, react_1.useState)(false), archiveLoading = _g[0], setArchiveLoading = _g[1];
    var _h = (0, react_1.useState)({
        start: null,
        end: null,
    }), exportDates = _h[0], setExportDates = _h[1];
    var _j = (0, react_1.useState)({
        start: null,
        end: null,
    }), deleteDates = _j[0], setDeleteDates = _j[1];
    var _k = (0, react_1.useState)(false), exporting = _k[0], setExporting = _k[1];
    var _l = (0, react_1.useState)(false), deleting = _l[0], setDeleting = _l[1];
    if (error) {
        onFeedback(error, 'error');
    }
    var stats = (0, react_1.useMemo)(function () { return data !== null && data !== void 0 ? data : { activeOrders: 0, archivedOrders: 0, oldestArchive: null, totalSize: 0 }; }, [data]);
    var handleArchive = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setArchiveLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/archive-orders')];
                case 2:
                    _a.sent();
                    onFeedback('Arhivarea manuală a fost inițiată. Verificați logurile backend pentru detalii.', 'success');
                    return [4 /*yield*/, refetch()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error('Eroare la arhivare:', err_1);
                    onFeedback('Nu s-a putut lansa arhivarea comenzilor.', 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setArchiveLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [onFeedback, refetch]);
    var handleExport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, blob, url, link, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!exportDates.start || !exportDates.end) {
                        onFeedback('Selectează intervalul pentru export.', 'info');
                        return [2 /*return*/];
                    }
                    setExporting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/export-archived', {
                            params: {
                                startDate: exportDates.start,
                                endDate: exportDates.end,
                            },
                            responseType: 'blob',
                        })];
                case 2:
                    response = _a.sent();
                    blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElement('a');
                    link.href = url;
                    link.download = "archived-orders-".concat(exportDates.start, "-").concat(exportDates.end, ".csv");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    onFeedback('Exportul CSV a fost generat.', 'success');
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error('Eroare la exportul arhivei:', err_2);
                    onFeedback('Nu s-a putut exporta arhiva.', 'error');
                    return [3 /*break*/, 5];
                case 4:
                    setExporting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [exportDates.end, exportDates.start, onFeedback]);
    var handleDelete = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmDelete, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!deleteDates.start || !deleteDates.end) {
                        onFeedback('Selectează intervalul pentru ștergere.', 'info');
                        return [2 /*return*/];
                    }
                    confirmDelete = window.confirm("E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi comenzile arhivate \u00EEntre ".concat(deleteDates.start, " \u0219i ").concat(deleteDates.end, "? Aceast\u0103 ac\u021Biune este ireversibil\u0103."));
                    if (!confirmDelete) {
                        return [2 /*return*/];
                    }
                    setDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete('/api/admin/delete-archived', {
                            data: {
                                startDate: deleteDates.start,
                                endDate: deleteDates.end,
                            },
                        })];
                case 2:
                    _a.sent();
                    onFeedback('Comenzile arhivate au fost șterse.', 'success');
                    return [4 /*yield*/, refetch()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_3 = _a.sent();
                    console.error('Eroare la ștergerea arhivei:', err_3);
                    onFeedback('Nu s-au putut șterge comenzile arhivate.', 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setDeleting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [deleteDates.end, deleteDates.start, onFeedback, refetch]);
    return (<div className="orders-archive-panel">
      <section className="archive-stats-grid">
        <StatCard_1.StatCard title="Comenzi active" helper="În baza de date curentă" value={"".concat(stats.activeOrders)} icon={<span>📦</span>}/>
        <StatCard_1.StatCard title="Comenzi arhivate" helper="În tabela orders_archive" value={"".concat(stats.archivedOrders)} icon={<span>📁</span>}/>
        <StatCard_1.StatCard title="Prima arhivare" helper="Dată minimă în arhivă" value={stats.oldestArchive ? new Date(stats.oldestArchive).toLocaleDateString('ro-RO') : 'N/A'} icon={<span>📅</span>}/>
        <StatCard_1.StatCard title="Total înregistrări" helper="Active + arhivate" value={"".concat(stats.totalSize)} icon={<span>Σ</span>}/>
      </section>

      {loading ? <p>Se încarcă statisticile...</p> : null}
      {error ? <InlineAlert_1.InlineAlert variant="error" message={error}/> : null}

      <section className="archive-actions">
        <div className="archive-card">
          <h3>Arhivare manuală</h3>
          <p>Mută în mod manual comenzile vechi (peste 1 an) în tabela orders_archive.</p>
          <button type="button" className="btn btn-primary" onClick={handleArchive} disabled={archiveLoading}>
            {archiveLoading ? 'Se arhivează...' : 'Lansează arhivarea'}
          </button>
        </div>

        <div className="archive-card">
          <h3>Export CSV</h3>
          <p>Selectează intervalul de timp pe care dorești să îl exporți.</p>
          <div className="archive-card__range">
            <label htmlFor="archive-export-start">De la</label>
            <input id="archive-export-start" type="date" value={(_b = exportDates.start) !== null && _b !== void 0 ? _b : ''} onChange={function (event) { return setExportDates(function (prev) { return (__assign(__assign({}, prev), { start: event.target.value || null })); }); }}/>
            <label htmlFor="archive-export-end">Până la</label>
            <input id="archive-export-end" type="date" value={(_c = exportDates.end) !== null && _c !== void 0 ? _c : ''} onChange={function (event) { return setExportDates(function (prev) { return (__assign(__assign({}, prev), { end: event.target.value || null })); }); }}/>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Se exportă...' : 'Exportă CSV'}
          </button>
        </div>

        <div className="archive-card">
          <h3>Ștergere arhivă</h3>
          <p>Elimină definitiv comenzile arhivate pentru un interval selectat.</p>
          <div className="archive-card__range">
            <label htmlFor="archive-delete-start">De la</label>
            <input id="archive-delete-start" type="date" value={(_d = deleteDates.start) !== null && _d !== void 0 ? _d : ''} onChange={function (event) { return setDeleteDates(function (prev) { return (__assign(__assign({}, prev), { start: event.target.value || null })); }); }}/>
            <label htmlFor="archive-delete-end">Până la</label>
            <input id="archive-delete-end" type="date" value={(_e = deleteDates.end) !== null && _e !== void 0 ? _e : ''} onChange={function (event) { return setDeleteDates(function (prev) { return (__assign(__assign({}, prev), { end: event.target.value || null })); }); }}/>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Se șterge...' : 'Șterge arhiva'}
          </button>
        </div>
      </section>
    </div>);
};
exports.OrdersArchivePanel = OrdersArchivePanel;
