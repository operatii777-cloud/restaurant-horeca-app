// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Checkout Wizard
 * Orchestrates the 3-step checkout process
 */

import type { DeliveryAddressData, DeliveryCartState, PaymentMethod, WizardStep } from "../../api/types";
import { useState } from 'react';

import { DeliveryAddressStep } from './DeliveryAddressStep';
import { DeliveryPaymentStep } from './DeliveryPaymentStep';
import { DeliveryConfirmationStep } from './DeliveryConfirmationStep';
import { useDeliveryOrderApi } from '../hooks/useDeliveryOrderApi';

interface DeliveryCheckoutWizardProps {
  isOpen: boolean;
  cart: DeliveryCartState;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function DeliveryCheckoutWizard({
  isOpen,
  cart,
  onClose,
  onOrderCreated
}: DeliveryCheckoutWizardProps) {
//   const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [addressData, setAddressData] = useState<DeliveryAddressData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createDeliveryOrder } = useDeliveryOrderApi();

  if (!isOpen) return null;

  const handleAddressSubmit = (data: DeliveryAddressData) => {
//   const { t } = useTranslation();
    setAddressData(data);
    setStep(2);
    setError(null);
  };

  const handlePaymentSubmit = async (method: PaymentMethod) => {
    if (!addressData) {
      setError('Datele de adresă lipsesc');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdOrderId = await createDeliveryOrder(cart, addressData, method);
      setOrderId(createdOrderId);
      setPaymentMethod(method);
      setStep(3);
      onOrderCreated();
    } catch (err: any) {
      setError(err.message || 'Eroare la trimiterea comenzii. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setAddressData(null);
    setPaymentMethod(null);
    setOrderId(null);
    setError(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-[20px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">"finalizare comanda"</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`flex items-center ${step >= 1 ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <i className="fas fa-check"></i> : '1'}
              </div>
              <span className="ml-2 text-sm font-semibold">Adresă</span>
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 2 ? <i className="fas fa-check"></i> : '2'}
              </div>
              <span className="ml-2 text-sm font-semibold">Plată</span>
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-semibold">Confirmare</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          {step === 1 && (
            <DeliveryAddressStep
              initialData={addressData || undefined}
              onSubmit={handleAddressSubmit}
              onBack={handleBack}
            />
          )}

          {step === 2 && (
            <DeliveryPaymentStep
              cart={cart}
              onBack={handleBack}
              onSubmit={handlePaymentSubmit}
            />
          )}

          {step === 3 && orderId && paymentMethod && (
            <DeliveryConfirmationStep
              orderId={orderId}
              paymentMethod={paymentMethod}
              total={cart.total}
              onClose={handleClose}
            />
          )}

          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-[20px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold">Se trimite comanda...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




