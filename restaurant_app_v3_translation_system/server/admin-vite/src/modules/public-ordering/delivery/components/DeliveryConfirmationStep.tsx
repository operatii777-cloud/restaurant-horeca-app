// import { useTranslation } from '@/i18n/I18nContext';
import type { DeliveryCartState, PaymentMethod } from "../../api/types";

/**
 * FAZA 2 - Delivery Confirmation Step (Step 3)
 * Order confirmation with PDF download option
 */



interface DeliveryConfirmationStepProps {
  orderId: number;
  paymentMethod: PaymentMethod;
  total: number;
  onClose: () => void;
}

export function DeliveryConfirmationStep({
  orderId,
  paymentMethod,
  total,
  onClose
}: DeliveryConfirmationStepProps) {
//   const { t } = useTranslation();
  const handleDownloadPDF = () => {
//   const { t } = useTranslation();
    window.open(`/api/orders/${orderId}/receipt?lang=ro`, '_blank');
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <i className="fas fa-check-circle text-5xl text-green-600"></i>
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">"comanda ta a fost trimisa"</h3>
        <p className="text-gray-600">"vei primi livrarea in curand"</p>
      </div>

      {/* Order Details */}
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-gray-700 font-semibold">"numar comanda"</span>
            <span className="text-lg font-bold text-[#FF6B35]">#{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 font-semibold">Total:</span>
            <span className="text-lg font-bold text-[#FF6B35]">{total.toFixed(2)} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 font-semibold">"metoda de plata"</span>
            <span className="text-gray-800 font-semibold">
              {paymentMethod === 'cash' ? (
                <>
                  <i className="fas fa-money-bill-wave mr-1"></i>"cash la livrare"</>
              ) : (
                <>
                  <i className="fas fa-credit-card mr-1"></i>
                  Card online
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Estimated Time */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 text-blue-800">
          <i className="fas fa-clock"></i>
          <span className="font-semibold">Timp estimat: 30-40 minute</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={handleDownloadPDF}
          className="w-full px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all"
        >
          <i className="fas fa-file-pdf mr-2"></i>"salveaza dovada pdf"</button>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          <i className="fas fa-times mr-2"></i>"Închide"</button>
      </div>
    </div>
  );
}




