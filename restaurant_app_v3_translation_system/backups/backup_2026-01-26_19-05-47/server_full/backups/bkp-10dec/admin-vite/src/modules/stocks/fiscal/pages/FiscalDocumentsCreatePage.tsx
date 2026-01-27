import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FiscalDocumentsCreatePage.css';

interface Order {
  id: number;
  order_number: string;
  date: string;
  total: number;
  table_name?: string;
  customer_name?: string;
}

export const FiscalDocumentsCreatePage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Receipt form state
  const [receiptForm, setReceiptForm] = useState({
    orderId: '',
    paymentMethod: 'cash',
    isFiscal: '0', // 0 = Chitanță, 1 = Bon Nefiscal
  });

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    orderId: '',
    clientName: '',
    clientCUI: '',
    clientRegCom: '',
    invoiceAmount: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await httpClient.get('/api/orders-delivery?lang=ro');
      if (response.data?.orders) {
        const ordersList = response.data.orders.map((order: any) => ({
          id: order.id || order.order_id,
          order_number: order.order_number || order.id?.toString() || '',
          date: order.date || order.created_at || '',
          total: order.total || order.total_amount || 0,
          table_name: order.table_name || order.table || '',
          customer_name: order.customer_name || order.customer || '',
        }));
        setOrders(ordersList);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea comenzilor:', error);
      setFeedback({ type: 'error', message: 'Nu s-au putut încărca comenzile.' });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReceipt(true);
    setFeedback(null);

    try {
      const response = await httpClient.post('/api/admin/fiscal/create-document', {
        order_id: receiptForm.orderId,
        payment_method: receiptForm.paymentMethod,
        document_type: receiptForm.isFiscal === '1' ? 'bon_nefiscal' : 'chitanta',
      });

      if (response.data?.success) {
        setFeedback({
          type: 'success',
          message: `Document fiscal emis cu succes! Număr: ${response.data.document_number || 'N/A'}`,
        });
        // Reset form
        setReceiptForm({
          orderId: '',
          paymentMethod: 'cash',
          isFiscal: '0',
        });
      } else {
        setFeedback({
          type: 'error',
          message: response.data?.error || 'Nu s-a putut emite documentul fiscal.',
        });
      }
    } catch (error: any) {
      console.error('❌ Eroare la emiterea documentului fiscal:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Eroare la emiterea documentului fiscal.',
      });
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInvoice(true);
    setFeedback(null);

    try {
      const response = await httpClient.post('/api/admin/fiscal/create-invoice', {
        order_id: invoiceForm.orderId || null,
        client_name: invoiceForm.clientName,
        client_cui: invoiceForm.clientCUI || null,
        client_reg_com: invoiceForm.clientRegCom || null,
        amount: parseFloat(invoiceForm.invoiceAmount),
      });

      if (response.data?.success) {
        setFeedback({
          type: 'success',
          message: `Factură emisă cu succes! Număr: ${response.data.invoice_number || 'N/A'}`,
        });
        // Reset form
        setInvoiceForm({
          orderId: '',
          clientName: '',
          clientCUI: '',
          clientRegCom: '',
          invoiceAmount: '',
        });
      } else {
        setFeedback({
          type: 'error',
          message: response.data?.error || 'Nu s-a putut emite factura.',
        });
      }
    } catch (error: any) {
      console.error('❌ Eroare la emiterea facturii:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Eroare la emiterea facturii.',
      });
    } finally {
      setSubmittingInvoice(false);
    }
  };

  // Group orders by date for better UX
  const groupedOrders = orders.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('ro-RO');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <div className="fiscal-documents-create-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <i className="fas fa-plus-circle me-1"></i> Creare Documente Fiscale
        </Card.Header>
        <Card.Body>
          {feedback && (
            <Alert variant={feedback.type === 'success' ? 'success' : feedback.type === 'warning' ? 'warning' : 'danger'} dismissible onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          )}

          <div className="row">
            {/* Bon Nefiscal / Chitanță */}
            <div className="col-md-6">
              <h6>Bon Nefiscal / Chitanță</h6>
              <p className="text-muted">Emite bon nefiscal sau chitanță pentru o comandă existentă</p>
              <Form onSubmit={handleReceiptSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Selectează Comanda:</Form.Label>
                  <Form.Select
                    value={receiptForm.orderId}
                    onChange={(e) => setReceiptForm({ ...receiptForm, orderId: e.target.value })}
                    required
                    disabled={loadingOrders}
                  >
                    <option value="">
                      {loadingOrders ? 'Se încarcă comenzile...' : 'Selectează o comandă'}
                    </option>
                    {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                      <optgroup key={date} label={date}>
                        {dateOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            #{order.order_number} - {order.table_name ? `Masa ${order.table_name}` : 'Fără masă'} - {order.total.toFixed(2)} RON
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Comenzile sunt grupate pe zile pentru ușurință</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Metodă de Plată:</Form.Label>
                  <Form.Select
                    value={receiptForm.paymentMethod}
                    onChange={(e) => setReceiptForm({ ...receiptForm, paymentMethod: e.target.value })}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="sodexo">Sodexo</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tip Document:</Form.Label>
                  <Form.Select
                    value={receiptForm.isFiscal}
                    onChange={(e) => setReceiptForm({ ...receiptForm, isFiscal: e.target.value })}
                    required
                  >
                    <option value="0">Chitanță</option>
                    <option value="1">Bon Nefiscal</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" variant="success" disabled={submittingReceipt}>
                  <i className="fas fa-receipt me-1"></i>
                  {submittingReceipt ? 'Se emite...' : 'Emite Document'}
                </Button>
              </Form>
            </div>

            {/* Factură */}
            <div className="col-md-6">
              <h6>Factură</h6>
              <p className="text-muted">Emite factură pentru un client</p>
              <Form onSubmit={handleInvoiceSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Selectează Comanda (opțional):</Form.Label>
                  <Form.Select
                    value={invoiceForm.orderId}
                    onChange={(e) => {
                      const selectedOrder = orders.find((o) => o.id.toString() === e.target.value);
                      setInvoiceForm({
                        ...invoiceForm,
                        orderId: e.target.value,
                        invoiceAmount: selectedOrder ? selectedOrder.total.toFixed(2) : invoiceForm.invoiceAmount,
                      });
                    }}
                  >
                    <option value="">Fără comandă asociată</option>
                    {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                      <optgroup key={date} label={date}>
                        {dateOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            #{order.order_number} - {order.table_name ? `Masa ${order.table_name}` : 'Fără masă'} - {order.total.toFixed(2)} RON
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Selectează o comandă pentru a pre-popula datele sau completează manual
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nume Client:</Form.Label>
                  <Form.Control
                    type="text"
                    value={invoiceForm.clientName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                    required
                    placeholder="Ex: SC Restaurant SRL"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>CUI:</Form.Label>
                  <Form.Control
                    type="text"
                    value={invoiceForm.clientCUI}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientCUI: e.target.value })}
                    placeholder="Ex: RO12345678"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Reg. Com:</Form.Label>
                  <Form.Control
                    type="text"
                    value={invoiceForm.clientRegCom}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientRegCom: e.target.value })}
                    placeholder="Ex: J40/1234/2023"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Suma Totală:</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={invoiceForm.invoiceAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceAmount: e.target.value })}
                    required
                    placeholder="Ex: 150.00"
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={submittingInvoice}>
                  <i className="fas fa-file-invoice me-1"></i>
                  {submittingInvoice ? 'Se emite...' : 'Emite Factură'}
                </Button>
              </Form>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

