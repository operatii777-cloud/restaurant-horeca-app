// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';

export const LostFoundReportPage = () => {
//   const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!from || !to) {
      alert('Selectează perioada!');
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.get('/api/reports/lostfound/items/pdf', {
        params: { from, to },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `lostfound_report_"From"_"To".pdf`;
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
    <div className="lostfound-report-page">
      <div className="page-header">
        <h1>📊 Raport Lost & Found</h1>
        <p>"raport obiecte gasite si pierdute"</p>
      </div>

      <Card>
        <Card.Body>
          <Row>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>De la</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>Până la</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
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




