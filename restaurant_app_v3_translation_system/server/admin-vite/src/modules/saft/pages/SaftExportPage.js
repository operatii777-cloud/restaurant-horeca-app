"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.5 - SAF-T Export Page
 *
 * UI for generating SAF-T XML exports with validation
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
exports.SaftExportPage = SaftExportPage;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
require("./SaftExportPage.css");
var API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
/**
 * Validate SAF-T export
 */
function validateSaftExport(month) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/saft/export/validate?month=").concat(month), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to validate: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Get export history
 */
function getExportHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/saft/export/history"), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to get history: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Download SAF-T export
 */
function downloadSaftExport(month) {
    var url = "".concat(API_BASE_URL, "/api/saft/export?month=").concat(month);
    window.open(url, '_blank');
}
function SaftExportPage() {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(function () {
        var now = new Date();
        return "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'));
    }), selectedMonth = _a[0], setSelectedMonth = _a[1];
    var _b = (0, react_query_1.useQuery)({
        queryKey: ['saft', 'validate', selectedMonth],
        queryFn: function () { return validateSaftExport(selectedMonth); },
        enabled: false, // Only validate on demand
    }), validationData = _b.data, validating = _b.isLoading, refetchValidation = _b.refetch;
    var _c = (0, react_query_1.useQuery)({
        queryKey: ['saft', 'export-history'],
        queryFn: getExportHistory,
    }), historyData = _c.data, historyLoading = _c.isLoading, refetchHistory = _c.refetch;
    /**
     * Handle validation
     */
    var handleValidate = function () {
        refetchValidation();
    };
    /**
     * Handle export
     */
    var handleExport = function () {
        if (!(validationData === null || validationData === void 0 ? void 0 : validationData.success)) {
            alert('Validează datele înainte de export!');
            return;
        }
        downloadSaftExport(selectedMonth);
        setTimeout(function () { return refetchHistory(); }, 2000); // Refresh history after download
    };
    /**
     * Format date
     */
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    var validation = validationData === null || validationData === void 0 ? void 0 : validationData.data;
    var history = (historyData === null || historyData === void 0 ? void 0 : historyData.data) || [];
    return (<div className="saft-export-page">
      <header className="page-header">
        <h1 className="page-title">Export SAF-T ANAF</h1>
        <p className="page-subtitle">Generează export SAF-T XML pentru trimitere către ANAF</p>
      </header>

      {/* Export Form */}
      <div className="export-form-card">
        <h3 className="card-title">Generare Export</h3>
        <div className="form-group">
          <label htmlFor="export-month" className="form-label">Selectează Luna</label>
          <input id="export-month" type="month" value={selectedMonth} onChange={function (e) { return setSelectedMonth(e.target.value); }} className="form-control" max={"".concat(new Date().getFullYear(), "-").concat(String(new Date().getMonth() + 1).padStart(2, '0'))}/>
        </div>

        <div className="form-actions">
          <button onClick={handleValidate} disabled={validating} className="btn btn-secondary">
            {validating ? 'Se validează...' : 'Validează Datele'}
          </button>
          <button onClick={handleExport} disabled={!(validation === null || validation === void 0 ? void 0 : validation.valid) || validating} className="btn btn-primary">Descarcă SAF-T XML</button>
        </div>
      </div>

      {/* Validation Results */}
      {validation && (<div className={"validation-card ".concat(validation.valid ? 'validation-success' : 'validation-error')}>
          <h3 className="card-title">
            {validation.valid ? '✅ Validare Reușită' : '❌ Erori de Validare'}
          </h3>
          {validation.errors && validation.errors.length > 0 ? (<div className="validation-errors">
              <ul>
                {validation.errors.map(function (error, index) { return (<li key={index}>
                    <strong>{error.code}:</strong> {error.message}
                    {error.details && (<pre className="error-details">{JSON.stringify(error.details, null, 2)}</pre>)}
                  </li>); })}
              </ul>
            </div>) : (<p className="validation-success-message">Toate datele sunt valide. Poți genera exportul SAF-T.</p>)}
        </div>)}

      {/* Export History */}
      <div className="history-card">
        <h3 className="card-title">Istoric Exporturi</h3>
        {historyLoading ? (<div className="loading-spinner">Se încarcă...</div>) : history.length === 0 ? (<p className="text-muted">Nu există exporturi anterioare.</p>) : (<table className="history-table">
            <thead>
              <tr>
                <th>Lună</th>
                <th>Data Export</th>
                <th>Status</th>
                <th>Dimensiune</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {history.map(function (item, index) { return (<tr key={index}>
                  <td>{item.month}</td>
                  <td>{formatDate(item.exported_at)}</td>
                  <td>
                    <span className={"badge badge-".concat(item.status === 'SUCCESS' ? 'success' : 'danger')}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.file_size ? "".concat((item.file_size / 1024).toFixed(2), " KB") : 'N/A'}</td>
                  <td>
                    {item.status === 'SUCCESS' && (<button onClick={function () { return downloadSaftExport(item.month); }} className="btn btn-sm btn-primary">Descarcă</button>)}
                  </td>
                </tr>); })}
            </tbody>
          </table>)}
      </div>
    </div>);
}
