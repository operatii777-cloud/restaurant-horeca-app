import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import './BulkPriceModal.css';

type BulkPriceModalProps = {
  open: boolean;
  productCount: number;
  productIds: number[];
  onClose: () => void;
  onApplied: (updatedCount: number, newPrice?: number | null, newVatRate?: number | null) => void;
};

export function BulkPriceModal({ open, productCount, productIds, onClose, onApplied }: BulkPriceModalProps) {
  const { t } = useTranslation();
  const { mutate, loading, error, reset } = useApiMutation<{ message?: string; updated_count?: number }>();
  const [newPrice, setNewPrice] = useState<string>('');
  const [newVatRate, setNewVatRate] = useState<string>('');
  const [changedBy, setChangedBy] = useState<string>('admin');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      reset();
      setLocalError(null);
      setNewPrice('');
      setNewVatRate('');
      setChangedBy('admin');
    }
  }, [open, reset]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!productIds.length) {
      setLocalError(t('menu.bulkPrice.error'));
      return;
    }

    if (newPrice.trim() === '' && newVatRate.trim() === '') {
      setLocalError(t('menu.bulkPrice.error'));
      return;
    }

    const payload: Record<string, unknown> = {
      product_ids: productIds,
      changed_by: changedBy || 'admin',
    };

    if (newPrice.trim() !== '') {
      payload.new_price = Number(newPrice);
    }

    if (newVatRate.trim() !== '') {
      payload.new_vat_rate = Number(newVatRate);
    }

    const response = await mutate({
      url: '/api/catalog/products/bulk-price-change',
      method: 'put',
      data: payload,
    });

    if (response !== null) {
      const newPrice: number | undefined = payload.new_price !== undefined ? Number(payload.new_price) : undefined;
      const newVatRate: number | undefined = payload.new_vat_rate !== undefined ? Number(payload.new_vat_rate) : undefined;
      onApplied(response.updated_count ?? productIds.length, newPrice, newVatRate);
    }
  };

  return (
    <Modal
      isOpen={open}
      title={t('menu.bulkPrice.title')}
      description={`${t('menu.bulkPrice.subtitle')} ${productCount} ${t('menu.products.title').toLowerCase()}.`}
      size="md"
      onClose={onClose}
    >
      {localError ? <InlineAlert variant="warning" title={t('common.warning')} message={localError} /> : null}
      {error ? <InlineAlert variant="error" title={t('menu.messages.error')} message={error} /> : null}

      <form className="bulk-price-form" onSubmit={handleSubmit}>
        <label className="bulk-price-field">
          <span>{t('menu.productModal.priceRon')}</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={newPrice}
            onChange={(event) => setNewPrice(event.target.value)}
            placeholder={t('menu.pricing.basePrice')}
          />
        </label>

        <label className="bulk-price-field">
          <span>{t('menu.productModal.vatPercent')}</span>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={newVatRate}
            onChange={(event) => setNewVatRate(event.target.value)}
            placeholder={t('common.optional')}
          />
        </label>

        <label className="bulk-price-field">
          <span>{t('common.notes')}</span>
          <input
            type="text"
            value={changedBy}
            onChange={(event) => setChangedBy(event.target.value)}
            placeholder={t('common.notes')}
          />
        </label>

        <footer className="bulk-price-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>{t('actions.cancel')}</button>
          <button type="submit" className="menu-product-button menu-product-button--primary" disabled={loading}>
            {loading ? t('menu.bulkPrice.applyingChanges') : t('menu.bulkPrice.apply')}
          </button>
        </footer>
      </form>
    </Modal>
  );
}





