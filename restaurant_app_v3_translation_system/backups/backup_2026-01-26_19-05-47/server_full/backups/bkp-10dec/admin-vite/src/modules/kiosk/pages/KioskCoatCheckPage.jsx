import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Form, Table, Alert } from 'react-bootstrap';
import { 
  Tag, Plus, User, ArrowUpRight, Clock, 
  CheckCircle, Search, Car, Briefcase, Umbrella
} from 'lucide-react';
import './KioskCoatCheckPage.css';

/**
 * KioskCoatCheckPage - Garderobă & Valet Parking
 * Gestionare haine, bagaje și chei mașină
 * Features:
 * - Check-in articole cu număr tichet
 * - Returnare cu confirmare
 * - Istoric complet
 * - Asociere cu masă/client
 */
export const KioskCoatCheckPage = () => {
  const [tickets, setTickets] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState('stored');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [newTicket, setNewTicket] = useState({
    type: 'Coat',
    ticketNumber: 1,
    guestName: '',
    tableId: null,
    location: ''
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      // Try to load from API
      let ticketsData = [];
      let tablesData = [];
      
      try {
        const ticketsRes = await fetch('/api/coatcheck');
        if (ticketsRes.ok) {
          ticketsData = await ticketsRes.json();
          ticketsData = Array.isArray(ticketsData) ? ticketsData : ticketsData.tickets || [];
        }
      } catch (e) {
        console.warn('Could not load coatcheck data:', e);
      }

      try {
        const tablesRes = await fetch('/api/tables');
        if (tablesRes.ok) {
          tablesData = await tablesRes.json();
          tablesData = Array.isArray(tablesData) ? tablesData : tablesData.tables || [];
        }
      } catch (e) {
        console.warn('Could not load tables:', e);
      }

      // If no data, use mock
      if (ticketsData.length === 0) {
        ticketsData = [
          { id: '1', ticketNumber: 101, type: 'Coat', tableId: 5, guestName: 'Ion Popescu', checkInTime: Date.now() - 3600000, status: 'Stored', location: 'Cuier A-3' },
          { id: '2', ticketNumber: 102, type: 'Bag', tableId: 8, guestName: 'Maria Ionescu', checkInTime: Date.now() - 7200000, status: 'Stored', location: 'Raft B-2' },
          { id: '3', ticketNumber: 103, type: 'Valet Key', tableId: 12, guestName: 'Andrei Vasilescu', checkInTime: Date.now() - 5400000, status: 'Stored', location: 'Panou Chei #7' },
          { id: '4', ticketNumber: 98, type: 'Coat', guestName: 'Elena Stan', checkInTime: Date.now() - 86400000, checkOutTime: Date.now() - 82800000, status: 'Returned' },
          { id: '5', ticketNumber: 99, type: 'Umbrella', guestName: 'Dan Marin', checkInTime: Date.now() - 90000000, checkOutTime: Date.now() - 86000000, status: 'Returned' },
        ];
      }

      if (tablesData.length === 0) {
        tablesData = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Masa ${i + 1}` }));
      }

      setTickets(ticketsData);
      setTables(tablesData);
      
      // Set next ticket number
      const maxNum = ticketsData.length > 0 
        ? Math.max(...ticketsData.map(t => t.ticketNumber || 0)) 
        : 100;
      setNewTicket(prev => ({ ...prev, ticketNumber: maxNum + 1 }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle check-in
  const handleCheckIn = async () => {
    if (!newTicket.type) {
      setError('Tipul articolului este obligatoriu');
      return;
    }

    try {
      const ticket = {
        id: Date.now().toString(),
        ticketNumber: newTicket.ticketNumber,
        type: newTicket.type,
        tableId: newTicket.tableId || null,
        guestName: newTicket.guestName || '',
        checkInTime: Date.now(),
        status: 'Stored',
        location: newTicket.location || ''
      };

      // Try API call
      try {
        await fetch('/api/coatcheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticket)
        });
      } catch (e) {
        console.warn('API save failed, saving locally');
      }

      // Update local state
      setTickets(prev => [...prev, ticket]);
      setSuccess(`Tichet #${ticket.ticketNumber} înregistrat!`);
      setIsModalOpen(false);
      setNewTicket(prev => ({
        type: 'Coat',
        ticketNumber: prev.ticketNumber + 1,
        guestName: '',
        tableId: null,
        location: ''
      }));

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Eroare la înregistrare');
    }
  };

  // Handle return
  const handleReturn = async (ticket) => {
    if (!window.confirm(`Confirmi returnarea articolului #${ticket.ticketNumber}?`)) return;

    try {
      // Try API call
      try {
        await fetch(`/api/coatcheck/${ticket.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Returned', checkOutTime: Date.now() })
        });
      } catch (e) {
        console.warn('API update failed');
      }

      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticket.id 
          ? { ...t, status: 'Returned', checkOutTime: Date.now() }
          : t
      ));

      setSuccess(`Articol #${ticket.ticketNumber} returnat!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Eroare la returnare');
    }
  };

  // Get icon for type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Coat': return <Briefcase size={16} />;
      case 'Bag': return <Tag size={16} />;
      case 'Umbrella': return <Umbrella size={16} />;
      case 'Valet Key': return <Car size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const activeTickets = tickets.filter(t => t.status === 'Stored');
  const historyTickets = tickets
    .filter(t => t.status === 'Returned')
    .sort((a, b) => (b.checkOutTime || 0) - (a.checkOutTime || 0));

  if (loading) {
    return (
      <div className="coatcheck-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="coatcheck-page">
      {/* Header */}
      <div className="coatcheck-header">
        <div className="coatcheck-header__left">
          <h1 className="coatcheck-title">
            <Tag className="coatcheck-title-icon" />
            Garderobă & Valet
          </h1>
          <p className="coatcheck-subtitle">Gestionare haine, bagaje și chei mașină</p>
        </div>
        <div className="coatcheck-header__right">
          <div className="coatcheck-tabs">
            <Button 
              variant={activeTab === 'stored' ? 'warning' : 'outline-secondary'}
              onClick={() => setActiveTab('stored')}
            >
              Active ({activeTickets.length})
            </Button>
            <Button 
              variant={activeTab === 'history' ? 'warning' : 'outline-secondary'}
              onClick={() => setActiveTab('history')}
            >
              Istoric
            </Button>
          </div>
          <Button variant="success" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="me-1" /> Check-In
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <CheckCircle size={18} className="me-2" /> {success}
        </Alert>
      )}

      {/* Active Tickets Grid */}
      {activeTab === 'stored' && (
        <div className="coatcheck-grid">
          {activeTickets.length === 0 ? (
            <div className="coatcheck-empty">
              <Tag size={64} />
              <h3>Garderoba este goală</h3>
              <p>Niciun articol înregistrat</p>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <Card key={ticket.id} className="coatcheck-card">
                <Card.Body>
                  <div className="coatcheck-card__number">
                    {ticket.ticketNumber}
                  </div>
                  
                  <div className="coatcheck-card__type">
                    {getTypeIcon(ticket.type)}
                    <span>{ticket.type}</span>
                  </div>

                  {ticket.tableId && (
                    <div className="coatcheck-card__table">
                      Masa {ticket.tableId}
                    </div>
                  )}

                  {ticket.guestName && (
                    <div className="coatcheck-card__guest">
                      <User size={14} />
                      <span>{ticket.guestName}</span>
                    </div>
                  )}

                  {ticket.location && (
                    <Badge bg="warning" className="coatcheck-card__location">
                      Loc: {ticket.location}
                    </Badge>
                  )}

                  <div className="coatcheck-card__time">
                    <Clock size={12} />
                    <span>
                      {new Date(ticket.checkInTime).toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <Button 
                    variant="outline-success"
                    className="coatcheck-card__return"
                    onClick={() => handleReturn(ticket)}
                  >
                    <ArrowUpRight size={16} /> Returnează
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}

      {/* History Table */}
      {activeTab === 'history' && (
        <Card className="coatcheck-history">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Nr.</th>
                  <th>Tip</th>
                  <th>Client / Masă</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Durată</th>
                </tr>
              </thead>
              <tbody>
                {historyTickets.map((ticket) => {
                  const duration = ticket.checkOutTime && ticket.checkInTime
                    ? Math.round((ticket.checkOutTime - ticket.checkInTime) / 60000)
                    : 0;
                  
                  return (
                    <tr key={ticket.id}>
                      <td>
                        <strong className="text-primary">#{ticket.ticketNumber}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getTypeIcon(ticket.type)}
                          {ticket.type}
                        </div>
                      </td>
                      <td>
                        {ticket.guestName || '-'}
                        {ticket.tableId && <small className="text-muted ms-2">(Masa {ticket.tableId})</small>}
                      </td>
                      <td>
                        {new Date(ticket.checkInTime).toLocaleTimeString('ro-RO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="text-success fw-bold">
                        {ticket.checkOutTime && new Date(ticket.checkOutTime).toLocaleTimeString('ro-RO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <Badge bg="secondary">{duration} min</Badge>
                      </td>
                    </tr>
                  );
                })}
                {historyTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Niciun articol returnat
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Check-In Modal */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <Plus size={24} className="me-2" />
            Check-In Articol
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row mb-3">
              <div className="col-6">
                <Form.Label className="text-muted small text-uppercase">Număr Tichet</Form.Label>
                <Form.Control
                  type="number"
                  value={newTicket.ticketNumber}
                  onChange={(e) => setNewTicket({ ...newTicket, ticketNumber: parseInt(e.target.value) })}
                  className="fw-bold fs-4"
                />
              </div>
              <div className="col-6">
                <Form.Label className="text-muted small text-uppercase">Tip</Form.Label>
                <Form.Select
                  value={newTicket.type}
                  onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                >
                  <option value="Coat">Haină / Palton</option>
                  <option value="Bag">Geantă / Bagaj</option>
                  <option value="Umbrella">Umbrelă</option>
                  <option value="Valet Key">Cheie Valet</option>
                </Form.Select>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase">Locație Depozitare</Form.Label>
              <Form.Control
                type="text"
                placeholder="ex: Cuier A-3, Raft B-2"
                value={newTicket.location}
                onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
              />
            </Form.Group>

            <div className="row mb-3">
              <div className="col-6">
                <Form.Label className="text-muted small text-uppercase">Masă (opțional)</Form.Label>
                <Form.Select
                  value={newTicket.tableId || ''}
                  onChange={(e) => setNewTicket({ ...newTicket, tableId: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">--</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>Masa {t.id}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-6">
                <Form.Label className="text-muted small text-uppercase">Nume Client</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nume client"
                  value={newTicket.guestName}
                  onChange={(e) => setNewTicket({ ...newTicket, guestName: e.target.value })}
                />
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Anulează
          </Button>
          <Button variant="success" onClick={handleCheckIn}>
            <CheckCircle size={18} className="me-1" /> Check-In
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KioskCoatCheckPage;

