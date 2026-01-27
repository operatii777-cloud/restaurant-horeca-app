// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import { HelpButton } from '@/shared/components/HelpButton';
import './UsersPage.css';

interface User {
  id: number;
  username: string;
  email?: string;
  role_name: string;
  role_description?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface Role {
  id: number;
  role_name: string;
  role_description?: string;
  user_count: number;
}

export const UsersPage: React.FC = () => {
//   const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: usersData, refetch: refetchUsers } = useApiQuery<User[]>('/api/admin/users');
  const { data: rolesData } = useApiQuery<Role[]>('/api/admin/roles');
  const createMutation = useApiMutation();
  const updateMutation = useApiMutation();

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      setLoading(false);
    }
  }, [usersData]);

  useEffect(() => {
    if (rolesData) {
      setRoles(rolesData);
    }
  }, [rolesData]);

  const handleSave = async (userData: { username: string; email?: string; password?: string; roleId: number }) => {
    try {
      if (editingUser?.id) {
        await updateMutation.mutate({
          url: `/api/admin/users/${editingUser.id}`,
          method: 'PUT',
          data: userData
        });
        setAlert({ type: 'success', message: 'Utilizator actualizat cu succes!' });
      } else {
        await createMutation.mutate({
          url: '/api/admin/users',
          method: 'POST',
          data: userData
        });
        setAlert({ type: 'success', message: 'Utilizator creat cu succes!' });
      }
      setShowModal(false);
      setEditingUser(null);
      refetchUsers();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  if (loading) {
    return <div className="users-page">Se încarcă...</div>;
  }

  return (
    <div className="users-page">
      <PageHeader
        title='utilizatori & permisiuni'
        description="Gestionare utilizatori și roluri"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="users-page__actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
        >
          ➕ Adaugă Utilizator
        </button>
      </div>

      <div className="users-page__table">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Status</th>
              <th>Ultimul Login</th>
              <th>"Acțiuni"</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">"nu exista utilizatori"</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email || '-'}</td>
                  <td>{user.role_name}</td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {user.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleString('ro-RO') : '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setEditingUser(user);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

interface UserModalProps {
  user: User | null;
  roles: Role[];
  onSave: (userData: { username: string; email?: string; password?: string; roleId: number }) => void;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, roles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    roleId: user?.id || roles[0]?.id || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.roleId) {
      alert('Username și rolul sunt obligatorii');
      return;
    }
    if (!user && !formData.password) {
      alert('Parola este obligatorie pentru utilizatori noi');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{user ? 'Editare Utilizator' : 'Adaugă Utilizator'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Parolă {!user && '*'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
              placeholder={user ? 'Lăsați gol pentru a nu schimba' : ''}
            />
          </div>
          <div className="form-group">
            <label>Rol *</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>"Anulează"</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




