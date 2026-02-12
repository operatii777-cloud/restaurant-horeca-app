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
exports.EquipmentTab = void 0;
// ﻿import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var httpClient_1 = require("@/shared/api/httpClient");
var EquipmentFormModal_1 = require("./EquipmentFormModal");
/* COMMENTED OUT TO FIX THEMING API WARNING */
/* import 'ag-grid-community/styles/ag-grid.css'; */
/* import 'ag-grid-community/styles/ag-theme-alpine.css'; */
require("./EquipmentTab.css");
var EquipmentTab = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), showFormModal = _a[0], setShowFormModal = _a[1];
    var _b = (0, react_1.useState)(null), selectedEquipment = _b[0], setSelectedEquipment = _b[1];
    var _c = (0, useApiQuery_1.useApiQuery)('/api/compliance/equipment'), equipment = _c.data, loading = _c.loading, refetch = _c.refetch;
    var typeLabels = {
        fridge: 'Frigider',
        freezer: 'Congelator',
        hot_holding: 'Menținere Caldă',
        receiving: 'Recepție',
        other: 'Altele',
    };
    var columnDefs = [
        { field: 'name', headerName: 'Nume', width: 250, flex: 1 },
        {
            field: 'type',
            headerName: 'Tip',
            width: 180,
            valueFormatter: function (params) { return typeLabels[params.value] || params.value; },
        },
        { field: 'location', headerName: 'Locație', width: 200, valueFormatter: function (params) { return params.value || '-'; } },
        {
            field: 'min_temp',
            headerName: 'Temp. Min (Â°C)',
            width: 150,
            valueFormatter: function (params) { return params.value !== null ? "".concat(params.value, "\u00C2\u00B0C") : '-'; },
        },
        {
            field: 'max_temp',
            headerName: 'Temp. Max (Â°C)',
            width: 150,
            valueFormatter: function (params) { return params.value !== null ? "".concat(params.value, "\u00C2\u00B0C") : '-'; },
        },
        {
            field: 'temp_range',
            headerName: 'Interval',
            width: 180,
            valueGetter: function (params) {
                var min = params.data.min_temp;
                var max = params.data.max_temp;
                if (min !== null && max !== null) {
                    return "\"Min\"\u00C2\u00B0C - \"Max\"\u00C2\u00B0C";
                }
                return '-';
            },
        },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 120,
            cellRenderer: function (params) {
                var isActive = params.value;
                return isActive
                    ? '<span class="badge bg-success">Activ</span>'
                    : '<span class="badge bg-secondary">Inactiv</span>';
            },
        },
        {
            field: 'created_at',
            headerName: 'Data Creării',
            width: 180,
            valueFormatter: function (params) {
                if (!params.value)
                    return '-';
                return new Date(params.value).toLocaleDateString('ro-RO');
            },
        },
        {
            field: 'actions',
            headerName: 'Acțiuni',
            width: 150,
            pinned: 'right',
            cellRenderer: function (params) {
                var eq = params.data;
                var editBtn = "<button class=\"btn btn-sm btn-outline-primary me-1 action-btn-edit\" data-id=\"".concat(eq.id, "\" title=\"Editeaz\u0103\"><i class=\"fas fa-edit\"></i></button>");
                var deleteBtn = eq.is_active
                    ? "<button class=\"btn btn-sm btn-outline-danger action-btn-delete\" data-id=\"".concat(eq.id, "\" title=\"Dezactiveaz\u0103\"><i class=\"fas fa-trash\"></i></button>")
                    : '';
                return "<div class=\"action-buttons\">".concat(editBtn).concat(deleteBtn, "</div>");
            },
            sortable: false,
            filter: false,
        },
    ];
    var handleAddEquipment = function () {
        setSelectedEquipment(null);
        setShowFormModal(true);
    };
    var handleEditEquipment = function (equipment) {
        setSelectedEquipment(equipment);
        setShowFormModal(true);
    };
    var handleDeleteEquipment = function (equipment) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("E\u0219ti sigur c\u0103 vrei s\u0103 dezactivezi echipamentul \"".concat(equipment.name, "\"?"))) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/compliance/equipment/".concat(equipment.id), __assign(__assign({}, equipment), { is_active: false }))];
                case 2:
                    _a.sent();
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Eroare la dezactivarea echipamentului:', error_1);
                    alert('Eroare la dezactivarea echipamentului');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveEquipment = function (formData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    if (!formData.id) return [3 /*break*/, 2];
                    // Edit mode
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/compliance/equipment/".concat(formData.id), formData)];
                case 1:
                    // Edit mode
                    _c.sent();
                    return [3 /*break*/, 4];
                case 2: 
                // Add mode
                return [4 /*yield*/, httpClient_1.httpClient.post('/api/compliance/equipment', formData)];
                case 3:
                    // Add mode
                    _c.sent();
                    _c.label = 4;
                case 4:
                    setShowFormModal(false);
                    setSelectedEquipment(null);
                    refetch();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _c.sent();
                    console.error('Eroare la salvarea echipamentului:', error_2);
                    alert(((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la salvarea echipamentului');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleRowDoubleClick = function (event) {
        handleEditEquipment(event.data);
    };
    return (<div className="equipment-tab">
      <div className="tab-toolbar">
        <div className="toolbar-info">
          <p className="text-muted mb-0">
            <i className="fas fa-info-circle me-2"></i>
            Gestionează echipamentele pentru monitorizarea temperaturilor. 
            Adaugă echipamente noi sau editează cele existente.
          </p>
        </div>
        
        <button className="btn btn-primary" onClick={handleAddEquipment}>
          <i className="fas fa-plus me-2"></i>"adauga echipament"</button>
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine-dark">
          <ag_grid_react_1.AgGridReact theme="legacy" rowData={(equipment === null || equipment === void 0 ? void 0 : equipment.data) || []} columnDefs={columnDefs} pagination={true} paginationPageSize={20} suppressCellFocus={true} onRowDoubleClicked={handleRowDoubleClick} onCellClicked={function (params) {
            var _a;
            if (params.colDef.field === 'actions') {
                var target = (_a = params.event) === null || _a === void 0 ? void 0 : _a.target;
                if (target === null || target === void 0 ? void 0 : target.closest('.action-btn-edit')) {
                    handleEditEquipment(params.data);
                }
                else if (target === null || target === void 0 ? void 0 : target.closest('.action-btn-delete')) {
                    handleDeleteEquipment(params.data);
                }
            }
        }} defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
        }}/>
        </div>
      </div>

      {showFormModal && (<EquipmentFormModal_1.EquipmentFormModal equipment={selectedEquipment} onSave={handleSaveEquipment} onClose={function () {
                setShowFormModal(false);
                setSelectedEquipment(null);
            }}/>)}
    </div>);
};
exports.EquipmentTab = EquipmentTab;
