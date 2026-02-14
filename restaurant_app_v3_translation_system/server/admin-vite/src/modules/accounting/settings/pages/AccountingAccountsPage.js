"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Accounts Page
 *
 * Gestionare Conturi Contabile (Planu Conturi):
 * - Cont Nou
 * - Editare Cont
 * - Atribuire Produse → Conturi
 * - Lista Conturi
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
exports.AccountingAccountsPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var HelpButton_1 = require("@/shared/components/HelpButton");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./AccountingAccountsPage.css");
var AccountingAccountsPage = function () {
    //   const { t } = useTranslation();
    // Asigură-te că accounts este întotdeauna un array - FORCE INITIALIZATION
    var _a = (0, react_1.useState)([]), accounts = _a[0], setAccounts = _a[1];
    // Double-check: asigură-te că accounts este array la fiecare render
    var safeAccounts = react_1.default.useMemo(function () {
        if (!Array.isArray(accounts)) {
            console.warn('AccountingAccountsPage accounts is not an array, converting to []');
            return [];
        }
        return accounts;
    }, [accounts]);
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingAccount = _e[0], setEditingAccount = _e[1];
    var _f = (0, react_1.useState)({
        accountCode: '',
        accountName: '',
        accountType: 'expense',
        isActive: true,
    }), formData = _f[0], setFormData = _f[1];
    (0, react_1.useEffect)(function () {
        loadAccounts();
    }, []);
    var loadAccounts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, accountsList, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/settings/accounts')];
                case 2:
                    response = _c.sent();
                    console.log('AccountingAccountsPage Response:', response.data);
                    accountsList = [];
                    if (response.data && response.data.success && Array.isArray(response.data.data)) {
                        accountsList = response.data.data;
                    }
                    else if (Array.isArray(response.data)) {
                        accountsList = response.data;
                    }
                    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        accountsList = response.data.data;
                    }
                    // Asigură-te că accountsList este întotdeauna un array
                    if (!Array.isArray(accountsList)) {
                        console.warn('AccountingAccountsPage accountsList is not an array, setting to empty array');
                        accountsList = [];
                    }
                    console.log('AccountingAccountsPage Loaded accounts:', accountsList.length);
                    setAccounts(accountsList);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('AccountingAccountsPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea conturilor');
                    setAccounts([]); // Asigură-te că accounts este întotdeauna un array
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    if (!(editingAccount === null || editingAccount === void 0 ? void 0 : editingAccount.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/accounting/settings/accounts/".concat(editingAccount.id), formData)];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, httpClient_1.httpClient.post('/api/accounting/settings/accounts', formData)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    setShowModal(false);
                    setEditingAccount(null);
                    setFormData({
                        accountCode: '',
                        accountName: '',
                        accountType: 'expense',
                        isActive: true,
                    });
                    loadAccounts();
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _c.sent();
                    setError(((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_2.message || 'Eroare la salvare');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (account) {
        setEditingAccount(account);
        setFormData(account);
        setShowModal(true);
    };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!window.confirm('Sigur doriți să ștergeți acest cont?'))
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/accounting/settings/accounts/\"Id\"")];
                case 2:
                    _c.sent();
                    loadAccounts();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _c.sent();
                    setError(((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_3.message || 'Eroare la ștergere');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getAccountTypeBadge = function (type) {
        var badges = {
            asset: { bg: 'primary', label: 'Activ' },
            liability: { bg: 'danger', label: 'Pasiv' },
            equity: { bg: 'info', label: 'Capital' },
            revenue: { bg: 'success', label: 'Venit' },
            expense: { bg: 'warning', label: 'Cheltuială' },
        };
        var badge = badges[type] || { bg: 'secondary', label: type };
        return <react_bootstrap_1.Badge bg={badge.bg}>{badge.label}</react_bootstrap_1.Badge>;
    };
    return (<div className="accounting-accounts-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>📋 Conturi Contabile</h1>
          <p>"gestionare planu conturi conturi tipuri si atribui"</p>
        </div>
        <HelpButton_1.HelpButton title="Ajutor - Coduri Contabile" content={<div>
              <h5>📋 Ce sunt codurile contabile?</h5>
              <p>
                Codurile contabile sunt structura de bază a contabilității. Fiecare cont are un cod unic 
                și un tip (Activ, Pasiv, Capital, Venit, Cheltuială).
              </p>
              <h5 className="mt-4">🔧 Cum funcționează?</h5>
              <ul>
                <li><strong>Cod Cont</strong> - Codul unic al contului (ex: 301, 401, 607)</li>
                <li><strong>"nume cont"</strong> - Denumirea contului</li>
                <li><strong>Tip Cont</strong> - Categoria contului (Activ, Pasiv, Capital, Venit, Cheltuială)</li>
                <li><strong>"cont parinte"</strong> - Contul superior în ierarhie (opțional)</li>
                <li><strong>Status</strong> - Activ/Inactiv</li>
              </ul>
              <h5 className="mt-4">📝 Tipuri de conturi</h5>
              <ul>
                <li><strong>Activ</strong> - Bunuri și drepturi (ex: Casa, Banca, Stocuri)</li>
                <li><strong>Pasiv</strong> - Datorii și obligații (ex: Furnizori, Credite)</li>
                <li><strong>Capital</strong> - Capital propriu (ex: Capital social, Rezerve)</li>
                <li><strong>Venit</strong> - Venituri (ex: Vânzări, Venituri din servicii)</li>
                <li><strong>"Cheltuială"</strong> - Cheltuieli (ex: Cheltuieli cu mărfuri, Salarii)</li>
              </ul>
              <h5 className="mt-4">💼 Coduri contabile comune pentru restaurante</h5>
              <react_bootstrap_1.Table striped bordered size="sm" className="mt-3">
                <thead>
                  <tr>
                    <th>Cod</th>
                    <th>Denumire</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>301</td><td>"Mărfuri"</td><td>Activ</td></tr>
                  <tr><td>371</td><td>"marfuri in curs de aprovizionare"</td><td>Activ</td></tr>
                  <tr><td>401</td><td>Furnizori</td><td>Pasiv</td></tr>
                  <tr><td>411</td><td>Clienți</td><td>Activ</td></tr>
                  <tr><td>5311</td><td>"casa in lei"</td><td>Activ</td></tr>
                  <tr><td>5121</td><td>"conturi la banci in lei"</td><td>Activ</td></tr>
                  <tr><td>607</td><td>"cheltuieli cu marfurile"</td><td>"Cheltuială"</td></tr>
                  <tr><td>641</td><td>"cheltuieli cu salariile personalului"</td><td>"Cheltuială"</td></tr>
                  <tr><td>701</td><td>"venituri din vanzarea produselor finite"</td><td>Venit</td></tr>
                  <tr><td>704</td><td>Venituri din servicii prestate</td><td>Venit</td></tr>
                </tbody>
              </react_bootstrap_1.Table>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> După crearea conturilor, poți atribui produse la conturi 
                în pagina "Mapare Produse → Conturi Contabile".
              </div>
            </div>}/>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista Conturi</h5>
          <react_bootstrap_1.Button variant="primary" onClick={function () {
            setEditingAccount(null);
            setFormData({
                accountCode: '',
                accountName: '',
                accountType: 'expense',
                isActive: true,
            });
            setShowModal(true);
        }}>
            <i className="fas fa-plus me-2"></i>
            Cont Nou
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Cod Cont</th>
                  <th>Denumire</th>
                  <th>Tip</th>
                  <th>Status</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {(function () {
                // Use the memoized safeAccounts from useMemo
                if (safeAccounts.length > 0) {
                    return safeAccounts.map(function (account) { return (<tr key={account.id}>
                        <td><strong>{account.accountCode}</strong></td>
                        <td>{account.accountName}</td>
                        <td>{getAccountTypeBadge(account.accountType)}</td>
                        <td>
                          <react_bootstrap_1.Badge bg={account.isActive ? 'success' : 'secondary'}>
                            {account.isActive ? 'Activ' : 'Inactiv'}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>
                          <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleEdit(account); }} className="me-2">
                            <i className="fas fa-edit"></i>
                          </react_bootstrap_1.Button>
                          <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return account.id && handleDelete(account.id); }}>
                            <i className="fas fa-trash"></i>
                          </react_bootstrap_1.Button>
                        </td>
                      </tr>); });
                }
                else {
                    return (<tr>
                        <td colSpan={5} className="text-center text-muted py-4">"nu exista conturi contabile adauga un cont nou pen"</td>
                      </tr>);
                }
            })()}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Edit Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { return setShowModal(false); }} size="lg" className="accounting-accounts-page">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingAccount ? 'Editare Cont' : 'Cont Nou'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Cod Cont *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.accountCode} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accountCode: e.target.value })); }} placeholder="Ex: 401, 371, 607"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Cont *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.accountType} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accountType: e.target.value })); }}>
                    <option value="asset">Activ</option>
                    <option value="liability">Pasiv</option>
                    <option value="equity">Capital</option>
                    <option value="revenue">Venit</option>
                    <option value="expense">"Cheltuială"</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Denumire Cont *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={formData.accountName} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accountName: e.target.value })); }} placeholder="ex furnizori marfuri vanzari"/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Descriere</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={3} value={formData.description || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="descriere cont"/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Check type="switch" id="is-active" label="Cont Activ" checked={formData.isActive} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { isActive: e.target.checked })); }}/>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowModal(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={handleSave}>
            <i className="fas fa-save me-2"></i>
            Salvează
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>

    </div>);
};
exports.AccountingAccountsPage = AccountingAccountsPage;
