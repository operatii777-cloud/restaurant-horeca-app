import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card, Table } from 'react-bootstrap';
import { getTablesStatus, getOrderByTable, mergeOrders } from '../api/KioskApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskMergeTablesModal = ({ show, onHide, currentTableId, currentOrderId, onSuccess }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [targetOrder, setTargetOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      loadTables();
    }
  }, [show]);

  useEffect(() => {
    if (selectedTable && selectedTable !== currentTableId) {
      loadTargetOrder();
    } else {
      setTargetOrder(null);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    try {
      const tablesData = await getTablesStatus();
      // Filtrează masa curentă și doar mesele ocupate (care au comenzi)
      const occupiedTables = tablesData.filter(
        (t) => t.number !== parseInt(currentTableId) && t.status === 'occupied' && t.order_id,
      );
      setTables(occupiedTables);
    } catch (err) {
      console.error('❌ Eroare la încărcarea meselor:', err);
      setError('Nu s-au putut încărca mesele disponibile.');
    }
  };

  const loadTargetOrder = async () => {
    setLoadingOrder(true);
    try {
      const orderData = await getOrderByTable(parseInt(selectedTable));
      setTargetOrder(orderData);
    } catch (err) {
      console.error('❌ Eroare la încărcarea comenzii:', err);
      setTargetOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleMerge = async () => {
    if (!selectedTable) {
      setError('Selectează o masă cu comandă activă.');
      return;
    }

    if (parseInt(selectedTable) === parseInt(currentTableId)) {
      setError('Nu poți uni comanda cu ea însăși.');
      return;
    }

    if (!targetOrder || !targetOrder.id) {
      setError('Masa selectată nu are comandă activă.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // currentOrderId este sursa, targetOrder.id este destinația
      await mergeOrders(currentOrderId, targetOrder.id);
      alert(
        `Comenzile au fost unite cu succes! Comanda de la masa ${currentTableId} a fost adăugată la masa ${selectedTable}.`,
      );
      if (onSuccess) {
        onSuccess(parseInt(selectedTable));
      }
      onHide();
    } catch (err) {
      console.error('❌ Eroare la unirea comenzilor:', err);
      setError(err.message || 'Nu s-au putut uni comenzile. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="kiosk-merge-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-compress-alt me-2"></i>Unire Mese - Masa {currentTableId}
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
                <small className="text-muted">Comanda #{currentOrderId}</small>
              </div>
              <div className="text-center">
                <i className="fas fa-compress-alt fa-2x text-muted"></i>
              </div>
              <div>
                <strong>Masa destinație:</strong>
                {selectedTable ? (
                  <>
                    <div className="h4 text-success mb-0">Masa {selectedTable}</div>
                    {targetOrder && (
                      <small className="text-muted">Comanda #{targetOrder.id}</small>
                    )}
                  </>
                ) : (
                  <div className="text-muted">Selectează masă</div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        <Form.Group className="mb-4">
          <Form.Label htmlFor="kiosk-merge-table-select" className="fw-bold">
            <i className="fas fa-table me-2"></i>Selectează masa cu comandă activă
          </Form.Label>
          <Form.Select
            id="kiosk-merge-table-select"
            name="target_table"
            size="lg"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Selectează masă ocupată --</option>
            {tables.map((table) => (
              <option key={table.number} value={table.number}>
                Masa {table.number} (Comandă #{table.order_id})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {loadingOrder && (
          <div className="text-center py-3">
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p className="mt-2">Se încarcă comanda...</p>
          </div>
        )}

        {targetOrder && !loadingOrder && (
          <Card className="mb-4">
            <Card.Header>
              <strong>Previzualizare comandă destinație (Masa {selectedTable})</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Total comandă:</strong>{' '}
                <span className="h5 text-primary mb-0">{targetOrder.total?.toFixed(2) || '0.00'} RON</span>
              </div>
              {targetOrder.items && targetOrder.items.length > 0 && (
                <div>
                  <strong>Articole ({targetOrder.items.length}):</strong>
                  <Table hover size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Produs</th>
                        <th>Cantitate</th>
                        <th>Preț</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetOrder.items.slice(0, 5).map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.product_name || item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{(item.price * item.quantity).toFixed(2)} RON</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {targetOrder.items.length > 5 && (
                    <small className="text-muted">... și încă {targetOrder.items.length - 5} articole</small>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Atenție!</strong> Comanda de la masa {currentTableId} va fi adăugată la comanda de la masa{' '}
          {selectedTable || 'selectată'}. Toate articolele vor fi combinate într-o singură comandă.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          <i className="fas fa-times me-2"></i>Anulează
        </Button>
        <Button
          variant="primary"
          onClick={handleMerge}
          disabled={loading || !selectedTable || !targetOrder}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin me-2"></i>Se unesc comenzile...
            </>
          ) : (
            <>
              <i className="fas fa-check me-2"></i>Uneste Comenzile
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

