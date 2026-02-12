"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.4 - Location Switcher Component
 *
 * Dropdown component for switching between restaurant locations.
 * Displays in navbar/topbar.
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
exports.LocationSwitcher = void 0;
var react_1 = require("react");
var locationStore_1 = require("@/shared/store/locationStore");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
var LocationSwitcher = function () {
    //   const { t } = useTranslation();
    var theme = (0, ThemeContext_1.useTheme)().theme;
    var _a = (0, locationStore_1.useLocationStore)(), currentLocationId = _a.currentLocationId, currentLocation = _a.currentLocation, availableLocations = _a.availableLocations, isLoading = _a.isLoading, setCurrentLocation = _a.setCurrentLocation, loadLocations = _a.loadLocations;
    var _b = (0, react_1.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    (0, react_1.useEffect)(function () {
        // Load locations on mount
        if (availableLocations.length === 0) {
            console.log('LocationSwitcher Loading locations...');
            loadLocations().catch(function (err) {
                console.error('LocationSwitcher Error loading locations:', err);
            });
        }
    }, [availableLocations.length, loadLocations]);
    var handleLocationChange = function (locationId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setCurrentLocation(locationId);
            setIsOpen(false);
            // Update API header for future requests
            // This will be handled by API client interceptor
            // For now, we'll reload the page to apply new location context
            // TODO: Implement API client interceptor to add X-Location-ID header
            window.location.reload();
            return [2 /*return*/];
        });
    }); };
    if (isLoading) {
        return (<div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                fontSize: '14px',
                color: theme.textMuted,
            }}>
        <span>Loading...</span>
      </div>);
    }
    if (availableLocations.length === 0) {
        // Show loading state instead of null
        if (isLoading) {
            return (<div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    height: '28px',
                    color: theme.textMuted,
                }}>
          <span>Loading...</span>
        </div>);
        }
        // Only return null if not loading and no locations
        // This is expected behavior when no locations are configured yet
        // Changed from console.warn to console.log to reduce noise in console
        if (process.env.NODE_ENV === 'development') {
            console.log('LocationSwitcher No locations available - this is normal if locations are not configured yet');
        }
        return null;
    }
    if (availableLocations.length === 1) {
        // Only one location - just show name
        return (<div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                fontSize: '14px',
                color: theme.text,
                fontWeight: 500,
            }}>
        <span>{availableLocations[0].name}</span>
      </div>);
    }
    return (<div className="relative location-switcher-wrapper flex-shrink-0" style={{ zIndex: 1000 }}>
      <button type="button" onClick={function (e) {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
            maxWidth: '200px',
            height: '36px',
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 500,
            color: theme.text,
            background: theme.surface,
            border: "1px solid ".concat(theme.border),
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: "0 1px 3px ".concat(theme.shadowColor),
        }} onMouseEnter={function (e) {
            e.currentTarget.style.background = theme.surfaceHover;
            e.currentTarget.style.boxShadow = "0 2px 6px ".concat(theme.shadowColor);
        }} onMouseLeave={function (e) {
            e.currentTarget.style.background = theme.surface;
            e.currentTarget.style.boxShadow = "0 1px 3px ".concat(theme.shadowColor);
        }} title={(currentLocation === null || currentLocation === void 0 ? void 0 : currentLocation.name) || 'Selectează locația'}>
        <span style={{ fontSize: '16px' }}>🏢</span>
        <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
            fontSize: '14px',
            fontWeight: 500,
            color: theme.text,
        }}>
          {(currentLocation === null || currentLocation === void 0 ? void 0 : currentLocation.name) || 'Locație'}
        </span>
        <svg style={{
            width: '16px',
            height: '16px',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: theme.text,
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isOpen && (<>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[999]" onClick={function () { return setIsOpen(false); }}/>
          
          {/* Dropdown */}
          <div style={{
                position: 'absolute',
                right: 0,
                marginTop: '8px',
                width: '224px',
                background: theme.surface,
                borderRadius: '12px',
                boxShadow: "0 8px 24px ".concat(theme.shadowColor),
                border: "1px solid ".concat(theme.border),
                zIndex: 1001,
                maxHeight: '320px',
                overflowY: "Auto",
            }}>
            <div style={{ padding: '4px 0' }}>
              <div style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 600,
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: "1px solid ".concat(theme.borderLight),
            }}>
                Selectează Locația
              </div>
              
              {availableLocations
                .filter(function (loc) { return loc.is_active; })
                .map(function (location) { return (<button key={location.id} onClick={function () { return handleLocationChange(location.id); }} style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    background: location.id === currentLocationId ? theme.surfaceHover : 'transparent',
                    color: location.id === currentLocationId ? theme.accent : theme.text,
                    fontWeight: location.id === currentLocationId ? 600 : 400,
                    border: 'none',
                    cursor: 'pointer',
                }} onMouseEnter={function (e) {
                    if (location.id !== currentLocationId) {
                        e.currentTarget.style.background = theme.surfaceHover;
                    }
                }} onMouseLeave={function (e) {
                    if (location.id !== currentLocationId) {
                        e.currentTarget.style.background = 'transparent';
                    }
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>
                        {location.type === 'warehouse' ? '📦' : location.type === "Operațional" ? '🏢' : '📍'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: location.id === currentLocationId ? theme.accent : theme.text,
                }}>
                          {location.name}
                        </div>
                        {location.description && (<div style={{
                        fontSize: '12px',
                        color: theme.textMuted,
                        marginTop: '4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                            {location.description}
                          </div>)}
                      </div>
                      {location.id === currentLocationId && (<svg style={{
                        width: '16px',
                        height: '16px',
                        color: theme.accent,
                        flexShrink: 0,
                        marginTop: '2px',
                    }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>)}
                    </div>
                  </button>); })}
            </div>
          </div>
        </>)}
    </div>);
};
exports.LocationSwitcher = LocationSwitcher;
