"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Standby Lock Screen Component
 *
 * Full-screen lock screen for POS/Kiosk terminals
 * Similar to Toast/Lightspeed standby mode
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
var react_1 = require("react");
var PINNumpad_1 = require("./PINNumpad");
require("./StandbyLockScreen.css");
var StandbyLockScreen = function (_a) {
    var isLocked = _a.isLocked, onUnlock = _a.onUnlock, _b = _a.restaurantName, restaurantName = _b === void 0 ? 'Restaurant App' : _b, _c = _a.logoUrl, logoUrl = _c === void 0 ? '/assets/logo.png' : _c, _d = _a.showClock, showClock = _d === void 0 ? true : _d;
    var _e = (0, react_1.useState)([]), employees = _e[0], setEmployees = _e[1];
    var _f = (0, react_1.useState)(null), selectedEmployee = _f[0], setSelectedEmployee = _f[1];
    var _g = (0, react_1.useState)(''), pin = _g[0], setPin = _g[1];
    var _h = (0, react_1.useState)(''), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(false), loading = _j[0], setLoading = _j[1];
    var _k = (0, react_1.useState)(new Date()), currentTime = _k[0], setCurrentTime = _k[1];
    var _l = (0, react_1.useState)(3), attemptsRemaining = _l[0], setAttemptsRemaining = _l[1];
    // Update clock every second
    (0, react_1.useEffect)(function () {
        if (!showClock)
            return;
        var timer = setInterval(function () {
            //   const { t } = useTranslation();
            setCurrentTime(new Date());
        }, 1000);
        return function () { return clearInterval(timer); };
    }, [showClock]);
    // Fetch employees on mount
    (0, react_1.useEffect)(function () {
        fetchEmployees();
    }, []);
    var fetchEmployees = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/auth/pin/employees')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setEmployees(data.data.filter(function (emp) { return emp.hasPIN; }));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Failed to fetch employees:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDigit = (0, react_1.useCallback)(function (digit) {
        if (pin.length < 4) {
            setPin(function (prev) { return prev + digit; });
            setError('');
        }
    }, [pin]);
    var handleBackspace = (0, react_1.useCallback)(function () {
        setPin(function (prev) { return prev.slice(0, -1); });
        setError('');
    }, []);
    var handleClear = (0, react_1.useCallback)(function () {
        setPin('');
        setError('');
    }, []);
    // Auto-submit when 4 digits entered
    (0, react_1.useEffect)(function () {
        if (pin.length === 4 && selectedEmployee) {
            handleLogin();
        }
    }, [pin, selectedEmployee]);
    var handleLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedEmployee || pin.length !== 4)
                        return [2 /*return*/];
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/auth/pin/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedEmployee.id,
                                pin: pin
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        // Success - unlock screen
                        onUnlock(selectedEmployee.id, data.data);
                        setPin('');
                        setSelectedEmployee(null);
                    }
                    else {
                        setError(data.error || 'Invalid PIN');
                        setPin('');
                        if (data.attemptsRemaining !== undefined) {
                            setAttemptsRemaining(data.attemptsRemaining);
                        }
                        if (data.lockedUntil) {
                            setError("Account locked until ".concat(new Date(data.lockedUntil).toLocaleTimeString()));
                        }
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    setError('Connection error. Please try again.');
                    setPin('');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleEmployeeSelect = function (employee) {
        setSelectedEmployee(employee);
        setPin('');
        setError('');
        setAttemptsRemaining(3);
    };
    var handleBack = function () {
        setSelectedEmployee(null);
        setPin('');
        setError('');
    };
    if (!isLocked)
        return null;
    return (<div className="standby-lock-screen">
      {/* Background gradient overlay */}
      <div className="lock-screen-overlay"/>
      
      {/* Header with logo and time */}
      <div className="lock-screen-header">
        <div className="lock-screen-branding">
          {logoUrl && <img src={logoUrl} alt={restaurantName} className="lock-screen-logo"/>}
          <h1 className="lock-screen-title">{restaurantName}</h1>
        </div>
        
        {showClock && (<div className="lock-screen-clock">
            <div className="clock-time">
              {currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="clock-date">
              {currentTime.toLocaleDateString('ro-RO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            })}
            </div>
          </div>)}
      </div>

      {/* Main content */}
      <div className="lock-screen-content">
        {!selectedEmployee ? (
        /* Employee Selection Grid */
        <div className="employee-selection">
            <h2 className="selection-title">"selecteaza angajatul"</h2>
            <div className="employee-grid">
              {employees.map(function (emp) { return (<button key={emp.id} className="employee-card" onClick={function () { return handleEmployeeSelect(emp); }}>
                  <div className="employee-avatar">
                    {emp.avatarUrl ? (<img src={emp.avatarUrl} alt={emp.name}/>) : (<span className="employee-initials">{emp.initials}</span>)}
                  </div>
                  <span className="employee-name">{emp.name}</span>
                  <span className="employee-role">{emp.role}</span>
                </button>); })}
            </div>
            
            {employees.length === 0 && (<div className="no-employees">
                <p>"nu exista angajati cu pin configurat"</p>
                <p>"configurati pin ul din setari"</p>
              </div>)}
          </div>) : (
        /* PIN Entry */
        <div className="pin-entry-section">
            <button className="back-button" onClick={handleBack}>
              ← Înapoi
            </button>
            
            <div className="selected-employee">
              <div className="employee-avatar large">
                {selectedEmployee.avatarUrl ? (<img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name}/>) : (<span className="employee-initials">{selectedEmployee.initials}</span>)}
              </div>
              <h3>{selectedEmployee.name}</h3>
              <span className="role-badge">{selectedEmployee.role}</span>
            </div>
            
            <div className="pin-display">
              <div className="pin-dots">
                {[0, 1, 2, 3].map(function (i) { return (<div key={i} className={"pin-dot ".concat(i < pin.length ? 'filled' : '', " ").concat(loading ? 'loading' : '')}/>); })}
              </div>
              {error && <div className="pin-error">{error}</div>}
            </div>
            
            <PINNumpad_1.default onDigit={handleDigit} onBackspace={handleBackspace} onClear={handleClear} disabled={loading}/>
          </div>)}
      </div>

      {/* Footer */}
      <div className="lock-screen-footer">
        <span>"powered by restaurant app enterprise"</span>
      </div>
    </div>);
};
exports.default = StandbyLockScreen;
