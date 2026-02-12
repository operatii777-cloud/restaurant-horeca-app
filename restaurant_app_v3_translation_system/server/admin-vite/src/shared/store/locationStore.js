"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.4 - Location Store (Zustand)
 *
 * Manages current location/restaurant selection in the frontend.
 * Persists to localStorage for persistence across sessions.
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
exports.useLocationStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
exports.useLocationStore = (0, zustand_1.create)()((0, middleware_1.persist)(function (set, get) { return ({
    currentLocationId: null,
    currentLocation: null,
    availableLocations: [],
    isLoading: false,
    setCurrentLocation: function (locationId) {
        var location = get().availableLocations.find(function (loc) { return loc.id === locationId; });
        set({
            currentLocationId: locationId,
            currentLocation: location || null
        });
        // Update localStorage and send to backend
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentLocationId', locationId.toString());
            // Update API header for future requests
            // This will be handled by API client interceptor
        }
    },
    setAvailableLocations: function (locations) {
        set({ availableLocations: locations });
        // If no current location is set, use first active location
        var currentId = get().currentLocationId;
        if (!currentId && locations.length > 0) {
            var firstActive = locations.find(function (loc) { return loc.is_active; }) || locations[0];
            if (firstActive) {
                set({
                    currentLocationId: firstActive.id,
                    currentLocation: firstActive
                });
            }
        }
    },
    loadLocations: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, locations, savedLocationId, locationId_1, location_1, firstActive, firstActive, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ isLoading: true });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/settings/locations')];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load locations');
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    locations = data.locations || [];
                    set({
                        availableLocations: locations,
                        isLoading: false
                    });
                    savedLocationId = localStorage.getItem('currentLocationId');
                    if (savedLocationId) {
                        locationId_1 = parseInt(savedLocationId);
                        location_1 = locations.find(function (loc) { return loc.id === locationId_1; });
                        if (location_1 && location_1.is_active) {
                            set({
                                currentLocationId: locationId_1,
                                currentLocation: location_1
                            });
                        }
                        else {
                            firstActive = locations.find(function (loc) { return loc.is_active; });
                            if (firstActive) {
                                set({
                                    currentLocationId: firstActive.id,
                                    currentLocation: firstActive
                                });
                            }
                        }
                    }
                    else {
                        firstActive = locations.find(function (loc) { return loc.is_active; });
                        if (firstActive) {
                            set({
                                currentLocationId: firstActive.id,
                                currentLocation: firstActive
                            });
                        }
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('LocationStore Error loading locations:', error_1);
                    set({ isLoading: false });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    refreshLocation: function () { return __awaiter(void 0, void 0, void 0, function () {
        var currentId, response, data, location_2, locations, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentId = get().currentLocationId;
                    if (!currentId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/settings/locations/".concat(currentId))];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to refresh location');
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    location_2 = data.location;
                    set({ currentLocation: location_2 });
                    locations = get().availableLocations.map(function (loc) {
                        return loc.id === location_2.id ? location_2 : loc;
                    });
                    set({ availableLocations: locations });
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('LocationStore Error refreshing location:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
}); }, {
    name: 'location-storage',
    partialize: function (state) { return ({
        currentLocationId: state.currentLocationId,
    }); },
}));
