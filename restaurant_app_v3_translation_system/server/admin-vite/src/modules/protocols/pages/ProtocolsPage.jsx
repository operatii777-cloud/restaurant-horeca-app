/**
 * PROTOCOLS MANAGEMENT PAGE
 * Pagina pentru gestionare protocoale/contracte
 * Data: 14 Februarie 2026
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import './ProtocolsPage.css';

export function ProtocolsPage() {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    protocol_number: '',
    company_name: '',
    company_cui: '',
    company_address: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    discount_type: 'percentage',
    discount_value: 0,
    payment_terms: '30_days',
    payment_method: 'bank_transfer',
    notes: '',
    contract_start: '',
    contract_end: '',
    billing_cycle: 'monthly',
    credit_limit: 0,
    active: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/protocols');
      const data = await response.json();
      if (data.success) {
        setProtocols(data.data);
      }
    } catch (err) {
      setError('Eroare la încărcarea protocoalelor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/protocols/${editing.id}` : '/api/protocols';
      const method = editing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(editing ? 'Protocol actualizat cu succes' : 'Protocol creat cu succes');
        setShowModal(false);
        fetchProtocols();
        resetForm();
      } else {
        setError(data.error || 'Eroare la salvare');
      }
    } catch (err) {
      setError('Eroare la salvarea protocolului');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest protocol?')) return;
    
    try {
      const response = await fetch(`/api/protocols/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSuccess('Protocol șters cu succes');
        fetchProtocols();
      }
    } catch (err) {
      setError('Eroare la ștergerea protocolului');
      console.error(err);
    }
  };

  const handleEdit = (protocol) => {
    setEditing(protocol);
    setFormData({ ...protocol });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      protocol_number: '',
      company_name: '',
      company_cui: '',
      company_address: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      discount_type: 'percentage',
      discount_value: 0,
      payment_terms: '30_days',
      payment_method: 'bank_transfer',
      notes: '',
      contract_start: '',
      contract_end: '',
      billing_cycle: 'monthly',
      credit_limit: 0,
      active: true
    });
  };

  const getPaymentTermsBadge = (terms) => {
    const badges = {
      immediate: <Badge bg="success">Imediat</Badge>,
      '15_days': <Badge bg="info">15 zile</Badge>,
      '30_days': <Badge bg="warning">30 zile</Badge>,
      '60_days': <Badge bg="danger">60 zile</Badge>,
      '90_days': <Badge bg="dark">90 zile</Badge>
    };
    return badges[terms] || <Badge bg="secondary">{terms}</Badge>;
  };

  return (
    <div className="protocols-page">
      <h2 className="mb-4">Gestionare Protocoale & Contracte</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-file-contract me-2"></i>Protocoale Active
          </h5>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="fas fa-plus me-1"></i>Adaugă Protocol
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
                  <th>Nr. Protocol</th>
                  <th>Companie</th>
                  <th>CUI</th>
                  <th>Discount</th>
                  <th>Termeni Plată</th>
                  <th>Credit Limit</th>
                  <th>Datorie</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {protocols.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                      <p className="text-muted">Nu există protocoale definite</p>
                    </td>
                  </tr>
                ) : (
                  protocols.map((protocol) => (
                    <tr key={protocol.id}>
                      <td><strong>{protocol.protocol_number}</strong></td>
                      <td>{protocol.company_name}</td>
                      <td>{protocol.company_cui}</td>
                      <td>
                        {protocol.discount_type === 'percentage' 
                          ? `${protocol.discount_value}%` 
                          : `${protocol.discount_value} RON`}
                      </td>
                      <td>{getPaymentTermsBadge(protocol.payment_terms)}</td>
                      <td>{protocol.credit_limit} RON</td>
                      <td>
                        <span className={protocol.current_debt > protocol.credit_limit * 0.8 ? 'text-danger' : ''}>
                          {protocol.current_debt} RON
                        </span>
                      </td>
                      <td>
                        {protocol.active ? (
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
                          onClick={() => handleEdit(protocol)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(protocol.id)}
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

      {/* Modal pentru creare/editare protocol */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? 'Editare Protocol' : 'Adaugare Protocol Nou'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="general" className="mb-3">
              <Tab eventKey="general" title="Informații Generale">
                <Form.Group className="mb-3">
                  <Form.Label>Număr Protocol *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.protocol_number}
                    onChange={(e) => setFormData({ ...formData, protocol_number: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nume Companie *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>CUI</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.company_cui}
                    onChange={(e) => setFormData({ ...formData, company_cui: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adresă</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.company_address}
                    onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="contact" title="Persoană Contact">
                <Form.Group className="mb-3">
                  <Form.Label>Nume</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telefon</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="financial" title="Condiții Financiare">
                <Form.Group className="mb-3">
                  <Form.Label>Tip Discount *</Form.Label>
                  <Form.Select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  >
                    <option value="percentage">Procent</option>
                    <option value="fixed_amount">Sumă Fixă</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Valoare Discount *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Termeni Plată *</Form.Label>
                  <Form.Select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  >
                    <option value="immediate">Imediat</option>
                    <option value="15_days">15 zile</option>
                    <option value="30_days">30 zile</option>
                    <option value="60_days">60 zile</option>
                    <option value="90_days">90 zile</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Metodă Plată *</Form.Label>
                  <Form.Select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="bank_transfer">Transfer Bancar</option>
                    <option value="cash">Numerar</option>
                    <option value="card">Card</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Plafon Credit (RON) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ciclu Facturare *</Form.Label>
                  <Form.Select
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  >
                    <option value="daily">Zilnic</option>
                    <option value="weekly">Săptămânal</option>
                    <option value="monthly">Lunar</option>
                  </Form.Select>
                </Form.Group>
              </Tab>
            </Tabs>

            <Form.Group className="mb-3">
              <Form.Label>Notițe</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Protocol Activ"
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
