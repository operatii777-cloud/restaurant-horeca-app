// ...existing code...
import { useTranslation } from '@/i18n/I18nContext';
import { useState, useCallback, useMemo } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { usePdfConfig, type PdfMenuType, type PdfCategory, type PdfProduct } from '../hooks/usePdfConfig';
  const { t } = useTranslation();
import './MenuPDFBuilderPage.css';

export const MenuPDFBuilderPage = () => {
// ...existing code...
  const [activeType, setActiveType] = useState<PdfMenuType>('food');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const { config, loading, error, refetch, updateCategories, updateProducts, uploadImage, deleteImage, regenerate } =
    usePdfConfig(activeType);

  const stats = useMemo(() => {
    if (!config) {
        { label: t('menu.menuPdf.categorySettings'), value: '0', helper: t('common.loading'), icon: '🖨️' },
        { label: t('menu.products.title'), value: '0', helper: t('common.loading'), icon: '📄' },
        { label: t('menu.menuPdf.generating'), value: '—', helper: 'N/A', icon: '⏱️' },
        { label: 'Ultima regenerare', value: '—', helper: 'N/A', icon: '⏱️' },
      ];
    }

    const totalCategories = config.categories.length;
    const visibleCategories = config.categories.filter((c) => c.display_in_pdf).length;
    const totalProducts = config.categories.reduce((sum, c) => sum + c.products.length, 0);
    const visibleProducts = config.categories.reduce(
      (sum, c) => sum + c.products.filter((p) => p.display_in_pdf).length,
      0
    );

    return [
        label: t('menu.menuPdf.categorySettings'),
        label: 'Categorii configurate',
        value: `${visibleCategories}/${totalCategories}`,
        helper: `${totalCategories} total`,
        icon: '🖨️',
      },
        label: t('menu.products.title'),
        label: 'Produse active',
        value: `${visibleProducts}/${totalProducts}`,
        helper: `${totalProducts} total`,
        icon: '📄',
      },
        label: t('menu.menuPdf.generating'),
        label: 'Ultima regenerare',
        helper: config.lastRegenerated ? t('common.active') : t('common.inactive'),
        helper: config.lastRegenerated ? 'PDF actualizat' : 'Nu s-a generat',
        icon: '⏱️',
      },
    ];
  }, [config]);

  const handleToggleCategoryVisibility = useCallback(
    async (categoryId: number, visible: boolean) => {
      if (!config) return;

      const category = config.categories.find((c) => c.id === categoryId);
      if (!category) return;

      try {
        await updateCategories([
          {
            id: categoryId,
            display_in_pdf: visible,
          },
        setFeedback({ type: 'success', message: t('menu.messages.categoryUpdated') });
        setFeedback({ type: 'success', message: 'Categoria a fost actualizată' });
      } catch (err) {
        setFeedback({
          message: err instanceof Error ? err.message : t('menu.messages.error'),
          message: err instanceof Error ? err.message : 'Eroare la actualizarea categoriei',
        });
      }
    },
    [config, updateCategories]
  );

  const handleTogglePageBreak = useCallback(
    async (categoryId: number, pageBreak: boolean) => {
      if (!config) return;

      try {
        await updateCategories([
          {
            id: categoryId,
            page_break_after: pageBreak,
          },
        setFeedback({ type: 'success', message: t('menu.messages.productUpdated') });
        setFeedback({ type: 'success', message: 'Page break actualizat' });
      } catch (err) {
        setFeedback({
          message: err instanceof Error ? err.message : t('menu.messages.error'),
          message: err instanceof Error ? err.message : 'Eroare la actualizarea page break',
        });
      }
    },
    [config, updateCategories]
  );

  const handleToggleProduct = useCallback(
    async (productId: number, visible: boolean) => {
      if (!config) return;

      try {
        await updateProducts([
          {
            id: productId,
            display_in_pdf: visible,
          },
        setFeedback({ type: 'success', message: t('menu.messages.productUpdated') });
        setFeedback({ type: 'success', message: 'Produsul a fost actualizat' });
      } catch (err) {
        setFeedback({
          message: err instanceof Error ? err.message : t('menu.messages.error'),
          message: err instanceof Error ? err.message : 'Eroare la actualizarea produsului',
        });
      }
    },
    [config, updateProducts]
  );

  const handleToggleAllProducts = useCallback(
    async (categoryId: number, visible: boolean) => {
      if (!config) return;

      const category = config.categories.find((c) => c.id === categoryId);
      if (!category) return;

      try {
        await updateProducts(
          category.products.map((p) => ({
            id: p.id,
            display_in_pdf: visible,
          }))
        );
        setFeedback({ type: 'success', message: `Toate produsele au fost ${visible ? 'activate' : 'dezactivate'}` });
      } catch (err) {
        setFeedback({
          message: err instanceof Error ? err.message : t('menu.messages.error'),
          message: err instanceof Error ? err.message : 'Eroare la actualizarea produselor',
        });
      }
    },
    [config, updateProducts]
  );

  const handleUploadImage = useCallback(
    async (categoryId: number, file: File) => {
      try {
        setFeedback({ type: 'success', message: t('menu.messages.imageUploaded') });
        setFeedback({ type: 'success', message: 'Imaginea a fost încărcată cu succes' });
      } catch (err) {
        setFeedback({
          message: err instanceof Error ? err.message : t('menu.messages.error'),
          message: err instanceof Error ? err.message : 'Eroare la upload-ul imaginii',
        });
      }
    },
    'uploadImage'
  );

  const handleDeleteImage = useCallback(
    async (categoryId: number) => {
      if (!window.confirm('Ești sigur că vrei să ștergi această imagine?')) {
        return;
      }

      try {
        setFeedback({ type: 'success', message: t('menu.messages.productDeleted') });
        setFeedback({ type: 'success', message: 'Imaginea a fost ștearsă' });
      } catch (err) {
        setFeedback({
          message: err instanceof Error ? err.message : t('menu.messages.error'),
          message: err instanceof Error ? err.message : 'Eroare la ștergerea imaginii',
        });
      }
    },
    'deleteImage'
  );

  const handleRegenerate = useCallback(async () => {
    if (!window.confirm(`Regenerezi PDF-urile pentru ${activeType === 'food' ? 'Mâncare' : 'Băuturi'}?`)) {
      return;
    }

    setRegenerating(true);
    try {
      setFeedback({ type: 'success', message: t('common.success') });
      setFeedback({ type: 'success', message: 'PDF-urile au fost regenerate cu succes' });
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : t('menu.messages.error'),
        message: err instanceof Error ? err.message : 'Eroare la regenerarea PDF-urilor',
      });
    } finally {
      setRegenerating(false);
    }
  }, [activeType, regenerate]);

  const handleRegenerateAll = useCallback(async () => {
    if (!window.confirm('Regenerezi toate PDF-urile (Mâncare + Băuturi)?')) {
      return;
    }

    setRegenerating(true);
    try {
      setFeedback({ type: 'success', message: t('common.success') });
      setFeedback({ type: 'success', message: 'Toate PDF-urile au fost regenerate cu succes' });
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : t('menu.messages.error'),
        message: err instanceof Error ? err.message : 'Eroare la regenerarea PDF-urilor',
      });
    } finally {
      setRegenerating(false);
    }
  }, [regenerate]);

  return (
    <div className="menu-pdf-page" data-page-ready={!loading}>
        title={t('menu.menuPdf.title')}
        description={t('menu.menuPdf.subtitle')}
        description="Administrează template-urile de meniu, sincronizează conținutul cu Catalogul și exportă PDF-uri gata de tipar sau distribuție digitală."
        actions={[
          {
            label: '↻ Reîmprospătează',
            variant: 'secondary',
            onClick: refetch,
          },
          {
            label: regenerating ? '⏳ Se generează...' : '📄 Generează PDF',
            variant: 'primary',
            onClick: handleRegenerate,
          },
          {
            label: regenerating ? '⏳ Se generează...' : '🔄 Generează Toate',
            variant: 'primary',
            onClick: handleRegenerateAll,
          },
        ]}
      />

      {feedback ? <InlineAlert type={feedback.type} message={feedback.message} /> : null}
      {error ? <InlineAlert type="error" message={error} /> : null}

      {/* Tabs */}
      <div className="menu-pdf-tabs">
        <button
          type="button"
          className={`menu-pdf-tab ${activeType === 'food' ? 'menu-pdf-tab--active' : ''}`}
          onClick={() => setActiveType('food')}
        >
          🍕 Meniu Mâncare
        </button>
        <button
          type="button"
          className={`menu-pdf-tab ${activeType === 'drinks' ? 'menu-pdf-tab--active' : ''}`}
          onClick={() => setActiveType('drinks')}
        >
          🍷 Meniu Băuturi
        </button>
      </div>

      {/* Stats */}
      <section className="menu-pdf-stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            helper={stat.helper}
            value={stat.value}
            icon={<span>{stat.icon}</span>}
          />
        ))}
      </section>

      {/* Categories List */}
      {loading ? (
        <div className="menu-pdf-loading">
          <div className="spinner"></div>
          <p>Se încarcă configurația...</p>
        </div>
      ) : config && config.categories.length > 0 ? (
        <section className="menu-pdf-categories">
          {config.categories.map((category) => (
            <PdfCategoryCard
              key={category.id}
              category={category}
              onToggleVisibility={handleToggleCategoryVisibility}
              onTogglePageBreak={handleTogglePageBreak}
              onToggleProduct={handleToggleProduct}
              onToggleAllProducts={handleToggleAllProducts}
              onUploadImage={handleUploadImage}
              onDeleteImage={handleDeleteImage}
            />
          ))}
        </section>
      ) : (
          <p>{t('menu.categories.noCategories')}</p>
          <p>📋 Nicio categorie configurată pentru {activeType === 'food' ? 'Mâncare' : 'Băuturi'}.</p>
        </div>
      )}
    </div>
  );
};




