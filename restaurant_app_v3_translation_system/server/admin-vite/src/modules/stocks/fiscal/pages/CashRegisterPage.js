"use strict";
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
exports.CashRegisterPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./CashRegisterPage.css");
var CashRegisterPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), transactions = _b[0], setTransactions = _b[1];
    var _c = (0, react_1.useState)({
        totalIn: 0,
        totalOut: 0,
        balance: 0,
    }), summary = _c[0], setSummary = _c[1];
    var _d = (0, react_1.useState)(false), showDetails = _d[0], setShowDetails = _d[1];
    (0, react_1.useEffect)(function () {
        loadCashRegister();
    }, []);
    var loadCashRegister = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, totalIn, totalOut, balance, transactionsList, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/fiscal/cash-register')];
                case 2:
                    response = _a.sent();
                    if (response.data) {
                        data = response.data;
                        totalIn = data.total_in || 0;
                        totalOut = data.total_out || 0;
                        balance = totalIn - totalOut;
                        setSummary({
                            totalIn: totalIn,
                            totalOut: totalOut,
                            balance: balance,
                        });
                        transactionsList = (data.transactions || []).map(function (tx) { return ({
                            id: tx.id || 0,
                            time: tx.time || tx.created_at || '',
                            type: tx.type || (tx.amount >= 0 ? 'in' : 'out'),
                            document_type: tx.document_type || tx.document_type || 'N/A',
                            document_number: tx.document_number || tx.document_number || '',
                            amount: Math.abs(tx.amount || 0),
                            description: tx.description || tx.notes || '',
                        }); });
                        setTransactions(transactionsList);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('❌ Eroare la încărcarea registrului de casă:', error_1);
                    // Fallback: use mock data for development
                    setSummary({
                        totalIn: 5000,
                        totalOut: 1200,
                        balance: 3800,
                    });
                    setTransactions([
                        {
                            id: 1,
                            time: new Date().toLocaleString('ro-RO'),
                            type: 'in',
                            document_type: 'Bon Nefiscal',
                            document_number: 'BN-001',
                            amount: 150.50,
                            description: 'Comandă #1234',
                        },
                        {
                            id: 2,
                            time: new Date().toLocaleString('ro-RO'),
                            type: 'out',
                            document_type: 'Chitanță',
                            document_number: 'CH-001',
                            amount: 50.00,
                            description: 'Retragere',
                        },
                    ]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="cash-register-page">
      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-dark text-white">
          <i className="fas fa-cash-register me-1"></i>Registrul de casă</react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {/* Summary Cards */}
          <div className="row mb-3 text-center">
            <div className="col border-end">
              <h5>{summary.totalIn.toFixed(2)} RON</h5>
              <small className="text-muted">Total Intrări (cash/zi)</small>
            </div>
            <div className="col border-end">
              <h5>{summary.totalOut.toFixed(2)} RON</h5>
              <small className="text-muted">Total Ieșiri (cash/zi)</small>
            </div>
            <div className="col">
              <h5 className={summary.balance >= 0 ? 'text-success' : 'text-danger'}>
                {summary.balance.toFixed(2)} RON
              </h5>
              <small className="text-muted">Sold Curent</small>
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <react_bootstrap_1.Button variant="outline-dark" size="sm" onClick={function () { return setShowDetails(!showDetails); }}>
              <i className={"fas ".concat(showDetails ? 'fa-eye-slash' : 'fa-eye', " me-1")}></i>
              {showDetails ? 'Ascunde' : 'Vezi'} Tranzacții Detaliate
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="outline-primary" size="sm" className="ms-2" onClick={loadCashRegister} disabled={loading}>
              <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync-alt', " me-1")}></i>
              {loading ? 'Se încarcă...' : 'Reîmprospătează'}
            </react_bootstrap_1.Button>
          </div>

          {/* Transactions Table */}
          <h6 className="mt-4">Ultimele tranzacții</h6>
          <react_bootstrap_1.Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Time</th>
                <th>Tip</th>
                <th>Document</th>
                <th>Suma</th>
                {showDetails && <th>Descriere</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr>
                  <td colSpan={showDetails ? 5 : 4} className="text-center text-muted">
                    <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă tranzacțiile...</td>
                </tr>) : transactions.length === 0 ? (<tr>
                  <td colSpan={showDetails ? 5 : 4} className="text-center text-muted">Nu există tranzacții pentru ziua curentă</td>
                </tr>) : (transactions.map(function (tx) { return (<tr key={tx.id}>
                    <td>{tx.time}</td>
                    <td>
                      <span className={"badge ".concat(tx.type === 'in' ? 'bg-success' : 'bg-danger')}>
                        {tx.type === 'in' ? 'Intrare' : 'Ieșire'}
                      </span>
                    </td>
                    <td>
                      {tx.document_type}
                      {tx.document_number && (<span className="text-muted ms-1">({tx.document_number})</span>)}
                    </td>
                    <td className={tx.type === 'in' ? 'text-success' : 'text-danger'}>
                      {tx.type === 'in' ? '+' : '-'}
                      {tx.amount.toFixed(2)} RON
                    </td>
                    {showDetails && <td>{tx.description || '—'}</td>}
                  </tr>); }))}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.CashRegisterPage = CashRegisterPage;
