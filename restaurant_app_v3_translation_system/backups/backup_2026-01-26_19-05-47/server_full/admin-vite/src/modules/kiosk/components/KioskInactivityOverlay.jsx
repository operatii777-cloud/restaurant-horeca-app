import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../kiosk.css';

/**
 * KioskInactivityOverlay - Overlay StandBy
 * Nu ascunde planul meselor, doar blochează interacțiunea
 */
export const KioskInactivityOverlay = ({ showOverlay, onUnlockRequest }) => {
  if (!showOverlay) return null;

  return (
    <div className="kiosk-inactivity-overlay" onClick={onUnlockRequest}>
      <div className="kiosk-standby-content">
        <div className="kiosk-standby-logo">
          <i className="fas fa-lock fa-4x mb-4"></i>
        </div>
        <h2 className="kiosk-standby-title">Sistem Blocat</h2>
        <p className="kiosk-standby-message">Sistemul a fost blocat din cauza inactivității</p>
        <Button
          variant="primary"
          size="lg"
          className="kiosk-standby-button"
          onClick={(e) => {
            e.stopPropagation();
            onUnlockRequest();
          }}
        >
          <i className="fas fa-unlock me-2"></i>
          Atinge pentru a continua
        </Button>
        <p className="kiosk-standby-hint mt-3">
          <small>Autentifică-te pentru a debloca sistemul</small>
        </p>
      </div>
    </div>
  );
};

