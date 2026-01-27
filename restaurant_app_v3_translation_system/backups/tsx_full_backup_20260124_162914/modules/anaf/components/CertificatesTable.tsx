// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificates Table Component
 * 
 * Displays list of uploaded certificates with status badges
 */

import React from 'react';
import { useCertificateStatus, useDeleteCertificate } from '../hooks/useCertificate';
import './CertificatesTable.css';

export function CertificatesTable() {
//   const { t } = useTranslation();
  const { data: certData, isLoading, refetch } = useCertificateStatus();
  const deleteMutation = useDeleteCertificate();

  const certificate = certData?.data;

  /**
   * Handle certificate deletion
   */
  const handleDelete = async () => {
    if (!certificate?.hasCertificate) return;
    
    if (!confirm('Ești sigur că vrei să ștergi certificatul?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
      refetch();
    } catch (err: any) {
      alert(`Eroare la ștergere: ${err.message}`);
    }
  };

  /**
   * Get certificate status badge
   */
  const getStatusBadge = () => {
    if (!certificate?.hasCertificate) {
      return <span className="badge badge-danger">"Lipsă"</span>;
    }

    const status = certificate.status;
    if (status === 'valid') {
      return <span className="badge badge-success">Valid</span>;
    } else if (status === 'expiring_soon') {
      return <span className="badge badge-warning">"expira curand"</span>;
    } else if (status === 'expired') {
      return <span className="badge badge-danger">Expirat</span>;
    } else {
      return <span className="badge badge-secondary">Invalid</span>;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="certificates-table">
        <div className="loading-spinner">"se incarca"</div>
      </div>
    );
  }

  return (
    <div className="certificates-table">
      <div className="table-header">
        <h3 className="table-title">"certificate incarcate"</h3>
        <button onClick={() => refetch()} className="btn btn-secondary btn-sm">
          🔄 Actualizează
        </button>
      </div>

      {certificate?.hasCertificate ? (
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Data Expirării</th>
              <th>"zile pana la expirare"</th>
              <th>"incarcat la"</th>
              <th>"Acțiuni"</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{getStatusBadge()}</td>
              <td>
                {formatDate(certificate.expiryDate)}
                {certificate.daysUntilExpiry !== null && certificate.daysUntilExpiry <= 30 && (
                  <span className="warning-icon">⚠️</span>
                )}
              </td>
              <td>
                {certificate.daysUntilExpiry !== null
                  ? certificate.daysUntilExpiry > 0
                    ? `${certificate.daysUntilExpiry} zile`
                    : 'Expirat'
                  : 'N/A'}
              </td>
              <td>{formatDate(certificate.createdAt)}</td>
              <td>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn btn-danger btn-sm"
                >
                  {deleteMutation.isPending ? 'Se șterge...' : 'Șterge'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="no-certificates">
          <p className="text-muted">"nu exista certificate incarcate"</p>
        </div>
      )}
    </div>
  );
}


