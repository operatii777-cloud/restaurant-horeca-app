import { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface KioskUser {
  id?: number;
  username: string;
  password?: string;
  role: 'waiter' | 'supervisor' | 'admin';
  full_name?: string;
  is_active: boolean;
}

export const KioskUsersSection = () => {
  const [users, setUsers] = useState<KioskUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<KioskUser | null>(null);
  const [formData, setFormData] = useState<KioskUser>({
    username: '',
    password: '',
    role: 'waiter',
    full_name: '',
    is_active: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/admin/kiosk/users');
      setUsers(response.data?.users || []);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea utilizatorilor:', err);
      setError(err.response?.data?.error || 'Nu s-au putut încărca utilizatorii.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: KioskUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        role: user.role,
        full_name: user.full_name || '',
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'waiter',
        full_name: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'waiter',
      full_name: '',
      is_active: true,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validare
    if (!formData.username.trim()) {
      setError('Username este obligatoriu.');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Parola este obligatorie pentru utilizatori noi.');
      return;
    }

    if (formData.password && formData.password.length < 4) {
      setError('Parola trebuie să aibă minim 4 caractere.');
      return;
    }

    try {
      const payload: any = {
        username: formData.username.trim(),
        role: formData.role,
        full_name: formData.full_name?.trim() || null,
        is_active: formData.is_active,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser && editingUser.id) {
        // Update
        await httpClient.put(`/api/admin/kiosk/users/${editingUser.id}`, payload);
      } else {
        // Create
        await httpClient.post('/api/admin/kiosk/users', payload);
      }

      handleCloseModal();
      loadUsers();
    } catch (err: any) {
      console.error('❌ Eroare la salvarea utilizatorului:', err);
      setError(err.response?.data?.error || 'Nu s-a putut salva utilizatorul.');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Sigur vrei să ștergi acest utilizator?')) {
      return;
    }

    try {
      await httpClient.delete(`/api/admin/kiosk/users/${userId}`);
      loadUsers();
    } catch (err: any) {
      console.error('❌ Eroare la ștergerea utilizatorului:', err);
      alert(err.response?.data?.error || 'Nu s-a putut șterge utilizatorul.');
    }
  };

  const handleToggleActive = async (user: KioskUser) => {
    if (!user.id) return;

    try {
      await httpClient.put(`/api/admin/kiosk/users/${user.id}`, {
        ...user,
        is_active: !user.is_active,
      });
      loadUsers();
    } catch (err: any) {
      console.error('❌ Eroare la actualizarea statusului:', err);
      alert(err.response?.data?.error || 'Nu s-a putut actualiza statusul.');
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      admin: { bg: 'danger', label: 'Admin' },
      supervisor: { bg: 'warning', label: 'Supervisor' },
      waiter: { bg: 'info', label: 'Ospătar' },
    };
    const badge = badges[role] || { bg: 'secondary', label: role };
    return <Badge bg={badge.bg}>{badge.label}</Badge>;
  };

  return (
    <div className="kiosk-users-section">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>
          <i className="fas fa-users me-2"></i>Gestionare Utilizatori KIOSK
        </h3>
        <p style={{ color: '#666', marginBottom: 0 }}>
          Setează username și parolă pentru acces în KIOSK pentru ospătari, supervisori și admin.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Lista Utilizatori
          </h5>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-2"></i>Utilizator Nou
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
              <p className="mt-3">Se încarcă utilizatorii...</p>
            </div>
          ) : users.length === 0 ? (
            <Alert variant="info" className="text-center">
              <i className="fas fa-info-circle me-2"></i>Nu există utilizatori. Adaugă primul utilizator.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Nume Complet</th>
                    <th>Rol</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.full_name || '—'}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        <Badge bg={user.is_active ? 'success' : 'secondary'}>
                          {user.is_active ? 'Activ' : 'Inactiv'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenModal(user)}
                            title="Editează utilizator"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant={user.is_active ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                            title={user.is_active ? 'Dezactivează' : 'Activează'}
                          >
                            <i className={`fas fa-${user.is_active ? 'ban' : 'check'}`}></i>
                          </Button>
                          {user.role !== 'admin' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => user.id && handleDelete(user.id)}
                              title="Șterge utilizator"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Add/Edit User */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? (
              <>
                <i className="fas fa-edit me-2"></i>Editează Utilizator KIOSK
              </>
            ) : (
              <>
                <i className="fas fa-plus me-2"></i>Utilizator Nou KIOSK
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                Username <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                required
                disabled={!!editingUser}
              />
              {editingUser && (
                <Form.Text className="text-muted">Username-ul nu poate fi modificat.</Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {editingUser ? 'Parolă Nouă (lasă gol pentru a păstra parola existentă)' : 'Parolă *'}
              </Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'Parolă nouă (opțional)' : 'Parolă'}
                required={!editingUser}
                minLength={4}
              />
              <Form.Text className="text-muted">Minim 4 caractere.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nume Complet</Form.Label>
              <Form.Control
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nume complet (opțional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Rol <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'waiter' | 'supervisor' | 'admin' })
                }
                required
              >
                <option value="waiter">Ospătar</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Rolul determină nivelul de acces în KIOSK.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Utilizator activ"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Form.Text className="text-muted">
                Utilizatorii inactivi nu pot accesa KIOSK.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              <i className="fas fa-times me-2"></i>Anulează
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>Salvează
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

