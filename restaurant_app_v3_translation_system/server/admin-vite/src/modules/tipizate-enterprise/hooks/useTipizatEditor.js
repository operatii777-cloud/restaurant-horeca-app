"use strict";
/**
 * PHASE S5.4 - useTipizatEditor Hook
 * Enterprise editor hook for all tipizate documents
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
exports.useTipizatEditor = useTipizatEditor;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var react_query_1 = require("@tanstack/react-query");
var tipizateApi_1 = require("../api/tipizateApi");
var tipizate_config_1 = require("../config/tipizate.config");
var tipizateStore_1 = require("../store/tipizateStore");
function useTipizatEditor(type) {
    var _this = this;
    var id = (0, react_router_dom_1.useParams)().id;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var queryClient = (0, react_query_1.useQueryClient)();
    var store = (0, tipizateStore_1.useTipizateStore)();
    var isNew = id === 'new' || !id;
    // State
    var _a = (0, react_1.useState)({}), form = _a[0], setForm = _a[1];
    var _b = (0, react_1.useState)([]), lines = _b[0], setLines = _b[1];
    var _c = (0, react_1.useState)({}), totals = _c[0], setTotals = _c[1];
    var _d = (0, react_1.useState)(null), pdfUrl = _d[0], setPdfUrl = _d[1];
    var _e = (0, react_1.useState)(false), pdfOpen = _e[0], setPdfOpen = _e[1];
    // Check cache first
    var cachedDoc = !isNew && id ? store.getDocCache(type, parseInt(id)) : null;
    // Load document
    var query = (0, react_query_1.useQuery)({
        enabled: !isNew && !!id,
        queryKey: ['tipizate', type, id, store.reloadToken],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tipizateApi_1.tipizateApi.get(type, parseInt(id))];
                    case 1:
                        data = _a.sent();
                        // Cache the document
                        if (data && id) {
                            store.setDocCache(type, parseInt(id), data);
                            store.setLastOpened(type, parseInt(id));
                        }
                        return [2 /*return*/, data];
                }
            });
        }); },
        initialData: cachedDoc,
        onSuccess: function (data) {
            if (data) {
                setForm(__assign({ series: data.series || '', number: data.number || '', date: data.date || new Date().toISOString().split('T')[0], locationName: data.locationName || '', warehouseId: data.warehouseId || null }, data));
                setLines(data.lines || []);
                setTotals(data.totals || {});
                // Push to history for undo/redo
                store.pushHistory({ form: data, lines: data.lines || [], totals: data.totals || {} });
            }
        },
    });
    // Initialize defaults for new document
    (0, react_1.useEffect)(function () {
        if (isNew && !query.isLoading) {
            var defaults = {
                series: type.substring(0, 3).toUpperCase(),
                number: '',
                date: new Date().toISOString().split('T')[0],
                status: 'DRAFT',
            };
            setForm(defaults);
            setLines([]);
            setTotals({});
        }
    }, [isNew, type, query.isLoading]);
    // Auto-calculate totals
    (0, react_1.useEffect)(function () {
        var calculated = {};
        var subtotal = 0;
        var totalVat = 0;
        lines.forEach(function (line) {
            var lineTotal = (line.quantity || 0) * (line.unitPrice || 0);
            subtotal += lineTotal;
            totalVat += (lineTotal * (line.vatRate || 0)) / 100;
        });
        calculated.subtotal = subtotal;
        calculated.vatAmount = totalVat;
        calculated.total = subtotal + totalVat;
        // Add document-specific totals
        (0, tipizate_config_1.totalsFor)(type).forEach(function (field) {
            if (!calculated[field]) {
                calculated[field] = 0;
            }
        });
        setTotals(calculated);
        // Push to history for undo/redo (only if document exists)
        if (!isNew && id && Object.keys(calculated).length > 0) {
            store.pushHistory({ form: form, lines: lines, totals: calculated });
        }
    }, [lines, type, form, isNew, id, store]);
    // Save mutation
    var saveMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = __assign(__assign({}, form), { lines: lines, totals: totals, type: type });
                if (isNew) {
                    return [2 /*return*/, tipizateApi_1.tipizateApi.create(type, payload)];
                }
                else {
                    return [2 /*return*/, tipizateApi_1.tipizateApi.update(type, parseInt(id), payload)];
                }
                return [2 /*return*/];
            });
        }); },
        onSuccess: function (data) {
            // Update cache
            if (data && !isNew && id) {
                store.setDocCache(type, parseInt(id), data);
            }
            else if (data && isNew && data.id) {
                store.setDocCache(type, data.id, data);
                store.setLastOpened(type, data.id);
            }
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['tipizate', type] });
            store.reload(); // Trigger cross-tab sync
            if (isNew && (data === null || data === void 0 ? void 0 : data.id)) {
                navigate("/tipizate-enterprise/".concat(type.toLowerCase().replace('_', '-'), "/").concat(data.id));
            }
        },
    });
    // Sign mutation
    var signMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return tipizateApi_1.tipizateApi.sign(type, parseInt(id)); },
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tipizateApi_1.tipizateApi.get(type, parseInt(id))];
                    case 1:
                        updated = _a.sent();
                        if (updated && id) {
                            store.setDocCache(type, parseInt(id), updated);
                        }
                        queryClient.invalidateQueries({ queryKey: ['tipizate', type, id] });
                        store.reload();
                        return [2 /*return*/];
                }
            });
        }); },
    });
    // Lock mutation
    var lockMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return tipizateApi_1.tipizateApi.lock(type, parseInt(id)); },
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tipizateApi_1.tipizateApi.get(type, parseInt(id))];
                    case 1:
                        updated = _a.sent();
                        if (updated && id) {
                            store.setDocCache(type, parseInt(id), updated);
                        }
                        queryClient.invalidateQueries({ queryKey: ['tipizate', type, id] });
                        store.reload();
                        return [2 /*return*/];
                }
            });
        }); },
    });
    // PDF handler
    var loadPdf = function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, url, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!id || isNew)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, tipizateApi_1.tipizateApi.pdf(parseInt(id), type)];
                case 2:
                    blob = _a.sent();
                    url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    setPdfOpen(true);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading PDF:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSave = function () {
        saveMutation.mutate();
    };
    var handleSign = function () {
        if (!id || isNew)
            return;
        signMutation.mutate();
    };
    var handleLock = function () {
        if (!id || isNew)
            return;
        lockMutation.mutate();
    };
    var handlePdf = function () {
        loadPdf();
    };
    var reload = function () {
        queryClient.invalidateQueries({ queryKey: ['tipizate', type, id] });
    };
    return {
        isNew: isNew,
        loading: query.isLoading,
        saving: saveMutation.isPending,
        signing: signMutation.isPending,
        locking: lockMutation.isPending,
        name: (0, tipizate_config_1.nameFor)(type),
        schema: (0, tipizate_config_1.schemaFor)(type),
        headerFields: (0, tipizate_config_1.headerFor)(type),
        columns: (0, tipizate_config_1.columnsFor)(type),
        form: form,
        setForm: setForm,
        lines: lines,
        setLines: setLines,
        totals: totals,
        save: handleSave,
        update: handleSave,
        sign: handleSign,
        lock: handleLock,
        pdf: handlePdf,
        pdfUrl: pdfUrl,
        pdfOpen: pdfOpen,
        setPdfOpen: setPdfOpen,
        reload: reload,
        document: query.data,
    };
}
