"use strict";
/**
 * createBaseStore - Helper pentru crearea store-urilor Zustand standardizate
 *
 * Asigură consistență între toate store-urile din aplicație:
 * - Type safety
 * - DevTools middleware (în development)
 * - Pattern consistent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseStore = createBaseStore;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
/**
 * Creează un store Zustand cu configurație standardizată
 *
 * @param storeCreator - Funcția care definește store-ul (StateCreator)
 * @param storeName - Numele store-ului (pentru DevTools)
 * @returns Store hook
 */
function createBaseStore(storeCreator, storeName) {
    // În development, adăugăm DevTools middleware
    if (process.env.NODE_ENV === 'development') {
        return (0, zustand_1.create)()((0, middleware_1.devtools)(storeCreator, { name: storeName }));
    }
    // În production, fără DevTools
    return (0, zustand_1.create)()(storeCreator);
}
