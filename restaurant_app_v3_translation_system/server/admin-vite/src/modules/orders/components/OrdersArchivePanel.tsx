// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useMemo, useState } from 'react';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { StatCard } from '@/shared/components/StatCard';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import type { OrdersArchiveStats } from '@/types/orders';
import './OrdersArchivePanel.css';

type OrdersArchivePanelProps = {
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export const OrdersArchivePanel = ({ onFeedback }: OrdersArchivePanelProps) => {
  //   const { t } = useTranslation();
  const { data, loading, error, refetch } = useApiQuery<OrdersArchiveStats>('/api/admin/archive-stats');
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [exportDates, setExportDates] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [deleteDates, setDeleteDates] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (error) {
    onFeedback(error, 'error');
  }

  const stats = useMemo(() => data ?? { activeOrders: 0, archivedOrders: 0, oldestArchive: null, totalSize: 0 }, [data]);

  const handleArchive = useCallback(async () => {
    setArchiveLoading(true);
    try {
      await httpClient.post('/api/admin/archive-orders');
      onFeedback('Arhivarea manuală a fost inițiată. Verificați logurile backend pentru detalii.', 'success');
      await refetch();
    } catch (err) {
      console.error('Eroare la arhivare:', err);
      onFeedback('Nu s-a putut lansa arhivarea comenzilor.', 'error');
    } finally {
      setArchiveLoading(false);
    }
  }, [onFeedback, refetch]);

  const handleExport = useCallback(async () => {
    if (!exportDates.start || !exportDates.end) {
      onFeedback('Selectează intervalul pentru export.', 'info');
      return;
    }
    setExporting(true);
    try {
      const response = await httpClient.get('/api/admin/export-archived', {
        params: {
          startDate: exportDates.start,
          endDate: exportDates.end,
        },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `archived-orders-${exportDates.start}-${exportDates.end}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onFeedback('Exportul CSV a fost generat.', 'success');
    } catch (err) {
      console.error('Eroare la exportul arhivei:', err);
      onFeedback('Nu s-a putut exporta arhiva.', 'error');
    } finally {
      setExporting(false);
    }
  }, [exportDates.end, exportDates.start, onFeedback]);

  const handleDelete = useCallback(async () => {
    if (!deleteDates.start || !deleteDates.end) {
      onFeedback('Selectează intervalul pentru ștergere.', 'info');
      return;
    }
    const confirmDelete = window.confirm(
      `Ești sigur că vrei să ștergi comenzile arhivate între ${deleteDates.start} și ${deleteDates.end}? Această acțiune este ireversibilă.`,
    );
    if (!confirmDelete) {
      return;
    }
    setDeleting(true);
    try {
      await httpClient.delete('/api/admin/delete-archived', {
        data: {
          startDate: deleteDates.start,
          endDate: deleteDates.end,
        },
      });
      onFeedback('Comenzile arhivate au fost șterse.', 'success');
      await refetch();
    } catch (err) {
      console.error('Eroare la ștergerea arhivei:', err);
      onFeedback('Nu s-au putut șterge comenzile arhivate.', 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteDates.end, deleteDates.start, onFeedback, refetch]);

  return (
    <div className="orders-archive-panel">
      <section className="archive-stats-grid">
        <StatCard
          title="Comenzi active"
          helper="În baza de date curentă"
          value={`${stats.activeOrders}`}
          icon={<span>📦</span>}
        />
        <StatCard
          title="Comenzi arhivate"
          helper="În tabela orders_archive"
          value={`${stats.archivedOrders}`}
          icon={<span>📁</span>}
        />
        <StatCard
          title="Prima arhivare"
          helper="Dată minimă în arhivă"
          value={stats.oldestArchive ? new Date(stats.oldestArchive).toLocaleDateString('ro-RO') : 'N/A'}
          icon={<span>📅</span>}
        />
        <StatCard
          title="Total înregistrări"
          helper="Active + arhivate"
          value={`${stats.totalSize}`}
          icon={<span>Σ</span>}
        />
      </section>

      {loading ? <p>Se încarcă statisticile...</p> : null}
      {error ? <InlineAlert variant="error" message={error} /> : null}

      <section className="archive-actions">
        <div className="archive-card">
          <h3>Arhivare manuală</h3>
          <p>Mută în mod manual comenzile vechi (peste 1 an) în tabela orders_archive.</p>
          <button type="button" className="btn btn-primary" onClick={handleArchive} disabled={archiveLoading}>
            {archiveLoading ? 'Se arhivează...' : 'Lansează arhivarea'}
          </button>
        </div>

        <div className="archive-card">
          <h3>Export CSV</h3>
          <p>Selectează intervalul de timp pe care dorești să îl exporți.</p>
          <div className="archive-card__range">
            <label htmlFor="archive-export-start">De la</label>
            <input
              id="archive-export-start"
              type="date"
              value={exportDates.start ?? ''}
              onChange={(event) => setExportDates((prev) => ({ ...prev, start: event.target.value || null }))}
            />
            <label htmlFor="archive-export-end">Până la</label>
            <input
              id="archive-export-end"
              type="date"
              value={exportDates.end ?? ''}
              onChange={(event) => setExportDates((prev) => ({ ...prev, end: event.target.value || null }))}
            />
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Se exportă...' : 'Exportă CSV'}
          </button>
        </div>

        <div className="archive-card">
          <h3>Ștergere arhivă</h3>
          <p>Elimină definitiv comenzile arhivate pentru un interval selectat.</p>
          <div className="archive-card__range">
            <label htmlFor="archive-delete-start">De la</label>
            <input
              id="archive-delete-start"
              type="date"
              value={deleteDates.start ?? ''}
              onChange={(event) => setDeleteDates((prev) => ({ ...prev, start: event.target.value || null }))}
            />
            <label htmlFor="archive-delete-end">Până la</label>
            <input
              id="archive-delete-end"
              type="date"
              value={deleteDates.end ?? ''}
              onChange={(event) => setDeleteDates((prev) => ({ ...prev, end: event.target.value || null }))}
            />
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Se șterge...' : 'Șterge arhiva'}
          </button>
        </div>
      </section>
    </div>
  );
};




