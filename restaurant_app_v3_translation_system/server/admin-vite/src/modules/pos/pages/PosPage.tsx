// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Main Page
 * 
 * Unified POS interface with mode switching (Tables, Fast Sale, Kiosk, Delivery).
 */

import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { usePosStore } from '../store/posStore';
import { PosModeSwitcher } from '../components/PosModeSwitcher';
import { PosTableSelector } from '../components/PosTableSelector';
import { PosCustomerPanel } from '../components/PosCustomerPanel';
import { PosOrderSummary } from '../components/PosOrderSummary';
import { PosProductGrid } from '../components/PosProductGrid';
import { PaymentSheet } from '../components/PaymentSheet';
import { usePosOrder } from '../hooks/usePosOrder';
import { usePos } from '../hooks/usePos';
import { useFiscalStatus } from '../../anaf/hooks/useFiscalStatus';
import { useOfflineMode } from '../offline/hooks/useOfflineMode';
import { OfflineBanner } from '../components/OfflineBanner';
import { saveOrder } from '../offline/db/indexeddb';
import './PosPage.css';

/**
 * POS Main Page Component
 */
export function PosPage() {
//   const { t } = useTranslation();
  const { currentMode, selectedTableId, currentOrderId, setTable, resetDraft } = usePosStore();
  const { createOrder, loading, error } = usePosOrder();
  const {
    orderTotal,
    remainingToPay,
    isOrderFullyPaid,
    hasItems,
    isReadyForFiscalization,
    isFiscalized,
    isStockConsumed,
    fiscalReceiptNumber,
    fiscalReceiptDate,
    fiscalizing,
    consumingStock,
    fiscalize,
  } = usePos();
  
  const [showPayment, setShowPayment] = useState(false);
  const [fiscalError, setFiscalError] = useState<string | null>(null);
  const [showFiscalError, setShowFiscalError] = useState(false);
  const [fiscalErrorType, setFiscalErrorType] = useState<'printer' | 'anaf' | "Nomenclator" | 'generic'>('generic');
  
  // FAZA 1.6 - Get fiscal status for current order
  const { data: fiscalStatus } = useFiscalStatus(currentOrderId || 0);
  
  // FAZA 3.B - Offline mode detection
  const { isOffline, syncStatus } = useOfflineMode();

  const handlePayment = async () => {
    if (!currentOrderId && hasItems) {
      // FAZA 3.D - Save to IndexedDB if offline
      if (isOffline) {
        try {
          const { draftItems, getDraftTotal } = usePosStore.getState();
          const order = {
            type: currentMode === "Delivery" ? "Delivery" : "Dine-In",
            items: JSON.stringify(draftItems),
            total: getDraftTotal(),
            table_number: selectedTableId?.toString(),
            status: "Pending:",
            timestamp: new Date().toISOString(),
            is_paid: false,
          };
          const localId = await saveOrder(order);
          console.log('[POS Offline] Order saved locally:', localId);
          // Don't show alert - just continue with payment flow
          setShowPayment(true);
        } catch (error) {
          console.error('Error saving offline order:', error);
          alert('Eroare la salvarea comenzii offline');
        }
        return;
      }
      
      // Create order first, then open payment
      createOrder().then((order) => {
        if (order) {
          setShowPayment(true);
        }
      });
    } else if (currentOrderId) {
      setShowPayment(true);
    }
  };

  const handlePaymentCompleted = () => {
    setShowPayment(false);
    // Payment completed - ready for fiscalization
  };

  const handleFiscalize = async () => {
    if (!currentOrderId) {
      setFiscalError('Nu există o comandă activă');
      setFiscalErrorType('generic');
      setShowFiscalError(true);
      return;
    }

    if (!isReadyForFiscalization) {
      setFiscalError('Comanda nu este plătită complet');
      setFiscalErrorType('generic');
      setShowFiscalError(true);
      return;
    }

    if (isFiscalized) {
      setFiscalError('Comanda este deja fiscalizată');
      setFiscalErrorType('generic');
      setShowFiscalError(true);
      return;
    }

    setFiscalError(null);
    setShowFiscalError(false);

    try {
      await fiscalize(currentOrderId);
      // Success - fiscal data is stored in posStore
    } catch (error: any) {
      console.error('PosPage Fiscalization error:', error);
      
      // Determine error type
      const errorMessage = error.error || error.message || 'Eroare la fiscalizare';
      const errorCode = error.code || '';
      
      if (errorCode.includes('PRINTER') || errorMessage.toLowerCase().includes('printer')) {
        setFiscalErrorType('printer');
        setFiscalError('Imprimanta fiscală este offline sau nu răspunde. Verifică conexiunea și încearcă din nou.');
      } else if (errorCode.includes('ANAF') || errorMessage.toLowerCase().includes('anaf')) {
        setFiscalErrorType('anaf');
        setFiscalError('Serviciul ANAF este indisponibil momentan. ÃŽncearcă din nou în câteva momente.');
      } else if (errorCode.includes('NOMENCLATOR') || errorMessage.toLowerCase().includes("Nomenclator") || errorMessage.toLowerCase().includes('plu')) {
        setFiscalErrorType("Nomenclator");
        setFiscalError('Lipsesc coduri fiscale pentru unele produse. Verifică nomenclatorul produselor.');
      } else {
        setFiscalErrorType('generic');
        setFiscalError(errorMessage);
      }
      
      setShowFiscalError(true);
    }
  };

  const handleCloseOrder = async () => {
    if (!currentOrderId) return;
    
    if (!isFiscalized) {
      if (!confirm('Comanda nu este fiscalizată. Ești sigur că vrei să închizi comanda?')) {
        return;
      }
    }
    
    // Free table
    if (selectedTableId) {
      setTable(null);
    }
    
    // Reset draft
    resetDraft();
    
    // Optionally mark order as completed in backend
    // await posApi.completeOrder(currentOrderId);
  };

  return (
    <div className="pos-page">
      <header className="pos-page-header">
        <h1 className="pos-page-title">POS Terminal</h1>
        <PosModeSwitcher />
      </header>

      {/* FAZA 3.B - Offline Banner */}
      <OfflineBanner isOffline={isOffline} syncStatus={syncStatus} />

      <div className="pos-page-content">
        {/* Left Sidebar - Table/Customer Selection */}
        <div className="pos-page-sidebar">
          {currentMode === 'TABLES' && <PosTableSelector />}
          <PosCustomerPanel />
        </div>

        {/* Main Area - Product Grid */}
        <div className="pos-page-main">
          <PosProductGrid />
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="pos-page-summary">
          <PosOrderSummary
            onPayment={handlePayment}
            onFinalize={handleFiscalize}
            isPaid={isOrderFullyPaid}
            isFiscalized={isFiscalized}
            fiscalReceiptNumber={fiscalReceiptNumber}
            fiscalReceiptDate={fiscalReceiptDate}
            isStockConsumed={isStockConsumed}
            fiscalizing={fiscalizing}
            consumingStock={consumingStock}
            isReadyForFiscalization={isReadyForFiscalization}
            onCloseOrder={handleCloseOrder}
            fiscalStatus={fiscalStatus?.data}
            orderId={currentOrderId}
          />
        </div>
      </div>

      {error && (
        <div className="pos-page-error">
          <strong>Eroare:</strong> {error}
        </div>
      )}

      {showPayment && (
        <PaymentSheet
          isOpen={showPayment}
          orderId={currentOrderId}
          onClose={() => setShowPayment(false)}
          onPaymentCompleted={handlePaymentCompleted}
        />
      )}

      {/* Fiscal Error Modal */}
      <Modal show={showFiscalError} onHide={() => setShowFiscalError(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {fiscalErrorType === 'printer' && 'âš ï¸ Imprimantă Offline'}
            {fiscalErrorType === 'anaf' && 'âš ï¸ ANAF Indisponibil'}
            {fiscalErrorType === "Nomenclator" && 'âš ï¸ Coduri Fiscale Lipsă'}
            {fiscalErrorType === 'generic' && 'âš ï¸ Eroare Fiscalizare'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            {fiscalError}
          </Alert>
          {fiscalErrorType === 'printer' && (
            <div className="mt-3">
              <p className="text-muted small">"Verifică:"</p>
              <ul className="text-muted small">
                <li>"conexiunea la imprimanta"</li>
                <li>Statusul imprimantei (hârtie, erori)</li>
                <li>"configurarea fiscala in setari"</li>
              </ul>
            </div>
          )}
          {fiscalErrorType === 'anaf' && (
            <div className="mt-3">
              <p className="text-muted small">"serviciul anaf poate fi temporar indisponibil ince"</p>
            </div>
          )}
          {fiscalErrorType === "Nomenclator" && (
            <div className="mt-3">
              <p className="text-muted small">
                Unele produse nu au coduri fiscale (PLU) configurate. Adaugă codurile în catalogul de produse.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFiscalError(false)}>"ÃŽnchide"</Button>
          {fiscalErrorType !== 'generic' && (
            <Button variant="primary" onClick={() => {
              setShowFiscalError(false);
              handleFiscalize();
            }}>"incearca din nou"</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}






