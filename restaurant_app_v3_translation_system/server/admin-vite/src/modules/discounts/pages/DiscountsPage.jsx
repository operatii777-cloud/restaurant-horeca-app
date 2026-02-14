/**
 * DISCOUNTS MANAGEMENT PAGE
 * Pagina pentru gestionare discounturi
 * Data: 14 Februarie 2026
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import './DiscountsPage.css';

export function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage',
    value: 0,
    applies_to: 'order',
    target_id: null,
    requires_approval: false,
    max_amount: '',
    min_order_value: '',
    valid_from: '',
    valid_until: '',
    active: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discounts');
      const data = await response.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (err) {
      setError('Eroare la încărcarea discounturilor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/discounts/${editing.id}` : '/api/discounts';
      const method = editing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(editing ? 'Discount actualizat cu succes' : 'Discount creat cu succes');
        setShowModal(false);
        fetchDiscounts();
        resetForm();
      } else {
        setError(data.error || 'Eroare la salvare');
      }
    } catch (err) {
      setError('Eroare la salvarea discountului');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest discount?')) return;
    
    try {
      const response = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSuccess('Discount șters cu succes');
        fetchDiscounts();
      }
    } catch (err) {
      setError('Eroare la ștergerea discountului');
      console.error(err);
    }
  };

  const handleEdit = (discount) => {
    setEditing(discount);
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      applies_to: discount.applies_to,
      target_id: discount.target_id,
      requires_approval: discount.requires_approval,
      max_amount: discount.max_amount || '',
      min_order_value: discount.min_order_value || '',
      valid_from: discount.valid_from || '',
      valid_until: discount.valid_until || '',
      active: discount.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: '',
      type: 'percentage',
      value: 0,
      applies_to: 'order',
      target_id: null,
      requires_approval: false,
      max_amount: '',
      min_order_value: '',
      valid_from: '',
      valid_until: '',
      active: true
    });
  };

  const getTypeBadge = (type) => {
    const badges = {
      percentage: <Badge bg="success">Procent</Badge>,
      fixed_amount: <Badge bg="info">Sumă Fixă</Badge>,
      protocol: <Badge bg="warning">Protocol</Badge>
    };
    return badges[type] || <Badge bg="secondary">{type}</Badge>;
  };

  const getAppliesToBadge = (appliesTo) => {
    const badges = {
      product: <Badge bg="primary">Produs</Badge>,
      category: <Badge bg="info">Categorie</Badge>,
      order: <Badge bg="success">Comandă</Badge>
    };
    return badges[appliesTo] || <Badge bg="secondary">{appliesTo}</Badge>;
  };

  return (
    <div className="discounts-page">
      <h2 className="mb-4">Gestionare Discounturi</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-percent me-2"></i>Discounturi Active
          </h5>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="fas fa-plus me-1"></i>Adaugă Discount
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nume</th>
                  <th>Tip</th>
                  <th>Valoare</th>
                  <th>Se Aplică La</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                      <p className="text-muted">Nu există discounturi definite</p>
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount, index) => (
                    <tr key={discount.id}>
                      <td>{index + 1}</td>
                      <td>{discount.name}</td>
                      <td>{getTypeBadge(discount.type)}</td>
                      <td>
                        {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} RON`}
                      </td>
                      <td>{getAppliesToBadge(discount.applies_to)}</td>
                      <td>
                        {discount.active ? (
                          <Badge bg="success">Activ</Badge>
                        ) : (
                          <Badge bg="secondary">Inactiv</Badge>
                        )}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEdit(discount)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(discount.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal pentru creare/editare discount */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? 'Editare Discount' : 'Adaugare Discount Nou'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nume Discount *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tip Discount *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="percentage">Procent</option>
                <option value="fixed_amount">Sumă Fixă (RON)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valoare *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                required
              />
              <Form.Text className="text-muted">
                {formData.type === 'percentage' ? 'Procent (0-100)' : 'Sumă în RON'}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Se Aplică La *</Form.Label>
              <Form.Select
                value={formData.applies_to}
                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                required
              >
                <option value="order">Comandă Întreagă</option>
                <option value="product">Produs Specific</option>
                <option value="category">Categorie Produse</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sumă Maximă Discount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
              />
              <Form.Text className="text-muted">Optional - plafonează discountul</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valoare Minimă Comandă</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.min_order_value}
                onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
              />
              <Form.Text className="text-muted">Optional - comandă minimă pentru discount</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Necesită Aprobare Manager"
                checked={formData.requires_approval}
                onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Activ"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Anulează
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-1"></i>Salvează
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
