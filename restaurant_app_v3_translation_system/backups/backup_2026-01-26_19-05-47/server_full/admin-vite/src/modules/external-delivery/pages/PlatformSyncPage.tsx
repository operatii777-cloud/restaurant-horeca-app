// ﻿import { useTranslation } from '@/i18n/I18nContext';
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PLATFORM SYNC MANAGEMENT PAGE
 * 
 * Gestionare sincronizare cu platformele externe (Glovo, Wolt, etc.)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { externalDeliveryApi, type ExternalDeliveryConnector, type SyncResult } from '../api/externalDeliveryApi';
import { PageHeader } from '@/shared/components/PageHeader';
import { toast } from 'react-toastify';
import './PlatformSyncPage.css';

const PLATFORM_LABELS: Record<string, string> = {
  'GLOVO': 'Glovo',
  'WOLT': 'Wolt',
  'BOLT_FOOD': 'Bolt Food',
  'TAZZ': 'Tazz',
  'UBER_EATS': 'Uber Eats',
};

const PLATFORM_COLORS: Record<string, string> = {
  'GLOVO': '#10b981',
  'WOLT': '#f59e0b',
  'BOLT_FOOD': '#00d4ff',
  'TAZZ': '#ef4444',
  'UBER_EATS': '#000000',
};

export const PlatformSyncPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [connectors, setConnectors] = useState<ExternalDeliveryConnector[]>([]);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingConnector, setEditingConnector] = useState<ExternalDeliveryConnector | null>(null);
  const [formData, setFormData] = useState<Partial<ExternalDeliveryConnector>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      setError(null);
      const response = await externalDeliveryApi.getConnectors();
      if (response.data.success) {
        setConnectors(response.data.connectors || []);
      }
    } catch (err: any) {
      console.error('Error loading connectors:', err);
      setError(err.message || 'Eroare la încărcarea conectărilor');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMenu = async (platform: string) => {
      setSyncing(prev => ({ ...prev, [platform]: true }));
    try {
      const response = await externalDeliveryApi.syncMenu(platform);
      if (response.data.success) {
        toast.success(`Meniul a fost sincronizat cu ${PLATFORM_labels[platform] || platform}`);
        loadConnectors(); // Refresh to update last_sync_at
      } else {
        toast.error(`Eroare la sincronizare: ${response.data.result?.message || 'Eroare necunoscută'}`);
      }
    } catch (err: any) {
      console.error('Error syncing menu:', err);
      toast.error(`Eroare la sincronizare: ${err.message || 'Eroare necunoscută'}`);
    } finally {
        setSyncing(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleSyncAll = async () => {
    setSyncing(prev => ({ ...prev, all: true }));
    try {
      const response = await externalDeliveryApi.syncAllPlatforms();
      if (response.data.success) {
        const results = response.data.results;
        const successCount = Object.values(results).filter((r: any) => r.success).length;
        const totalCount = Object.keys(results).length;
        toast.success(`Sincronizare completă: ${successCount}/${totalCount} platforme`);
        loadConnectors();
      }
    } catch (err: any) {
      console.error('Error syncing all platforms:', err);
      toast.error(`Eroare la sincronizare: ${err.message || 'Eroare necunoscută'}`);
    } finally {
      setSyncing(prev => ({ ...prev, all: false }));
    }
  };

  const handleEdit = (connector: ExternalDeliveryConnector) => {
    setEditingConnector(connector);
    setFormData({
      provider: connector.provider,
      api_key: connector.api_key || '',
      api_secret: connector.api_secret || '',
      webhook_secret: connector.webhook_secret || '',
      is_enabled: connector.is_enabled,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingConnector) return;

    try {
      if (editingConnector.id) {
        // Update existing
        await externalDeliveryApi.updateConnector(editingConnector.id, formData);
        toast.success('Conectare actualizată cu succes');
      } else {
        // Create new
        await externalDeliveryApi.createConnector(formData);
        toast.success('Conectare creată cu succes');
      }
      setShowModal(false);
      setEditingConnector(null);
      loadConnectors();
    } catch (err: any) {
      console.error('Error saving connector:', err);
      toast.error(`Eroare: ${err.message || 'Eroare necunoscută'}`);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">N/A</Badge>;
    switch (status) {
      case 'success':
        return <Badge bg="success">Succes</Badge>;
      case 'failed':
        return <Badge bg="danger">"Eșuat"</Badge>;
      case "Pending:":
        return <Badge bg="warning" text="dark">"in asteptare"</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">"se incarca"</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="platform-sync-page">
      <PageHeader
        title="sincronizare platforme externe"
        subtitle="gestionare conectari si sincronizare meniu cu glov"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Sync All Button */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">"sincronizare rapida"</h5>
              <p className="text-muted mb-0">"sincronizeaza meniul cu toate platformele active"</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSyncAll}
              disabled={syncing.all}
            >
              {syncing.all ? (
                <>
                  <Spinner size="sm" className="me-2" />"se sincronizeaza"</>
              ) : (
                'Sincronizează Toate Platformele'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Connectors Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">"conectari platforme"</h5>
        </Card.Header>
        <Card.Body>
          {connectors.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p className="mb-0">"nu exista conectari configurate"</p>
              <small>"adauga o conectare noua pentru a incepe sincroniza"</small>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Platformă</th>
                  <th>Status</th>
                  <th>Ultima Sincronizare</th>
                  <th>Status Sincronizare</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map(connector => (
                  <tr key={connector.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="platform-color-indicator me-2"
                          style={{ backgroundColor: PLATFORM_COLORS[connector.provider] || '#6b7280' }}
                        />
                        <strong>{PLATFORM_LABELS[connector.provider] || connector.provider}</strong>
                      </div>
                    </td>
                    <td>
                      {connector.is_enabled ? (
                        <Badge bg="success">Activ</Badge>
                      ) : (
                        <Badge bg="secondary">Inactiv</Badge>
                      )}
                    </td>
                    <td>
                      {connector.last_sync_at ? (
                        new Date(connector.last_sync_at).toLocaleString('ro-RO')
                      ) : (
                        <span className="text-muted">"Niciodată"</span>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(connector.last_sync_status)}
                      {connector.last_sync_error && (
                        <small className="d-block text-danger mt-1">
                          {connector.last_sync_error}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleSyncMenu(connector.provider)}
                          disabled={syncing[connector.provider] || !connector.is_enabled}
                        >
                          {syncing[connector.provider] ? (
                            <>
                              <Spinner size="sm" className="me-1" />
                              Sync...
                            </>
                          ) : (
                            'Sincronizează Meniu'
                          )}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEdit(connector)}
                        >"Editează"</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingConnector?.id ? 'Editează Conectare' : 'Conectare Nouă'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Platformă</Form.Label>
              <Form.Select
                value={formData.provider || ''}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                disabled={!!editingConnector?.id}
              >
                <option value="">"selecteaza platforma"</option>
                {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="text"
                value={formData.api_key || ''}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Introdu API Key"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API Secret</Form.Label>
              <Form.Control
                type="password"
                value={formData.api_secret || ''}
                onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                placeholder="Introdu API Secret"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Webhook Secret</Form.Label>
              <Form.Control
                type="password"
                value={formData.webhook_secret || ''}
                onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                placeholder="Introdu Webhook Secret (opțional)"
              />
            </Form.Group>

            <Form.Check
              type="switch"
              label="Activ"
              checked={formData.is_enabled || false}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>"Anulează"</Button>
          <Button variant="primary" onClick={handleSave}>
            Salvează
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};




