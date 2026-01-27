import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';

interface ExpiryAlert {
  id: number;
  ingredient_name: string;
  batch_number: string;
  expiry_date: string;
  days_until_expiry: number;
  alert_level: string;
  remaining_quantity: number;
  unit: string;
  value_at_risk: number;
  location_name: string;
  action_recommended: string;
}

export const ExpiryAlertsPage = () => {
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await httpClient.get('/api/expiry-alerts');
      setAlerts(response.data?.data || []);
    } catch (error) {
      console.error('Error loading expiry alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertBadge = (level: string) => {
    const variants: Record<string, string> = {
      'green': 'success',
      'yellow': 'warning',
      'orange': 'warning',
      'red': 'danger',
      'expired': 'dark'
    };
    return <Badge bg={variants[level]}>{level.toUpperCase()}</Badge>;
  };

  const markResolved = async (alertId: number, resolutionType: string) => {
    try {
      await httpClient.post(`/api/expiry-alerts/${alertId}/resolve`, {
        resolution_type: resolutionType
      });
      loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="expiry-alerts-page page">
      <PageHeader 
        title="Alerte Expirare (FEFO)"
        subtitle="Monitorizare expirări și FEFO (First Expired First Out)"
      />

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>Alerte Active</h5>
            <Button variant="primary" onClick={loadAlerts}>
              <i className="fas fa-sync me-2"></i>
              Refresh
            </Button>
          </div>

          {alerts.length === 0 ? (
            <Alert variant="success">
              ✓ Nu există alerte de expirare!
            </Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Lot</th>
                  <th>Expirare</th>
                  <th>Zile rămase</th>
                  <th>Alert</th>
                  <th>Cantitate</th>
                  <th>Valoare</th>
                  <th>Locație</th>
                  <th>Acțiune</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id} className={alert.alert_level === 'red' ? 'table-danger' : ''}>
                    <td><strong>{alert.ingredient_name}</strong></td>
                    <td>{alert.batch_number}</td>
                    <td>{new Date(alert.expiry_date).toLocaleDateString('ro-RO')}</td>
                    <td>
                      <Badge bg={alert.days_until_expiry < 0 ? 'dark' : alert.days_until_expiry <= 1 ? 'danger' : 'warning'}>
                        {alert.days_until_expiry} zile
                      </Badge>
                    </td>
                    <td>{getAlertBadge(alert.alert_level)}</td>
                    <td>{alert.remaining_quantity} {alert.unit}</td>
                    <td>{alert.value_at_risk?.toFixed(2)} RON</td>
                    <td>{alert.location_name}</td>
                    <td className="small">{alert.action_recommended}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button size="sm" variant="success" onClick={() => markResolved(alert.id, 'used')}>
                          ✓ Folosit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => markResolved(alert.id, 'discarded')}>
                          🗑️ Aruncat
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

