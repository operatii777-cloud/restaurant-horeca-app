import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { getTablesStatus, transferOrder } from '../api/KioskApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskTransferTableModal = ({ show, onHide, orderId, currentTableId, onSuccess }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      loadTables();
    }
  }, [show]);

  const loadTables = async () => {
    try {
      const tablesData = await getTablesStatus();
      // Filtrează masa curentă și mesele ocupate
      const availableTables = tablesData.filter(
        (t) => t.number !== parseInt(currentTableId) && t.status !== 'occupied',
      );
      setTables(availableTables);
    } catch (err) {
      console.error('❌ Eroare la încărcarea meselor:', err);
      setError('Nu s-au putut încărca mesele disponibile.');
    }
  };

  const handleTransfer = async () => {
    if (!selectedTable) {
      setError('Selectează o masă destinație.');
      return;
    }

    if (parseInt(selectedTable) === parseInt(currentTableId)) {
      setError('Nu poți transfera comanda pe aceeași masă.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await transferOrder(orderId, parseInt(selectedTable));
      alert(`Comanda a fost transferată cu succes la masa ${selectedTable}!`);
      if (onSuccess) {
        onSuccess(parseInt(selectedTable));
      }
      onHide();
    } catch (err) {
      console.error('❌ Eroare la transferul comenzii:', err);
      setError(err.message || 'Nu s-a putut transfera comanda. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="kiosk-transfer-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-exchange-alt me-2"></i>Transfer Comandă - Masa {currentTableId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Masa sursă:</strong>
                <div className="h4 text-primary mb-0">Masa {currentTableId}</div>
              </div>
              <div className="text-center">
                <i className="fas fa-arrow-right fa-2x text-muted"></i>
              </div>
              <div>
                <strong>Masa destinație:</strong>
                {selectedTable ? (
                  <div className="h4 text-success mb-0">Masa {selectedTable}</div>
                ) : (
                  <div className="text-muted">Selectează masă</div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        <Form.Group className="mb-4">
          <Form.Label htmlFor="kiosk-transfer-table-select" className="fw-bold">
            <i className="fas fa-table me-2"></i>Selectează masa destinație
          </Form.Label>
          <Form.Select
            id="kiosk-transfer-table-select"
            name="target_table"
            size="lg"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Selectează masă --</option>
            {tables.map((table) => (
              <option key={table.number} value={table.number}>
                Masa {table.number} {table.status === 'free' ? '(Liberă)' : '(Rezervată)'}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Alert variant="info">
          <i className="fas fa-info-circle me-2"></i>
          Comanda va fi mutată de la masa {currentTableId} la masa selectată. Toate articolele și
          plățile vor fi transferate.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          <i className="fas fa-times me-2"></i>Anulează
        </Button>
        <Button variant="primary" onClick={handleTransfer} disabled={loading || !selectedTable}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin me-2"></i>Se transferă...
            </>
          ) : (
            <>
              <i className="fas fa-check me-2"></i>Transferă Comandă
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

