// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificate Upload Component
 * 
 * Handles certificate file upload with password
 */

import React, { useState } from 'react';
import { useUploadCertificate } from '../hooks/useCertificate';
import { getAnafErrorMessage } from '../api/anaf.api';
import './CertificateUpload.css';

interface CertificateUploadProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CertificateUpload({ onSuccess, onError }: CertificateUploadProps) {
//   const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadMutation = useUploadCertificate();

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.pfx') && !selectedFile.name.endsWith('.p12')) {
        setUploadError('Doar fișiere .pfx sau .p12 sunt permise');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('Fișierul este prea mare (max 5MB)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  /**
   * Handle certificate upload
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !password) {
      setUploadError('Selectează un fișier și introdu parola');
      return;
    }

    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({ file, password });
      setFile(null);
      setPassword('');
      // Reset file input
      const fileInput = document.getElementById('certificate-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Eroare la upload certificat';
      const friendlyError = getAnafErrorMessage(errorMessage) || errorMessage;
      setUploadError(friendlyError);
      if (onError) onError(friendlyError);
    }
  };

  return (
    <div className="certificate-upload">
      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label htmlFor="certificate-file" className="form-label">
            Fișier Certificat (.pfx sau .p12)
          </label>
          <input
            id="certificate-file"
            type="file"
            accept=".pfx,.p12"
            onChange={handleFileChange}
            className="form-control"
            disabled={uploadMutation.isPending}
            required
          />
          {file && (
            <small className="form-text text-muted">
              Fișier selectat: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="certificate-password" className="form-label">"parola certificat"</label>
          <input
            id="certificate-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="introdu parola certificatului"
            disabled={uploadMutation.isPending}
            required
          />
        </div>

        {uploadError && (
          <div className="alert alert-danger" role="alert">
            {uploadError}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !password || uploadMutation.isPending}
          className="btn btn-primary"
        >
          {uploadMutation.isPending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>"se incarca"</>
          ) : (
            'Încarcă Certificat'
          )}
        </button>
      </form>
    </div>
  );
}



