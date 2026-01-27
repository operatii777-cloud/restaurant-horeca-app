import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';

export const CoatroomReportPage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!date) {
      alert('Selectează data!');
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.get('/api/reports/coatroom/daily/pdf', {
        params: { date },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `coatroom_daily_${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Eroare la generarea PDF-ului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="📊 Raport Garderobă - Daily Summary"
        description="Raport zilnic tichete garderobă"
      />

      <Card>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Alege Data</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                className="w-100 mb-3"
                onClick={handleDownloadPdf}
                disabled={loading}
              >
                {loading ? 'Se generează...' : '📥 Descarcă PDF'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

