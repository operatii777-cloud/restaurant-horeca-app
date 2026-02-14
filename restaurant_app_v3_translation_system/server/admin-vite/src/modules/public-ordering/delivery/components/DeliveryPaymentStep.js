"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Payment Step (Step 2)
 * Payment method selection and order summary
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPaymentStep = DeliveryPaymentStep;
var react_1 = require("react");
function DeliveryPaymentStep(_a) {
    var cart = _a.cart, onBack = _a.onBack, onSubmit = _a.onSubmit;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(null), selectedMethod = _b[0], setSelectedMethod = _b[1];
    var handleSubmit = function () {
        if (!selectedMethod) {
            alert('Te rugăm să selectezi o metodă de plată');
            return;
        }
        onSubmit(selectedMethod);
    };
    return (<div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-credit-card mr-2 text-[#FF6B35]"></i>
        Metodă de plată
      </h3>

      {/* Payment Methods */}
      <div className="space-y-3">
        <button onClick={function () { return setSelectedMethod('cash'); }} className={"w-full p-4 border-2 rounded-lg text-left transition-all ".concat(selectedMethod === 'cash'
            ? 'border-[#FF6B35] bg-[#FFF5F0]'
            : 'border-gray-300 hover:border-gray-400')}>
          <div className="flex items-center">
            <div className={"w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ".concat(selectedMethod === 'cash' ? 'border-[#FF6B35]' : 'border-gray-400')}>
              {selectedMethod === 'cash' && (<div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">"cash la livrare"</div>
              <div className="text-sm text-gray-600">"platesti la primirea comenzii"</div>
            </div>
            <i className="fas fa-money-bill-wave text-2xl text-green-600"></i>
          </div>
        </button>

        <button onClick={function () { return setSelectedMethod('card'); }} className={"w-full p-4 border-2 rounded-lg text-left transition-all ".concat(selectedMethod === 'card'
            ? 'border-[#FF6B35] bg-[#FFF5F0]'
            : 'border-gray-300 hover:border-gray-400')}>
          <div className="flex items-center">
            <div className={"w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ".concat(selectedMethod === 'card' ? 'border-[#FF6B35]' : 'border-gray-400')}>
              {selectedMethod === 'card' && (<div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">Card online</div>
              <div className="text-sm text-gray-600">"plata securizata cu cardul"</div>
            </div>
            <i className="fas fa-credit-card text-2xl text-blue-600"></i>
          </div>
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3">"rezumat comanda"</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal produse:</span>
            <span className="font-semibold">{cart.subtotal.toFixed(2)} RON</span>
          </div>
          {'happyHourDiscount' in cart && cart.happyHourDiscount > 0 && (<div className="flex justify-between text-green-600">
              <span>
                <i className="fas fa-tag mr-1"></i>Happy Hour:
              </span>
              <span className="font-semibold">-{cart.happyHourDiscount.toFixed(2)} RON</span>
            </div>)}
          {cart.deliveryFee > 0 && (<div className="flex justify-between text-gray-700">
              <span>"taxa livrare"</span>
              <span className="font-semibold">{cart.deliveryFee.toFixed(2)} RON</span>
            </div>)}
          <div className="flex justify-between text-lg font-bold text-[#FF6B35] pt-2 border-t border-gray-300">
            <span>Total:</span>
            <span>{cart.total.toFixed(2)} RON</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button onClick={onBack} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all">
          <i className="fas fa-arrow-left mr-2"></i>"Înapoi"</button>
        <button onClick={handleSubmit} disabled={!selectedMethod} className={"flex-1 px-6 py-3 rounded-lg font-semibold transition-all ".concat(selectedMethod
            ? 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed')}>"plaseaza comanda"<i className="fas fa-paper-plane ml-2"></i>
        </button>
      </div>
    </div>);
}
