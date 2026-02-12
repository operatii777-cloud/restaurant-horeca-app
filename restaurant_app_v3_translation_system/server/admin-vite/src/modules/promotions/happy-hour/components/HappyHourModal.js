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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HappyHourModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
var HappyHourModal = function (_a) {
    var show = _a.show, happyHour = _a.happyHour, onClose = _a.onClose, onSave = _a.onSave;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({
        name: '',
        start_time: '',
        end_time: '',
        days_of_week: [],
        discount_percentage: 0,
        discount_fixed: 0,
        applicable_categories: [],
        applicable_products: [],
        is_active: true,
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), saving = _d[0], setSaving = _d[1];
    (0, react_1.useEffect)(function () {
        if (happyHour) {
            var days_1 = typeof happyHour.days_of_week === 'string'
                ? JSON.parse(happyHour.days_of_week || '[]')
                : happyHour.days_of_week || [];
            var categories = typeof happyHour.applicable_categories === 'string'
                ? JSON.parse(happyHour.applicable_categories || '[]')
                : happyHour.applicable_categories || [];
            var products = typeof happyHour.applicable_products === 'string'
                ? JSON.parse(happyHour.applicable_products || '[]')
                : happyHour.applicable_products || [];
            setFormData({
                name: happyHour.name || '',
                start_time: happyHour.start_time || '',
                end_time: happyHour.end_time || '',
                days_of_week: Array.isArray(days_1) ? days_1 : [],
                discount_percentage: happyHour.discount_percentage || 0,
                discount_fixed: happyHour.discount_fixed || 0,
                applicable_categories: Array.isArray(categories) ? categories : [],
                applicable_products: Array.isArray(products) ? products : [],
                is_active: happyHour.is_active !== undefined ? happyHour.is_active : true,
            });
        }
        else {
            setFormData({
                name: '',
                start_time: '',
                end_time: '',
                days_of_week: [],
                discount_percentage: 0,
                discount_fixed: 0,
                applicable_categories: [],
                applicable_products: [],
                is_active: true,
            });
        }
        setError(null);
    }, [happyHour, show]);
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    if (!formData.name || !formData.start_time || !formData.end_time || formData.days_of_week.length === 0) {
                        setError('Numele, orele și zilele sunt obligatorii.');
                        return [2 /*return*/];
                    }
                    if (!formData.discount_percentage && !formData.discount_fixed) {
                        setError('Trebuie să specifici fie discount procentual, fie discount fix.');
                        return [2 /*return*/];
                    }
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSave({
                            name: formData.name,
                            start_time: formData.start_time,
                            end_time: formData.end_time,
                            days_of_week: JSON.stringify(formData.days_of_week),
                            discount_percentage: formData.discount_percentage || 0,
                            discount_fixed: formData.discount_fixed || 0,
                            applicable_categories: JSON.stringify(formData.applicable_categories),
                            applicable_products: JSON.stringify(formData.applicable_products),
                            is_active: formData.is_active,
                        })];
                case 2:
                    _a.sent();
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
    var toggleDay = function (day) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(function (d) { return d !== day; })
                : __spreadArray(__spreadArray([], prev.days_of_week, true), [day], false) })); });
    };
    var days = [
        { value: '0', label: 'Luni' },
        { value: '1', label: 'Marți' },
        { value: '2', label: 'Miercuri' },
        { value: '3', label: 'Joi' },
        { value: '4', label: 'Vineri' },
        { value: '5', label: 'Sâmbătă' },
        { value: '6', label: 'Duminică' },
    ];
    return (<react_bootstrap_1.Modal show={show} onHide={onClose} size="lg">
      <react_bootstrap_1.Modal.Header closeButton>
        <react_bootstrap_1.Modal.Title>
          <i className="fas fa-clock me-2"></i>
          {happyHour ? 'Editează Happy Hour' : 'Happy Hour Nou'}
        </react_bootstrap_1.Modal.Title>
      </react_bootstrap_1.Modal.Header>
      <react_bootstrap_1.Form onSubmit={handleSubmit}>
        <react_bootstrap_1.Modal.Body>
          {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Nume Happy Hour *</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Control type="text" value={formData.name} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} required placeholder="ex happy hour dimineata"/>
          </react_bootstrap_1.Form.Group>

          <div className="row">
            <react_bootstrap_1.Form.Group className="mb-3 col-md-6">
              <react_bootstrap_1.Form.Label>Ora de început *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="time" value={formData.start_time} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { start_time: e.target.value })); }); }} required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3 col-md-6">
              <react_bootstrap_1.Form.Label>Ora de sfârșit *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="time" value={formData.end_time} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { end_time: e.target.value })); }); }} required/>
            </react_bootstrap_1.Form.Group>
          </div>

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Zile săptămânii *</react_bootstrap_1.Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {days.map(function (day) { return (<react_bootstrap_1.Button key={day.value} variant={formData.days_of_week.includes(day.value) ? 'warning' : 'outline-warning'} type="button" onClick={function () { return toggleDay(day.value); }}>
                  {day.label}
                </react_bootstrap_1.Button>); })}
            </div>
            {formData.days_of_week.length === 0 && (<react_bootstrap_1.Form.Text className="text-danger">"selecteaza cel putin o zi"</react_bootstrap_1.Form.Text>)}
          </react_bootstrap_1.Form.Group>

          <div className="row">
            <react_bootstrap_1.Form.Group className="mb-3 col-md-6">
              <react_bootstrap_1.Form.Label>Discount Procentual (%)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" min="0" max="100" value={formData.discount_percentage} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { discount_percentage: parseFloat(e.target.value) || 0 })); }); }} placeholder="ex: 20"/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3 col-md-6">
              <react_bootstrap_1.Form.Label>Discount Fix (RON)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" min="0" value={formData.discount_fixed} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { discount_fixed: parseFloat(e.target.value) || 0 })); }); }} placeholder="ex: 10"/>
            </react_bootstrap_1.Form.Group>
          </div>

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Check type="checkbox" label="Activ" checked={formData.is_active} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { is_active: e.target.checked })); }); }}/>
          </react_bootstrap_1.Form.Group>

          <react_bootstrap_1.Form.Text className="text-muted">
            * Câmpuri obligatorii. Trebuie să specifici fie discount procentual, fie discount fix.
          </react_bootstrap_1.Form.Text>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={onClose} disabled={saving}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="warning" type="submit" disabled={saving}>
            {saving ? (<>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>"se salveaza"</>) : (<>
                <i className="fas fa-save me-2"></i>
                Salvează
              </>)}
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Form>
    </react_bootstrap_1.Modal>);
};
exports.HappyHourModal = HappyHourModal;
