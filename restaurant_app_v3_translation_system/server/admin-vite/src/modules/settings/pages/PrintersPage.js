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
exports.PrintersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./PrintersPage.css");
var PRINTER_TYPES = [
    { value: 'kitchen', label: 'Bucătărie' },
    { value: 'bar', label: 'Bar' },
    { value: 'receipt', label: 'Bon' },
    { value: "Label", label: 'Etichetă' },
    { value: 'fiscal', label: 'Fiscal' },
];
var PrintersPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), printers = _a[0], setPrinters = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(null), editingPrinter = _d[0], setEditingPrinter = _d[1];
    var _e = (0, react_1.useState)(null), alert = _e[0], setAlert = _e[1];
    var _f = (0, useApiQuery_1.useApiQuery)('/api/settings/printers'), data = _f.data, refetch = _f.refetch;
    var createMutation = (0, useApiMutation_1.useApiMutation)();
    var updateMutation = (0, useApiMutation_1.useApiMutation)();
    var deleteMutation = (0, useApiMutation_1.useApiMutation)();
    var testMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (data) {
            setPrinters(data);
            setLoading(false);
        }
    }, [data]);
    var handleSave = function (printer) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(editingPrinter === null || editingPrinter === void 0 ? void 0 : editingPrinter.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateMutation.mutate({
                            url: "/api/settings/printers/".concat(editingPrinter.id),
                            method: 'PUT',
                            data: printer
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Imprimantă actualizată cu succes!' });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createMutation.mutate({
                        url: '/api/settings/printers',
                        method: 'POST',
                        data: printer
                    })];
                case 3:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Imprimantă adăugată cu succes!' });
                    _a.label = 4;
                case 4:
                    setShowModal(false);
                    setEditingPrinter(null);
                    refetch();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    setAlert({ type: 'error', message: error_1.message || 'Eroare la salvare' });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Sigur doriți să ștergeți această imprimantă?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMutation.mutate({
                            url: "/api/settings/printers/\"Id\"",
                            method: 'DELETE'
                        })];
                case 2:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Imprimantă ștearsă cu succes!' });
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    setAlert({ type: 'error', message: error_2.message || 'Eroare la ștergere' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleTestPrint = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, testMutation.mutate({
                            url: "/api/settings/printers/\"Id\"/test",
                            method: 'POST'
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Test print trimis!' });
                    refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    setAlert({ type: 'error', message: error_3.message || 'Eroare la test print' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="printers-page">Se încarcă...</div>;
    }
    return (<div className="printers-page">
      <PageHeader_1.PageHeader title='Imprimante & Periferice' description="Gestionare imprimante pentru bucătărie, bar, bon și etichetă"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="printers-page__actions">
        <button className="btn btn-primary" onClick={function () {
            setEditingPrinter(null);
            setShowModal(true);
        }}>
          ➕ Adaugă Imprimantă
        </button>
      </div>

      <div className="printers-page__table">
        <table className="table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Tip</th>
              <th>IP/Port</th>
              <th>Conectare</th>
              <th>Status</th>
              <th>Test Print</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {printers.length === 0 ? (<tr>
                <td colSpan={7} className="text-center">Nu există imprimante configurate</td>
              </tr>) : (printers.map(function (printer) {
            var _a;
            return (<tr key={printer.id}>
                  <td><strong>{printer.name}</strong></td>
                  <td>
                    <span className="badge badge-info">
                      {((_a = PRINTER_TYPES.find(function (t) { return t.value === printer.type; })) === null || _a === void 0 ? void 0 : _a.label) || printer.type}
                    </span>
                  </td>
                  <td>
                    {printer.ip_address ? (<code>{printer.ip_address}:{printer.port}</code>) : (<span className="text-muted">-</span>)}
                  </td>
                  <td>{printer.connection_type}</td>
                  <td>
                    <span className={"badge ".concat(printer.is_active ? 'badge-success' : 'badge-secondary')}>
                      {printer.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>
                    {printer.test_print_count > 0 && (<span className="text-muted">
                        {printer.test_print_count} teste
                      </span>)}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-info" onClick={function () { return printer.id && handleTestPrint(printer.id); }}>
                      🖨️ Test
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={function () {
                    setEditingPrinter(printer);
                    setShowModal(true);
                }}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={function () { return printer.id && handleDelete(printer.id); }}>
                      🗑️ Șterge
                    </button>
                  </td>
                </tr>);
        }))}
          </tbody>
        </table>
      </div>

      {showModal && (<PrinterModal printer={editingPrinter} onSave={handleSave} onClose={function () {
                setShowModal(false);
                setEditingPrinter(null);
            }}/>)}
    </div>);
};
exports.PrintersPage = PrintersPage;
var PrinterModal = function (_a) {
    var _b, _c;
    var printer = _a.printer, onSave = _a.onSave, onClose = _a.onClose;
    var _d = (0, react_1.useState)({
        name: (printer === null || printer === void 0 ? void 0 : printer.name) || '',
        type: (printer === null || printer === void 0 ? void 0 : printer.type) || 'kitchen',
        ip_address: (printer === null || printer === void 0 ? void 0 : printer.ip_address) || '',
        port: (printer === null || printer === void 0 ? void 0 : printer.port) || 9100,
        connection_type: (printer === null || printer === void 0 ? void 0 : printer.connection_type) || 'network',
        is_active: (_b = printer === null || printer === void 0 ? void 0 : printer.is_active) !== null && _b !== void 0 ? _b : true,
        auto_print: (_c = printer === null || printer === void 0 ? void 0 : printer.auto_print) !== null && _c !== void 0 ? _c : true,
        paper_width: (printer === null || printer === void 0 ? void 0 : printer.paper_width) || 80,
        test_print_count: (printer === null || printer === void 0 ? void 0 : printer.test_print_count) || 0,
    }), formData = _d[0], setFormData = _d[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSave(formData);
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h3>{printer ? 'Editare Imprimantă' : 'Adaugă Imprimantă'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume *</label>
            <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required/>
          </div>
          <div className="form-group">
            <label>Tip *</label>
            <select value={formData.type} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { type: e.target.value })); }} required>
              {PRINTER_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>
                  {type.label}
                </option>); })}
            </select>
          </div>
          <div className="form-group">
            <label>Tip Conectare *</label>
            <select value={formData.connection_type} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { connection_type: e.target.value })); }} required>
              <option value="network">Network (IP)</option>
              <option value="usb">USB</option>
              <option value="serial">Serial (COM)</option>
            </select>
          </div>
          {formData.connection_type === 'network' && (<>
              <div className="form-row">
                <div className="form-group">
                  <label>IP Address *</label>
                  <input type="text" value={formData.ip_address} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { ip_address: e.target.value })); }} required placeholder="192.168.1.100"/>
                </div>
                <div className="form-group">
                  <label>Port *</label>
                  <input type="number" value={formData.port} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { port: parseInt(e.target.value) || 9100 })); }} required/>
                </div>
              </div>
            </>)}
          <div className="form-group">
            <label>Lățime Hârtie (mm)</label>
            <input type="number" value={formData.paper_width} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { paper_width: parseInt(e.target.value) || 80 })); }}/>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.auto_print} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { auto_print: e.target.checked })); }}/>Print automat la comandă</label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.is_active} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_active: e.target.checked })); }}/>Activă</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>);
};
