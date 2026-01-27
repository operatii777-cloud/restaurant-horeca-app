// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Cart Component
 * Displays cart items and totals, matching comanda_delivery.html design
 */

import { useDeliveryCart } from '../hooks/useDeliveryCart';

interface DeliveryCartProps {
  onCheckout: () => void;
}

export function DeliveryCart({ onCheckout }: DeliveryCartProps) {
//   const { t } = useTranslation();
  const { items, subtotal, deliveryFee, total, increaseQty, decreaseQty, removeItem } = useDeliveryCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[15px] p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">"cosul tau"</h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">🛒</div>
          <p>"cosul este gol"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[15px] p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-shopping-cart mr-2"></i>"cosul tau"</h3>

      {/* Cart Items */}
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
        {items.map((item, index) => {
          const itemPrice = item.price + item.customizations.reduce((sum, c) => sum + c.extra_price, 0);
          const itemTotal = itemPrice * item.quantity;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.name}</div>
                {item.customizations.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {item.customizations.map(c => c.option_name).join(', ')}
                  </div>
                )}
                <div className="text-sm font-bold text-[#FF6B35] mt-1">
                  {itemTotal.toFixed(2)} RON
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => decreaseQty(item.productId, item.customizations)}
                  className="w-8 h-8 rounded-full bg-[#ff6b35] text-white flex items-center justify-center hover:bg-[#e55a2b] transition-all"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item.productId, item.customizations)}
                  className="w-8 h-8 rounded-full bg-[#ff6b35] text-white flex items-center justify-center hover:bg-[#e55a2b] transition-all"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId, item.customizations)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Șterge"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span className="font-semibold">{subtotal.toFixed(2)} RON</span>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>"taxa livrare"</span>
            <span className="font-semibold">{deliveryFee.toFixed(2)} RON</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold text-[#FF6B35] pt-2 border-t border-gray-300">
          <span>Total:</span>
          <span>{total.toFixed(2)} RON</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        className="w-full mt-6 bg-gradient-to-r from-[#FF6B35] to-[#FF8C00] text-white py-4 rounded-[10px] font-bold text-lg transition-all hover:shadow-[0_8px_20px_rgba(255,107,53,0.4)] hover:-translate-y-1 active:scale-[0.98]"
      >
        <i className="fas fa-paper-plane mr-2"></i>
        Plasează Comanda
      </button>
    </div>
  );
}




