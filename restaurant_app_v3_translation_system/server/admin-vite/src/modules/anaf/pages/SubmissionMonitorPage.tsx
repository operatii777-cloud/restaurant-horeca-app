// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.3 - Submission Monitor Page
 * 
 * Monitor ANAF submissions with retry functionality
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnafSubmissions } from '../api/anaf.api';
import './SubmissionMonitorPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function resubmitDocument(documentId: number, documentType: string) {
//   const { t } = useTranslation();
  const response = await fetch(`${API_BASE_URL}/api/anaf/resubmit/${documentId}?documentType=${documentType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to resubmit: ${response.statusText}`);
  }

  return response.json();
}

export function SubmissionMonitorPage() {
//   const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    documentType: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['anaf', 'submissions', filters],
    queryFn: () => fetchAnafSubmissions({
      documentType: filters.documentType || undefined,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      limit: 100,
      offset: 0,
    }),
    refetchInterval: 30000,
  });

  const resubmitMutation = useMutation({
    mutationFn: ({ documentId, documentType }: { documentId: number; documentType: string }) =>
      resubmitDocument(documentId, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anaf', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
    },
  });

  const submissions = data?.data || [];

  const handleResubmit = (documentId: number, documentType: string) => {
    if (confirm('Ești sigur că vrei să retrimiți acest document?')) {
      resubmitMutation.mutate({ documentId, documentType });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      PENDING: { class: 'badge-warning', label: 'Pending' },
      PROCESSING: { class: 'badge-info', label: 'Processing' },
      SUBMITTED: { class: 'badge-success', label: 'Submitted' },
      CONFIRMED: { class: 'badge-success', label: 'Confirmed' },
      FAILED: { class: 'badge-danger', label: 'Failed' },
      DEAD_LETTER: { class: 'badge-danger', label: 'Dead Letter' },
      ACK: { class: 'badge-success', label: 'Acknowledged' },
      REJECTED: { class: 'badge-danger', label: 'Rejected' },
    };

    const statusInfo = statusMap[status] || { class: 'badge-secondary', label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="submission-monitor-page">
        <div className="loading-spinner">Se încarcă...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submission-monitor-page">
        <div className="alert alert-danger">
          Eroare: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </div>
      </div>
    );
  }

  return (
    <div className="submission-monitor-page">
      <header className="page-header">
        <h1 className="page-title">Submission Monitor</h1>
        <p className="page-subtitle">"monitorizare si gestionare trimiteri anaf"</p>
        <button onClick={() => refetch()} className="btn btn-secondary btn-sm">
          🔄 Actualizează
        </button>
      </header>

      {/* Filters */}
      <div className="filters-card">
        <h3 className="card-title">Filtre</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Tip Document</label>
            <select
              value={filters.documentType}
              onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
              className="form-control"
            >
              <option value="">"Toate"</option>
              <option value="FACTURA">"Factură"</option>
              <option value="CHITANTA">"Chitanță"</option>
              <option value="BON_FISCAL">Bon Fiscal</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="form-control"
            >
              <option value="">"Toate"</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="FAILED">Failed</option>
              <option value="DEAD_LETTER">"dead letter"</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">De la</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Până la</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="submissions-card">
        <h3 className="card-title">Submissions ({submissions.length})</h3>
        <div className="table-responsive">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>"Document"</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Created</th>
                <th>"last error"</th>
                <th>"Acțiuni"</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">"nu exista submissions"</td>
                </tr>
              ) : (
                submissions.map((sub: any) => (
                  <tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>
                      {sub.document_type} #{sub.document_id}
                    </td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td>{sub.attempts || 0}</td>
                    <td>{formatDate(sub.created_at)}</td>
                    <td className="error-cell">
                      {sub.last_error ? (
                        <span className="text-danger" title={sub.last_error}>
                          {sub.last_error.length > 50
                            ? `${sub.last_error.substring(0, 50)}...`
                            : sub.last_error}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {(sub.status === 'FAILED' || sub.status === 'DEAD_LETTER') && (
                        <button
                          onClick={() => handleResubmit(sub.document_id, sub.document_type)}
                          disabled={resubmitMutation.isPending}
                          className="btn btn-primary btn-sm"
                        >
                          Retrimite
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



