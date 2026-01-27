import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { DataGrid } from '@/shared/components/DataGrid';
import { suppliersApi } from '../api/suppliersApi';
import type { Supplier, SupplierStats } from '../api/suppliersApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './SuppliersPage.css';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    company_name: '',
    cui: '',
    phone: '',
    email: '',
    address_city: '',
    is_active: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [suppliersData, statsData] = await Promise.all([
        suppliersApi.fetchSuppliers(),
        suppliersApi.fetchStats(),
      ]);
      setSuppliers(suppliersData);
      setStats(statsData);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea datelor:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData(supplier);
    } else {
      setEditingSupplier(null);
      setFormData({
        company_name: '',
        cui: '',
        phone: '',
        email: '',
        address_city: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name) {
      setFeedback({ type: 'error', message: 'Numele companiei este obligatoriu!' });
      return;
    }

    try {
      if (editingSupplier?.id) {
        await suppliersApi.updateSupplier(editingSupplier.id, formData);
        setFeedback({ type: 'success', message: 'Furnizor actualizat cu succes!' });
      } else {
        await suppliersApi.createSupplier(formData as Omit<Supplier, 'id' | 'created_at' | 'updated_at'>);
        setFeedback({ type: 'success', message: 'Furnizor creat cu succes!' });
      }
      handleCloseModal();
      await fetchData();
    } catch (err: any) {
      console.error('❌ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest furnizor?')) return;

    try {
      await suppliersApi.deleteSupplier(id);
      setFeedback({ type: 'success', message: 'Furnizor șters cu succes!' });
      await fetchData();
    } catch (err: any) {
      console.error('❌ Eroare la ștergere:', err);
      setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'company_name', headerName: 'Nume Companie', flex: 1 },
    { field: 'cui', headerName: 'CUI', width: 120 },
    { field: 'phone', headerName: 'Telefon', width: 150 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      cellRenderer: (params: any) => (
        <Badge bg={params.value ? 'success' : 'secondary'}>
          {params.value ? 'Activ' : 'Inactiv'}
        </Badge>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="d-flex gap-2">
          <Button variant="info" size="sm" onClick={() => handleOpenModal(params.data)}>
            <i className="fas fa-edit"></i>
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(params.data.id)}>
            <i className="fas fa-trash-alt"></i>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="suppliers-page">
      <PageHeader
        title="🏢 Furnizori"
        description="Gestionare furnizori și aprovizionare"
        actions={[
          {
            label: 'Adaugă Furnizor',
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

      {/* Stats Cards */}
      {stats && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <h3 className="mb-0">{stats.total}</h3>
                <p className="text-muted mb-0">Total Furnizori</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm text-center border-success">
              <Card.Body>
                <h3 className="mb-0 text-success">{stats.active}</h3>
                <p className="text-muted mb-0">Furnizori Activi</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <h3 className="mb-0">{stats.categories}</h3>
                <p className="text-muted mb-0">Categorii</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <h3 className="mb-0">{stats.avg_rating.toFixed(1)}</h3>
                <p className="text-muted mb-0">Rating Mediu</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Suppliers Table */}
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Lista Furnizori</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" className="me-2" /> Se încarcă...
            </div>
          ) : (
            <DataGrid
              columnDefs={columnDefs}
              rowData={suppliers}
              height="60vh"
            />
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingSupplier ? 'Editează Furnizor' : 'Adaugă Furnizor Nou'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nume Companie *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CUI</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cui || ''}
                    onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefon</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Oraș</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.address_city || ''}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Furnizor Activ"
                    checked={formData.is_active === true || formData.is_active === 1}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Anulează
            </Button>
            <Button variant="primary" type="submit">
              {editingSupplier ? 'Actualizează' : 'Adaugă'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

