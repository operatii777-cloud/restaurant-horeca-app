// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Comanda Delivery Page (React + Tailwind)
 * Main page for public delivery ordering, pixel-perfect with comanda_delivery.html
 */

import { useState } from 'react';
import { DeliveryProductsGrid } from '../components/DeliveryProductsGrid';
import { DeliveryCart } from '../components/DeliveryCart';
import { DeliveryCheckoutWizard } from '../components/DeliveryCheckoutWizard';
import { useDeliveryCart } from '../hooks/useDeliveryCart';

export function ComandaDeliveryPage() {
//   const { t } = useTranslation();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const cart = useDeliveryCart();

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Adaugă produse în coș pentru a plasa o comandă');
      return;
    }
    setIsWizardOpen(true);
  };

  const handleWizardClose = () => {
    setIsWizardOpen(false);
  };

  const handleOrderCreated = () => {
    // Cart will be cleared by the confirmation step
    cart.clearCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9]">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <i className="fas fa-utensils text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Trattoria</h1>
                <p className="text-sm text-gray-600">"comanda pentru livrare"</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/api/menu/pdf/food/ro"
                target="_blank"
                className="px-4 py-2 bg-[#20B2AA] text-white rounded-lg hover:bg-[#1a9a94] transition-all"
              >
                <i className="fas fa-book mr-2"></i>"meniu mancare"</a>
              <a
                href="/api/menu/pdf/drinks/ro"
                target="_blank"
                className="px-4 py-2 bg-[#20B2AA] text-white rounded-lg hover:bg-[#1a9a94] transition-all"
              >
                <i className="fas fa-wine-glass mr-2"></i>"meniu bauturi"</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid - Left Side (2 columns on large screens) */}
          <div className="lg:col-span-2">
            <DeliveryProductsGrid />
          </div>

          {/* Cart - Right Side (1 column on large screens) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <DeliveryCart onCheckout={handleCheckout} />
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Wizard Modal */}
      <DeliveryCheckoutWizard
        isOpen={isWizardOpen}
        cart={cart}
        onClose={handleWizardClose}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}




