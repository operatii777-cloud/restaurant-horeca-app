// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Accounts Page
 * 
 * Gestionare Conturi Contabile (Planu Conturi):
 * - Cont Nou
 * - Editare Cont
 * - Atribuire Produse → Conturi
 * - Lista Conturi
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Modal, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { HelpButton } from '@/shared/components/HelpButton';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './AccountingAccountsPage.css';

interface AccountingAccount {
  id?: number;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | "Revenue" | 'expense';
  parentAccountId?: number;
  isActive: boolean;
  description?: string;
}

export const AccountingAccountsPage: React.FC = () => {
//   const { t } = useTranslation();
  // Asigură-te că accounts este întotdeauna un array - FORCE INITIALIZATION
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  
  // Double-check: asigură-te că accounts este array la fiecare render
  const safeAccounts = React.useMemo(() => {
    if (!Array.isArray(accounts)) {
      console.warn('AccountingAccountsPage accounts is not an array, converting to []');
      return [];
    }
    return accounts;
  }, [accounts]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountingAccount | null>(null);
  const [formData, setFormData] = useState<AccountingAccount>({
    accountCode: '',
    accountName: '',
    accountType: 'expense',
    isActive: true,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/accounting/settings/accounts');
      console.log('AccountingAccountsPage Response:', response.data);
      
      // Suport pentru multiple formate de răspuns
      let accountsList: AccountingAccount[] = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        accountsList = response.data.data;
      } else if (Array.isArray(response.data)) {
        accountsList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        accountsList = response.data.data;
      }
      
      // Asigură-te că accountsList este întotdeauna un array
      if (!Array.isArray(accountsList)) {
        console.warn('AccountingAccountsPage accountsList is not an array, setting to empty array');
        accountsList = [];
      }
      
      console.log('AccountingAccountsPage Loaded accounts:', accountsList.length);
      setAccounts(accountsList);
    } catch (err: any) {
      console.error('AccountingAccountsPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea conturilor');
      setAccounts([]); // Asigură-te că accounts este întotdeauna un array
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingAccount?.id) {
        await httpClient.put(`/api/accounting/settings/accounts/${editingAccount.id}`, formData);
      } else {
        await httpClient.post('/api/accounting/settings/accounts', formData);
      }
      setShowModal(false);
      setEditingAccount(null);
      setFormData({
        accountCode: '',
        accountName: '',
        accountType: 'expense',
        isActive: true,
      });
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la salvare');
    }
  };

  const handleEdit = (account: AccountingAccount) => {
    setEditingAccount(account);
    setFormData(account);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sigur doriți să ștergeți acest cont?')) return;
    try {
      await httpClient.delete(`/api/accounting/settings/accounts/"Id"`);
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la ștergere');
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const badges: { [key: string]: { bg: string; label: string } } = {
      asset: { bg: 'primary', label: 'Activ' },
      liability: { bg: 'danger', label: 'Pasiv' },
      equity: { bg: 'info', label: 'Capital' },
      revenue: { bg: 'success', label: 'Venit' },
      expense: { bg: 'warning', label: 'Cheltuială' },
    };
    const badge = badges[type] || { bg: 'secondary', label: type };
    return <Badge bg={badge.bg}>{badge.label}</Badge>;
  };

  return (
    <div className="accounting-accounts-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>📋 Conturi Contabile</h1>
          <p>"gestionare planu conturi conturi tipuri si atribui"</p>
        </div>
        <HelpButton
          title="Ajutor - Coduri Contabile"
          content={
            <div>
              <h5>📋 Ce sunt codurile contabile?</h5>
              <p>
                Codurile contabile sunt structura de bază a contabilității. Fiecare cont are un cod unic 
                și un tip (Activ, Pasiv, Capital, Venit, Cheltuială).
              </p>
              <h5 className="mt-4">🔧 Cum funcționează?</h5>
              <ul>
                <li><strong>Cod Cont</strong> - Codul unic al contului (ex: 301, 401, 607)</li>
                <li><strong>"nume cont"</strong> - Denumirea contului</li>
                <li><strong>Tip Cont</strong> - Categoria contului (Activ, Pasiv, Capital, Venit, Cheltuială)</li>
                <li><strong>"cont parinte"</strong> - Contul superior în ierarhie (opțional)</li>
                <li><strong>Status</strong> - Activ/Inactiv</li>
              </ul>
              <h5 className="mt-4">📝 Tipuri de conturi</h5>
              <ul>
                <li><strong>Activ</strong> - Bunuri și drepturi (ex: Casa, Banca, Stocuri)</li>
                <li><strong>Pasiv</strong> - Datorii și obligații (ex: Furnizori, Credite)</li>
                <li><strong>Capital</strong> - Capital propriu (ex: Capital social, Rezerve)</li>
                <li><strong>Venit</strong> - Venituri (ex: Vânzări, Venituri din servicii)</li>
                <li><strong>"Cheltuială"</strong> - Cheltuieli (ex: Cheltuieli cu mărfuri, Salarii)</li>
              </ul>
              <h5 className="mt-4">💼 Coduri contabile comune pentru restaurante</h5>
              <Table striped bordered size="sm" className="mt-3">
                <thead>
                  <tr>
                    <th>Cod</th>
                    <th>Denumire</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>301</td><td>"Mărfuri"</td><td>Activ</td></tr>
                  <tr><td>371</td><td>"marfuri in curs de aprovizionare"</td><td>Activ</td></tr>
                  <tr><td>401</td><td>Furnizori</td><td>Pasiv</td></tr>
                  <tr><td>411</td><td>Clienți</td><td>Activ</td></tr>
                  <tr><td>5311</td><td>"casa in lei"</td><td>Activ</td></tr>
                  <tr><td>5121</td><td>"conturi la banci in lei"</td><td>Activ</td></tr>
                  <tr><td>607</td><td>"cheltuieli cu marfurile"</td><td>"Cheltuială"</td></tr>
                  <tr><td>641</td><td>"cheltuieli cu salariile personalului"</td><td>"Cheltuială"</td></tr>
                  <tr><td>701</td><td>"venituri din vanzarea produselor finite"</td><td>Venit</td></tr>
                  <tr><td>704</td><td>Venituri din servicii prestate</td><td>Venit</td></tr>
                </tbody>
              </Table>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> După crearea conturilor, poți atribui produse la conturi 
                în pagina "Mapare Produse → Conturi Contabile".
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

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista Conturi</h5>
          <Button
            variant="primary"
            onClick={() => {
              setEditingAccount(null);
              setFormData({
                accountCode: '',
                accountName: '',
                accountType: 'expense',
                isActive: true,
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
                  <th>Cod Cont</th>
                  <th>Denumire</th>
                  <th>Tip</th>
                  <th>Status</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Use the memoized safeAccounts from useMemo
                  if (safeAccounts.length > 0) {
                    return safeAccounts.map((account) => (
                      <tr key={account.id}>
                        <td><strong>{account.accountCode}</strong></td>
                        <td>{account.accountName}</td>
                        <td>{getAccountTypeBadge(account.accountType)}</td>
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
                    ));
                  } else {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">"nu exista conturi contabile adauga un cont nou pen"</td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="accounting-accounts-page">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAccount ? 'Editare Cont' : 'Cont Nou'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cod Cont *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.accountCode}
                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                    placeholder="Ex: 401, 371, 607"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tip Cont *</Form.Label>
                  <Form.Select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                  >
                    <option value="asset">Activ</option>
                    <option value="liability">Pasiv</option>
                    <option value="equity">Capital</option>
                    <option value="revenue">Venit</option>
                    <option value="expense">"Cheltuială"</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Denumire Cont *</Form.Label>
              <Form.Control
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="ex furnizori marfuri vanzari"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descriere</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="descriere cont"
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






