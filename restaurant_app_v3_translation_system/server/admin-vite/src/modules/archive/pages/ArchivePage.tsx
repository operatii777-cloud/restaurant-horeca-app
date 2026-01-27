// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import { OrdersArchivePanel } from '@/modules/orders/components/OrdersArchivePanel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ArchivePage.css';

interface ArchiveStats {
  total_archived_orders: number;
  total_archived_revenue: number;
  oldest_archived_date: string | null;
  newest_archived_date: string | null;
  archived_orders_by_month: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
}

interface AutomationRule {
  id: number;
  name: string;
  type: 'archive' | 'backup' | 'cleanup';
  schedule: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
}

export const ArchivePage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('archive');

  useEffect(() => {
    loadArchiveStats();
    loadAutomationRules();
  }, []);

  const loadArchiveStats = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/archive-stats');
      // Endpointul returnează: { activeOrders, archivedOrders, oldestArchive, totalSize }
      if (response.data) {
        const data = response.data;
        setStats({
          total_archived_orders: data.archivedOrders || 0,
          total_archived_revenue: 0, // Nu este disponibil în endpoint
          oldest_archived_date: data.oldestArchive || null,
          newest_archived_date: null, // Nu este disponibil în endpoint
          archived_orders_by_month: [], // Nu este disponibil în endpoint
        });
      }
    } catch (error: any) {
      console.error('Error loading archive stats:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea statisticilor arhivă. Asigură-te că serverul rulează.' });
    } finally {
      setLoading(false);
    }
  };

  const loadAutomationRules = async () => {
    try {
      // Placeholder - ar trebui să existe un endpoint pentru automatizări
      // Pentru moment, folosim date mock
      const mockRules: AutomationRule[] = [
        {
          id: 1,
          name: 'Arhivare Automată Comenzi',
          type: 'archive',
          schedule: 'Lunar (la sfârșitul lunii)',
          enabled: true,
          last_run: '2025-10-31',
          next_run: '2025-11-30',
        },
        {
          id: 2,
          name: 'Backup Automat Baza de Date',
          type: 'backup',
          schedule: 'Zilnic (02:00)',
          enabled: true,
          last_run: '2025-11-21',
          next_run: '2025-11-22',
        },
        {
          id: 3,
          name: 'Curățare Log-uri Vechi',
          type: 'cleanup',
          schedule: 'Săptămânal (Duminică 03:00)',
          enabled: false,
          last_run: '2025-11-17',
          next_run: '2025-11-24',
        },
      ];
      setAutomationRules(mockRules);
    } catch (error: any) {
      console.error('Error loading automation rules:', error);
    }
  };

  const handleArchiveOrders = async () => {
    if (!confirm('Sigur doriți să arhivați comenzile vechi? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.post('/api/admin/archive-orders');
      if (response.data?.success) {
        setFeedback({ type: 'success', message: 'Comenzile au fost arhivate cu succes!' });
        loadArchiveStats();
      } else {
        setFeedback({ type: 'error', message: response.data?.error || 'Eroare la arhivare' });
      }
    } catch (error: any) {
      console.error('Error archiving orders:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la arhivarea comenzilor' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomationRule = async (ruleId: number) => {
    setAutomationRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );
    // Aici ar trebui să fie un API call pentru a actualiza regula
    setFeedback({ type: 'info', message: 'Regula de automatizare a fost actualizată' });
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  return (
    <div className="archive-page">
      <PageHeader
        title='📦 arhiva & automatizari'
        description="Gestionare arhivă comenzi și automatizări sistem"
      />

      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'}
          dismissible
          onClose={() => setFeedback(null)}
          className="mt-3"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Total Comenzi Arhivate</h6>
                <h4>{stats.total_archived_orders || 0}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Venituri Arhivate</h6>
                <h4>{formatCurrency(stats.total_archived_revenue || 0)}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>"cea mai veche comanda"</h6>
                <h6 className="text-muted">
                  {stats.oldest_archived_date ? formatDate(stats.oldest_archived_date) : '"”'}
                </h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>"cea mai recenta comanda"</h6>
                <h6 className="text-muted">
                  {stats.newest_archived_date ? formatDate(stats.newest_archived_date) : '"”'}
                </h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
        <Tab eventKey="archive" title='📦 arhiva comenzi'>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Arhivă Comenzi</h5>
              <Button variant="warning" onClick={handleArchiveOrders} disabled={loading}>
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-archive'} me-2`}></i>
                {loading ? 'Se arhivează...' : 'Arhivează Comenzi Vechi'}
              </Button>
            </Card.Header>
            <Card.Body>
              <OrdersArchivePanel
                onFeedback={(message, type) => setFeedback({ type, message })}
              />
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="automations" title='âš™ï¸ automatizari'>
          <Card>
            <Card.Header>
              <h5 className="mb-0">"reguli automatizare"</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>"automatizarile va permit sa programati actiuni per"</Alert>

              {automationRules.length === 0 ? (
                <Alert variant="info">"nu exista reguli de automatizare configurate"</Alert>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Tip</th>
                      <th>Programare</th>
                      <th>"ultima executie"</th>
                      <th>"urmatoarea executie"</th>
                      <th>Status</th>
                      <th>"Acțiuni"</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationRules.map((rule) => (
                      <tr key={rule.id}>
                        <td><strong>{rule.name}</strong></td>
                        <td>
                          <Badge bg={rule.type === 'archive' ? 'primary' : rule.type === 'backup' ? 'success' : 'info'}>
                            {rule.type === 'archive' ? 'Arhivare' : rule.type === 'backup' ? 'Backup' : 'Curățare'}
                          </Badge>
                        </td>
                        <td>{rule.schedule}</td>
                        <td>{rule.last_run ? formatDate(rule.last_run) : 'Niciodată'}</td>
                        <td>{rule.next_run ? formatDate(rule.next_run) : '"”'}</td>
                        <td>
                          <Badge bg={rule.enabled ? 'success' : 'secondary'}>
                            {rule.enabled ? 'Activ' : 'Inactiv'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant={rule.enabled ? 'warning' : 'success'}
                            size="sm"
                            onClick={() => toggleAutomationRule(rule.id)}
                          >
                            <i className={`fas fa-${rule.enabled ? 'pause' : 'play'} me-1`}></i>
                            {rule.enabled ? 'Dezactivează' : 'Activează'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="statistics" title="📊 Statistici">
          <Card>
            <Card.Header>
              <h5 className="mb-0">"statistici arhiva pe luna"</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : stats?.archived_orders_by_month && stats.archived_orders_by_month.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>"Lună"</th>
                      <th>"numar comenzi"</th>
                      <th>Venituri</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.archived_orders_by_month.map((month, index) => (
                      <tr key={index}>
                        <td><strong>{month.month}</strong></td>
                        <td>{month.count}</td>
                        <td><strong>{formatCurrency(month.revenue)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">"nu exista date pentru statistici"</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};





