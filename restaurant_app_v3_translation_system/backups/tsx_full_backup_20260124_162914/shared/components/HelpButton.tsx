/**
 * HelpButton - Component reutilizabil pentru butonul de help
 * 
 * Folosit în toate paginile admin-vite pentru a afișa informații de ajutor
 */

import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './HelpButton.css';

interface HelpButtonProps {
  title?: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  title = 'Ajutor',
  content,
  size = 'sm',
  variant = 'outline-info',
  className = ''
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size === 'md' ? 'sm' : size}
        onClick={() => setShowHelpModal(true)}
        className={`help-button ${className}`}
      >
        <i className="fas fa-question-circle me-2"></i>
        Ajutor
      </Button>

      <Modal
        show={showHelpModal}
        onHide={() => setShowHelpModal(false)}
        size="lg"
        className="help-modal-global"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-question-circle me-2"></i>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="help-content-global">
            {content}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHelpModal(false)}>Închide</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

