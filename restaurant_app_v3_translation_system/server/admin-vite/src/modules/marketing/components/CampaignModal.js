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
exports.CampaignModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
var CampaignModal = function (_a) {
    var show = _a.show, onClose = _a.onClose, onSave = _a.onSave;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({
        name: '',
        type: 'discount',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), saving = _d[0], setSaving = _d[1];
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    if (!formData.name || !formData.start_date || !formData.end_date) {
                        setError('Numele și perioada sunt obligatorii.');
                        return [2 /*return*/];
                    }
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSave(formData)];
                case 2:
                    _a.sent();
                    setFormData({
                        name: '',
                        type: 'discount',
                        start_date: new Date().toISOString().split('T')[0],
                        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'active',
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Eroare la salvare');
                    return [3 /*break*/, 5];
                case 4:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<react_bootstrap_1.Modal show={show} onHide={onClose} size="lg">
      <react_bootstrap_1.Modal.Header closeButton>
        <react_bootstrap_1.Modal.Title>
          <i className="fas fa-tags me-2"></i>"campanie noua"</react_bootstrap_1.Modal.Title>
      </react_bootstrap_1.Modal.Header>
      <react_bootstrap_1.Form onSubmit={handleSubmit}>
        <react_bootstrap_1.Modal.Body>
          {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Nume Campanie *</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Control type="text" value={formData.name} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} required placeholder="ex reducere vip clienti"/>
          </react_bootstrap_1.Form.Group>

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Tip Campanie *</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Select value={formData.type} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { type: e.target.value })); }); }} required>
              <option value="discount">Reducere</option>
              <option value="loyalty">"Fidelizare"</option>
              <option value="promotion">"Promoție"</option>
            </react_bootstrap_1.Form.Select>
          </react_bootstrap_1.Form.Group>

          <div className="row">
            <react_bootstrap_1.Form.Group className="mb-3 col-md-6">
              <react_bootstrap_1.Form.Label>Data început *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={formData.start_date} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { start_date: e.target.value })); }); }} required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3 col-md-6">
              <react_bootstrap_1.Form.Label>Data sfârșit *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={formData.end_date} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { end_date: e.target.value })); }); }} required/>
            </react_bootstrap_1.Form.Group>
          </div>

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Status *</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Select value={formData.status} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { status: e.target.value })); }); }} required>
              <option value="active">Activ</option>
              <option value="inactive">Inactiv</option>
              <option value="scheduled">Programat</option>
            </react_bootstrap_1.Form.Select>
          </react_bootstrap_1.Form.Group>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={onClose} disabled={saving}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" type="submit" disabled={saving}>
            {saving ? (<>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>"se salveaza"</>) : (<>
                <i className="fas fa-save me-2"></i>
                Salvează
              </>)}
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Form>
    </react_bootstrap_1.Modal>);
};
exports.CampaignModal = CampaignModal;
