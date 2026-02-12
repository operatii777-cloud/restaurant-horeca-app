import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import type { MenuProduct } from '@/types/menu';
import './CloneProductModal.css';

type CloneProductModalProps = {
  open: boolean;
  product?: MenuProduct | null;
  onClose: () => void;
  onCloned: (payload: { newProductId: number | null; newName: string }) => void;
};

type CloneResponse = {
  success?: boolean;
  message?: string;
  new_product_id?: number;
};
  const { t } = useTranslation();
export function CloneProductModal({ open, product, onClose, onCloned }: CloneProductModalProps) {
//   const { t } = useTranslation();
  const { mutate, loading, error, reset } = useApiMutation<CloneResponse>();
  const [newName, setNewName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    reset();
    setLocalError(null);
    setNewName(product?.name ? `${product.name} (${t('actions.clone')})` : '');
  }, [open, product?.name, reset]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!product) {
      setLocalError(t('menu.cloneProduct.error'));
      return;
    }

    const trimmedName = newName.trim();
    if (trimmedName.length < 3) {
      setLocalError(t('validation.minLength', { min: 3 }));
      return;
    }

    const response = await mutate({
      url: `/api/catalog/products/${product.id}/clone`,
      method: 'post',
      data: {
        new_name: trimmedName,
      },
    });

    if (response !== null) {
      onCloned({
        newProductId: response.new_product_id ?? null,
        newName: trimmedName,
      });
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t('menu.cloneProduct.title')}
      description={
        product ? `${t('menu.cloneProduct.subtitle')} "${product.name}"` : t('menu.cloneProduct.subtitle')
      }
      size="md"
    >
      {localError ? <InlineAlert variant="warning" title={t('common.warning')} message={localError} /> : null}
      {error ? <InlineAlert variant="error" title={t('menu.messages.error')} message={error} /> : null}

      <form className="clone-product-form" onSubmit={handleSubmit}>
        <label className="clone-product-field">
          <span>{t('menu.cloneProduct.newProductName')}</span>
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder={t('menu.cloneProduct.newProductNamePlaceholder')}
            disabled={!product}
          />
        </label>

        <p className="clone-product-hint">
          După salvare, produsul clonat va prelua categoria, prețul, traducerile și rețeta (dacă există) ale produsului original.
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>{t('actions.cancel')}</button>

        <footer className="clone-product-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="menu-product-button menu-product-button--primary" disabled={loading || !product}>
            {loading ? t('menu.cloneProduct.cloning') : t('menu.cloneProduct.title')}
          </button>
        </footer>
      </form>
    </Modal>
  );
}





