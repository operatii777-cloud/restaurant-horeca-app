"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Bank Accounts Page
 *
 * Gestionare Conturi Bancare:
 * - Cont Nou
 * - Editare Cont
 * - Lista Conturi
 * - Balanțe
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
exports.BankAccountsPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var HelpButton_1 = require("@/shared/components/HelpButton");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
require("./BankAccountsPage.css");
var BankAccountsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), accounts = _a[0], setAccounts = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingAccount = _e[0], setEditingAccount = _e[1];
    var _f = (0, react_1.useState)({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        iban: '',
        swiftCode: '',
        currency: 'RON',
        accountType: 'current',
        isActive: true,
        openingBalance: 0,
        currentBalance: 0,
        notes: ''
    }), formData = _f[0], setFormData = _f[1];
    (0, react_1.useEffect)(function () {
        loadAccounts();
    }, []);
    var loadAccounts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/settings/bank-accounts')];
                case 2:
                    response = _c.sent();
                    if (response.data.success) {
                        setAccounts(response.data.data || []);
                    }
                    else {
                        setAccounts([]);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('BankAccountsPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea conturilor');
                    setAccounts([]);
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
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/accounting/settings/bank-accounts/".concat(editingAccount.id), formData)];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, httpClient_1.httpClient.post('/api/accounting/settings/bank-accounts', formData)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    setShowModal(false);
                    setEditingAccount(null);
                    setFormData({
                        bankName: '',
                        accountNumber: '',
                        accountHolder: '',
                        iban: '',
                        swiftCode: '',
                        currency: 'RON',
                        accountType: 'current',
                        isActive: true,
                        openingBalance: 0,
                        currentBalance: 0,
                        notes: ''
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
                    if (!window.confirm('Sigur doriți să ștergeți acest cont bancar?'))
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/accounting/settings/bank-accounts/\"Id\"")];
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
            current: { bg: 'primary', label: 'Curent' },
            savings: { bg: 'success', label: 'Economii' },
            deposit: { bg: 'info', label: 'Depozit' }
        };
        var badge = badges[type] || { bg: 'secondary', label: type };
        return <react_bootstrap_1.Badge bg={badge.bg}>{badge.label}</react_bootstrap_1.Badge>;
    };
    var totalBalance = accounts.reduce(function (sum, acc) { return sum + (acc.currentBalance || 0); }, 0);
    return (<div className="bank-accounts-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🏦 Conturi Bancare</h1>
          <p>"gestionare conturi bancare adaugare editare si mon"</p>
        </div>
        <HelpButton_1.HelpButton title="Ajutor - Conturi Bancare" content={<div>
              <h5>🏦 Ce sunt conturile bancare?</h5>
              <p>
                Conturile bancare permit gestionarea tuturor conturilor bancare ale restaurantului, 
                inclusiv balanțe, IBAN, SWIFT și alte informații importante.
              </p>
              <h5 className="mt-4">📋 Câmpuri importante</h5>
              <ul>
                <li><strong>"nume banca"</strong> - Numele băncii (ex: BCR, BRD, Raiffeisen)</li>
                <li><strong>"numar cont"</strong> - Numărul contului bancar</li>
                <li><strong>"Titular"</strong> - Persoana sau entitatea titulară a contului</li>
                <li><strong>IBAN</strong> - Codul IBAN al contului (format: ROXX XXXX XXXX...)</li>
                <li><strong>"swift code"</strong> - Codul SWIFT al băncii (pentru transferuri internaționale)</li>
                <li><strong>"Monedă"</strong> - Moneda contului (RON, EUR, USD)</li>
                <li><strong>Tip Cont</strong> - Curent, Economii sau Depozit</li>
                <li><strong>"balanta initiala"</strong> - Balanța la deschiderea contului în sistem</li>
                <li><strong>"balanta curenta"</strong> - Balanța actuală (actualizată automat)</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Balanța curentă este actualizată automat pe baza tranzacțiilor 
                înregistrate în sistem.
              </div>
            </div>}/>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Summary Card */}
      <react_bootstrap_1.Card className="mb-4 bg-primary text-white">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={6}>
              <h5>Total Conturi: {accounts.length}</h5>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={6} className="text-end">
              <h5>Balanță Totală: {totalBalance.toFixed(2)} RON</h5>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista Conturi Bancare</h5>
          <react_bootstrap_1.Button variant="primary" onClick={function () {
            setEditingAccount(null);
            setFormData({
                bankName: '',
                accountNumber: '',
                accountHolder: '',
                iban: '',
                swiftCode: '',
                currency: 'RON',
                accountType: 'current',
                isActive: true,
                openingBalance: 0,
                currentBalance: 0,
                notes: ''
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
                  <th>"Bancă"</th>
                  <th>"numar cont"</th>
                  <th>"Titular"</th>
                  <th>IBAN</th>
                  <th>Tip</th>
                  <th>"Monedă"</th>
                  <th>"Balanță"</th>
                  <th>Status</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (<tr>
                    <td colSpan={9} className="text-center text-muted py-4">"nu exista conturi bancare adauga primul cont"</td>
                  </tr>) : (accounts.map(function (account) { return (<tr key={account.id}>
                      <td><strong>{account.bankName}</strong></td>
                      <td>{account.accountNumber}</td>
                      <td>{account.accountHolder || '-'}</td>
                      <td>{account.iban || '-'}</td>
                      <td>{getAccountTypeBadge(account.accountType)}</td>
                      <td>{account.currency}</td>
                      <td className={account.currentBalance >= 0 ? 'text-success' : 'text-danger'}>
                        <strong>{account.currentBalance.toFixed(2)} {account.currency}</strong>
                      </td>
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
                    </tr>); }))}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Edit Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { return setShowModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingAccount ? 'Editare Cont Bancar' : 'Cont Bancar Nou'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Nume Bancă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.bankName} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { bankName: e.target.value })); }} placeholder="Ex: BCR, BRD, ING"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Număr Cont *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.accountNumber} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accountNumber: e.target.value })); }} placeholder="Ex: RO12BCRO0001234567890123"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"titular cont"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.accountHolder || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accountHolder: e.target.value })); }} placeholder="nume titular"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>IBAN</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.iban || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { iban: e.target.value })); }} placeholder="RO12BCRO0001234567890123"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"swift code"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.swiftCode || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { swiftCode: e.target.value })); }} placeholder="Ex: BCROROBU"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Monedă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.currency} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { currency: e.target.value })); }}>
                    <option value="RON">RON</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Cont *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.accountType} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accountType: e.target.value })); }}>
                    <option value="current">"Curent"</option>
                    <option value="savings">Economii</option>
                    <option value="deposit">"Depozit"</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"balanta initiala"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={formData.openingBalance} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { openingBalance: parseFloat(e.target.value) || 0 })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"balanta curenta"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={formData.currentBalance} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { currentBalance: parseFloat(e.target.value) || 0 })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Note</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={3} value={formData.notes || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }} placeholder="note despre cont"/>
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
exports.BankAccountsPage = BankAccountsPage;
