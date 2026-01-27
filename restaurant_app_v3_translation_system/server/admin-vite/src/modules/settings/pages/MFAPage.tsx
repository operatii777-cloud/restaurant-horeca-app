// import { useTranslation } from '@/i18n/I18nContext';
/**
 * MFA (Multi-Factor Authentication) Settings Page
 * Permite utilizatorilor să activeze/dezactiveze MFA
 */

import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import './MFAPage.css';

interface MFAStatus {
  mfaEnabled: boolean;
  mfaConfigured: boolean;
}

export const MFAPage: React.FC = () => {
//   const { t } = useTranslation();
  const [status, setStatus] = useState<MFAStatus>({ mfaEnabled: false, mfaConfigured: false });
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<'idle' | 'setup' | 'verify'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: mfaStatus, refetch: refetchStatus } = useApiQuery<MFAStatus>('/api/auth/mfa/status');
  const setupMutation = useApiMutation();
  const verifyMutation = useApiMutation();
  const disableMutation = useApiMutation();

  useEffect(() => {
    if (mfaStatus) {
      setStatus(mfaStatus);
      setLoading(false);
    }
  }, [mfaStatus]);

  const handleSetup = async () => {
    try {
      setAlert(null);
      const response = await httpClient.post('/api/auth/mfa/setup');
      
      if (response.data.success) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setSetupStep('verify');
        setAlert({ type: 'success', message: 'QR code generat cu succes! Scanează-l cu Google Authenticator.' });
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.error || 'Eroare la generarea QR code' });
    }
  };

  const handleVerify = async () => {
    if (!mfaToken || mfaToken.length !== 6) {
      setAlert({ type: 'error', message: 'Token MFA invalid (trebuie 6 cifre)' });
      return;
    }

    try {
      setAlert(null);
      const response = await verifyMutation.mutate({
        url: '/api/auth/mfa/verify',
        method: 'POST',
        data: { token: mfaToken }
      });

      if (response.success) {
        setAlert({ type: 'success', message: 'MFA activat cu succes!' });
        setSetupStep('idle');
        setMfaToken('');
        setQrCode(null);
        setSecret(null);
        await refetchStatus();
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.error || 'Token MFA invalid' });
    }
  };

  const handleDisable = async () => {
    const password = prompt('Introdu parola pentru confirmare:');
    if (!password) return;

    try {
      setAlert(null);
      const response = await disableMutation.mutate({
        url: '/api/auth/mfa/disable',
        method: 'POST',
        data: { password }
      });

      if (response.success) {
        setAlert({ type: 'success', message: 'MFA dezactivat cu succes!' });
        await refetchStatus();
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.error || 'Parolă incorectă sau eroare' });
    }
  };

  if (loading) {
    return (
      <div className="mfa-page">
        <PageHeader title="Autentificare Multi-Factor (MFA)" subtitle="securitate suplimentara pentru contul tau" />
        <div className="mfa-page__loading">Încarcă...</div>
      </div>
    );
  }

  return (
    <div className="mfa-page">
      <PageHeader 
        title="Autentificare Multi-Factor (MFA)" 
        subtitle="securitate suplimentara pentru contul tau"
      />

      {alert && (
        <InlineAlert 
          type={alert.type} 
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mfa-page__content">
        {/* Status Card */}
        <div className="mfa-page__status-card">
          <h3>Status MFA</h3>
          <div className="mfa-page__status">
            <span className={`mfa-page__status-badge ${status.mfaEnabled ? 'mfa-page__status-badge--enabled' : 'mfa-page__status-badge--disabled'}`}>
              {status.mfaEnabled ? '[Check] Activ' : '[Inactive] Inactiv'}
            </span>
            {status.mfaConfigured && !status.mfaEnabled && (
              <p className="mfa-page__status-note">MFA este configurat dar nu este activat. Completează configurarea.</p>
            )}
          </div>
        </div>

        {/* Setup Flow */}
        {setupStep === 'idle' && !status.mfaEnabled && (
          <div className="mfa-page__setup">
            <h3>Activează MFA</h3>
            <p>
              Autentificarea Multi-Factor (MFA) adaugă un nivel suplimentar de securitate. 
              După activare, vei avea nevoie de parolă + cod din Google Authenticator la fiecare login.
            </p>
            <button 
              className="mfa-page__btn mfa-page__btn--primary"
              onClick={handleSetup}
              disabled={setupMutation.loading}
            >
              {setupMutation.loading ? '[Loading] Se generează...' : '[Secure] Activează MFA'}
            </button>
          </div>
        )}

        {/* QR Code & Verification */}
        {setupStep === 'verify' && (
          <div className="mfa-page__verify">
            <h3>Verifică și Activează MFA</h3>
            <ol className="mfa-page__steps">
              <li>Deschide Google Authenticator pe telefon</li>
              <li>Scanează codul QR de mai jos</li>
              <li>Introdu codul de 6 cifre din aplicație</li>
            </ol>

            {qrCode && (
              <div className="mfa-page__qr-container">
                <img src={qrCode} alt="mfa qr code" className="mfa-page__qr-code" />
                {secret && (
                  <div className="mfa-page__secret-backup">
                    <p><strong>Backup Secret:</strong></p>
                    <code className="mfa-page__secret-code">{secret}</code>
                    <p className="mfa-page__secret-note">
                      [Warning] Salvează acest secret într-un loc sigur pentru recovery!
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mfa-page__token-input">
              <label htmlFor="mfa-token">Cod MFA (6 cifre):</label>
              <input
                id="mfa-token"
                type="text"
                maxLength={6}
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="mfa-page__token-field"
              />
            </div>

            <div className="mfa-page__actions">
              <button
                className="mfa-page__btn mfa-page__btn--primary"
                onClick={handleVerify}
                disabled={mfaToken.length !== 6 || verifyMutation.loading}
              >
                {verifyMutation.loading ? '[Loading] Se verifică...' : '[Check] Verifică și Activează'}
              </button>
              <button
                className="mfa-page__btn mfa-page__btn--secondary"
                onClick={() => {
                  setSetupStep('idle');
                  setQrCode(null);
                  setSecret(null);
                  setMfaToken('');
                }}
              >Anulează</button>
            </div>
          </div>
        )}

        {/* Disable MFA */}
        {status.mfaEnabled && (
          <div className="mfa-page__disable">
            <h3>Dezactivează MFA</h3>
            <p>
              Dezactivarea MFA va elimina securitatea suplimentară. 
              Vei avea nevoie doar de parolă la login.
            </p>
            <button
              className="mfa-page__btn mfa-page__btn--danger"
              onClick={handleDisable}
              disabled={disableMutation.loading}
            >
              {disableMutation.loading ? '[Loading] Se dezactivează...' : '[Inactive] Dezactivează MFA'}
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="mfa-page__info">
          <h3>[Info] Despre MFA</h3>
          <ul>
            <li>[Check] Protecție suplimentară pentru contul tău</li>
            <li>[Check] Cod unic la fiecare login (se schimbă la 30 secunde)</li>
            <li>[Check] Compatibil cu Google Authenticator, Microsoft Authenticator, etc.</li>
            <li>[Check] Backup secret disponibil pentru recovery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};




