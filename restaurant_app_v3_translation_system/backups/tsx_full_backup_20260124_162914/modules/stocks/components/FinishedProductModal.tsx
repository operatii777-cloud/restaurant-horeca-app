// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { InlineAlert } from '@/shared/components/InlineAlert';
import type { FinishedProductStock } from '@/types/stocks';
import './FinishedProductModal.css';

interface CatalogProductLight {
  id: number;
  name: string;
  category?: string;
  price?: number;
}

interface FinishedProductModalProps {
  open: boolean;
  productId?: number | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export const FinishedProductModal = ({ open, productId = null, onClose, onSaved }: FinishedProductModalProps) => {
//   const { t } = useTranslation();
  const isEdit = productId !== null;
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductLight[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(productId);
  const [formValues, setFormValues] = useState({
    current_stock: 0,
    min_stock: 5,
    max_stock: 100,
    is_auto_managed: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetState = useCallback(() => {
    setCatalogProducts([]);
    setSelectedProductId(productId ?? null);
    setFormValues({ current_stock: 0, min_stock: 5, max_stock: 100, is_auto_managed: true });
    setFeedback(null);
    setLoading(false);
    setSaving(false);
  }, [productId]);

  const handleClose = useCallback(() => {
    if (saving) return;
    resetState();
    onClose();
  }, [onClose, resetState, saving]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const fetchCatalogProducts = async () => {
      try {
        const response = await httpClient.get('/api/catalog/products');
        const payload = Array.isArray(response.data?.products)
          ? (response.data.products as CatalogProductLight[])
          : Array.isArray(response.data?.data)
            ? (response.data.data as CatalogProductLight[])
            : [];
        if (isMounted) {
          setCatalogProducts(payload);
        }
      } catch (error) {
        console.error('❌ Eroare la încărcarea catalogului de produse:', error);
        if (isMounted) {
          setFeedback({ type: 'error', message: 'Nu s-a putut încărca lista produselor din meniu.' });
        }
      }
    };

    const fetchExistingStock = async () => {
      if (!isEdit || !productId) return;
      setLoading(true);
      try {
        const response = await httpClient.get(`/api/stock/finished-products/${productId}`);
        const stockItem: FinishedProductStock | undefined = response.data?.product;
        if (stockItem && isMounted) {
          setFormValues({
            current_stock: stockItem.current_stock ?? 0,
            min_stock: stockItem.min_stock ?? 5,
            max_stock: stockItem.max_stock ?? 100,
            is_auto_managed: Boolean(stockItem.is_auto_managed),
          });
          setSelectedProductId(stockItem.product_id);
        }
      } catch (error) {
        console.error('❌ Eroare la obținerea produsului finit:', error);
        if (isMounted) {
          setFeedback({ type: 'error', message: 'Nu s-au putut încărca detaliile produsului.' });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCatalogProducts();
    fetchExistingStock();

    return () => {
      isMounted = false;
    };
  }, [open, isEdit, productId]);

  const selectedProduct = useMemo(() => catalogProducts.find((item) => item.id === selectedProductId) || null, [catalogProducts, selectedProductId]);

  const handleChange = useCallback((field: 'current_stock' | 'min_stock' | 'max_stock' | 'is_auto_managed', value: number | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedProductId) {
        setFeedback({ type: 'error', message: 'Selectează un produs din meniu.' });
        return;
      }

      if (formValues.min_stock < 0 || formValues.max_stock < 0 || formValues.current_stock < 0) {
        setFeedback({ type: 'error', message: 'Valorile trebuie să fie pozitive.' });
        return;
      }

      if (formValues.max_stock < formValues.min_stock) {
        setFeedback({ type: 'error', message: 'Stocul maxim nu poate fi mai mic decât cel minim.' });
        return;
      }

      setSaving(true);
      setFeedback(null);

      try {
        if (isEdit && productId) {
          await httpClient.put(`/api/stock/finished-products/${productId}`, {
            current_stock: formValues.current_stock,
            min_stock: formValues.min_stock,
            max_stock: formValues.max_stock,
            is_auto_managed: formValues.is_auto_managed,
          });
        } else {
          await httpClient.post('/api/stock/finished-products', {
            product_id: selectedProductId,
            current_stock: formValues.current_stock,
            min_stock: formValues.min_stock,
            max_stock: formValues.max_stock,
            is_auto_managed: formValues.is_auto_managed,
          });
        }

        setFeedback({ type: 'success', message: 'Stocul produsului finit a fost salvat.' });
        await onSaved();
        handleClose();
      } catch (error) {
        console.error('❌ Eroare la salvarea stocului produs finit:', error);
        const message = error instanceof Error ? error.message : 'Nu s-a putut salva stocul produsului.';
        setFeedback({ type: 'error', message });
      } finally {
        setSaving(false);
      }
    },
    [selectedProductId, formValues, isEdit, productId, onSaved, handleClose],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="finished-product-modal" role="dialog" aria-modal="true" aria-labelledby="finished-product-modal-title">
      <div className="finished-product-modal__backdrop" onClick={handleClose} aria-hidden="true" />
      <div className="finished-product-modal__content">
        <header className="finished-product-modal__header">
          <div>
            <h2 id="finished-product-modal-title">{isEdit ? 'Editează stoc produs finit' : 'Adaugă stoc produs finit'}</h2>
            {selectedProduct ? (
              <p>
                Produs: <strong>{selectedProduct.name}</strong>
                {selectedProduct.category ? ` · ${selectedProduct.category}` : ''}
                {selectedProduct.price ? ` · ${selectedProduct.price} RON` : ''}
              </p>
            ) : (
              <p>"selecteaza produsul din meniu pentru a configura s"</p>
            )}
          </div>
          <button type="button" className="finished-product-modal__close" onClick={handleClose} aria-label="Închide">
            ×
          </button>
        </header>

        {feedback ? (
          <InlineAlert
            variant={feedback.type}
            title={feedback.type === 'success' ? 'Succes' : 'Eroare'}
            message={feedback.message}
          />
        ) : null}

        <form className="finished-product-modal__form" onSubmit={handleSubmit}>
          <label className="finished-product-modal__label" htmlFor="finished-product-select">
            Produs din meniu
          </label>
          <select
            id="finished-product-select"
            value={selectedProductId ?? ''}
            onChange={(event) => setSelectedProductId(Number(event.target.value) || null)}
            disabled={isEdit}
            required
          >
            <option value="">Selectează produs</option>
            {catalogProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.category ? ` · ${product.category}` : ''}
              </option>
            ))}
          </select>

          <div className="finished-product-modal__grid">
            <label>
              <span>Stoc curent (buc)</span>
              <input
                type="number"
                min={0}
                step="1"
                value={formValues.current_stock}
                onChange={(event) => handleChange('current_stock', Number(event.target.value))}
                required
              />
            </label>

            <label>
              <span>Stoc minim</span>
              <input
                type="number"
                min={0}
                step="1"
                value={formValues.min_stock}
                onChange={(event) => handleChange('min_stock', Number(event.target.value))}
                required
              />
            </label>

            <label>
              <span>Stoc maxim</span>
              <input
                type="number"
                min={0}
                step="1"
                value={formValues.max_stock}
                onChange={(event) => handleChange('max_stock', Number(event.target.value))}
                required
              />
            </label>
          </div>

          <label className="finished-product-modal__checkbox">
            <input
              type="checkbox"
              checked={formValues.is_auto_managed}
              onChange={(event) => handleChange('is_auto_managed', event.target.checked)}
            />"stocul este gestionat automat pe baza vanzarilor"</label>

          {loading && <p className="finished-product-modal__loading">"se incarca detaliile produsului"</p>}

          <footer className="finished-product-modal__footer">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={saving}>"Anulează"</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Se salvează…' : isEdit ? 'Salvează modificările' : 'Adaugă stoc' }
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};




