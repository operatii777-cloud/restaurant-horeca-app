import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import './TableEditorModal.css';

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

interface TableEditorModalProps {
  table: Table;
  zones: Zone[];
  onSave: (tableData: Partial<Table>) => Promise<void>;
  onClose: () => void;
}

export const TableEditorModal = ({ table, zones, onSave, onClose }: TableEditorModalProps) => {
  const [formData, setFormData] = useState<Partial<Table>>({
    table_number: table.table_number,
    capacity: table.capacity || table.seats || 4,
    seats: table.seats || table.capacity || 4,
    location: table.location || null,
    area_id: table.area_id || null,
    shape: table.shape || 'square',
    is_active: table.is_active !== undefined ? table.is_active : true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof Table, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Configurare Masă #${table.table_number}`}
    >
      <form onSubmit={handleSubmit} className="table-editor-form">
        <div className="table-editor-form__field">
          <label htmlFor="area" className="table-editor-form__label">
            Zonă
          </label>
          <select
            id="area"
            className="table-editor-form__input"
            value={formData.area_id?.toString() || ''}
            onChange={(e) => handleChange('area_id', e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Fără zonă</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="table-editor-form__field">
          <label htmlFor="seats" className="table-editor-form__label">
            Număr locuri
          </label>
          <input
            type="number"
            id="seats"
            className="table-editor-form__input"
            min={1}
            max={20}
            value={formData.seats || formData.capacity || 4}
            onChange={(e) => {
              const seats = parseInt(e.target.value) || 4;
              handleChange('seats', seats);
              handleChange('capacity', seats);
            }}
          />
        </div>

        <div className="table-editor-form__field">
          <label htmlFor="shape" className="table-editor-form__label">
            Formă
          </label>
          <select
            id="shape"
            className="table-editor-form__input"
            value={formData.shape || 'square'}
            onChange={(e) => handleChange('shape', e.target.value)}
          >
            <option value="square">Pătrat</option>
            <option value="round">Rotund</option>
            <option value="rectangle">Dreptunghi</option>
            <option value="oval">Oval</option>
          </select>
        </div>

        <div className="table-editor-form__field">
          <label className="table-editor-form__label">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(e) => handleChange('is_active', e.target.checked)}
            />
            <span className="table-editor-form__checkbox-label">Masă activă</span>
          </label>
        </div>

        <div className="table-editor-form__actions">
          <button
            type="button"
            className="table-editor-form__btn table-editor-form__btn--secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Anulează
          </button>
          <button
            type="submit"
            className="table-editor-form__btn table-editor-form__btn--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Se salvează...' : '💾 Salvează'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

