import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { kioskLogin } from '../api/KioskApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/**
 * KioskLoginModal - Modal login reutilizabil
 * Folosit pentru deblocare StandBy și login normal
 */
export const KioskLoginModal = ({ show, onHide, onLoginSuccess, title = 'Autentificare KIOSK' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('🔐 Început autentificare KIOSK...', { username });
      const session = await kioskLogin(username, password);
      console.log('✅ Autentificare reușită, session:', session);
      
      // Verifică dacă sesiunea este validă
      if (!session || !session.username || !session.role) {
        console.error('❌ Sesiune invalidă primită:', session);
        setError('Eroare: Sesiune invalidă primită de la server.');
        setLoading(false);
        return;
      }
      
      // Verifică rolul - doar ospătar, supervisor, admin
      const allowedRoles = ['waiter', 'supervisor', 'admin'];
      if (!allowedRoles.includes(session.role)) {
        console.error('❌ Rol nepermis:', session.role);
        setError('Acces restricționat. Doar ospătari, supervisori și admin pot accasa KIOSK.');
        setLoading(false);
        return;
      }

      // Login history este deja logat în backend la /api/admin/auth/login
      // Doar setăm login_history_id dacă este disponibil
      if (session.login_history_id && window.__kioskSetLoginHistoryId) {
        window.__kioskSetLoginHistoryId(session.login_history_id);
      }

      // Verifică dacă sesiunea a fost salvată în sessionStorage
      const savedSession = JSON.parse(sessionStorage.getItem('kiosk_session') || 'null');
      if (!savedSession || savedSession.username !== session.username) {
        console.error('❌ Sesiunea nu a fost salvată corect în sessionStorage');
        // Salvează manual
        sessionStorage.setItem('kiosk_session', JSON.stringify(session));
        console.log('✅ Sesiune salvată manual în sessionStorage');
      }
      
      // 🟢 PATCH: Salvează user în localStorage pentru persistare între navigări
      try {
        localStorage.setItem('kiosk_user', JSON.stringify({
          username: session.username,
          role: session.role,
          timestamp: Date.now()
        }));
        console.log('✅ KioskLoginModal - User salvat în localStorage pentru persistare');
      } catch (err) {
        console.error('❌ Eroare la salvarea user în localStorage:', err);
      }

      // Reset form
      setUsername('');
      setPassword('');
      setError(null);
      
      // Callback success - IMPORTANT: apelează înainte de onHide
      if (onLoginSuccess) {
        console.log('📞 Apelare onLoginSuccess callback...');
        onLoginSuccess(session);
      }
      
      // Așteaptă puțin înainte de a închide modalul pentru a permite callback-ului să se execute
      // Și pentru a permite salvarea sesiunii în sessionStorage
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verifică din nou dacă sesiunea a fost salvată înainte de a închide
      const finalCheck = JSON.parse(sessionStorage.getItem('kiosk_session') || 'null');
      if (!finalCheck) {
        console.error('❌ KioskLoginModal - Sesiunea nu a fost salvată, salvez manual');
        sessionStorage.setItem('kiosk_session', JSON.stringify(session));
      }
      
      console.log('🔒 Închidere modal...');
      setLoading(false); // Asigură-te că loading este false înainte de a închide
      onHide();
    } catch (err) {
      console.error('❌ Eroare autentificare KIOSK:', err);
      setError(err.message || 'Autentificare eșuată. Verifică username și password.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setUsername('');
      setPassword('');
      onHide();
    }
  };

  console.log('🔍 KioskLoginModal render - show:', show, 'loading:', loading);
  
  // Debug: verifică dacă modalul este renderizat în DOM
  React.useEffect(() => {
    if (show) {
      console.log('✅ KioskLoginModal - show=true, modalul ar trebui să fie vizibil');
      // Verifică dacă modalul există în DOM după 100ms
      setTimeout(() => {
        const modal = document.querySelector('.kiosk-login-modal');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        console.log('🔍 KioskLoginModal DOM check - modal:', !!modal, 'backdrop:', !!modalBackdrop);
        if (modal) {
          const isVisible = window.getComputedStyle(modal).display !== 'none';
          console.log('🔍 KioskLoginModal visibility:', isVisible);
        }
      }, 100);
    }
  }, [show]);
  
  return (
    <Modal show={show} onHide={handleClose} size="md" centered className="kiosk-login-modal" backdrop="static" style={{ zIndex: 1000002 }}>
      <Modal.Header closeButton={!loading}>
        <Modal.Title>
          <i className="fas fa-lock me-2"></i>{title}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-4">
            <Form.Label htmlFor="kiosk-login-username">
              <i className="fas fa-user me-2"></i>Username
            </Form.Label>
            <Form.Control
              id="kiosk-login-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Introdu username"
              required
              autoFocus
              size="lg"
              disabled={loading}
              className="kiosk-input"
              autoComplete="username"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label htmlFor="kiosk-login-password">
              <i className="fas fa-lock me-2"></i>Password
            </Form.Label>
            <Form.Control
              id="kiosk-login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introdu password"
              required
              size="lg"
              disabled={loading}
              className="kiosk-input"
              autoComplete="current-password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
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
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

