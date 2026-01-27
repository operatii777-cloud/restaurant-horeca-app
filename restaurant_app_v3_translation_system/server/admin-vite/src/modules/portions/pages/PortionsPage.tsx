// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Portion {
  id: number;
  product_id: number;
  size_code: string;
  size_name: string;
  portion_multiplier: number;
  portion_grams: number;
  price: number;
  cost_per_portion: number;
  margin_percentage: number;
  is_default: number;
}

export const PortionsPage = () => {
//   const { t } = useTranslation();
  const [portions, setPortions] = useState<Portion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    product_id: '',
    size_code: 'M',
    size_name: 'Medie',
    multiplier: '1.0',
    grams: '350',
    price: '25.00'
  });

  useEffect(() => {
    loadPortions();
  }, []);

  const loadPortions = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/portions');
      setPortions(response.data?.data || []);
    } catch (error) {
      console.error('Error loading portions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await httpClient.post('/api/portions', {
        product_id: parseInt(form.product_id),
        size_code: form.size_code,
        size_name: form.size_name,
        portion_multiplier: parseFloat(form.multiplier),
        portion_grams: parseFloat(form.grams),
        price: parseFloat(form.price)
      });
      
      setFeedback({ type: 'success', message: 'Porție adăugată cu succes!' });
      setShowModal(false);
      loadPortions();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la adăugare' });
    }
  };

  const recalculateCosts = async (productId: number) => {
    try {
      await httpClient.post(`/api/portions/recalculate/${productId}`);
      setFeedback({ type: 'success', message: 'Costuri recalculate!' });
      loadPortions();
    } catch (error: any) {
      setFeedback({ type: 'error', message: 'Eroare la recalculare' });
    }
  };

  return (
    <div className="portions-page page">
      <PageHeader 
        title="Gestionare Porții (S/M/L)"
        subtitle="configurare portii multiple per produs"
      />

      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>"lista portii"</h5>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i>"adauga portie"</Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Produs</th>
                <th>"Mărime"</th>
                <th>Multiplier</th>
                <th>Gramaj</th>
                <th>"Preț"</th>
                <th>Cost</th>
                <th>"Marjă"</th>
                <th>"Default"</th>
                <th>"Acțiuni"</th>
              </tr>
            </thead>
            <tbody>
              {portions.map(portion => (
                <tr key={portion.id}>
                  <td>Product #{portion.product_id}</td>
                  <td>
                    <Badge bg="primary">{portion.size_code}</Badge> {portion.size_name}
                  </td>
                  <td>{portion.portion_multiplier}x</td>
                  <td>{portion.portion_grams}g</td>
                  <td>{portion.price.toFixed(2)} RON</td>
                  <td>{portion.cost_per_portion?.toFixed(2)} RON</td>
                  <td>
                    <Badge bg={portion.margin_percentage > 200 ? 'success' : 'warning'}>
                      {portion.margin_percentage?.toFixed(1)}%
                    </Badge>
                  </td>
                  <td>{portion.is_default ? '✓' : '-'}</td>
                  <td>
                    <Button size="sm" variant="info" onClick={() => recalculateCosts(portion.product_id)}>
                      🔄 Recalc
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Add Portion */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>"adauga portie"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Produs</Form.Label>
              <Form.Select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                <option value="">"selecteaza produs"</option>
                {/* TODO: Load products */}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>"Mărime"</Form.Label>
              <Form.Select value={form.size_code} onChange={e => setForm({...form, size_code: e.target.value})}>
                <option value="S">"s mica"</option>
                <option value="M">M - Medie</option>
                <option value="L">L - Mare</option>
                <option value="XL">XL - Extra Mare</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>"nume portie"</Form.Label>
              <Form.Control value={form.size_name} onChange={e => setForm({...form, size_name: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Multiplier (ex: 0.75 pentru S, 1.5 pentru L)</Form.Label>
              <Form.Control type="number" step="0.01" value={form.multiplier} onChange={e => setForm({...form, multiplier: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Gramaj (g)</Form.Label>
              <Form.Control type="number" value={form.grams} onChange={e => setForm({...form, grams: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Preț (RON)</Form.Label>
              <Form.Control type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </Form.Group>
            
            <Button type="submit" variant="primary" className="w-100">"adauga portie"</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};




