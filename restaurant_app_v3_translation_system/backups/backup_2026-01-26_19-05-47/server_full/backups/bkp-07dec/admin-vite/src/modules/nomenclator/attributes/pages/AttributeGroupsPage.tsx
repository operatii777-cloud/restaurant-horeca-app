import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Badge, Row, Col, Table, Tabs, Tab } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AttributeGroupsPage.css';

interface AttributeGroup {
  id?: number;
  name: string;
  type: 'text' | 'select' | 'number' | 'boolean' | 'date';
  description?: string | null;
  is_active: number;
  sort_order: number;
  attributes_count?: number;
  attributes?: Attribute[];
}

interface Attribute {
  id?: number;
  group_id: number;
  name: string;
  default_value?: string | null;
  extra_price: number;
  is_active: number;
  sort_order: number;
}

const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'select', label: 'Select', icon: '📋' },
  { value: 'number', label: 'Număr', icon: '🔢' },
  { value: 'boolean', label: 'Boolean (Da/Nu)', icon: '✅' },
  { value: 'date', label: 'Dată', icon: '📅' },
];

export const AttributeGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AttributeGroup | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AttributeGroup | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [groupFormData, setGroupFormData] = useState<Partial<AttributeGroup>>({
    name: '',
    type: 'select',
    description: '',
    is_active: 1,
    sort_order: 0,
  });

  const [attributeFormData, setAttributeFormData] = useState<Partial<Attribute>>({
    name: '',
    default_value: '',
    extra_price: 0,
    is_active: 1,
    sort_order: 0,
  });

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/admin/attribute-groups');
      const data = response.data?.data || response.data || [];
      setGroups(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea grupurilor:', err);
      setError(err.message || 'Eroare la încărcarea grupurilor');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroupDetails = useCallback(async (groupId: number) => {
    try {
      const response = await httpClient.get(`/api/admin/attribute-groups/${groupId}`);
      const data = response.data?.data || response.data;
      setSelectedGroup(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea detaliilor grupului:', err);
    }
  }, []);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  const handleOpenGroupModal = (group?: AttributeGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData(group);
    } else {
      setEditingGroup(null);
      setGroupFormData({
        name: '',
        type: 'select',
        description: '',
        is_active: 1,
        sort_order: 0,
      });
    }
    setShowGroupModal(true);
    setFeedback(null);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setEditingGroup(null);
    setFeedback(null);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name || !groupFormData.type) {
      setFeedback({ type: 'error', message: 'Nume și tip sunt obligatorii!' });
      return;
    }

    try {
      if (editingGroup?.id) {
        await httpClient.put(`/api/admin/attribute-groups/${editingGroup.id}`, groupFormData);
        setFeedback({ type: 'success', message: 'Grup actualizat cu succes!' });
      } else {
        await httpClient.post('/api/admin/attribute-groups', groupFormData);
        setFeedback({ type: 'success', message: 'Grup creat cu succes!' });
      }
      setTimeout(() => {
        handleCloseGroupModal();
        void fetchGroups();
      }, 1000);
    } catch (err: any) {
      console.error('❌ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err.response?.data?.error || err.message || 'Eroare necunoscută') });
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest grup de atribute? Toate atributele din grup vor fi șterse!')) return;

    try {
      await httpClient.delete(`/api/admin/attribute-groups/${id}`);
      setFeedback({ type: 'success', message: 'Grup șters cu succes!' });
      void fetchGroups();
    } catch (err: any) {
      console.error('❌ Eroare la ștergere:', err);
      setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err.response?.data?.error || err.message || 'Eroare necunoscută') });
    }
  };

  const handleOpenAttributeModal = (attribute?: Attribute) => {
    if (attribute) {
      setEditingAttribute(attribute);
      setAttributeFormData(attribute);
    } else {
      if (!selectedGroup?.id) {
        setFeedback({ type: 'error', message: 'Selectează mai întâi un grup!' });
        return;
      }
      setEditingAttribute(null);
      setAttributeFormData({
        group_id: selectedGroup.id,
        name: '',
        default_value: '',
        extra_price: 0,
        is_active: 1,
        sort_order: 0,
      });
    }
    setShowAttributeModal(true);
    setFeedback(null);
  };

  const handleCloseAttributeModal = () => {
    setShowAttributeModal(false);
    setEditingAttribute(null);
    setFeedback(null);
  };

  const handleAttributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attributeFormData.name || !attributeFormData.group_id) {
      setFeedback({ type: 'error', message: 'Nume este obligatoriu!' });
      return;
    }

    try {
      if (editingAttribute?.id) {
        await httpClient.put(`/api/admin/attributes/${editingAttribute.id}`, attributeFormData);
        setFeedback({ type: 'success', message: 'Atribut actualizat cu succes!' });
      } else {
        await httpClient.post('/api/admin/attributes', attributeFormData);
        setFeedback({ type: 'success', message: 'Atribut creat cu succes!' });
      }
      setTimeout(() => {
        handleCloseAttributeModal();
        if (selectedGroup?.id) {
          void fetchGroupDetails(selectedGroup.id);
        }
      }, 1000);
    } catch (err: any) {
      console.error('❌ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err.response?.data?.error || err.message || 'Eroare necunoscută') });
    }
  };

  const handleDeleteAttribute = async (id: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest atribut?')) return;

    try {
      await httpClient.delete(`/api/admin/attributes/${id}`);
      setFeedback({ type: 'success', message: 'Atribut șters cu succes!' });
      if (selectedGroup?.id) {
        void fetchGroupDetails(selectedGroup.id);
      }
    } catch (err: any) {
      console.error('❌ Eroare la ștergere:', err);
      setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err.response?.data?.error || err.message || 'Eroare necunoscută') });
    }
  };

  const getTypeLabel = (type: string) => {
    return ATTRIBUTE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeIcon = (type: string) => {
    return ATTRIBUTE_TYPES.find(t => t.value === type)?.icon || '📦';
  };

  return (
    <div className="attribute-groups-page">
      <PageHeader
        title="🏷️ Grupuri Atribute"
        description="Gestionare grupuri de atribute pentru produse (dimensiuni, culori, opțiuni)"
      />

      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'danger'}
          dismissible
          onClose={() => setFeedback(null)}
          className="mb-4"
        >
          {feedback.message}
        </Alert>
      )}

      <Row>
        <Col md={selectedGroup ? 6 : 12}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-tags me-2"></i>
                Grupuri Atribute
              </h5>
              <Button variant="light" size="sm" onClick={() => handleOpenGroupModal()}>
                <i className="fas fa-plus me-1"></i>
                Adaugă Grup
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              ) : groups.length === 0 ? (
                <Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i>
                  Nu există grupuri de atribute. Adaugă primul grup!
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nume</th>
                        <th>Tip</th>
                        <th>Atribute</th>
                        <th>Ordine</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups
                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                        .map((group) => (
                          <tr
                            key={group.id}
                            className={selectedGroup?.id === group.id ? 'table-primary' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (group.id) {
                                void fetchGroupDetails(group.id);
                              }
                            }}
                          >
                            <td><strong>{group.name}</strong></td>
                            <td>
                              <Badge bg="info">
                                {getTypeIcon(group.type)} {getTypeLabel(group.type)}
                              </Badge>
                            </td>
                            <td>{group.attributes_count || 0}</td>
                            <td>{group.sort_order || 0}</td>
                            <td>
                              {group.is_active === 1 ? (
                                <Badge bg="success">Activ</Badge>
                              ) : (
                                <Badge bg="secondary">Inactiv</Badge>
                              )}
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleOpenGroupModal(group)}
                                  title="Editează"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => group.id && handleDeleteGroup(group.id)}
                                  title="Șterge"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {selectedGroup && (
          <Col md={6}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Atribute: {selectedGroup.name}
                </h5>
                <div>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setSelectedGroup(null)}
                    className="me-2"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => handleOpenAttributeModal()}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Adaugă Atribut
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {selectedGroup.attributes && selectedGroup.attributes.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>
                    Nu există atribute în acest grup. Adaugă primul atribut!
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Nume</th>
                          <th>Valoare Implicită</th>
                          <th>Preț Extra</th>
                          <th>Ordine</th>
                          <th>Status</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroup.attributes
                          ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                          .map((attr) => (
                            <tr key={attr.id}>
                              <td><strong>{attr.name}</strong></td>
                              <td>{attr.default_value || '-'}</td>
                              <td>{attr.extra_price > 0 ? `${attr.extra_price.toFixed(2)} RON` : '-'}</td>
                              <td>{attr.sort_order || 0}</td>
                              <td>
                                {attr.is_active === 1 ? (
                                  <Badge bg="success">Activ</Badge>
                                ) : (
                                  <Badge bg="secondary">Inactiv</Badge>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleOpenAttributeModal(attr)}
                                    title="Editează"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => attr.id && handleDeleteAttribute(attr.id)}
                                    title="Șterge"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Modal pentru Grup */}
      <Modal show={showGroupModal} onHide={handleCloseGroupModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingGroup ? 'Editează Grup Atribute' : 'Adaugă Grup Atribute'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGroupSubmit}>
          <Modal.Body>
            {feedback && (
              <Alert variant={feedback.type === 'success' ? 'success' : 'danger'}>
                {feedback.message}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                Nume Grup <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={groupFormData.name || ''}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                placeholder="Ex: Dimensiuni, Culori, Opțiuni"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Tip Atribut <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={groupFormData.type || 'select'}
                    onChange={(e) => setGroupFormData({ ...groupFormData, type: e.target.value as any })}
                    required
                  >
                    {ATTRIBUTE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ordine Sortare</Form.Label>
                  <Form.Control
                    type="number"
                    value={groupFormData.sort_order || 0}
                    onChange={(e) => setGroupFormData({
                      ...groupFormData,
                      sort_order: parseInt(e.target.value) || 0
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descriere</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={groupFormData.description || ''}
                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                placeholder="Descriere opțională pentru grup"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Grup activ"
                checked={groupFormData.is_active === 1}
                onChange={(e) => setGroupFormData({
                  ...groupFormData,
                  is_active: e.target.checked ? 1 : 0
                })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseGroupModal}>
              Anulează
            </Button>
            <Button variant="primary" type="submit">
              {editingGroup ? 'Salvează Modificările' : 'Creează Grup'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal pentru Atribut */}
      <Modal show={showAttributeModal} onHide={handleCloseAttributeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAttribute ? 'Editează Atribut' : 'Adaugă Atribut'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAttributeSubmit}>
          <Modal.Body>
            {feedback && (
              <Alert variant={feedback.type === 'success' ? 'success' : 'danger'}>
                {feedback.message}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                Nume Atribut <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={attributeFormData.name || ''}
                onChange={(e) => setAttributeFormData({ ...attributeFormData, name: e.target.value })}
                placeholder="Ex: M, L, XL sau Roșu, Verde, Albastru"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valoare Implicită</Form.Label>
                  <Form.Control
                    type="text"
                    value={attributeFormData.default_value || ''}
                    onChange={(e) => setAttributeFormData({
                      ...attributeFormData,
                      default_value: e.target.value
                    })}
                    placeholder="Valoare implicită (opțional)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preț Suplimentar (RON)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={attributeFormData.extra_price || 0}
                    onChange={(e) => setAttributeFormData({
                      ...attributeFormData,
                      extra_price: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ordine Sortare</Form.Label>
                  <Form.Control
                    type="number"
                    value={attributeFormData.sort_order || 0}
                    onChange={(e) => setAttributeFormData({
                      ...attributeFormData,
                      sort_order: parseInt(e.target.value) || 0
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Atribut activ"
                    checked={attributeFormData.is_active === 1}
                    onChange={(e) => setAttributeFormData({
                      ...attributeFormData,
                      is_active: e.target.checked ? 1 : 0
                    })}
                    style={{ marginTop: '2rem' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAttributeModal}>
              Anulează
            </Button>
            <Button variant="primary" type="submit">
              {editingAttribute ? 'Salvează' : 'Creează Atribut'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

