import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { kioskLogin, checkKioskSession } from '../api/KioskApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../kiosk.css';

export const KioskLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifică dacă există sesiune validă
    const session = checkKioskSession();
    if (session) {
      // Verifică rolul - doar ospătar, supervisor, admin
      const allowedRoles = ['waiter', 'supervisor', 'admin'];
      if (allowedRoles.includes(session.role)) {
        navigate('/kiosk/tables');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('🔐 KioskLoginPage.handleSubmit - Form values:', { username, password, usernameLength: username.length, passwordLength: password.length });
      
      // Validate form fields
      if (!username || username.trim() === '') {
        setError('Username este obligatoriu');
        setLoading(false);
        return;
      }
      
      if (!password || password.trim() === '') {
        setError('Password este obligatoriu');
        setLoading(false);
        return;
      }
      
      if (username.length < 3) {
        setError('Username trebuie să aibă cel puțin 3 caractere');
        setLoading(false);
        return;
      }
      
      const session = await kioskLogin(username.trim(), password.trim());
      
      // Verifică rolul - doar ospătar, supervisor, admin
      const allowedRoles = ['waiter', 'supervisor', 'admin'];
      if (!allowedRoles.includes(session.role)) {
        setError('Acces restricționat. Doar ospătari, supervisori și admin pot accesa KIOSK.');
        return;
      }

      // Setează login history ID pentru AutoLockManager
      if (session.login_history_id && window.__kioskSetLoginHistoryId) {
        window.__kioskSetLoginHistoryId(session.login_history_id);
      }

      // Redirect la plan mese
      navigate('/kiosk/tables');
    } catch (err) {
      setError(err.message || 'Autentificare eșuată. Verifică username și password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kiosk-login-page">
      <div className="kiosk-login-container">
        <Card className="kiosk-login-card shadow-lg">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <i className="fas fa-cash-register fa-4x text-primary mb-3"></i>
              <h2 className="mb-2">KIOSK Terminal</h2>
              <p className="text-muted">Autentificare ospătar</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label htmlFor="kiosk-login-page-username">
                  <i className="fas fa-user me-2"></i>Username
                </Form.Label>
                <Form.Control
                  id="kiosk-login-page-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Introdu username"
                  required
                  autoFocus
                  size="lg"
                  className="kiosk-input"
                  autoComplete="username"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="kiosk-login-page-password">
                  <i className="fas fa-lock me-2"></i>Password
                </Form.Label>
                <Form.Control
                  id="kiosk-login-page-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introdu password"
                  required
                  size="lg"
                  className="kiosk-input"
                  autoComplete="current-password"
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-100 kiosk-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Se autentifică...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>Autentificare
                  </>
                )}
              </Button>
            </Form>

            <div className="mt-4 text-center">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Doar ospătari, supervisori și admin pot accesa KIOSK
              </small>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

