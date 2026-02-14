"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.6 - Branding Manager Page
 *
 * UI for managing tenant branding (logo, colors, fonts, theme).
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingPage = void 0;
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var BrandingPage = function () {
    var _a, _b, _c, _d, _e, _f;
    //   const { t } = useTranslation();
    var _g = (0, react_1.useState)(null), branding = _g[0], setBranding = _g[1];
    var _h = (0, react_1.useState)(true), isLoading = _h[0], setIsLoading = _h[1];
    var _j = (0, react_1.useState)(false), isSaving = _j[0], setIsSaving = _j[1];
    var _k = (0, react_1.useState)({}), formData = _k[0], setFormData = _k[1];
    (0, react_1.useEffect)(function () {
        fetchBranding();
    }, []);
    (0, react_1.useEffect)(function () {
        if (branding) {
            // Inject CSS variables for live preview
            injectThemeVariables(branding);
        }
    }, [branding]);
    var fetchBranding = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, brandingData, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/config/branding')];
                case 1:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        brandingData = response.data.branding;
                        setBranding(brandingData);
                        setFormData(brandingData);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error fetching branding:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var injectThemeVariables = function (config) {
        var root = document.documentElement;
        root.style.setProperty('--primary-color', config.primary_color || '#3B82F6');
        root.style.setProperty('--secondary-color', config.secondary_color || '#10B981');
        root.style.setProperty('--font-family', config.font_family || 'Inter, sans-serif');
        root.style.setProperty('--font-size-base', config.font_size_base || '16px');
        if (config.custom_css) {
            // Inject custom CSS
            var styleElement = document.getElementById('custom-branding-css');
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'custom-branding-css';
                document.head.appendChild(styleElement);
            }
            styleElement.textContent = config.custom_css;
        }
    };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, 3, 4]);
                    setIsSaving(true);
                    return [4 /*yield*/, httpClient_1.httpClient.put('/api/config/branding', formData)];
                case 1:
                    response = _d.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setBranding(response.data.branding);
                        setFormData(response.data.branding);
                        alert('Branding saved successfully!');
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _d.sent();
                    console.error('Error saving branding:', error_2);
                    alert(((_c = (_b = error_2.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Error saving branding');
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleLogoUpload = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var file, reader;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            reader = new FileReader();
            reader.onloadend = function () {
                var logoUrl = reader.result;
                setFormData(__assign(__assign({}, formData), { logo_url: logoUrl }));
            };
            reader.readAsDataURL(file);
            return [2 /*return*/];
        });
    }); };
    if (isLoading) {
        return (<div className="p-6">
        <div className="text-center">Loading branding configuration...</div>
      </div>);
    }
    if (!branding) {
        return (<div className="p-6">
        <div className="text-center">Error loading branding configuration</div>
      </div>);
    }
    return (<div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Branding & Theme</h1>
        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand Name</label>
            <input type="text" value={formData.brand_name || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { brand_name: e.target.value })); }} className="w-full border rounded px-3 py-2" placeholder="restaurant app"/>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (<img src={formData.logo_url} alt="Logo" className="h-16 w-auto object-contain border rounded p-2"/>)}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm"/>
            </div>
          </div>

          {/* Favicon Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Favicon</label>
            <div className="flex items-center gap-4">
              {formData.favicon_url && (<img src={formData.favicon_url} alt="Favicon" className="h-8 w-8 object-contain border rounded p-1"/>)}
              <input type="file" accept="image/*" onChange={function (e) {
            var _a;
            var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                var reader_1 = new FileReader();
                reader_1.onloadend = function () {
                    setFormData(__assign(__assign({}, formData), { favicon_url: reader_1.result }));
                };
                reader_1.readAsDataURL(file);
            }
        }} className="text-sm"/>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={((_a = formData.colors) === null || _a === void 0 ? void 0 : _a.primary) || formData.primary_color || '#3B82F6'} onChange={function (e) {
            var newColors = __assign(__assign({}, formData.colors), { primary: e.target.value });
            setFormData(__assign(__assign({}, formData), { colors: newColors, primary_color: e.target.value }));
        }} className="h-10 w-20 border rounded"/>
              <input type="text" value={((_b = formData.colors) === null || _b === void 0 ? void 0 : _b.primary) || formData.primary_color || '#3B82F6'} onChange={function (e) {
            var newColors = __assign(__assign({}, formData.colors), { primary: e.target.value });
            setFormData(__assign(__assign({}, formData), { colors: newColors, primary_color: e.target.value }));
        }} className="flex-1 border rounded px-3 py-2" placeholder="#3B82F6"/>
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={((_c = formData.colors) === null || _c === void 0 ? void 0 : _c.secondary) || formData.secondary_color || '#10B981'} onChange={function (e) {
            var newColors = __assign(__assign({}, formData.colors), { secondary: e.target.value });
            setFormData(__assign(__assign({}, formData), { colors: newColors, secondary_color: e.target.value }));
        }} className="h-10 w-20 border rounded"/>
              <input type="text" value={((_d = formData.colors) === null || _d === void 0 ? void 0 : _d.secondary) || formData.secondary_color || '#10B981'} onChange={function (e) {
            var newColors = __assign(__assign({}, formData.colors), { secondary: e.target.value });
            setFormData(__assign(__assign({}, formData), { colors: newColors, secondary_color: e.target.value }));
        }} className="flex-1 border rounded px-3 py-2" placeholder="#10B981"/>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select value={formData.font_family || 'Inter, sans-serif'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { font_family: e.target.value })); }} className="w-full border rounded px-3 py-2">
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">"open sans"</option>
              <option value="Lato, sans-serif">"Lato"</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Poppins, sans-serif">Poppins</option>
            </select>
          </div>

          {/* Font Size Base */}
          <div>
            <label className="block text-sm font-medium mb-2">Base Font Size</label>
            <input type="text" value={formData.font_size_base || '16px'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { font_size_base: e.target.value })); }} className="w-full border rounded px-3 py-2" placeholder="16px"/>
          </div>

          {/* Layout Type */}
          <div>
            <label className="block text-sm font-medium mb-2">"layout type"</label>
            <select value={formData.layout_type || "Default"} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { layout_type: e.target.value })); }} className="w-full border rounded px-3 py-2">
              <option value="default">"Default"</option>
              <option value="compact">Compact</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block text-sm font-medium mb-2">"custom css"</label>
            <textarea value={formData.custom_css || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { custom_css: e.target.value })); }} className="w-full border rounded px-3 py-2 font-mono text-sm" rows={8} placeholder="/* Custom CSS here */"/>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
          <div className="border rounded-lg p-6 bg-white shadow">
            <div className="space-y-4">
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b pb-4">
                {formData.logo_url && (<img src={formData.logo_url} alt="Logo" className="h-8 w-auto"/>)}
                <span className="text-lg font-semibold">{formData.brand_name || 'Restaurant App'}</span>
              </div>

              {/* Preview Buttons */}
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: ((_e = formData.colors) === null || _e === void 0 ? void 0 : _e.primary) || formData.primary_color || '#3B82F6' }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: ((_f = formData.colors) === null || _f === void 0 ? void 0 : _f.secondary) || formData.secondary_color || '#10B981' }}>
                  Secondary Button
                </button>
              </div>

              {/* Preview Text */}
              <div style={{ fontFamily: formData.font_family || 'Inter, sans-serif' }}>
                <p className="text-base mb-2">
                  This is a preview of how your branding will look. The font family, colors, and
                  styling will be applied throughout the application.
                </p>
                <p className="text-sm text-gray-600">
                  Font size: {formData.font_size_base || '16px'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
exports.BrandingPage = BrandingPage;
