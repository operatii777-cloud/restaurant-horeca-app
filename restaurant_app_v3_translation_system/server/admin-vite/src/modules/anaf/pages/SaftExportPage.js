"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.5 - SAF-T Export Page
 *
 * UI for generating and exporting SAF-T files
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
function validateSaftExport(month) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/saft/export/validate?month=\"Month\""), {
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
function downloadSaftXml(month) {
    return __awaiter(this, void 0, void 0, function () {
        var response, blob, url, a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/saft/export?month=\"Month\""), {
                        method: 'GET',
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to download: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = "saft-\"Month\".xml";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    return [2 /*return*/];
            }
        });
    });
}
function downloadSaftXlsx(month) {
    return __awaiter(this, void 0, void 0, function () {
        var response, blob, url, a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/saft/export/xlsx?month=\"Month\""), {
                        method: 'GET',
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to download: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = "saft-\"Month\".xlsx";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    return [2 /*return*/];
            }
        });
    });
}
function SaftExportPage() {
    var _a, _b;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(function () {
        var now = new Date();
        return "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'));
    }), selectedMonth = _c[0], setSelectedMonth = _c[1];
    var _d = (0, react_query_1.useQuery)({
        queryKey: ['saft', 'validate', selectedMonth],
        queryFn: function () { return validateSaftExport(selectedMonth); },
        enabled: false, // Manual trigger
    }), validation = _d.data, isValidating = _d.isLoading, revalidate = _d.refetch;
    var downloadXmlMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return downloadSaftXml(selectedMonth); },
    });
    var downloadXlsxMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return downloadSaftXlsx(selectedMonth); },
    });
    var handleValidate = function () {
        revalidate();
    };
    var handleDownloadXml = function () {
        downloadXmlMutation.mutate();
    };
    var handleDownloadXlsx = function () {
        downloadXlsxMutation.mutate();
    };
    return (<div className="saft-export-page">
      <header className="page-header">
        <h1 className="page-title">SAF-T Export</h1>
        <p className="page-subtitle">"generare si export fisiere saf t pentru anaf"</p>
      </header>

      <div className="export-card">
        <h2 className="card-title">"selectare luna"</h2>
        <div className="form-group">
          <label htmlFor="month-select" className="form-label">
            Lună (YYYY-MM)
          </label>
          <input id="month-select" type="month" value={selectedMonth} onChange={function (e) { return setSelectedMonth(e.target.value); }} className="form-control"/>
        </div>

        <div className="actions">
          <button onClick={handleValidate} disabled={isValidating} className="btn btn-secondary">
            {isValidating ? 'Se validează...' : 'Validează înainte de export'}
          </button>
        </div>
      </div>

      {validation && (<div className={"validation-card ".concat(validation.success ? 'validation-success' : 'validation-error')}>
          <h3 className="card-title">Rezultate Validare</h3>
          {validation.success ? (<div className="alert alert-success">
              ✅ Validare reușită! Poți exporta fișierul SAF-T.
            </div>) : (<div className="alert alert-danger">
              ❌ Validare eșuată. Verifică erorile înainte de export.
            </div>)}

          {((_a = validation.data) === null || _a === void 0 ? void 0 : _a.errors) && validation.data.errors.length > 0 && (<div className="errors-list">
              <h4>Erori:</h4>
              <ul>
                {validation.data.errors.map(function (error, index) { return (<li key={index} className="error-item">{error}</li>); })}
              </ul>
            </div>)}

          {((_b = validation.data) === null || _b === void 0 ? void 0 : _b.warnings) && validation.data.warnings.length > 0 && (<div className="warnings-list">
              <h4>Avertismente:</h4>
              <ul>
                {validation.data.warnings.map(function (warning, index) { return (<li key={index} className="warning-item">{warning}</li>); })}
              </ul>
            </div>)}
        </div>)}

      <div className="export-actions-card">
        <h2 className="card-title">Export</h2>
        <div className="export-buttons">
          <button onClick={handleDownloadXml} disabled={downloadXmlMutation.isPending || (validation && !validation.success)} className="btn btn-primary">
            {downloadXmlMutation.isPending ? 'Se generează...' : 'Descarcă SAF-T XML'}
          </button>
          <button onClick={handleDownloadXlsx} disabled={downloadXlsxMutation.isPending || (validation && !validation.success)} className="btn btn-primary">
            {downloadXlsxMutation.isPending ? 'Se generează...' : 'Descarcă SAF-T XLSX'}
          </button>
        </div>
      </div>

      <div className="help-card">
        <h3 className="card-title">"Informații"</h3>
        <ul className="help-list">
          <li>SAF-T (Standard Audit File for Tax) este formatul standard pentru raportare fiscală către ANAF</li>
          <li>"exportul include facturi chitante plati miscari st"</li>
          <li>"valideaza intotdeauna inainte de export pentru a v"</li>
          <li>"format xml este standard anaf format xlsx este pen"</li>
        </ul>
      </div>
    </div>);
}
