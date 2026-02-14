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
exports.TemperatureLogTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var TemperatureLogFormModal_1 = require("./TemperatureLogFormModal");
var TemperatureChart_1 = require("./TemperatureChart");
var httpClient_1 = require("@/shared/api/httpClient");
var AgGridTable_1 = require("@/shared/components/AgGridTable");
require("./TemperatureLogTab.css");
var TemperatureLogTab = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), showFormModal = _a[0], setShowFormModal = _a[1];
    var _b = (0, react_1.useState)(null), selectedEquipment = _b[0], setSelectedEquipment = _b[1];
    var _c = (0, react_1.useState)({ start: '', end: '' }), dateRange = _c[0], setDateRange = _c[1];
    var _d = (0, useApiQuery_1.useApiQuery)('/api/compliance/equipment'), equipmentData = _d.data, refetchEquipment = _d.refetch;
    var equipment = (equipmentData === null || equipmentData === void 0 ? void 0 : equipmentData.data) || [];
    // Construim URL-ul cu query params
    var temperatureLogUrl = (0, react_1.useMemo)(function () {
        var params = new URLSearchParams();
        if (selectedEquipment)
            params.append('equipment_id', selectedEquipment.toString());
        if (dateRange.start)
            params.append('start_date', dateRange.start);
        if (dateRange.end)
            params.append('end_date', dateRange.end);
        var queryString = params.toString();
        return queryString ? "/api/compliance/temperature-log?".concat(queryString) : '/api/compliance/temperature-log';
    }, [selectedEquipment, dateRange]);
    var _e = (0, useApiQuery_1.useApiQuery)(temperatureLogUrl), logsData = _e.data, loading = _e.loading, refetch = _e.refetch;
    var logs = (logsData === null || logsData === void 0 ? void 0 : logsData.data) || [];
    var columnDefs = [
        {
            field: 'created_at', headerName: 'Data/Ora', width: 180, valueFormatter: function (params) {
                if (!params.value)
                    return '-';
                return new Date(params.value).toLocaleString('ro-RO');
            }
        },
        { field: 'equipment_name', headerName: 'Echipament', width: 200 },
        {
            field: 'temperature', headerName: 'Temperatură (°C)', width: 150, cellRenderer: function (params) {
                var temp = params.value;
                var status = params.data.status;
                var color = status === 'ok' ? 'green' : status === 'warning' ? 'orange' : 'red';
                return <span style={{ color: color, fontWeight: 'bold' }}>{temp}°C</span>;
            }
        },
        {
            field: 'status', headerName: 'Status', width: 120, cellRenderer: function (params) {
                var status = params.value;
                if (status === 'ok')
                    return <span className="text-success"><i className="fas fa-check-circle"></i> OK</span>;
                if (status === 'warning')
                    return <span className="text-warning"><i className="fas fa-exclamation-triangle"></i> Warning</span>;
                if (status === 'critical')
                    return <span className="text-danger"><i className="fas fa-times-circle"></i> Critical</span>;
                return <span>{status}</span>;
            }
        },
        { field: 'operator_name', headerName: 'Operator', width: 150 },
        { field: 'notes', headerName: 'Note', width: 200, flex: 1 },
    ];
    var filteredLogs = (0, react_1.useMemo)(function () {
        return logs;
    }, [logs]);
    var handleAddLog = function () {
        setShowFormModal(true);
    };
    var handleSaveLog = function (formData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/compliance/temperature-log', formData)];
                case 1:
                    _a.sent();
                    setShowFormModal(false);
                    refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Eroare la salvarea înregistrării temperaturi:', error_1);
                    alert('Eroare la salvarea înregistrării');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="temperature-log-tab">
      <div className="tab-toolbar">
        <div className="filters">
          <select className="form-control form-select" value={selectedEquipment || ''} onChange={function (e) { return setSelectedEquipment(e.target.value ? parseInt(e.target.value) : null); }} title="selecteaza echipamentul" aria-label="selecteaza echipamentul">
            <option value="">Toate echipamentele</option>
            {equipment.map(function (eq) { return (<option key={eq.id} value={eq.id}>{eq.name} ({eq.type})</option>); })}
          </select>

          <input type="date" className="form-control" value={dateRange.start} onChange={function (e) { return setDateRange(function (prev) { return (__assign(__assign({}, prev), { start: e.target.value })); }); }} placeholder="De la" title="data de inceput" aria-label="data de inceput"/>

          <input type="date" className="form-control" value={dateRange.end} onChange={function (e) { return setDateRange(function (prev) { return (__assign(__assign({}, prev), { end: e.target.value })); }); }} placeholder="Până la" title="data de sfarsit" aria-label="data de sfarsit"/>
        </div>

        <button className="btn btn-primary" onClick={handleAddLog}>
          <i className="fas fa-plus me-2"></i>Adaugă Temperatură</button>
      </div>

      {/* Grafic Temperaturi */}
      {selectedEquipment && filteredLogs.length > 0 && (<div className="chart-section">
          <TemperatureChart_1.TemperatureChart logs={filteredLogs} equipmentId={selectedEquipment}/>
        </div>)}

      {/* Tabelă AG Grid - Standardizat */}
      <div className="ag-grid-container">
        <AgGridTable_1.AgGridTable columnDefs={columnDefs} rowData={filteredLogs} loading={loading} height={500} gridOptions={{
            suppressCellFocus: true,
        }}/>
      </div>

      {showFormModal && (<TemperatureLogFormModal_1.TemperatureLogFormModal equipment={equipment} onSave={handleSaveLog} onClose={function () { return setShowFormModal(false); }}/>)}
    </div>);
};
exports.TemperatureLogTab = TemperatureLogTab;
