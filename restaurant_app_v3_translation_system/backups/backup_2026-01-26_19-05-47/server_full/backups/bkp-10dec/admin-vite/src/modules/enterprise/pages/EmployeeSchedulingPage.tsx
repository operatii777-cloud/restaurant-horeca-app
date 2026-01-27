/**
 * 📅 EMPLOYEE SCHEDULING PAGE - STANDARD HORECA PROFESIONAL
 * Inspirat din: GloriaFood, Toast, Oracle Micros, Lightspeed
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './EmployeeSchedulingPage.css';

interface Employee {
  id: number;
  code: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  hourly_rate: number;
  status: string;
}

interface Shift {
  id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  position: string;
  employee_id?: number;
  employee_name?: string;
  status: 'scheduled' | 'confirmed' | 'on_shift' | 'completed' | 'cancelled' | 'no_show';
}

export const EmployeeSchedulingPage = () => {
  // State Management
  const [activeView, setActiveView] = useState<'calendar' | 'employees'>('calendar');
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  
  // Date Filters
  const [quickFilter, setQuickFilter] = useState<'this_week' | 'next_week' | 'this_month'>('this_week');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Modals
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Forms
  const [shiftForm, setShiftForm] = useState({
    shift_date: '',
    start_time: '08:00',
    end_time: '16:00',
    break_duration: '30',
    position: '',
    employee_id: '',
    status: 'scheduled'
  });
  
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: 'waiter',
    phone: '',
    email: '',
    hourly_rate: '18'
  });

  // Quick Filter Logic
  const applyQuickFilter = (filter: string) => {
    const now = new Date();
    let start, end;
    
    if (filter === 'this_week') {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      start = monday.toISOString().split('T')[0];
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      end = sunday.toISOString().split('T')[0];
    } else if (filter === 'next_week') {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + 7);
      start = monday.toISOString().split('T')[0];
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      end = sunday.toISOString().split('T')[0];
    } else if (filter === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }
    
    setStartDate(start!);
    setEndDate(end!);
    setQuickFilter(filter as any);
  };

  // Load Data
  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (err: any) {
      console.error('Error loading employees:', err);
    }
  };

  const loadShifts = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/scheduling/shifts?${params}`);
      const data = await res.json();
      if (data.success) {
        setShifts(data.shifts || []);
      }
    } catch (err: any) {
      console.error('Error loading shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveStats = async () => {
    try {
      const res = await fetch('/api/scheduling/live-stats');
      const data = await res.json();
      if (data.success) {
        setLiveStats(data.stats);
      }
    } catch (err: any) {
      // Live stats opționale
    }
  };

  useEffect(() => {
    loadEmployees();
    applyQuickFilter('this_week');
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadShifts();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadLiveStats();
    const interval = setInterval(loadLiveStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // CRUD Operations
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/scheduling/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shiftForm,
          break_duration: parseInt(shiftForm.break_duration),
          employee_id: shiftForm.employee_id ? parseInt(shiftForm.employee_id) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowShiftModal(false);
        resetShiftForm();
        loadShifts();
      }
    } catch (err: any) {
      console.error('Error creating shift:', err);
    }
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;
    
    try {
      const res = await fetch(`/api/scheduling/shifts/${editingShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shiftForm,
          break_duration: parseInt(shiftForm.break_duration),
          employee_id: shiftForm.employee_id ? parseInt(shiftForm.employee_id) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowShiftModal(false);
        setEditingShift(null);
        resetShiftForm();
        loadShifts();
      }
    } catch (err: any) {
      console.error('Error updating shift:', err);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    if (!confirm('Sigur ștergi această tură?')) return;
    
    try {
      const res = await fetch(`/api/scheduling/shifts/${shiftId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadShifts();
      }
    } catch (err: any) {
      console.error('Error deleting shift:', err);
    }
  };

  const handleDuplicateWeek = async () => {
    if (!confirm('Duplici turele din această săptămână pentru săptămâna următoare?')) return;
    
    try {
      const res = await fetch('/api/scheduling/shifts/duplicate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.created || 0} ture duplicate cu succes!`);
        // Mută pe săptămâna următoare
        applyQuickFilter('next_week');
      }
    } catch (err: any) {
      console.error('Error duplicating week:', err);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employeeForm,
          hourly_rate: parseFloat(employeeForm.hourly_rate)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowEmployeeModal(false);
        setEmployeeForm({ name: '', role: 'waiter', phone: '', email: '', hourly_rate: '18' });
        loadEmployees();
      }
    } catch (err: any) {
      console.error('Error creating employee:', err);
    }
  };

  const openEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftForm({
      shift_date: shift.shift_date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      break_duration: shift.break_duration.toString(),
      position: shift.position,
      employee_id: shift.employee_id?.toString() || '',
      status: shift.status
    });
    setShowShiftModal(true);
  };

  const resetShiftForm = () => {
    setShiftForm({
      shift_date: '',
      start_time: '08:00',
      end_time: '16:00',
      break_duration: '30',
      position: '',
      employee_id: '',
      status: 'scheduled'
    });
    setEditingShift(null);
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      chef: '👨‍🍳', sous_chef: '👨‍🍳', cook: '🧑‍🍳',
      waiter: '🧑‍💼', bartender: '🍸', manager: '👔',
      supervisor: '⭐', cleaner: '🧹', driver: '🚗',
      host: '🎩', dishwasher: '🍽️'
    };
    return icons[role] || '👤';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#3b82f6',
      confirmed: '#22c55e',
      on_shift: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      no_show: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      scheduled: '📅',
      confirmed: '✅',
      on_shift: '🟢',
      completed: '✔️',
      cancelled: '❌',
      no_show: '⚠️'
    };
    return icons[status] || '❓';
  };

  return (
    <div className="employee-scheduling-page">
      <PageHeader 
        title="📅 Programare Personal & Ture" 
        description="Gestionare completă program angajați (Standard HORECA Enterprise)"
      />

      {/* Dashboard Mini - Live Stats */}
      {liveStats && (
        <div className="live-stats-dashboard">
          <div className="stat-card stat-online">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.on_shift || 0}</div>
              <div className="stat-label">În Tură Acum</div>
            </div>
          </div>
          <div className="stat-card stat-upcoming">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.upcoming_2h || 0}</div>
              <div className="stat-label">Urmează (2h)</div>
            </div>
          </div>
          <div className="stat-card stat-break">
            <div className="stat-icon">🟡</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.on_break || 0}</div>
              <div className="stat-label">În Pauză</div>
            </div>
          </div>
          <div className="stat-card stat-late">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.late || 0}</div>
              <div className="stat-label">Întârziați</div>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={activeView === 'calendar' ? 'active' : ''}
          onClick={() => setActiveView('calendar')}
        >
          📅 Calendar Ture ({shifts.length})
        </button>
        <button
          className={activeView === 'employees' ? 'active' : ''}
          onClick={() => setActiveView('employees')}
        >
          👥 Angajați ({employees.length})
        </button>
      </div>

      {/* CALENDAR VIEW - Shift Planner */}
      {activeView === 'calendar' && (
        <>
          {/* Toolbar */}
          <div className="scheduling-toolbar">
            <div className="toolbar-left">
              <div className="quick-filters">
                <button
                  className={quickFilter === 'this_week' ? 'active' : ''}
                  onClick={() => applyQuickFilter('this_week')}
                >
                  Săptămâna Aceasta
                </button>
                <button
                  className={quickFilter === 'next_week' ? 'active' : ''}
                  onClick={() => applyQuickFilter('next_week')}
                >
                  Săptămâna Viitoare
                </button>
                <button
                  className={quickFilter === 'this_month' ? 'active' : ''}
                  onClick={() => applyQuickFilter('this_month')}
                >
                  Luna Curentă
                </button>
              </div>
              
              <div className="date-range-picker">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>→</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-right">
              <button onClick={loadShifts} className="btn-refresh">
                🔄 Actualizează
              </button>
              <button onClick={() => { resetShiftForm(); setShowShiftModal(true); }} className="btn-add-shift">
                ➕ Adaugă Tură
              </button>
              <button onClick={handleDuplicateWeek} className="btn-duplicate">
                📋 Duplică Săptămână
              </button>
            </div>
          </div>

          {/* Shifts Table */}
          <div className="shifts-table-container">
            <table className="shifts-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ora Start</th>
                  <th>Ora Sfârșit</th>
                  <th>Durată</th>
                  <th>Pauză</th>
                  <th>Poziție</th>
                  <th>Angajat</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => {
                  const start = new Date(`2000-01-01T${shift.start_time}`);
                  const end = new Date(`2000-01-01T${shift.end_time}`);
                  let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  if (duration < 0) duration += 24;
                  const workHours = duration - (shift.break_duration / 60);
                  
                  return (
                    <tr key={shift.id}>
                      <td><strong>{new Date(shift.shift_date).toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: '2-digit' })}</strong></td>
                      <td>{shift.start_time}</td>
                      <td>{shift.end_time}</td>
                      <td>{workHours.toFixed(1)}h</td>
                      <td>{shift.break_duration} min</td>
                      <td>{shift.position}</td>
                      <td>{shift.employee_name || <span style={{ color: '#ef4444' }}>Nedefinit</span>}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(shift.status) }}
                        >
                          {getStatusIcon(shift.status)} {shift.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditShift(shift)}
                            className="btn-edit"
                            title="Editează"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="btn-delete"
                            title="Șterge"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {shifts.length === 0 && !loading && (
              <div className="empty-state">
                <p>📭 Nu există ture programate în această perioadă.</p>
                <button onClick={() => { resetShiftForm(); setShowShiftModal(true); }} className="btn-add-first">
                  ➕ Adaugă Prima Tură
                </button>
              </div>
            )}
          </div>

          {/* Shift Modal - Add/Edit */}
          {showShiftModal && (
            <div className="modal-overlay" onClick={() => { setShowShiftModal(false); resetShiftForm(); }}>
              <div className="modal-content modal-shift" onClick={(e) => e.stopPropagation()}>
                <h2>{editingShift ? '✏️ Editează Tură' : '➕ Adaugă Tură Nouă'}</h2>
                <form onSubmit={editingShift ? handleUpdateShift : handleCreateShift}>
                  <div className="form-group">
                    <label>📅 Data:</label>
                    <input
                      type="date"
                      required
                      value={shiftForm.shift_date}
                      onChange={(e) => setShiftForm({ ...shiftForm, shift_date: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>🕐 Ora Start:</label>
                      <input
                        type="time"
                        required
                        value={shiftForm.start_time}
                        onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>🕐 Ora Sfârșit:</label>
                      <input
                        type="time"
                        required
                        value={shiftForm.end_time}
                        onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>⏸️ Pauză (minute):</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      step="15"
                      value={shiftForm.break_duration}
                      onChange={(e) => setShiftForm({ ...shiftForm, break_duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>💼 Poziție:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ospătar Sală 1, Bucătar Grill, Barman"
                      value={shiftForm.position}
                      onChange={(e) => setShiftForm({ ...shiftForm, position: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>👤 Angajat:</label>
                    <select
                      value={shiftForm.employee_id}
                      onChange={(e) => setShiftForm({ ...shiftForm, employee_id: e.target.value })}
                    >
                      <option value="">Neasignat</option>
                      {employees.filter(e => e.status === 'active').map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {getRoleIcon(emp.role)} {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>📊 Status:</label>
                    <select
                      value={shiftForm.status}
                      onChange={(e) => setShiftForm({ ...shiftForm, status: e.target.value })}
                    >
                      <option value="scheduled">📅 Planificat</option>
                      <option value="confirmed">✅ Confirmat</option>
                      <option value="on_shift">🟢 În Tură</option>
                      <option value="completed">✔️ Finalizat</option>
                      <option value="cancelled">❌ Anulat</option>
                      <option value="no_show">⚠️ Absent</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      {editingShift ? '💾 Salvează' : '➕ Creează'}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => { setShowShiftModal(false); resetShiftForm(); }}
                    >
                      ❌ Anulează
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* EMPLOYEES VIEW */}
      {activeView === 'employees' && (
        <>
          <div className="employees-toolbar">
            <button onClick={() => setShowEmployeeModal(true)} className="btn-create-employee">
              ➕ Adaugă Angajat
            </button>
            <div className="employees-stats">
              <span>Total: {employees.length}</span>
              <span>Activi: {employees.filter(e => e.status === 'active').length}</span>
            </div>
          </div>

          <div className="employees-grid">
            {employees.map((emp) => (
              <div key={emp.id} className="employee-card">
                <div className="employee-header">
                  <h3>{getRoleIcon(emp.role)} {emp.name}</h3>
                  <span className="employee-code">{emp.code}</span>
                </div>
                <div className="employee-body">
                  <div className="employee-stat">
                    <span className="stat-label">Rol:</span>
                    <span className="stat-value">{emp.role}</span>
                  </div>
                  <div className="employee-stat">
                    <span className="stat-label">Telefon:</span>
                    <span className="stat-value">{emp.phone}</span>
                  </div>
                  <div className="employee-stat">
                    <span className="stat-label">Tarif orar:</span>
                    <span className="stat-value">{emp.hourly_rate} RON/h</span>
                  </div>
                  <div className="employee-stat">
                    <span className="stat-label">Status:</span>
                    <span className={`status-badge status-${emp.status}`}>
                      {emp.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Employee Modal */}
          {showEmployeeModal && (
            <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
              <div className="modal-content modal-employee" onClick={(e) => e.stopPropagation()}>
                <h2>➕ Adaugă Angajat Nou</h2>
                <form onSubmit={handleCreateEmployee}>
                  <div className="form-group">
                    <label>👤 Nume Complet:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ion Popescu"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>💼 Rol:</label>
                    <select
                      value={employeeForm.role}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    >
                      <option value="waiter">🧑‍💼 Ospătar</option>
                      <option value="chef">👨‍🍳 Chef</option>
                      <option value="cook">🧑‍🍳 Bucătar</option>
                      <option value="bartender">🍸 Barman</option>
                      <option value="manager">👔 Manager</option>
                      <option value="supervisor">⭐ Supraveghetor</option>
                      <option value="cleaner">🧹 Curățenie</option>
                      <option value="driver">🚗 Șofer</option>
                      <option value="host">🎩 Gazdă</option>
                      <option value="dishwasher">🍽️ Spălător vase</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>📱 Telefon:</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0721234567"
                      value={employeeForm.phone}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>📧 Email (opțional):</label>
                    <input
                      type="email"
                      placeholder="Ex: ion.popescu@restaurant.ro"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>💰 Tarif Orar (RON):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={employeeForm.hourly_rate}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, hourly_rate: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">💾 Creează Angajat</button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowEmployeeModal(false)}
                    >
                      ❌ Anulează
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
