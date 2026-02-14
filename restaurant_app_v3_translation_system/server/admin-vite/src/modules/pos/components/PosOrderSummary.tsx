import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Order Summary Component
 * 
 * Displays order summary (items, totals) and action buttons.
 */

import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { usePosStore } from '../store/posStore';
import { useFiscalStatus } from '../../anaf/hooks/useFiscalStatus';
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
  orderId?: number | null; // FAZA 1.6 - Order ID for fiscal status
  onRetryFiscal?: () => void; // FAZA 1.6 - Retry fiscalization
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
  orderId,
}: PosOrderSummaryProps) {
  const { t } = useTranslation();
  const { draftItems, getDraftTotal, getDraftItemCount } = usePosStore();
  const total = getDraftTotal();
  const itemCount = getDraftItemCount();
  const queryClient = useQueryClient();

  // FAZA 1.6 - Get fiscal status
  const { data: fiscalStatusData } = useFiscalStatus(orderId || 0);
  const fiscalStatus = fiscalStatusData?.data || null;

  // FAZA 1.6 - Retry fiscal operations
  const retryFiscalOperation = async (orderId: number, operationType: 'PRINT' | 'ANAF_SUBMIT') => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/admin/pos/fiscal/retry/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operationType }),
    });
    if (!response.ok) {
      throw new Error(`Failed to retry fiscal operation: ${response.statusText}`);
    }
    return response.json();
  };

  const retryPrintMutation = useMutation({
    mutationFn: () => retryFiscalOperation(orderId!, 'PRINT'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal', 'status', orderId] });
    },
  });

  const retryAnafMutation = useMutation({
    mutationFn: () => retryFiscalOperation(orderId!, 'ANAF_SUBMIT'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal', 'status', orderId] });
      queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
    },
  });

  // Get fiscal badge based on status
  const getFiscalBadge = () => {
    if (!fiscalStatus) return null;

    const status = fiscalStatus.status;
    const color = fiscalStatus.color;
    const message = fiscalStatus.message;

    if (status === 'FISCALIZED') {
      return (
        <div className="pos-status-badge pos-status-badge--success">
          ✓ {message}
        </div>
      );
    } else if (status === 'SUBMITTED') {
      return (
        <div className="pos-status-badge pos-status-badge--warning">
          ⏳ {message}
        </div>
      );
    } else if (status === 'REJECTED' || status === 'PRINT_FAILED') {
      return (
        <div className="pos-status-badge pos-status-badge--danger">
          ❌ {message}
        </div>
      );
    } else if (status === 'PRINTED') {
      return (
        <div className="pos-status-badge pos-status-badge--info">
          📄 {message}
        </div>
      );
    }

    return null;
  };

  // Calculate VAT (simplified - 19% for now)
  const subtotal = total;
  const vat = subtotal * 0.19;
  const totalWithVat = subtotal + vat;

  return (
    <div className="pos-order-summary">
      <div className="pos-order-summary-header">
        <h3>{t('pos.order.summary')}</h3>
        <span className="pos-order-item-count">{itemCount} {t('pos.order.products')}</span>
      </div>

      <div className="pos-order-items">
        {draftItems.length === 0 ? (
          <p className="pos-order-empty">{t('pos.order.noProducts')}</p>
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
          <span>{t('pos.order.subtotal')}:</span>
          <span>{subtotal.toFixed(2)} RON</span>
        </div>
        <div className="pos-order-total-row">
          <span>{t('pos.order.vat')} (19%):</span>
          <span>{vat.toFixed(2)} RON</span>
        </div>
        <div className="pos-order-total-row pos-order-total-row--final">
          <span>{t('pos.order.total')}:</span>
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
            💳 {t('pos.payment.title')}
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
                <span className="spinner-border spinner-border-sm me-2" />{t('pos.fiscal.fiscalizing')}</>
            ) : (
              `✅ ${t('pos.fiscal.fiscalizeOrder')}`
            )}
          </button>
        )}

        {/* Stock Consumption Status */}
        {isFiscalized && !isStockConsumed && (
          <div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--fiscalized">
              ✓ {t('pos.fiscal.fiscalized')}
            </div>
            {consumingStock ? (
              <div className="pos-status-badge pos-status-badge--processing">
                <span className="spinner-border spinner-border-sm me-2" />
                {t('pos.fiscal.updatingStock')}
              </div>
            ) : (
              <div className="pos-status-badge pos-status-badge--warning">
                ⚠️ {t('pos.fiscal.stockBeingUpdated')}
              </div>
            )}
          </div>
        )}

        {/* FAZA 1.6 - Fiscal Status Badges */}
        {fiscalStatus && orderId && (
          <div className="pos-order-status">
            {getFiscalBadge()}
            
            {/* Retry buttons for failed operations */}
            {fiscalStatus.canRetry && (
              <div className="pos-fiscal-retry">
                {fiscalStatus.status === 'PRINT_FAILED' && (
                  <button
                    className="pos-action-btn pos-action-btn--retry btn-sm"
                    onClick={() => retryPrintMutation.mutate()}
                    disabled={retryPrintMutation.isPending}
                  >
                    {retryPrintMutation.isPending ? t('pos.fiscal.retrying') : `🔄 ${t('pos.fiscal.retryPrint')}`}
                  </button>
                )}
                {fiscalStatus.status === 'REJECTED' && (
                  <button
                    className="pos-action-btn pos-action-btn--retry btn-sm"
                    onClick={() => retryAnafMutation.mutate()}
                    disabled={retryAnafMutation.isPending}
                  >
                    {retryAnafMutation.isPending ? t('pos.fiscal.retrying') : `🔄 ${t('pos.fiscal.retryAnaf')}`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fiscalized & Stock Consumed */}
        {isFiscalized && isStockConsumed && (
          <div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--fiscalized">
              ✓ {t('pos.fiscal.fiscalized')}
            </div>
            <div className="pos-status-badge pos-status-badge--success">
              ✓ {t('pos.fiscal.stockUpdated')}
            </div>
            {fiscalReceiptNumber && (
              <div className="pos-fiscal-info">
                <div className="pos-fiscal-receipt">
                  <strong>{t('pos.fiscal.fiscalReceipt')}:</strong> {fiscalReceiptNumber}
                </div>
                {fiscalReceiptDate && (
                  <div className="pos-fiscal-date">
                    <strong>{t('pos.fiscal.date')}:</strong>' '
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
                🚪 {t('pos.order.closeAndReleaseTable')}
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




