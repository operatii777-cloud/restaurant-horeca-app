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
exports.default = CallCenterSimulatorPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var PageHeader_1 = require("@/shared/components/PageHeader");
function CallCenterSimulatorPage() {
    var _this = this;
    var _a = (0, react_1.useState)(''), phone = _a[0], setPhone = _a[1];
    var _b = (0, react_1.useState)(''), name = _b[0], setName = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), result = _d[0], setResult = _d[1];
    var handleSimulate = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!phone)
                        return [2 /*return*/];
                    setLoading(true);
                    setResult(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/call-center/simulate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                phoneNumber: phone,
                                customerName: name || undefined
                            })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setResult(data);
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    setResult({ success: false, error: err_1.message });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="p-6 max-w-2xl mx-auto">
            <PageHeader_1.PageHeader title="📞 Call Center Simulator" description="Simulează apeluri VoIP pentru testarea Caller ID"/>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mt-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Număr Telefon
                        </label>
                        <input type="text" value={phone} onChange={function (e) { return setPhone(e.target.value); }} placeholder="07xx xxx xxx" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent"/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nume Client (Optional - Override)
                        </label>
                        <input type="text" value={name} onChange={function (e) { return setName(e.target.value); }} placeholder="Popescu Ion" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent"/>
                        <p className="text-xs text-slate-500 mt-1">
                            * Dacă lași gol, sistemul va căuta în baza de date după telefon.
                        </p>
                    </div>

                    <button onClick={handleSimulate} disabled={loading || !phone} className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                        {loading ? 'Se trimite...' : <><lucide_react_1.Phone size={20}/> Simulează Apel</>}
                    </button>

                    {result && (<div className={"p-4 rounded-lg mt-4 ".concat(result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                            <div className="flex items-center gap-2 mb-2">
                                {result.success ? <lucide_react_1.Share2 size={18}/> : <lucide_react_1.AlertCircle size={18}/>}
                                <span className="font-bold">{result.success ? 'Succes!' : 'Eroare'}</span>
                            </div>
                            <pre className="text-xs overflow-auto max-h-40 bg-white/50 p-2 rounded border border-black/5">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                            {result.success && (<p className="text-sm mt-2">
                                    🔔 Ar trebui să vezi popup-ul Caller ID în colțul ecranului.
                                </p>)}
                        </div>)}
                </div>
            </div>
        </div>);
}
