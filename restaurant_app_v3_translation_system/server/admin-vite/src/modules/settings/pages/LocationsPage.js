"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.5 - Locations Management Page
 *
 * CRUD interface for managing restaurant locations.
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
exports.LocationsPage = void 0;
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var locationStore_1 = require("@/shared/store/locationStore");
var HelpButton_1 = require("@/shared/components/HelpButton");
var LocationsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, locationStore_1.useLocationStore)(), loadLocations = _a.loadLocations, availableLocations = _a.availableLocations;
    var _b = (0, react_1.useState)([]), locations = _b[0], setLocations = _b[1];
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingLocation = _e[0], setEditingLocation = _e[1];
    var _f = (0, react_1.useState)({
        name: '',
        type: 'operational',
        description: '',
        can_receive_deliveries: false,
        can_transfer_out: true,
        can_transfer_in: true,
        can_consume: false,
        manager_name: '',
    }), formData = _f[0], setFormData = _f[1];
    (0, react_1.useEffect)(function () {
        fetchLocations();
    }, []);
    var fetchLocations = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/settings/locations')];
                case 1:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setLocations(response.data.locations || []);
                        // Update store
                        if (response.data.locations) {
                            locationStore_1.useLocationStore.getState().setAvailableLocations(response.data.locations);
                        }
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error fetching locations:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCreate = function () {
        setEditingLocation(null);
        setFormData({
            name: '',
            type: 'operational',
            description: '',
            can_receive_deliveries: false,
            can_transfer_out: true,
            can_transfer_in: true,
            can_consume: false,
            manager_name: '',
        });
        setShowModal(true);
    };
    var handleEdit = function (location) {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            type: location.type,
            description: location.description || '',
            can_receive_deliveries: !!location.can_receive_deliveries,
            can_transfer_out: !!location.can_transfer_out,
            can_transfer_in: !!location.can_transfer_in,
            can_consume: !!location.can_consume,
            manager_name: location.manager_name || '',
        });
        setShowModal(true);
    };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, response_2, error_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, , 6]);
                    if (!editingLocation) return [3 /*break*/, 2];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/settings/locations/".concat(editingLocation.id), formData)];
                case 1:
                    response_1 = _e.sent();
                    if ((_a = response_1.data) === null || _a === void 0 ? void 0 : _a.location) {
                        // Update local state
                        setLocations(function (prev) { return prev.map(function (loc) { return loc.id === editingLocation.id ? response_1.data.location : loc; }); });
                    }
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, httpClient_1.httpClient.post('/api/settings/locations', formData)];
                case 3:
                    response_2 = _e.sent();
                    if ((_b = response_2.data) === null || _b === void 0 ? void 0 : _b.location) {
                        // Add to local state
                        setLocations(function (prev) { return __spreadArray(__spreadArray([], prev, true), [response_2.data.location], false); });
                    }
                    _e.label = 4;
                case 4:
                    setShowModal(false);
                    fetchLocations();
                    loadLocations(); // Refresh store
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _e.sent();
                    console.error('Error saving location:', error_2);
                    alert(((_d = (_c = error_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Error saving location');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!confirm('Are you sure you want to deactivate this location?')) {
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/settings/locations/\"Id\"")];
                case 2:
                    _c.sent();
                    fetchLocations();
                    loadLocations(); // Refresh store
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    console.error('Error deleting location:', error_3);
                    alert(((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Error deleting location');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleActive = function (id, isActive) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    if (!isActive) return [3 /*break*/, 2];
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/settings/locations/\"Id\"/deactivate")];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, httpClient_1.httpClient.post("/api/settings/locations/\"Id\"/activate")];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    // Update local state immediately
                    setLocations(function (prev) { return prev.map(function (loc) { return loc.id === id ? __assign(__assign({}, loc), { is_active: !isActive }) : loc; }); });
                    fetchLocations(); // Refresh from server
                    loadLocations(); // Refresh store
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _c.sent();
                    console.error('Error toggling location:', error_4);
                    alert(((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Error toggling location');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<div className="p-6">
        <div className="text-center">Loading locations...</div>
      </div>);
    }
    return (<div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Locations Management</h1>
          <p className="text-gray-600 mt-1">Gestionare locații restaurant: depozite și unități operaționale</p>
        </div>
        <div className="flex gap-2">
          <HelpButton_1.HelpButton title="Ajutor Gestionare Locații" content={<div>
                <h5>📍 Ce este Gestionarea Locațiilor?</h5>
                <p>
                  Gestionarea locațiilor permite crearea și administrarea locațiilor restaurantului,
                  inclusiv depozite și unități operaționale, cu control granular asupra capabilităților fiecărei locații.
                </p>
                <h5 className="mt-4">🏢 Tipuri de locații</h5>
                <ul>
                  <li><strong>Depozit (Warehouse)</strong> - Locație pentru stocare și distribuție</li>
                  <li><strong>Operațional (Operational)</strong> - Locație pentru operațiuni zilnice (restaurant, bar, etc.)</li>
                </ul>
                <h5 className="mt-4">⚙️ Capabilități disponibile</h5>
                <ul>
                  <li><strong>Poate primi livrări</strong> - Locația poate primi livrări de la furnizori</li>
                  <li><strong>Poate transfera în afara</strong> - Locația poate transfera stocuri către alte locații</li>
                  <li><strong>Poate transfera înăuntru</strong> - Locația poate primi transferuri de la alte locații</li>
                  <li><strong>Poate consuma</strong> - Locația poate consuma stocuri (pentru preparare, etc.)</li>
                </ul>
                <h5 className="mt-4">📋 Funcționalități</h5>
                <ul>
                  <li><strong>Creare locație</strong> - Adaugă locații noi cu nume, tip și capabilități</li>
                  <li><strong>Editare locație</strong> - Modifică informațiile locațiilor existenți</li>
                  <li><strong>Activare/Dezactivare</strong> - Activează sau dezactivează locații</li>
                  <li><strong>Manager</strong> - Asignează un manager pentru fiecare locație</li>
                </ul>
                <div className="alert alert-info mt-4">
                  <strong>💡 Sfat:</strong> Configurează capabilitățile fiecărei locații în funcție de rolul său.
                  De exemplu, un depozit poate primi livrări și transfera, dar nu consuma.
                </div>
              </div>}/>
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Add Location
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(function (location) { return (<div key={location.id} className={"border rounded-lg p-4 ".concat(location.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50')}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{location.name}</h3>
                <span className="text-sm text-gray-600 capitalize">{location.type}</span>
              </div>
              <span className={"px-2 py-1 rounded text-xs ".concat(location.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
                {location.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {location.description && (<p className="text-sm text-gray-600 mb-2">{location.description}</p>)}

            {location.manager_name && (<p className="text-sm text-gray-600 mb-2">Manager: {location.manager_name}</p>)}

            <div className="flex flex-wrap gap-2 mb-3">
              {location.can_receive_deliveries && (<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Deliveries</span>)}
              {location.can_transfer_out && (<span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Transfer Out
                </span>)}
              {location.can_transfer_in && (<span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Transfer In
                </span>)}
              {location.can_consume && (<span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  Consume
                </span>)}
            </div>

            <div className="flex gap-2">
              <button onClick={function () { return handleEdit(location); }} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Edit
              </button>
              <button onClick={function () { return handleToggleActive(location.id, location.is_active); }} className={"px-3 py-1 text-sm rounded ".concat(location.is_active
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-green-600 text-white hover:bg-green-700')}>
                {location.is_active ? 'Deactivate' : 'Activate'}
              </button>
              {!location.is_active && (<button onClick={function () { return handleDelete(location.id); }} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Șterge</button>)}
            </div>
          </div>); })}
      </div>

      {/* Modal */}
      {showModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingLocation ? 'Edit Location' : 'Create Location'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} className="w-full border rounded px-3 py-2" required/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={formData.type} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { type: e.target.value }));
            }} className="w-full border rounded px-3 py-2">
                  <option value="operational">Operational</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descriere</label>
                <textarea value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} className="w-full border rounded px-3 py-2" rows={3}/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Manager Name</label>
                <input type="text" value={formData.manager_name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { manager_name: e.target.value })); }} className="w-full border rounded px-3 py-2"/>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Capabilities</label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.can_receive_deliveries} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { can_receive_deliveries: e.target.checked }));
            }} className="mr-2"/>Poate primi livrări</label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.can_transfer_out} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { can_transfer_out: e.target.checked }));
            }} className="mr-2"/>
                  Can Transfer Out
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.can_transfer_in} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { can_transfer_in: e.target.checked }));
            }} className="mr-2"/>
                  Can Transfer In
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.can_consume} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { can_consume: e.target.checked }));
            }} className="mr-2"/>
                  Can Consume
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
              </button>
              <button onClick={function () { return setShowModal(false); }} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
exports.LocationsPage = LocationsPage;
