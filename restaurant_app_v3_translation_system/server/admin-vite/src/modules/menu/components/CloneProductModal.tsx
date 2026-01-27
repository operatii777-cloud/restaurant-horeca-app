// import { useTranslation } from '@/i18n/I18nContext';
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
    setNewName(product?.name ? `${product.name} (Copie)` : '');
  }, [open, product?.name, reset]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!product) {
      setLocalError('Selectează mai întâi un produs din tabel.');
      return;
    }

    const trimmedName = newName.trim();
    if (trimmedName.length < 3) {
      setLocalError('Noul nume trebuie să conțină cel puțin 3 caractere.');
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
      title="cloneaza produs"
      description={
        product ? `Creezi un duplicat al produsului “${product.name}”. Poți ajusta numele înainte de salvare.` : 'Selectează un produs pentru a crea un duplicat.'
      }
      size="md"
    >
      {localError ? <InlineAlert variant="warning" title="verifica datele" message={localError} /> : null}
      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <form className="clone-product-form" onSubmit={handleSubmit}>
        <label className="clone-product-field">
          <span>"nume produs clonat"</span>
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Ex: Pizza Quattro (Copie)"
            disabled={!product}
          />
        </label>

        <p className="clone-product-hint">
          După salvare, produsul clonat va prelua categoria, prețul, traducerile și rețeta (dacă există) ale produsului original.
        </p>

        <footer className="clone-product-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="menu-product-button menu-product-button--primary" disabled={loading || !product}>
            {loading ? 'Se clonează…' : 'Clonează produsul'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}





