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
exports.RecallsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var RecallsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), recalls = _a[0], setRecalls = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        loadRecalls();
    }, []);
    var loadRecalls = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/recalls')];
                case 1:
                    response = _b.sent();
                    setRecalls(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error loading recalls:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getSeverityBadge = function (severity) {
        var variants = {
            'low': 'info',
            'medium': 'warning',
            'high': 'danger',
            'critical': 'danger'
        };
        return <react_bootstrap_1.Badge bg={variants[severity]}>{severity.toUpperCase()}</react_bootstrap_1.Badge>;
    };
    return (<div className="recalls-page page">
      <PageHeader_1.PageHeader title="Management Retrageri (Recalls)" description="Gestionare retrageri produse (siguranță alimentară)"/>

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>Lista retrageri (Recalls)</h5>
            <react_bootstrap_1.Button variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Creare Recall NOU
            </react_bootstrap_1.Button>
          </div>

          <react_bootstrap_1.Table striped bordered hover>
            <thead>
              <tr>
                <th>Număr</th>
                <th>Dată</th>
                <th>Tip</th>
                <th>Severitate</th>
                <th>Risc</th>
                <th>Produse</th>
                <th>Comenzi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recalls.map(function (recall) { return (<tr key={recall.id}>
                  <td><strong>{recall.recall_number}</strong></td>
                  <td>{new Date(recall.recall_date).toLocaleDateString('ro-RO')}</td>
                  <td><react_bootstrap_1.Badge bg="secondary">{recall.recall_type}</react_bootstrap_1.Badge></td>
                  <td>{getSeverityBadge(recall.severity)}</td>
                  <td>{recall.health_risk}</td>
                  <td>{recall.affected_products_count}</td>
                  <td>{recall.affected_orders_count}</td>
                  <td>{recall.resolved ? <react_bootstrap_1.Badge bg="success">Rezolvat</react_bootstrap_1.Badge> : <react_bootstrap_1.Badge bg="warning">Activ</react_bootstrap_1.Badge>}</td>
                </tr>); })}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.RecallsPage = RecallsPage;
