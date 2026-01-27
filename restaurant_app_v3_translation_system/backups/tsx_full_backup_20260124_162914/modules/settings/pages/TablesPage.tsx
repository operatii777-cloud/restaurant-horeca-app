// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, Modal, Alert, Row, Col } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './TablesPage.css';

interface TableConfig {
  id: number;
  table_number: number;
  area_id: number;
  area_name?: string;
  seats: number;
  shape: 'round' | 'square' | 'rectangular' | 'oval';
  is_active: boolean;
  notes?: string;
}

interface Area {
  id: number;
  name: string;
}

export const TablesPage = () => {
//   const { t } = useTranslation();
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableConfig | null>(null);
  const [filterArea, setFilterArea] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    table_number: 1,
    area_id: 0,
    seats: 2,
    shape: 'round' as TableConfig['shape'],
    is_active: true,
    notes: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    start_table: 1,
    end_table: 10,
    area_id: 0,
    seats: 2,
    shape: 'round' as TableConfig['shape'],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAreas();
    loadTables();
  }, []);

  const loadAreas = useCallback(async () => {
    try {
      const response = await httpClient.get('/api/areas');
      if (response.data?.success) {
        setAreas(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea zonelor:', error);
    }
  }, []);

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/tables', {
        params: {
          area_id: filterArea || undefined,
          status: filterStatus || undefined,
        },
      });
      if (response.data?.success) {
        setTables(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea meselor:', error);
      // Fallback pentru development
      setTables([
        {
          id: 1,
          table_number: 1,
          area_id: 1,
          area_name: 'Interior',
          seats: 4,
          shape: 'round',
          is_active: true,
        },
        {
          id: 2,
          table_number: 2,
          area_id: 1,
          area_name: 'Interior',
          seats: 2,
          shape: 'square',
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterArea, filterStatus]);

  useEffect(() => {
    loadTables();
  }, [filterArea, filterStatus, loadTables]);

  const handleOpenModal = (table?: TableConfig) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number,
        area_id: table.area_id,
        seats: table.seats,
        shape: table.shape,
        is_active: table.is_active,
        notes: table.notes || '',
      });
    } else {
      setEditingTable(null);
      setFormData({
        table_number: tables.length > 0 ? Math.max(...tables.map((t) => t.table_number)) + 1 : 1,
        area_id: areas.length > 0 ? areas[0].id : 0,
        seats: 2,
        shape: 'round',
        is_active: true,
        notes: '',
      });
    }
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTable(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingTable) {
        await httpClient.put(`/api/tables/${editingTable.id}`, formData);
        setSuccess('Masa a fost actualizată cu succes!');
      } else {
        await httpClient.post('/api/tables', formData);
        setSuccess('Masa a fost creată cu succes!');
      }
      await loadTables();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      console.error('❌ Eroare la salvarea mesei:', error);
      setError(error.response?.data?.error || 'Nu s-a putut salva masa.');
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await httpClient.post('/api/tables/bulk', bulkFormData);
      setSuccess(`Mesele ${bulkFormData.start_table}-${bulkFormData.end_table} au fost create cu succes!`);
      setShowBulkModal(false);
      await loadTables();
    } catch (error: any) {
      console.error('❌ Eroare la crearea în masă:', error);
      setError(error.response?.data?.error || 'Nu s-a putut crea mesele în masă.');
    }
  };

  const handleToggleActive = async (table: TableConfig) => {
    try {
      await httpClient.patch(`/api/tables/${table.id}/toggle-active`);
      await loadTables();
    } catch (error) {
      console.error('❌ Eroare la toggle active:', error);
    }
  };

  const handleDelete = async (table: TableConfig) => {
    if (!confirm(`Ești sigur că vrei să ștergi masa ${table.table_number}?`)) return;

    try {
      await httpClient.delete(`/api/tables/${table.id}`);
      setSuccess('Masa a fost ștearsă cu succes!');
      await loadTables();
    } catch (error) {
      console.error('❌ Eroare la ștergerea mesei:', error);
      setError('Nu s-a putut șterge masa.');
    }
  };

  const filteredTables = tables.filter((table) => {
    if (filterArea && table.area_id !== filterArea) return false;
    if (filterStatus === 'configured' && !table.area_id) return false;
    if (filterStatus === 'unconfigured' && table.area_id) return false;
    return true;
  });

  return (
    <div className="tables-page">
      <h2 className="mb-4">Configurare Mese (1-200)</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-chair me-2"></i>Configurare Mese (1-200)
          </h5>
          <div>
            <Button variant="primary" size="sm" className="me-2" onClick={() => setShowBulkModal(true)}>
              <i className="fas fa-layer-group me-1"></i>Configurare Bulk
            </Button>
            <Button variant="light" size="sm" onClick={() => handleOpenModal()}>
              <i className="fas fa-plus me-1"></i>"masa noua"</Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>"configureaza fiecare masa zona numar locuri forma "</Alert>

          {/* Filtre */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>"filtreaza dupa zona"</Form.Label>
              <Form.Select value={filterArea} onChange={(e) => setFilterArea(e.target.value ? parseInt(e.target.value) : '')}>
                <option value="">"toate zonele"</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Status:</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Toate</option>
                <option value="configured">Configurate</option>
                <option value="unconfigured">Neconfigrate</option>
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="secondary" className="w-100" onClick={loadTables}>
                <i className="fas fa-sync me-1"></i>Refresh
              </Button>
            </Col>
          </Row>

          {/* Tabel Mese */}
          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-warning"></i>
              <p className="mt-2">"se incarca mesele"</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: "Auto" }}>
              <Table hover size="sm">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Masă #</th>
                    <th>Zonă</th>
                    <th>Locuri</th>
                    <th>Formă</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.length > 0 ? (
                    filteredTables
                      .sort((a, b) => a.table_number - b.table_number)
                      .map((table) => (
                        <tr key={table.id}>
                          <td>
                            <strong>#{table.table_number}</strong>
                          </td>
                          <td>{table.area_name || '—'}</td>
                          <td>{table.seats}</td>
                          <td>
                            <span className="badge bg-info">
                              {table.shape === 'round' ? 'Rotund' : table.shape === 'square' ? 'Pătrat' : table.shape === 'rectangular' ? 'Dreptunghiular' : 'Oval'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${table.is_active ? 'success' : 'secondary'}`}>
                              {table.is_active ? 'Activ' : 'Inactiv'}
                            </span>
                          </td>
                          <td>
                            <Button variant="link" size="sm" onClick={() => handleOpenModal(table)} className="me-2">
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleToggleActive(table)}
                              className="me-2"
                            >
                              <i className={`fas fa-toggle-${table.is_active ? 'on' : 'off'}`}></i>
                            </Button>
                            <Button variant="link" size="sm" onClick={() => handleDelete(table)} className="text-danger">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">"nu exista mese configurate"</td>
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
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>{editingTable ? `Editează Masa #${editingTable.table_number}` : 'Masă Nouă'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Număr Masă *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="200"
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: parseInt(e.target.value) || 1 })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zonă *</Form.Label>
                  <Form.Select
                    value={formData.area_id}
                    onChange={(e) => setFormData({ ...formData, area_id: parseInt(e.target.value) || 0 })}
                    required
                  >
                    <option value="">"selecteaza zona"</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Număr Locuri *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 2 })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Formă *</Form.Label>
                  <Form.Select
                    value={formData.shape}
                    onChange={(e) => setFormData({ ...formData, shape: e.target.value as TableConfig['shape'] })}
                    required
                  >
                    <option value="round">Rotund</option>
                    <option value="square">Pătrat</option>
                    <option value="rectangular">Dreptunghiular</option>
                    <option value="oval">Oval</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <Form.Check
              type="switch"
              label="masa activa"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={handleCloseModal}>Anulează</Button>
              <Button variant="warning" type="submit">
                {editingTable ? 'Actualizează' : 'Creează'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Configurare Bulk */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Configurare Bulk Mese</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBulkSubmit}>
            <Alert variant="info">Creează multiple mese deodată. Mesele vor fi create automat cu numere consecutive.</Alert>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Masă Start *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="200"
                    value={bulkFormData.start_table}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, start_table: parseInt(e.target.value) || 1 })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Masă Sfârșit *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="200"
                    value={bulkFormData.end_table}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, end_table: parseInt(e.target.value) || 10 })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zonă *</Form.Label>
                  <Form.Select
                    value={bulkFormData.area_id}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, area_id: parseInt(e.target.value) || 0 })}
                    required
                  >
                    <option value="">"selecteaza zona"</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Număr Locuri *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={bulkFormData.seats}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, seats: parseInt(e.target.value) || 2 })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Formă *</Form.Label>
              <Form.Select
                value={bulkFormData.shape}
                onChange={(e) => setBulkFormData({ ...bulkFormData, shape: e.target.value as TableConfig['shape'] })}
                required
              >
                <option value="round">Rotund</option>
                <option value="square">Pătrat</option>
                <option value="rectangular">Dreptunghiular</option>
                <option value="oval">Oval</option>
              </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowBulkModal(false)}>Anulează</Button>
              <Button variant="primary" type="submit">Creează mese</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};




