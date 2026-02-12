"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AG Grid Global Configuration - MINIMAL EXCEL-LIKE
 * Microsoft Windows style: clean, minimal, edge-to-edge
 * Doar funcționalități esențiale - fără să stricăm ce avem
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeGridOptions = exports.agGridDefaultGridOptions = exports.agGridDefaultColDef = void 0;
exports.agGridDefaultColDef = {
    sortable: true, // Sortare - esențial
    filter: true, // Filtrare - esențial
    resizable: true, // Redimensionare - esențial
    minWidth: 100, // Lățime minimă
    flex: 1, // Distribuție uniformă
    // NU adăugăm floatingFilter - minimal
    // NU adăugăm menuTabs - minimal
    // NU adăugăm suppressMenu - lăsăm default
};
exports.agGridDefaultGridOptions = {
    // Theme - Alpine (clean, minimal)
    theme: 'legacy', // Use legacy theme to avoid conflict with CSS files
    // Înălțimi - Excel-like (minimal)
    rowHeight: 32, // Excel default
    headerHeight: 48, // Header mai înalt pentru lizibilitate
    // Default column definition
    defaultColDef: exports.agGridDefaultColDef,
    // Overlays - minimal
    overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">Nu există date</span>',
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Se încarcă...</span>',
    // Funcționalități - MINIMAL (doar ce e necesar)
    animateRows: false, // NU - minimal (Excel nu are animații)
    cellSelection: false, // NU - minimal
    rowSelection: {
        mode: 'singleRow',
        enableClickSelection: true
    }, // Default - single selection with click enabled
    suppressCellFocus: false, // Permitem focus (Excel-like)
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    // Paginare - NU forțăm aici (fiecare componentă decide)
    // pagination: false - minimal (doar dacă e necesar)
    // Locale - Romanian (minimal)
    localeText: {
        noRowsToShow: 'Nu există date de afișat',
        loadingOoo: 'Se încarcă...',
    },
};
/**
 * Merge local grid options with defaults
 */
var mergeGridOptions = function (localOptions) {
    //   const { t } = useTranslation();
    return __assign(__assign(__assign({}, exports.agGridDefaultGridOptions), localOptions), { defaultColDef: __assign(__assign({}, exports.agGridDefaultColDef), ((localOptions === null || localOptions === void 0 ? void 0 : localOptions.defaultColDef) || {})) });
};
exports.mergeGridOptions = mergeGridOptions;
