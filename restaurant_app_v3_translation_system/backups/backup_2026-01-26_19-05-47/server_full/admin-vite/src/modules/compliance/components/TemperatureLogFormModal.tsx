// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import './TemperatureLogFormModal.css';

interface Equipment {
  id: number;
  name: string;
  type: string;
  min_temp: number | null;
  max_temp: number | null;
}

interface TemperatureLogFormModalProps {
  equipment: Equipment[];
  onSave: (data: any) => void;
  onClose: () => void;
}

export const TemperatureLogFormModal = ({ equipment, onSave, onClose }: TemperatureLogFormModalProps) => {
//   const { t } = useTranslation();
  const [formData, setFormData] = useState({
    equipment_id: '',
    temperature: '',
    operator_id: '',
    notes: '',
  });

  const selectedEq = equipment.find(eq => eq.id === parseInt(formData.equipment_id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipment_id || !formData.temperature) {
      alert('Echipamentul și temperatura sunt obligatorii');
      return;
    }

    onSave({
      equipment_id: parseInt(formData.equipment_id),
      temperature: parseFloat(formData.temperature),
      operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
      notes: formData.notes || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>"adauga inregistrare temperatura"</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Echipament *</label>
            <select
              className="form-control form-select"
              value={formData.equipment_id}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment_id: e.target.value }))}
              required
              title="selecteaza echipamentul"
              aria-label="selecteaza echipamentul"
            >
              <option value="">"selecteaza echipamentul"</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.type})
                  {eq.min_temp !== null && eq.max_temp !== null && 
                    ` - Interval: ${eq.min_temp}°C - ${eq.max_temp}°C`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Temperatură (°C) *</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
              required
              placeholder="Ex: 4.5"
            />
            {selectedEq && selectedEq.min_temp !== null && selectedEq.max_temp !== null && (
              <small className="form-text text-muted">
                Interval sigur: {selectedEq.min_temp}°C - {selectedEq.max_temp}°C
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">"Operator"</label>
            <input
              type="text"
              className="form-control"
              value={formData.operator_id}
              onChange={(e) => setFormData(prev => ({ ...prev, operator_id: e.target.value }))}
              placeholder="ID operator (opțional)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note adiționale (opțional)"
            />
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>"Anulează"</button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            <i className="fas fa-save me-2"></i>
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
};




