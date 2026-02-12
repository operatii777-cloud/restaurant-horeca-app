// ...existing code...
import { useState, useCallback, useMemo } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { usePdfConfig, type PdfMenuType, type PdfCategory, type PdfProduct } from '../hooks/usePdfConfig';
import { PdfCategoryCard } from '../components/PdfCategoryCard';
import { PdfSettingsPanel } from '../components/PdfSettingsPanel';
import { ProductSearchFilter } from '../components/ProductSearchFilter';
import './MenuPDFBuilderPage.css';

export const MenuPDFBuilderPage = () => {
// ...existing code...
  const [activeType, setActiveType] = useState<PdfMenuType>('food');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<PdfCategory[] | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { config, loading, error, refetch, updateCategories, updateProducts, uploadImage, deleteImage, regenerate } =
    usePdfConfig(activeType);

  // Use filtered categories if available, otherwise use config categories
  const displayCategories = filteredCategories || config?.categories || [];

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex || !config) {
      return;
    }

    const categories = [...config.categories];
    const [draggedItem] = categories.splice(draggedIndex, 1);
    categories.splice(dropIndex, 0, draggedItem);

    // Update order_index for all affected categories
    const updates = categories.map((cat, idx) => ({
      id: cat.id,
      order_index: idx,
    }));

    try {
      await updateCategories(updates);
      setFeedback({ type: 'success', message: 'Ordinea categoriilor a fost actualizată' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Eroare la reordonare',
      });
    } finally {
      setDraggedIndex(null);
    }
  }, [draggedIndex, config, updateCategories]);

  const stats = useMemo(() => {
    if (!config) {
      return [
        { label: 'Categorii configurate', value: '0', helper: 'Se încarcă...', icon: '🖨️' },
        { label: 'Produse active', value: '0', helper: 'Se încarcă...', icon: '📄' },
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
      {
        label: 'Categorii configurate',
        value: `${visibleCategories}/${totalCategories}`,
        helper: `${totalCategories} total`,
        icon: '🖨️',
      },
      {
        label: 'Produse active',
        value: `${visibleProducts}/${totalProducts}`,
        helper: `${totalProducts} total`,
        icon: '📄',
      },
      {
        label: 'Ultima regenerare',
        value: config.lastRegenerated ? new Date(config.lastRegenerated).toLocaleDateString('ro-RO') : '—',
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
        ]);
        setFeedback({ type: 'success', message: 'Categoria a fost actualizată' });
      } catch (err) {
        setFeedback({
          type: 'error',
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
        ]);
        setFeedback({ type: 'success', message: 'Page break actualizat' });
      } catch (err) {
        setFeedback({
          type: 'error',
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
        ]);
        setFeedback({ type: 'success', message: 'Produsul a fost actualizat' });
      } catch (err) {
        setFeedback({
          type: 'error',
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
          type: 'error',
          message: err instanceof Error ? err.message : 'Eroare la actualizarea produselor',
        });
      }
    },
    [config, updateProducts]
  );

  const handleUploadImage = useCallback(
    async (categoryId: number, file: File) => {
      try {
        await uploadImage(categoryId, file);
        setFeedback({ type: 'success', message: 'Imaginea a fost încărcată cu succes' });
      } catch (err) {
        setFeedback({
          type: 'error',
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
        await deleteImage(categoryId);
        setFeedback({ type: 'success', message: 'Imaginea a fost ștearsă' });
      } catch (err) {
        setFeedback({
          type: 'error',
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
      await regenerate(activeType);
      setFeedback({ type: 'success', message: 'PDF-urile au fost regenerate cu succes' });
    } catch (err) {
      setFeedback({
        type: 'error',
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
      await regenerate('all');
      setFeedback({ type: 'success', message: 'Toate PDF-urile au fost regenerate cu succes' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Eroare la regenerarea PDF-urilor',
      });
    } finally {
      setRegenerating(false);
    }
  }, [regenerate]);

  return (
    <div className="menu-pdf-page" data-page-ready={!loading}>
      <PageHeader
        title='Generator PDF Meniu'
        description="Administrează template-urile de meniu, sincronizează conținutul cu Catalogul și exportă PDF-uri gata de tipar sau distribuție digitală."
        actions={[
          {
            label: showSettings ? 'Ascunde Setări' : 'Setări PDF',
            variant: 'outline-primary',
            onClick: () => setShowSettings(!showSettings),
            icon: <i className="fas fa-cog" />,
          },
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

      {/* Settings Panel (collapsible) */}
      {showSettings && <PdfSettingsPanel />}

      <Row>
        <Col lg={12}>
          {/* Product Search/Filter */}
          {config && config.categories.length > 0 && (
            <ProductSearchFilter 
              categories={config.categories}
              onFilterChange={setFilteredCategories}
            />
          )}

          {/* Categories List */}
          {loading ? (
            <div className="menu-pdf-loading">
              <div className="spinner"></div>
              <p>Se încarcă configurația...</p>
            </div>
          ) : config && displayCategories.length > 0 ? (
            <section className="menu-pdf-categories">
              {displayCategories.map((category, index) => (
                <PdfCategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  draggable={filteredCategories === null}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onToggleVisibility={handleToggleCategoryVisibility}
                  onTogglePageBreak={handleTogglePageBreak}
                  onToggleProduct={handleToggleProduct}
                  onToggleAllProducts={handleToggleAllProducts}
                  onUploadImage={handleUploadImage}
                  onDeleteImage={handleDeleteImage}
                />
              ))}
            </section>
          ) : config && filteredCategories !== null && filteredCategories.length === 0 ? (
            <div className="menu-pdf-empty">
              <p>🔍 Niciun rezultat pentru căutarea curentă.</p>
              <Button variant="link" onClick={() => setFilteredCategories(null)}>
                Resetează filtrele
              </Button>
            </div>
          ) : (
            <div className="menu-pdf-empty">
              <p>📋 Nicio categorie configurată pentru {activeType === 'food' ? 'Mâncare' : 'Băuturi'}.</p>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};




