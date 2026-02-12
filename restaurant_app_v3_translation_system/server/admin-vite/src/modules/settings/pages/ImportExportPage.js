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
exports.ImportExportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./ImportExportPage.css");
var IMPORT_TYPES = [
    { value: 'products', label: 'Produse' },
    { value: 'ingredients', label: 'Ingrediente' },
    { value: 'menu', label: 'Meniu' },
    { value: 'customers', label: 'Clienți' },
];
var EXPORT_TYPES = [
    { value: 'sales', label: 'Vânzări' },
    { value: 'inventory', label: 'Inventar' },
    { value: 'products', label: 'Produse' },
    { value: 'reports', label: 'Rapoarte' },
];
var EXPORT_FORMATS = [
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'pdf', label: 'PDF' },
];
var ImportExportPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('import'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(null), importFile = _b[0], setImportFile = _b[1];
    var _c = (0, react_1.useState)('products'), importType = _c[0], setImportType = _c[1];
    var _d = (0, react_1.useState)('sales'), exportType = _d[0], setExportType = _d[1];
    var _e = (0, react_1.useState)('csv'), exportFormat = _e[0], setExportFormat = _e[1];
    var _f = (0, react_1.useState)(null), alert = _f[0], setAlert = _f[1];
    // Import filters state
    var _g = (0, react_1.useState)({
        entityType: 'products',
        mode: 'upsert',
        skipFirstRow: true,
    }), importFilters = _g[0], setImportFilters = _g[1];
    var _h = (0, react_1.useState)(null), fileRowCount = _h[0], setFileRowCount = _h[1];
    var _j = (0, react_1.useState)(false), parsingFile = _j[0], setParsingFile = _j[1];
    var _k = (0, useApiQuery_1.useApiQuery)('/api/import/history'), importHistory = _k.data, refetchImport = _k.refetch;
    var _l = (0, useApiQuery_1.useApiQuery)('/api/export/history'), exportHistory = _l.data, refetchExport = _l.refetch;
    var importMutation = (0, useApiMutation_1.useApiMutation)();
    var exportMutation = (0, useApiMutation_1.useApiMutation)();
    /**
     * Parsează fișierul pentru a obține numărul de rânduri
     */
    var parseFileToGetCount = function (file) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var _a;
                        try {
                            var text = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                            var fileName = file.name.toLowerCase();
                            if (fileName.endsWith('.csv')) {
                                // Parse CSV - numără liniile (exclude header dacă există)
                                var lines = text.split('\n').filter(function (line) { return line.trim().length > 0; });
                                // Prima linie este de obicei header
                                var dataRows = lines.length > 1 ? lines.length - 1 : lines.length;
                                resolve(dataRows);
                            }
                            else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                                // Pentru Excel, estimăm sau trimitem la backend
                                // Estimare simplă bazată pe mărimea fișierului (aproximativ)
                                // O linie Excel ocupă ~100-200 bytes în medie
                                var estimatedRows = Math.max(1, Math.floor(file.size / 150));
                                resolve(estimatedRows);
                            }
                            else {
                                // Fallback
                                resolve(0);
                            }
                        }
                        catch (error) {
                            console.error('Error parsing file:', error);
                            reject(error);
                        }
                    };
                    reader.onerror = function () {
                        reject(new Error('Eroare la citirea fișierului'));
                    };
                    // Pentru Excel, citim doar primii bytes pentru estimare
                    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
                        // Pentru Excel, folosim estimare bazată pe mărime
                        var estimatedRows = Math.max(1, Math.floor(file.size / 150));
                        resolve(estimatedRows);
                    }
                    else {
                        // Pentru CSV, citim tot fișierul
                        reader.readAsText(file);
                    }
                })];
        });
    }); };
    var handleFileChange = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var file, count, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) || null;
                    setImportFile(file);
                    setFileRowCount(null);
                    if (!file) return [3 /*break*/, 5];
                    setParsingFile(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, parseFileToGetCount(file)];
                case 2:
                    count = _b.sent();
                    setFileRowCount(count);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error parsing file:', error_1);
                    setAlert({ type: 'error', message: 'Eroare la parsarea fișierului' });
                    return [3 /*break*/, 5];
                case 4:
                    setParsingFile(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleImport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!importFile) {
                        setAlert({ type: 'error', message: 'Selectează un fișier' });
                        return [2 /*return*/];
                    }
                    if (!fileRowCount || fileRowCount === 0) {
                        setAlert({ type: 'error', message: 'Fișierul nu conține date valide' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    formData = new FormData();
                    formData.append('file', importFile);
                    formData.append('entity_type', importFilters.entityType);
                    formData.append('mode', importFilters.mode);
                    formData.append('skip_first_row', String(importFilters.skipFirstRow ? 1 : 0));
                    if (importFilters.locationId) {
                        formData.append('location_id', String(importFilters.locationId));
                    }
                    return [4 /*yield*/, importMutation.mutate({
                            url: "/api/import/".concat(importType),
                            method: 'POST',
                            data: formData,
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })];
                case 2:
                    _a.sent();
                    setAlert({ type: 'success', message: "Import ini\u021Biat cu succes! ".concat(fileRowCount, " \u00EEnregistr\u0103ri detectate.") });
                    setImportFile(null);
                    setFileRowCount(null);
                    refetchImport();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    setAlert({ type: 'error', message: error_2.message || 'Eroare la import' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleExport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var filters, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    filters = {
                        format: exportFormat,
                        dateFrom: undefined,
                        dateTo: undefined,
                        category: undefined,
                    };
                    return [4 /*yield*/, exportMutation.mutate({
                            url: "/api/export/".concat(exportType),
                            method: 'POST',
                            data: {
                                format: exportFormat,
                                filters_json: filters,
                            }
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Export inițiat cu succes!' });
                    refetchExport();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    setAlert({ type: 'error', message: error_3.message || 'Eroare la export' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="import-export-page">
      <PageHeader_1.PageHeader title="Import & Export Date" description="Import și export date în multiple formate (CSV, Excel, PDF)"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="import-export-tabs">
        <button className={"tab-button ".concat(activeTab === 'import' ? 'active' : '')} onClick={function () { return setActiveTab('import'); }}>
          📥 Import
        </button>
        <button className={"tab-button ".concat(activeTab === 'export' ? 'active' : '')} onClick={function () { return setActiveTab('export'); }}>
          📤 Export
        </button>
      </div>

      {activeTab === 'import' && (<div className="import-export-section">
          <div className="import-form">
            <h3>Import Date</h3>
            <div className="form-group">
              <label>Tip Import *</label>
              <select value={importType} onChange={function (e) { return setImportType(e.target.value); }}>
                {IMPORT_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>{type.label}</option>); })}
              </select>
            </div>
            <div className="form-group">
              <label>Fișier *</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange}/>
              {importFile && (<div className="file-info">
                  <p>📄 {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)</p>
                  {parsingFile ? (<p className="text-muted">⏳ Se analizează fișierul...</p>) : fileRowCount !== null ? (<p className="text-success">
                      ✅ {fileRowCount} {fileRowCount === 1 ? 'înregistrare' : 'înregistrări'} detectate
                    </p>) : null}
                </div>)}
            </div>
            
            {/* Filtre Import */}
            <div className="form-group">
              <label>Mod Import *</label>
              <select value={importFilters.mode} onChange={function (e) { return setImportFilters(__assign(__assign({}, importFilters), { mode: e.target.value })); }}>
                <option value="create">Creează doar (skip dacă există)</option>
                <option value="update">Actualizează doar (skip dacă nu există)</option>
                <option value="upsert">"creeaza sau actualizeaza"</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <input type="checkbox" checked={importFilters.skipFirstRow} onChange={function (e) { return setImportFilters(__assign(__assign({}, importFilters), { skipFirstRow: e.target.checked })); }}/>
                ' 'Sare prima linie (header)
              </label>
            </div>
            
            <button className="btn btn-primary" onClick={handleImport} disabled={!importFile || !fileRowCount || fileRowCount === 0 || parsingFile}>
              📥 Importă {fileRowCount ? "(".concat(fileRowCount, " \u00EEnregistr\u0103ri)") : ''}
            </button>
          </div>

          <div className="import-history">
            <h3>Istoric Import</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>"Fișier"</th>
                  <th>Status</th>
                  <th>"Înregistrări"</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {importHistory && importHistory.length > 0 ? (importHistory.map(function (item) { return (<tr key={item.id}>
                      <td>{item.type}</td>
                      <td>{item.file_name}</td>
                      <td>
                        <span className={"badge badge-".concat(item.status === 'success' ? 'success' : item.status === 'error' ? 'danger' : 'warning')}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.records_imported}/{item.records_total}</td>
                      <td>{new Date(item.created_at).toLocaleString('ro-RO')}</td>
                    </tr>); })) : (<tr>
                    <td colSpan={5} className="text-center">"nu exista import uri"</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>)}

      {activeTab === 'export' && (<div className="import-export-section">
          <div className="export-form">
            <h3>Export Date</h3>
            <div className="form-group">
              <label>Tip Export *</label>
              <select value={exportType} onChange={function (e) { return setExportType(e.target.value); }}>
                {EXPORT_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>{type.label}</option>); })}
              </select>
            </div>
            <div className="form-group">
              <label>Format *</label>
              <select value={exportFormat} onChange={function (e) { return setExportFormat(e.target.value); }}>
                {EXPORT_FORMATS.map(function (format) { return (<option key={format.value} value={format.value}>{format.label}</option>); })}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleExport}>
              📤 Exportă
            </button>
          </div>

          <div className="export-history">
            <h3>Istoric Export</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory && exportHistory.length > 0 ? (exportHistory.map(function (item) { return (<tr key={item.id}>
                      <td>{item.type}</td>
                      <td>{item.format.toUpperCase()}</td>
                      <td>
                        <span className={"badge badge-".concat(item.status === 'success' ? 'success' : item.status === 'error' ? 'danger' : 'warning')}>
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.created_at).toLocaleString('ro-RO')}</td>
                      <td>
                        {item.file_path && item.status === 'success' && (<button className="btn btn-sm btn-primary">
                            ⬇️ Download
                          </button>)}
                      </td>
                    </tr>); })) : (<tr>
                    <td colSpan={5} className="text-center">"nu exista export uri"</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>);
};
exports.ImportExportPage = ImportExportPage;
