// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Export Page
 * 
 * UI pentru Export Contabilitate:
 * - Export Saga CSV
 * - Export WinMentor
 * - Export SAF-T
 * - Setări Export Automat
 */

import React, { useState } from 'react';
import { Card, Button, Form, Alert, Row, Col, Tabs, Tab, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './AccountingExportPage.css';

export const AccountingExportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [exportType, setExportType] = useState<'saga' | 'winmentor' | 'saft'>('saga');

  const handleExport = async (type: 'saga' | 'winmentor' | 'saft') => {
    setLoading(type);
    setError(null);
    setSuccess(null);
    try {
      let endpoint = '';
      let filename = '';
      
      switch (type) {
        case 'saga':
          endpoint = '/api/accounting/export/saga';
          filename = `saga-export-${startDate}-${endDate}.csv`;
          break;
        case 'winmentor':
          endpoint = '/api/accounting/export/winmentor';
          filename = `winmentor-export-${startDate}-${endDate}.csv`;
          break;
        case 'saft':
          endpoint = '/api/accounting/export/saft';
          filename = `saft-export-${startDate}-${endDate}.xml`;
          break;
      }

      const response = await httpClient.get(endpoint, {
        params: {
          dateFrom: startDate,
          dateTo: endDate,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`Export ${type.toUpperCase()} realizat cu succes!`);
    } catch (err: any) {
      console.error('AccountingExportPage Error:', err);
      setError(err.response?.data?.error || err.message || `Eroare la export ${type.toUpperCase()}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="accounting-export-page">
      <div className="page-header">
        <h1>📤 Export Contabilitate</h1>
        <p>"export date pentru sisteme contabilitate saga winm"</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mt-3">
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Label>Data Start</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Data End</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Tip Export</Form.Label>
              <Form.Select
                value={exportType}
                onChange={(e) => setExportType(e.target.value as any)}
              >
                <option value="saga">Saga CSV</option>
                <option value="winmentor">WinMentor</option>
                <option value="saft">SAF-T (XML)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Export Options */}
      <Tabs defaultActiveKey="saga" className="mb-4">
        <Tab eventKey="saga" title="📊 Saga CSV">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Export Saga CSV</h5>
            </Card.Header>
            <Card.Body>
              <p>"export date in format csv compatibil cu saga conta"</p>
              <ul>
                <li>Format: CSV (separator ;)</li>
                <li>Encoding: UTF-8</li>
                <li>"include facturi nir rapoarte z"</li>
              </ul>
              <Button
                variant="primary"
                onClick={() => handleExpor[saga]}
                disabled={loading === 'saga'}
              >
                <i className={`fas ${loading === 'saga' ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                {loading === 'saga' ? 'Se exportă...' : 'Export Saga CSV'}
              </Button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="winmentor" title="📋 WinMentor">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Export WinMentor</h5>
            </Card.Header>
            <Card.Body>
              <p>"export date in format compatibil cu winmentor cont"</p>
              <ul>
                <li>Format: CSV (separator ,)</li>
                <li>Encoding: UTF-8</li>
                <li>"include facturi nir rapoarte z"</li>
              </ul>
              <Button
                variant="primary"
                onClick={() => handleExpor[winmentor]}
                disabled={loading === 'winmentor'}
              >
                <i className={`fas ${loading === 'winmentor' ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                {loading === 'winmentor' ? 'Se exportă...' : 'Export WinMentor'}
              </Button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="saft" title="📄 SAF-T">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Export SAF-T (Standard Audit File for Tax)</h5>
            </Card.Header>
            <Card.Body>
              <p>"export date in format saf t xml pentru anaf"</p>
              <ul>
                <li>Format: XML (SAF-T Standard)</li>
                <li>Encoding: UTF-8</li>
                <li>"include toate documentele fiscale"</li>
                <li>Conform: Standard ANAF</li>
              </ul>
              <Button
                variant="primary"
                onClick={() => handleExpor[saft]}
                disabled={loading === 'saft'}
              >
                <i className={`fas ${loading === 'saft' ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                {loading === 'saft' ? 'Se exportă...' : 'Export SAF-T XML'}
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Auto Export Settings */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">"setari export automat"</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Check
              type="switch"
              id="auto-export-enabled"
              label="activeaza export automat"
              className="mb-3"
            />
            <Row>
              <Col md={4}>
                <Form.Label>"frecventa export"</Form.Label>
                <Form.Select>
                  <option value="daily">Zilnic</option>
                  <option value="weekly">"Săptămânal"</option>
                  <option value="monthly">Lunar</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Format Implicit</Form.Label>
                <Form.Select>
                  <option value="saga">Saga CSV</option>
                  <option value="winmentor">WinMentor</option>
                  <option value="saft">SAF-T XML</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>"email notificare"</Form.Label>
                <Form.Control type="email" placeholder='[email@examplecom]' />
              </Col>
            </Row>
            <Button variant="success" className="mt-3">
              <i className="fas fa-save me-2"></i>"salveaza setari"</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};





