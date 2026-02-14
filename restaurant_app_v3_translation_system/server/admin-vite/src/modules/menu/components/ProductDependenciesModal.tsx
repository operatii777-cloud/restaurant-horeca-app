import { useTranslation } from '@/i18n/I18nContext';
import { useMemo } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { MenuProduct } from '@/types/menu';
import './ProductDependenciesModal.css';

type ProductDependenciesModalProps = {
  open: boolean;
  product: MenuProduct | null;
  onClose: () => void;
};

type DependenciesResponse = {
  dependencies?: {
    ingredients?: Array<{
      id: number;
      name: string;
      name_en?: string;
      quantity: number;
      unit: string;
      current_stock: number;
      category?: string;
    }>;
    related_products?: Array<{
      id: number;
      name: string;
      category?: string;
    }>;
  };
};

export function ProductDependenciesModal({ open, product, onClose }: ProductDependenciesModalProps) {
  const { t } = useTranslation();
  const productId = product?.id;
  const endpoint = useMemo(() => {
    if (!open || !productId) {
      return null;
    }
    return `/api/catalog/products/${productId}/dependencies`;
  }, [open, productId]);

  const { data, loading, error, refetch } = useApiQuery<DependenciesResponse>(endpoint);

  const ingredients = data?.dependencies?.ingredients ?? [];
  const relatedProducts = data?.dependencies?.related_products ?? [];

  const title = product ? `${t('menu.dependencies.title')} — ${product.name}` : t('menu.dependencies.title');

  return (
    <Modal isOpen={open} title={title} size="lg" onClose={onClose}>
      {error ? <InlineAlert variant="error" title={t('menu.messages.error')} message={error} /> : null}

      <div className="dependencies-layout">
        <section className="dependencies-section">
          <header className="dependencies-header">
            <div>
              <h3>{t('menu.productModal.ingredients')}</h3>
              <p>{t('menu.dependencies.subtitle')}</p>
            </div>
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={refetch} disabled={loading}>
              🔄 {t('actions.refresh')}
            </button>
          </header>

          {loading ? (
            <div className="dependencies-empty">{t('common.loading')}</div>
          ) : ingredients.length === 0 ? (
            <div className="dependencies-empty">{t('menu.dependencies.noDependencies')}</div>
          ) : (
            <div className="dependencies-table-wrapper">
              <table className="dependencies-table">
                <thead>
                  <tr>
                    <th>{t('menu.productModal.ingredients')}</th>
                    <th>{t('common.category')}</th>
                    <th>{t('common.quantity')}</th>
                    <th>{t('common.stock')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient) => (
                    <tr key={ingredient.id}>
                      <td>
                        <div className="dependencies-cell-main">{ingredient.name}</div>
                        {ingredient.name_en ? <div className="dependencies-cell-sub">{ingredient.name_en}</div> : null}
                      </td>
                      <td>{ingredient.category ?? '—'}</td>
                      <td>
                        {ingredient.quantity} {ingredient.unit}
                      </td>
                      <td>{ingredient.current_stock ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dependencies-section">
          <header className="dependencies-header">
            <div>
              <h3>{t('menu.dependencies.dependentProducts')}</h3>
              <p>{t('menu.dependencies.subtitle')}</p>
            </div>
          </header>

          {loading ? (
            <div className="dependencies-empty">{t('common.loading')}</div>
          ) : relatedProducts.length === 0 ? (
            <div className="dependencies-empty">{t('menu.dependencies.noDependencies')}</div>
          ) : (
            <div className="dependencies-related">
              {relatedProducts.map((related) => (
                <div key={related.id} className="dependencies-related-item">
                  <div className="dependencies-related-name">{related.name}</div>
                  <div className="dependencies-related-category">{related.category ?? t('common.category')}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="dependencies-actions">
        <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose}>"Închide"</button>
      </footer>
    </Modal>
  );
}





