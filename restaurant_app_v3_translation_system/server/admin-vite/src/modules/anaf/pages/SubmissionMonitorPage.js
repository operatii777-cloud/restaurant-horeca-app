"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.3 - Submission Monitor Page
 *
 * Monitor ANAF submissions with retry functionality
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
exports.SubmissionMonitorPage = SubmissionMonitorPage;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var anaf_api_1 = require("../api/anaf.api");
require("./SubmissionMonitorPage.css");
var API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
function resubmitDocument(documentId, documentType) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/resubmit/").concat(documentId, "?documentType=").concat(documentType), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to resubmit: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
function SubmissionMonitorPage() {
    //   const { t } = useTranslation();
    var queryClient = (0, react_query_1.useQueryClient)();
    var _a = (0, react_1.useState)({
        documentType: '',
        status: '',
        startDate: '',
        endDate: '',
    }), filters = _a[0], setFilters = _a[1];
    var _b = (0, react_query_1.useQuery)({
        queryKey: ['anaf', 'submissions', filters],
        queryFn: function () { return (0, anaf_api_1.fetchAnafSubmissions)({
            documentType: filters.documentType || undefined,
            status: filters.status || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            limit: 100,
            offset: 0,
        }); },
        refetchInterval: 30000,
    }), data = _b.data, isLoading = _b.isLoading, error = _b.error, refetch = _b.refetch;
    var resubmitMutation = (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var documentId = _a.documentId, documentType = _a.documentType;
            return resubmitDocument(documentId, documentType);
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['anaf', 'submissions'] });
            queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
        },
    });
    var submissions = (data === null || data === void 0 ? void 0 : data.data) || [];
    var handleResubmit = function (documentId, documentType) {
        if (confirm('Ești sigur că vrei să retrimiți acest document?')) {
            resubmitMutation.mutate({ documentId: documentId, documentType: documentType });
        }
    };
    var getStatusBadge = function (status) {
        var statusMap = {
            PENDING: { class: 'badge-warning', label: 'Pending' },
            PROCESSING: { class: 'badge-info', label: 'Processing' },
            SUBMITTED: { class: 'badge-success', label: 'Submitted' },
            CONFIRMED: { class: 'badge-success', label: 'Confirmed' },
            FAILED: { class: 'badge-danger', label: 'Failed' },
            DEAD_LETTER: { class: 'badge-danger', label: 'Dead Letter' },
            ACK: { class: 'badge-success', label: 'Acknowledged' },
            REJECTED: { class: 'badge-danger', label: 'Rejected' },
        };
        var statusInfo = statusMap[status] || { class: 'badge-secondary', label: status };
        return <span className={"badge ".concat(statusInfo.class)}>{statusInfo.label}</span>;
    };
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    if (isLoading) {
        return (<div className="submission-monitor-page">
        <div className="loading-spinner">Se încarcă...</div>
      </div>);
    }
    if (error) {
        return (<div className="submission-monitor-page">
        <div className="alert alert-danger">
          Eroare: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </div>
      </div>);
    }
    return (<div className="submission-monitor-page">
      <header className="page-header">
        <h1 className="page-title">Submission Monitor</h1>
        <p className="page-subtitle">Monitorizare și gestionare trimiteri ANAF</p>
        <button onClick={function () { return refetch(); }} className="btn btn-secondary btn-sm">
          🔄 Actualizează
        </button>
      </header>

      {/* Filters */}
      <div className="filters-card">
        <h3 className="card-title">Filtre</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Tip Document</label>
            <select value={filters.documentType} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { documentType: e.target.value })); }} className="form-control">
              <option value="">"Toate"</option>
              <option value="FACTURA">Factură</option>
              <option value="CHITANTA">Chitanță</option>
              <option value="BON_FISCAL">Bon Fiscal</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select value={filters.status} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { status: e.target.value })); }} className="form-control">
              <option value="">"Toate"</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="FAILED">Failed</option>
              <option value="DEAD_LETTER">Dead Letter</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">De la</label>
            <input type="date" value={filters.startDate} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { startDate: e.target.value })); }} className="form-control"/>
          </div>

          <div className="form-group">
            <label className="form-label">Până la</label>
            <input type="date" value={filters.endDate} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { endDate: e.target.value })); }} className="form-control"/>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="submissions-card">
        <h3 className="card-title">Submissions ({submissions.length})</h3>
        <div className="table-responsive">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Document</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Created</th>
                <th>Ultima Erore</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (<tr>
                  <td colSpan={7} className="text-center text-muted">Nu există submissions.</td>
                </tr>) : (submissions.map(function (sub) { return (<tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>
                      {sub.document_type} #{sub.document_id}
                    </td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td>{sub.attempts || 0}</td>
                    <td>{formatDate(sub.created_at)}</td>
                    <td className="error-cell">
                      {sub.last_error ? (<span className="text-danger" title={sub.last_error}>
                          {sub.last_error.length > 50
                    ? "".concat(sub.last_error.substring(0, 50), "...")
                    : sub.last_error}
                        </span>) : ('-')}
                    </td>
                    <td>
                      {(sub.status === 'FAILED' || sub.status === 'DEAD_LETTER') && (<button onClick={function () { return handleResubmit(sub.document_id, sub.document_type); }} disabled={resubmitMutation.isPending} className="btn btn-primary btn-sm">
                          Retrimite
                        </button>)}
                    </td>
                  </tr>); }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
