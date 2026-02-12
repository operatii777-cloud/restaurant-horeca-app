"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificate Manager Page
 *
 * Upload, validate, and manage ANAF certificates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateManagerPage = CertificateManagerPage;
var react_1 = require("react");
var useCertificate_1 = require("../hooks/useCertificate");
var CertificateUpload_1 = require("../components/CertificateUpload");
var CertificatesTable_1 = require("../components/CertificatesTable");
require("./CertificateManagerPage.css");
function CertificateManagerPage() {
    //   const { t } = useTranslation();
    var _a = (0, useCertificate_1.useCertificateStatus)(), certData = _a.data, isLoading = _a.isLoading, refetch = _a.refetch;
    var certificate = certData === null || certData === void 0 ? void 0 : certData.data;
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };
    var getStatusBadge = function () {
        if (!(certificate === null || certificate === void 0 ? void 0 : certificate.hasCertificate)) {
            return <span className="badge badge-danger">Lipsă</span>;
        }
        var status = certificate.status;
        if (status === 'valid') {
            return <span className="badge badge-success">Valid</span>;
        }
        else if (status === 'expiring_soon') {
            return <span className="badge badge-warning">Expiră curând</span>;
        }
        else if (status === 'expired') {
            return <span className="badge badge-danger">Expirat</span>;
        }
        else {
            return <span className="badge badge-secondary">Invalid</span>;
        }
    };
    if (isLoading) {
        return (<div className="certificate-manager-page">
        <div className="loading-spinner">Se încarcă...</div>
      </div>);
    }
    return (<div className="certificate-manager-page">
      <header className="page-header">
        <h1 className="page-title">Gestionare Certificat ANAF</h1>
        <p className="page-subtitle">Încarcă și gestionează certificatul digital pentru ANAF</p>
      </header>

      {/* Certificates Table */}
      <CertificatesTable_1.CertificatesTable />

      {/* Upload Certificate Form */}
      <div className="certificate-upload-card">
        <h2 className="card-title">Încarcă certificat nou</h2>
        <CertificateUpload_1.CertificateUpload onSuccess={function () {
            refetch();
        }} onError={function (error) {
            console.error('Upload error:', error);
        }}/>
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
    </div>);
}
