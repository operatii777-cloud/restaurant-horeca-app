// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './SchedulePage.css';

interface Schedule {
  id?: number;
  location_id?: number;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  break_start?: string;
  break_end?: string;
}

interface Holiday {
  id?: number;
  location_id?: number;
  date: string;
  name: string;
  name_en?: string;
  is_closed: boolean;
  special_open_time?: string;
  special_close_time?: string;
  is_recurring: boolean;
}

const DAYS = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];

export const SchedulePage: React.FC = () => {
//   const { t } = useTranslation();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: schedulesData, refetch: refetchSchedules } = useApiQuery<Schedule[]>('/api/settings/schedule');
  const { data: holidaysData, refetch: refetchHolidays } = useApiQuery<Holiday[]>('/api/settings/holidays');
  const updateScheduleMutation = useApiMutation();
  const createHolidayMutation = useApiMutation();
  const updateHolidayMutation = useApiMutation();
  const deleteHolidayMutation = useApiMutation();

  useEffect(() => {
    if (schedulesData) {
      // Inițializează programul pentru toate zilele dacă nu există
      const existingDays = schedulesData.map(s => s.day_of_week);
      const allSchedules: Schedule[] = [];
      
      for (let i = 0; i < 7; i++) {
        const existing = schedulesData.find(s => s.day_of_week === i);
        if (existing) {
          allSchedules.push(existing);
        } else {
          allSchedules.push({
            day_of_week: i,
            is_closed: false,
            open_time: '09:00',
            close_time: '22:00',
          });
        }
      }
      
      setSchedules(allSchedules);
      setLoading(false);
    }
  }, [schedulesData]);

  useEffect(() => {
    if (holidaysData) {
      setHolidays(holidaysData);
    }
  }, [holidaysData]);

  const handleScheduleChange = (dayIndex: number, field: keyof Schedule, value: any) => {
    const updated = schedules.map((s, idx) => {
      if (idx === dayIndex) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setSchedules(updated);
  };

  const handleSaveSchedule = async () => {
    try {
      await updateScheduleMutation.mutate({ 
        url: '/api/settings/schedule', 
        method: 'PUT',
        data: { schedules } 
      });
      setAlert({ type: 'success', message: 'Program salvat cu succes!' });
      refetchSchedules();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleSaveHoliday = async (holiday: Holiday) => {
    try {
      if (editingHoliday?.id) {
        await updateHolidayMutation.mutate({ 
          url: `/api/settings/holidays/${editingHoliday.id}`, 
          method: 'PUT',
          data: holiday 
        });
        setAlert({ type: 'success', message: 'Sărbătoare actualizată cu succes!' });
      } else {
        await createHolidayMutation.mutate({ 
          url: '/api/settings/holidays', 
          method: 'POST',
          data: holiday 
        });
        setAlert({ type: 'success', message: 'Sărbătoare adăugată cu succes!' });
      }
      setShowHolidayModal(false);
      setEditingHoliday(null);
      refetchHolidays();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm('Sigur doriți să ștergeți această sărbătoare?')) return;
    
    try {
      await deleteHolidayMutation.mutate({ 
        url: `/api/settings/holidays/"Id"`, 
        method: 'DELETE' 
      });
      setAlert({ type: 'success', message: 'Sărbătoare ștearsă cu succes!' });
      refetchHolidays();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la ștergere' });
    }
  };

  if (loading) {
    return <div className="schedule-page">Se încarcă...</div>;
  }

  return (
    <div className="schedule-page">
      <PageHeader
        title="Program & Orar"
        description="Configurare program restaurant și sărbători"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="schedule-page__section">
        <h3>"program saptamanal"</h3>
        <div className="schedule-table">
          <table className="table">
            <thead>
              <tr>
                <th>Zi</th>
                <th>"Închis"</th>
                <th>"ora deschidere"</th>
                <th>"ora inchidere"</th>
                <th>"pauza start"</th>
                <th>"pauza end"</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, idx) => (
                <tr key={idx}>
                  <td><strong>{DAYS[schedule.day_of_week]}</strong></td>
                  <td>
                    <input
                      type="checkbox"
                      checked={schedule.is_closed}
                      onChange={(e) => handleScheduleChange(idx, 'is_closed', e.target.checked)}
                      title={`Închis ${DAYS[schedule.day_of_week]}`}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={schedule.open_time || ''}
                      onChange={(e) => handleScheduleChange(idx, 'open_time', e.target.value)}
                      disabled={schedule.is_closed}
                      title="Ora deschidere"
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={schedule.close_time || ''}
                      onChange={(e) => handleScheduleChange(idx, 'close_time', e.target.value)}
                      disabled={schedule.is_closed}
                      title="Ora închidere"
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={schedule.break_start || ''}
                      onChange={(e) => handleScheduleChange(idx, 'break_start', e.target.value)}
                      disabled={schedule.is_closed}
                      title="Început pauză"
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={schedule.break_end || ''}
                      onChange={(e) => handleScheduleChange(idx, 'break_end', e.target.value)}
                      disabled={schedule.is_closed}
                      title="Sfârșit pauză"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="schedule-actions">
            <button className="btn btn-primary" onClick={handleSaveSchedule}>
              💾 Salvează Program
            </button>
          </div>
        </div>
      </div>

      <div className="schedule-page__section">
        <div className="section-header">
          <h3>"Sărbători"</h3>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingHoliday(null);
              setShowHolidayModal(true);
            }}
          >
            ➕ Adaugă Sărbătoare
          </button>
        </div>
        <div className="holidays-table">
          <table className="table">
            <thead>
              <tr>
                <th>Dată</th>
                <th>Nume</th>
                <th>"Închis"</th>
                <th>"Recurent"</th>
                <th>"Acțiuni"</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">"nu exista sarbatori configurate"</td>
                </tr>
              ) : (
                holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td>{holiday.date}</td>
                    <td>{holiday.name}</td>
                    <td>
                      <span className={`badge ${holiday.is_closed ? 'badge-warning' : 'badge-success'}`}>
                        {holiday.is_closed ? 'Închis' : 'Deschis'}
                      </span>
                    </td>
                    <td>{holiday.is_recurring ? '✅' : '❌'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setEditingHoliday(holiday);
                          setShowHolidayModal(true);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => holiday.id && handleDeleteHoliday(holiday.id)}
                      >
                        🗑️ Șterge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showHolidayModal && (
        <HolidayModal
          holiday={editingHoliday}
          onSave={handleSaveHoliday}
          onClose={() => {
            setShowHolidayModal(false);
            setEditingHoliday(null);
          }}
        />
      )}
    </div>
  );
};

interface HolidayModalProps {
  holiday: Holiday | null;
  onSave: (holiday: Holiday) => void;
  onClose: () => void;
}

const HolidayModal: React.FC<HolidayModalProps> = ({ holiday, onSave, onClose }) => {
  const [formData, setFormData] = useState<Holiday>({
    date: holiday?.date || '',
    name: holiday?.name || '',
    name_en: holiday?.name_en || '',
    is_closed: holiday?.is_closed ?? true,
    special_open_time: holiday?.special_open_time || '',
    special_close_time: holiday?.special_close_time || '',
    is_recurring: holiday?.is_recurring || false,
    location_id: holiday?.location_id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{holiday ? 'Editare Sărbătoare' : 'Adaugă Sărbătoare'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Dată *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              title="Data sărbătorii"
            />
          </div>
          <div className="form-group">
            <label>Nume *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              title="Nume sărbătoare"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_closed}
                onChange={(e) => setFormData({ ...formData, is_closed: e.target.checked })}
              />"restaurant inchis"</label>
          </div>
          {!formData.is_closed && (
            <>
              <div className="form-group">
                <label>"ora deschidere speciala"</label>
                <input
                  type="time"
                  value={formData.special_open_time || ''}
                  onChange={(e) => setFormData({ ...formData, special_open_time: e.target.value })}
                  title="Ora deschidere specială"
                />
              </div>
              <div className="form-group">
                <label>"ora inchidere speciala"</label>
                <input
                  type="time"
                  value={formData.special_close_time || ''}
                  onChange={(e) => setFormData({ ...formData, special_close_time: e.target.value })}
                  title="Ora închidere specială"
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              />"se repeta anual"</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>"Anulează"</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




