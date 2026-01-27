/**
 * PHASE S5.2 - Tipizate Actions Bar
 * Action buttons bar for tipizate documents (Save, Sign, Lock, PDF)
 */

import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { TipizatType, TipizatStatus } from '../api/types';
import { TipizateStatusBadge } from './TipizateStatusBadge';

interface TipizateActionsBarProps {
  docType: TipizatType;
  docId: number | null;
  status: TipizatStatus;
  onSave?: () => void;
  onSign?: () => void;
  onLock?: () => void;
  onPdf?: () => void;
  saving?: boolean;
  signing?: boolean;
  locking?: boolean;
  disabled?: boolean;
}

export const TipizateActionsBar: React.FC<TipizateActionsBarProps> = ({
  docType,
  docId,
  status,
  onSave,
  onSign,
  onLock,
  onPdf,
  saving = false,
  signing = false,
  locking = false,
  disabled = false,
}) => {
  const canEdit = status === 'DRAFT';
  const canSign = status === 'DRAFT' || status === 'VALIDATED';
  const canLock = status === 'SIGNED';

  return (
    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
      <div>
        <TipizateStatusBadge status={status} size="md" />
      </div>

      <ButtonGroup>
        {canEdit && onSave && (
          <Button
            variant="primary"
            onClick={onSave}
            disabled={disabled || saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Salvează...
              </>
            ) : (
              <>
                <i className="bi bi-save me-1"></i>
                Salvează
              </>
            )}
          </Button>
        )}

        {canSign && onSign && (
          <Button
            variant="success"
            onClick={onSign}
            disabled={disabled || signing || !docId}
          >
            {signing ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Semnează...
              </>
            ) : (
              <>
                <i className="bi bi-pen me-1"></i>
                Semnează
              </>
            )}
          </Button>
        )}

        {canLock && onLock && (
          <Button
            variant="warning"
            onClick={onLock}
            disabled={disabled || locking || !docId}
          >
            {locking ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Blochează...
              </>
            ) : (
              <>
                <i className="bi bi-lock me-1"></i>
                Blochează
              </>
            )}
          </Button>
        )}

        {docId && onPdf && (
          <Button
            variant="outline-primary"
            onClick={onPdf}
            disabled={disabled}
          >
            <i className="bi bi-file-pdf me-1"></i>
            PDF
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
};

