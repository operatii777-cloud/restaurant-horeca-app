// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import './BulkTableConfigModal.css';

interface Table {
  id: number;
  table_number: string;
  capacity: number;
  location: string | null;
  is_active: boolean;
  seats?: number;
  shape?: string;
  area_id?: number | null;
}

interface Zone {
  id: number;
  name: string;
  type?: string;
  is_active: boolean;
}

interface BulkTableConfigModalProps {
  tables: Table[];
  zones: Zone[];
  onSave: () => Promise<void>;
  onClose: () => void;
}

export const BulkTableConfigModal = ({ tables, zones, onSave, onClose }: BulkTableConfigModalProps) => {
//   const { t } = useTranslation();
  const [startTable, setStartTable] = useState<number>(1);
  const [endTable, setEndTable] = useState<number>(200);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [seats, setSeats] = useState<number>(4);
  const [shape, setShape] = useState<string>('square');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: updateTable } = useApiMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const tablesToUpdate = tables.filter(
        (table) =>
          parseInt(table.table_number) >= startTable && parseInt(table.table_number) <= endTable
      );

      const updatePromises = tablesToUpdate.map((table) =>
        updateTable({
          url: `/api/tables/${table.id}`,
          method: 'PUT',
          data: {
            table_number: table.table_number,
            area_id: selectedZone,
            seats: seats,
            capacity: seats,
            shape: shape,
            is_active: isActive,
            location: selectedZone ? zones.find((z) => z.id === selectedZone)?.name || null : null,
          },
        })
      );

      await Promise.all(updatePromises);
      await onSave();
    } catch (error) {
      console.error('Eroare la configurare bulk:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tablesCount = tables.filter(
    (table) =>
      parseInt(table.table_number) >= startTable && parseInt(table.table_number) <= endTable
  ).length;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="📦 Configurare Bulk Mese"
    >
      <form onSubmit={handleSubmit} className="bulk-table-config-form">
        <div className="bulk-table-config-form__info">
          <p>"configureaza mesele de la"<strong>{startTable}</strong> la <strong>{endTable}</strong>.
            <br />
            <span className="bulk-table-config-form__count">
              {tablesCount} mese vor fi actualizate
            </span>
          </p>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="startTable" className="bulk-table-config-form__label">"masa de la"</label>
          <input
            type="number"
            id="startTable"
            className="bulk-table-config-form__input"
            min={1}
            max={200}
            value={startTable}
            onChange={(e) => setStartTable(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="endTable" className="bulk-table-config-form__label">"masa pana la"</label>
          <input
            type="number"
            id="endTable"
            className="bulk-table-config-form__input"
            min={1}
            max={200}
            value={endTable}
            onChange={(e) => setEndTable(parseInt(e.target.value) || 200)}
            required
          />
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="bulkZone" className="bulk-table-config-form__label">"Zonă"</label>
          <select
            id="bulkZone"
            className="bulk-table-config-form__input"
            value={selectedZone?.toString() || ''}
            onChange={(e) => setSelectedZone(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">"fara zona"</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="bulkSeats" className="bulk-table-config-form__label">"numar locuri"</label>
          <input
            type="number"
            id="bulkSeats"
            className="bulk-table-config-form__input"
            min={1}
            max={20}
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value) || 4)}
            required
          />
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="bulkShape" className="bulk-table-config-form__label">"Formă"</label>
          <select
            id="bulkShape"
            className="bulk-table-config-form__input"
            value={shape}
            onChange={(e) => setShape(e.target.value)}
          >
            <option value="square">"Pătrat"</option>
            <option value="round">Rotund</option>
            <option value="rectangle">Dreptunghi</option>
            <option value="oval">Oval</option>
          </select>
        </div>

        <div className="bulk-table-config-form__field">
          <label className="bulk-table-config-form__label">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="bulk-table-config-form__checkbox-label">Mese active</span>
          </label>
        </div>

        <div className="bulk-table-config-form__actions">
          <button
            type="button"
            className="bulk-table-config-form__btn bulk-table-config-form__btn--secondary"
            onClick={onClose}
            disabled={isSaving}
          >"Anulează"</button>
          <button
            type="submit"
            className="bulk-table-config-form__btn bulk-table-config-form__btn--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Se salvează...' : `💾 Aplică pe ${tablesCount} mese`}
          </button>
        </div>
      </form>
    </Modal>
  );
};




