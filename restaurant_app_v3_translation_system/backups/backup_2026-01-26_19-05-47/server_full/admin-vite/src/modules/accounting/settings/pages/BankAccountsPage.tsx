// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Bank Accounts Page
 * 
 * Gestionare Conturi Bancare:
 * - Cont Nou
 * - Editare Cont
 * - Lista Conturi
 * - Balanțe
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Modal, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { HelpButton } from '@/shared/components/HelpButton';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './BankAccountsPage.css';

interface BankAccount {
  id?: number;
  bankName: string;
  accountNumber: string;
  accountHolder?: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  accountType: 'current' | 'savings' | 'deposit';
  isActive: boolean;
  openingBalance: number;
  currentBalance: number;
  notes?: string;
}

export const BankAccountsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<BankAccount>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    iban: '',
    swiftCode: '',
    currency: 'RON',
    accountType: 'current',
    isActive: true,
    openingBalance: 0,
    currentBalance: 0,
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/accounting/settings/bank-accounts');
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        setAccounts([]);
      }
    } catch (err: any) {
      console.error('BankAccountsPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea conturilor');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingAccount?.id) {
        await httpClient.put(`/api/accounting/settings/bank-accounts/${editingAccount.id}`, formData);
      } else {
        await httpClient.post('/api/accounting/settings/bank-accounts', formData);
      }
      setShowModal(false);
      setEditingAccount(null);
      setFormData({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        iban: '',
        swiftCode: '',
        currency: 'RON',
        accountType: 'current',
        isActive: true,
        openingBalance: 0,
        currentBalance: 0,
        notes: ''
      });
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la salvare');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData(account);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sigur doriți să ștergeți acest cont bancar?')) return;
    try {
      await httpClient.delete(`/api/accounting/settings/bank-accounts/"Id"`);
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la ștergere');
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const badges: { [key: string]: { bg: string; label: string } } = {
      current: { bg: 'primary', label: 'Curent' },
      savings: { bg: 'success', label: 'Economii' },
      deposit: { bg: 'info', label: 'Depozit' }
    };
    const badge = badges[type] || { bg: 'secondary', label: type };
    return <Badge bg={badge.bg}>{badge.label}</Badge>;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

  return (
    <div className="bank-accounts-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🏦 Conturi Bancare</h1>
          <p>"gestionare conturi bancare adaugare editare si mon"</p>
        </div>
        <HelpButton
          title="Ajutor - Conturi Bancare"
          content={
            <div>
              <h5>🏦 Ce sunt conturile bancare?</h5>
              <p>
                Conturile bancare permit gestionarea tuturor conturilor bancare ale restaurantului, 
                inclusiv balanțe, IBAN, SWIFT și alte informații importante.
              </p>
              <h5 className="mt-4">📋 Câmpuri importante</h5>
              <ul>
                <li><strong>"nume banca"</strong> - Numele băncii (ex: BCR, BRD, Raiffeisen)</li>
                <li><strong>"numar cont"</strong> - Numărul contului bancar</li>
                <li><strong>"Titular"</strong> - Persoana sau entitatea titulară a contului</li>
                <li><strong>IBAN</strong> - Codul IBAN al contului (format: ROXX XXXX XXXX...)</li>
                <li><strong>"swift code"</strong> - Codul SWIFT al băncii (pentru transferuri internaționale)</li>
                <li><strong>"Monedă"</strong> - Moneda contului (RON, EUR, USD)</li>
                <li><strong>Tip Cont</strong> - Curent, Economii sau Depozit</li>
                <li><strong>"balanta initiala"</strong> - Balanța la deschiderea contului în sistem</li>
                <li><strong>"balanta curenta"</strong> - Balanța actuală (actualizată automat)</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Balanța curentă este actualizată automat pe baza tranzacțiilor 
                înregistrate în sistem.
              </div>
            </div>
          }
        />
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Summary Card */}
      <Card className="mb-4 bg-primary text-white">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5>Total Conturi: {accounts.length}</h5>
            </Col>
            <Col md={6} className="text-end">
              <h5>Balanță Totală: {totalBalance.toFixed(2)} RON</h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista Conturi Bancare</h5>
          <Button
            variant="primary"
            onClick={() => {
              setEditingAccount(null);
              setFormData({
                bankName: '',
                accountNumber: '',
                accountHolder: '',
                iban: '',
                swiftCode: '',
                currency: 'RON',
                accountType: 'current',
                isActive: true,
                openingBalance: 0,
                currentBalance: 0,
                notes: ''
              });
              setShowModal(true);
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Cont Nou
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>"Bancă"</th>
                  <th>"numar cont"</th>
                  <th>"Titular"</th>
                  <th>IBAN</th>
                  <th>Tip</th>
                  <th>"Monedă"</th>
                  <th>"Balanță"</th>
                  <th>Status</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">"nu exista conturi bancare adauga primul cont"</td>
                  </tr>
                ) : (
                  accounts.map((account) => (
                    <tr key={account.id}>
                      <td><strong>{account.bankName}</strong></td>
                      <td>{account.accountNumber}</td>
                      <td>{account.accountHolder || '-'}</td>
                      <td>{account.iban || '-'}</td>
                      <td>{getAccountTypeBadge(account.accountType)}</td>
                      <td>{account.currency}</td>
                      <td className={account.currentBalance >= 0 ? 'text-success' : 'text-danger'}>
                        <strong>{account.currentBalance.toFixed(2)} {account.currency}</strong>
                      </td>
                      <td>
                        <Badge bg={account.isActive ? 'success' : 'secondary'}>
                          {account.isActive ? 'Activ' : 'Inactiv'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(account)}
                          className="me-2"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => account.id && handleDelete(account.id)}
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

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAccount ? 'Editare Cont Bancar' : 'Cont Bancar Nou'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nume Bancă *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Ex: BCR, BRD, ING"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Număr Cont *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Ex: RO12BCRO0001234567890123"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>"titular cont"</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.accountHolder || ''}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="nume titular"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>IBAN</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.iban || ''}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="RO12BCRO0001234567890123"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>"swift code"</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.swiftCode || ''}
                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                    placeholder="Ex: BCROROBU"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Monedă *</Form.Label>
                  <Form.Select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="RON">RON</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tip Cont *</Form.Label>
                  <Form.Select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                  >
                    <option value="current">"Curent"</option>
                    <option value="savings">Economii</option>
                    <option value="deposit">"Depozit"</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>"balanta initiala"</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>"balanta curenta"</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="note despre cont"
              />
            </Form.Group>
            <Form.Check
              type="switch"
              id="is-active"
              label="Cont Activ"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>"Anulează"</Button>
          <Button variant="primary" onClick={handleSave}>
            <i className="fas fa-save me-2"></i>
            Salvează
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};






