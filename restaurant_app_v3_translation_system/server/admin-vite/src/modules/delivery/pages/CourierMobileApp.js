"use strict";
/**
 * 📱 COURIER MOBILE APP - PWA optimizat pentru telefon
 * Inspirat din HorecaAI DriverView
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
exports.CourierMobileApp = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var serverConfig_1 = require("@/utils/serverConfig");
var pwa_install_1 = require("@/utils/pwa-install");
require("./CourierMobileApp.css");
var CourierMobileApp = function () {
    var _a = (0, react_1.useState)('active'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)([]), myOrders = _b[0], setMyOrders = _b[1];
    var _c = (0, react_1.useState)(false), isRefreshing = _c[0], setIsRefreshing = _c[1];
    var _d = (0, react_1.useState)(false), showSignaturePad = _d[0], setShowSignaturePad = _d[1];
    var _e = (0, react_1.useState)(null), selectedOrder = _e[0], setSelectedOrder = _e[1];
    var _f = (0, react_1.useState)(null), courierId = _f[0], setCourierId = _f[1];
    var _g = (0, react_1.useState)(null), apiToken = _g[0], setApiToken = _g[1];
    var _h = (0, react_1.useState)(null), courierInfo = _h[0], setCourierInfo = _h[1];
    var _j = (0, react_1.useState)(null), loginError = _j[0], setLoginError = _j[1];
    var _k = (0, react_1.useState)(false), isLoggingIn = _k[0], setIsLoggingIn = _k[1];
    var _l = (0, react_1.useState)(false), showInstallButton = _l[0], setShowInstallButton = _l[1];
    var _m = (0, react_1.useState)(false), isInstalled = _m[0], setIsInstalled = _m[1];
    var _o = (0, react_1.useState)(false), buttonEnabled = _o[0], setButtonEnabled = _o[1];
    var canvasRef = (0, react_1.useRef)(null);
    var _p = (0, react_1.useState)(false), isDrawing = _p[0], setIsDrawing = _p[1];
    // Initialize PWA install
    (0, react_1.useEffect)(function () {
        (0, pwa_install_1.initPWAInstall)();
        setIsInstalled((0, pwa_install_1.isPWAInstalled)());
        // Listen for install prompt availability
        var handleInstallAvailable = function () {
            console.log('📱 PWA install prompt available - showing button');
            setShowInstallButton(true);
        };
        var handleInstalled = function () {
            console.log('✅ PWA installed - hiding button');
            setIsInstalled(true);
            setShowInstallButton(false);
        };
        window.addEventListener('pwa-install-available', handleInstallAvailable);
        window.addEventListener('pwa-installed', handleInstalled);
        // Check if install prompt is available (Android/Chrome)
        if ((0, pwa_install_1.isInstallPromptAvailable)()) {
            console.log('📱 Install prompt already available');
            setShowInstallButton(true);
        }
        // For iOS Safari - always show install button (uses Share menu)
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isIOS && isSafari && !(0, pwa_install_1.isPWAInstalled)()) {
            console.log('🍎 iOS Safari detected - showing manual install button');
            setShowInstallButton(true);
        }
        // Check again after a delay (in case event fires late)
        var timeout = setTimeout(function () {
            if (!(0, pwa_install_1.isPWAInstalled)() && !showInstallButton) {
                // Try to show button if conditions are met
                if ((0, pwa_install_1.isInstallPromptAvailable)()) {
                    setShowInstallButton(true);
                }
            }
        }, 2000);
        return function () {
            window.removeEventListener('pwa-install-available', handleInstallAvailable);
            window.removeEventListener('pwa-installed', handleInstalled);
            clearTimeout(timeout);
        };
    }, []);
    // Get API token from localStorage (sau ID curier pentru backward compatibility)
    (0, react_1.useEffect)(function () {
        var params = new URLSearchParams(window.location.search);
        var token = params.get('token') || localStorage.getItem('courier_api_token');
        var id = params.get("courier id") || localStorage.getItem('courier_id');
        if (token) {
            setApiToken(token);
            localStorage.setItem('courier_api_token', token);
            // Verifică token și obține info curier
            verifyTokenAndLoadCourier(token);
        }
        else if (id) {
            // Backward compatibility: folosește ID direct (fără autentificare)
            setCourierId(parseInt(id));
            localStorage.setItem('courier_id', id);
        }
    }, []);
    // Verifică token și încarcă info curier
    var verifyTokenAndLoadCourier = function (token) { return __awaiter(void 0, void 0, void 0, function () {
        var apiUrl, res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    apiUrl = (0, serverConfig_1.getApiUrl)();
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/couriers/me"), {
                            headers: {
                                'Authorization': "Bearer ".concat(token)
                            }
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success && data.courier) {
                        setCourierInfo(data.courier);
                        setCourierId(data.courier.id);
                        setApiToken(token);
                    }
                    else {
                        setLoginError('Token invalid');
                        setApiToken(null);
                        localStorage.removeItem('courier_api_token');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error verifying token:', err_1);
                    setLoginError('Eroare la verificare token');
                    setApiToken(null);
                    localStorage.removeItem('courier_api_token');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var refreshOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var apiUrl, res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!courierId && !apiToken)
                        return [2 /*return*/];
                    setIsRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    apiUrl = (0, serverConfig_1.getApiUrl)();
                    res = void 0;
                    if (!apiToken) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/couriers/me/assignments?status=assigned,picked_up,delivered"), {
                            headers: {
                                'Authorization': "Bearer ".concat(apiToken)
                            }
                        })];
                case 2:
                    // apiUrl deja conține /api, deci folosim doar /couriers/me/assignments
                    // Include toate statusurile pentru a avea și istoricul
                    res = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, fetch("".concat(apiUrl, "/couriers/").concat(courierId, "/deliveries?status=assigned,picked_up,delivered"))];
                case 4:
                    // Backward compatibility: folosește endpoint-ul cu ID (fără autentificare)
                    // apiUrl deja conține /api, deci folosim doar /couriers/...
                    // Include toate statusurile pentru a avea și istoricul
                    res = _a.sent();
                    _a.label = 5;
                case 5: return [4 /*yield*/, res.json()];
                case 6:
                    data = _a.sent();
                    if (data.success) {
                        setMyOrders(data.deliveries || []);
                    }
                    return [3 /*break*/, 9];
                case 7:
                    err_2 = _a.sent();
                    console.error('Error:', err_2);
                    return [3 /*break*/, 9];
                case 8:
                    setTimeout(function () { return setIsRefreshing(false); }, 500);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (courierId || apiToken) {
            refreshOrders();
            // Auto-refresh every 30 seconds
            var interval_1 = setInterval(refreshOrders, 30000);
            return function () { return clearInterval(interval_1); };
        }
    }, [courierId, apiToken]);
    var activeDeliveries = myOrders.filter(function (o) { return o.status === 'assigned' || o.status === 'picked_up'; });
    var historyDeliveries = myOrders.filter(function (o) { return o.status === 'delivered'; });
    // 🔴 FIX: Calculează câștigurile doar pentru ziua curentă
    var calculateEarnings = function () {
        var deliveryFee = 15; // RON per delivery
        var today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        var todayDeliveries = historyDeliveries.filter(function (d) {
            if (!d.delivered_at)
                return false;
            var deliveredDate = new Date(d.delivered_at).toISOString().split('T')[0];
            return deliveredDate === today;
        });
        return todayDeliveries.length * deliveryFee;
    };
    // 🔴 FIX: Grupează istoricul pe zile calendaristice cu câștigurile respective
    var getHistoryByDate = function () {
        var groupedByDate = {};
        historyDeliveries.forEach(function (delivery) {
            if (!delivery.delivered_at)
                return;
            var deliveredDate = new Date(delivery.delivered_at).toISOString().split('T')[0];
            var dateKey = deliveredDate;
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { deliveries: [], earnings: 0 };
            }
            groupedByDate[dateKey].deliveries.push(delivery);
            groupedByDate[dateKey].earnings += delivery.delivery_fee || 15;
        });
        // Sortează zilele descrescător (cele mai recente primele)
        return Object.entries(groupedByDate)
            .sort(function (_a, _b) {
            var dateA = _a[0];
            var dateB = _b[0];
            return dateB.localeCompare(dateA);
        })
            .map(function (_a) {
            var date = _a[0], data = _a[1];
            return ({
                date: date,
                deliveries: data.deliveries.sort(function (a, b) {
                    return new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime();
                }),
                earnings: data.earnings
            });
        });
    };
    var handleAction = function (order) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(order.status === 'assigned')) return [3 /*break*/, 3];
                    if (!confirm('Preiei comanda și pleci spre client?')) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateDeliveryStatus(order.id, 'picked_up')];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    if (order.status === 'picked_up') {
                        // Confirmă livrare cu semnătură
                        setSelectedOrder(order);
                        setShowSignaturePad(true);
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var updateDeliveryStatus = function (deliveryId, status) { return __awaiter(void 0, void 0, void 0, function () {
        var apiUrl, headers, res, errorData, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    apiUrl = (0, serverConfig_1.getApiUrl)();
                    headers = { 'Content-Type': 'application/json' };
                    // Dacă avem token, adaugă-l în header
                    if (apiToken) {
                        headers['Authorization'] = "Bearer ".concat(apiToken);
                    }
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/couriers/delivery/").concat(deliveryId, "/status"), {
                            method: 'PUT',
                            headers: headers,
                            body: JSON.stringify({ status: status }),
                        })];
                case 1:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return ({ error: 'Eroare necunoscută' }); })];
                case 2:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "HTTP ".concat(res.status));
                case 3: return [4 /*yield*/, res.json()];
                case 4:
                    data = _a.sent();
                    if (data.success) {
                        refreshOrders();
                    }
                    else {
                        console.error('Failed to update status:', data);
                        alert("Eroare: ".concat(data.error || 'Nu s-a putut actualiza statusul'));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    err_3 = _a.sent();
                    console.error('Error updating delivery status:', err_3);
                    alert("Eroare: ".concat(err_3.message || 'Nu s-a putut actualiza statusul'));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var confirmDelivery = function () { return __awaiter(void 0, void 0, void 0, function () {
        var canvas, signature, ctx, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedOrder)
                        return [2 /*return*/];
                    canvas = canvasRef.current;
                    signature = canvas ? canvas.toDataURL() : '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateDeliveryStatus(selectedOrder.id, 'delivered')];
                case 2:
                    _a.sent();
                    setShowSignaturePad(false);
                    setSelectedOrder(null);
                    // Clear canvas
                    if (canvas) {
                        ctx = canvas.getContext('2d');
                        ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    console.error('Error:', err_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openNavigation = function (address, app) {
        if (app === void 0) { app = 'google'; }
        if (app === 'waze') {
            var wazeUrl = "https://www.waze.com/ul?q=".concat(encodeURIComponent(address));
            window.open(wazeUrl, '_blank');
        }
        else {
            var googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=".concat(encodeURIComponent(address));
            window.open(googleMapsUrl, '_blank');
        }
    };
    // Canvas drawing functions
    var startDrawing = function (e) {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        var rect = canvas.getBoundingClientRect();
        var x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        var y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };
    var draw = function (e) {
        if (!isDrawing)
            return;
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        var rect = canvas.getBoundingClientRect();
        var x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        var y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    };
    var stopDrawing = function () { return setIsDrawing(false); };
    var clearSignature = function () {
        var canvas = canvasRef.current;
        if (canvas) {
            var ctx = canvas.getContext('2d');
            ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    // Login cu token API (ca în HorecaAI)
    var handleTokenLogin = function (token) { return __awaiter(void 0, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoggingIn(true);
                    setLoginError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, verifyTokenAndLoadCourier(token)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_5 = _a.sent();
                    setLoginError('Eroare la autentificare');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoggingIn(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Login cu username/password (ca în HorecaAI)
    var handleUsernamePasswordLogin = function (username, password) { return __awaiter(void 0, void 0, void 0, function () {
        var apiUrl, res, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoggingIn(true);
                    setLoginError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    apiUrl = (0, serverConfig_1.getApiUrl)();
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/couriers/login"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username, password: password }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success && data.token) {
                        setApiToken(data.token);
                        setCourierInfo(data.courier);
                        setCourierId(data.courier.id);
                        localStorage.setItem('courier_api_token', data.token);
                        setLoginError(null);
                    }
                    else {
                        setLoginError(data.error || 'Autentificare eșuată');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_6 = _a.sent();
                    setLoginError('Eroare la autentificare: ' + (err_6.message || 'Conexiune eșuată'));
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoggingIn(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var _q = (0, react_1.useState)('username'), loginMode = _q[0], setLoginMode = _q[1];
    var _r = (0, react_1.useState)(''), username = _r[0], setUsername = _r[1];
    var _s = (0, react_1.useState)(''), password = _s[0], setPassword = _s[1];
    var _t = (0, react_1.useState)(''), tokenInput = _t[0], setTokenInput = _t[1];
    var handleInstallPWA = function () { return __awaiter(void 0, void 0, void 0, function () {
        var isIOS, isSafari, installed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                    if (isIOS && isSafari) {
                        // iOS Safari - show instructions
                        alert('📱 Pentru a instala aplicația pe iOS:\n\n1. Apasă butonul Share (pătrat cu săgeată)\n2. Selectează "Adaugă pe ecranul principal"\n3. Confirmă instalarea');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, pwa_install_1.showInstallPrompt)()];
                case 1:
                    installed = _a.sent();
                    if (installed) {
                        setShowInstallButton(false);
                        setIsInstalled(true);
                    }
                    else {
                        // Fallback: show manual instructions
                        alert('📱 Pentru a instala aplicația:\n\n1. Apasă meniul browser-ului (3 puncte)\n2. Selectează "Adaugă pe ecranul principal" sau "Instalează aplicația"\n3. Confirmă instalarea');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (apiToken) {
            setButtonEnabled(true);
        }
    }, [apiToken]);
    if (!courierId && !apiToken) {
        return (<div className="courier-mobile-login">
        <div className="courier-mobile-login__card">
          <lucide_react_1.Bike size={48} className="courier-mobile-login__icon"/>
          <h2>Mod Curier</h2>

          {/* Tabs pentru moduri de login */}
          <div className="d-flex gap-2 mb-3">
            <button onClick={function () { return setLoginMode('username'); }} style={{
                flex: 1,
                padding: '0.5rem',
                background: loginMode === 'username' ? '#667eea' : '#e5e7eb',
                color: loginMode === 'username' ? 'white' : '#666',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
            }}>
              Username/Password
            </button>
            <button onClick={function () { return setLoginMode('token'); }} style={{
                flex: 1,
                padding: '0.5rem',
                background: loginMode === 'token' ? '#667eea' : '#e5e7eb',
                color: loginMode === 'token' ? 'white' : '#666',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
            }}>
              Token API
            </button>
          </div>

          {loginError && (<div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.5rem', background: '#fee', borderRadius: '0.5rem' }}>
              {loginError}
            </div>)}

          {loginMode === 'username' ? (<>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                Autentifică-te cu codul/telefonul și parola
              </p>
              <input type="text" placeholder="Cod / Telefon / Email" className="courier-mobile-login__input" value={username} onChange={function (e) { return setUsername(e.target.value); }} onKeyPress={function (e) {
                    if (e.key === 'Enter' && username && password) {
                        handleUsernamePasswordLogin(username, password);
                    }
                }}/>
              <input type="password" placeholder="Parolă" className="courier-mobile-login__input" value={password} onChange={function (e) { return setPassword(e.target.value); }} onKeyPress={function (e) {
                    if (e.key === 'Enter' && username && password) {
                        handleUsernamePasswordLogin(username, password);
                    }
                }}/>
              <button onClick={function () { return handleUsernamePasswordLogin(username, password); }} disabled={isLoggingIn || !username || !password} style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (isLoggingIn || !username || !password) ? 'not-allowed' : 'pointer',
                    marginTop: '1rem',
                    opacity: (isLoggingIn || !username || !password) ? 0.6 : 1
                }}>
                {isLoggingIn ? 'Se autentifică...' : 'Autentificare'}
              </button>
            </>) : (<>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>"introdu token ul tau api"</p>
              <input type="text" placeholder="Token API" className="courier-mobile-login__input" value={tokenInput} onChange={function (e) { return setTokenInput(e.target.value); }} onKeyPress={function (e) {
                    if (e.key === 'Enter' && tokenInput) {
                        handleTokenLogin(tokenInput);
                    }
                }}/>
              <button onClick={function () { return handleTokenLogin(tokenInput); }} disabled={isLoggingIn || !tokenInput} style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (isLoggingIn || !tokenInput) ? 'not-allowed' : 'pointer',
                    marginTop: '1rem',
                    opacity: (isLoggingIn || !tokenInput) ? 0.6 : 1
                }}>
                {isLoggingIn ? 'Se autentifică...' : 'Autentificare'}
              </button>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                <p>"token ul api poate fi generat din pagina de gestio"</p>
              </div>
            </>)}

          <button onClick={function () { return window.location.href = '/couriers'; }} className="courier-mobile-login__link" style={{ marginTop: '1rem' }}>
            Vezi lista curieri →
          </button>

          {/* Backward compatibility: ID curier (pentru testare) */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
              Sau folosește ID curier (mod testare):
            </p>
            <input type="number" placeholder="ID Curier (testare)" className="courier-mobile-login__input" style={{ fontSize: '0.875rem' }} onKeyPress={function (e) {
                if (e.key === 'Enter') {
                    var value = e.target.value;
                    if (value) {
                        setCourierId(parseInt(value));
                        localStorage.setItem('courier_id', value);
                    }
                }
            }}/>
          </div>
        </div>
      </div>);
    }
    return (<div className="courier-mobile-app">
      {/* Header */}
      <div className="courier-mobile-header">
        <div className="courier-mobile-header__user">
          <div className="courier-mobile-header__avatar">
            <lucide_react_1.Bike size={24}/>
          </div>
          <div className="courier-mobile-header__info">
            <h2 className="courier-mobile-header__name">
              {(courierInfo === null || courierInfo === void 0 ? void 0 : courierInfo.name) || "Curier #".concat(courierId)}
            </h2>
            <span className="courier-mobile-header__status">
              <span className="status-dot"></span> {(courierInfo === null || courierInfo === void 0 ? void 0 : courierInfo.status) || 'Online'}
            </span>
          </div>
        </div>
        <div className="courier-mobile-header__actions">
          {showInstallButton && !isInstalled && (<button onClick={handleInstallPWA} className="btn-install-pwa" title='Instalează aplicația pe telefon'>
              <lucide_react_1.Download size={18}/>
            </button>)}
          <button onClick={refreshOrders} className={"btn-refresh ".concat(isRefreshing ? 'rotating' : '')} disabled={isRefreshing} title="Reîmprospătează comenzile">
            <lucide_react_1.RefreshCw size={18}/>
          </button>
          <div className="courier-mobile-header__earnings">
            <span className="earnings-label">Câștig azi</span>
            <span className="earnings-value">{calculateEarnings()} RON</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="courier-mobile-tabs">
        <button onClick={function () { return setActiveTab('active'); }} className={"courier-mobile-tab ".concat(activeTab === 'active' ? 'active' : '')}>
          <lucide_react_1.Bike size={16}/> Active ({activeDeliveries.length})
        </button>
        <button onClick={function () { return setActiveTab('history'); }} className={"courier-mobile-tab ".concat(activeTab === 'history' ? 'active' : '')}>
          <lucide_react_1.History size={16}/> Istoric ({historyDeliveries.length})
        </button>
      </div>

      {/* Content */}
      <div className="courier-mobile-content">
        {activeTab === 'active' ? (activeDeliveries.length === 0 ? (<div className="courier-mobile-empty">
              <lucide_react_1.Package size={48}/>
              <p>"nicio livrare activa"</p>
            </div>) : (<div className="courier-mobile-orders">
              {activeDeliveries.map(function (order) { return (<div key={order.id} className="courier-order-card">
                  <div className="courier-order-header">
                    <div>
                      <span className="courier-order-id">#{order.order_number || order.id}</span>
                      <h3 className="courier-order-customer">{order.customer_name}</h3>
                    </div>
                    <div className="courier-order-total">
                      <div className="total-value">{order.total} RON</div>
                      <div className="total-status">
                        {order.status === 'picked_up' ? 'În Transit' : 'Pregătit'}
                      </div>
                    </div>
                  </div>

                  <div className="courier-order-details">
                    <div className="detail-row">
                      <lucide_react_1.MapPin size={16}/>
                      <span>{order.delivery_address}</span>
                    </div>
                    <div className="courier-order-actions">
                      <button onClick={function () { return window.open("tel:".concat(order.customer_phone), '_self'); }} className="action-btn action-btn--call">
                        <lucide_react_1.Phone size={14}/>"Sună"</button>
                      <button onClick={function () { return openNavigation(order.delivery_address, 'google'); }} className="action-btn action-btn--maps">
                        <lucide_react_1.Navigation size={14}/> Maps
                      </button>
                      <button onClick={function () { return openNavigation(order.delivery_address, 'waze'); }} className="action-btn action-btn--waze">
                        <lucide_react_1.Navigation size={14}/> Waze
                      </button>
                    </div>
                  </div>

                  <button onClick={function () { return handleAction(order); }} className={"courier-order-action ".concat(order.status === 'picked_up' ? 'action--confirm' : 'action--pickup')}>
                    {order.status === 'picked_up' ? (<><lucide_react_1.CheckCircle size={20}/> CONFIRMĂ LIVRAREA (POD)</>) : (<><lucide_react_1.Package size={20}/> PREIA COMANDA</>)}
                  </button>
                </div>); })}
            </div>)) : (<div className="courier-mobile-history">
            {getHistoryByDate().map(function (_a) {
                var date = _a.date, deliveries = _a.deliveries, earnings = _a.earnings;
                var dateObj = new Date(date);
                var isToday = date === new Date().toISOString().split('T')[0];
                var dateLabel = isToday
                    ? 'Astăzi'
                    : dateObj.toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                return (<div key={date} className="courier-history-day-group">
                  <div className="history-day-header">
                    <div className="history-day-label">{dateLabel}</div>
                    <div className="history-day-earnings">
                      <lucide_react_1.DollarSign size={14}/>
                      {earnings.toFixed(0)} RON
                    </div>
                  </div>
                  {deliveries.map(function (order) { return (<div key={order.id} className="courier-history-item">
                      <div>
                        <div className="history-id">Livrare #{order.order_number || order.id}</div>
                        <div className="history-time">{new Date(order.delivered_at).toLocaleTimeString('ro-RO')}</div>
                      </div>
                      <div className="history-earnings">
                        <lucide_react_1.DollarSign size={14}/>
                        +{order.delivery_fee || 15} RON
                      </div>
                    </div>); })}
                </div>);
            })}
            {historyDeliveries.length === 0 && (<div className="courier-mobile-empty">
                <lucide_react_1.History size={48}/>
                <p>"nicio livrare finalizata"</p>
              </div>)}
          </div>)}
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && selectedOrder && (<div className="signature-modal">
          <div className="signature-modal__content">
            <div className="signature-modal__header">
              <h3>📝 Semnătură Client</h3>
              <button onClick={function () { return setShowSignaturePad(false); }} className="btn-close-modal" title="Închide semnătură">
                <lucide_react_1.X size={20}/>
              </button>
            </div>

            <div className="signature-pad">
              <canvas ref={canvasRef} className="signature-canvas" width={300} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}/>
            </div>

            <div className="signature-modal__actions">
              <button onClick={clearSignature} className="btn-clear">"Șterge"</button>
              <button onClick={confirmDelivery} className="btn-confirm">"confirma livrarea"</button>
            </div>
          </div>
        </div>)}

      {/* Back to Admin Button */}
      <button onClick={function () { return window.location.href = '/dispatch'; }} className="courier-mobile-back" title='Înapoi la dispecerat'>
        <lucide_react_1.ArrowLeft size={18}/>
      </button>
    </div>);
};
exports.CourierMobileApp = CourierMobileApp;
