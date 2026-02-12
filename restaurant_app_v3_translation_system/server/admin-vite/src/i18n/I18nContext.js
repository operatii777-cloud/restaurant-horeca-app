"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTranslation = exports.I18nProvider = exports.I18nContext = void 0;
var react_1 = require("react");
var translations_1 = require("./translations");
exports.I18nContext = (0, react_1.createContext)(undefined);
var I18nProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(function () {
        // Load from localStorage or default to 'ro'
        var saved = localStorage.getItem('adminLanguage');
        return (saved === 'en' || saved === 'ro') ? saved : 'ro';
    }), language = _b[0], setLanguageState = _b[1];
    var setLanguage = function (lang) {
        setLanguageState(lang);
        localStorage.setItem('adminLanguage', lang);
    };
    var t = function (key) {
        var keys = key.split('.');
        var value = translations_1.translations[language];
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            if (value && typeof value === 'object') {
                value = value[k];
            }
            else {
                console.warn("[I18N] Missing translation key: ".concat(key));
                return key; // Return key for missing translations - developers should fix dependencies
            }
        }
        return typeof value === 'string' ? value : key; // Return key for non-string values
    };
    return (<exports.I18nContext.Provider value={{ language: language, setLanguage: setLanguage, t: t }}>
      {children}
    </exports.I18nContext.Provider>);
};
exports.I18nProvider = I18nProvider;
var useTranslation = function () {
    var context = (0, react_1.useContext)(exports.I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within I18nProvider');
    }
    return context;
};
exports.useTranslation = useTranslation;
