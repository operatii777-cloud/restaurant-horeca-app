import { useState, useEffect } from 'react';
import { Modal, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { marketingApi, type CustomerSegment, type SegmentCustomer } from '../api/marketingApi';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SegmentCustomersModalProps {
  show: boolean;
  segment: CustomerSegment | null;
  onClose: () => void;
}

export const SegmentCustomersModal = ({ show, segment, onClose }: SegmentCustomersModalProps) => {
  const [customers, setCustomers] = useState<SegmentCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && segment?.id) {
      loadCustomers();
    } else {
      setCustomers([]);
      setError(null);
    }
  }, [show, segment]);

  const loadCustomers = async () => {
    if (!segment?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await marketingApi.getSegmentCustomers(segment.id);
      setCustomers(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea clienților:', err);
      setError(err?.response?.data?.error || err?.message || 'Eroare la încărcarea clienților');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-users me-2"></i>
          Clienți - {segment?.name || 'Segment'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Se încarcă clienții...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
            <p>Nu există clienți în acest segment.</p>
          </div>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Token Client</th>
                <th>Număr Comenzi</th>
                <th>Prima Comandă</th>
                <th>Ultima Comandă</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={index}>
                  <td>
                    <code>{customer.customer_token}</code>
                  </td>
                  <td>
                    <Badge bg="primary">{customer.order_count}</Badge>
                  </td>
                  <td>{new Date(customer.first_order_date).toLocaleDateString('ro-RO')}</td>
                  <td>{new Date(customer.last_order_date).toLocaleDateString('ro-RO')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Închide
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

