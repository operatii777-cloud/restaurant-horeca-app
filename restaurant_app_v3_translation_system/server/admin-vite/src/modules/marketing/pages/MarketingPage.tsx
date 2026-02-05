// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Accordion, Badge, Alert, Spinner, Table } from 'react-bootstrap';
import { marketingApi, type CustomerSegment, type MarketingCampaign } from '../api/marketingApi';
import { CampaignModal } from '../components/CampaignModal';
import { SegmentCustomersModal } from '../components/SegmentCustomersModal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './MarketingPage.css';

export const MarketingPage = () => {
  //   const { t } = useTranslation();
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [segmenting, setSegmenting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [segmentsData, campaignsData] = await Promise.all([
        marketingApi.getSegments(),
        marketingApi.getCampaigns(),
      ]);
      setSegments(segmentsData);
      setCampaigns(campaignsData);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea datelor marketing:', err);
      setError(err?.response?.data?.error || err?.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAutoSegment = async () => {
    setSegmenting(true);
    setError(null);
    try {
      const result = await marketingApi.autoSegment();
      setFeedback({
        type: 'success',
        message: `Segmentare completată: ${result.total_customers} clienți segmentați (VIP: ${result.segments.vip_count}, Regular: ${result.segments.regular_count}, New: ${result.segments.new_count})`,
      });
      await loadData();
    } catch (err: any) {
      console.error('❌ Eroare la segmentare:', err);
      setFeedback({ type: 'error', message: err?.response?.data?.error || err?.message || 'Eroare la segmentare' });
    } finally {
      setSegmenting(false);
    }
  };

  const handleOpenSegmentModal = async (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setShowSegmentModal(true);
  };

  const handleCloseSegmentModal = () => {
    setShowSegmentModal(false);
    setSelectedSegment(null);
  };

  const handleOpenCampaignModal = () => {
    setShowCampaignModal(true);
  };

  const handleCloseCampaignModal = () => {
    setShowCampaignModal(false);
  };

  const handleSaveCampaign = async (data: Omit<MarketingCampaign, 'id'>) => {
    try {
      await marketingApi.createCampaign(data);
      setFeedback({ type: 'success', message: 'Campanie creată cu succes!' });
      await loadData();
      handleCloseCampaignModal();
    } catch (err: any) {
      console.error('❌ Eroare la salvarea campaniei:', err);
      setFeedback({ type: 'error', message: err?.response?.data?.error || err?.message || 'Eroare la salvare' });
    }
  };

  const getSegmentIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      'VIP Customers': 'fas fa-crown',
      'Regular Customers': 'fas fa-user',
      'New Customers': 'fas fa-user-plus',
      'High Value Customers': 'fas fa-gem',
      'Students': 'fas fa-graduation-cap',
    };
    return icons[name] || 'fas fa-users';
  };

  const getSegmentColor = (name: string) => {
    const colors: { [key: string]: string } = {
      'VIP Customers': 'warning',
      'Regular Customers': 'info',
      'New Customers': 'success',
      'High Value Customers': 'danger',
      'Students': 'primary',
    };
    return colors[name] || 'secondary';
  };

  if (loading) {
    return (
      <div className="marketing-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Se încarcă datele marketing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-page" data-page-ready="true">
      <PageHeader
        title='marketing & clienti'
        description="Segmentare automată clienți și gestiune campanii de marketing."
        actions={[
          {
            label: '➕ Campanie Nouă',
            variant: 'primary',
            onClick: handleOpenCampaignModal,
          },
          {
            label: '↻ Reîncarcă',
            variant: 'secondary',
            onClick: () => void loadData(),
          },
        ]}
      />

      {feedback && (
        <InlineAlert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row mt-4">
        {/* Segmente Clienți */}
        <div className="col-md-4">
          <Card>
            <Card.Header className="bg-success text-white">
              <i className="fas fa-users me-2"></i>segmente clienți</Card.Header>
            <Card.Body>
              <p className="text-muted small">
                Segmentele sunt calculate automat (VIP, Regular, New) pe baza istoricului de comenzi.
              </p>
              <Button
                variant="success"
                size="sm"
                className="w-100 mb-3"
                onClick={handleAutoSegment}
                disabled={segmenting}
              >
                {segmenting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>se procesează</>
                ) : (
                  <>
                    <i className="fas fa-magic me-2"></i>rulează segmentare acum</>
                )}
              </Button>

              <Accordion defaultActiveKey="0">
                {segments.map((segment, index) => (
                  <Accordion.Item key={segment.id} eventKey={index.toString()}>
                    <Accordion.Header>
                      <i className={`${getSegmentIcon(segment.name)} me-2 text-${getSegmentColor(segment.name)}`}></i>
                      {segment.name}
                      <Badge bg={getSegmentColor(segment.name)} className="ms-auto me-2">
                        {segment.customer_count}
                      </Badge>
                    </Accordion.Header>
                    <Accordion.Body>
                      <p className="small text-muted mb-2">{segment.description}</p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100"
                        onClick={() => handleOpenSegmentModal(segment)}
                      >
                        <i className="fas fa-eye me-2"></i>
                        Vezi Clienți ({segment.customer_count})
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>

              {segments.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
                  <p>nu există segmente, rulează segmentarea automată</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Campanii Marketing */}
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <i className="fas fa-tags me-2"></i>gestiune campanii de marketing</Card.Header>
            <Card.Body>
              <p className="text-muted">creează campanii de reduceri sau fidelizare țintite</p>
              {campaigns.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-tags fa-3x mb-3 opacity-50"></i>
                  <p>nu există campanii active</p>
                  <Button variant="primary" onClick={handleOpenCampaignModal}>
                    <i className="fas fa-plus me-2"></i>adaugă prima campanie</Button>
                </div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>nume campanie</th>
                      <th>Tip</th>
                      <th>Perioadă</th>
                      <th>Status</th>
                      <th>Statistici</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>{campaign.name}</td>
                        <td>{campaign.type}</td>
                        <td>
                          {campaign.start_date} - {campaign.end_date}
                        </td>
                        <td>
                          <Badge bg={campaign.status === 'active' ? 'success' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td>
                          {campaign.statistics ? (
                            <small className="text-muted">
                              {JSON.stringify(campaign.statistics)}
                            </small>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div >

      <CampaignModal
        show={showCampaignModal}
        onClose={handleCloseCampaignModal}
        onSave={handleSaveCampaign}
      />

      <SegmentCustomersModal
        show={showSegmentModal}
        segment={selectedSegment}
        onClose={handleCloseSegmentModal}
      />
    </div >
  );
};




