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
exports.useBackupProgress = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var parsePayload = function (raw) {
    var _a;
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    var payload = raw;
    var jobId = typeof payload.jobId === 'string' ? payload.jobId : null;
    var status = typeof payload.status === 'string' && ["Pending:", 'running', 'success', 'error'].includes(payload.status)
        ? payload.status
        : null;
    if (!jobId || !status) {
        return null;
    }
    var normalizeNumber = function (value) {
        if (value == null)
            return null;
        var numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    };
    var normalizeString = function (value) { return (typeof value === 'string' ? value : null); };
    return {
        jobId: jobId,
        status: status,
        percent: normalizeNumber(payload.percent),
        step: normalizeString(payload.step),
        stepLabel: normalizeString(payload.stepLabel),
        message: normalizeString(payload.message),
        startedAt: normalizeString(payload.startedAt),
        finishedAt: normalizeString(payload.finishedAt),
        estimatedSecondsRemaining: normalizeNumber(payload.estimatedSecondsRemaining),
        updatedAt: (_a = normalizeString(payload.updatedAt)) !== null && _a !== void 0 ? _a : new Date().toISOString(),
    };
};
var useBackupProgress = function (jobId, options) {
    if (options === void 0) { options = {}; }
    var _a = options.enabled, enabled = _a === void 0 ? true : _a, _b = options.pollIntervalMs, pollIntervalMs = _b === void 0 ? 2000 : _b;
    var _c = (0, react_1.useState)(null), progress = _c[0], setProgress = _c[1];
    var _d = (0, react_1.useState)(null), source = _d[0], setSource = _d[1];
    var _e = (0, react_1.useState)(null), lastError = _e[0], setLastError = _e[1];
    var eventSourceRef = (0, react_1.useRef)(null);
    var pollTimerRef = (0, react_1.useRef)(null);
    var restartTokenRef = (0, react_1.useRef)(0);
    var cleanupConnections = (0, react_1.useCallback)(function () {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (pollTimerRef.current) {
            window.clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    }, []);
    var handleUpdate = (0, react_1.useCallback)(function (payload, origin) {
        var parsed = parsePayload(payload);
        if (!parsed) {
            return;
        }
        setProgress(parsed);
        setSource(origin);
        setLastError(null);
    }, []);
    var startPolling = (0, react_1.useCallback)(function (activeJobId) {
        cleanupConnections();
        var poll = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, httpClient_1.httpClient.get("/api/admin/backup-progress/".concat(encodeURIComponent(activeJobId)), {
                                params: { format: 'json' },
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        handleUpdate(data, 'poll');
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        setLastError(error_1 instanceof Error ? error_1.message : 'Eroare la actualizarea progresului.');
                        return [3 /*break*/, 4];
                    case 3:
                        pollTimerRef.current = window.setTimeout(poll, pollIntervalMs);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        pollTimerRef.current = window.setTimeout(poll, 0);
    }, [cleanupConnections, handleUpdate, pollIntervalMs]);
    var startSse = (0, react_1.useCallback)(function (activeJobId) {
        cleanupConnections();
        try {
            var es_1 = new EventSource("/api/admin/backup-progress/".concat(encodeURIComponent(activeJobId)));
            eventSourceRef.current = es_1;
            es_1.onmessage = function (event) {
                try {
                    var payload = JSON.parse(event.data);
                    handleUpdate(payload, 'sse');
                }
                catch (_a) {
                    // dacă payload-ul nu este JSON valid, îl ignorăm
                }
            };
            es_1.onerror = function () {
                es_1.close();
                eventSourceRef.current = null;
                startPolling(activeJobId);
            };
        }
        catch (error) {
            setLastError(error instanceof Error ? error.message : 'Nu se poate iniția conexiunea SSE.');
            startPolling(activeJobId);
        }
    }, [cleanupConnections, handleUpdate, startPolling]);
    (0, react_1.useEffect)(function () {
        if (!jobId || !enabled) {
            cleanupConnections();
            setProgress(null);
            setSource(null);
            return;
        }
        var token = restartTokenRef.current;
        setProgress(null);
        setSource(null);
        setLastError(null);
        startSse(jobId);
        return function () {
            // dacă token-ul s-a schimbat, conexiunea a fost restartată manual
            if (token === restartTokenRef.current) {
                cleanupConnections();
            }
        };
    }, [cleanupConnections, enabled, jobId, startSse]);
    var restart = (0, react_1.useCallback)(function () {
        if (!jobId) {
            return;
        }
        restartTokenRef.current += 1;
        cleanupConnections();
        setProgress(null);
        setSource(null);
        setLastError(null);
        startSse(jobId);
    }, [cleanupConnections, jobId, startSse]);
    var result = (0, react_1.useMemo)(function () { return ({
        progress: progress,
        source: source,
        lastError: lastError,
        restart: restart,
    }); }, [lastError, progress, restart, source]);
    return result;
};
exports.useBackupProgress = useBackupProgress;
