import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, Modal, Alert, Row, Col } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './LocationsPage.css';

interface Location {
  id: number;
  name: string;
  code: string;
  type: 'warehouse' | 'kitchen' | 'bar' | 'storage' | 'other';
  is_active: boolean;
  address?: string;
  notes?: string;
}

export const LocationsPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'warehouse' as Location['type'],
    is_active: true,
    address: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/locations');
      if (response.data?.success) {
        setLocations(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea locațiilor:', error);
      // Fallback pentru development
      setLocations([
        { id: 1, name: 'Bucătărie Principală', code: 'KIT-001', type: 'kitchen', is_active: true },
        { id: 2, name: 'Bar', code: 'BAR-001', type: 'bar', is_active: true },
        { id: 3, name: 'Depozit Central', code: 'WH-001', type: 'warehouse', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTemplate = useCallback(async (template: 'food_truck' | 'restaurant_mic' | 'restaurant_complet') => {
    setLoading(true);
    try {
      const response = await httpClient.post('/api/locations/template', { template });
      if (response.data?.success) {
        setSuccess(`Template "${template}" aplicat cu succes!`);
        await loadLocations();
      }
    } catch (error) {
      console.error('❌ Eroare la aplicarea template-ului:', error);
      setError('Nu s-a putut aplica template-ul.');
    } finally {
      setLoading(false);
    }
  }, [loadLocations]);

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        code: location.code,
        type: location.type,
        is_active: location.is_active,
        address: location.address || '',
        notes: location.notes || '',
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        code: '',
        type: 'warehouse',
        is_active: true,
        address: '',
        notes: '',
      });
    }
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingLocation) {
        await httpClient.put(`/api/locations/${editingLocation.id}`, formData);
        setSuccess('Locația a fost actualizată cu succes!');
      } else {
        await httpClient.post('/api/locations', formData);
        setSuccess('Locația a fost creată cu succes!');
      }
      await loadLocations();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      console.error('❌ Eroare la salvarea locației:', error);
      setError(error.response?.data?.error || 'Nu s-a putut salva locația.');
    }
  };

  const handleToggleActive = async (location: Location) => {
    try {
      await httpClient.patch(`/api/locations/${location.id}/toggle-active`);
      await loadLocations();
    } catch (error) {
      console.error('❌ Eroare la toggle active:', error);
    }
  };

  const handleDelete = async (location: Location) => {
    if (!confirm(`Ești sigur că vrei să ștergi locația "${location.name}"?`)) return;

    try {
      await httpClient.delete(`/api/locations/${location.id}`);
      setSuccess('Locația a fost ștearsă cu succes!');
      await loadLocations();
    } catch (error) {
      console.error('❌ Eroare la ștergerea locației:', error);
      setError('Nu s-a putut șterge locația.');
    }
  };

  return (
    <div className="locations-page">
      <h2 className="mb-4">Gestionare Locații & Depozite</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-warehouse me-2"></i>Gestionare Locații & Depozite
          </h5>
          <Button variant="light" size="sm" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-1"></i>Locație Nouă
          </Button>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>White-Label Template:</strong> Aplicația vine cu 12 gestiuni preset. Activează doar gestiunile pe care le folosești.
          </Alert>

          {/* Quick Setup Templates */}
          <div className="mb-4">
            <h6>
              <i className="fas fa-magic me-1"></i>Quick Setup (Template-uri)
            </h6>
            <Row className="g-2">
              <Col md={3}>
                <Button variant="outline-primary" className="w-100" onClick={() => handleTemplate('food_truck')}>
                  🚚 Food Truck
                </Button>
              </Col>
              <Col md={3}>
                <Button variant="outline-primary" className="w-100" onClick={() => handleTemplate('restaurant_mic')}>
                  🍽️ Restaurant Mic
                </Button>
              </Col>
              <Col md={3}>
                <Button variant="outline-primary" className="w-100" onClick={() => handleTemplate('restaurant_complet')}>
                  🏪 Restaurant Complet
                </Button>
              </Col>
              <Col md={3}>
                <Button variant="outline-secondary" className="w-100" onClick={loadLocations}>
                  🔄 Refresh
                </Button>
              </Col>
            </Row>
          </div>

          {/* Lista Locații */}
          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
              <p className="mt-2">Se încarcă locațiile...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Cod</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length > 0 ? (
                    locations.map((location) => (
                      <tr key={location.id}>
                        <td>{location.name}</td>
                        <td>{location.code}</td>
                        <td>
                          <span className="badge bg-info">{location.type}</span>
                        </td>
                        <td>
                          <span className={`badge bg-${location.is_active ? 'success' : 'secondary'}`}>
                            {location.is_active ? 'Activ' : 'Inactiv'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleOpenModal(location)}
                            className="me-2"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleToggleActive(location)}
                            className="me-2"
                          >
                            <i className={`fas fa-toggle-${location.is_active ? 'on' : 'off'}`}></i>
                          </Button>
                          <Button variant="link" size="sm" onClick={() => handleDelete(location)} className="text-danger">
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Nu există locații configurate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Editare/Creare */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {editingLocation ? 'Editează Locație' : 'Locație Nouă'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nume Locație *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cod *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tip *</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Location['type'] })}
                    required
                  >
                    <option value="warehouse">Depozit</option>
                    <option value="kitchen">Bucătărie</option>
                    <option value="bar">Bar</option>
                    <option value="storage">Stocare</option>
                    <option value="other">Altul</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Adresă</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <Form.Check
              type="switch"
              label="Locație activă"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Anulează
              </Button>
              <Button variant="primary" type="submit">
                {editingLocation ? 'Actualizează' : 'Creează'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

