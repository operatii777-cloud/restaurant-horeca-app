// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { DataGrid } from '@/shared/components/DataGrid';
import { wasteApi } from '../api/wasteApi';
import type { WasteRecord, WasteDashboard } from '../api/wasteApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './WastePage.css';

const WASTE_TYPES = [
  { value: 'food', label: 'Mâncare' },
  { value: 'beverage', label: 'Băuturi' },
  { value: 'operational', label: 'Operațional' },
];

const WASTE_REASONS = {
  food: [
    { value: 'expired', label: 'Expirat/Alterat' },
    { value: 'burnt', label: 'Ars/Pregătit greșit' },
    { value: 'returned', label: 'Returnat de client' },
    { value: 'inventory_discrepancy', label: 'Diferență inventar' },
  ],
  beverage: [
    { value: 'damaged', label: 'Sticle sparte' },
    { value: 'expired', label: 'Produse expirate' },
    { value: 'sample', label: 'Probe/Degustare' },
  ],
  operational: [
    { value: 'theft', label: 'Furt' },
    { value: 'sample', label: 'Probe staff' },
    { value: 'other', label: 'Altele' },
  ],
};

const ITEM_TYPES = [
  { value: 'ingredient', label: 'Ingredient' },
  { value: 'menu_product', label: 'Produs Meniu' },
  { value: 'packaging', label: 'Ambalaj' },
];

