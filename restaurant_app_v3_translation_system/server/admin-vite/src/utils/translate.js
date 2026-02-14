"use strict";
/**
 * Sistem simplu de traduceri
 * Auto-generat de fix-i18n-complete.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = exports.t = void 0;
exports.translate = translate;
var ro_json_1 = require("../i18n/ro.json");
exports.translations = ro_json_1.default;
/**
 * Traduce o cheie
 * @param key - Cheia de traducere
 * @param fallback - Text implicit dacă cheia nu există
 * @returns Traducerea sau fallback
 */
function translate(key, fallback) {
    return ro_json_1.default[key] || fallback || key;
}
// Alias scurt
exports.t = translate;
