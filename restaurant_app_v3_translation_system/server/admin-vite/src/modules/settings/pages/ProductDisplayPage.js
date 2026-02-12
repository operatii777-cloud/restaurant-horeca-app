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
exports.ProductDisplayPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("./ProductDisplayPage.css");
var ProductDisplayPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), setting = _a[0], setSetting = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), saving = _c[0], setSaving = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), success = _e[0], setSuccess = _e[1];
    (0, react_1.useEffect)(function () {
        loadSetting();
    }, []);
    var loadSetting = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/product-display-setting')];
                case 1:
                    response = _c.sent();
                    setSetting(response.data);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _c.sent();
                    console.error('Error loading product display setting:', err_1);
                    setError(((_b = (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la încărcarea setării');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!setting)
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    setSaving(true);
                    setError(null);
                    setSuccess(null);
                    return [4 /*yield*/, httpClient_1.httpClient.put('/api/admin/product-display-setting', { autoManageDisplay: setting.autoManageDisplay })];
                case 2:
                    response = _c.sent();
                    if (!response.data.success) return [3 /*break*/, 4];
                    setSuccess(response.data.message);
                    return [4 /*yield*/, loadSetting()];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setError('Eroare la actualizarea setării');
                    _c.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    err_2 = _c.sent();
                    console.error('Error updating product display setting:', err_2);
                    setError(((_b = (_a = err_2 === null || err_2 === void 0 ? void 0 : err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la actualizarea setării');
                    return [3 /*break*/, 8];
                case 7:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="product-display-page">
        <PageHeader_1.PageHeader title='🛍️ gestionare afisare produse'/>
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">"se incarca setarile"</p>
        </div>
      </div>);
    }
    return (<div className="product-display-page">
      <PageHeader_1.PageHeader title='🛍️ gestionare afisare produse' description="Control afișare produse în meniul clientului" actions={[
            {
                label: '🔄 Actualizează',
                variant: 'secondary',
                onClick: loadSetting,
            },
        ]}/>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
          {error}
        </react_bootstrap_1.Alert>)}

      {success && (<react_bootstrap_1.Alert variant="success" dismissible onClose={function () { return setSuccess(null); }}>
          {success}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card className="mt-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">"control afisare produse in meniul clientului"</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>"mod de afisare produse"</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={(setting === null || setting === void 0 ? void 0 : setting.autoManageDisplay) ? 'true' : 'false'} onChange={function (e) {
            return setSetting(__assign(__assign({}, setting), { autoManageDisplay: e.target.value === 'true' }));
        }} disabled={saving}>
                <option value="false">Toate produsele afișate (recomandat)</option>
                <option value="true">Doar produsele cu stoc &gt; 0</option>
              </react_bootstrap_1.Form.Select>
              <react_bootstrap_1.Form.Text className="text-muted">
                {(setting === null || setting === void 0 ? void 0 : setting.autoManageDisplay)
            ? 'Produsele fără stoc vor fi ascunse automat din meniul clientului'
            : 'Toate produsele vor fi afișate în meniul clientului, indiferent de stoc'}
              </react_bootstrap_1.Form.Text>
            </react_bootstrap_1.Form.Group>

            {(setting === null || setting === void 0 ? void 0 : setting.description) && (<react_bootstrap_1.Alert variant={setting.autoManageDisplay ? 'warning' : 'success'} className="mt-3">
                {setting.description}
              </react_bootstrap_1.Alert>)}

            <div className="d-flex gap-2 mt-4">
              <react_bootstrap_1.Button variant="primary" onClick={handleSave} disabled={saving || !setting}>
                {saving ? (<>
                    <react_bootstrap_1.Spinner animation="border" size="sm" className="me-2"/>"se salveaza"</>) : (<>
                    <i className="fas fa-save me-2"></i>"salveaza setarea"</>)}
              </react_bootstrap_1.Button>
            </div>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.ProductDisplayPage = ProductDisplayPage;
