"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificates Table Component
 *
 * Displays list of uploaded certificates with status badges
 */
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
exports.CertificatesTable = CertificatesTable;
var react_1 = require("react");
var useCertificate_1 = require("../hooks/useCertificate");
require("./CertificatesTable.css");
function CertificatesTable() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, useCertificate_1.useCertificateStatus)(), certData = _a.data, isLoading = _a.isLoading, refetch = _a.refetch;
    var deleteMutation = (0, useCertificate_1.useDeleteCertificate)();
    var certificate = certData === null || certData === void 0 ? void 0 : certData.data;
    /**
     * Handle certificate deletion
     */
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(certificate === null || certificate === void 0 ? void 0 : certificate.hasCertificate))
                        return [2 /*return*/];
                    if (!confirm('Ești sigur că vrei să ștergi certificatul?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMutation.mutateAsync()];
                case 2:
                    _a.sent();
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    alert("Eroare la \u0219tergere: ".concat(err_1.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get certificate status badge
     */
    var getStatusBadge = function () {
        if (!(certificate === null || certificate === void 0 ? void 0 : certificate.hasCertificate)) {
            return <span className="badge badge-danger">"Lipsă"</span>;
        }
        var status = certificate.status;
        if (status === 'valid') {
            return <span className="badge badge-success">Valid</span>;
        }
        else if (status === 'expiring_soon') {
            return <span className="badge badge-warning">"expira curand"</span>;
        }
        else if (status === 'expired') {
            return <span className="badge badge-danger">Expirat</span>;
        }
        else {
            return <span className="badge badge-secondary">Invalid</span>;
        }
    };
    /**
     * Format date
     */
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };
    if (isLoading) {
        return (<div className="certificates-table">
        <div className="loading-spinner">Se încarcă...</div>
      </div>);
    }
    return (<div className="certificates-table">
      <div className="table-header">
        <h3 className="table-title">"certificate incarcate"</h3>
        <button onClick={function () { return refetch(); }} className="btn btn-secondary btn-sm">
          🔄 Actualizează
        </button>
      </div>

      {(certificate === null || certificate === void 0 ? void 0 : certificate.hasCertificate) ? (<table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Data Expirării</th>
              <th>"zile pana la expirare"</th>
              <th>"incarcat la"</th>
              <th>"Acțiuni"</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{getStatusBadge()}</td>
              <td>
                {formatDate(certificate.expiryDate)}
                {certificate.daysUntilExpiry !== null && certificate.daysUntilExpiry <= 30 && (<span className="warning-icon">⚠️</span>)}
              </td>
              <td>
                {certificate.daysUntilExpiry !== null
                ? certificate.daysUntilExpiry > 0
                    ? "".concat(certificate.daysUntilExpiry, " zile")
                    : 'Expirat'
                : 'N/A'}
              </td>
              <td>{formatDate(certificate.createdAt)}</td>
              <td>
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="btn btn-danger btn-sm">
                  {deleteMutation.isPending ? 'Se șterge...' : 'Șterge'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>) : (<div className="no-certificates">
          <p className="text-muted">"nu exista certificate incarcate"</p>
        </div>)}
    </div>);
}
