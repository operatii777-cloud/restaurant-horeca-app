import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Form, Table, Alert } from 'react-bootstrap';
import { 
  Search, Plus, UserCheck, Clock, MapPin, 
  CheckCircle, AlertCircle, User, FileText, Eye
} from 'lucide-react';
import './KioskLostFoundPage.css';

/**
 * KioskLostFoundPage - Lost & Found Registry
 * Evidență obiecte pierdute și găsite
 * Features:
 * - Înregistrare obiecte găsite
 * - Revendicare cu confirmare
 * - Căutare și filtrare
 * - Istoric complet
 */
export const KioskLostFoundPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [newItem, setNewItem] = useState({
    description: '',
    locationFound: '',
    foundBy: '',
    dateFound: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [claimInfo, setClaimInfo] = useState({
    claimedBy: '',
    phone: '',
    idDocument: ''
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      let itemsData = [];
      
      try {
        const res = await fetch('/api/lostfound');
        if (res.ok) {
          itemsData = await res.json();
          itemsData = Array.isArray(itemsData) ? itemsData : itemsData.items || [];
        }
      } catch (e) {
        console.warn('Could not load lost&found data:', e);
      }

      // Mock data if empty
      if (itemsData.length === 0) {
        itemsData = [
          { 
            id: '1', 
            description: 'iPhone 14 Pro Negru', 
            locationFound: 'Sub Masa 5', 
            foundBy: 'Alexandru (Ospătar)', 
            dateFound: new Date(Date.now() - 86400000).toISOString(), 
            status: 'Found',
            notes: 'Ecran intact, husă neagră'
          },
          { 
            id: '2', 
            description: 'Portofel maro din piele', 
            locationFound: 'Toaletă Bărbați', 
            foundBy: 'Maria (Cleaning)', 
            dateFound: new Date(Date.now() - 172800000).toISOString(), 
            status: 'Found',
            notes: 'Conține carduri și bani'
          },
          { 
            id: '3', 
            description: 'Ochelari de vedere Ray-Ban', 
            locationFound: 'Bar', 
            foundBy: 'Ion (Barman)', 
            dateFound: new Date(Date.now() - 259200000).toISOString(), 
            status: 'Claimed',
            claimedBy: 'Andrei Popescu',
            claimDate: new Date(Date.now() - 172800000).toISOString()
          },
          { 
            id: '4', 
            description: 'Eșarfă roșie de mătase', 
            locationFound: 'Garderobă', 
            foundBy: 'Elena (Hostess)', 
            dateFound: new Date(Date.now() - 432000000).toISOString(), 
            status: 'Found',
            notes: ''
          },
          { 
            id: '5', 
            description: 'Căști AirPods Pro', 
            locationFound: 'Terasă - Masa 12', 
            foundBy: 'Dan (Ospătar)', 
            dateFound: new Date(Date.now() - 604800000).toISOString(), 
            status: 'Disposed',
            notes: 'Termen expirat (30 zile), donat'
          },
        ];
      }

      setItems(itemsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter items
  useEffect(() => {
    let filtered = [...items];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.description?.toLowerCase().includes(term) ||
        item.locationFound?.toLowerCase().includes(term) ||
        item.foundBy?.toLowerCase().includes(term)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound));
    
    setFilteredItems(filtered);
  }, [items, searchTerm, filterStatus]);

  // Handle register new item
  const handleRegister = async () => {
    if (!newItem.description || !newItem.locationFound) {
      setError('Descrierea și locația sunt obligatorii');
      return;
    }

    try {
      const item = {
        id: Date.now().toString(),
        description: newItem.description,
        locationFound: newItem.locationFound,
        foundBy: newItem.foundBy || 'Staff',
        dateFound: newItem.dateFound || new Date().toISOString(),
        status: 'Found',
        notes: newItem.notes || ''
      };

      // Try API
      try {
        await fetch('/api/lostfound', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (e) {
        console.warn('API save failed');
      }

      setItems(prev => [...prev, item]);
      setSuccess('Obiect înregistrat cu succes!');
      setIsModalOpen(false);
      setNewItem({
        description: '',
        locationFound: '',
        foundBy: '',
        dateFound: new Date().toISOString().split('T')[0],
        notes: ''
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Eroare la înregistrare');
    }
  };

  // Handle claim
  const handleClaim = async () => {
    if (!claimInfo.claimedBy) {
      setError('Numele persoanei este obligatoriu');
      return;
    }

    try {
      const updatedItem = {
        ...selectedItem,
        status: 'Claimed',
        claimedBy: claimInfo.claimedBy,
        claimPhone: claimInfo.phone,
        claimIdDocument: claimInfo.idDocument,
        claimDate: new Date().toISOString()
      };

      // Try API
      try {
        await fetch(`/api/lostfound/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
      } catch (e) {
        console.warn('API update failed');
      }

      setItems(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
      setSuccess(`Obiect revendicat de ${claimInfo.claimedBy}!`);
      setIsClaimModalOpen(false);
      setSelectedItem(null);
      setClaimInfo({ claimedBy: '', phone: '', idDocument: '' });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Eroare la revendicare');
    }
  };

  // Open claim modal
  const openClaimModal = (item) => {
    setSelectedItem(item);
    setIsClaimModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Found':
        return <Badge bg="warning" className="status-badge"><AlertCircle size={12} /> Găsit</Badge>;
      case 'Claimed':
        return <Badge bg="success" className="status-badge"><CheckCircle size={12} /> Revendicat</Badge>;
      case 'Disposed':
        return <Badge bg="secondary" className="status-badge">Eliminat</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Get days since found
  const getDaysSince = (dateFound) => {
    const days = Math.floor((Date.now() - new Date(dateFound).getTime()) / 86400000);
    if (days === 0) return 'Azi';
    if (days === 1) return 'Ieri';
    return `${days} zile`;
  };

  if (loading) {
    return (
      <div className="lostfound-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  const foundCount = items.filter(i => i.status === 'Found').length;
  const claimedCount = items.filter(i => i.status === 'Claimed').length;

  return (
    <div className="lostfound-page">
      {/* Header */}
      <div className="lostfound-header">
        <div className="lostfound-header__left">
          <h1 className="lostfound-title">
            <Search className="lostfound-title-icon" />
            Lost & Found Registry
          </h1>
          <p className="lostfound-subtitle">Evidență obiecte pierdute și găsite</p>
        </div>
        <div className="lostfound-header__right">
          <Button variant="dark" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="me-1" /> Raportează Obiect
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="lostfound-stats">
        <Card className="lostfound-stat lostfound-stat--found">
          <Card.Body>
            <div className="lostfound-stat__icon"><AlertCircle /></div>
            <div className="lostfound-stat__content">
              <div className="lostfound-stat__value">{foundCount}</div>
              <div className="lostfound-stat__label">În așteptare</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="lostfound-stat lostfound-stat--claimed">
          <Card.Body>
            <div className="lostfound-stat__icon"><UserCheck /></div>
            <div className="lostfound-stat__content">
              <div className="lostfound-stat__value">{claimedCount}</div>
              <div className="lostfound-stat__label">Revendicate</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="lostfound-stat lostfound-stat--total">
          <Card.Body>
            <div className="lostfound-stat__icon"><FileText /></div>
            <div className="lostfound-stat__content">
              <div className="lostfound-stat__value">{items.length}</div>
              <div className="lostfound-stat__label">Total</div>
            </div>
          </Card.Body>
        </Card>
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

      {/* Filters */}
      <div className="lostfound-filters">
        <div className="lostfound-search">
          <Search size={18} />
          <Form.Control
            type="text"
            placeholder="Caută după descriere, locație..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lostfound-filter-btns">
          <Button 
            variant={filterStatus === 'all' ? 'dark' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Toate
          </Button>
          <Button 
            variant={filterStatus === 'Found' ? 'warning' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilterStatus('Found')}
          >
            Găsite
          </Button>
          <Button 
            variant={filterStatus === 'Claimed' ? 'success' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilterStatus('Claimed')}
          >
            Revendicate
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <Card className="lostfound-table-card">
        <Card.Body className="p-0">
          <Table responsive hover className="lostfound-table mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descriere Obiect</th>
                <th>Găsit În</th>
                <th>Găsit De</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={item.status === 'Found' ? 'table-warning-light' : ''}>
                  <td>
                    <div className="lostfound-date">
                      <span className="lostfound-date__main">
                        {new Date(item.dateFound).toLocaleDateString('ro-RO')}
                      </span>
                      <span className="lostfound-date__ago">
                        {getDaysSince(item.dateFound)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="lostfound-desc">
                      <strong>{item.description}</strong>
                      {item.notes && (
                        <small className="lostfound-desc__notes">{item.notes}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <MapPin size={14} className="text-muted" />
                      {item.locationFound}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <User size={14} className="text-muted" />
                      {item.foundBy}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(item.status)}
                    {item.claimedBy && (
                      <small className="d-block text-success mt-1">
                        → {item.claimedBy}
                      </small>
                    )}
                  </td>
                  <td>
                    {item.status === 'Found' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => openClaimModal(item)}
                      >
                        <UserCheck size={14} className="me-1" /> Revendicare
                      </Button>
                    )}
                    {item.status === 'Claimed' && (
                      <Button variant="outline-secondary" size="sm" disabled>
                        <CheckCircle size={14} className="me-1" /> Finalizat
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Niciun obiect găsit
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Register Modal */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            <Plus size={24} className="me-2" />
            Înregistrare Obiect Găsit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase fw-bold">
                Descriere *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="ex: Telefon iPhone Negru, Portofel maro din piele"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </Form.Group>

            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Label className="text-muted small text-uppercase fw-bold">
                  Locație *
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ex: Sub Masa 5, Toaletă"
                  value={newItem.locationFound}
                  onChange={(e) => setNewItem({ ...newItem, locationFound: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <Form.Label className="text-muted small text-uppercase fw-bold">
                  Data
                </Form.Label>
                <Form.Control
                  type="date"
                  value={newItem.dateFound}
                  onChange={(e) => setNewItem({ ...newItem, dateFound: e.target.value })}
                />
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase fw-bold">
                Găsit De (Staff)
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nume angajat"
                value={newItem.foundBy}
                onChange={(e) => setNewItem({ ...newItem, foundBy: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase fw-bold">
                Note / Detalii
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Detalii suplimentare (stare, conținut, etc.)"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Anulează
          </Button>
          <Button variant="dark" onClick={handleRegister}>
            <CheckCircle size={18} className="me-1" /> Înregistrează
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Claim Modal */}
      <Modal show={isClaimModalOpen} onHide={() => setIsClaimModalOpen(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <UserCheck size={24} className="me-2" />
            Revendicare Obiect
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Alert variant="info" className="mb-3">
              <strong>Obiect:</strong> {selectedItem.description}
              <br />
              <small>Găsit în: {selectedItem.locationFound}</small>
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase fw-bold">
                Nume persoană care revendică *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nume complet"
                value={claimInfo.claimedBy}
                onChange={(e) => setClaimInfo({ ...claimInfo, claimedBy: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase fw-bold">
                Telefon (opțional)
              </Form.Label>
              <Form.Control
                type="tel"
                placeholder="07xx xxx xxx"
                value={claimInfo.phone}
                onChange={(e) => setClaimInfo({ ...claimInfo, phone: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small text-uppercase fw-bold">
                Document Identitate (opțional)
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Serie și număr CI"
                value={claimInfo.idDocument}
                onChange={(e) => setClaimInfo({ ...claimInfo, idDocument: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsClaimModalOpen(false)}>
            Anulează
          </Button>
          <Button variant="primary" onClick={handleClaim}>
            <CheckCircle size={18} className="me-1" /> Confirmă Revendicare
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KioskLostFoundPage;

