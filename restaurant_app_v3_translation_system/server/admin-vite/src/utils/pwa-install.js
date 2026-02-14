"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PWA Install Utility
 * Funcții pentru gestionarea instalării PWA
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
exports.isInstallPromptAvailable = exports.isPWAInstalled = exports.showInstallPrompt = exports.initPWAInstall = void 0;
var deferredPrompt = null;
var initPWAInstall = function () {
    window.addEventListener('beforeinstallprompt', function (e) {
        // Previne afișarea automată a prompt-ului
        e.preventDefault();
        deferredPrompt = e;
        console.log('📱 PWA install prompt available');
        // Emite un event custom pentru a notifica UI-ul
        window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });
    window.addEventListener('appinstalled', function () {
        console.log('✅ PWA installed successfully');
        deferredPrompt = null;
        window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
};
exports.initPWAInstall = initPWAInstall;
/**
 * Afișează prompt-ul de instalare PWA
 * @returns Promise<boolean> - true dacă utilizatorul a acceptat instalarea
 */
var showInstallPrompt = function () { return __awaiter(void 0, void 0, void 0, function () {
    var outcome, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!deferredPrompt) {
                    console.warn('⚠️ PWA install prompt not available');
                    return [2 /*return*/, false];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                // Afișează prompt-ul
                deferredPrompt.prompt();
                return [4 /*yield*/, deferredPrompt.userChoice];
            case 2:
                outcome = (_a.sent()).outcome;
                console.log("User response to install prompt: \"Outcome\"");
                // Șterge prompt-ul folosit
                deferredPrompt = null;
                return [2 /*return*/, outcome === 'accepted'];
            case 3:
                error_1 = _a.sent();
                console.error('Error showing install prompt:', error_1);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.showInstallPrompt = showInstallPrompt;
/**
 * Verifică dacă aplicația este instalată ca PWA
 */
var isPWAInstalled = function () {
    // Verifică dacă rulează în standalone mode (instalat)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    // Verifică dacă este în fullscreen mode (iOS)
    if (window.navigator.standalone === true) {
        return true;
    }
    return false;
};
exports.isPWAInstalled = isPWAInstalled;
/**
 * Verifică dacă prompt-ul de instalare este disponibil
 */
var isInstallPromptAvailable = function () {
    return deferredPrompt !== null;
};
exports.isInstallPromptAvailable = isInstallPromptAvailable;
