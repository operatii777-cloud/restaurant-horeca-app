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
exports.PaymentMethodsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./PaymentMethodsPage.css");
var PaymentMethodsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), methods = _a[0], setMethods = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(null), editingMethod = _d[0], setEditingMethod = _d[1];
    var _e = (0, react_1.useState)(null), alert = _e[0], setAlert = _e[1];
    var _f = (0, useApiQuery_1.useApiQuery)('/api/settings/payment-methods'), data = _f.data, refetch = _f.refetch;
    var createMutation = (0, useApiMutation_1.useApiMutation)();
    var updateMutation = (0, useApiMutation_1.useApiMutation)();
    var deleteMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (data) {
            setMethods(data);
            setLoading(false);
        }
    }, [data]);
    var handleSave = function (method) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(editingMethod === null || editingMethod === void 0 ? void 0 : editingMethod.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateMutation.mutate({
                            url: "/api/settings/payment-methods/".concat(editingMethod.id),
                            method: 'PUT',
                            data: method
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Metodă de plată actualizată cu succes!' });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createMutation.mutate({
                        url: '/api/settings/payment-methods',
                        method: 'POST',
                        data: method
                    })];
                case 3:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Metodă de plată creată cu succes!' });
                    _a.label = 4;
                case 4:
                    setShowModal(false);
                    setEditingMethod(null);
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
                    if (!confirm('Sigur doriți să ștergeți această metodă de plată?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMutation.mutate({
                            url: "/api/settings/payment-methods/\"Id\"",
                            method: 'DELETE'
                        })];
                case 2:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Metodă de plată ștearsă cu succes!' });
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
    var handleToggleActive = function (method) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateMutation.mutate({
                            url: "/api/settings/payment-methods/".concat(method.id),
                            method: 'PUT',
                            data: __assign(__assign({}, method), { is_active: !method.is_active })
                        })];
                case 1:
                    _a.sent();
                    refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    setAlert({ type: 'error', message: error_3.message || 'Eroare la actualizare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="payment-methods-page">Se încarcă...</div>;
    }
    return (<div className="payment-methods-page">
      <PageHeader_1.PageHeader title="metode de plata" description="Gestionare metode de plată acceptate în restaurant"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="payment-methods-page__actions">
        <button className="btn btn-primary" onClick={function () {
            setEditingMethod(null);
            setShowModal(true);
        }}>
          ➕ Adaugă Metodă de Plată
        </button>
      </div>

      <div className="payment-methods-page__table">
        <table className="table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Nume</th>
              <th>Cod</th>
              <th>Comision %</th>
              <th>Comision Fix</th>
              <th>Status</th>
              <th>"Acțiuni"</th>
            </tr>
          </thead>
          <tbody>
            {methods.length === 0 ? (<tr>
                <td colSpan={7} className="text-center">"nu exista metode de plata configurate"</td>
              </tr>) : (methods.map(function (method) { return (<tr key={method.id}>
                  <td>{method.icon || '💳'}</td>
                  <td>{method.display_name}</td>
                  <td><code>{method.code}</code></td>
                  <td>{method.fee_percentage}%</td>
                  <td>{method.fee_fixed.toFixed(2)} RON</td>
                  <td>
                    <span className={"badge ".concat(method.is_active ? 'badge-success' : 'badge-secondary')}>
                      {method.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={function () {
                setEditingMethod(method);
                setShowModal(true);
            }}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-sm btn-warning" onClick={function () { return handleToggleActive(method); }}>
                      {method.is_active ? '⏸️ Dezactivează' : '▶️ Activează'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={function () { return method.id && handleDelete(method.id); }}>
                      🗑️ Șterge
                    </button>
                  </td>
                </tr>); }))}
          </tbody>
        </table>
      </div>

      {showModal && (<PaymentMethodModal method={editingMethod} onSave={handleSave} onClose={function () {
                setShowModal(false);
                setEditingMethod(null);
            }}/>)}
    </div>);
};
exports.PaymentMethodsPage = PaymentMethodsPage;
var PaymentMethodModal = function (_a) {
    var _b, _c;
    var method = _a.method, onSave = _a.onSave, onClose = _a.onClose;
    var _d = (0, react_1.useState)({
        name: (method === null || method === void 0 ? void 0 : method.name) || '',
        code: (method === null || method === void 0 ? void 0 : method.code) || '',
        display_name: (method === null || method === void 0 ? void 0 : method.display_name) || '',
        display_name_en: (method === null || method === void 0 ? void 0 : method.display_name_en) || '',
        icon: (method === null || method === void 0 ? void 0 : method.icon) || '💳',
        is_active: (_b = method === null || method === void 0 ? void 0 : method.is_active) !== null && _b !== void 0 ? _b : true,
        fee_percentage: (method === null || method === void 0 ? void 0 : method.fee_percentage) || 0,
        fee_fixed: (method === null || method === void 0 ? void 0 : method.fee_fixed) || 0,
        requires_change: (method === null || method === void 0 ? void 0 : method.requires_change) || false,
        requires_receipt: (_c = method === null || method === void 0 ? void 0 : method.requires_receipt) !== null && _c !== void 0 ? _c : true,
        sort_order: (method === null || method === void 0 ? void 0 : method.sort_order) || 0,
        location_id: method === null || method === void 0 ? void 0 : method.location_id,
    }), formData = _d[0], setFormData = _d[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSave(formData);
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h3>{method ? 'Editare Metodă de Plată' : 'Adaugă Metodă de Plată'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume *</label>
            <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required/>
          </div>
          <div className="form-group">
            <label>Cod *</label>
            <input type="text" value={formData.code} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { code: e.target.value })); }} required placeholder="cash, card, voucher"/>
          </div>
          <div className="form-group">
            <label>Nume Afișare *</label>
            <input type="text" value={formData.display_name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { display_name: e.target.value })); }} required/>
          </div>
          <div className="form-group">
            <label>Icon</label>
            <input type="text" value={formData.icon} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { icon: e.target.value })); }} placeholder="💳"/>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Comision %</label>
              <input type="number" step="0.01" value={formData.fee_percentage} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { fee_percentage: parseFloat(e.target.value) || 0 })); }}/>
            </div>
            <div className="form-group">
              <label>Comision Fix (RON)</label>
              <input type="number" step="0.01" value={formData.fee_fixed} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { fee_fixed: parseFloat(e.target.value) || 0 })); }}/>
            </div>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.requires_change} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { requires_change: e.target.checked })); }}/>
              Necesită rest (cash)
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.requires_receipt} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { requires_receipt: e.target.checked })); }}/>"necesita bon fiscal"</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>"Anulează"</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>);
};
