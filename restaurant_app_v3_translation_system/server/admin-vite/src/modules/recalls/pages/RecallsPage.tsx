// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';

interface Recall {
  id: number;
  recall_number: string;
  recall_date: string;
  recall_type: string;
  severity: string;
  health_risk: string;
  reason: string;
  affected_products_count: number;
  affected_orders_count: number;
  resolved: number;
}

export const RecallsPage = () => {
//   const { t } = useTranslation();
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecalls();
  }, []);

  const loadRecalls = async () => {
    try {
      const response = await httpClient.get('/api/recalls');
      setRecalls(response.data?.data || []);
    } catch (error) {
      console.error('Error loading recalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      'low': 'info',
      'medium': 'warning',
      'high': 'danger',
      'critical': 'danger'
    };
    return <Badge bg={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  return (
    <div className="recalls-page page">
      <PageHeader 
        title="Recall Management"
        subtitle="Gestionare retrageri produse (siguranță alimentară)"
      />

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>Lista Recalls</h5>
            <Button variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Creare Recall NOU
            </Button>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>"Număr"</th>
                <th>Dată</th>
                <th>Tip</th>
                <th>Severitate</th>
                <th>Risc</th>
                <th>Produse</th>
                <th>Comenzi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recalls.map(recall => (
                <tr key={recall.id}>
                  <td><strong>{recall.recall_number}</strong></td>
                  <td>{new Date(recall.recall_date).toLocaleDateString('ro-RO')}</td>
                  <td><Badge bg="secondary">{recall.recall_type}</Badge></td>
                  <td>{getSeverityBadge(recall.severity)}</td>
                  <td>{recall.health_risk}</td>
                  <td>{recall.affected_products_count}</td>
                  <td>{recall.affected_orders_count}</td>
                  <td>{recall.resolved ? <Badge bg="success">Rezolvat</Badge> : <Badge bg="warning">Activ</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};




