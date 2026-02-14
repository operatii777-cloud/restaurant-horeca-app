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
exports.PriceUtilitiesPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./PriceUtilitiesPage.css");
var PriceUtilitiesPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('bulk-update'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), feedback = _d[0], setFeedback = _d[1];
    // Bulk Update State
    var _e = (0, react_1.useState)('percentage'), bulkUpdateType = _e[0], setBulkUpdateType = _e[1];
    var _f = (0, react_1.useState)(''), bulkUpdateValue = _f[0], setBulkUpdateValue = _f[1];
    var _g = (0, react_1.useState)('cost * 2.5'), bulkUpdateFormula = _g[0], setBulkUpdateFormula = _g[1];
    var _h = (0, react_1.useState)([]), bulkUpdatePreview = _h[0], setBulkUpdatePreview = _h[1];
    var _j = (0, react_1.useState)([]), selectedProducts = _j[0], setSelectedProducts = _j[1];
    var _k = (0, react_1.useState)(''), productFilter = _k[0], setProductFilter = _k[1];
    // Price History State
    var _l = (0, react_1.useState)([]), priceHistory = _l[0], setPriceHistory = _l[1];
    var _m = (0, react_1.useState)(null), historyProductId = _m[0], setHistoryProductId = _m[1];
    // Price Rules State
    var _o = (0, react_1.useState)([]), priceRules = _o[0], setPriceRules = _o[1];
    var _p = (0, react_1.useState)(false), showRuleModal = _p[0], setShowRuleModal = _p[1];
    var _q = (0, react_1.useState)(null), editingRule = _q[0], setEditingRule = _q[1];
    var _r = (0, react_1.useState)({
        name: '',
        rule_type: 'cost_multiplier',
        condition_json: '{}',
        action_json: '{}',
        is_active: 1,
        priority: 0,
    }), ruleFormData = _r[0], setRuleFormData = _r[1];
    var fetchPriceHistory = (0, react_1.useCallback)(function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var endpoint, response, data, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    endpoint = productId
                        ? "/api/admin/prices/history/".concat(productId)
                        : '/api/admin/prices/history';
                    return [4 /*yield*/, httpClient_1.httpClient.get(endpoint)];
                case 1:
                    response = _b.sent();
                    data = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    setPriceHistory(data);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea istoricului:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea istoricului');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchPriceRules = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/price-rules')];
                case 1:
                    response = _b.sent();
                    data = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    setPriceRules(data);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _b.sent();
                    console.error('❌ Eroare la încărcarea regulilor:', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        if (activeTab === 'history') {
            void fetchPriceHistory(historyProductId || undefined);
        }
        else if (activeTab === 'rules') {
            void fetchPriceRules();
        }
    }, [activeTab, historyProductId, fetchPriceHistory, fetchPriceRules]);
    var handleBulkUpdatePreview = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, preview, err_3;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!bulkUpdateValue && bulkUpdateType !== "Formulă") {
                        setFeedback({ type: 'error', message: 'Introdu valoarea pentru actualizare!' });
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/prices/bulk-update/preview', {
                            type: bulkUpdateType,
                            value: bulkUpdateType === "Formulă" ? bulkUpdateFormula : bulkUpdateValue,
                            product_ids: selectedProducts.length > 0 ? selectedProducts : null,
                            filter: productFilter || null,
                        })];
                case 2:
                    response = _d.sent();
                    preview = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    setBulkUpdatePreview(preview);
                    if (preview.length === 0) {
                        setFeedback({ type: 'error', message: 'Nu s-au găsit produse pentru actualizare!' });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _d.sent();
                    console.error('❌ Eroare la preview:', err_3);
                    setFeedback({ type: 'error', message: ((_c = (_b = err_3.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || err_3.message || 'Eroare la preview' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleBulkUpdateApply = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (bulkUpdatePreview.length === 0) {
                        setFeedback({ type: 'error', message: 'Nu există modificări de aplicat!' });
                        return [2 /*return*/];
                    }
                    if (!window.confirm("E\u0219ti sigur c\u0103 vrei s\u0103 actualizezi pre\u021Burile pentru ".concat(bulkUpdatePreview.length, " produse?"))) {
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/prices/bulk-update', {
                            updates: bulkUpdatePreview.map(function (p) { return ({
                                product_id: p.product_id,
                                new_price: p.new_price,
                                reason: "Actualizare \u00EEn mas\u0103: ".concat(bulkUpdateType),
                            }); }),
                        })];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: "Pre\u021Burile au fost actualizate pentru ".concat(bulkUpdatePreview.length, " produse!") });
                    setBulkUpdatePreview([]);
                    setBulkUpdateValue('');
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _c.sent();
                    console.error('❌ Eroare la actualizare:', err_4);
                    setFeedback({ type: 'error', message: ((_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_4.message || 'Eroare la actualizare' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRuleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_5;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(editingRule === null || editingRule === void 0 ? void 0 : editingRule.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/admin/price-rules/".concat(editingRule.id), ruleFormData)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Regulă actualizată cu succes!' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/price-rules', ruleFormData)];
                case 4:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Regulă creată cu succes!' });
                    _c.label = 5;
                case 5:
                    setShowRuleModal(false);
                    void fetchPriceRules();
                    return [3 /*break*/, 7];
                case 6:
                    err_5 = _c.sent();
                    console.error('❌ Eroare la salvare regulă:', err_5);
                    setFeedback({ type: 'error', message: ((_b = (_a = err_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_5.message || 'Eroare la salvare' });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="price-utilities-page">
      <PageHeader_1.PageHeader title='💰 utilitare preturi' description="Gestionare în masă a prețurilor, istoric și reguli automate"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={function () { return setFeedback(null); }} className="mb-4">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return k && setActiveTab(k); }} className="mb-4">
            {/* Tab: Actualizare în Masă */}
            <react_bootstrap_1.Tab eventKey="bulk-update" title={<><i className="fas fa-edit me-1"></i>"actualizare in masa"</>}>
              <div className="mt-4">
                <react_bootstrap_1.Row>
                  <react_bootstrap_1.Col md={6}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>Tip Actualizare</react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Select value={bulkUpdateType} onChange={function (e) { return setBulkUpdateType(e.target.value); }}>
                        <option value="percentage">Creștere/Reducere Procentuală</option>
                        <option value="fixed">Creștere/Reducere Valoare Fixă</option>
                        <option value="formula">Formulă (ex: cost * 2.5)</option>
                      </react_bootstrap_1.Form.Select>
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={6}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>
                        {bulkUpdateType === 'percentage' ? 'Procent (%)' :
            bulkUpdateType === 'fixed' ? 'Valoare (RON)' : 'Formulă'}
                      </react_bootstrap_1.Form.Label>
                      {bulkUpdateType === "Formulă" ? (<react_bootstrap_1.Form.Control type="text" value={bulkUpdateFormula} onChange={function (e) { return setBulkUpdateFormula(e.target.value); }} placeholder="cost * 2.5"/>) : (<react_bootstrap_1.Form.Control type="number" step="0.01" value={bulkUpdateValue} onChange={function (e) { return setBulkUpdateValue(e.target.value); }} placeholder={bulkUpdateType === 'percentage' ? '10 (pentru +10%)' : '5.50'}/>)}
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                </react_bootstrap_1.Row>

                <react_bootstrap_1.Row>
                  <react_bootstrap_1.Col md={12}>
                    <react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label>Filtru Produse (opțional)</react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Control type="text" value={productFilter} onChange={function (e) { return setProductFilter(e.target.value); }} placeholder="cauta dupa nume sau categorie"/>
                    </react_bootstrap_1.Form.Group>
                  </react_bootstrap_1.Col>
                </react_bootstrap_1.Row>

                <div className="d-flex gap-2 mb-4">
                  <react_bootstrap_1.Button variant="primary" onClick={handleBulkUpdatePreview} disabled={loading}>
                    <i className="fas fa-eye me-1"></i>"preview modificari"</react_bootstrap_1.Button>
                  {bulkUpdatePreview.length > 0 && (<react_bootstrap_1.Button variant="success" onClick={handleBulkUpdateApply} disabled={loading}>
                      <i className="fas fa-check me-1"></i>
                      Aplică Modificările ({bulkUpdatePreview.length} produse)
                    </react_bootstrap_1.Button>)}
                </div>

                {bulkUpdatePreview.length > 0 && (<div className="table-responsive">
                    <react_bootstrap_1.Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>"pret curent"</th>
                          <th>Preț Nou</th>
                          <th>Schimbare</th>
                          <th>Schimbare %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUpdatePreview.map(function (item) { return (<tr key={item.product_id}>
                            <td>{item.product_name}</td>
                            <td>{item.current_price.toFixed(2)} RON</td>
                            <td><strong>{item.new_price.toFixed(2)} RON</strong></td>
                            <td className={item.change >= 0 ? 'text-success' : 'text-danger'}>
                              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} RON
                            </td>
                            <td className={item.change_percent >= 0 ? 'text-success' : 'text-danger'}>
                              {item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                            </td>
                          </tr>); })}
                      </tbody>
                    </react_bootstrap_1.Table>
                  </div>)}
              </div>
            </react_bootstrap_1.Tab>

            {/* Tab: Istoric Prețuri */}
            <react_bootstrap_1.Tab eventKey="history" title={<><i className="fas fa-history me-1"></i>"istoric preturi"</>}>
              <div className="mt-4">
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Filtrare după Produs (opțional)</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" value={historyProductId || ''} onChange={function (e) { return setHistoryProductId(e.target.value ? parseInt(e.target.value) : null); }} placeholder="ID Produs (lăsă gol pentru toate)"/>
                </react_bootstrap_1.Form.Group>

                {priceHistory.length === 0 ? (<react_bootstrap_1.Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>"nu exista istoric de preturi"</react_bootstrap_1.Alert>) : (<div className="table-responsive">
                    <react_bootstrap_1.Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Preț Vechi</th>
                          <th>Preț Nou</th>
                          <th>Tip Schimbare</th>
                          <th>Motiv</th>
                          <th>"modificat de"</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceHistory.map(function (item) { return (<tr key={item.id}>
                            <td>{item.product_name || "ID: ".concat(item.product_id)}</td>
                            <td>{item.old_price ? "".concat(item.old_price.toFixed(2), " RON") : '-'}</td>
                            <td><strong>{item.new_price.toFixed(2)} RON</strong></td>
                            <td>
                              <react_bootstrap_1.Badge bg="secondary">{item.change_type}</react_bootstrap_1.Badge>
                            </td>
                            <td>{item.change_reason || '-'}</td>
                            <td>{item.changed_by || 'System'}</td>
                            <td>{new Date(item.changed_at).toLocaleString('ro-RO')}</td>
                          </tr>); })}
                      </tbody>
                    </react_bootstrap_1.Table>
                  </div>)}
              </div>
            </react_bootstrap_1.Tab>

            {/* Tab: Reguli Preț */}
            <react_bootstrap_1.Tab eventKey="rules" title={<><i className="fas fa-cog me-1"></i>"reguli automate"</>}>
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>"reguli de actualizare automata"</h5>
                  <react_bootstrap_1.Button variant="primary" size="sm" onClick={function () {
            setEditingRule(null);
            setRuleFormData({
                name: '',
                rule_type: 'cost_multiplier',
                condition_json: '{}',
                action_json: '{}',
                is_active: 1,
                priority: 0,
            });
            setShowRuleModal(true);
        }}>
                    <i className="fas fa-plus me-1"></i>"adauga regula"</react_bootstrap_1.Button>
                </div>

                {priceRules.length === 0 ? (<react_bootstrap_1.Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>"nu exista reguli de pret creeaza prima regula"</react_bootstrap_1.Alert>) : (<div className="table-responsive">
                    <react_bootstrap_1.Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Nume</th>
                          <th>Tip</th>
                          <th>Prioritate</th>
                          <th>Status</th>
                          <th>"Acțiuni"</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceRules.map(function (rule) { return (<tr key={rule.id}>
                            <td>{rule.name}</td>
                            <td><react_bootstrap_1.Badge bg="info">{rule.rule_type}</react_bootstrap_1.Badge></td>
                            <td>{rule.priority}</td>
                            <td>
                              {rule.is_active === 1 ? (<react_bootstrap_1.Badge bg="success">Activ</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">Inactiv</react_bootstrap_1.Badge>)}
                            </td>
                            <td>
                              <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () {
                    setEditingRule(rule);
                    setRuleFormData(rule);
                    setShowRuleModal(true);
                }}>
                                <i className="fas fa-edit"></i>
                              </react_bootstrap_1.Button>
                            </td>
                          </tr>); })}
                      </tbody>
                    </react_bootstrap_1.Table>
                  </div>)}
              </div>
            </react_bootstrap_1.Tab>
          </react_bootstrap_1.Tabs>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal pentru Reguli */}
      <react_bootstrap_1.Modal show={showRuleModal} onHide={function () { return setShowRuleModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingRule ? 'Editează Regulă Preț' : 'Adaugă Regulă Preț'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleRuleSubmit}>
          <react_bootstrap_1.Modal.Body>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Nume Regulă *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={ruleFormData.name || ''} onChange={function (e) { return setRuleFormData(__assign(__assign({}, ruleFormData), { name: e.target.value })); }} required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Regulă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={ruleFormData.rule_type || 'cost_multiplier'} onChange={function (e) { return setRuleFormData(__assign(__assign({}, ruleFormData), { rule_type: e.target.value })); }}>
                    <option value="cost_multiplier">Multiplicator Cost</option>
                    <option value="margin_target">"marja tinta"</option>
                    <option value="percentage_change">"schimbare procentuala"</option>
                    <option value="fixed_change">"schimbare fixa"</option>
                    <option value="formula">"Formulă"</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Prioritate</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" value={ruleFormData.priority || 0} onChange={function (e) { return setRuleFormData(__assign(__assign({}, ruleFormData), { priority: parseInt(e.target.value) || 0 })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Check type="switch" label="regula activa" checked={ruleFormData.is_active === 1} onChange={function (e) { return setRuleFormData(__assign(__assign({}, ruleFormData), { is_active: e.target.checked ? 1 : 0 })); }}/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowRuleModal(false); }}>"Anulează"</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit">
              {editingRule ? 'Salvează' : 'Creează'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.PriceUtilitiesPage = PriceUtilitiesPage;
