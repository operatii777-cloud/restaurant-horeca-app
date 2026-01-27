import { useState } from 'react';
import './CleaningScheduleFormModal.css';

interface CleaningScheduleFormModalProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

export const CleaningScheduleFormModal = ({ onSave, onClose }: CleaningScheduleFormModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    shift_type: 'both',
    checklist_items: [''] as string[],
    assigned_to: '',
    due_date: '',
  });

  const handleAddChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist_items: [...prev.checklist_items, '']
    }));
  };

  const handleRemoveChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.filter((_, i) => i !== index)
    }));
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.due_date) {
      alert('Titlul și termenul sunt obligatorii');
      return;
    }

    const validItems = formData.checklist_items.filter(item => item.trim() !== '');
    if (validItems.length === 0) {
      alert('Adăugați cel puțin un item în checklist');
      return;
    }

    onSave({
      ...formData,
      checklist_items: validItems,
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Creează Task Curățenie</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Titlu *</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Ex: Curățenie Deschidere Tură"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descriere</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descriere task curățenie"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Frecvență *</label>
              <select
                className="form-control form-select"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                required
                title="Selectează frecvența"
                aria-label="Selectează frecvența"
              >
                <option value="daily">Zilnic</option>
                <option value="weekly">Săptămânal</option>
                <option value="monthly">Lunar</option>
                <option value="custom">Personalizat</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tură</label>
              <select
                className="form-control form-select"
                value={formData.shift_type}
                onChange={(e) => setFormData(prev => ({ ...prev, shift_type: e.target.value }))}
                title="Selectează tura"
                aria-label="Selectează tura"
              >
                <option value="opening">Deschidere</option>
                <option value="closing">Închidere</option>
                <option value="both">Ambele</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Termen *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
              title="Data și ora termenului"
              aria-label="Data și ora termenului"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Checklist Items *</label>
            {formData.checklist_items.map((item, index) => (
              <div key={index} className="checklist-item-input">
                  <input
                  type="text"
                  className="form-control"
                  value={item}
                  onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  title={`Checklist item ${index + 1}`}
                  aria-label={`Checklist item ${index + 1}`}
                />
                {formData.checklist_items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveChecklistItem(index)}
                    title="Șterge item"
                    aria-label="Șterge item"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleAddChecklistItem}
            >
              <i className="fas fa-plus me-1"></i>
              Adaugă Item
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Anulează
          </button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            <i className="fas fa-save me-2"></i>
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
};

