// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import './EquipmentFormModal.css';

interface Equipment {
  id: number;
  name: string;
  type: string;
  location: string | null;
  min_temp: number | null;
  max_temp: number | null;
  is_active: boolean;
}

interface EquipmentFormModalProps {
  equipment: Equipment | null; // null pentru add, obiect pentru edit
  onSave: (data: any) => void;
  onClose: () => void;
}

export const EquipmentFormModal = ({ equipment, onSave, onClose }: EquipmentFormModalProps) => {
//   const { t } = useTranslation();
  const isEditMode = equipment !== null;

  const [formData, setFormData] = useState({
    name: '',
    type: 'fridge',
    location: '',
    min_temp: '',
    max_temp: '',
    is_active: true,
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        type: equipment.type || 'fridge',
        location: equipment.location || '',
        min_temp: equipment.min_temp !== null ? equipment.min_temp.toString() : '',
        max_temp: equipment.max_temp !== null ? equipment.max_temp.toString() : '',
        is_active: equipment.is_active !== undefined ? equipment.is_active : true,
      });
    }
  }, [equipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      alert('Numele și tipul echipamentului sunt obligatorii');
      return;
    }

    // Validare temperaturi
    if (formData.min_temp && formData.max_temp) {
      const minTemp = parseFloat(formData.min_temp);
      const maxTemp = parseFloat(formData.max_temp);
      if (minTemp >= maxTemp) {
        alert('Temperatura minimă trebuie să fie mai mică decât temperatura maximă');
        return;
      }
    }

    onSave({
      name: formData.name,
      type: formData.type,
      location: formData.location || null,
      min_temp: formData.min_temp ? parseFloat(formData.min_temp) : null,
      max_temp: formData.max_temp ? parseFloat(formData.max_temp) : null,
      is_active: formData.is_active,
      ...(isEditMode && equipment ? { id: equipment.id } : {}),
    });
  };

  const typeOptions = [
    { value: 'fridge', label: 'Frigider' },
    { value: 'freezer', label: 'Congelator' },
    { value: 'hot_holding', label: 'Menținere Caldă' },
    { value: 'receiving', label: 'Recepție' },
    { value: 'other', label: 'Altele' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Editează Echipament' : 'Adaugă Echipament'}</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nume Echipament *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="ex frigider bacanie"
              title="numele echipamentului"
              aria-label="numele echipamentului"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tip Echipament *</label>
            <select
              className="form-control form-select"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              required
              title="selecteaza tipul echipamentului"
              aria-label="selecteaza tipul echipamentului"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Locație</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="ex bucatarie depozit etc"
              title="locatia echipamentului"
              aria-label="locatia echipamentului"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Temperatură Minimă (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.min_temp}
                onChange={(e) => setFormData(prev => ({ ...prev, min_temp: e.target.value }))}
                placeholder="Ex: 0"
                title="temperatura minima acceptabila"
                aria-label="temperatura minima acceptabila"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temperatură Maximă (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.max_temp}
                onChange={(e) => setFormData(prev => ({ ...prev, max_temp: e.target.value }))}
                placeholder="Ex: 4"
                title="temperatura maxima acceptabila"
                aria-label="temperatura maxima acceptabila"
              />
            </div>
          </div>

          {formData.min_temp && formData.max_temp && (
            <div className="form-info">
              <small className="form-text text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Interval sigur: {formData.min_temp}°C - {formData.max_temp}°C
              </small>
            </div>
          )}

          {isEditMode && (
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  title="Activează/Dezactivează echipamentul"
                  aria-label="Activează/Dezactivează echipamentul"
                />
                <label className="form-check-label" htmlFor="is_active">
                  Echipament activ
                </label>
              </div>
            </div>
          )}
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




