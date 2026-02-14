"use strict";
/**
 * FAZA 2 - Delivery Order API Hook
 * Handles API calls for creating delivery orders
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
exports.useDeliveryOrderApi = useDeliveryOrderApi;
function useDeliveryOrderApi() {
    var _this = this;
    /**
     * Create delivery order
     */
    var createDeliveryOrder = function (cart, address, paymentMethod) { return __awaiter(_this, void 0, void 0, function () {
        var deliveryAddress, items, payload, response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deliveryAddress = "".concat(address.street, " ").concat(address.number);
                    if (address.block)
                        deliveryAddress += ", Bl. ".concat(address.block);
                    if (address.stairs)
                        deliveryAddress += ", Sc. ".concat(address.stairs);
                    if (address.floor)
                        deliveryAddress += ", Et. ".concat(address.floor);
                    if (address.apartment)
                        deliveryAddress += ", Ap. ".concat(address.apartment);
                    if (address.intercom)
                        deliveryAddress += ", Interfon: ".concat(address.intercom);
                    items = cart.items.map(function (item) { return ({
                        productId: item.productId,
                        quantity: item.quantity,
                        finalPrice: item.price + item.customizations.reduce(function (sum, custom) { return sum + custom.extra_price; }, 0),
                        isFree: item.isFree || false,
                        customizations: item.customizations.map(function (custom) { return ({
                            id: custom.id,
                            name: custom.option_name,
                            name_ro: custom.option_name_ro || custom.option_name,
                            name_en: custom.option_name_en || custom.option_name,
                            price_change: custom.extra_price
                        }); })
                    }); });
                    payload = {
                        customer_name: address.customerName,
                        customer_phone: address.customerPhone,
                        delivery_address: deliveryAddress,
                        items: items,
                        total: cart.total,
                        payment_method: paymentMethod,
                        platform: 'PUBLIC_QR',
                        pickup_type: 'PLATFORM_COURIER',
                        notes: address.notes || null,
                        type: "Delivery",
                        order_source: 'DELIVERY'
                    };
                    return [4 /*yield*/, fetch('/api/orders/delivery', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok || !result.success) {
                        throw new Error(result.error || 'Eroare la trimiterea comenzii');
                    }
                    return [2 /*return*/, result.order_id];
            }
        });
    }); };
    return {
        createDeliveryOrder: createDeliveryOrder
    };
}
