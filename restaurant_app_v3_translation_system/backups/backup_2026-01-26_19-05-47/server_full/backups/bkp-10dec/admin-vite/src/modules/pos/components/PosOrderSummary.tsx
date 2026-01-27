/**
 * PHASE S12 - POS Order Summary Component
 * 
 * Displays order summary (items, totals) and action buttons.
 */

import React from 'react';
import { usePosStore } from '../store/posStore';
import './PosOrderSummary.css';

interface PosOrderSummaryProps {
  onPayment?: () => void;
  onFinalize?: () => void;
  isPaid?: boolean;
  isFiscalized?: boolean;
  efacturaStatus?: string | null;
  fiscalReceiptNumber?: string | null;
  fiscalReceiptDate?: string | null;
  isStockConsumed?: boolean;
  fiscalizing?: boolean;
  consumingStock?: boolean;
  isReadyForFiscalization?: boolean;
  onCloseOrder?: () => void;
}

export function PosOrderSummary({
  onPayment,
  onFinalize,
  isPaid = false,
  isFiscalized = false,
  efacturaStatus,
  fiscalReceiptNumber,
  fiscalReceiptDate,
  isStockConsumed = false,
  fiscalizing = false,
  consumingStock = false,
  isReadyForFiscalization = false,
  onCloseOrder,
}: PosOrderSummaryProps) {
  const { draftItems, getDraftTotal, getDraftItemCount } = usePosStore();
  const total = getDraftTotal();
  const itemCount = getDraftItemCount();

  // Calculate VAT (simplified - 19% for now)
  const subtotal = total;
  const vat = subtotal * 0.19;
  const totalWithVat = subtotal + vat;

  return (
    <div className="pos-order-summary">
      <div className="pos-order-summary-header">
        <h3>Sumar Comandă</h3>
        <span className="pos-order-item-count">{itemCount} produse</span>
      </div>

      <div className="pos-order-items">
        {draftItems.length === 0 ? (
          <p className="pos-order-empty">Nu există produse în comandă</p>
        ) : (
          draftItems.map((item) => (
            <div key={item.productId} className="pos-order-item">
              <div className="pos-order-item-info">
                <span className="pos-order-item-name">{item.name}</span>
                {item.notes && (
                  <span className="pos-order-item-notes">{item.notes}</span>
                )}
              </div>
              <div className="pos-order-item-qty">{item.qty}×</div>
              <div className="pos-order-item-price">
                {item.total.toFixed(2)} RON
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pos-order-totals">
        <div className="pos-order-total-row">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(2)} RON</span>
        </div>
        <div className="pos-order-total-row">
          <span>TVA (19%):</span>
          <span>{vat.toFixed(2)} RON</span>
        </div>
        <div className="pos-order-total-row pos-order-total-row--final">
          <span>Total:</span>
          <span>{totalWithVat.toFixed(2)} RON</span>
        </div>
      </div>

      <div className="pos-order-actions">
        {/* Payment Button */}
        {!isPaid && !isFiscalized && (
          <button
            className="pos-action-btn pos-action-btn--payment"
            onClick={onPayment}
            disabled={draftItems.length === 0 || fiscalizing || consumingStock}
          >
            💳 Plată
          </button>
        )}

        {/* Fiscalize Button */}
        {isPaid && !isFiscalized && isReadyForFiscalization && (
          <button
            className="pos-action-btn pos-action-btn--finalize"
            onClick={onFinalize}
            disabled={fiscalizing || consumingStock}
          >
            {fiscalizing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Se fiscalizează...
              </>
            ) : (
              '✅ Fiscalizează Comandă'
            )}
          </button>
        )}

        {/* Stock Consumption Status */}
        {isFiscalized && !isStockConsumed && (
          <div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--fiscalized">
              ✓ Fiscalizat
            </div>
            {consumingStock ? (
              <div className="pos-status-badge pos-status-badge--processing">
                <span className="spinner-border spinner-border-sm me-2" />
                Actualizare stoc...
              </div>
            ) : (
              <div className="pos-status-badge pos-status-badge--warning">
                ⚠️ Se actualizează stocul...
              </div>
            )}
          </div>
        )}

        {/* Fiscalized & Stock Consumed */}
        {isFiscalized && isStockConsumed && (
          <div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--fiscalized">
              ✓ Fiscalizat
            </div>
            <div className="pos-status-badge pos-status-badge--success">
              ✓ Stoc actualizat
            </div>
            {fiscalReceiptNumber && (
              <div className="pos-fiscal-info">
                <div className="pos-fiscal-receipt">
                  <strong>Bon Fiscal:</strong> {fiscalReceiptNumber}
                </div>
                {fiscalReceiptDate && (
                  <div className="pos-fiscal-date">
                    <strong>Data:</strong>{' '}
                    {new Date(fiscalReceiptDate).toLocaleString('ro-RO')}
                  </div>
                )}
              </div>
            )}
            {onCloseOrder && (
              <button
                className="pos-action-btn pos-action-btn--close"
                onClick={onCloseOrder}
              >
                🚪 Închide Comandă & Eliberează Masa
              </button>
            )}
          </div>
        )}

        {/* Not Ready for Payment */}
        {!isPaid && !isReadyForFiscalization && draftItems.length > 0 && (
          <div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--warning">
              ⚠️ Comanda nu este plătită complet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

