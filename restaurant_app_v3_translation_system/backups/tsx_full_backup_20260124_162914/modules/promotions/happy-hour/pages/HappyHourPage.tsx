// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { happyHourApi, type HappyHour, type HappyHourStats } from '../api/happyHourApi';
import { HappyHourModal } from '../components/HappyHourModal';
import { HappyHourStatsCard } from '../components/HappyHourStatsCard';
import { ActiveHappyHourCard } from '../components/ActiveHappyHourCard';
import { HappyHourAdvancedStats } from '../components/HappyHourAdvancedStats';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './HappyHourPage.css';

export const HappyHourPage = () => {
//   const { t } = useTranslation();
  const [happyHours, setHappyHours] = useState<HappyHour[]>([]);
  const [stats, setStats] = useState<HappyHourStats[]>([]);
  const [activeHappyHours, setActiveHappyHours] = useState<HappyHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHappyHour, setEditingHappyHour] = useState<HappyHour | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [happyHoursData, statsData, activeData] = await Promise.all([
        happyHourApi.getAll(),
        happyHourApi.getStats(),
        happyHourApi.getActive(),
      ]);
      setHappyHours(happyHoursData);
      setStats(statsData);
      setActiveHappyHours(activeData);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea datelor Happy Hour:', err);
      setError(err?.response?.data?.error || err?.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleOpenModal = (happyHour?: HappyHour) => {
    setEditingHappyHour(happyHour || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHappyHour(null);
  };

  const handleSave = async (data: Omit<HappyHour, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingHappyHour?.id) {
        await happyHourApi.update(editingHappyHour.id, data);
        setFeedback({ type: 'success', message: 'Happy Hour actualizat cu succes!' });
      } else {
        await happyHourApi.create(data);
        setFeedback({ type: 'success', message: 'Happy Hour creat cu succes!' });
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      console.error('❌ Eroare la salvarea Happy Hour:', err);
      setFeedback({ type: 'error', message: err?.response?.data?.error || err?.message || 'Eroare la salvare' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi acest Happy Hour?')) {
      return;
    }
    try {
      await happyHourApi.delete(id);
      setFeedback({ type: 'success', message: 'Happy Hour șters cu succes!' });
      await loadData();
    } catch (err: any) {
      console.error('❌ Eroare la ștergerea Happy Hour:', err);
      setFeedback({ type: 'error', message: err?.response?.data?.error || err?.message || 'Eroare la ștergere' });
    }
  };

  const parseDaysOfWeek = (days: string): string[] => {
    try {
      if (typeof days === 'string') {
        const parsed = JSON.parse(days);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(days) ? days : [];
    } catch {
      return [];
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    // Format: HH:MM
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    return time;
  };

  const formatDays = (days: string): string => {
    const daysArray = parseDaysOfWeek(days);
    const dayNames: { [key: string]: string } = {
      '0': 'Luni',
      '1': 'Marți',
      '2': 'Miercuri',
      '3': 'Joi',
      '4': 'Vineri',
      '5': 'Sâmbătă',
      '6': 'Duminică',
    };
    return daysArray.map((d: string) => dayNames[d] || d).join(', ') || 'N/A';
  };

  const formatDiscount = (hh: HappyHour): string => {
    if (hh.discount_percentage && hh.discount_percentage > 0) {
      return `${hh.discount_percentage}%`;
    }
    if (hh.discount_fixed && hh.discount_fixed > 0) {
      return `${hh.discount_fixed} RON`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="happy-hour-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">"se incarca happy hour urile"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="happy-hour-page" data-page-ready="true">
      <PageHeader
        title="Gestiune Happy Hour"
        description="Configurează perioadele Happy Hour cu reduceri pentru produse sau categorii specifice."
        actions={[
          {
            label: '➕ Happy Hour Nou',
            variant: 'primary',
            onClick: () => handleOpenModal(),
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

      {/* Statistici Avansate */}
      <div className="mt-4">
        <HappyHourAdvancedStats />
      </div>

      <div className="row mt-4">
        {/* Lista Happy Hour-uri */}
        <div className="col-md-8">
          <Card>
            <Card.Header className="bg-warning text-dark">
              <i className="fas fa-clock me-2"></i>
              Happy Hour-uri Configurate
            </Card.Header>
            <Card.Body>
              {happyHours.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-clock fa-3x mb-3 opacity-50"></i>
                  <p>"nu exista happy hour configurate"</p>
                  <Button variant="warning" onClick={() => handleOpenModal()}>
                    <i className="fas fa-plus me-2"></i>"adauga primul happy hour"</Button>
                </div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Ore</th>
                      <th>Zile</th>
                      <th>Reducere</th>
                      <th>Status</th>
                      <th>"Acțiuni"</th>
                    </tr>
                  </thead>
                  <tbody>
                    {happyHours.map((hh) => (
                      <tr key={hh.id}>
                        <td>{hh.name}</td>
                        <td>
                          {formatTime(hh.start_time)} - {formatTime(hh.end_time)}
                        </td>
                        <td>{formatDays(hh.days_of_week)}</td>
                        <td>{formatDiscount(hh)}</td>
                        <td>
                          <Badge bg={hh.is_active ? 'success' : 'secondary'}>
                            {hh.is_active ? 'Activ' : 'Inactiv'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant={hh.is_active ? "outline-warning" : "outline-success"}
                            size="sm"
                            className="me-2"
                            onClick={async () => {
                              if (hh.id) {
                                try {
                                  await happyHourApi.toggleStatus(hh.id);
                                  setFeedback({ type: 'success', message: 'Status Happy Hour actualizat!' });
                                  await loadData();
                                } catch (err: any) {
                                  setFeedback({ type: 'error', message: err?.response?.data?.error || 'Eroare la actualizare status' });
                                }
                              }
                            }}
                            title={hh.is_active ? 'Dezactivează' : 'Activează'}
                          >
                            <i className={`fas fa-${hh.is_active ? 'pause' : 'play'}`}></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(hh)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => hh.id && handleDelete(hh.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Sidebar cu statistici */}
        <div className="col-md-4">
          <HappyHourStatsCard stats={stats} onRefresh={() => void loadData()} />
          <ActiveHappyHourCard activeHappyHours={activeHappyHours} />
        </div>
      </div>

      <HappyHourModal
        show={showModal}
        happyHour={editingHappyHour}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
};




