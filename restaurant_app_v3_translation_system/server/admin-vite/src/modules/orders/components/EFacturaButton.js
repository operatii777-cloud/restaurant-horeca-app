"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Button Component
 *
 * Button to generate e-Factura for an order (S11 Part 4).
 * Displays status badge if invoice already exists.
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
exports.EFacturaButton = EFacturaButton;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var efacturaApi_1 = require("@/core/api/efacturaApi");
var InvoiceStatusBadge_1 = require("../../efactura/components/InvoiceStatusBadge");
require("./EFacturaButton.css");
function EFacturaButton(_a) {
    var _this = this;
    var orderId = _a.orderId, efacturaStatus = _a.efacturaStatus, efacturaInvoiceId = _a.efacturaInvoiceId, onUpdate = _a.onUpdate;
    //   const { t } = useTranslation();
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var handleGenerate = function () { return __awaiter(_this, void 0, void 0, function () {
        var invoice, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    //   const { t } = useTranslation();
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, efacturaApi_1.efacturaApi.createForOrder(orderId)];
                case 2:
                    invoice = _c.sent();
                    // Navigate to invoice details
                    navigate("/efactura/".concat(invoice.id));
                    if (onUpdate) {
                        onUpdate();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la generarea e-Factura');
                    console.error('EFacturaButton Error generating invoice:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleViewInvoice = function () {
        if (efacturaInvoiceId) {
            navigate("/efactura/".concat(efacturaInvoiceId));
        }
    };
    // If invoice exists, show status badge
    if (efacturaStatus && efacturaInvoiceId) {
        return (<div className="efactura-button-container">
        <InvoiceStatusBadge_1.InvoiceStatusBadge status={efacturaStatus}/>
        <button className="efactura-view-btn" onClick={handleViewInvoice} title="Vezi e-Factura">
          Vezi e-Factura
        </button>
      </div>);
    }
    // If no invoice, show generate button
    return (<div className="efactura-button-container">
      <button className="efactura-generate-btn" onClick={handleGenerate} disabled={loading} title="genereaza e factura pentru aceasta comanda">
        {loading ? '⏳ Se generează...' : '📄 Generează e-Factura'}
      </button>
      {error && (<div className="efactura-error">
          {error}
        </div>)}
    </div>);
}
