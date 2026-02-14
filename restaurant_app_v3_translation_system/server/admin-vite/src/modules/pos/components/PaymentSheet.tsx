import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Sheet Component (Main Payment Orchestrator)
 * 
 * Main component that ties everything together for payment processing
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Alert, Badge } from 'react-bootstrap';
import { usePosStore } from '../store/posStore';
import { posApi } from '../api/posApi';
import { PaymentMethodSelector, type PaymentMethod } from './PaymentMethodSelector';
import { PaymentAmountInput } from './PaymentAmountInput';
import { PaymentsList } from './PaymentsList';
import SplitBill from './SplitBill';
import './PaymentSheet.css';

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  onPaymentCompleted?: (orderAfterPayment?: any) => void;
}

export function PaymentSheet({
  isOpen,
  onClose,
  orderId,
  onPaymentCompleted,
}: PaymentSheetProps) {
  const { t } = useTranslation();
  const {
    payments,
    addPayment,
    removePayment,
    getTotal,
    getTotalPaid,
    getRemaining,
    currentOrderId,
    draftItems,
    splitBill,
    selectedGroupId,
    setSplitBill,
    clearSplitBill,
    setSelectedGroup,
    getGroupTotal,
    getGroupPaid,
    getGroupRemaining,
    areAllGroupsPaid,
  } = usePosStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>('cash');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);

  const orderTotal = getTotal();
  const totalPaid = getTotalPaid();
  const remaining = getRemaining();
  
  // Split Bill logic
  const isSplitMode = splitBill !== null;
  const activeGroupRemaining = isSplitMode && selectedGroupId
    ? getGroupRemaining(selectedGroupId)
    : remaining;
  const activeGroupTotal = isSplitMode && selectedGroupId
    ? getGroupTotal(selectedGroupId)
    : orderTotal;
  const activeGroupPaid = isSplitMode && selectedGroupId
    ? getGroupPaid(selectedGroupId)
    : totalPaid;
  
  // Use split bill remaining or regular remaining
  const displayRemaining = isSplitMode ? activeGroupRemaining : remaining;
  const displayTotal = isSplitMode ? activeGroupTotal : orderTotal;
  const displayPaid = isSplitMode ? activeGroupPaid : totalPaid;

  // Auto-set amount when method changes
  useEffect(() => {
    if (selectedMethod) {
      // Protocol și Degustare: plată 0 (cadou / pe protocol)
      if (selectedMethod === 'protocol' || selectedMethod === 'degustare') {
        setAmount('0');
      } else if (displayRemaining > 0 && !amount) {
        setAmount(displayRemaining.toFixed(2));
      }
    }
  }, [selectedMethod, displayRemaining]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setAmount('');
      if (displayRemaining > 0) {
        setAmount(displayRemaining.toFixed(2));
      }
    }
  }, [isOpen, displayRemaining]);

  const parseAmount = (): number => {
    if (!amount) return 0;
    const normalized = amount.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  };

  const handleAddPayment = async () => {
    setError(null);
    setIsAdding(true);

    try {
      // Validation
      if (!selectedMethod) {
        setError(t('pos.payment.selectMethod'));
        return;
      }

      const numericAmount = parseAmount();
      const isProtocolOrDegustare = selectedMethod === 'protocol' || selectedMethod === 'degustare';
      if (numericAmount < 0) {
        setError(t('pos.payment.amountCannotBeNegative'));
        return;
      }
      if (numericAmount <= 0 && !isProtocolOrDegustare) {
        setError(t('pos.payment.enterAmountGreaterThanZero'));
        return;
      }

      // Validate against active group remaining or total remaining
      const maxAmount = isSplitMode && selectedGroupId
        ? getGroupRemaining(selectedGroupId)
        : remaining;
      
      if (numericAmount > maxAmount) {
        setError(t('pos.payment.amountExceedsRemaining', { remaining: maxAmount.toFixed(2) }));
        return;
      }
      
      // Check if group is already paid (for split mode)
      if (isSplitMode && selectedGroupId) {
        const groupRemaining = getGroupRemaining(selectedGroupId);
        if (groupRemaining <= 0.01) {
          setError(t('pos.payment.groupAlreadyPaid'));
          return;
        }
      }

      if (!orderId && !currentOrderId) {
        setError(t('pos.payment.noActiveOrder'));
        return;
      }

      const activeOrderId = orderId || currentOrderId;
      if (!activeOrderId) {
        setError(t('pos.payment.noActiveOrder'));
        return;
      }

      // Create payment object
      const payment = {
        id: `payment-${Date.now()}-${Math.random()}`,
        type: selectedMethod,
        amount: numericAmount,
        timestamp: new Date(),
        reference: undefined as string | undefined,
        groupId: isSplitMode && selectedGroupId ? selectedGroupId : undefined,
      };

      // Add payment to store (optimistic update)
      addPayment(payment);

      // Send payment to backend
      try {
        setLoading(true);
        await posApi.sendPayment(activeOrderId, {
          method: selectedMethod,
          amount: numericAmount,
          metadata: payment.reference ? { reference: payment.reference } : undefined,
        });

        // Clear amount input
        setAmount('');
        if (remaining - numericAmount > 0) {
          setAmount((remaining - numericAmount).toFixed(2));
        }

        // Check if fully paid
        if (isSplitMode && selectedGroupId) {
          const newGroupRemaining = getGroupRemaining(selectedGroupId) - numericAmount;
          if (newGroupRemaining <= 0.01) {
            // Group is paid, check if all groups are paid
            if (areAllGroupsPaid()) {
              if (onPaymentCompleted) {
                onPaymentCompleted();
              }
            }
          }
        } else {
          const newRemaining = remaining - numericAmount;
          if (newRemaining <= 0.01) {
            // Payment completed
            if (onPaymentCompleted) {
              onPaymentCompleted();
            }
          }
        }
      } catch (apiError: any) {
        // Rollback optimistic update
        removePayment(payment.id);
        throw apiError;
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      console.error('PaymentSheet Error adding payment:', err);
      setError(err.response?.data?.error || err.message || t('pos.payment.errorAddingPayment'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemovePayment = async (paymentId: string) => {
    try {
      setLoading(true);
      removePayment(paymentId);
      // Optionally sync with backend
      // await posApi.removePayment(orderId, paymentId);
    } catch (err: any) {
      console.error('PaymentSheet Error removing payment:', err);
      setError(err.message || t('pos.payment.errorRemovingPayment'));
    } finally {
      setLoading(false);
    }
  };

  const handleExact = () => {
    if (remaining > 0) {
      setAmount(remaining.toFixed(2));
    }
  };

  const handleClear = () => {
    setAmount('');
  };

  const isFullyPaid = isSplitMode ? areAllGroupsPaid() : remaining <= 0.01;
  const isProtocolOrDegustare = selectedMethod === 'protocol' || selectedMethod === 'degustare';
  // Pentru protocol/degustare permitem plată 0 (comandă cadou); altfel rămas > 0
  const canAddPayment = !loading && !isAdding && selectedMethod && (displayRemaining > 0 || (isProtocolOrDegustare && displayRemaining >= 0));
  
  // Convert draftItems to SplitBill format
  const splitBillItems = useMemo(() => {
    return draftItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.total,
    }));
  }, [draftItems]);
  
  const handleSplitBillChange = (splitPayload: any) => {
    setSplitBill(splitPayload);
  };
  
  const handleSplitBillApply = (splitPayload: any) => {
    setSplitBill(splitPayload);
    setShowSplitBill(false);
    // Select first group
    if (splitPayload.groups.length > 0) {
      setSelectedGroup(splitPayload.groups[0].id);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('pos.payment.orderPayment')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Split Bill Button */}
        {!isSplitMode && (
          <div className="payment-sheet-split-section">
            <Button
              variant="outline-primary"
              onClick={() => setShowSplitBill(true)}
              disabled={loading || isAdding}
              className="w-100 mb-3"
            >
              <i className="fas fa-users me-2"></i>
              {t('pos.payment.split')}
            </Button>
          </div>
        )}

        {/* Split Bill Groups Selector */}
        {isSplitMode && splitBill && (
          <div className="payment-sheet-groups">
            <label className="payment-groups-label">{t('pos.payment.selectGroupForPayment')}</label>
            <div className="payment-groups-list">
              {splitBill.groups.map((group) => {
                const groupPaid = getGroupPaid(group.id);
                const groupRemaining = getGroupRemaining(group.id);
                const isSelected = selectedGroupId === group.id;
                const isPaid = groupRemaining <= 0.01;
                
                return (
                  <Button
                    key={group.id}
                    variant={isSelected ? 'primary' : 'outline-primary'}
                    className={`payment-group-btn ${isPaid ? 'paid' : ''}`}
                    onClick={() => !isPaid && setSelectedGroup(group.id)}
                    disabled={isPaid}
                  >
                    <div className="payment-group-info">
                      <div className="payment-group-label">{group.label}</div>
                      <div className="payment-group-amounts">
                        <span className="payment-group-total">{group.total.toFixed(2)} RON</span>
                        {isPaid ? (
                          <Badge bg="success">{t('pos.payment.paid')}</Badge>
                        ) : (
                          <span className="payment-group-remaining">
                            {t('pos.payment.remaining')}: {groupRemaining.toFixed(2)} RON
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="payment-sheet-summary">
          <div className="payment-summary-row">
            <span>{isSplitMode ? t('pos.payment.selectedGroupTotal') : t('pos.payment.orderTotal')}:</span>
            <strong>{displayTotal.toFixed(2)} RON</strong>
          </div>
          <div className="payment-summary-row">
            <span>{t('pos.payment.paidAmount')}:</span>
            <strong className="text-success">{displayPaid.toFixed(2)} RON</strong>
          </div>
          <div className="payment-summary-row payment-summary-row--remaining">
            <span>{t('pos.payment.remainingToCollect')}</span>
            <strong className={displayRemaining > 0 ? 'text-danger' : 'text-success'}>
              {displayRemaining.toFixed(2)} RON
            </strong>
          </div>
        </div>

        {isFullyPaid ? (
          <Alert variant="success" className="mt-3">
            <i className="fas fa-check-circle me-2"></i>
            <strong>{t('pos.payment.orderFullyPaid')}</strong>
            <p className="mb-0 mt-2">{t('pos.payment.canProceedToFiscalization')}</p>
          </Alert>
        ) : (
          <>
            {/* Payment Method Selector */}
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onChange={setSelectedMethod}
              disabled={loading || isAdding}
            />

            {/* Payment Amount Input */}
            <PaymentAmountInput
              value={amount}
              remainingAmount={displayRemaining}
              onChange={setAmount}
              onExact={handleExact}
              onClear={handleClear}
              disabled={loading || isAdding || (isSplitMode && !selectedGroupId)}
            />

            {/* Add Payment Button */}
            <div className="payment-sheet-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddPayment}
                disabled={!canAddPayment || parseAmount() <= 0 || parseAmount() > displayRemaining || (isSplitMode && !selectedGroupId)}
                className="w-100"
              >
                {isAdding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t('pos.payment.processing')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    {t('pos.payment.addPayment')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Payments List */}
        {payments.length > 0 && (
          <PaymentsList
            payments={isSplitMode && selectedGroupId
              ? payments.filter((p) => p.groupId === selectedGroupId)
              : payments}
            onRemove={handleRemovePayment}
            disabled={loading || isAdding}
          />
        )}
      </Modal.Body>
      
      {/* Split Bill Modal */}
      <Modal show={showSplitBill} onHide={() => setShowSplitBill(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('pos.payment.split')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SplitBill
            total={orderTotal}
            items={splitBillItems}
            onSplit={handleSplitBillApply}
            onSplitChange={handleSplitBillChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSplitBill(false)}>
            {t('pos.payment.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (splitBill) {
                handleSplitBillApply(splitBill);
              }
            }}
          >
            {t('pos.payment.applySplit')}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading || isAdding}>
          {isFullyPaid ? t('pos.payment.close') : t('pos.payment.cancel')}
        </Button>
        {isFullyPaid && onPaymentCompleted && (
          <Button
            variant="success"
            onClick={() => {
              onPaymentCompleted();
              onClose();
            }}
          >
            {t('pos.payment.continueToFiscalization')}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}





