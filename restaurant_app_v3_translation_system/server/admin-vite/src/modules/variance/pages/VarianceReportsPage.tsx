// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Form, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import { safeArr, safeFixed, safeNum } from '@/shared/utils/safe';

interface Variance {
  id: number;
  variance_date: string;
  ingredient_name: string;
  theoretical_usage: number;
  actual_usage: number;
  variance_quantity: number;
  variance_percentage: number;
  variance_cost: number;
  variance_type: string;
  requires_investigation: number;
}

export const VarianceReportsPage = () => {
//   const { t } = useTranslation();
  const [variances, setVariances] = useState<Variance[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadVariances = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get(`/api/variance/daily?date="Date"`);
      setVariances(safeArr(response.data?.data));
    } catch (error) {
      console.error('Error loading variances:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateVariance = async () => {
    setLoading(true);
    try {
      await httpClient.post('/api/variance/calculate', { date });
      await loadVariances();
    } catch (error) {
      console.error('Error calculating variance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="variance-reports-page page">
      <PageHeader 
        title="Variance Reports"
        subtitle="Theoretical vs Actual Usage (detectare pierderi, furt, erori)"
      />

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>"selecteaza data"</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <Button variant="primary" onClick={calculateVariance} disabled={loading}>
                {loading ? 'Se calculează...' : 'Calculează Variance'}
              </Button>
              <Button variant="secondary" onClick={loadVariances}>"incarca raport"</Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5 className="mb-3">Raport Variance - {date}</h5>

          {variances.length === 0 ? (
            <Alert variant="info">"nu exista date variance pentru aceasta data calcul"</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Teoretic</th>
                  <th>Actual</th>
                  <th>Diferență</th>
                  <th>%</th>
                  <th>"cost diferenta"</th>
                  <th>Tip</th>
                  <th>"investigatie"</th>
                </tr>
              </thead>
              <tbody>
                {variances.map(v => (
                  <tr key={v.id} className={v.requires_investigation ? 'table-warning' : ''}>
                    <td><strong>{v.ingredient_name}</strong></td>
                    <td>{safeFixed(v.theoretical_usage)}</td>
                    <td>{safeFixed(v.actual_usage)}</td>
                    <td>
                      <Badge bg={safeNum(v.variance_quantity) > 0 ? 'success' : 'danger'}>
                        {safeNum(v.variance_quantity) > 0 ? '+' : ''}{safeFixed(v.variance_quantity)}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={Math.abs(safeNum(v.variance_percentage)) > 10 ? 'danger' : 'warning'}>
                        {safeFixed(v.variance_percentage, 1)}%
                      </Badge>
                    </td>
                    <td>{safeFixed(v.variance_cost)} RON</td>
                    <td><Badge bg={v.variance_type === 'shortage' ? 'danger' : 'success'}>{v.variance_type}</Badge></td>
                    <td>{v.requires_investigation ? '⚠️ DA' : '✓ NU'}</td>
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




