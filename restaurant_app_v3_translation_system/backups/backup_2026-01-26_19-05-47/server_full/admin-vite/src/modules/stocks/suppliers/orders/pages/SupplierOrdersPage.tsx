// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { DataGrid } from '@/shared/components/DataGrid';
import { supplierOrdersApi } from '../api/supplierOrdersApi';
import type { SupplierOrder } from '../api/supplierOrdersApi';
import { suppliersApi } from '../../api/suppliersApi';
import type { Supplier } from '../../api/suppliersApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './SupplierOrdersPage.css';

const ORDER_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'secondary' },
  { value: 'sent', label: 'Trimis', color: 'info' },
  { value: 'confirmed', label: 'Confirmat', color: 'primary' },
  { value: "ÃŽn Tranzit", label: 'ÃŽn Tranzit', color: 'warning' },
  { value: 'delivered', label: 'Livrat', color: 'success' },
  { value: 'cancelled', label: 'Anulat', color: 'danger' },
];

export const SupplierOrdersPage = () => {
//   const { t } = useTranslation();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SupplierOrder | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<Partial<SupplierOrder>>({
    supplier_id: 0,
    order_date: new Date().toISOString().split('T')[0],
    status: 'draft',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, suppliersData] = await Promise.all([
        supplierOrdersApi.fetchOrders(),
        suppliersApi.fetchSuppliers(true),
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
    } catch (err: any) {
      console.error('âŒ Eroare la Ã®ncÄƒrcarea datelor:', err);
      setError(err.message || 'Eroare la Ã®ncÄƒrcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenModal = (order?: SupplierOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData(order);
    } else {
      setEditingOrder(null);
      setFormData({
        supplier_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        status: 'draft',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_id || !formData.order_date) {
      setFeedback({ type: 'error', message: 'Furnizorul È™i data sunt obligatorii!' });
      return;
    }

    try {
      if (editingOrder?.id) {
        await supplierOrdersApi.updateOrder(editingOrder.id, formData);
        setFeedback({ type: 'success', message: 'ComandÄƒ actualizatÄƒ cu succes!' });
      } else {
        await supplierOrdersApi.createOrder(formData as Omit<SupplierOrder, 'id' | 'created_at' | 'updated_at'>);
        setFeedback({ type: 'success', message: 'ComandÄƒ creatÄƒ cu succes!' });
      }
      handleCloseModal();
      await fetchData();
    } catch (err: any) {
      console.error('âŒ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err.message || 'Eroare necunoscutÄƒ') });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('EÈ™ti sigur cÄƒ vrei sÄƒ È™tergi aceastÄƒ comandÄƒ?')) return;

    try {
      await supplierOrdersApi.deleteOrder(id);
      setFeedback({ type: 'success', message: 'ComandÄƒ È™tearsÄƒ cu succes!' });
      await fetchData();
    } catch (err: any) {
      console.error('âŒ Eroare la È™tergere:', err);
      setFeedback({ type: 'error', message: 'Eroare la È™tergere: ' + (err.message || 'Eroare necunoscutÄƒ') });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === status);
    return <Badge bg={statusInfo?.color || 'secondary'}>{statusInfo?.label || status}</Badge>;
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'supplier_name', headerName: 'Furnizor', flex: 1 },
    { field: 'order_date', headerName: 'Data ComandÄƒ', width: 120 },
    { field: 'expected_delivery_date', headerName: 'Data Livrare', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => getStatusBadge(params.value),
    },
    {
      field: 'total_amount',
      headerName: 'Total',
      width: 120,
      cellRenderer: (params: any) => `${(params.value || 0).toFixed(2)} RON`,
    },
    {
      field: 'actions',
      headerName: 'AcÈ›iuni',
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
    <div className="supplier-orders-page">
      <PageHeader
        title="ðŸ“¦ Comenzi Furnizori"
        description="Gestionare comenzi cÄƒtre furnizori"
        actions={[
          {
            label: 'ComandÄƒ NouÄƒ',
            variant: 'primary',
            onClick: () => handleOpenModal(),
          },
          {
            label: 'ReÃ®mprospÄƒteazÄƒ',
            variant: 'secondary',
            onClick: fetchData,
          },
        ]}
      />

      {feedback && (
        <InlineAlert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
      )}
      {error && <InlineAlert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Lista Comenzi</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" className="me-2" />Se Ã®ncarcÄƒ...</div>
          ) : (
            <DataGrid
              columnDefs={columnDefs}
              rowData={orders}
              height="60vh"
            />
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingOrder ? 'EditeazÄƒ ComandÄƒ' : 'ComandÄƒ NouÄƒ'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Furnizor *</Form.Label>
              <Form.Select
                value={formData.supplier_id || 0}
                onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                required
              >
                <option value={0}>"selecteaza furnizor"</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data ComandÄƒ *</Form.Label>
              <Form.Control
                type="date"
                value={formData.order_date || ''}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>"data livrare asteptata"</Form.Label>
              <Form.Control
                type="date"
                value={formData.expected_delivery_date || ''}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status || 'draft'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>"AnuleazÄƒ"</Button>
            <Button variant="primary" type="submit">
              {editingOrder ? 'ActualizeazÄƒ' : 'CreeazÄƒ'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};





