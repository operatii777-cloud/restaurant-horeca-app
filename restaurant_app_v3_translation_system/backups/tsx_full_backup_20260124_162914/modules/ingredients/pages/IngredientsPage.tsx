// import { useTranslation } from '@/i18n/I18nContext';
import { useMemo, useState, useCallback } from 'react';
import type { ColDef, CellClickedEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { StatCard } from '@/shared/components/StatCard';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { TableFilter } from '@/shared/components/TableFilter';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Ingredient } from '@/types/ingredients';
import { IngredientEditorModal } from '@/modules/ingredients/components/IngredientEditorModal';
import { IngredientBulkUpdateModal } from '@/modules/ingredients/components/IngredientBulkUpdateModal';
import { IngredientDetailsDrawer } from '@/modules/ingredients/components/IngredientDetailsDrawer';
import { httpClient } from '@/shared/api/httpClient';
import './IngredientsPage.css';

const formatNumber = (value?: number) =>
  value === null || value === undefined ? '-' : value.toLocaleString('ro-RO', { maximumFractionDigits: 2 });

const isTrue = (value: unknown) => value === true || value === 1 || value === '1';

type FeedbackState =
  | {
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }
  | null;

type IngredientDetailsTab = 'overview' | 'documents' | 'suppliers' | 'traceability';

const topConsumptionData = [
  { label: 'Lun', value: 36 },
  { label: 'Mar', value: 28 },
  { label: 'Mie', value: 32 },
  { label: 'Joi', value: 48 },
  { label: 'Vin', value: 54 },
  { label: 'Sâm', value: 42 },
  { label: 'Dum', value: 38 },
];

const stockDistributionData = [
  { name: 'Legume', value: 28, color: '#2563eb' },
  { name: 'Carne', value: 18, color: '#38bdf8' },
  { name: 'Lactate', value: 14, color: '#6366f1' },
  { name: 'Uleiuri', value: 12, color: '#f97316' },
  { name: 'Condimente', value: 9, color: '#22c55e' },
  { name: 'Altele', value: 19, color: '#94a3b8' },
];

