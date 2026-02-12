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
exports.AdditiveSelector = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("./AdditiveSelector.css");
var AdditiveSelector = function (_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.label, label = _b === void 0 ? 'Aditivi' : _b, _c = _a.placeholder, placeholder = _c === void 0 ? 'Selectează aditivi...' : _c;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)([]), additives = _d[0], setAdditives = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)([]), selectedIds = _f[0], setSelectedIds = _f[1];
    var _g = (0, react_1.useState)(''), searchTerm = _g[0], setSearchTerm = _g[1];
    (0, react_1.useEffect)(function () {
        loadAdditives();
    }, []);
    (0, react_1.useEffect)(function () {
        // Parse value to get selected IDs
        if (value) {
            try {
                var parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    setSelectedIds(parsed);
                }
            }
            catch (_a) {
                setSelectedIds([]);
            }
        }
        else {
            setSelectedIds([]);
        }
    }, [value]);
    var loadAdditives = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/ingredient-catalog/additives')];
                case 2:
                    response = _a.sent();
                    if (response.data.success && response.data.additives) {
                        setAdditives(response.data.additives);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading additives:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleToggle = function (additiveId) {
        var newSelected = selectedIds.includes(additiveId)
            ? selectedIds.filter(function (id) { return id !== additiveId; })
            : __spreadArray(__spreadArray([], selectedIds, true), [additiveId], false);
        setSelectedIds(newSelected);
        onChange(JSON.stringify(newSelected));
    };
    var filteredAdditives = additives.filter(function (a) {
        return (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.name_en && a.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.e_code && a.e_code.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    var selectedAdditives = additives.filter(function (a) { return selectedIds.includes(a.id); });
    return (<div className="additive-selector">
      <react_bootstrap_1.Form.Label>{label}</react_bootstrap_1.Form.Label>

      {/* Selected additives display */}
      {selectedAdditives.length > 0 && (<div className="selected-additives mb-2">
          {selectedAdditives.map(function (additive) { return (<react_bootstrap_1.Badge key={additive.id} bg="warning" text="dark" className="me-2 mb-2" style={{ cursor: 'pointer', fontSize: '0.875rem', padding: '0.5rem' }} onClick={function () { return handleToggle(additive.id); }}>
              {additive.e_code || additive.name}
              {additive.name && additive.e_code && " - ".concat(additive.name)}
              <i className="fas fa-times ms-2"></i>
            </react_bootstrap_1.Badge>); })}
        </div>)}

      {/* Search input */}
      <react_bootstrap_1.Form.Control type="text" placeholder={placeholder} value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="mb-2"/>

      {/* Additives list */}
      {loading ? (<div className="text-muted text-center py-2">
          <i className="fas fa-spinner fa-spin me-2"></i>"se incarca aditivi"</div>) : (<div className="additives-list">
          {filteredAdditives.length === 0 ? (<div className="text-muted text-center py-2">
              {searchTerm ? 'Nu s-au găsit aditivi.' : 'Nu există aditivi în catalog.'}
            </div>) : (filteredAdditives.map(function (additive) { return (<div key={additive.id} className={"additive-item ".concat(selectedIds.includes(additive.id) ? 'selected' : '')} onClick={function () { return handleToggle(additive.id); }}>
                <react_bootstrap_1.Form.Check type="checkbox" checked={selectedIds.includes(additive.id)} onChange={function () { return handleToggle(additive.id); }} label={<span>
                      <strong>{additive.e_code || additive.name}</strong>
                      {additive.name && additive.e_code && <span className="ms-2">{additive.name}</span>}
                      {additive.name_en && <span className="text-muted ms-2">({additive.name_en})</span>}
                    </span>}/>
                {additive.description && (<div className="text-muted small ms-4">{additive.description}</div>)}
              </div>); }))}
        </div>)}
    </div>);
};
exports.AdditiveSelector = AdditiveSelector;
