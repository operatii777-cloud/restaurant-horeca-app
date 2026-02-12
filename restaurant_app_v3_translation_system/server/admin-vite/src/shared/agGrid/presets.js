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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeGridOptions = exports.getRowSelectionOptions = exports.getDefaultGridOptions = exports.DEFAULT_COLUMN_DEF = void 0;
/**
 * DEFAULT_COLUMN_DEF - Minimal AG Grid configuration (Excel-like)
 * Microsoft Windows style: clean, minimal, edge-to-edge
 * Doar funcționalități esențiale - fără exagerări
 */
exports.DEFAULT_COLUMN_DEF = {
    sortable: true, // Sortare - esențial
    filter: true, // Filtrare - esențial
    resizable: true, // Redimensionare coloane - esențial
    minWidth: 100, // Lățime minimă
    flex: 1, // Distribuție uniformă
    // NU adăugăm floatingFilter - minimal
    // NU adăugăm menuTabs - minimal
    // NU adăugăm suppressMenu - lăsăm default
};
/**
 * getDefaultGridOptions - Minimal AG Grid configuration (Excel-like)
 * Microsoft Windows style: clean, minimal, edge-to-edge
 * Doar ce e necesar - fără să stricăm funcționalitatea existentă
 */
var getDefaultGridOptions = function () { return ({
    // Înălțimi - Excel-like (minimal) - MAI ÎNALTE pentru lizibilitate
    rowHeight: 36, // Excel default row height (mărit pentru lizibilitate)
    headerHeight: 48, // Header mai înalt pentru lizibilitate
    // Comportament de bază
    suppressScrollOnNewData: true,
    animateRows: false, // Minimal - fără animații (Excel nu are)
    // Paginare - minimal (doar dacă e necesar)
    // NU forțăm pagination aici - fiecare componentă decide
    // Funcționalități - minimal
    suppressCellFocus: false, // Permitem focus (Excel-like)
    // AG Grid v32.2+ - suppressRowClickSelection deprecated, use rowSelection.enableClickSelection
    // AG Grid v32.2+ - enableRangeSelection deprecated, use cellSelection
    suppressDragLeaveHidesColumns: true, // Comportament normal
    // NU adăugăm rowStyle aici - minimal
}); };
exports.getDefaultGridOptions = getDefaultGridOptions;
var SINGLE_ROW_SELECTION = {
    mode: 'singleRow',
    enableClickSelection: true, // ✅ Permite selecție la click
};
var MULTI_ROW_SELECTION = {
    mode: 'multiRow',
    enableClickSelection: true, // ✅ v32.2+ replacement for suppressRowClickSelection
};
var MULTI_ROW_SELECTION_NO_CLICK = {
    mode: 'multiRow',
    enableClickSelection: false, // ✅ v32.2+ replacement for suppressRowClickSelection=true
};
var getRowSelectionOptions = function (mode, enableClickSelection) {
    if (enableClickSelection === void 0) { enableClickSelection = true; }
    if (mode === 'single') {
        return SINGLE_ROW_SELECTION;
    }
    if (mode === 'multiple') {
        return enableClickSelection ? MULTI_ROW_SELECTION : MULTI_ROW_SELECTION_NO_CLICK;
    }
    return undefined;
};
exports.getRowSelectionOptions = getRowSelectionOptions;
var mergeGridOptions = function (overrides, base) {
    if (base === void 0) { base = (0, exports.getDefaultGridOptions)(); }
    return (__assign(__assign({}, base), overrides));
};
exports.mergeGridOptions = mergeGridOptions;
