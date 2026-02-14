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
exports.RecipeVersionHistory = RecipeVersionHistory;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var Modal_1 = require("@/shared/components/Modal");
var RecipeVersionCompare_1 = require("./RecipeVersionCompare");
require("./RecipeVersionHistory.css");
function RecipeVersionHistory(_a) {
    var _this = this;
    var open = _a.open, recipeId = _a.recipeId, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), versions = _b[0], setVersions = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(false), compareOpen = _e[0], setCompareOpen = _e[1];
    var _f = (0, react_1.useState)(null), selectedVersions = _f[0], setSelectedVersions = _f[1];
    var loadVersions = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!recipeId || !open)
                        return [2 /*return*/];
                    setLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/admin/recipes/".concat(recipeId, "/versions"))];
                case 2:
                    response = _b.sent();
                    setVersions(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    setError(err_1.message || 'Eroare la încărcarea versiunilor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [recipeId, open]);
    (0, react_1.useEffect)(function () {
        loadVersions();
    }, [loadVersions]);
    var handleCompare = function (v1, v2) {
        setSelectedVersions({ v1: v1, v2: v2 });
        setCompareOpen(true);
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    var formatCost = function (cost) {
        return "".concat(cost.toFixed(2), " RON");
    };
    if (!open)
        return null;
    return (<>
      <Modal_1.Modal isOpen={open} title="Istoric Versiuni Rețetă" size="xl" onClose={onClose}>
        {error && <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/>}

        {loading ? (<div className="version-history-loading">"se incarca versiunile"</div>) : versions.length === 0 ? (<div className="version-history-empty">
            <p>"nu exista versiuni salvate pentru aceasta reteta"</p>
            <p className="text-muted">"versiunile se creeaza automat la fiecare salvare a"</p>
          </div>) : (<div className="version-history">
            <div className="version-history-list">
              {versions.map(function (version, index) { return (<div key={version.id} className={"version-item ".concat(version.is_active ? 'active' : '')}>
                  <div className="version-header">
                    <div className="version-number">
                      <span className="version-badge">v{version.version_number}</span>
                      {version.is_active && <span className="active-badge">ACTIV</span>}
                    </div>
                    <div className="version-meta">
                      <div className="version-date">{formatDate(version.changed_at)}</div>
                      <div className="version-author">de {version.changed_by}</div>
                    </div>
                  </div>

                  {version.change_description && (<div className="version-description">{version.change_description}</div>)}

                  {version.change_reason && (<div className="version-reason">
                      <strong>Motiv:</strong> {version.change_reason}
                    </div>)}

                  <div className="version-costs">
                    <div className="cost-item">
                      <span className="cost-label">Cost:</span>
                      <span className="cost-value">{formatCost(version.cost_after)}</span>
                    </div>
                    {version.cost_difference_percentage !== 0 && (<div className={"cost-difference ".concat(version.cost_difference_percentage > 0 ? 'increase' : 'decrease')}>
                        {version.cost_difference_percentage > 0 ? '↑' : '↓'}' '
                        {Math.abs(version.cost_difference_percentage).toFixed(1)}%
                      </div>)}
                  </div>

                  {index < versions.length - 1 && (<button type="button" className="btn-compare" onClick={function () { return handleCompare(version.version_number, versions[index + 1].version_number); }}>
                      Compară cu v{versions[index + 1].version_number}
                    </button>)}
                </div>); })}
            </div>
          </div>)}
      </Modal_1.Modal>

      {selectedVersions && (<RecipeVersionCompare_1.RecipeVersionCompare open={compareOpen} recipeId={recipeId} version1={selectedVersions.v1} version2={selectedVersions.v2} onClose={function () {
                setCompareOpen(false);
                setSelectedVersions(null);
            }}/>)}
    </>);
}
