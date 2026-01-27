// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import type { MarketingCampaign } from '../api/marketingApi';
import 'bootstrap/dist/css/bootstrap.min.css';

interface CampaignModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Omit<MarketingCampaign, 'id'>) => Promise<void>;
}

export const CampaignModal = ({ show, onClose, onSave }: CampaignModalProps) => {
//   const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: 'discount',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.start_date || !formData.end_date) {
      setError('Numele și perioada sunt obligatorii.');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      setFormData({
        name: '',
        type: 'discount',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
      });
    } catch (err: any) {
      setError(err?.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-tags me-2"></i>"campanie noua"</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Nume Campanie *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              placeholder="ex reducere vip clienti"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tip Campanie *</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              required
            >
              <option value="discount">Reducere</option>
              <option value="loyalty">"Fidelizare"</option>
              <option value="promotion">"Promoție"</option>
            </Form.Select>
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Data început *</Form.Label>
              <Form.Control
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Data sfârșit *</Form.Label>
              <Form.Control
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Status *</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              required
            >
              <option value="active">Activ</option>
              <option value="inactive">Inactiv</option>
              <option value="scheduled">Programat</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>"Anulează"</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>"se salveaza"</>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Salvează
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};




