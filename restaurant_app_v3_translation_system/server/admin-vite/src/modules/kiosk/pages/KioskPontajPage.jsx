import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Modal, Form, Table, Spinner, ProgressBar } from 'react-bootstrap';
import { 
  Clock, LogIn, LogOut, Coffee, UserCheck, Users, 
  Calendar, TrendingUp, AlertCircle, CheckCircle,
  Play, Pause, StopCircle, RefreshCw
} from 'lucide-react';
import './KioskPontajPage.css';

/**
 * KioskPontajPage - Terminal Pontaj (Time Clock)
 * Funcționalități complete HoReCa:
 * - Clock In / Clock Out cu PIN sau selecție
 * - Pauze (Break Start / Break End)
 * - Dashboard ore lucrate azi
 * - Istoric pontaje
 * - Payroll summary
 */
export const KioskPontajPage = () => {
  // State
  const [employees, setEmployees] = useState([]);
  const [activeClocks, setActiveClocks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [liveStats, setLiveStats] = useState({ on_shift: 0, on_break: 0, today_hours: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal state
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [clockOutNotes, setClockOutNotes] = useState('');
  
  // Current time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      try {
        const empRes = await fetch('/api/users?role=waiter,cook,bartender,host');
        const empData = await empRes.json();
        let empArray = Array.isArray(empData) ? empData : (empData.users || []);
        // Asigură-te că este array
        if (!Array.isArray(empArray)) {
          empArray = [];
        }
        setEmployees(empArray);
      } catch (e) {
        console.warn('Could not load employees:', e);
        setEmployees([]);
      }
      
      // Fetch live stats
      try {
        const statsRes = await fetch('/api/scheduling/live-stats');
        const statsData = await statsRes.json();
        if (statsData && statsData.success) {
          setLiveStats({
            on_shift: statsData.on_shift || 0,
            on_break: statsData.on_break || 0,
            today_hours: statsData.today_hours || 0
          });
        } else {
          setLiveStats({ on_shift: 0, on_break: 0, today_hours: 0 });
        }
      } catch (e) {
        console.warn('Could not load live stats:', e);
        setLiveStats({ on_shift: 0, on_break: 0, today_hours: 0 });
      }
      
      // Fetch active clocks
      try {
        const today = new Date().toISOString().split('T')[0];
        const entriesRes = await fetch(`/api/scheduling/time-entries?startDate="Today"&endDate="Today"`);
        const entriesData = await entriesRes.json();
        if (entriesData && entriesData.success) {
          let entries = Array.isArray(entriesData.entries) ? entriesData.entries : [];
          // Asigură-te că este array
          if (!Array.isArray(entries)) {
            entries = [];
          }
          setTimeEntries(entries);
          setActiveClocks(entries.filter(e => !e.clock_out));
        } else {
          setTimeEntries([]);
          setActiveClocks([]);
        }
      } catch (e) {
        console.warn('Could not load time entries:', e);
        setTimeEntries([]);
        setActiveClocks([]);
      }
      
      // Fetch payroll summary (last 7 days)
      try {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const payrollRes = await fetch(`/api/scheduling/payroll/summary?startDate=${weekAgo.toISOString().split('T')[0]}&endDate="Today"`);
        const payrollData = await payrollRes.json();
        if (payrollData && payrollData.success) {
          let summary = Array.isArray(payrollData.summary) ? payrollData.summary : [];
          // Asigură-te că este array
          if (!Array.isArray(summary)) {
            summary = [];
          }
          setPayrollSummary(summary);
        } else {
          setPayrollSummary([]);
        }
      } catch (e) {
        console.warn('Could not load payroll summary:', e);
        setPayrollSummary([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading pontaj data:', err);
      setError('Eroare la încărcarea datelor de pontaj');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Clock In
  const handleClockIn = async (employee) => {
    try {
      const res = await fetch('/api/scheduling/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employee.id })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`${employee.name} a fost pontat cu succes!`);
        setShowClockInModal(false);
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Eroare la pontare');
      }
    } catch (err) {
      setError('Eroare la conexiune');
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    if (!selectedEmployee) return;
    
    try {
      const res = await fetch('/api/scheduling/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employee_id: selectedEmployee.employee_id || selectedEmployee.id,
          notes: clockOutNotes 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Depontare reușită! Ore lucrate: ${data.total_hours}h`);
        setShowClockOutModal(false);
        setClockOutNotes('');
        loadData();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || 'Eroare la depontare');
      }
    } catch (err) {
      setError('Eroare la conexiune');
    }
  };

  // Break Start
  const handleBreakStart = async (entry) => {
    try {
      const res = await fetch('/api/scheduling/break-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: entry.employee_id })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Pauză începută!');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Eroare la începerea pauzei');
    }
  };

  // Break End
  const handleBreakEnd = async (entry) => {
    try {
      const res = await fetch('/api/scheduling/break-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: entry.employee_id })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Pauză încheiată!');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Eroare la încheierea pauzei');
    }
  };

  // Calculate worked hours for an entry
  const calculateWorkedHours = (entry) => {
    if (!entry.clock_in) return '0:00';
    const start = new Date(entry.clock_in);
    const end = entry.clock_out ? new Date(entry.clock_out) : new Date();
    const diff = (end - start) / (1000 * 60 * 60);
    const hours = Math.floor(diff);
    const minutes = Math.floor((diff - hours) * 60);
    return `"Hours":${minutes.toString().padStart(2, '0')}`;
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status badge
  const getStatusBadge = (entry) => {
    if (entry.status === 'on_break') {
      return <Badge bg="warning" className="d-flex align-items-center gap-1"><Coffee size={12} /> Pauză</Badge>;
    }
    if (!entry.clock_out) {
      return <Badge bg="success" className="d-flex align-items-center gap-1"><Play size={12} /> Activ</Badge>;
    }
    return <Badge bg="secondary" className="d-flex align-items-center gap-1"><StopCircle size={12} /> Încheiat</Badge>;
  };

  if (loading && employees.length === 0) {
    return (
      <div className="pontaj-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div className="pontaj-page">
      {/* Header */}
      <div className="pontaj-header">
        <div className="pontaj-header__left">
          <h1 className="pontaj-title">
            <Clock className="pontaj-title-icon" />
            Terminal Pontaj
          </h1>
          <p className="pontaj-subtitle">Clock In / Clock Out • Gestiune Ore Lucrate</p>
        </div>
        <div className="pontaj-header__right">
          <div className="pontaj-clock">
            <div className="pontaj-clock__time">
              {currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="pontaj-clock__date">
              {currentTime.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          <AlertCircle size={18} className="me-2" /> {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-3">
          <CheckCircle size={18} className="me-2" /> {success}
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="pontaj-kpis">
        <Card className="pontaj-kpi-card pontaj-kpi-card--active">
          <Card.Body>
            <div className="pontaj-kpi-icon"><UserCheck /></div>
            <div className="pontaj-kpi-content">
              <div className="pontaj-kpi-value">{liveStats.on_shift}</div>
              <div className="pontaj-kpi-label">În tură acum</div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="pontaj-kpi-card pontaj-kpi-card--break">
          <Card.Body>
            <div className="pontaj-kpi-icon"><Coffee /></div>
            <div className="pontaj-kpi-content">
              <div className="pontaj-kpi-value">{liveStats.on_break}</div>
              <div className="pontaj-kpi-label">În pauză</div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="pontaj-kpi-card pontaj-kpi-card--hours">
          <Card.Body>
            <div className="pontaj-kpi-icon"><TrendingUp /></div>
            <div className="pontaj-kpi-content">
              <div className="pontaj-kpi-value">{liveStats.today_hours?.toFixed(1) || 0}h</div>
              <div className="pontaj-kpi-label">Ore azi (total)</div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="pontaj-kpi-card pontaj-kpi-card--team">
          <Card.Body>
            <div className="pontaj-kpi-icon"><Users /></div>
            <div className="pontaj-kpi-content">
              <div className="pontaj-kpi-value">{employees.length}</div>
              <div className="pontaj-kpi-label">Angajați total</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="pontaj-actions">
        <Button 
          variant="success" 
          size="lg" 
          className="pontaj-action-btn pontaj-action-btn--clock-in"
          onClick={() => setShowClockInModal(true)}
        >
          <LogIn size={24} />
          <span>Clock In</span>
        </Button>
        
        <Button 
          variant="danger" 
          size="lg" 
          className="pontaj-action-btn pontaj-action-btn--clock-out"
          onClick={() => setShowClockOutModal(true)}
          disabled={activeClocks.length === 0}
        >
          <LogOut size={24} />
          <span>Clock Out</span>
        </Button>
        
        <Button 
          variant="outline-light" 
          size="lg" 
          className="pontaj-action-btn pontaj-action-btn--refresh"
          onClick={loadData}
        >
          <RefreshCw size={24} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Active Clocks */}
      <Card className="pontaj-section">
        <Card.Header className="pontaj-section-header">
          <h2><UserCheck size={20} /> Angajați în Tură ({activeClocks.length})</h2>
        </Card.Header>
        <Card.Body>
          {activeClocks.length === 0 ? (
            <div className="pontaj-empty">
              <Clock size={48} />
              <p>Nimeni nu este pontat momentan</p>
            </div>
          ) : (
            <div className="pontaj-active-grid">
              {activeClocks.map((entry) => (
                <Card key={entry.id} className="pontaj-active-card">
                  <Card.Body>
                    <div className="pontaj-active-card__header">
                      <div className="pontaj-active-card__avatar">
                        {entry.employee_name?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="pontaj-active-card__info">
                        <h4>{entry.employee_name || 'Necunoscut'}</h4>
                        {getStatusBadge(entry)}
                      </div>
                    </div>
                    
                    <div className="pontaj-active-card__stats">
                      <div className="pontaj-active-card__stat">
                        <span className="label">Început:</span>
                        <span className="value">{formatTime(entry.clock_in)}</span>
                      </div>
                      <div className="pontaj-active-card__stat">
                        <span className="label">Ore lucrate:</span>
                        <span className="value">{calculateWorkedHours(entry)}</span>
                      </div>
                    </div>
                    
                    <div className="pontaj-active-card__actions">
                      {entry.status === 'on_break' ? (
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => handleBreakEnd(entry)}
                        >
                          <Play size={14} /> Termină pauza
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleBreakStart(entry)}
                        >
                          <Coffee size={14} /> Pauză
                        </Button>
                      )}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(entry);
                          setShowClockOutModal(true);
                        }}
                      >
                        <LogOut size={14} /> Clock Out
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Today's Log */}
      <Card className="pontaj-section">
        <Card.Header className="pontaj-section-header">
          <h2><Calendar size={20} /> Jurnal Azi</h2>
        </Card.Header>
        <Card.Body>
          <Table responsive hover className="pontaj-table">
            <thead>
              <tr>
                <th>Angajat</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Pauză</th>
                <th>Total Ore</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nicio înregistrare pentru azi
                  </td>
                </tr>
              ) : (
                timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td><strong>{entry.employee_name || 'N/A'}</strong></td>
                    <td>{formatTime(entry.clock_in)}</td>
                    <td>{entry.clock_out ? formatTime(entry.clock_out) : '-'}</td>
                    <td>
                      {entry.break_start ? (
                        `${formatTime(entry.break_start)} - ${entry.break_end ? formatTime(entry.break_end) : 'în curs'}`
                      ) : '-'}
                    </td>
                    <td>{entry.total_hours ? `${entry.total_hours.toFixed(2)}h` : calculateWorkedHours(entry)}</td>
                    <td>{getStatusBadge(entry)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Payroll Summary (Last 7 days) */}
      {payrollSummary.length > 0 && (
        <Card className="pontaj-section">
          <Card.Header className="pontaj-section-header">
            <h2><TrendingUp size={20} /> Sumar Săptămânal</h2>
          </Card.Header>
          <Card.Body>
            <Table responsive hover className="pontaj-table">
              <thead>
                <tr>
                  <th>Angajat</th>
                  <th>Ture Lucrate</th>
                  <th>Total Ore</th>
                  <th>Overtime</th>
                  <th>Progres 40h/săpt</th>
                </tr>
              </thead>
              <tbody>
                {payrollSummary.map((row) => (
                  <tr key={row.employee_id}>
                    <td><strong>{row.employee_name}</strong></td>
                    <td>{row.shifts_worked}</td>
                    <td>{row.total_hours?.toFixed(1) || 0}h</td>
                    <td className={row.overtime_hours > 0 ? 'text-warning' : ''}>
                      {row.overtime_hours?.toFixed(1) || 0}h
                    </td>
                    <td style={{ minWidth: '150px' }}>
                      <ProgressBar 
                        now={Math.min((row.total_hours / 40) * 100, 100)} 
                        variant={row.total_hours > 40 ? 'danger' : 'success'}
                        label={`${Math.round((row.total_hours / 40) * 100)}%`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Clock In Modal */}
      <Modal show={showClockInModal} onHide={() => setShowClockInModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title><LogIn size={24} className="me-2" /> Selectează Angajat - Clock In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="pontaj-employee-grid">
            {employees.filter(emp => !activeClocks.find(c => c.employee_id === emp.id)).map((emp) => (
              <Button
                key={emp.id}
                variant="outline-success"
                className="pontaj-employee-btn"
                onClick={() => handleClockIn(emp)}
              >
                <div className="pontaj-employee-avatar">
                  {emp.name?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <span>{emp.name}</span>
              </Button>
            ))}
            {employees.filter(emp => !activeClocks.find(c => c.employee_id === emp.id)).length === 0 && (
              <div className="text-center text-muted py-4 w-100">
                Toți angajații sunt deja pontați
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Clock Out Modal */}
      <Modal show={showClockOutModal} onHide={() => setShowClockOutModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><LogOut size={24} className="me-2" /> Clock Out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedEmployee ? (
            <div className="pontaj-employee-grid">
              {activeClocks.map((entry) => (
                <Button
                  key={entry.id}
                  variant="outline-danger"
                  className="pontaj-employee-btn"
                  onClick={() => setSelectedEmployee(entry)}
                >
                  <div className="pontaj-employee-avatar">
                    {entry.employee_name?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <span>{entry.employee_name}</span>
                  <small className="text-muted">În tură de la {formatTime(entry.clock_in)}</small>
                </Button>
              ))}
            </div>
          ) : (
            <div>
              <Alert variant="info">
                <strong>{selectedEmployee.employee_name}</strong> - Ore lucrate: <strong>{calculateWorkedHours(selectedEmployee)}</strong>
              </Alert>
              <Form.Group className="mb-3">
                <Form.Label>Note (opțional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Observații despre tură..."
                  value={clockOutNotes}
                  onChange={(e) => setClockOutNotes(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={() => setSelectedEmployee(null)}>
                  Înapoi
                </Button>
                <Button variant="danger" onClick={handleClockOut}>
                  <LogOut size={18} className="me-2" /> Confirmă Clock Out
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default KioskPontajPage;

