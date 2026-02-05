// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificate Manager Page
 * 
 * Upload, validate, and manage ANAF certificates
 */

import React from 'react';
import { useCertificateStatus } from '../hooks/useCertificate';
import { CertificateUpload } from '../components/CertificateUpload';
import { CertificatesTable } from '../components/CertificatesTable';
import './CertificateManagerPage.css';

export function CertificateManagerPage() {
  //   const { t } = useTranslation();
  const { data: certData, isLoading, refetch } = useCertificateStatus();
  const certificate = certData?.data;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = () => {
    if (!certificate?.hasCertificate) {
      return <span className="badge badge-danger">Lipsă</span>;
    }
    const status = certificate.status;
    if (status === 'valid') {
      return <span className="badge badge-success">Valid</span>;
    } else if (status === 'expiring_soon') {
      return <span className="badge badge-warning">Expiră curând</span>;
    } else if (status === 'expired') {
      return <span className="badge badge-danger">Expirat</span>;
    } else {
      return <span className="badge badge-secondary">Invalid</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="certificate-manager-page">
        <div className="loading-spinner">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="certificate-manager-page">
      <header className="page-header">
        <h1 className="page-title">Gestionare Certificat ANAF</h1>
        <p className="page-subtitle">Încarcă și gestionează certificatul digital pentru ANAF</p>
      </header>

      {/* Certificates Table */}
      <CertificatesTable />

      {/* Upload Certificate Form */}
      <div className="certificate-upload-card">
        <h2 className="card-title">Încarcă certificat nou</h2>
        <CertificateUpload
          onSuccess={() => {
            refetch();
          }}
          onError={(error) => {
            console.error('Upload error:', error);
          }}
        />
      </div>

      {/* Help Section */}
      <div className="certificate-help-card">
        <h3 className="card-title">Informații</h3>
        <ul className="help-list">
          <li>Certificatul trebuie să fie în format .pfx sau .p12</li>
          <li>Parola certificatului este necesară pentru semnare</li>
          <li>Certificatul este stocat criptat în baza de date</li>
          <li>Verifică data expirării și reînnoiește certificatul anual</li>
        </ul>
      </div>
    </div>
  );
}




