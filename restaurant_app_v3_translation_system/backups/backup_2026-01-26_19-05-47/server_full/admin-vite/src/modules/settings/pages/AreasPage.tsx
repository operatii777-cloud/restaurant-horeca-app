// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, Modal, Alert, Row, Col } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AreasPage.css';

interface Area {
  id: number;
  name: string;
  code: string;
  description?: string;
  capacity?: number;
  is_active: boolean;
  sort_order?: number;
}

export const AreasPage = () => {
//   const { t } = useTranslation();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    capacity: 0,
    is_active: true,
    sort_order: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/areas');
      if (response.data?.success) {
        setAreas(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea zonelor:', error);
      // Fallback pentru development
      setAreas([
        { id: 1, name: 'Interior', code: 'INT', description: 'Sala principală', capacity: 50, is_active: true, sort_order: 1 },
        { id: 2, name: 'Terasă', code: 'TER', description: 'Terasă acoperită', capacity: 30, is_active: true, sort_order: 2 },
        { id: 3, name: 'Nefumători', code: 'NEF', description: 'Zonă nefumători', capacity: 20, is_active: true, sort_order: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenModal = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        code: area.code,
        description: area.description || '',
        capacity: area.capacity || 0,
        is_active: area.is_active,
        sort_order: area.sort_order || 0,
      });
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        capacity: 0,
        is_active: true,
        sort_order: 0,
      });
    }
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingArea(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingArea) {
        await httpClient.put(`/api/areas/${editingArea.id}`, formData);
        setSuccess('Zona a fost actualizată cu succes!');
      } else {
        await httpClient.post('/api/areas', formData);
        setSuccess('Zona a fost creată cu succes!');
      }
      await loadAreas();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      console.error('❌ Eroare la salvarea zonei:', error);
      setError(error.response?.data?.error || 'Nu s-a putut salva zona.');
    }
  };

  const handleToggleActive = async (area: Area) => {
    try {
      await httpClient.patch(`/api/areas/${area.id}/toggle-active`);
      await loadAreas();
    } catch (error) {
      console.error('❌ Eroare la toggle active:', error);
    }
  };

  const handleDelete = async (area: Area) => {
    if (!confirm(`Ești sigur că vrei să ștergi zona "${area.name}"?`)) return;

    try {
      await httpClient.delete(`/api/areas/${area.id}`);
      setSuccess('Zona a fost ștearsă cu succes!');
      await loadAreas();
    } catch (error) {
      console.error('❌ Eroare la ștergerea zonei:', error);
      setError('Nu s-a putut șterge zona.');
    }
  };

  return (
    <div className="areas-page">
      <h2 className="mb-4">"gestionare zone restaurant"</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-map-marked-alt me-2"></i>"gestionare zone restaurant"</h5>
          <Button variant="light" size="sm" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-1"></i>"adauga zona noua"</Button>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            Configurează zonele restaurantului (Interior, Terasă, Nefumători, etc.) pentru organizare mese și raportare.
          </Alert>

          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-success"></i>
              <p className="mt-2">"se incarca zonele"</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Cod</th>
                    <th>Descriere</th>
                    <th>Capacitate</th>
                    <th>Ordine</th>
                    <th>Status</th>
                    <th>"Acțiuni"</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.length > 0 ? (
                    areas
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((area) => (
                        <tr key={area.id}>
                          <td>
                            <strong>{area.name}</strong>
                          </td>
                          <td>{area.code}</td>
                          <td>{area.description || '—'}</td>
                          <td>{area.capacity || '—'}</td>
                          <td>{area.sort_order || 0}</td>
                          <td>
                            <span className={`badge bg-${area.is_active ? 'success' : 'secondary'}`}>
                              {area.is_active ? 'Activ' : 'Inactiv'}
                            </span>
                          </td>
                          <td>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleOpenModal(area)}
                              className="me-2"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleToggleActive(area)}
                              className="me-2"
                            >
                              <i className={`fas fa-toggle-${area.is_active ? 'on' : 'off'}`}></i>
                            </Button>
                            <Button variant="link" size="sm" onClick={() => handleDelete(area)} className="text-danger">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">"nu exista zone configurate"</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Editare/Creare */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>{editingArea ? 'Editează Zonă' : 'Zonă Nouă'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nume Zonă *</Form.Label>
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
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacitate</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descriere</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ordine Sortare</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  label="zona activa"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </Col>
            </Row>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={handleCloseModal}>"Anulează"</Button>
              <Button variant="success" type="submit">
                {editingArea ? 'Actualizează' : 'Creează'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};




