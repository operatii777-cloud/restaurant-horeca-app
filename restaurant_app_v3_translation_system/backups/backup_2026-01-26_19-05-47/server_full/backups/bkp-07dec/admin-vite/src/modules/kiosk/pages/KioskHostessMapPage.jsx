import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Form } from 'react-bootstrap';
import { 
  CalendarClock, Clock, Users, ArrowRight, CheckCircle, 
  AlertTriangle, MapPin, User, Phone, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import './KioskHostessMapPage.css';

/**
 * KioskHostessMapPage - Hostess & Planificare Sală
 * Vizualizare ocupare viitoare și alocare mese
 * Features:
 * - Time Travel slider pentru a vedea ocuparea la orice oră
 * - Rezervări nealocate în sidebar
 * - Alocare masă cu click
 * - Detectare conflicte
 */
export const KioskHostessMapPage = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewTime, setViewTime] = useState(new Date().getHours() || 18);
  const [selectedRes, setSelectedRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      let tablesData = [];
      let reservationsData = [];

      // Load tables
      try {
        const tablesRes = await fetch('/api/tables');
        if (tablesRes.ok) {
          tablesData = await tablesRes.json();
          tablesData = Array.isArray(tablesData) ? tablesData : tablesData.tables || [];
        }
      } catch (e) {
        console.warn('Could not load tables:', e);
      }

      // Load reservations
      try {
        const resRes = await fetch('/api/reservations');
        if (resRes.ok) {
          reservationsData = await resRes.json();
          reservationsData = Array.isArray(reservationsData) ? reservationsData : reservationsData.reservations || [];
        }
      } catch (e) {
        console.warn('Could not load reservations:', e);
      }

      // Mock data if empty
      if (tablesData.length === 0) {
        tablesData = [
          { id: 1, seats: 2, shape: 'round', x: 10, y: 15 },
          { id: 2, seats: 2, shape: 'round', x: 25, y: 15 },
          { id: 3, seats: 4, shape: 'rectangle', x: 45, y: 12 },
          { id: 4, seats: 4, shape: 'rectangle', x: 65, y: 12 },
          { id: 5, seats: 6, shape: 'rectangle', x: 10, y: 40 },
          { id: 6, seats: 6, shape: 'rectangle', x: 35, y: 40 },
          { id: 7, seats: 8, shape: 'rectangle', x: 60, y: 40 },
          { id: 8, seats: 2, shape: 'round', x: 10, y: 70 },
          { id: 9, seats: 2, shape: 'round', x: 25, y: 70 },
          { id: 10, seats: 4, shape: 'round', x: 45, y: 70 },
          { id: 11, seats: 4, shape: 'rectangle', x: 65, y: 70 },
          { id: 12, seats: 10, shape: 'rectangle', x: 35, y: 85 },
        ];
      }

      if (reservationsData.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        reservationsData = [
          { id: '1', customerName: 'Ion Popescu', guests: 4, date: today, time: '12:30', status: 'confirmed', tableId: 3, phone: '0722123456' },
          { id: '2', customerName: 'Maria Ionescu', guests: 2, date: today, time: '13:00', status: 'confirmed', tableId: 1, phone: '0733234567' },
          { id: '3', customerName: 'Andrei Vasilescu', guests: 6, date: today, time: '19:00', status: 'pending', tableId: null, phone: '0744345678' },
          { id: '4', customerName: 'Elena Stan', guests: 2, date: today, time: '19:30', status: 'pending', tableId: null, phone: '0755456789' },
          { id: '5', customerName: 'George Marinescu', guests: 8, date: today, time: '20:00', status: 'confirmed', tableId: 7, phone: '0766567890' },
          { id: '6', customerName: 'Ana Dumitrescu', guests: 4, date: today, time: '20:30', status: 'pending', tableId: null, phone: '0777678901' },
          { id: '7', customerName: 'Mihai Popa', guests: 3, date: today, time: '21:00', status: 'pending', tableId: null, phone: '0788789012' },
        ];
      }

      setTables(tablesData);
      setReservations(reservationsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter reservations for selected date
  const dailyReservations = reservations.filter(r => 
    r.date === selectedDate && r.status !== 'cancelled'
  );

  // Get unassigned reservations
  const unassignedReservations = dailyReservations.filter(r => !r.tableId);

  // Check table status at specific time
  const getTableStatusAtTime = (tableId, hour) => {
    // Assume 2 hour duration
    const conflict = dailyReservations.find(r => {
      if (r.tableId !== tableId) return false;
      const resHour = parseInt(r.time.split(':')[0]);
      return resHour <= hour && resHour + 2 > hour;
    });
    return conflict;
  };

  // Handle assign table
  const handleAssignTable = async (tableId) => {
    if (!selectedRes) return;

    // Check for conflict
    const resHour = parseInt(selectedRes.time.split(':')[0]);
    const conflict = getTableStatusAtTime(tableId, resHour);

    if (conflict) {
      const confirmed = window.confirm(
        `ATENȚIE: Masa ${tableId} este deja rezervată de ${conflict.customerName} la ora ${conflict.time}.\n\nSuprapui totuși?`
      );
      if (!confirmed) return;
    }

    // Check capacity
    const table = tables.find(t => t.id === tableId);
    if (table && table.seats < selectedRes.guests) {
      const confirmed = window.confirm(
        `Masa ${tableId} are doar ${table.seats} locuri, dar rezervarea este pentru ${selectedRes.guests} persoane.\n\nContinui?`
      );
      if (!confirmed) return;
    }

    try {
      // Try API
      try {
        await fetch(`/api/reservations/${selectedRes.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed', tableId })
        });
      } catch (e) {
        console.warn('API update failed');
      }

      // Update local state
      setReservations(prev => prev.map(r =>
        r.id === selectedRes.id
          ? { ...r, status: 'confirmed', tableId }
          : r
      ));

      setSuccess(`Rezervarea pentru ${selectedRes.customerName} a fost alocată la Masa ${tableId}`);
      setSelectedRes(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Eroare la alocare');
    }
  };

  // Navigate date
  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="hostess-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hostess-page">
      {/* Header */}
      <div className="hostess-header">
        <div className="hostess-header__left">
          <h1 className="hostess-title">
            <CalendarClock className="hostess-title-icon" />
            Hostess & Planificare Sală
          </h1>
          <p className="hostess-subtitle">Vizualizează ocuparea viitoare și alocă mese</p>
        </div>
        <div className="hostess-header__right">
          <div className="hostess-date-nav">
            <Button variant="outline-secondary" size="sm" onClick={() => changeDate(-1)}>
              <ChevronLeft size={18} />
            </Button>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="hostess-date-input"
            />
            <Button variant="outline-secondary" size="sm" onClick={() => changeDate(1)}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <AlertTriangle size={18} className="me-2" /> {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <CheckCircle size={18} className="me-2" /> {success}
        </Alert>
      )}

      <div className="hostess-content">
        {/* Sidebar: Unassigned Reservations */}
        <Card className="hostess-sidebar">
          <Card.Header className="hostess-sidebar__header">
            <h3>Rezervări Nealocate</h3>
            <Badge bg="warning">{unassignedReservations.length}</Badge>
          </Card.Header>
          <Card.Body className="hostess-sidebar__body">
            {unassignedReservations.length === 0 ? (
              <div className="hostess-sidebar__empty">
                <CheckCircle size={32} />
                <p>Toate rezervările au masă alocată</p>
              </div>
            ) : (
              unassignedReservations.map((res) => (
                <div
                  key={res.id}
                  className={`hostess-reservation ${selectedRes?.id === res.id ? 'hostess-reservation--selected' : ''}`}
                  onClick={() => setSelectedRes(res)}
                >
                  <div className="hostess-reservation__header">
                    <strong>{res.customerName}</strong>
                    <Badge bg="dark">{res.time}</Badge>
                  </div>
                  <div className="hostess-reservation__details">
                    <span className="hostess-reservation__guests">
                      <Users size={14} /> {res.guests} pers
                    </span>
                    <span className="hostess-reservation__duration">
                      <Clock size={14} /> 2h
                    </span>
                  </div>
                  {res.phone && (
                    <div className="hostess-reservation__phone">
                      <Phone size={12} /> {res.phone}
                    </div>
                  )}
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Main Map */}
        <Card className="hostess-map-card">
          {/* Time Slider */}
          <div className="hostess-time-slider">
            <div className="hostess-time-slider__header">
              <span className="hostess-time-slider__label">Time Travel</span>
              <span className="hostess-time-slider__value">{viewTime}:00</span>
            </div>
            <input
              type="range"
              min="10"
              max="23"
              step="1"
              value={viewTime}
              onChange={(e) => setViewTime(parseInt(e.target.value))}
              className="hostess-time-slider__input"
            />
            <div className="hostess-time-slider__ticks">
              <span>10:00</span>
              <span>14:00</span>
              <span>18:00</span>
              <span>22:00</span>
            </div>
          </div>

          {/* Map Area */}
          <div className="hostess-map">
            {/* Selection Banner */}
            {selectedRes && (
              <div className="hostess-map__banner">
                <span>
                  Selectează o masă pentru <strong>{selectedRes.customerName}</strong> 
                  ({selectedRes.guests} pers, ora {selectedRes.time})
                </span>
                <Button variant="outline-light" size="sm" onClick={() => setSelectedRes(null)}>
                  <X size={14} /> Anulează
                </Button>
              </div>
            )}

            {/* Tables */}
            {tables.map((table) => {
              const reservationAtTime = getTableStatusAtTime(table.id, viewTime);
              const isOccupied = !!reservationAtTime;
              const isSuggested = selectedRes && !isOccupied && table.seats >= selectedRes.guests;
              const isSmall = selectedRes && table.seats < selectedRes.guests;

              return (
                <button
                  key={table.id}
                  className={`hostess-table 
                    ${table.shape === 'round' ? 'hostess-table--round' : 'hostess-table--rectangle'}
                    ${isOccupied ? 'hostess-table--occupied' : ''}
                    ${isSuggested ? 'hostess-table--suggested' : ''}
                    ${isSmall && selectedRes ? 'hostess-table--small' : ''}
                  `}
                  style={{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                    width: table.shape === 'rectangle' ? '100px' : '70px',
                    height: table.shape === 'rectangle' ? '60px' : '70px',
                  }}
                  onClick={() => selectedRes && handleAssignTable(table.id)}
                  disabled={!selectedRes}
                >
                  <span className="hostess-table__number">{table.id}</span>
                  <span className="hostess-table__seats">{table.seats} loc</span>
                  
                  {reservationAtTime && (
                    <div className="hostess-table__reservation">
                      {reservationAtTime.customerName} ({reservationAtTime.time})
                    </div>
                  )}
                </button>
              );
            })}

            {/* Legend */}
            <div className="hostess-map__legend">
              <div className="hostess-legend-item">
                <span className="hostess-legend-dot hostess-legend-dot--free"></span>
                Liber
              </div>
              <div className="hostess-legend-item">
                <span className="hostess-legend-dot hostess-legend-dot--occupied"></span>
                Ocupat
              </div>
              <div className="hostess-legend-item">
                <span className="hostess-legend-dot hostess-legend-dot--suggested"></span>
                Recomandat
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Summary */}
      <div className="hostess-summary">
        <Card>
          <Card.Body className="d-flex align-items-center justify-content-between">
            <div>
              <strong>Rezumat pentru {new Date(selectedDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}:</strong>
            </div>
            <div className="d-flex gap-4">
              <span>
                <Badge bg="success" className="me-1">{dailyReservations.filter(r => r.tableId).length}</Badge>
                Alocate
              </span>
              <span>
                <Badge bg="warning" className="me-1">{unassignedReservations.length}</Badge>
                Nealocate
              </span>
              <span>
                <Badge bg="secondary" className="me-1">
                  {dailyReservations.reduce((sum, r) => sum + r.guests, 0)}
                </Badge>
                Total persoane
              </span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default KioskHostessMapPage;

