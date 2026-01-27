// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import './MaintenanceFormModal.css';

interface Equipment {
  id: number;
  name: string;
  type: string;
}

interface MaintenanceFormModalProps {
  equipment: Equipment[];
  onSave: (data: any) => void;
  onClose: () => void;
}

export const MaintenanceFormModal = ({ equipment, onSave, onClose }: MaintenanceFormModalProps) => {
//   const { t } = useTranslation();
  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_type: 'preventive',
    scheduled_date: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipment_id || !formData.scheduled_date) {
      alert('Echipamentul și data programată sunt obligatorii');
      return;
    }

    onSave({
      equipment_id: parseInt(formData.equipment_id),
      maintenance_type: formData.maintenance_type,
      scheduled_date: formData.scheduled_date,
      description: formData.description || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>"programeaza mentenanta"</h2>
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
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tip Mentenanță *</label>
            <select
              className="form-control form-select"
              value={formData.maintenance_type}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value }))}
              required
              title="selecteaza tipul mentenantei"
              aria-label="selecteaza tipul mentenantei"
            >
              <option value="preventive">"Preventivă"</option>
              <option value="repair">"Reparație"</option>
              <option value="calibration">Calibrare</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Data Programată *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.scheduled_date}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              required
              title="data si ora programata"
              aria-label="data si ora programata"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descriere</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="descriere mentenanta"
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




