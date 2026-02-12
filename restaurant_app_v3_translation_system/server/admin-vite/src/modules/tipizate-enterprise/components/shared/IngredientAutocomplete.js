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
exports.IngredientAutocomplete = void 0;
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var IngredientAutocomplete = function (_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? 'Caută ingredient...' : _b, _c = _a.className, className = _c === void 0 ? '' : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d;
    var _e = (0, react_1.useState)([]), suggestions = _e[0], setSuggestions = _e[1];
    var _f = (0, react_1.useState)(false), showSuggestions = _f[0], setShowSuggestions = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(-1), selectedIndex = _h[0], setSelectedIndex = _h[1];
    var inputRef = (0, react_1.useRef)(null);
    var suggestionsRef = (0, react_1.useRef)(null);
    var timeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (value.length >= 2) {
            // Debounce search
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(function () {
                searchIngredients(value);
            }, 300);
        }
        else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        return function () {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value]);
    var searchIngredients = function (query) { return __awaiter(void 0, void 0, void 0, function () {
        var response, ingredients, filtered, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!query || query.length < 2) {
                        setSuggestions([]);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/ingredients')];
                case 2:
                    response = _b.sent();
                    ingredients = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    filtered = ingredients.filter(function (ing) {
                        var _a;
                        return ing.name.toLowerCase().includes(query.toLowerCase()) ||
                            ((_a = ing.name_en) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.toLowerCase()));
                    }).slice(0, 10);
                    setSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('Error searching ingredients:', err_1);
                    setSuggestions([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleInputChange = function (e) {
        var newValue = e.target.value;
        onChange(newValue);
        setSelectedIndex(-1);
    };
    var handleSelect = function (ingredient) {
        var _a;
        onChange(ingredient.name, ingredient);
        setShowSuggestions(false);
        setSuggestions([]);
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
    };
    var handleKeyDown = function (e) {
        var _a;
        if (!showSuggestions || suggestions.length === 0)
            return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(function (prev) { return (prev < suggestions.length - 1 ? prev + 1 : prev); });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(function (prev) { return (prev > 0 ? prev - 1 : -1); });
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                break;
        }
    };
    var handleBlur = function () {
        // Delay to allow click on suggestion
        setTimeout(function () {
            setShowSuggestions(false);
        }, 200);
    };
    return (<div className="relative">
      <input ref={inputRef} type="text" value={value} onChange={handleInputChange} onKeyDown={handleKeyDown} onFocus={function () {
            if (suggestions.length > 0) {
                setShowSuggestions(true);
            }
        }} onBlur={handleBlur} placeholder={placeholder} disabled={disabled} className={"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ".concat(className)} autoComplete="off"/>
      {loading && (<div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>)}
      {showSuggestions && suggestions.length > 0 && (<div ref={suggestionsRef} className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map(function (ingredient, index) { return (<div key={ingredient.id} onClick={function () { return handleSelect(ingredient); }} className={"px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ".concat(index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900' : '')}>
              <div className="font-medium text-gray-900 dark:text-white">
                {ingredient.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {ingredient.unit} • {ingredient.category || 'Fără categorie'}
                {ingredient.cost_per_unit && " \u2022 ".concat(ingredient.cost_per_unit.toFixed(2), " RON/").concat(ingredient.unit)}
              </div>
            </div>); })}
        </div>)}
    </div>);
};
exports.IngredientAutocomplete = IngredientAutocomplete;