export const IngredientsPage = () => {
//   const { t } = useTranslation();
  const [quickFilter, setQuickFilter] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState<IngredientDetailsTab>('overview');
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const { data, loading, error, refetch } = useApiQuery<Ingredient[]>('/api/ingredients');
  const isPageReady = !loading && (data !== null || error !== null);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => (showHidden ? true : !isTrue(item.is_hidden)));
  }, [data, showHidden]);

  const columnDefs = useMemo<ColDef<Ingredient>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Ingredient',
        minWidth: 220,
        filter: 'agTextColumnFilter',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
      },
      { field: 'category', headerName: 'Categorie', minWidth: 160 },
      { field: 'unit', headerName: 'Unitate', width: 110 },
      {
        field: 'is_hidden',
        headerName: 'Vizibil',
        width: 120,
        valueFormatter: ({ value }) => (isTrue(value) ? 'Ascuns' : 'Activ'),
        cellClass: (params) => (isTrue(params.value) ? 'cell-inactive' : 'cell-active'),
      },
      {
        field: 'current_stock',
        headerName: 'Stoc curent',
        width: 140,
        valueFormatter: ({ value }) => formatNumber(Number(value)),
      },
      {
        field: 'min_stock',
        headerName: 'Stoc minim',
        width: 130,
        valueFormatter: ({ value }) => formatNumber(Number(value)),
      },
      {
        field: 'cost_per_unit',
        headerName: 'Cost/unitate',
        width: 140,
        valueFormatter: ({ value }) =>
          value === null || value === undefined ? '-' : `${Number(value).toFixed(2)} RON`,
      },
      { field: 'supplier', headerName: 'Furnizor', minWidth: 180 },
      {
        field: 'origin_country',
        headerName: 'Țară origine',
        width: 150,
        valueFormatter: ({ value }) => value ?? '-',
      },
      {
        headerName: 'Acțiuni',
        colId: 'actions',
        width: 130,
        pinned: 'right',
        sortable: false,
        filter: false,
        valueGetter: () => 'Gestionează →',
        cellClass: 'ingredients-grid__action-cell',
      },
    ],
    [],
  );

  const handleAddIngredient = useCallback(() => {
    setEditingIngredient(null);
    setEditorOpen(true);
  }, []);

  const handleEditIngredient = useCallback((ingredientToEdit: Ingredient | null) => {
    if (!ingredientToEdit) return;
    setEditingIngredient(ingredientToEdit);
    setEditorOpen(true);
  }, []);

  const handleSelectionChange = (selected: Ingredient[]) => {
    setSelectedIngredients(selected);
  };

  const handleCellClicked = useCallback(
    (event: CellClickedEvent<Ingredient>) => {
      if (event.colDef.colId === 'actions' && event.data) {
        handleEditIngredient(event.data);
      }
    },
    'handleEditIngredient',
  );

  const handleRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent<Ingredient>) => {
      if (event.data) {
        handleEditIngredient(event.data);
      }
    },
    'handleEditIngredient',
  );

  const totalIngredients = filteredData.length;
  const activeIngredients = filteredData.filter((item) => !isTrue(item.is_hidden)).length;
  const hiddenIngredients = totalIngredients - activeIngredients;
  const selectionCount = selectedIngredients.length;
  const primaryIngredient = selectedIngredients[0] ?? null;

  const handleOpenDetails = useCallback(
    (tab: IngredientDetailsTab = 'overview') => {
      if (!primaryIngredient) {
        setFeedback({ type: 'warning', message: 'Selectează un ingredient pentru a vizualiza detaliile.' });
        return;
      }
      setDetailsTab(tab);
      setDetailsOpen(true);
    },
    'primaryIngredient',
  );

  const handleOpenBulkModal = useCallback(() => {
    if (!selectionCount) {
      setFeedback({ type: 'warning', message: 'Selectează cel puțin un ingredient pentru actualizare în masă.' });
      return;
    }
    setBulkModalOpen(true);
  }, [selectionCount]);

  const handleBulkApplied = useCallback(
    async ({ updatedCount, visibilityAction, minStock, costPerUnit }: { updatedCount: number; visibilityAction?: 'hide' | 'restore' | null; minStock?: number | null; costPerUnit?: number | null }) => {
      const parts: string[] = [`Actualizare aplicată pentru ${updatedCount} ingrediente.`];
      if (typeof minStock === 'number') {
        parts.push(`Stoc minim setat la ${minStock}.`);
      }
      if (typeof costPerUnit === 'number') {
        parts.push(`Cost/unitate actualizat la ${costPerUnit.toFixed(2)} RON.`);
      }
      if (visibilityAction === 'hide') {
        parts.push('Ingredientele au fost marcate ca neinventariabile.');
      } else if (visibilityAction === 'restore') {
        parts.push('Ingredientele au fost restaurate în gestiune.');
      }
      setFeedback({ type: 'success', message: parts.join(' ') });
      setBulkModalOpen(false);
      setSelectedIngredients([]);
      await refetch();
    },
    [],
  );

  const handleHideSelected = useCallback(async () => {
    if (!selectionCount) {
      setFeedback({ type: 'warning', message: 'Selectează ingredientele pe care dorești să le ascunzi.' });
      return;
    }
    try {
      await Promise.all(selectedIngredients.map((item) => httpClient.patch(`/api/ingredients/${item.id}/hide`)));
      setFeedback({ type: 'success', message: `Au fost ascunse ${selectionCount} ingrediente.` });
      setSelectedIngredients([]);
      await refetch();
    } catch (apiError: any) {
      console.error('❌ Eroare la ascunderea ingredientelor:', apiError);
      setFeedback({ type: 'error', message: apiError?.response?.data?.error ?? 'Nu s-a putut finaliza acțiunea.' });
    }
  }, [selectedIngredients, selectionCount, refetch]);

  const handleRestoreSelected = useCallback(async () => {
    if (!selectionCount) {
      setFeedback({ type: 'warning', message: 'Selectează ingredientele pe care dorești să le restaurezi.' });
      return;
    }
    try {
      await Promise.all(selectedIngredients.map((item) => httpClient.patch(`/api/ingredients/${item.id}/restore`)));
      setFeedback({ type: 'success', message: `Au fost restaurate ${selectionCount} ingrediente.` });
      setSelectedIngredients([]);
      await refetch();
    } catch (apiError: any) {
      console.error('❌ Eroare la restaurarea ingredientelor:', apiError);
      setFeedback({ type: 'error', message: apiError?.response?.data?.error ?? 'Nu s-a putut finaliza acțiunea de restaurare.' });
    }
  }, [selectedIngredients, selectionCount, refetch]);

  const handleExportCsv = useCallback(() => {
    if (!filteredData.length) {
      setFeedback({ type: 'warning', message: 'Nu există date de exportat.' });
      return;
    }

    const headers = [
      'ID',
      'Nume',
      'Categorie',
      'Unitate',
      'Stoc curent',
      'Stoc minim',
      'Cost/unitate',
      'Furnizor',
      'Țară origine',
      'Vizibil',
    ];

    const rows = filteredData.map((item) => [
      item.id,
      `"${item.name ?? ''}"`,
      `"${item.category ?? ''}"`,
      item.unit ?? '',
      item.current_stock ?? '',
      item.min_stock ?? '',
      item.cost_per_unit ?? '',
      `"${item.supplier ?? ''}"`,
      `"${item.origin_country ?? ''}"`,
      isTrue(item.is_hidden) ? 'Ascuns' : 'Activ',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob('csvContent', { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ingredients-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', message: 'Export CSV generat cu succes.' });
  }, [filteredData]);

  const handleDrawerVisibility = useCallback(
    async (action: 'hide' | 'restore') => {
      if (!primaryIngredient) return;
      if (action === 'hide') {
        await httpClient.patch(`/api/ingredients/${primaryIngredient.id}/hide`);
        setFeedback({ type: 'success', message: `Ingredientul "${primaryIngredient.name}" a fost ascuns.` });
      } else {
        await httpClient.patch(`/api/ingredients/${primaryIngredient.id}/restore`);
        setFeedback({ type: 'success', message: `Ingredientul "${primaryIngredient.name}" a fost restaurat.` });
      }
      await refetch();
    },
    [primaryIngredient, refetch],
  );

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  return (
    <div className="ingredients-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <section className="ingredients-hero">
        <div className="ingredients-hero__info">
          <div className="ingredients-hero__labels">
            <span className="ingredients-chip ingredients-chip--primary">Trasabilitate live</span>
            <span className="ingredients-chip">HACCP ready</span>
            <span className="ingredients-chip">"integrat cu receptii loturi"</span>
          </div>
          <h2>Inventar operațional – Ingrediente</h2>
          <p>
            Vizualizezi în timp real stocurile, temperaturile controlate și documentele asociate fiecărui ingredient.
            AG Grid oferă filtrare avansată, sortare și export Excel.
          </p>
        </div>

        <div className="ingredients-hero__stats">
          <StatCard
            title="Ingrediente active"
            helper="Disponibile în meniuri și rețete"
            value={`${activeIngredients}`}
            trendLabel="vs. săptămâna trecută"
            trendValue="▲ 12%"
            trendDirection="up"
            icon={<span>✅</span>}
          />

          <StatCard
            title="Stoc critic"
            helper="Sub nivelul de reaprovisionare"
            value="18 ingrediente"
            trendLabel="Necesită acțiune"
            trendValue="9 urgente"
            trendDirection="down"
            icon={<span>⚠️</span>}
            footer={
              <button type="button" className="ingredients-link-button">
                Vezi lista
              </button>
            }
          />

          <StatCard
            title="documente haccp"
            helper="Fișe actualizate în ultimele 30 zile"
            value="96% conform"
            trendLabel="Documente expirate"
            trendValue="2"
            trendDirection="flat"
            icon={<span>📄</span>}
          />
        </div>

        <div className="ingredients-hero__analytics">
          <div className="ingredients-analytics-card">
            <header>
              <span className="ingredients-analytics-title">"top consum saptamanal"</span>
              <span className="ingredients-analytics-helper">kg utilizați / zi</span>
            </header>
            <MiniBarChart data={topConsumptionData} />
          </div>

          <div className="ingredients-analytics-card">
            <header>
              <span className="ingredients-analytics-title">"distributie stoc pe categorii"</span>
              <span className="ingredients-analytics-helper">% din total stoc</span>
            </header>
            <MiniDonutChart data={stockDistributionData} />
            <ul className="ingredients-legend">
              {stockDistributionData.map((item) => (
                <li key={item.name}>
                  <span style={{ backgroundColor: item.color }} aria-hidden="true" />
                  {item.name}
                  <strong>{item.value}%</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="ingredients-toolbar" aria-label="filtre si actiuni">
        <div className="ingredients-toolbar__left">
          <TableFilter
            value={quickFilter}
            onChange={setQuickFilter}
            placeholder="cauta ingredient dupa nume categorie furnizor sau "
            aria-label="Filtru rapid ingrediente"
          />
          <label className="ingredients-toggle">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(event) => setShowHidden(event.target.checked)}
            />
            Afișează ingredientele ascunse ({hiddenIngredients})
          </label>
        </div>
        <div className="ingredients-toolbar__actions">
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={() => refetch()}>
            ⟳ Reîmprospătează datele
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={handleOpenBulkModal} disabled={selectionCount === 0}>
            📦 Ajustare în masă
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={() => handleOpenDetails('documents')} disabled={!primaryIngredient}>
            📑 Documente HACCP
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={() => handleOpenDetails('traceability')} disabled={!primaryIngredient}>
            🧭 Trasabilitate
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={handleHideSelected} disabled={selectionCount === 0}>
            👻 Marchează neinventariabil
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={handleRestoreSelected} disabled={selectionCount === 0}>
            ✅ Restaurează selecția
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--primary" onClick={handleExportCsv}>
            ⬇️ Export CSV
          </button>
        </div>
      </section>

      <div className="ingredients-feedback">
        {feedback ? (
          <InlineAlert
            variant={feedback.type}
            title={feedback.type === 'success' ? 'Succes' : feedback.type === 'error' ? 'Eroare' : 'Informație'}
            message={feedback.message}
          />
        ) : null}
        {error ? <InlineAlert type="error" message={error} /> : null}
      </div>

      <section className="ingredients-grid-panel">
        <header>
          <div>
            <h3>"lista completa de ingrediente"</h3>
            <p>{`${totalIngredients} ingrediente gestionate · Mod filtrare rapidă activ`}</p>
          </div>
          <div className="ingredients-selection">
            {primaryIngredient
              ? `Ingredient selectat: ${primaryIngredient.name}`
              : selectionCount > 1
                ? `${selectionCount} ingrediente selectate.`
                : 'Selectează ingrediente pentru acțiuni bulk sau detalii.'}
          </div>
          <button type="button" className="ingredients-btn ingredients-btn--outline" onClick={handleAddIngredient}>
            + Adaugă ingredient nou
          </button>
        </header>
        <DataGrid<Ingredient>
          columnDefs={columnDefs}
          rowData={filteredData}
          loading={loading}
          quickFilterText={quickFilter}
          height="60vh"
          rowSelection="multiple"
          gridOptions={{
            rowHeight: 52,
            headerHeight: 46,
            suppressScrollOnNewData: true,
          }}
          agGridProps={{
            onCellClicked: handleCellClicked,
            onRowDoubleClicked: handleRowDoubleClicked,
            getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
          }}
          onSelectedRowsChange={handleSelectionChange}
        />
      </section>

      <section className="ingredients-secondary">
        <article className="ingredients-secondary__card">
          <header>
            <span>Trasabilitate & documente</span>
            <button type="button" className="ingredients-link-button">
              Vezi traseu complet →
            </button>
          </header>
          <ul>
            <li>
              <strong>"documente haccp valabile"</strong>
              <span>184 / 192</span>
            </li>
            <li>
              <strong>"loturi receptionate saptamana aceasta"</strong>
              <span>27 loturi</span>
            </li>
            <li>
              <strong>"ingrediente cu temperatura critica"</strong>
              <span>3 ingrediente</span>
            </li>
          </ul>
        </article>

        <article className="ingredients-secondary__card">
          <header>
            <span>Automatizări & alerte</span>
            <button type="button" className="ingredients-link-button">
              Configurează notificări →
            </button>
          </header>
          <ul>
            <li>
              <strong>Alerte stoc critic</strong>
              <span>Livrare în 6h</span>
            </li>
            <li>
              <strong>"receptii in curs de validare"</strong>
              <span>2 documente</span>
            </li>
            <li>
              <strong>Integrare GPT Bridge</strong>
              <span>Online</span>
            </li>
          </ul>
        </article>
      </section>
      <IngredientEditorModal
        open={editorOpen}
        ingredient={editingIngredient}
        onClose={() => setEditorOpen(false)}
        onSaved={() => refetch()}
      />

      <IngredientBulkUpdateModal
        open={bulkModalOpen}
        ingredientIds={selectedIngredients.map((item) => item.id)}
        onClose={() => setBulkModalOpen(false)}
        onApplied={handleBulkApplied}
      />

      <IngredientDetailsDrawer
        open={detailsOpen}
        ingredient={primaryIngredient}
        initialTab={detailsTab}
        onClose={handleCloseDetails}
        onVisibilityChanged={handleDrawerVisibility}
      />
    </div>
  );
};



