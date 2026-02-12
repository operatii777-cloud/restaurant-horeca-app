"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FRONTEND PERFORMANCE UTILITIES
 * Utilitare pentru măsurarea performanței în frontend
 * Windows-style: clean, minimal, eficient
 */
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
exports.measurePerformance = measurePerformance;
exports.measurePerformanceAsync = measurePerformanceAsync;
exports.debounce = debounce;
exports.throttle = throttle;
exports.lazyLoad = lazyLoad;
/**
 * Măsoară timpul de execuție al unei funcții
 */
function measurePerformance(name, fn, log) {
    if (log === void 0) { log = false; }
    var start = performance.now();
    var result = fn();
    var duration = performance.now() - start;
    if (log || duration > 100) {
        console.log("'PERF' \"Name\": ".concat(duration.toFixed(2), "ms"));
    }
    return result;
}
/**
 * Măsoară timpul de execuție al unei funcții async
 */
function measurePerformanceAsync(name_1, fn_1) {
    return __awaiter(this, arguments, void 0, function (name, fn, log) {
        var start, result, duration;
        if (log === void 0) { log = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = performance.now();
                    return [4 /*yield*/, fn()];
                case 1:
                    result = _a.sent();
                    duration = performance.now() - start;
                    if (log || duration > 100) {
                        console.log("'PERF' \"Name\": ".concat(duration.toFixed(2), "ms"));
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Debounce function - Windows-style
 */
function debounce(func, wait) {
    var timeout = null;
    return function executedFunction() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var later = function () {
            timeout = null;
            func.apply(void 0, args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
/**
 * Throttle function - Windows-style
 */
function throttle(func, limit) {
    var inThrottle;
    return function executedFunction() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!inThrottle) {
            func.apply(void 0, args);
            inThrottle = true;
            setTimeout(function () { return (inThrottle = false); }, limit);
        }
    };
}
/**
 * Lazy load component
 */
function lazyLoad(importFn) {
    return importFn().then(function (module) { return module.default; });
}
