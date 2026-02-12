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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.DailyMenuPage = void 0;
var react_1 = require("react");
var StatCard_1 = require("@/shared/components/StatCard");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var httpClient_1 = require("@/shared/api/httpClient");
var useDailyMenuData_1 = require("@/modules/daily-menu/hooks/useDailyMenuData");
require("./DailyMenuPage.css");
var DEFAULT_DISCOUNT = '10.00';
var soupMatchers = [/ciorb/i, /soup/i];
var mainMatchers = [/fel principal/i, /main/i];
var formatCurrency = function (value) { return "".concat(value.toFixed(2), " RON"); };
var safeNumber = function (value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim().length) {
        var parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};
var parseInputNumber = function (value) {
    var parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
};
var formatDate = function (value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
};
var formatDateRange = function (start, end) { return "".concat(formatDate(start), " -> ").concat(formatDate(end)); };
var matchesCategory = function (product, patterns) {
    return patterns.some(function (pattern) { var _a; return pattern.test((_a = product.category) !== null && _a !== void 0 ? _a : ''); });
};
var getProductLabel = function (product) { var _a; return (_a = product === null || product === void 0 ? void 0 : product.name) !== null && _a !== void 0 ? _a : 'Produs indisponibil'; };
var DailyMenuPage = function () {
    var _a, _b, _c, _d;
    //   const { t } = useTranslation();
    var _e = (0, useDailyMenuData_1.useDailyMenuData)(), products = _e.products, currentMenu = _e.currentMenu, schedules = _e.schedules, exceptions = _e.exceptions, loading = _e.loading, errors = _e.errors, refreshProducts = _e.refreshProducts, refreshCurrentMenu = _e.refreshCurrentMenu, refreshSchedules = _e.refreshSchedules, refreshExceptions = _e.refreshExceptions;
    var _f = (0, react_1.useState)('today'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = (0, react_1.useState)(null), feedback = _g[0], setFeedback = _g[1];
    var _h = (0, react_1.useState)({ today: false, deactivate: false, schedule: false, exception: false }), saving = _h[0], setSaving = _h[1];
    var _j = (0, react_1.useState)({ soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT }), todayForm = _j[0], setTodayForm = _j[1];
    var _k = (0, react_1.useState)({
        startDate: '',
        endDate: '',
        soupId: '',
        mainCourseId: '',
        discount: DEFAULT_DISCOUNT,
    }), scheduleForm = _k[0], setScheduleForm = _k[1];
    var _l = (0, react_1.useState)({ date: '', soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT }), exceptionForm = _l[0], setExceptionForm = _l[1];
    var _m = (0, react_1.useState)(null), pendingCancelScheduleId = _m[0], setPendingCancelScheduleId = _m[1];
    var _o = (0, react_1.useState)(null), pendingCancelExceptionId = _o[0], setPendingCancelExceptionId = _o[1];
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (currentMenu) {
            setTodayForm({
                soupId: ((_a = currentMenu.soup) === null || _a === void 0 ? void 0 : _a.id) ? String(currentMenu.soup.id) : '',
                mainCourseId: ((_b = currentMenu.mainCourse) === null || _b === void 0 ? void 0 : _b.id) ? String(currentMenu.mainCourse.id) : '',
                discount: Number.isFinite(currentMenu.discount)
                    ? currentMenu.discount.toFixed(2)
                    : DEFAULT_DISCOUNT,
            });
        }
    }, [currentMenu]);
    var categorizedProducts = (0, react_1.useMemo)(function () {
        if (!products.length) {
            return { soups: [], mains: [] };
        }
        var sorted = __spreadArray([], products, true).sort(function (a, b) { return a.name.localeCompare(b.name); });
        var soups = sorted.filter(function (product) { return matchesCategory(product, soupMatchers); });
        var mains = sorted.filter(function (product) { return matchesCategory(product, mainMatchers); });
        return {
            soups: soups.length ? soups : sorted,
            mains: mains.length ? mains : sorted,
        };
    }, [products]);
    var soups = categorizedProducts.soups;
    var mains = categorizedProducts.mains;
    var scheduleChartData = (0, react_1.useMemo)(function () {
        if (!schedules.length) {
            return [{ label: 'Fara programari', value: 0 }];
        }
        return schedules.slice(0, 6).map(function (schedule) {
            var soupPrice = safeNumber(schedule.soup_price);
            var mainPrice = safeNumber(schedule.main_course_price);
            var discount = safeNumber(schedule.discount);
            return {
                label: formatDateRange(schedule.start_date, schedule.end_date),
                value: Number((soupPrice + mainPrice - discount).toFixed(2)),
            };
        });
    }, [schedules]);
    var donutDataset = (0, react_1.useMemo)(function () {
        if (!schedules.length && !exceptions.length) {
            return {
                chart: [{ name: 'Fara date', value: 100, color: '#94a3b8' }],
                legend: [{ name: 'Fara date', value: 100, color: '#94a3b8', raw: 0 }],
            };
        }
        var total = schedules.length + exceptions.length;
        var makeEntry = function (name, count, color) { return ({
            name: name,
            value: Number(((count / total) * 100).toFixed(1)),
            color: color,
            raw: count,
        }); };
        var entries = [
            makeEntry('Programari', schedules.length, '#0ea5e9'),
            makeEntry('Exceptii', exceptions.length, '#f97316'),
        ];
        return {
            chart: entries.map(function (_a) {
                var raw = _a.raw, rest = __rest(_a, ["raw"]);
                return rest;
            }),
            legend: entries,
        };
    }, [schedules.length, exceptions.length]);
    var activeMenuValue = currentMenu
        ? safeNumber((_a = currentMenu.soup) === null || _a === void 0 ? void 0 : _a.price) + safeNumber((_b = currentMenu.mainCourse) === null || _b === void 0 ? void 0 : _b.price) - safeNumber(currentMenu.discount)
        : 0;
    var isPageReady = !loading.products && !loading.current;
    var refreshAll = (0, react_1.useCallback)(function () {
        void refreshProducts();
        void refreshCurrentMenu();
        void refreshSchedules();
        void refreshExceptions();
    }, [refreshProducts, refreshCurrentMenu, refreshSchedules, refreshExceptions]);
    var showFeedback = function (state) { return setFeedback(state); };
    var handleTodaySubmit = (0, react_1.useCallback)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    if (!todayForm.soupId || !todayForm.mainCourseId) {
                        showFeedback({ type: 'warning', message: 'Selecteaza atat ciorba, cat si felul principal.' });
                        return [2 /*return*/];
                    }
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { today: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/daily-menu', {
                            soupId: Number(todayForm.soupId),
                            mainCourseId: Number(todayForm.mainCourseId),
                            discount: parseInputNumber(todayForm.discount),
                        })];
                case 2:
                    _a.sent();
                    showFeedback({ type: 'success', message: 'Meniul zilei a fost salvat.' });
                    return [4 /*yield*/, refreshCurrentMenu()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    message = error_1 instanceof Error ? error_1.message : 'Nu am putut salva meniul zilei.';
                    showFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { today: false })); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [todayForm, refreshCurrentMenu]);
    var handleDeactivate = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentMenu) {
                        showFeedback({ type: 'info', message: 'Nu exista un meniu activ de dezactivat.' });
                        return [2 /*return*/];
                    }
                    if (!window.confirm('Sigur dezactivezi meniul zilei pentru astazi?')) {
                        return [2 /*return*/];
                    }
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { deactivate: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete('/api/admin/daily-menu')];
                case 2:
                    _a.sent();
                    showFeedback({ type: 'success', message: 'Meniul zilei a fost dezactivat.' });
                    return [4 /*yield*/, refreshCurrentMenu()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    message = error_2 instanceof Error ? error_2.message : 'Nu am putut dezactiva meniul zilei.';
                    showFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { deactivate: false })); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [currentMenu, refreshCurrentMenu]);
    var handleScheduleSubmit = (0, react_1.useCallback)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    if (!scheduleForm.startDate || !scheduleForm.endDate || !scheduleForm.soupId || !scheduleForm.mainCourseId) {
                        showFeedback({ type: 'warning', message: 'Completeaza toate campurile pentru programare.' });
                        return [2 /*return*/];
                    }
                    if (new Date(scheduleForm.startDate) > new Date(scheduleForm.endDate)) {
                        showFeedback({ type: 'warning', message: 'Data de inceput trebuie sa fie inainte de data de sfarsit.' });
                        return [2 /*return*/];
                    }
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { schedule: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/daily-menu/schedule', {
                            startDate: scheduleForm.startDate,
                            endDate: scheduleForm.endDate,
                            soupId: Number(scheduleForm.soupId),
                            mainCourseId: Number(scheduleForm.mainCourseId),
                            discount: parseInputNumber(scheduleForm.discount),
                        })];
                case 2:
                    _a.sent();
                    showFeedback({ type: 'success', message: 'Programarea a fost creata.' });
                    setScheduleForm({ startDate: '', endDate: '', soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT });
                    return [4 /*yield*/, refreshSchedules()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    message = error_3 instanceof Error ? error_3.message : 'Nu am putut crea programarea.';
                    showFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { schedule: false })); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [scheduleForm, refreshSchedules]);
    var handleExceptionSubmit = (0, react_1.useCallback)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    if (!exceptionForm.date || !exceptionForm.soupId || !exceptionForm.mainCourseId) {
                        showFeedback({ type: 'warning', message: 'Completeaza toate campurile pentru exceptie.' });
                        return [2 /*return*/];
                    }
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { exception: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/daily-menu/exception', {
                            date: exceptionForm.date,
                            soupId: Number(exceptionForm.soupId),
                            mainCourseId: Number(exceptionForm.mainCourseId),
                            discount: parseInputNumber(exceptionForm.discount),
                        })];
                case 2:
                    _a.sent();
                    showFeedback({ type: 'success', message: 'Exceptia a fost creata.' });
                    setExceptionForm({ date: '', soupId: '', mainCourseId: '', discount: DEFAULT_DISCOUNT });
                    return [4 /*yield*/, refreshExceptions()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    message = error_4 instanceof Error ? error_4.message : 'Nu am putut crea exceptia.';
                    showFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(function (prev) { return (__assign(__assign({}, prev), { exception: false })); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [exceptionForm, refreshExceptions]);
    var handleCancelSchedule = (0, react_1.useCallback)(function (scheduleId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Anulezi aceasta programare?')) {
                        return [2 /*return*/];
                    }
                    setPendingCancelScheduleId(scheduleId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/daily-menu/schedule/".concat(scheduleId))];
                case 2:
                    _a.sent();
                    showFeedback({ type: 'success', message: 'Programarea a fost anulata.' });
                    return [4 /*yield*/, refreshSchedules()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_5 = _a.sent();
                    message = error_5 instanceof Error ? error_5.message : 'Nu am putut anula programarea.';
                    showFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setPendingCancelScheduleId(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [refreshSchedules]);
    var handleCancelException = (0, react_1.useCallback)(function (exceptionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Anulezi aceasta exceptie?')) {
                        return [2 /*return*/];
                    }
                    setPendingCancelExceptionId(exceptionId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/daily-menu/exception/".concat(exceptionId))];
                case 2:
                    _a.sent();
                    showFeedback({ type: 'success', message: 'Exceptia a fost anulata.' });
                    return [4 /*yield*/, refreshExceptions()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_6 = _a.sent();
                    message = error_6 instanceof Error ? error_6.message : 'Eroare necunoscută';
                    showFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setPendingCancelExceptionId(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [refreshExceptions, showFeedback]);
    return (<div className="daily-menu-page" data-page-ready={isPageReady}>
      <PageHeader_1.PageHeader title='daily menu & oferte' description="Gestionează meniul zilei, programări automate și excepții pentru oferte speciale" actions={[
            {
                label: '↻ Reîmprospătează',
                variant: 'secondary',
                onClick: refreshAll,
            },
        ]}/>

      {feedback ? <InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message}/> : null}

      {errors.products ? <InlineAlert_1.InlineAlert type="error" message={errors.products}/> : null}
      {errors.current ? <InlineAlert_1.InlineAlert type="error" message={errors.current}/> : null}
      {errors.schedules ? <InlineAlert_1.InlineAlert type="error" message={errors.schedules}/> : null}
      {errors.exceptions ? <InlineAlert_1.InlineAlert type="error" message={errors.exceptions}/> : null}

      <div className="daily-menu-hero">
        <div className="daily-menu-hero__stats">
          <StatCard_1.StatCard title='daily-menu.meniul_activ_astazi' value={currentMenu ? formatCurrency(activeMenuValue) : 'Nu este setat'} helper={currentMenu
            ? "".concat(getProductLabel(currentMenu.soup), " + ").concat(getProductLabel(currentMenu.mainCourse))
            : 'Selectează ciorba și felul principal'}/>
          <StatCard_1.StatCard title='daily-menu.programari_active' value={String(schedules.length)} helper={"".concat(exceptions.length, " excep\u021Bii definite")}/>
          <StatCard_1.StatCard title="Produse disponibile" value={String(products.length)} helper={"".concat(soups.length, " ciorbe, ").concat(mains.length, " feluri principale")}/>
        </div>

        <div className="daily-menu-toolbar">
          <div className="daily-menu-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={function () { return setActiveTab('today'); }} className={"tab-btn ".concat(activeTab === 'today' ? 'active' : '')} style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: activeTab === 'today' ? '#0ea5e9' : 'white',
            color: activeTab === 'today' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: activeTab === 'today' ? 600 : 500,
        }}>Astăzi</button>
            <button type="button" onClick={function () { return setActiveTab('calendar'); }} className={"tab-btn ".concat(activeTab === 'calendar' ? 'active' : '')} style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: activeTab === 'calendar' ? '#0ea5e9' : 'white',
            color: activeTab === 'calendar' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: activeTab === 'calendar' ? 600 : 500,
        }}>
              Calendar
            </button>
            <button type="button" onClick={function () { return setActiveTab('exceptions'); }} className={"tab-btn ".concat(activeTab === 'exceptions' ? 'active' : '')} style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: activeTab === 'exceptions' ? '#0ea5e9' : 'white',
            color: activeTab === 'exceptions' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: activeTab === 'exceptions' ? 600 : 500,
        }}>Excepții</button>
          </div>
        </div>
      </div>

      {/* Tab Astăzi */}
      {activeTab === 'today' && (<div className="daily-menu-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="daily-menu-card" style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: 'white',
            }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>'daily-menu.meniul_zilei_pentru_astazi'</h3>
            <form id="today-form" onSubmit={handleTodaySubmit} className="daily-menu-editor__row">
              <label>
                Alege Ciorba:
                <select value={todayForm.soupId} onChange={function (e) { return setTodayForm(function (prev) { return (__assign(__assign({}, prev), { soupId: e.target.value })); }); }} disabled={loading.products || saving.today}>
                  <option value="">-- Selectează ciorba --</option>
                  {soups.map(function (soup) {
                var _a;
                return (<option key={soup.id} value={String(soup.id)}>
                      {soup.name} ({formatCurrency((_a = soup.price) !== null && _a !== void 0 ? _a : 0)})
                    </option>);
            })}
                </select>
              </label>
              <label>
                Alege Felul Principal:
                <select value={todayForm.mainCourseId} onChange={function (e) { return setTodayForm(function (prev) { return (__assign(__assign({}, prev), { mainCourseId: e.target.value })); }); }} disabled={loading.products || saving.today}>
                  <option value="">-- Selectează felul principal --</option>
                  {mains.map(function (main) {
                var _a;
                return (<option key={main.id} value={String(main.id)}>
                      {main.name} ({formatCurrency((_a = main.price) !== null && _a !== void 0 ? _a : 0)})
                    </option>);
            })}
                </select>
              </label>
              <label>
                Reducere (RON):
                <input type="number" step="0.01" min="0" value={todayForm.discount} onChange={function (e) { return setTodayForm(function (prev) { return (__assign(__assign({}, prev), { discount: e.target.value })); }); }} disabled={saving.today}/>
              </label>
            </form>
            <div className="daily-menu-toolbar__actions" style={{ marginTop: '1rem' }}>
              <button type="submit" form="today-form" disabled={saving.today || loading.products}>
                {saving.today ? 'Se salvează...' : '💾 Salvează Meniul'}
              </button>
              {currentMenu && (<button type="button" onClick={handleDeactivate} disabled={saving.deactivate}>
                  {saving.deactivate ? 'Se dezactivează...' : '❌ Dezactivează'}
                </button>)}
            </div>
          </div>

          {currentMenu && (<div className="daily-menu-card" style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #d1fae5',
                    background: '#f0fdf4',
                }}>
              <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#059669' }}>✓ Meniu activ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong>Ciorba:</strong> {getProductLabel(currentMenu.soup)} -' '
                  {formatCurrency(safeNumber((_c = currentMenu.soup) === null || _c === void 0 ? void 0 : _c.price))}
                </div>
                <div>
                  <strong>Fel principal:</strong> {getProductLabel(currentMenu.mainCourse)} -' '
                  {formatCurrency(safeNumber((_d = currentMenu.mainCourse) === null || _d === void 0 ? void 0 : _d.price))}
                </div>
                <div>
                  <strong>Reducere:</strong> {formatCurrency(safeNumber(currentMenu.discount))}
                </div>
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #bbf7d0' }}>
                  <strong>'daily-menu.pret_total'</strong> {formatCurrency(activeMenuValue)}
                </div>
              </div>
            </div>)}
        </div>)}

      {/* Tab Calendar */}
      {activeTab === 'calendar' && (<div className="daily-menu-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="daily-menu-card" style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: 'white',
            }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              Programare Meniu (Interval)
            </h3>
            <form id="schedule-form" onSubmit={handleScheduleSubmit} className="daily-menu-editor__row">
              <label>
                Data început:
                <input type="date" value={scheduleForm.startDate} onChange={function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { startDate: e.target.value })); }); }} disabled={saving.schedule} required/>
              </label>
              <label>'daily-menu.data_sfarsit'<input type="date" value={scheduleForm.endDate} onChange={function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { endDate: e.target.value })); }); }} disabled={saving.schedule} required/>
              </label>
              <label>
                Ciorba:
                <select value={scheduleForm.soupId} onChange={function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { soupId: e.target.value })); }); }} disabled={loading.products || saving.schedule} required>
                  <option value="">-- Selectează --</option>
                  {soups.map(function (soup) { return (<option key={soup.id} value={String(soup.id)}>
                      {soup.name}
                    </option>); })}
                </select>
              </label>
              <label>
                Fel principal:
                <select value={scheduleForm.mainCourseId} onChange={function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { mainCourseId: e.target.value })); }); }} disabled={loading.products || saving.schedule} required>
                  <option value="">-- Selectează --</option>
                  {mains.map(function (main) { return (<option key={main.id} value={String(main.id)}>
                      {main.name}
                    </option>); })}
                </select>
              </label>
              <label>
                Reducere (RON):
                <input type="number" step="0.01" min="0" value={scheduleForm.discount} onChange={function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { discount: e.target.value })); }); }} disabled={saving.schedule}/>
              </label>
            </form>
            <div className="daily-menu-toolbar__actions" style={{ marginTop: '1rem' }}>
              <button type="submit" form="schedule-form" disabled={saving.schedule || loading.products}>
                {saving.schedule ? 'Se salvează...' : '📅 Creează Programare'}
              </button>
            </div>
          </div>

          {schedules.length > 0 ? (<div className="daily-menu-card" style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>'daily-menu.programari_active'</h4>
              <ul className="daily-menu-placeholder">
                {schedules.map(function (schedule) { return (<li key={schedule.id}>
                    <div>
                      <strong>{formatDateRange(schedule.start_date, schedule.end_date)}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Reducere: {formatCurrency(safeNumber(schedule.discount))}
                      </div>
                    </div>
                    <button type="button" onClick={function () { return handleCancelSchedule(schedule.id); }} disabled={pendingCancelScheduleId === schedule.id} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}>
                      {pendingCancelScheduleId === schedule.id ? 'Se anulează...' : 'Anulează'}
                    </button>
                  </li>); })}
              </ul>
            </div>) : (<div className="daily-menu-empty" style={{ padding: '2rem', textAlign: 'center' }}>Nu există programări active</div>)}

          {schedules.length > 0 && (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Programări (grafic)</h4>
                <MiniBarChart_1.MiniBarChart data={scheduleChartData}/>
              </div>
              <div style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Distribuție</h4>
                <MiniDonutChart_1.MiniDonutChart data={donutDataset.chart}/>
              </div>
            </div>)}
        </div>)}

      {/* Tab Excepții */}
      {activeTab === 'exceptions' && (<div className="daily-menu-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="daily-menu-card" style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: 'white',
            }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>'daily-menu.exceptie_pentru_o_zi_specifica'</h3>
            <form id="exception-form" onSubmit={handleExceptionSubmit} className="daily-menu-editor__row">
              <label>
                Data:
                <input type="date" value={exceptionForm.date} onChange={function (e) { return setExceptionForm(function (prev) { return (__assign(__assign({}, prev), { date: e.target.value })); }); }} disabled={saving.exception} required/>
              </label>
              <label>
                Ciorba:
                <select value={exceptionForm.soupId} onChange={function (e) { return setExceptionForm(function (prev) { return (__assign(__assign({}, prev), { soupId: e.target.value })); }); }} disabled={loading.products || saving.exception} required>
                  <option value="">-- Selectează --</option>
                  {soups.map(function (soup) { return (<option key={soup.id} value={String(soup.id)}>
                      {soup.name}
                    </option>); })}
                </select>
              </label>
              <label>
                Fel principal:
                <select value={exceptionForm.mainCourseId} onChange={function (e) { return setExceptionForm(function (prev) { return (__assign(__assign({}, prev), { mainCourseId: e.target.value })); }); }} disabled={loading.products || saving.exception} required>
                  <option value="">-- Selectează --</option>
                  {mains.map(function (main) { return (<option key={main.id} value={String(main.id)}>
                      {main.name}
                    </option>); })}
                </select>
              </label>
              <label>
                Reducere (RON):
                <input type="number" step="0.01" min="0" value={exceptionForm.discount} onChange={function (e) { return setExceptionForm(function (prev) { return (__assign(__assign({}, prev), { discount: e.target.value })); }); }} disabled={saving.exception}/>
              </label>
            </form>
            <div className="daily-menu-toolbar__actions" style={{ marginTop: '1rem' }}>
              <button type="submit" form="exception-form" disabled={saving.exception || loading.products}>
                {saving.exception ? 'Se salvează...' : '➕ Creează Excepție'}
              </button>
            </div>
          </div>

          {exceptions.length > 0 ? (<div className="daily-menu-card" style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>'daily-menu.exceptii_definite'</h4>
              <ul className="daily-menu-placeholder">
                {exceptions.map(function (exception) { return (<li key={exception.id}>
                    <div>
                      <strong>{formatDate(exception.date)}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Reducere: {formatCurrency(safeNumber(exception.discount))}
                      </div>
                    </div>
                    <button type="button" onClick={function () { return handleCancelException(exception.id); }} disabled={pendingCancelExceptionId === exception.id} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}>
                      {pendingCancelExceptionId === exception.id ? 'Se anulează...' : 'Anulează'}
                    </button>
                  </li>); })}
              </ul>
            </div>) : (<div className="daily-menu-empty" style={{ padding: '2rem', textAlign: 'center' }}>'daily-menu.nu_exista_exceptii_definite'</div>)}
        </div>)}
    </div>);
};
exports.DailyMenuPage = DailyMenuPage;
