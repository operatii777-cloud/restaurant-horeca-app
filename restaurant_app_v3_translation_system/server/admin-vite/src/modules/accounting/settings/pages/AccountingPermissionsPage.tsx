// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Permissions Page
 * 
 * Gestionare Permisiuni Contabilitate:
 * - Lista permisiuni
 * - Asignare permisiuni utilizatori
 * - Roluri contabilitate
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './AccountingPermissionsPage.css';

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface UserPermission {
  user_id: number;
  username: string;
  permission_id: number;
  permission_name: string;
  granted_at: string;
  granted_by: string;
}

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

export const AccountingPermissionsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadPermissions(),
        loadUserPermissions(),
        loadUsers()
      ]);
    } catch (err: any) {
      console.error('AccountingPermissionsPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await httpClient.get('/api/accounting/settings/permissions');
      console.log('AccountingPermissionsPage Permissions response:', response.data);
      
      let permissionsList: Permission[] = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        permissionsList = response.data.data;
      } else if (Array.isArray(response.data)) {
        permissionsList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        permissionsList = response.data.data;
      }
      
      if (!Array.isArray(permissionsList)) {
        permissionsList = [];
      }
      
      setPermissions(permissionsList);
    } catch (err: any) {
      console.error('AccountingPermissionsPage Error loading permissions:', err);
      setPermissions([]);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const response = await httpClient.get('/api/accounting/settings/user-permissions');
      console.log('AccountingPermissionsPage User permissions response:', response.data);
      
      let userPermsList: UserPermission[] = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        userPermsList = response.data.data;
      } else if (Array.isArray(response.data)) {
        userPermsList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        userPermsList = response.data.data;
      }
      
      if (!Array.isArray(userPermsList)) {
        userPermsList = [];
      }
      
      setUserPermissions(userPermsList);
    } catch (err: any) {
      console.error('AccountingPermissionsPage Error loading user permissions:', err);
      setUserPermissions([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await httpClient.get('/api/accounting/settings/users');
      console.log('AccountingPermissionsPage Users response:', response.data);
      
      let usersList: User[] = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        usersList = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        usersList = response.data.data;
      }
      
      if (!Array.isArray(usersList)) {
        usersList = [];
      }
      
      setUsers(usersList);
    } catch (err: any) {
      console.error('AccountingPermissionsPage Error loading users:', err);
      setUsers([]);
    }
  };

  const handleAssignPermission = (user: User) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const handleRemovePermission = async (userId: number, permissionId: number) => {
    if (!confirm('Sigur doriți să eliminați această permisiune?')) {
      return;
    }

    try {
      const response = await httpClient.delete(`/api/accounting/settings/user-permissions/${userId}/${permissionId}`);
      if (response.data.success) {
        loadUserPermissions();
      } else {
        alert('Eroare la eliminare: ' + (response.data.error || 'Eroare necunoscută'));
      }
    } catch (err: any) {
      alert('Eroare la eliminare: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSubmitAssign = async () => {
    if (!selectedUser || !selectedPermission) {
      alert('Selectați utilizatorul și permisiunea');
      return;
    }

    try {
      const response = await httpClient.post('/api/accounting/settings/user-permissions', {
        user_id: selectedUser.id,
        permission_id: selectedPermission.id
      });
      
      if (response.data.success) {
        setShowAssignModal(false);
        setSelectedUser(null);
        setSelectedPermission(null);
        loadUserPermissions();
      } else {
        alert('Eroare la asignare: ' + (response.data.error || 'Eroare necunoscută'));
      }
    } catch (err: any) {
      alert('Eroare la asignare: ' + (err.response?.data?.error || err.message));
    }
  };

  const getPermissionCategoryBadge = (category: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      'reports': { bg: 'info', label: 'Rapoarte' },
      'settings': { bg: 'warning', label: 'Setări' },
      'export': { bg: 'success', label: 'Export' },
      "Audit": { bg: 'danger', label: 'Audit' },
      'other': { bg: 'secondary', label: 'Altul' }
    };
    const badge = badges[category] || badges['other'];
    return <Badge bg={badge.bg}>{badge.label}</Badge>;
  };

  const getUserPermissions = (userId: number) => {
    return userPermissions.filter(up => up.user_id === userId);
  };

  return (
    <div className="accounting-permissions-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>ðŸ” Permisiuni Contabilitate</h1>
          <p>"gestionare permisiuni si acces utilizatori pentru "</p>
        </div>
        <Button variant="outline-info" onClick={() => setShowHelpModal(true)}>
          <i className="fas fa-question-circle me-2"></i>
          Ajutor
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">"permisiuni disponibile"</h5>
              <Button variant="outline-primary" size="sm" onClick={loadPermissions}>
                <i className="fas fa-sync me-2"></i>"Reîncarcă"</Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>
              ) : (
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Categorie</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const safePermissions = Array.isArray(permissions) ? permissions : [];
                      if (safePermissions.length > 0) {
                        return safePermissions.map((permission) => (
                          <tr key={permission.id}>
                            <td>
                              <strong>{permission.name}</strong>
                              {permission.description && (
                                <div className="text-muted small">{permission.description}</div>
                              )}
                            </td>
                            <td>{getPermissionCategoryBadge(permission.category || 'other')}</td>
                            <td>
                              <Badge bg={permission.is_active ? 'success' : 'secondary'}>
                                {permission.is_active ? 'Activă' : 'Inactivă'}
                              </Badge>
                            </td>
                          </tr>
                        ));
                      } else {
                        return (
                          <tr>
                            <td colSpan={3} className="text-center text-muted py-4">"nu exista permisiuni definite permisiunile vor apa"</td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">"permisiuni utilizatori"</h5>
              <Button variant="outline-primary" size="sm" onClick={loadUserPermissions}>
                <i className="fas fa-sync me-2"></i>"Reîncarcă"</Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>
              ) : (
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Utilizator</th>
                      <th>"Permisiune"</th>
                      <th>"Acțiuni"</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const safeUserPerms = Array.isArray(userPermissions) ? userPermissions : [];
                      if (safeUserPerms.length > 0) {
                        return safeUserPerms.map((up, index) => (
                          <tr key={`${up.user_id}-${up.permission_id}-"Index"`}>
                            <td>{up.username}</td>
                            <td>{up.permission_name}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemovePermission(up.user_id, up.permission_id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ));
                      } else {
                        return (
                          <tr>
                            <td colSpan={3} className="text-center text-muted py-4">"nu exista permisiuni asignate asigneaza permisiuni"</td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Utilizatori</h5>
          <Button variant="outline-primary" size="sm" onClick={loadUsers}>
            <i className="fas fa-sync me-2"></i>"Reîncarcă"</Button>
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
                  <th>Utilizator</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>"Permisiuni"</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const safeUsers = Array.isArray(users) ? users : [];
                  if (safeUsers.length > 0) {
                    return safeUsers.map((user) => {
                      const userPerms = getUserPermissions(user.id);
                      return (
                        <tr key={user.id}>
                          <td><strong>{user.username}</strong></td>
                          <td>{user.email || 'N/A'}</td>
                          <td><Badge bg="info">{user.role || 'N/A'}</Badge></td>
                          <td>
                            {userPerms.length > 0 ? (
                              <div>
                                {userPerms.map((up, idx) => (
                                  <Badge key={idx} bg="success" className="me-1">
                                    {up.permission_name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">"fara permisiuni"</span>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleAssignPermission(user)}
                            >
                              <i className="fas fa-plus me-1"></i>"Asignează"</Button>
                          </td>
                        </tr>
                      );
                    });
                  } else {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">"nu exista utilizatori utilizatorii vor aparea aici"</td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Assign Permission Modal */}
      <Modal show={showAssignModal} onHide={() => {
        setShowAssignModal(false);
        setSelectedUser(null);
        setSelectedPermission(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-plus me-2"></i>"asigneaza permisiune"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <Form.Group className="mb-3">
                <Form.Label><strong>Utilizator</strong></Form.Label>
                <Form.Control type="text" value={selectedUser.username} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>Selectează Permisiune</strong></Form.Label>
                <Form.Select
                  value={selectedPermission?.id || ''}
                  onChange={(e) => {
                    const permId = parseInt(e.target.value);
                    const perm = permissions.find(p => p.id === permId);
                    setSelectedPermission(perm || null);
                  }}
                >
                  <option value="">"selecteaza permisiune"</option>
                  {permissions
                    .filter(p => p.is_active)
                    .map((permission) => (
                      <option key={permission.id} value={permission.id}>
                        {permission.name} - {permission.description || permission.code}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAssignModal(false);
            setSelectedUser(null);
            setSelectedPermission(null);
          }}>"Anulează"</Button>
          <Button variant="primary" onClick={handleSubmitAssign} disabled={!selectedPermission}>
            <i className="fas fa-check me-2"></i>"Asignează"</Button>
        </Modal.Footer>
      </Modal>

      {/* Help Modal */}
      <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} size="lg" className="help-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-question-circle me-2"></i>"ajutor permisiuni contabilitate"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="help-content">
            <h5>ðŸ“‹ Cum funcționează permisiunile?</h5>
            <p>
              Permisiunile contabilitate controlează accesul utilizatorilor la funcțiile modulului contabilitate.
              Fiecare utilizator poate avea una sau mai multe permisiuni asignate.
            </p>

            <h5 className="mt-4">ðŸ‘¤ Cum creez utilizatori?</h5>
            <p>"pentru a crea utilizatori noi urmeaza acesti pasi"</p>
            <ol>
              <li>
                <strong>"acceseaza pagina de utilizatori"</strong>
                <ul>
                  <li>"mergi la"<strong>Setări â†’ Utilizatori & Permisiuni</strong></li>
                  <li>"sau acceseaza direct"<code>/admin-vite/settings/users</code></li>
                </ul>
              </li>
              <li>
                <strong>Click pe butonul "âž• Adaugă Utilizator"</strong>
              </li>
              <li>
                <strong>"completeaza formularul"</strong>
                <ul>
                  <li><strong>Username</strong> (obligatoriu) - numele de utilizator</li>
                  <li><strong>Email</strong> (opțional) - adresa de email</li>
                  <li><strong>Parolă</strong> (obligatoriu) - parola pentru autentificare</li>
                  <li><strong>Rol</strong> (obligatoriu) - selectează rolul din dropdown</li>
                </ul>
              </li>
              <li>
                <strong>Click pe "Salvează"</strong>
              </li>
            </ol>

            <h5 className="mt-4">ðŸ”— Flux complet: Creare â†’ Asignare Permisiuni</h5>
            <div className="alert alert-info">
              <ol className="mb-0">
                <li><strong>Creezi utilizatorul</strong> â†’ Setări â†’ Utilizatori & Permisiuni</li>
                <li><strong>Utilizatorul apare</strong> în lista de utilizatori</li>
                <li><strong>"mergi la"</strong> Contabilitate â†’ Setări â†’ Permisiuni Contabilitate</li>
                <li><strong>Click pe "Asignează"</strong> lângă utilizatorul dorit</li>
                <li><strong>"selectezi permisiunea"</strong> din dropdown</li>
                <li><strong>Click "Asignează"</strong> pentru a finaliza</li>
              </ol>
            </div>

            <h5 className="mt-4">ðŸ“ Tipuri de permisiuni disponibile</h5>
            <ul>
              <li><strong>Vizualizare Rapoarte</strong> - Poate vizualiza rapoarte contabile</li>
              <li><strong>Export Date</strong> - Poate exporta date contabile</li>
              <li><strong>"gestionare setari"</strong> - Poate modifica setările contabilitate</li>
              <li><strong>"vizualizare audit"</strong> - Poate vizualiza log-uri audit</li>
            </ul>

            <h5 className="mt-4">ðŸ”§ Endpoint-uri API disponibile</h5>
            <ul>
              <li><code>GET /api/admin/users</code> - Lista utilizatori</li>
              <li><code>POST /api/admin/users</code> - Creare utilizator</li>
              <li><code>PUT /api/admin/users/:id</code> - Actualizare utilizator</li>
              <li><code>DELETE /api/admin/users/:id</code> - È˜tergere utilizator</li>
              <li><code>GET /api/admin/roles</code> - Lista roluri disponibile</li>
            </ul>

            <div className="alert alert-warning mt-4">
              <strong>ðŸ’¡ Notă:</strong> Utilizatorii creați în pagina "Utilizatori & Permisiuni" vor apărea automat 
              în această pagină pentru asignarea permisiunilor specifice contabilității.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHelpModal(false)}>"ÃŽnchide"</Button>
          <Button variant="primary" onClick={() => {
            setShowHelpModal(false);
            window.location.href = '/admin-vite/settings/users';
          }}>
            <i className="fas fa-user-plus me-2"></i>
            Mergi la Utilizatori & Permisiuni
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};







