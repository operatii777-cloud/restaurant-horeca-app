import { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import './CleaningTaskModal.css';

interface CleaningTaskModalProps {
  task: any;
  onComplete: () => void;
  onClose: () => void;
}

export const CleaningTaskModal = ({ task, onComplete, onClose }: CleaningTaskModalProps) => {
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [signature, setSignature] = useState<string>('');
  
  const checklistUrl = task?.id ? `/api/compliance/cleaning-schedule/${task.id}/checklist` : null;
  const { data: checklist, refetch: refetchChecklist } = useApiQuery(checklistUrl);

  useEffect(() => {
    if (checklist?.data) {
      setChecklistItems(checklist.data);
    }
  }, [checklist]);

  const handleToggleItem = async (itemId: number, isChecked: boolean) => {
    try {
      await httpClient.put(`/api/compliance/cleaning-schedule/${task.id}/checklist/${itemId}`, {
        is_checked: !isChecked,
        checked_by: 1, // TODO: Get from auth context
      });
      refetchChecklist();
    } catch (error) {
      console.error('Eroare la actualizarea checklist-ului:', error);
    }
  };

  const handleComplete = async () => {
    if (checklistItems.some(item => !item.is_checked)) {
      if (!confirm('Nu toate item-urile sunt bifate. Sigur doriți să completați task-ul?')) {
        return;
      }
    }

    try {
      await httpClient.put(`/api/compliance/cleaning-schedule/${task.id}/complete`, {
        completed_by: 1, // TODO: Get from auth context
        signature_image: signature || null,
      });
      onComplete();
    } catch (error) {
      console.error('Eroare la completarea task-ului:', error);
      alert('Eroare la completarea task-ului');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="task-info">
            <p><strong>Frecvență:</strong> {task.frequency}</p>
            <p><strong>Tură:</strong> {task.shift_type}</p>
            <p><strong>Termen:</strong> {new Date(task.due_date).toLocaleString('ro-RO')}</p>
            {task.description && <p><strong>Descriere:</strong> {task.description}</p>}
          </div>

          <div className="checklist-section">
            <h3>Checklist</h3>
            <div className="checklist-items">
              {checklistItems.map((item) => (
                <div key={item.id} className="checklist-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.is_checked === 1}
                      onChange={() => handleToggleItem(item.id, item.is_checked === 1)}
                      disabled={task.status === 'completed'}
                    />
                    <span className="checkmark"></span>
                    <span className={item.is_checked === 1 ? 'checked' : ''}>{item.item_text}</span>
                  </label>
                  {item.checked_by_name && (
                    <small className="checked-by">
                      Bifat de {item.checked_by_name} la {new Date(item.checked_at).toLocaleString('ro-RO')}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>

          {task.status !== 'completed' && (
            <div className="signature-section">
              <h3>Semnătură Digitală (Opțional)</h3>
              <textarea
                className="form-control"
                rows={3}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Nume operator sau semnătură (text)"
              />
              <small className="form-text text-muted">
                Notă: Pentru semnătură canvas, va trebui implementat un component separat
              </small>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Închide
          </button>
          {task.status !== 'completed' && (
            <button type="button" className="btn btn-primary" onClick={handleComplete}>
              <i className="fas fa-check me-2"></i>
              Completează Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