export const WastePage = () => {
//   const { t } = useTranslation();
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [dashboard, setDashboard] = useState<WasteDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWaste, setEditingWaste] = useState<WasteRecord | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<Partial<WasteRecord>>({
    waste_type: 'food',
    waste_reason: 'expired',
    item_type: 'ingredient',
    item_name: '',
    quantity: 0,
    unit_of_measure: 'kg',
    unit_cost: 0,
    location_id: undefined,
    description: '',
    waste_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [records, dashboardData] = await Promise.all([
        wasteApi.fetchWaste(),
        wasteApi.fetchDashboard(period),
      ]);
      setWasteRecords(records);
      setDashboard(dashboardData);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea datelor:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenModal = (waste?: WasteRecord) => {
    if (waste) {
      setEditingWaste(waste);
      setFormData(waste);
    } else {
      setEditingWaste(null);
      setFormData({
        waste_type: 'food',
        waste_reason: 'expired',
        item_type: 'ingredient',
        item_name: '',
        quantity: 0,
        unit_of_measure: 'kg',
        unit_cost: 0,
        location_id: undefined,
        description: '',
        waste_date: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWaste(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_name || !formData.quantity || !formData.unit_cost || !formData.waste_date) {
      setFeedback({ type: 'error', message: 'Completați toate câmpurile obligatorii!' });
      return;
    }

    try {
      if (editingWaste?.id) {
        await wasteApi.updateWaste(editingWaste.id, formData as WasteRecord);
        setFeedback({ type: 'success', message: 'Pierdere actualizată cu succes!' });
      } else {
        await wasteApi.createWaste(formData as Omit<WasteRecord, 'id' | 'reported_at' | 'total_cost'>);
        setFeedback({ type: 'success', message: 'Pierdere raportată cu succes!' });
      }
      handleCloseModal();
      await fetchData();
    } catch (err: any) {
      console.error('❌ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această înregistrare?')) return;

    try {
      await wasteApi.deleteWaste(id);
      setFeedback({ type: 'success', message: 'Înregistrare ștearsă cu succes!' });
      await fetchData();
    } catch (err: any) {
      console.error('❌ Eroare la ștergere:', err);
      setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const getWasteTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      food: 'danger',
      beverage: 'warning',
      operational: 'info',
    };
    return <Badge bg={colors[type] || 'secondary'}>{WASTE_TYPES.find(t => t.value === type)?.label || type}</Badge>;
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'waste_date', headerName: 'Data', width: 120 },
    { field: 'item_name', headerName: 'Item', flex: 1 },
    {
      field: 'waste_type',
      headerName: 'Tip',
      width: 120,
      cellRenderer: (params: any) => getWasteTypeBadge(params.value),
    },
    { field: 'waste_reason', headerName: 'Motiv', width: 150 },
    { field: 'quantity', headerName: 'Cantitate', width: 100 },
    { field: 'unit_of_measure', headerName: 'UM', width: 80 },
    {
      field: 'total_cost',
      headerName: 'Cost Total',
      width: 120,
      cellRenderer: (params: any) => `${(params.value || 0).toFixed(2)} RON`,
    },
    {
      field: 'actions',
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="d-flex gap-2">
          <Button variant="info" size="sm" onClick={() => handleOpenModal(params.data)} title="Editează">
            <i className="fas fa-edit"></i>
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(params.data.id)} title="Șterge">
            <i className="fas fa-trash-alt"></i>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="waste-page">
      <PageHeader
        title='🗑️ pierderi & waste'
        description="Gestionare pierderi justificate (waste) și nejustificate (losses)"
        actions={[
          {
            label: 'Raportează Pierdere',
            variant: 'primary',
            onClick: () => handleOpenModal(),
          },
          {
            label: 'Reîmprospătează',
            variant: 'secondary',
            onClick: fetchData,
          },
        ]}
      />

      {feedback && (
        <InlineAlert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
      )}
      {error && <InlineAlert type="error" message={error} onClose={() => setError(null)} />}

      {/* Dashboard Stats */}
      {dashboard && (
        <Row className="mt-4">
          <Col md={4}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <h3 className="mb-0 text-danger">{dashboard.total_waste.toFixed(2)} RON</h3>
                <p className="text-muted mb-0">Total Waste ({period === 'today' ? 'Astăzi' : period === 'week' ? 'Săptămâna' : 'Luna'})</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h6 className="mb-3">"waste pe tip"</h6>
                {dashboard.by_type.map((type) => (
                  <div key={type.waste_type} className="d-flex justify-content-between mb-2">
                    <span>{WASTE_TYPES.find(t => t.value === type.waste_type)?.label || type.waste_type}</span>
                    <strong>{type.total.toFixed(2)} RON ({type.count} incidente)</strong>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h6 className="mb-3">Top 5 Produse cu Waste</h6>
                {dashboard.top_products.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="d-flex justify-content-between mb-2">
                    <span className="text-truncate" style={{ maxWidth: '150px' }} title={product.item_name}>
                      {product.item_name}
                    </span>
                    <strong>{product.total_cost.toFixed(2)} RON</strong>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Period Filter */}
      <div className="mt-4 d-flex gap-2 align-items-center">
        <span>"Perioadă:"</span>
        <Button
          variant={period === 'today' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => setPeriod('today')}
        >"Astăzi"</Button>
        <Button
          variant={period === 'week' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => setPeriod('week')}
        >
          Săptămâna
        </Button>
        <Button
          variant={period === 'month' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => setPeriod('month')}
        >
          Luna
        </Button>
      </div>

      {/* Waste Records Table */}
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">"inregistrari waste"</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" className="me-2" />Se încarcă...</div>
          ) : (
            <DataGrid
              columnDefs={columnDefs}
              rowData={wasteRecords}
              height="60vh"
            />
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingWaste ? 'Editează Pierdere' : 'Raportează Pierdere Nouă'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tip Waste *</Form.Label>
                  <Form.Select
                    value={formData.waste_type || 'food'}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        waste_type: e.target.value as any,
                        waste_reason: WASTE_REASONS[e.target.value as keyof typeof WASTE_REASONS]?.[0]?.value || '',
                      });
                    }}
                    required
                  >
                    {WASTE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Motiv *</Form.Label>
                  <Form.Select
                    value={formData.waste_reason || ''}
                    onChange={(e) => setFormData({ ...formData, waste_reason: e.target.value })}
                    required
                  >
                    {WASTE_REASONS[formData.waste_type as keyof typeof WASTE_REASONS]?.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tip Item *</Form.Label>
                  <Form.Select
                    value={formData.item_type || 'ingredient'}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value as any })}
                    required
                  >
                    {ITEM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nume Item *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.item_name || ''}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cantitate *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unitate Măsură *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.unit_of_measure || 'kg'}
                    onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cost Unitar (RON) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.unit_cost || 0}
                    onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Waste *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.waste_date || ''}
                    onChange={(e) => setFormData({ ...formData, waste_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>"raportat de"</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.reported_by || ''}
                    onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descriere</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>"Anulează"</Button>
            <Button variant="primary" type="submit">
              {editingWaste ? 'Actualizează' : 'Raportează'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};




