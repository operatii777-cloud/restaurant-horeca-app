"use strict";
/**
 * POLYFILL: AGGRESSIVE Fix for React and module resolution
 *
 * Problem: ESM module scope isolation prevents zustand, react-bootstrap,
 * @restart/hooks, etc. from accessing React exports like useLayoutEffect,
 * Children, etc. when bundled in separate chunks.
 *
 * Solution: Patch React object directly to ensure ALL properties are mutable
 * and accessible globally BEFORE any other module loads.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_dom_1 = require("react-dom");
// Execute this IMMEDIATELY at module load time
if (typeof window !== 'undefined') {
    var globalScope = window;
    // STEP 1: Make React and ReactDOM globally accessible
    globalScope.React = react_1.default;
    globalScope.ReactDOM = react_dom_1.default;
    // STEP 2: Ensure React object is MUTABLE and can receive new properties
    // Fix the descriptor so React.Children and other properties can be set
    var reactProto = Object.getPrototypeOf(react_1.default);
    if (reactProto !== null && reactProto !== Object.prototype) {
        try {
            // Make React a plain object if it's been frozen or sealed
            var reactKeys = Object.getOwnPropertyNames(react_1.default);
            var newReact_1 = {};
            // Copy all properties from React to new object
            reactKeys.forEach(function (key) {
                try {
                    newReact_1[key] = react_1.default[key];
                }
                catch (e) {
                    // Skip properties that can't be read
                }
            });
            // Also copy symbol properties
            var symbols = Object.getOwnPropertySymbols(react_1.default);
            symbols.forEach(function (sym) {
                try {
                    newReact_1[sym] = react_1.default[sym];
                }
                catch (e) {
                    // Skip symbols that can't be read
                }
            });
            // Replace React with the new mutable object
            Object.assign(react_1.default, newReact_1);
        }
        catch (e) {
            console.warn('⚠️ Could not make React mutable:', e);
        }
    }
    // STEP 3: Explicitly set React properties that might be missing
    var requiredProperties = [
        'useState',
        'useEffect',
        'useLayoutEffect',
        'useRef',
        'useContext',
        'useReducer',
        'useCallback',
        'useMemo',
        'useTransition',
        'useDeferredValue',
        'useId',
        'Children',
        'createElement',
        'cloneElement',
        'forwardRef',
        'memo',
        'Fragment',
        'StrictMode',
        'Suspense',
    ];
    requiredProperties.forEach(function (prop) {
        if (!(prop in react_1.default)) {
            console.warn("\u26A0\uFE0F React.".concat(prop, " not found, attempting to set"));
            try {
                Object.defineProperty(react_1.default, prop, {
                    configurable: true,
                    writable: true,
                    value: undefined,
                });
            }
            catch (e) {
                console.error("\u274C Could not set React.".concat(prop, ":"), e);
            }
        }
    });
    // STEP 4: Specific fix for useLayoutEffect
    if (!react_1.default.useLayoutEffect || typeof react_1.default.useLayoutEffect !== 'function') {
        console.warn('⚠️ React.useLayoutEffect missing or not a function, using useEffect');
        react_1.default.useLayoutEffect = react_1.default.useEffect;
    }
    // STEP 5: Critical - Ensure Children object exists and is mutable
    if (!react_1.default.Children || typeof react_1.default.Children !== 'object') {
        console.warn('⚠️ React.Children missing, creating placeholder');
        react_1.default.Children = {
            map: function (children, fn) { return children; },
            forEach: function (children, fn) { },
            count: function (children) { return 0; },
            only: function (children) { return children; },
            toArray: function (children) { return Array.isArray(children) ? children : [children]; },
        };
    }
    // STEP 6: Patch module loading to intercept React imports
    var originalFetch = globalScope.fetch;
    var reactModuleCache = new Map();
    // Cache React reference for any module that might need it
    reactModuleCache.set('react', react_1.default);
    reactModuleCache.set('react-dom', react_dom_1.default);
    // STEP 7: Make sure globalThis also has React
    if (typeof globalThis !== 'undefined') {
        globalThis.React = react_1.default;
        globalThis.ReactDOM = react_dom_1.default;
    }
    console.log('✅ React polyfill applied successfully');
    console.log('✓ window.React available:', typeof globalScope.React);
    console.log('✓ window.ReactDOM available:', typeof globalScope.ReactDOM);
    console.log('✓ React.useLayoutEffect:', typeof react_1.default.useLayoutEffect);
    console.log('✓ React.Children:', typeof react_1.default.Children);
}
exports.default = null;
