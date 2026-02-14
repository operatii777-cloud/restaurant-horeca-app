"use strict";
/**
 * FAZA 1 - ANAF API Client
 *
 * API functions for ANAF certificate management, health dashboard, and token management
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
exports.fetchAnafHealth = fetchAnafHealth;
exports.fetchAnafSubmissions = fetchAnafSubmissions;
exports.fetchCertificateStatus = fetchCertificateStatus;
exports.uploadCertificate = uploadCertificate;
exports.deleteCertificate = deleteCertificate;
exports.refreshAnafToken = refreshAnafToken;
exports.getAnafErrorMessage = getAnafErrorMessage;
var API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
/**
 * Get ANAF Health Dashboard data
 */
function fetchAnafHealth() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/health"), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch ANAF health: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Get ANAF submissions with filters
 */
function fetchAnafSubmissions(params) {
    return __awaiter(this, void 0, void 0, function () {
        var queryParams, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryParams = new URLSearchParams();
                    if (params.documentType)
                        queryParams.append('documentType', params.documentType);
                    if (params.status)
                        queryParams.append('status', params.status);
                    if (params.startDate)
                        queryParams.append('startDate', params.startDate);
                    if (params.endDate)
                        queryParams.append('endDate', params.endDate);
                    if (params.limit)
                        queryParams.append('limit', params.limit.toString());
                    if (params.offset)
                        queryParams.append('offset', params.offset.toString());
                    return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/submissions?").concat(queryParams), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch submissions: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Get certificate status
 */
function fetchCertificateStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/certificate/status"), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch certificate status: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Upload certificate
 */
function uploadCertificate(file, password) {
    return __awaiter(this, void 0, void 0, function () {
        var formData, response, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formData = new FormData();
                    formData.append('certificate', file);
                    formData.append('password', password);
                    return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/certificate/upload"), {
                            method: 'POST',
                            body: formData,
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json().catch(function () { return ({ error: response.statusText }); })];
                case 2:
                    error = _a.sent();
                    throw new Error(error.error || "Failed to upload certificate: ".concat(response.statusText));
                case 3: return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Delete certificate
 */
function deleteCertificate() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/certificate"), {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to delete certificate: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Refresh ANAF token
 */
function refreshAnafToken() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/anaf/token/refresh"), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json().catch(function () { return ({ error: response.statusText }); })];
                case 2:
                    error = _a.sent();
                    throw new Error(error.error || "Failed to refresh token: ".concat(response.statusText));
                case 3: return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Map ANAF error codes to user-friendly messages
 */
function getAnafErrorMessage(errorCode) {
    var errorMap = {
        '702': 'Certificat invalid sau expirat. Verifică certificatul și data expirării.',
        '703': 'Token expirat – reînnoire necesară. Tokenul va fi reînnoit automat.',
        '500': 'ANAF indisponibil – încercați mai târziu. Serviciul ANAF este temporar indisponibil.',
        '400': 'Document invalid – verificați datele fiscale. Datele documentului nu sunt valide.',
        '408': 'Timeout – document în coadă. Documentul va fi trimis automat când serverul ANAF răspunde.',
    };
    var code = errorCode.toString();
    return errorMap[code] || "Eroare ANAF: ".concat(errorCode);
}
