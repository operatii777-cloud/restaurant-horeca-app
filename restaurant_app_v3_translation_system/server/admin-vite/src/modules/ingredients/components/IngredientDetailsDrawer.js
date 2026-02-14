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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientDetailsDrawer = IngredientDetailsDrawer;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var SideDrawer_1 = require("@/shared/components/SideDrawer");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
require("./IngredientDetailsDrawer.css");
var DOCUMENT_TYPES = [
    { label: 'Certificat veterinar', value: 'vet_certificate' },
    { label: 'Analize laborator', value: 'lab_report' },
    { label: 'Registru temperatură', value: 'temperature_log' },
    { label: 'Notificare recall', value: 'recall_notice' },
    { label: 'Alt document', value: 'other' },
];
function IngredientDetailsDrawer(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var ingredient = _a.ingredient, open = _a.open, onClose = _a.onClose, onVisibilityChanged = _a.onVisibilityChanged, _f = _a.initialTab, initialTab = _f === void 0 ? 'overview' : _f;
    //   const { t } = useTranslation();
    var _g = (0, react_1.useState)(initialTab), activeTab = _g[0], setActiveTab = _g[1];
    var _h = (0, react_1.useState)([]), documents = _h[0], setDocuments = _h[1];
    var _j = (0, react_1.useState)([]), suppliers = _j[0], setSuppliers = _j[1];
    var _k = (0, react_1.useState)([]), traceRows = _k[0], setTraceRows = _k[1];
    var _l = (0, react_1.useState)(false), loading = _l[0], setLoading = _l[1];
    var _m = (0, react_1.useState)(null), error = _m[0], setError = _m[1];
    var _o = (0, react_1.useState)({
        document_type: 'vet_certificate',
        file_path: '',
        issue_date: '',
        expiry_date: '',
        notes: '',
    }), documentForm = _o[0], setDocumentForm = _o[1];
    var _p = (0, react_1.useState)(false), documentSubmitting = _p[0], setDocumentSubmitting = _p[1];
    var ingredientId = (_b = ingredient === null || ingredient === void 0 ? void 0 : ingredient.id) !== null && _b !== void 0 ? _b : null;
    (0, react_1.useEffect)(function () {
        if (!open || !ingredientId)
            return;
        setLoading(true);
        setError(null);
        var fetchDocuments = httpClient_1.httpClient
            .get("/api/ingredients/".concat(ingredientId, "/documents"))
            .then(function (response) { var _a; return (Array.isArray((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) ? response.data.data : []); })
            .catch(function (apiError) {
            var _a, _b, _c;
            console.error('❌ Eroare la încărcarea documentelor ingredient:', apiError);
            throw new Error((_c = (_b = (_a = apiError === null || apiError === void 0 ? void 0 : apiError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Nu s-au putut încărca documentele.');
        });
        var fetchSuppliers = httpClient_1.httpClient
            .get("/api/ingredients/".concat(ingredientId, "/suppliers"))
            .then(function (response) { var _a; return (Array.isArray((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) ? response.data.data : []); })
            .catch(function (apiError) {
            var _a, _b, _c;
            console.error('❌ Eroare la încărcarea furnizorilor ingredientului:', apiError);
            throw new Error((_c = (_b = (_a = apiError === null || apiError === void 0 ? void 0 : apiError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Nu s-au putut încărca furnizorii.');
        });
        var fetchTrace = httpClient_1.httpClient
            .get("/api/ingredients/".concat(ingredientId, "/traceability"))
            .then(function (response) { var _a; return (Array.isArray((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) ? response.data.data : []); })
            .catch(function (apiError) {
            var _a, _b, _c;
            console.error('❌ Eroare la încărcarea trasabilității ingredientului:', apiError);
            throw new Error((_c = (_b = (_a = apiError === null || apiError === void 0 ? void 0 : apiError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Nu s-a putut încărca trasabilitatea.');
        });
        Promise.allSettled([fetchDocuments, fetchSuppliers, fetchTrace])
            .then(function (results) {
            var _a, _b;
            var docsResult = results[0], suppliersResult = results[1], traceResult = results[2];
            if (docsResult.status === 'fulfilled') {
                setDocuments(docsResult.value);
            }
            if (suppliersResult.status === 'fulfilled') {
                setSuppliers(suppliersResult.value);
            }
            if (traceResult.status === 'fulfilled') {
                setTraceRows(traceResult.value);
            }
            var firstRejected = results.find(function (result) { return result.status === 'rejected'; });
            if (firstRejected && firstRejected.status === 'rejected') {
                setError((_b = (_a = firstRejected.reason) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Nu s-au putut încărca toate datele.');
            }
        })
            .finally(function () { return setLoading(false); });
    }, [open, ingredientId]);
    (0, react_1.useEffect)(function () {
        if (!open) {
            setActiveTab(initialTab);
            setError(null);
            setDocumentSubmitting(false);
        }
        else {
            setActiveTab(initialTab);
        }
    }, [open, initialTab]);
    var handleDeleteDocument = (0, react_1.useCallback)(function (documentId) { return __awaiter(_this, void 0, void 0, function () {
        var apiError_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/ingredients/documents/".concat(documentId))];
                case 1:
                    _d.sent();
                    setDocuments(function (prev) { return prev.filter(function (doc) { return doc.id !== documentId; }); });
                    return [3 /*break*/, 3];
                case 2:
                    apiError_1 = _d.sent();
                    console.error('❌ Eroare la ștergerea documentului ingredient:', apiError_1);
                    setError((_c = (_b = (_a = apiError_1 === null || apiError_1 === void 0 ? void 0 : apiError_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Nu s-a putut șterge documentul.');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleDocumentFormChange = (0, react_1.useCallback)(function (field, value) {
        setDocumentForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    }, []);
    var handleSubmitDocument = (0, react_1.useCallback)(function (event) { return __awaiter(_this, void 0, void 0, function () {
        var payload_1, response, newId_1, apiError_2;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    event.preventDefault();
                    if (!ingredientId)
                        return [2 /*return*/];
                    if (!documentForm.file_path.trim()) {
                        setError('Completează calea fișierului sau referința documentului.');
                        return [2 /*return*/];
                    }
                    setDocumentSubmitting(true);
                    setError(null);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, 4, 5]);
                    payload_1 = {
                        document_type: documentForm.document_type,
                        file_path: documentForm.file_path.trim(),
                        issue_date: documentForm.issue_date || null,
                        expiry_date: documentForm.expiry_date || null,
                        notes: ((_a = documentForm.notes) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                    };
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/ingredients/".concat(ingredientId, "/documents"), payload_1)];
                case 2:
                    response = _f.sent();
                    newId_1 = (_b = response.data) === null || _b === void 0 ? void 0 : _b.document_id;
                    setDocuments(function (prev) { return __spreadArray([
                        __assign(__assign({ id: newId_1 !== null && newId_1 !== void 0 ? newId_1 : Math.random() }, payload_1), { created_at: new Date().toISOString() })
                    ], prev, true); });
                    setDocumentForm({
                        document_type: 'vet_certificate',
                        file_path: '',
                        issue_date: '',
                        expiry_date: '',
                        notes: '',
                    });
                    return [3 /*break*/, 5];
                case 3:
                    apiError_2 = _f.sent();
                    console.error('❌ Eroare la adăugarea documentului ingredient:', apiError_2);
                    setError((_e = (_d = (_c = apiError_2 === null || apiError_2 === void 0 ? void 0 : apiError_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) !== null && _e !== void 0 ? _e : 'Nu s-a putut adăuga documentul.');
                    return [3 /*break*/, 5];
                case 4:
                    setDocumentSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [documentForm, ingredientId]);
    var formattedTraceRows = (0, react_1.useMemo)(function () {
        //   const { t } = useTranslation();
        return traceRows.map(function (row) { return (__assign(__assign({}, row), { orderTimestamp: row.order_timestamp ? new Date(row.order_timestamp).toLocaleString('ro-RO') : '-', batchExpiry: row.expiry_date ? new Date(row.expiry_date).toLocaleDateString('ro-RO') : '-', batchPurchase: row.purchase_date ? new Date(row.purchase_date).toLocaleDateString('ro-RO') : '-', createdAt: row.created_at ? new Date(row.created_at).toLocaleString('ro-RO') : '-', isPaidLabel: row.is_paid ? 'Da' : 'Nu' })); });
    }, [traceRows]);
    var handleVisibilityAction = (0, react_1.useCallback)(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var apiError_3;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!ingredientId)
                        return [2 /*return*/];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, onVisibilityChanged(action)];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    apiError_3 = _d.sent();
                    console.error("\u274C Eroare la ".concat(action === 'hide' ? 'ascunderea' : 'restaurarea', " ingredientului din drawer"), apiError_3);
                    setError((_c = (_b = (_a = apiError_3 === null || apiError_3 === void 0 ? void 0 : apiError_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Operațiunea de vizibilitate a eșuat.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [ingredientId, onVisibilityChanged]);
    return (<SideDrawer_1.SideDrawer open={open} onClose={onClose} width={560} title={ingredient ? "Detalii ingredient \u00B7 ".concat(ingredient.name) : 'Detalii ingredient'} description={ingredient
            ? "Unitate: ".concat((_c = ingredient.unit) !== null && _c !== void 0 ? _c : '-', " \u00B7 Categorie: ").concat((_d = ingredient.category) !== null && _d !== void 0 ? _d : 'n/a')
            : undefined}>
      <div className="ingredient-details">
        <div className="ingredient-details__tabs" role="tablist">
          <button type="button" className={activeTab === 'overview' ? 'is-active' : ''} onClick={function () { return setActiveTab('overview'); }} role="tab">
            Overview
          </button>
          <button type="button" className={activeTab === 'documents' ? 'is-active' : ''} onClick={function () { return setActiveTab('documents'); }} role="tab">"documente haccp"</button>
          <button type="button" className={activeTab === 'suppliers' ? 'is-active' : ''} onClick={function () { return setActiveTab('suppliers'); }} role="tab">
            Furnizori
          </button>
          <button type="button" className={activeTab === 'traceability' ? 'is-active' : ''} onClick={function () { return setActiveTab('traceability'); }} role="tab">
            Trasabilitate
          </button>
        </div>

        {error ? (<InlineAlert_1.InlineAlert variant="warning" title="Atenție" message={error}/>) : null}

        {loading ? <p className="ingredient-details__loading">"se incarca detaliile"</p> : null}

        {ingredient && activeTab === 'overview' ? (<section className="ingredient-details__section">
            <h3>"informatii generale"</h3>
            <ul className="ingredient-details__list">
              <li>
                <span>"nume oficial"</span>
                <strong>{ingredient.official_name || '—'}</strong>
              </li>
              <li>
                <span>"denumire en"</span>
                <strong>{ingredient.name_en || '—'}</strong>
              </li>
              <li>
                <span>"tara origine"</span>
                <strong>{ingredient.origin_country || '—'}</strong>
              </li>
              <li>
                <span>"stoc curent"</span>
                <strong>
                  {ingredient.current_stock !== undefined ? "".concat(ingredient.current_stock, " ").concat((_e = ingredient.unit) !== null && _e !== void 0 ? _e : '') : '—'}
                </strong>
              </li>
              <li>
                <span>Stoc minim</span>
                <strong>{ingredient.min_stock !== undefined ? ingredient.min_stock : '—'}</strong>
              </li>
              <li>
                <span>Cost / unitate</span>
                <strong>
                  {ingredient.cost_per_unit !== undefined ? "".concat(Number(ingredient.cost_per_unit).toFixed(2), " RON") : '—'}
                </strong>
              </li>
              <li>
                <span>"temperatura depozitare"</span>
                <strong>
                  {ingredient.storage_temp_min !== null && ingredient.storage_temp_min !== undefined
                ? "".concat(ingredient.storage_temp_min, "\u00B0C")
                : '—'}' '
                  /' '
                  {ingredient.storage_temp_max !== null && ingredient.storage_temp_max !== undefined
                ? "".concat(ingredient.storage_temp_max, "\u00B0C")
                : '—'}
                </strong>
              </li>
              <li>
                <span>Cod trasabilitate</span>
                <strong>{ingredient.traceability_code || '—'}</strong>
              </li>
              <li>
                <span>Note HACCP</span>
                <strong>{ingredient.haccp_notes || 'Nu au fost adăugate note HACCP.'}</strong>
              </li>
              <li>
                <span>"allergeni declarati"</span>
                <strong>{ingredient.allergens || '—'}</strong>
              </li>
              <li>
                <span>Pot. alergeni</span>
                <strong>{ingredient.potential_allergens || '—'}</strong>
              </li>
              <li>
                <span>Aditivi</span>
                <strong>{ingredient.additives || '—'}</strong>
              </li>
              <li>
                <span>Ultima actualizare</span>
                <strong>
                  {ingredient.last_updated ? new Date(ingredient.last_updated).toLocaleString('ro-RO') : '—'}
                </strong>
              </li>
            </ul>

            <div className="ingredient-details__actions">
              <button type="button" className="ingredient-details__action" onClick={function () { return handleVisibilityAction('hide'); }} disabled={ingredient.is_hidden === 1 || ingredient.is_hidden === true}>
                👻 Marchează neinventariabil
              </button>
              <button type="button" className="ingredient-details__action" onClick={function () { return handleVisibilityAction('restore'); }} disabled={!(ingredient.is_hidden === 1 || ingredient.is_hidden === true)}>
                ✅ Restaurează ingredientul
              </button>
            </div>
          </section>) : null}

        {activeTab === 'documents' ? (<section className="ingredient-details__section">
            <h3>"documente haccp"</h3>
            <form className="ingredient-document-form" onSubmit={handleSubmitDocument}>
              <label>
                <span>"tip document"</span>
                <select value={documentForm.document_type} onChange={function (event) { return handleDocumentFormChange('document_type', event.target.value); }}>
                  {DOCUMENT_TYPES.map(function (option) { return (<option key={option.value} value={option.value}>
                      {option.label}
                    </option>); })}
                </select>
              </label>
              <label>
                <span>Fișier / referință</span>
                <input type="text" value={documentForm.file_path} placeholder="Ex: /docs/haccp/lot-123.pdf" onChange={function (event) { return handleDocumentFormChange('file_path', event.target.value); }}/>
              </label>
              <div className="ingredient-document-form__grid">
                <label>
                  <span>"emis la"</span>
                  <input type="date" value={documentForm.issue_date} onChange={function (event) { return handleDocumentFormChange('issue_date', event.target.value); }}/>
                </label>
                <label>
                  <span>"expira la"</span>
                  <input type="date" value={documentForm.expiry_date} onChange={function (event) { return handleDocumentFormChange('expiry_date', event.target.value); }}/>
                </label>
              </div>
              <label>
                <span>Note</span>
                <textarea value={documentForm.notes} rows={2} onChange={function (event) { return handleDocumentFormChange('notes', event.target.value); }} placeholder='[ex_verificat_temperatura_la_receptie_4°c]'/>
              </label>
              <button type="submit" className="ingredient-details__action" disabled={documentSubmitting}>
                {documentSubmitting ? 'Se adaugă…' : 'Adaugă document'}
              </button>
            </form>

            <table className="ingredient-details__table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Fișier / link</th>
                  <th>Emis</th>
                  <th>Expiră</th>
                  <th>Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (<tr>
                    <td colSpan={6} className="ingredient-details__empty">"nu exista documente atasate"</td>
                  </tr>) : (documents.map(function (doc) {
                var _a, _b, _c;
                return (<tr key={doc.id}>
                      <td>{(_a = doc.document_type) !== null && _a !== void 0 ? _a : '—'}</td>
                      <td className="ingredient-details__mono">{(_b = doc.file_path) !== null && _b !== void 0 ? _b : '—'}</td>
                      <td>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('ro-RO') : '—'}</td>
                      <td>{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('ro-RO') : '—'}</td>
                      <td>{(_c = doc.notes) !== null && _c !== void 0 ? _c : '—'}</td>
                      <td className="ingredient-details__actions-cell">
                        <button type="button" className="ingredient-details__action ingredient-details__action--destructive" onClick={function () { return handleDeleteDocument(doc.id); }}>"Șterge"</button>
                      </td>
                    </tr>);
            }))}
              </tbody>
            </table>
          </section>) : null}

        {activeTab === 'suppliers' ? (<section className="ingredient-details__section">
            <h3>"furnizori asociati"</h3>
            <table className="ingredient-details__table">
              <thead>
                <tr>
                  <th>Furnizor</th>
                  <th>Principal</th>
                  <th>Cod intern</th>
                  <th>Lead time</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (<tr>
                    <td colSpan={5} className="ingredient-details__empty">"nu sunt furnizori asociati acestui ingredient"</td>
                  </tr>) : (suppliers.map(function (link) {
                var _a, _b, _c;
                return (<tr key={link.id}>
                      <td>{link.name}</td>
                      <td>{link.is_primary ? 'Da' : 'Nu'}</td>
                      <td>{(_a = link.supplier_code) !== null && _a !== void 0 ? _a : '—'}</td>
                      <td>{link.lead_time_days ? "".concat(link.lead_time_days, " zile") : '—'}</td>
                      <td>
                        <div className="ingredient-details__contact">
                          <span>{(_b = link.phone) !== null && _b !== void 0 ? _b : '—'}</span>
                          <span>{(_c = link.email) !== null && _c !== void 0 ? _c : '—'}</span>
                        </div>
                      </td>
                    </tr>);
            }))}
              </tbody>
            </table>
          </section>) : null}

        {activeTab === 'traceability' ? (<section className="ingredient-details__section">
            <h3>"trasabilitate loturi si comenzi"</h3>
            <table className="ingredient-details__table">
              <thead>
                <tr>
                  <th>"id comanda"</th>
                  <th>Lot</th>
                  <th>Cantitate</th>
                  <th>"data comanda"</th>
                  <th>Statut</th>
                  <th>"Plătită"</th>
                  <th>Furnizor lot</th>
                  <th>Expiră</th>
                </tr>
              </thead>
              <tbody>
                {formattedTraceRows.length === 0 ? (<tr>
                    <td colSpan={8} className="ingredient-details__empty">"nu exista trasabilitate disponibila pentru acest i"</td>
                  </tr>) : (formattedTraceRows.map(function (row) {
                var _a, _b, _c, _d;
                return (<tr key={"".concat(row.order_id, "-").concat(row.batch_id, "-").concat(row.created_at)}>
                      <td>#{row.order_id}</td>
                      <td>{(_a = row.batch_number) !== null && _a !== void 0 ? _a : "Lot ".concat(row.batch_id)}</td>
                      <td>{"".concat(row.quantity_used, " ").concat((_b = ingredient === null || ingredient === void 0 ? void 0 : ingredient.unit) !== null && _b !== void 0 ? _b : '')}</td>
                      <td>{row.orderTimestamp}</td>
                      <td>{(_c = row.order_status) !== null && _c !== void 0 ? _c : '—'}</td>
                      <td>{row.isPaidLabel}</td>
                      <td>{(_d = row.supplier) !== null && _d !== void 0 ? _d : '—'}</td>
                      <td>{row.batchExpiry}</td>
                    </tr>);
            }))}
              </tbody>
            </table>
          </section>) : null}
      </div>
    </SideDrawer_1.SideDrawer>);
}
