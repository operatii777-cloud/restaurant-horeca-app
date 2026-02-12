"use strict";
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
exports.TopBar = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var ThemeSwitcher_1 = require("@/shared/components/ThemeSwitcher");
// LocationSwitcher moved to Transfer and Stocks pages
require("./TopBar.css");
var TopBar = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), isLoggedIn = _a[0], setIsLoggedIn = _a[1];
    var _b = (0, react_1.useState)(false), showLoginModal = _b[0], setShowLoginModal = _b[1];
    var _c = (0, react_1.useState)(''), username = _c[0], setUsername = _c[1];
    var _d = (0, react_1.useState)(''), password = _d[0], setPassword = _d[1];
    var _e = (0, react_1.useState)(''), loginError = _e[0], setLoginError = _e[1];
    (0, react_1.useEffect)(function () {
        // Verifică dacă utilizatorul este deja autentificat
        var checkAuth = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/check-auth')];
                    case 1:
                        response = _c.sent();
                        if ((_b = response.data) === null || _b === void 0 ? void 0 : _b.authenticated) {
                            setIsLoggedIn(true);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _c.sent();
                        setIsLoggedIn(false);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        checkAuth();
    }, []);
    var handleLogin = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    e.preventDefault();
                    setLoginError('');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/login', {
                            username: username,
                            password: password,
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setIsLoggedIn(true);
                        setShowLoginModal(false);
                        setUsername('');
                        setPassword('');
                    }
                    else {
                        setLoginError(((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Date de autentificare incorecte');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _e.sent();
                    setLoginError(((_d = (_c = error_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la autentificare');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleLogout = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/logout')];
                case 1:
                    _a.sent();
                    setIsLoggedIn(false);
                    window.location.href = '/admin';
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    // Logout chiar dacă există eroare
                    setIsLoggedIn(false);
                    window.location.href = '/admin';
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <header className="topbar topbar--compact">
        <div className="topbar__spacer"/>
        <div className="topbar__right">
          {/* Theme Switcher */}
          <div style={{
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
            visibility: window.location.pathname.startsWith('/kiosk') ? 'hidden' : 'visible',
            minWidth: '220px'
        }}>
            <ThemeSwitcher_1.ThemeSwitcher size="md"/>
          </div>

          {isLoggedIn ? (<button type="button" className="topbar__logout-btn" onClick={handleLogout} title="Deconectare">
              🚪 Logout
            </button>) : (<button type="button" className="topbar__login-btn" onClick={function (e) {
                // Verifică dacă suntem în KIOSK - nu deschide modalul Admin V4
                var isKiosk = window.location.pathname.startsWith('/kiosk');
                if (isKiosk) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('âš ï¸ TopBar login button apăsat în KIOSK - ignorat');
                    return;
                }
                setShowLoginModal(true);
            }} title="Conectare">
              🔐 Login
            </button>)}

          {/* Logo */}
          <div className="topbar__logo">
            <span className="topbar__logo-icon">🍽️</span>
            <div className="topbar__logo-text">
              <span className="topbar__logo-title">Admin</span>
              <span className="topbar__logo-subtitle">Restaurant App v4</span>
            </div>
          </div>

          {/* Powered by QrOMS Badge */}
          <div className="topbar__qroms-badge">
            <a href="https://qroms.app" target="_blank" rel="noopener noreferrer" className="qroms-badge-link" aria-label="Powered by QrOMS">
              <img src="/admin-vite/QrOMS.jpg" alt="QrOMS" className="qroms-badge-img" onError={function (e) {
            // Dacă QrOMS.jpg nu există, încearcă Trattoria.jpg
            var target = e.target;
            if (target.src.includes('QrOMS')) {
                target.src = '/admin-vite/Trattoria.jpg';
            }
            else {
                // Dacă nici Trattoria.jpg nu există, ascunde imaginea
                target.style.display = 'none';
            }
        }}/>
              <span className="qroms-badge-label">Powered by QrOMS</span>
            </a>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (<div className="topbar__login-modal-overlay" onClick={function () { return setShowLoginModal(false); }}>
          <div className="topbar__login-modal" onClick={function (e) { return e.stopPropagation(); }}>
            <div className="topbar__login-modal-header">
              <h3>Conectare Admin</h3>
              <button type="button" className="topbar__login-modal-close" onClick={function () { return setShowLoginModal(false); }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleLogin} className="topbar__login-form">
              {loginError && (<div className="topbar__login-error">{loginError}</div>)}
              <div className="topbar__login-field">
                <label htmlFor="topbar-username">Utilizator:</label>
                <input id="topbar-username" type="text" value={username} onChange={function (e) { return setUsername(e.target.value); }} required autoFocus/>
              </div>
              <div className="topbar__login-field">
                <label htmlFor="topbar-password">Parolă:</label>
                <input id="topbar-password" type="password" value={password} onChange={function (e) { return setPassword(e.target.value); }} required/>
              </div>
              <div className="topbar__login-actions">
                <button type="submit" className="topbar__login-submit">
                  Conectare
                </button>
                <button type="button" className="topbar__login-cancel" onClick={function () { return setShowLoginModal(false); }}>Anulează</button>
              </div>
            </form>
          </div>
        </div>)}
    </>);
};
exports.TopBar = TopBar;
