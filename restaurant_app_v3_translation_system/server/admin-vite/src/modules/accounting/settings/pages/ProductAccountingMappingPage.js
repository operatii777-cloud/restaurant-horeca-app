"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Product Accounting Mapping Page
 *
 * Mapare Produse → Conturi Contabile:
 * - Selectare produs
 * - Configurare conturi (stock, consumption, entry, cogs)
 * - Metodă evaluare (FIFO, LIFO, Weighted Average)
 * - Istoric modificări
 */
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
exports.ProductAccountingMappingPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var HelpButton_1 = require("@/shared/components/HelpButton");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./ProductAccountingMappingPage.css");
var ProductAccountingMappingPage = function () {
    var _a, _b;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), success = _e[0], setSuccess = _e[1];
    var _f = (0, react_1.useState)([]), ingredients = _f[0], setIngredients = _f[1];
    var _g = (0, react_1.useState)([]), accounts = _g[0], setAccounts = _g[1];
    var _h = (0, react_1.useState)(null), selectedIngredientId = _h[0], setSelectedIngredientId = _h[1];
    var _j = (0, react_1.useState)(null), selectedIngredient = _j[0], setSelectedIngredient = _j[1];
    var _k = (0, react_1.useState)(null), mapping = _k[0], setMapping = _k[1];
    var _l = (0, react_1.useState)([]), history = _l[0], setHistory = _l[1];
    var _m = (0, react_1.useState)(false), showHistory = _m[0], setShowHistory = _m[1];
    // Form state
    var _o = (0, react_1.useState)({
        stock_account_id: 0,
        consumption_account_id: 0,
        entry_account_id: 0,
        cogs_account_id: 0,
        sub_account_code: '',
        valuation_method: 'weighted_average',
        change_reason: ''
    }), formData = _o[0], setFormData = _o[1];
    // Load ingredients and accounts on mount
    (0, react_1.useEffect)(function () {
        loadIngredients();
        loadAccounts();
    }, []);
    var loadIngredients = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, ingredientsList, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/stocks/ingredients')];
                case 1:
                    response = _a.sent();
                    console.log('ProductMapping Ingredients response:', response.data);
                    ingredientsList = [];
                    if (response.data.success && response.data.data) {
                        ingredientsList = response.data.data;
                    }
                    else if (Array.isArray(response.data)) {
                        ingredientsList = response.data;
                    }
                    else if (response.data.ingredients) {
                        ingredientsList = response.data.ingredients;
                    }
                    console.log('ProductMapping Loaded ingredients:', ingredientsList.length);
                    setIngredients(ingredientsList);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error loading ingredients:', err_1);
                    setError('Eroare la încărcarea ingredientelor: ' + err_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadAccounts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/settings/accounts')];
                case 1:
                    response = _a.sent();
                    if (response.data.success) {
                        setAccounts(response.data.data || []);
                    }
                    else {
                        // Fallback: hardcoded accounts
                        setAccounts([
                            { id: 1, account_code: '301', account_name: 'Materii Prime', account_type: 'asset' },
                            { id: 2, account_code: '401', account_name: 'Achiziții Materii Prime', account_type: 'expense' },
                            { id: 3, account_code: '602', account_name: 'Consumuri Materii Prime', account_type: 'expense' },
                            { id: 4, account_code: '607', account_name: 'Cheltuieli cu Mărfurile', account_type: 'expense' }
                        ]);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error loading accounts:', err_2);
                    // Fallback
                    setAccounts([
                        { id: 1, account_code: '301', account_name: 'Materii Prime', account_type: 'asset' },
                        { id: 2, account_code: '401', account_name: 'Achiziții Materii Prime', account_type: 'expense' },
                        { id: 3, account_code: '602', account_name: 'Consumuri Materii Prime', account_type: 'expense' },
                        { id: 4, account_code: '607', account_name: 'Cheltuieli cu Mărfurile', account_type: 'expense' }
                    ]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleIngredientChange = (0, react_1.useCallback)(function (ingredientId) { return __awaiter(void 0, void 0, void 0, function () {
        var ingredient, response, existingMapping, historyResponse, err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setSelectedIngredientId(ingredientId);
                    setError(null);
                    setSuccess(null);
                    ingredient = ingredients.find(function (i) { return i.id === ingredientId; });
                    setSelectedIngredient(ingredient || null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/accounting/product-mapping/".concat(ingredientId))];
                case 2:
                    response = _c.sent();
                    if (response.data.success && response.data.data) {
                        existingMapping = response.data.data;
                        setMapping(existingMapping);
                        setFormData({
                            stock_account_id: existingMapping.stock_account_id,
                            consumption_account_id: existingMapping.consumption_account_id,
                            entry_account_id: existingMapping.entry_account_id || 0,
                            cogs_account_id: existingMapping.cogs_account_id || 0,
                            sub_account_code: existingMapping.sub_account_code || '',
                            valuation_method: existingMapping.valuation_method || 'weighted_average',
                            change_reason: ''
                        });
                    }
                    else {
                        // No mapping exists, reset form
                        setMapping(null);
                        setFormData({
                            stock_account_id: 0,
                            consumption_account_id: 0,
                            entry_account_id: 0,
                            cogs_account_id: 0,
                            sub_account_code: '',
                            valuation_method: 'weighted_average',
                            change_reason: ''
                        });
                    }
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/accounting/product-mapping/history/".concat(ingredientId))];
                case 3:
                    historyResponse = _c.sent();
                    if (historyResponse.data.success) {
                        setHistory(historyResponse.data.data || []);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _c.sent();
                    console.error('Error loading mapping:', err_3);
                    setError(((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la încărcarea mapării');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [ingredients]);
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedIngredientId) {
                        setError('Selectează un produs');
                        return [2 /*return*/];
                    }
                    if (!formData.stock_account_id || !formData.consumption_account_id) {
                        setError('Contul de stoc și contul de consum sunt obligatorii');
                        return [2 /*return*/];
                    }
                    if (formData.change_reason && formData.change_reason.length < 10) {
                        setError('Motivul modificării trebuie să aibă minim 10 caractere');
                        return [2 /*return*/];
                    }
                    // Validate sub-account code format (XXX.XX)
                    if (formData.sub_account_code && !/^\d{3}\.\d{2}$/.test(formData.sub_account_code)) {
                        setError('Cod sub-cont trebuie să fie în format XXX.XX (ex: 301.01)');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/accounting/product-mapping/update', {
                            ingredient_id: selectedIngredientId,
                            stock_account_id: formData.stock_account_id,
                            consumption_account_id: formData.consumption_account_id,
                            entry_account_id: formData.entry_account_id || undefined,
                            cogs_account_id: formData.cogs_account_id || undefined,
                            sub_account_code: formData.sub_account_code || undefined,
                            valuation_method: formData.valuation_method || 'weighted_average',
                            change_reason: formData.change_reason || 'Modificare mapare contabilă',
                            modified_by: 1 // TODO: Get from auth context
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.data.success) return [3 /*break*/, 4];
                    setSuccess('Maparea a fost salvată cu succes!');
                    // Reload mapping and history
                    return [4 /*yield*/, handleIngredientChange(selectedIngredientId)];
                case 3:
                    // Reload mapping and history
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setError(response.data.error || 'Eroare la salvarea mapării');
                    _c.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    err_4 = _c.sent();
                    console.error('Error saving mapping:', err_4);
                    setError(((_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_4.message || 'Eroare la salvarea mapării');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var stockValue = selectedIngredient && selectedIngredient.current_stock && selectedIngredient.avg_price
        ? selectedIngredient.current_stock * selectedIngredient.avg_price
        : 0;
    return (<div className="product-accounting-mapping-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🔗 Mapare Produse → Conturi Contabile</h1>
          <p>"configurare mapare ingrediente la conturi contabil"</p>
        </div>
        <HelpButton_1.HelpButton title="Ajutor - Mapare Produse → Conturi" content={<div>
              <h5>🔗 Ce este maparea produse → conturi?</h5>
              <p>
                Maparea produselor la conturi contabile permite asocierea fiecărui ingredient/produs 
                cu conturile contabile corespunzătoare pentru raportare financiară automată.
              </p>
              <h5 className="mt-4">📋 Tipuri de conturi pentru mapare</h5>
              <ul>
                <li><strong>Cont Stoc</strong> - Contul pentru stocuri (ex: 301 - Mărfuri)</li>
                <li><strong>Cont Consum</strong> - Contul pentru consum (ex: 607 - Cheltuieli cu mărfurile)</li>
                <li><strong>Cont Intrare</strong> - Contul pentru intrări în stoc (opțional)</li>
                <li><strong>Cont COGS</strong> - Cost of Goods Sold (Costul mărfurilor vândute)</li>
              </ul>
              <h5 className="mt-4">🔧 Metode de evaluare</h5>
              <ul>
                <li><strong>FIFO</strong> - First In, First Out (Primul intrat, primul ieșit)</li>
                <li><strong>LIFO</strong> - Last In, First Out (Ultimul intrat, primul ieșit)</li>
                <li><strong>Weighted Average</strong> - Cost mediu ponderat</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Asigură-te că ai creat conturile contabile în pagina 
                "Conturi Contabile" înainte de a face maparea.
              </div>
            </div>}/>
      </div>

      {error && <react_bootstrap_1.Alert variant="danger" onClose={function () { return setError(null); }} dismissible>{error}</react_bootstrap_1.Alert>}
      {success && <react_bootstrap_1.Alert variant="success" onClose={function () { return setSuccess(null); }} dismissible>{success}</react_bootstrap_1.Alert>}

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label><strong>Selectează Produs/Ingredient</strong></react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Select value={selectedIngredientId || ''} onChange={function (e) {
            var id = e.target.value ? parseInt(e.target.value) : null;
            if (id)
                handleIngredientChange(id);
        }} style={{ color: '#000', backgroundColor: '#fff' }}>
              <option value="" style={{ color: '#000', backgroundColor: '#fff' }}>
                -- Selectează ingredient --
              </option>
              {ingredients.map(function (ing) { return (<option key={ing.id} value={ing.id} style={{ color: '#000', backgroundColor: '#fff' }}>
                  {ing.name} {ing.category ? "(".concat(ing.category, ")") : ''}
                </option>); })}
            </react_bootstrap_1.Form.Select>
            {ingredients.length === 0 && (<react_bootstrap_1.Form.Text className="text-muted">"se incarca ingredientele"</react_bootstrap_1.Form.Text>)}
            {ingredients.length > 0 && (<react_bootstrap_1.Form.Text className="text-muted">
                {ingredients.length} ingrediente disponibile
              </react_bootstrap_1.Form.Text>)}
          </react_bootstrap_1.Form.Group>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {selectedIngredient && (<>
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5>"informatii produs"</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={3}>
                  <strong>"Nume:"</strong> {selectedIngredient.name}
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <strong>UM:</strong> {selectedIngredient.unit}
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <strong>Categorie:</strong> {selectedIngredient.category || '-'}
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={2}>
                  <strong>Stoc Curent:</strong> {((_a = selectedIngredient.current_stock) === null || _a === void 0 ? void 0 : _a.toFixed(3)) || '0.000'}
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={3}>
                  <strong>Valoare Stoc:</strong> {stockValue.toFixed(2)} RON
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h5>Mapare Conturi Contabile</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label><strong>Cont Stoc *</strong></react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control as="select" value={formData.stock_account_id || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { stock_account_id: parseInt(e.target.value) })); }} required>
                      <option value="0">-- Selectează cont --</option>
                      {accounts.filter(function (a) { return a.account_type === 'asset'; }).map(function (acc) { return (<option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>); })}
                    </react_bootstrap_1.Form.Control>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label><strong>Cont Consum *</strong></react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control as="select" value={formData.consumption_account_id || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { consumption_account_id: parseInt(e.target.value) })); }} required>
                      <option value="0">-- Selectează cont --</option>
                      {accounts.filter(function (a) { return a.account_type === 'expense'; }).map(function (acc) { return (<option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>); })}
                    </react_bootstrap_1.Form.Control>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
              
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>"cont intrari"</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control as="select" value={formData.entry_account_id || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { entry_account_id: parseInt(e.target.value) || undefined })); }}>
                      <option value="0">-- Selectează cont (opțional) --</option>
                      {accounts.filter(function (a) { return a.account_type === 'expense'; }).map(function (acc) { return (<option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>); })}
                    </react_bootstrap_1.Form.Control>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Cont COGS</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control as="select" value={formData.cogs_account_id || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { cogs_account_id: parseInt(e.target.value) || undefined })); }}>
                      <option value="0">-- Selectează cont (opțional) --</option>
                      {accounts.filter(function (a) { return a.account_type === 'expense'; }).map(function (acc) { return (<option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>); })}
                    </react_bootstrap_1.Form.Control>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Cod Sub-Cont (format: XXX.XX)</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="text" value={formData.sub_account_code || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { sub_account_code: e.target.value })); }} placeholder="Ex: 301.01" pattern="\d{3}\.\d{2}"/>
                    <react_bootstrap_1.Form.Text className="text-muted">
                      Format: 3 cifre, punct, 2 cifre (ex: 301.01)
                    </react_bootstrap_1.Form.Text>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label><strong>"metoda evaluare"</strong></react_bootstrap_1.Form.Label>
                    <div>
                      <react_bootstrap_1.Form.Check type="radio" id="val-fifo" name="valuation_method" label="FIFO (First In, First Out)" value="fifo" checked={formData.valuation_method === 'fifo'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { valuation_method: e.target.value })); }}/>
                      <react_bootstrap_1.Form.Check type="radio" id="val-lifo" name="valuation_method" label="LIFO (Last In, First Out)" value="lifo" checked={formData.valuation_method === 'lifo'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { valuation_method: e.target.value })); }}/>
                      <react_bootstrap_1.Form.Check type="radio" id="val-weighted" name="valuation_method" label="Weighted Average (Medie Ponderată)" value="weighted_average" checked={formData.valuation_method === 'weighted_average'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { valuation_method: e.target.value })); }}/>
                    </div>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Motiv Modificare</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control as="textarea" rows={3} value={formData.change_reason || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { change_reason: e.target.value })); }} placeholder="Descrie motivul modificării mapării (minim 10 caractere)"/>
                <react_bootstrap_1.Form.Text className="text-muted">
                  {((_b = formData.change_reason) === null || _b === void 0 ? void 0 : _b.length) || 0} / 10 caractere minim
                </react_bootstrap_1.Form.Text>
              </react_bootstrap_1.Form.Group>

              <react_bootstrap_1.Button variant="primary" onClick={handleSave} disabled={loading || !formData.stock_account_id || !formData.consumption_account_id} className="w-100">
                {loading ? (<><i className="fas fa-spinner fa-spin me-2"></i>"se salveaza"</>) : (<><i className="fas fa-save me-2"></i>"salveaza modificari"</>)}
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {history.length > 0 && (<react_bootstrap_1.Card>
              <react_bootstrap_1.Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5>"istoric modificari"</h5>
                  <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return setShowHistory(!showHistory); }}>
                    {showHistory ? (<><i className="fas fa-eye-slash me-2"></i>"Ascunde"</>) : (<><i className="fas fa-eye me-2"></i>Vezi Istoric</>)}
                  </react_bootstrap_1.Button>
                </div>
              </react_bootstrap_1.Card.Header>
              {showHistory && (<react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Cont Vechi</th>
                        <th>Cont Nou</th>
                        <th>Motiv</th>
                        <th>Modificat De</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(function (h) { return (<tr key={h.id}>
                          <td>{new Date(h.changed_at).toLocaleString('ro-RO')}</td>
                          <td>{h.old_account_code || '-'}</td>
                          <td><strong>{h.new_account_code}</strong></td>
                          <td>{h.change_reason}</td>
                          <td>User #{h.changed_by || 'N/A'}</td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>)}
            </react_bootstrap_1.Card>)}
        </>)}
    </div>);
};
exports.ProductAccountingMappingPage = ProductAccountingMappingPage;
