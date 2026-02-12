"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Products Grid
 * Displays products in a grid layout, matching comanda_delivery.html design
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
exports.DeliveryProductsGrid = DeliveryProductsGrid;
var react_1 = require("react");
var useDeliveryCart_1 = require("../hooks/useDeliveryCart");
var httpClient_1 = require("@/shared/api/httpClient");
var useDailyOffer_1 = require("../../../kiosk/hooks/useDailyOffer");
var useDailyMenu_1 = require("../../../kiosk/hooks/useDailyMenu");
function DeliveryProductsGrid() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)('all'), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var _d = (0, react_1.useState)(''), searchQuery = _d[0], setSearchQuery = _d[1];
    var addItem = (0, useDeliveryCart_1.useDeliveryCart)().addItem;
    var _e = (0, useDailyOffer_1.useDailyOffer)(), dailyOffer = _e.dailyOffer, checkEligibility = _e.checkEligibility;
    var dailyMenu = (0, useDailyMenu_1.useDailyMenu)().dailyMenu;
    (0, react_1.useEffect)(function () {
        loadProducts();
    }, []);
    var loadProducts = function () { return __awaiter(_this, void 0, void 0, function () {
        var lang, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    lang = 'ro';
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/menu/all?lang=\"Lang\"")];
                case 1:
                    response = _a.sent();
                    if (response.data && Array.isArray(response.data)) {
                        setProducts(response.data);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading products:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Get unique categories
    var categories = Array.from(new Set(products.map(function (p) { return p.category; }))).filter(Boolean);
    // Filter products
    var filteredProducts = products.filter(function (product) {
        var _a;
        var matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        var matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((_a = product.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    var handleAddToCart = function (product) {
        addItem(product, 1, []);
    };
    if (loading) {
        return (<div className="flex items-center justify-center py-20">
        <div className="text-lg text-gray-600">"se incarca produsele"</div>
      </div>);
    }
    // Handle Daily Menu add to cart
    var handleAddDailyMenuToCart = function () {
        if (dailyMenu) {
            // Add soup
            if (dailyMenu.soup) {
                addItem({
                    id: dailyMenu.soup.id,
                    name: dailyMenu.soup.name,
                    price: dailyMenu.soup.price,
                    category: dailyMenu.soup.category,
                    image_url: dailyMenu.soup.image_url,
                    description: dailyMenu.soup.description
                }, 1, []);
            }
            // Add main course
            if (dailyMenu.mainCourse) {
                addItem({
                    id: dailyMenu.mainCourse.id,
                    name: dailyMenu.mainCourse.name,
                    price: dailyMenu.mainCourse.price,
                    category: dailyMenu.mainCourse.category,
                    image_url: dailyMenu.mainCourse.image_url,
                    description: dailyMenu.mainCourse.description
                }, 1, []);
            }
        }
    };
    return (<div className="w-full">
      {/* Daily Offer Banner */}
      {dailyOffer && dailyOffer.is_active && (<div className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                <i className="fas fa-star mr-2"></i>
                {dailyOffer.title}
              </h3>
              <p className="text-white text-sm">{dailyOffer.description}</p>
            </div>
            <div className="text-3xl">🎁</div>
          </div>
        </div>)}

      {/* Daily Menu Banner */}
      {dailyMenu && (<div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                <i className="fas fa-utensils mr-2"></i>
                Meniul Zilei
              </h3>
              <div className="text-white text-sm space-y-1">
                {dailyMenu.soup && (<div>🍲 {dailyMenu.soup.name} - {dailyMenu.soup.price.toFixed(2)} RON</div>)}
                {dailyMenu.mainCourse && (<div>🍽️ {dailyMenu.mainCourse.name} - {dailyMenu.mainCourse.price.toFixed(2)} RON</div>)}
                {dailyMenu.discount > 0 && (<div className="font-bold mt-2">
                    💰 Discount: {dailyMenu.discount}% la meniul complet!
                  </div>)}
              </div>
            </div>
            <button onClick={handleAddDailyMenuToCart} className="ml-4 px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl">
              <i className="fas fa-cart-plus mr-2"></i>"adauga meniu"</button>
          </div>
        </div>)}

      {/* Search and Category Filter */}
      <div className="mb-6 space-y-4">
        <input type="text" placeholder="cauta produse" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"/>
        
        {/* Category buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={function () { return setSelectedCategory('all'); }} className={"px-4 py-2 rounded-full whitespace-nowrap transition-all ".concat(selectedCategory === 'all'
            ? 'bg-[#FF6347] text-white font-bold'
            : 'bg-[#FF8C00] text-white hover:bg-[#FF6347]')}>"Toate"</button>
          {categories.map(function (category) { return (<button key={category} onClick={function () { return setSelectedCategory(category); }} className={"px-4 py-2 rounded-full whitespace-nowrap transition-all ".concat(selectedCategory === category
                ? 'bg-[#FF6347] text-white font-bold'
                : 'bg-[#FF8C00] text-white hover:bg-[#FF6347]')}>
              {category}
            </button>); })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(function (product) { return (<div key={product.id} className="bg-white rounded-[15px] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_4px_15px_rgba(32,178,170,0.3)]">
            {/* Product Image */}
            <div className="w-full h-[120px] bg-gray-100 rounded-[10px] mb-4 flex items-center justify-center overflow-hidden">
              {product.image_url ? (<img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-[10px]"/>) : (<span className="text-5xl">🤗</span>)}
            </div>

            {/* Product Info */}
            <div className="mb-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{product.name}</h3>
                <div className="text-lg font-bold text-[#20B2AA] ml-2">
                  {product.price.toFixed(2)} RON
                </div>
              </div>
              {product.description && (<p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>)}
            </div>

            {/* Add to Cart Button */}
            <button onClick={function () { return handleAddToCart(product); }} className="w-full bg-[#ff6b35] text-white border-2 border-[#ff6b35] rounded-lg py-2.5 px-4 font-bold transition-all hover:bg-[#e55a2b] hover:border-[#e55a2b] hover:shadow-[0_8px_20px_rgba(229,90,43,0.4)] hover:-translate-y-0.5 active:scale-[0.98]">
              <i className="fas fa-cart-plus mr-2"></i>"adauga in cos"</button>
          </div>); })}
      </div>

      {filteredProducts.length === 0 && (<div className="text-center py-20 text-gray-600">"nu s au gasit produse"</div>)}
    </div>);
}
