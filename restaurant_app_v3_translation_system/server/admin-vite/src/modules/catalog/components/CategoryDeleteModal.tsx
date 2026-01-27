// import { useTranslation } from '@/i18n/I18nContext';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';

type CategoryDeleteModalProps = {
  open: boolean;
  categoryName?: string;
  productCount?: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error?: string | null;
};

export const CategoryDeleteModal = ({
  open,
  categoryName,
  productCount,
  loading = false,
  onClose,
  onConfirm,
  error,
}: CategoryDeleteModalProps) => {
//   const { t } = useTranslation();
  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      title="stergere categorie"
      description="Confirmați eliminarea categoriei selectate."
      size="sm"
    >
      {error ? <InlineAlert variant="error" message={error} /> : null}

      <div className="category-delete-modal__content">
        <p>
          Categoria <strong>{categoryName ?? 'selectată'}</strong> va fi eliminată din structura catalogului.
        </p>
        {typeof productCount === 'number' ? (
          <InlineAlert
            variant={productCount > 0 ? 'warning' : 'info'}
            message={
              productCount > 0
                ? `Există ${productCount} produse asociate acestei categorii. Mută-le înainte de ștergere.`
                : 'Nu există produse asociate – categoria poate fi ștearsă în siguranță.'
            }
          />
        ) : null}

        <div className="category-delete-modal__actions">
          <button type="button" className="catalog-btn catalog-btn--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button
            type="button"
            className="catalog-btn catalog-btn--primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Se șterge...' : 'Șterge categoria'}
          </button>
        </div>
      </div>
    </Modal>
  );
};




