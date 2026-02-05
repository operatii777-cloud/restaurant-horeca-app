// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './VouchersPage.css';

interface Voucher {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | 'gift';
  value: number;
  start_date?: string;
  expiry_date: string;
  max_uses: number;
  used_count: number;
  description?: string;
  status: 'active' | 'used' | 'expired';
  created_at: string;
}

interface VoucherStats {
  total: number;
  active: number;
  used: number;
  totalValue: number;
}

export const VouchersPage: React.FC = () => {
  //   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<VoucherStats>({ total: 0, active: 0, used: 0, totalValue: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: '' as 'percentage' | 'fixed' | 'gift' | '',
    value: '',
    start_date: '',
    expiry_date: '',
    max_uses: '1',
    description: '',
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  useEffect(() => {
    filterVouchers();
  }, [vouchers, statusFilter, typeFilter, searchTerm]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/vouchers');
      if (response.data?.success && Array.isArray(response.data.data)) {
        const vouchersData = response.data.data.map((v: any) => ({
          ...v,
          status: getVoucherStatus(v),
        }));
        setVouchers(vouchersData);
        updateStats(vouchersData);
      } else if (Array.isArray(response.data)) {
        const vouchersData = response.data.map((v: any) => ({
          ...v,
          status: getVoucherStatus(v),
        }));
        setVouchers(vouchersData);
        updateStats(vouchersData);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea voucherelor' });
    } finally {
      setLoading(false);
    }
  };

  const getVoucherStatus = (voucher: any): 'active' | 'used' | 'expired' => {
    if (voucher.used_count >= voucher.max_uses) return 'used';
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) return 'expired';
    return 'active';
  };

  const updateStats = (vouchersData: Voucher[]) => {
    const stats: VoucherStats = {
      total: vouchersData.length,
      active: vouchersData.filter(v => v.status === 'active').length,
      used: vouchersData.filter(v => v.status === 'used').length,
      totalValue: vouchersData.reduce((sum, v) => {
        if (v.type === 'fixed' || v.type === 'gift') {
          return sum + parseFloat(String(v.value));
        }
        return sum;
      }, 0),
    };
    setStats(stats);
  };

  const filterVouchers = () => {
    let filtered = [...vouchers];

    if (statusFilter) {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(v => v.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVouchers(filtered);
  };

  const handleCreateVoucher = async () => {
    if (!formData.code || !formData.type || !formData.value || !formData.expiry_date) {
      setFeedback({ type: 'error', message: 'Completați toate câmpurile obligatorii' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: parseFloat(formData.value),
        start_date: formData.start_date || null,
        expiry_date: formData.expiry_date,
        max_uses: parseInt(formData.max_uses) || 1,
        description: formData.description || null,
      };

      await httpClient.post('/api/vouchers', payload);
      setFeedback({ type: 'success', message: 'Voucher creat cu succes!' });
      setShowModal(false);
      resetForm();
      loadVouchers();
    } catch (error: any) {
      console.error('Error creating voucher:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la crearea voucherului' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm('Sigur doriți să ștergeți acest voucher?')) return;

    setLoading(true);
    try {
      await httpClient.delete(`/api/vouchers/"Id"`);
      setFeedback({ type: 'success', message: 'Voucher șters cu succes!' });
      loadVouchers();
    } catch (error: any) {
      console.error('Error deleting voucher:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la ștergerea voucherului' });
    } finally {
      setLoading(false);
    }
  };

  const generateVoucherCode = () => {
    const prefix = 'VCH';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code: `"Prefix"-"Random"` });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: '',
      value: '',
      start_date: '',
      expiry_date: '',
      max_uses: '1',
      description: '',
    });
    setSelectedVoucher(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Activ</Badge>;
      case 'used':
        return <Badge bg="info">Utilizat</Badge>;
      case 'expired':
        return <Badge bg="danger">Expirat</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Reducere %';
      case 'fixed':
        return 'Valoare Fixă';
      case 'gift':
        return 'Bon Cadou';
      default:
        return type;
    }
  };

  const formatValue = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      return `${voucher.value}%`;
    }
    return `${voucher.value} RON`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  return (
    <div className="vouchers-page">
      <PageHeader
        title='🎫 Vouchere & Bonuri Valorice'
        description="Gestionare vouchere, coduri promoționale și bonuri cadou"
      />

      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'}
          dismissible
          onClose={() => setFeedback(null)}
          className="mt-3"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-ticket-alt fa-2x text-primary"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Vouchere</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.active}</div>
                  <div className="stat-label">Active</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-shopping-cart fa-2x text-info"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.used}</div>
                  <div className="stat-label">Utilizate</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-money-bill-wave fa-2x text-warning"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.totalValue.toFixed(2)} RON</div>
                  <div className="stat-label">Valoare Totală</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Lista Vouchere</h5>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i>Voucher Nou
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-4">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Toate statusurile</option>
                <option value="active">Active</option>
                <option value="used">Utilizate</option>
                <option value="expired">Expirate</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Toate tipurile</option>
                <option value="percentage">Reducere Procentuală</option>
                <option value="fixed">Valoare Fixă</option>
                <option value="gift">Bon Cadou</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Control
                type="text"
                placeholder='[🔍_cauta_cod]'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-ticket-alt fa-4x text-muted mb-3"></i>
              <h5>Nu există vouchere</h5>
              <p className="text-muted">Creează primul voucher sau cod promoțional</p>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Cod</th>
                  <th>Tip</th>
                  <th>Valoare</th>
                  <th>Utilizări</th>
                  <th>Valabilitate</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>
                      <code className="voucher-code">{voucher.code}</code>
                    </td>
                    <td>{getTypeLabel(voucher.type)}</td>
                    <td>
                      <strong>{formatValue(voucher)}</strong>
                    </td>
                    <td>
                      {voucher.used_count}/{voucher.max_uses}
                    </td>
                    <td>{formatDate(voucher.expiry_date)}</td>
                    <td>{getStatusBadge(voucher.status)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteVoucher(voucher.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Voucher Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus me-2"></i>Voucher Nou
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cod Voucher *</Form.Label>
              <div className="input-group">
                <Form.Control
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: SUMMER2025"
                  required
                />
                <Button variant="secondary" onClick={generateVoucherCode}>
                  <i className="fas fa-random"></i> Generează</Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tip Voucher *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
              >
                <option value="">Selectează tip</option>
                <option value="percentage">Reducere Procentuală (%)</option>
                <option value="fixed">Valoare Fixă (RON)</option>
                <option value="gift">Bon Cadou</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valoare *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="0"
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Data Start</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Data Expirare *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Utilizări maxime</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="1"
              />
              <Form.Text className="text-muted">Lăsați 1 pentru utilizare unică</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descriere</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="descriere optionala"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Anulează</Button>
          <Button variant="success" onClick={handleCreateVoucher} disabled={loading}>
            <i className="fas fa-check me-2"></i>"creeaza voucher"</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};



