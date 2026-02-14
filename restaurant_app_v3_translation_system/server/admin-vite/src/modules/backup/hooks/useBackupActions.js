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
exports.useBackupActions = void 0;
// ﻿import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var getErrorMessage = function (error) {
    if (error && typeof error === 'object' && 'response' in error) {
        var response = error.response;
        if ((response === null || response === void 0 ? void 0 : response.data) && typeof response.data === 'object' && 'error' in response.data) {
            return String(response.data.error);
        }
        if (response === null || response === void 0 ? void 0 : response.statusText) {
            return response.statusText;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'A apărut o eroare neașteptată';
};
var useBackupActions = function (_a) {
    var onBackupsRefresh = _a.onBackupsRefresh, onArchiveRefresh = _a.onArchiveRefresh;
    var _b = (0, react_1.useState)(null), alert = _b[0], setAlert = _b[1];
    var _c = (0, react_1.useState)(false), creatingBackup = _c[0], setCreatingBackup = _c[1];
    var _d = (0, react_1.useState)(false), restoringBackup = _d[0], setRestoringBackup = _d[1];
    var _e = (0, react_1.useState)(false), deletingBackup = _e[0], setDeletingBackup = _e[1];
    var _f = (0, react_1.useState)(false), downloadingBackup = _f[0], setDownloadingBackup = _f[1];
    var _g = (0, react_1.useState)(false), archivingOrders = _g[0], setArchivingOrders = _g[1];
    var _h = (0, react_1.useState)(false), exportingArchive = _h[0], setExportingArchive = _h[1];
    var _j = (0, react_1.useState)(false), deletingArchiveRange = _j[0], setDeletingArchiveRange = _j[1];
    var showAlert = (0, react_1.useCallback)(function (message, type) {
        if (type === void 0) { type = 'info'; }
        setAlert({ message: message, type: type });
    }, []);
    var clearAlert = (0, react_1.useCallback)(function () { return setAlert(null); }, []);
    var createBackup = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setCreatingBackup(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/backup-database')];
                case 2:
                    _a.sent();
                    showAlert('Backup creat cu succes.', 'success');
                    return [4 /*yield*/, onBackupsRefresh()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    showAlert(getErrorMessage(error_1), 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setCreatingBackup(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, onBackupsRefresh, showAlert]);
    var restoreBackup = (0, react_1.useCallback)(function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setRestoringBackup(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/restore-database', { backupFileName: fileName })];
                case 2:
                    _a.sent();
                    showAlert('Restaurare finalizată. Verifică aplicația și rulează testele de integritate.', 'success');
                    return [4 /*yield*/, Promise.all([onBackupsRefresh(), onArchiveRefresh()])];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    showAlert(getErrorMessage(error_2), 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setRestoringBackup(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, onArchiveRefresh, onBackupsRefresh, showAlert]);
    var deleteBackup = (0, react_1.useCallback)(function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setDeletingBackup(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/backups/".concat(encodeURIComponent(fileName)))];
                case 2:
                    _a.sent();
                    showAlert('Backup șters.', 'success');
                    return [4 /*yield*/, onBackupsRefresh()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    showAlert(getErrorMessage(error_3), 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setDeletingBackup(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, onBackupsRefresh, showAlert]);
    var downloadBackup = (0, react_1.useCallback)(function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
        var response, blob, url, link, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setDownloadingBackup(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/admin/backups/download/".concat(encodeURIComponent(fileName)), {
                            responseType: 'arraybuffer',
                        })];
                case 2:
                    response = _a.sent();
                    blob = new Blob([response.data], { type: 'application/octet-stream' });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElemen[a];
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    showAlert('Descărcare inițiată.', 'info');
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    showAlert(getErrorMessage(error_4), 'error');
                    return [3 /*break*/, 5];
                case 4:
                    setDownloadingBackup(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, showAlert]);
    var archiveOrders = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setArchivingOrders(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/archive-orders')];
                case 2:
                    _a.sent();
                    showAlert('Procesul de arhivare a fost pornit.', 'success');
                    return [4 /*yield*/, onArchiveRefresh()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_5 = _a.sent();
                    showAlert(getErrorMessage(error_5), 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setArchivingOrders(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, onArchiveRefresh, showAlert]);
    var exportArchive = (0, react_1.useCallback)(function (range) { return __awaiter(void 0, void 0, void 0, function () {
        var response, fileName, blob, url, link, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setExportingArchive(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/export-archived', {
                            params: range,
                            responseType: 'arraybuffer',
                        })];
                case 2:
                    response = _a.sent();
                    fileName = "comenzi_arhivate_".concat(range.startDate.slice(0, 10), "_").concat(range.endDate.slice(0, 10), ".csv");
                    blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElemen[a];
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    showAlert('Exportul arhivei a fost generat.', 'success');
                    return [3 /*break*/, 5];
                case 3:
                    error_6 = _a.sent();
                    showAlert(getErrorMessage(error_6), 'error');
                    return [3 /*break*/, 5];
                case 4:
                    setExportingArchive(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, showAlert]);
    var deleteArchiveRange = (0, react_1.useCallback)(function (range) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearAlert();
                    setDeletingArchiveRange(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete('/api/admin/delete-archived', {
                            data: range,
                        })];
                case 2:
                    _a.sent();
                    showAlert('Comenzile arhivate din interval au fost șterse.', 'success');
                    return [4 /*yield*/, onArchiveRefresh()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_7 = _a.sent();
                    showAlert(getErrorMessage(error_7), 'error');
                    return [3 /*break*/, 6];
                case 5:
                    setDeletingArchiveRange(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [clearAlert, onArchiveRefresh, showAlert]);
    return {
        alert: alert,
        showAlert: showAlert,
        clearAlert: clearAlert,
        creatingBackup: creatingBackup,
        restoringBackup: restoringBackup,
        deletingBackup: deletingBackup,
        downloadingBackup: downloadingBackup,
        archivingOrders: archivingOrders,
        exportingArchive: exportingArchive,
        deletingArchiveRange: deletingArchiveRange,
        createBackup: createBackup,
        restoreBackup: restoreBackup,
        deleteBackup: deleteBackup,
        downloadBackup: downloadBackup,
        archiveOrders: archiveOrders,
        exportArchive: exportArchive,
        deleteArchiveRange: deleteArchiveRange,
    };
};
exports.useBackupActions = useBackupActions;
