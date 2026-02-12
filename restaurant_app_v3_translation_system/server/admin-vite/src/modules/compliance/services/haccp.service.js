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
exports.haccpService = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var axios_1 = require("axios");
// Create axios instance for HACCP API
var httpClient = axios_1.default.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});
// API Service Class
var HACCPService = /** @class */ (function () {
    function HACCPService() {
        this.baseUrl = '/api/compliance/haccp';
    }
    HACCPService.prototype.getAllProcesses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.get("".concat(this.baseUrl, "/processes"))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error fetching HACCP processes:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.getCCPsByProcess = function (processId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.get("".concat(this.baseUrl, "/processes/").concat(processId, "/ccps"))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error fetching CCPs:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.getLimitsByCCP = function (ccpId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.get("".concat(this.baseUrl, "/ccps/").concat(ccpId, "/limits"))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error fetching limits:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.recordMonitoring = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.post("".concat(this.baseUrl, "/monitoring"), data)];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error recording monitoring:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.getMonitoring = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var params, queryString, url, response, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        params = new URLSearchParams();
                        if (filters === null || filters === void 0 ? void 0 : filters.ccp_id)
                            params.append('ccp_id', filters.ccp_id.toString());
                        if (filters === null || filters === void 0 ? void 0 : filters.status)
                            params.append('status', filters.status);
                        if (filters === null || filters === void 0 ? void 0 : filters.date_from)
                            params.append('date_from', filters.date_from);
                        if (filters === null || filters === void 0 ? void 0 : filters.date_to)
                            params.append('date_to', filters.date_to);
                        if (filters === null || filters === void 0 ? void 0 : filters.limit)
                            params.append('limit', filters.limit.toString());
                        if (filters === null || filters === void 0 ? void 0 : filters.offset)
                            params.append('offset', filters.offset.toString());
                        queryString = params.toString();
                        url = queryString ? "".concat(this.baseUrl, "/monitoring?").concat(queryString) : "".concat(this.baseUrl, "/monitoring");
                        return [4 /*yield*/, httpClient.get(url)];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error fetching monitoring records:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.getDashboardKPIs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.get("".concat(this.baseUrl, "/dashboard/kpis"))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || {
                                monitoringsToday: 0,
                                criticalAlerts: 0,
                                pendingActions: 0,
                                complianceRate: 0
                            }];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error fetching dashboard KPIs:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.createCorrectiveAction = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.post("".concat(this.baseUrl, "/corrective-actions"), data)];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error creating corrective action:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.resolveCorrectiveAction = function (actionId, verificationNotes) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient.put("".concat(this.baseUrl, "/corrective-actions/").concat(actionId, "/resolve"), {
                                verification_notes: verificationNotes
                            })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Error resolving corrective action:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HACCPService.prototype.getAllCorrectiveActions = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var params, queryString, url, response, error_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        params = new URLSearchParams();
                        if ((filters === null || filters === void 0 ? void 0 : filters.resolved) !== undefined)
                            params.append('resolved', filters.resolved ? '1' : '0');
                        if (filters === null || filters === void 0 ? void 0 : filters.ccp_id)
                            params.append('ccp_id', filters.ccp_id.toString());
                        if (filters === null || filters === void 0 ? void 0 : filters.limit)
                            params.append('limit', filters.limit.toString());
                        if (filters === null || filters === void 0 ? void 0 : filters.offset)
                            params.append('offset', filters.offset.toString());
                        queryString = params.toString();
                        url = queryString ? "".concat(this.baseUrl, "/corrective-actions?").concat(queryString) : "".concat(this.baseUrl, "/corrective-actions");
                        return [4 /*yield*/, httpClient.get(url)];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error fetching corrective actions:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return HACCPService;
}());
exports.haccpService = new HACCPService();
