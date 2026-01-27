// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Scheduling Calendar Component
 * 
 * Visual shift scheduling with drag & drop
 * Similar to Toast/Lightspeed scheduling interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import './SchedulingCalendar.css';

interface Employee {
  id: number;
  name: string;
  role: string;
  color: string;
}

interface Shift {
  id: number;
  employeeId: number;
  employeeName: string;
  start: string;
  end: string;
  role?: string;
  position?: string;
  notes?: string;
  status: string;
  color: string;
}

interface SchedulingCalendarProps {
  onShiftClick?: (shift: Shift) => void;
}

const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];
const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 - 23:00

const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({ onShiftClick }) => {
//   const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState<Date>(getMonday(new Date()));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Partial<Shift> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Summary state
  const [summary, setSummary] = useState<any>(null);

  // Get Monday of a week
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Get week dates
  const getWeekDates = useCallback(() => {
    return weekDays.map((_, index) => {
      const date = new Date(currentWeek);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [currentWeek]);

  // Format date
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Load data
  useEffect(() => {
    loadEmployees();
    loadShifts();
    loadSummary();
  }, [currentWeek]);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/scheduling/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const loadShifts = async () => {
    setLoading(true);
    try {
      const weekDates = getWeekDates();
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);
      
      const response = await fetch(`/api/scheduling/shifts?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      
      if (data.success) {
        setShifts(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to load shifts:', err);
      setError('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const weekDates = getWeekDates();
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);
      
      const response = await fetch(`/api/scheduling/summary?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  // Navigate weeks
  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(getMonday(new Date()));
  };

  // Get shifts for a specific day
  const getShiftsForDay = (date: Date): Shift[] => {
    const dateStr = formatDate(date);
    return shifts.filter(shift => {
      const shiftDate = shift.start.split('T')[0];
      return shiftDate === dateStr;
    });
  };

  // Open modal for new shift
  const openNewShiftModal = (date: Date) => {
    setSelectedDate(formatDate(date));
    setEditingShift({
      employeeId: employees[0]?.id,
      start: `${formatDate(date)}T09:00`,
      end: `${formatDate(date)}T17:00`,
      status: 'scheduled'
    });
    setShowModal(true);
  };

  // Open modal for editing shift
  const openEditShiftModal = (shift: Shift) => {
    setEditingShift(shift);
    setShowModal(true);
  };

  // Save shift
  const saveShift = async () => {
    if (!editingShift) return;
    
    try {
      const isNew = !editingShift.id;
      const url = isNew ? '/api/scheduling/shifts' : `/api/scheduling/shifts/${editingShift.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const body = {
        employeeId: editingShift.employeeId,
        startTime: editingShift.start,
        endTime: editingShift.end,
        role: editingShift.role,
        position: editingShift.position,
        notes: editingShift.notes,
        status: editingShift.status
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingShift(null);
        loadShifts();
        loadSummary();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to save shift:', err);
      setError('Failed to save shift');
    }
  };

  // Delete shift
  const deleteShift = async () => {
    if (!editingShift?.id) return;
    
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    
    try {
      const response = await fetch(`/api/scheduling/shifts/${editingShift.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingShift(null);
        loadShifts();
        loadSummary();
      }
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  };

  // Copy previous week
  const copyPreviousWeek = async () => {
    if (!window.confirm('Copy all shifts from last week to this week?')) return;
    
    try {
      const previousWeekStart = new Date(currentWeek);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      
      const response = await fetch('/api/scheduling/shifts/copy-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceWeekStart: formatDate(previousWeekStart),
          targetWeekStart: formatDate(currentWeek)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadShifts();
        loadSummary();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to copy week:', err);
      setError('Failed to copy week');
    }
  };

  // Format time display
  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate shift duration
  const getShiftDuration = (start: string, end: string): number => {
    return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
  };

  const weekDates = getWeekDates();

  return (
    <Container fluid className="scheduling-calendar">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h4>📅 Program Angajați</h4>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={previousWeek}>
            ◀ Săptămâna anterioară
          </Button>
          <Button variant="outline-primary" onClick={goToToday}>
            Azi
          </Button>
          <Button variant="outline-secondary" onClick={nextWeek}>
            Săptămâna următoare ▶
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={copyPreviousWeek}>
            📋 Copiază săptămâna anterioară
          </Button>
        </Col>
      </Row>

      {/* Week header */}
      <Card className="mb-3">
        <Card.Body className="p-2">
          <Row>
            <Col xs={12} className="text-center">
              <h5>
                {weekDates[0].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} - 
                {weekDates[6].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row>
        {/* Calendar Grid */}
        <Col md={9}>
          <Card>
            <Card.Body className="p-0">
              <div className="calendar-grid">
                {/* Day headers */}
                <div className="calendar-header">
                  {weekDates.map((date, index) => {
                    const isToday = formatDate(date) === formatDate(new Date());
                    return (
                      <div 
                        key={index} 
                        className={`day-header ${isToday ? 'today' : ''}`}
                      >
                        <div className="day-name">{weekDays[index]}</div>
                        <div className="day-date">{date.getDate()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Day columns with shifts */}
                <div className="calendar-body">
                  {weekDates.map((date, dayIndex) => {
                    const dayShifts = getShiftsForDay(date);
                    const isToday = formatDate(date) === formatDate(new Date());
                    
                    return (
                      <div 
                        key={dayIndex} 
                        className={`day-column ${isToday ? 'today' : ''}`}
                        onClick={() => openNewShiftModal(date)}
                      >
                        {dayShifts.map(shift => (
                          <div
                            key={shift.id}
                            className="shift-block"
                            style={{ backgroundColor: shift.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditShiftModal(shift);
                            }}
                          >
                            <div className="shift-time">
                              {formatTime(shift.start)} - {formatTime(shift.end)}
                            </div>
                            <div className="shift-name">{shift.employeeName}</div>
                            <div className="shift-duration">
                              {getShiftDuration(shift.start, shift.end).toFixed(1)}h
                            </div>
                          </div>
                        ))}
                        
                        {dayShifts.length === 0 && (
                          <div className="no-shifts">
                            <small className="text-muted">+ Adaugă tură</small>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Summary Panel */}
        <Col md={3}>
          <Card className="mb-3">
            <Card.Header>📊 Sumar Săptămână</Card.Header>
            <Card.Body>
              {summary ? (
                <>
                  <div className="summary-stat">
                    <span>Total ture:</span>
                    <strong>{summary.totals.totalShifts}</strong>
                  </div>
                  <div className="summary-stat">
                    <span>Total ore:</span>
                    <strong>{summary.totals.totalHours}h</strong>
                  </div>
                  <div className="summary-stat">
                    <span>Media/angajat:</span>
                    <strong>{summary.totals.averageHoursPerEmployee}h</strong>
                  </div>
                </>
              ) : (
                <p className="text-muted">Loading...</p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>👥 Angajați</Card.Header>
            <Card.Body className="p-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {employees.map(emp => {
                const empSummary = summary?.employees.find((e: any) => e.id === emp.id);
                return (
                  <div key={emp.id} className="employee-row">
                    <Badge 
                      bg="primary" 
                      style={{ backgroundColor: emp.color }}
                      className="me-2"
                    >
                      {emp.name.charAt(0)}
                    </Badge>
                    <span className="flex-grow-1">{emp.name}</span>
                    <small className="text-muted">
                      {empSummary?.totalHours || 0}h
                    </small>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Shift Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingShift?.id ? '✏️ Editare Tură' : '➕ Tură Nouă'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingShift && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Angajat</Form.Label>
                    <Form.Select
                      value={editingShift.employeeId || ''}
                      onChange={(e) => setEditingShift(prev => prev ? {
                        ...prev,
                        employeeId: parseInt(e.target.value)
                      } : null)}
                      title="Selectează angajat"
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>"Poziție"</Form.Label>
                    <Form.Select
                      value={editingShift.position || ''}
                      onChange={(e) => setEditingShift(prev => prev ? {
                        ...prev,
                        position: e.target.value
                      } : null)}
                      title="Selectează poziție"
                    >
                      <option value="">-- Selectează --</option>
                      <option value="floor">"Sală"</option>
                      <option value="bar">Bar</option>
                      <option value="kitchen">"Bucătărie"</option>
                      <option value="terrace">"Terasă"</option>
                      <option value="delivery">"Livrări"</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>"Început"</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={editingShift.start?.substring(0, 16) || ''}
                      onChange={(e) => setEditingShift(prev => prev ? { 
                        ...prev, 
                        start: e.target.value 
                      } : null)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>"Sfârșit"</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={editingShift.end?.substring(0, 16) || ''}
                      onChange={(e) => setEditingShift(prev => prev ? { 
                        ...prev, 
                        end: e.target.value 
                      } : null)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editingShift.notes || ''}
                  onChange={(e) => setEditingShift(prev => prev ? { 
                    ...prev, 
                    notes: e.target.value 
                  } : null)}
                  placeholder="note optionale"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editingShift.status || 'scheduled'}
                  onChange={(e) => setEditingShift(prev => prev ? {
                    ...prev,
                    status: e.target.value
                  } : null)}
                  title="Selectează status"
                >
                  <option value="scheduled">Programat</option>
                  <option value="confirmed">Confirmat</option>
                  <option value="completed">Finalizat</option>
                  <option value="cancelled">"Anulat"</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {editingShift?.id && (
            <Button variant="danger" onClick={deleteShift} className="me-auto">
              🗑️ Șterge
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>"Anulează"</Button>
          <Button variant="primary" onClick={saveShift}>
            💾 Salvează
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SchedulingCalendar;




