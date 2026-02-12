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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiInventoryPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var ag_grid_react_1 = require("ag-grid-react");
// AG Grid CSS imported globally with theme="legacy"
require("./MultiInventoryPage.css");
var MultiInventoryPage = function () {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _a = (0, react_1.useState)([]), sessions = _a[0], setSessions = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)({
        type: '',
        status: '',
        location: ''
    }), filters = _c[0], setFilters = _c[1];
    var _d = (0, react_1.useState)([]), locations = _d[0], setLocations = _d[1];
    var _e = (0, react_1.useState)(false), showNewModal = _e[0], setShowNewModal = _e[1];
    var _f = (0, react_1.useState)({
        session_type: 'daily',
        scope: 'global',
        location_ids: [],
        started_by: ''
    }), newSession = _f[0], setNewSession = _f[1];
    var loadSessions = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    params = new URLSearchParams();
                    if (filters.type)
                        params.append('type', filters.type);
                    if (filters.status)
                        params.append('status', filters.status);
                    return [4 /*yield*/, fetch("/api/inventory/sessions?".concat(params.toString()))];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load sessions');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setSessions(data.sessions || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading sessions:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filters.type, filters.status]);
    var loadLocations = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/locations')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load locations');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setLocations(data.locations || []);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error loading locations:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        loadSessions();
        loadLocations();
    }, [loadSessions, loadLocations]);
    var handleStartSession = function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    payload = {
                        session_type: newSession.session_type,
                        started_by: newSession.started_by,
                        location_ids: newSession.scope === 'global' ? null : newSession.location_ids
                    };
                    return [4 /*yield*/, fetch('/api/inventory/start', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to start session');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setShowNewModal(false);
                    setNewSession({ session_type: 'daily', scope: 'global', location_ids: [], started_by: '' });
                    // Redirect to the new session details
                    if (data.sessionId) {
                        navigate("/stocks/inventory/".concat(data.sessionId));
                    }
                    else {
                        loadSessions();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error starting session:', error_3);
                    alert('Eroare la crearea sesiunii de inventar');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var columnDefs = [
        { field: 'id', headerName: 'ID Sesiune', width: 100 },
        { field: 'session_type', headerName: 'Tip', width: 100, valueFormatter: function (params) { return params.value === 'daily' ? 'Zilnic' : 'Lunar'; } },
        { field: 'scope', headerName: 'Scope', width: 120, valueFormatter: function (params) { return params.value === 'global' ? 'Toate Gestiunile' : 'Specifice'; } },
        { field: 'started_at', headerName: 'Dată Început', width: 180, valueFormatter: function (params) { return new Date(params.value).toLocaleString('ro-RO'); } },
        {
            field: 'status', headerName: 'Status', width: 120, cellRenderer: function (params) {
                var status = params.value;
                var colors = {
                    'în progres': 'warning',
                    'completed': 'success',
                    'archived': 'secondary'
                };
                return <span className={"badge bg-".concat(colors[status] || 'secondary')}>{status}</span>;
            }
        },
        { field: 'item_count', headerName: 'Items', width: 100 },
        { field: 'difference_count', headerName: 'Diferență', width: 120 },
        {
            headerName: 'Acțiuni',
            width: 200,
            cellRenderer: function (params) {
                var session = params.data;
                return (<div className="d-flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={function () { return navigate("/stocks/inventory/".concat(session.id)); }}>Vizualizează</button>
            {session.status === 'în progres' && (<button className="btn btn-sm btn-success" onClick={function () { return navigate("/stocks/inventory/".concat(session.id)); }}>Finalizează</button>)}
          </div>);
            }
        }
    ];
    return (<div className="multi-inventory-page">
      <div className="page-header">
        <h1><i className="fas fa-warehouse me-2"></i>Inventar Multi-Gestiune</h1>
        <button className="btn btn-primary" onClick={function () { return setShowNewModal(true); }}>
          <i className="fas fa-plus me-1"></i>Sesiune Nouă</button>
      </div>

      <div className="filters-section">
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Tip:</label>
            <select className="form-select" value={filters.type} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { type: e.target.value })); }} title="Tip inventar">
              <option value="">Toate</option>
              <option value="daily">Zilnic</option>
              <option value="monthly">Lunar</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Status:</label>
            <select className="form-select" value={filters.status} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { status: e.target.value })); }} title="Status inventar">
              <option value="">Toate</option>
              <option value="în progres">În progres</option>
              <option value="completed">Completate</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Gestiune:</label>
            <select className="form-select" value={filters.location} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { location: e.target.value })); }} title="Selectează gestiunea">
              <option value="">Toate</option>
              {locations.map(function (loc) { return (<option key={loc.id} value={loc.id.toString()}>{loc.name}</option>); })}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-secondary w-100" onClick={loadSessions}>
              <i className="fas fa-sync me-1"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="ag-theme-alpine-dark multi-inventory-grid">
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={sessions} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true }} loading={loading}/>
      </div>

      {showNewModal && (<div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title"><i className="fas fa-warehouse me-2"></i>Sesiune Inventar Nouă</h5>
                <button type="button" className="btn-close btn-close-white" onClick={function () { return setShowNewModal(false); }} title="Închide"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tip Inventar:</label>
                  <select className="form-select" value={newSession.session_type} onChange={function (e) { return setNewSession(__assign(__assign({}, newSession), { session_type: e.target.value })); }} title="Tip Inventar">
                    <option value="daily">Inventar Zilnic</option>
                    <option value="monthly">Inventar Lunar</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Scope:</label>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="scope" id="scopeGlobal" value="global" checked={newSession.scope === 'global'} onChange={function (e) { return setNewSession(__assign(__assign({}, newSession), { scope: e.target.value, location_ids: [] })); }}/>
                    <label className="form-check-label" htmlFor="scopeGlobal">Toate Gestiunile</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="scope" id="scopeSpecific" value="specific" checked={newSession.scope === 'specific'} onChange={function (e) { return setNewSession(__assign(__assign({}, newSession), { scope: e.target.value })); }}/>
                    <label className="form-check-label" htmlFor="scopeSpecific">Gestiuni Specifice</label>
                  </div>
                </div>
                {newSession.scope === 'specific' && (<div className="mb-3">
                    <label className="form-label">Selectează Gestiuni</label>
                    {locations.map(function (loc) { return (<div key={loc.id} className="form-check">
                        <input className="form-check-input" type="checkbox" checked={newSession.location_ids.includes(loc.id)} onChange={function (e) {
                        if (e.target.checked) {
                            setNewSession(__assign(__assign({}, newSession), { location_ids: __spreadArray(__spreadArray([], newSession.location_ids, true), [loc.id], false) }));
                        }
                        else {
                            setNewSession(__assign(__assign({}, newSession), { location_ids: newSession.location_ids.filter(function (id) { return id !== loc.id; }) }));
                        }
                    }} title={loc.name}/>
                        <label className="form-check-label">{loc.name}</label>
                      </div>); })}
                  </div>)}
                <div className="mb-3">
                  <label className="form-label">Responsabil:</label>
                  <input type="text" className="form-control" value={newSession.started_by} onChange={function (e) { return setNewSession(__assign(__assign({}, newSession), { started_by: e.target.value })); }} placeholder="ex: Maria Ionescu" required/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={function () { return setShowNewModal(false); }}>Anulează</button>
                <button type="button" className="btn btn-success" onClick={handleStartSession}>Pornire Sesiune</button>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
};
exports.MultiInventoryPage = MultiInventoryPage;
