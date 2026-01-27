// import { useTranslation } from '@/i18n/I18nContext';
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
  titlu: string;
  minim: number;
  maxim: number;
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
  product_id: number;
  product_name: string;
  product_name_full?: string;
  product_base_price?: number;
  disponibilitate: number;
  pret1: number;
  pret2: number;
  pret3: number;
  pret4: number;
  is_active: number;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  name_en?: string;
  price: number;
  category?: string;
  description?: string;
}

const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'select', label: 'Select', icon: '📋' },
  { value: 'number', label: 'Număr', icon: '🔢' },
  { value: 'boolean', label: 'Boolean (Da/Nu)', icon: '✅' },
  { value: 'date', label: 'Dată', icon: '📅' },
];

export const AttributeGroupsPage: React.FC = () => {
//   const { t } = useTranslation();
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
    titlu: '',
    minim: 0,
    maxim: 1,
    type: 'select',
    description: '',
    is_active: 1,
    sort_order: 0,
  });

  const [attributeFormData, setAttributeFormData] = useState<Partial<Attribute>>({
    product_id: 0,
    product_name: '',
    disponibilitate: 1,
    pret1: 0,
    pret2: 0,
    pret3: 0,
    pret4: 0,
    is_active: 1,
    sort_order: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
        titlu: '',
        minim: 0,
        maxim: 1,
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
    if (!groupFormData.name || !groupFormData.titlu) {
      setFeedback({ type: 'error', message: 'Nume și titlu sunt obligatorii!' });
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

  const handleSearchProducts = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await httpClient.get(`/api/admin/attribute-groups/search/products?query=${encodeURIComponent(query)}`);
      const products = response.data?.data || [];
      setSearchResults(products);
    } catch (err: any) {
      console.error('❌ Eroare la căutare produse:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setAttributeFormData({
      ...attributeFormData,
      product_id: product.id,
      product_name: product.name,
    });
    setSearchQuery(product.name);
    setSearchResults([]);
  };

  const handleDeleteGroup = async (id: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest grup de atribute? Toate atributele din grup vor fi șterse!')) return;

    try {
      await httpClient.delete(`/api/admin/attribute-groups/"Id"`);
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
      setSelectedProduct({
        id: attribute.product_id,
        name: attribute.product_name,
        price: attribute.product_base_price || 0,
      });
      setSearchQuery(attribute.product_name);
    } else {
      if (!selectedGroup?.id) {
        setFeedback({ type: 'error', message: 'Selectează mai întâi un grup!' });
        return;
      }
      setEditingAttribute(null);
      setAttributeFormData({
        group_id: selectedGroup.id,
        product_id: 0,
        product_name: '',
        disponibilitate: 1,
        pret1: 0,
        pret2: 0,
        pret3: 0,
        pret4: 0,
        is_active: 1,
        sort_order: 0,
      });
      setSelectedProduct(null);
      setSearchQuery('');
    }
    setShowAttributeModal(true);
    setFeedback(null);
  };

  const handleCloseAttributeModal = () => {
    setShowAttributeModal(false);
    setEditingAttribute(null);
    setFeedback(null);
    setSelectedProduct(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAttributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !attributeFormData.product_id) {
      setFeedback({ type: 'error', message: 'Selectează un produs!' });
      return;
    }

    if (!selectedGroup?.id) {
      setFeedback({ type: 'error', message: 'Selectează un grup!' });
      return;
    }

    try {
      if (editingAttribute?.id) {
        await httpClient.put(`/api/admin/attributes/${editingAttribute.id}`, attributeFormData);
        setFeedback({ type: 'success', message: 'Atribut actualizat cu succes!' });
      } else {
        await httpClient.post(`/api/admin/attribute-groups/${selectedGroup.id}/atribute`, {
          productId: attributeFormData.product_id,
          disponibilitate: attributeFormData.disponibilitate,
          pret1: attributeFormData.pret1 || 0,
          pret2: attributeFormData.pret2 || 0,
          pret3: attributeFormData.pret3 || 0,
          pret4: attributeFormData.pret4 || 0,
        });
        setFeedback({ type: 'success', message: 'Atribut creat cu succes!' });
      }
      setTimeout(() => {
        handleCloseAttributeModal();
        setSelectedProduct(null);
        setSearchQuery('');
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
      if (selectedGroup?.id) {
        await httpClient.delete(`/api/admin/attribute-groups/${selectedGroup.id}/atribute/"Id"`);
      } else {
        await httpClient.delete(`/api/admin/attributes/"Id"`);
      }
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
                <i className="fas fa-plus me-1"></i>"adauga grup"</Button>
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
                  <i className="fas fa-info-circle me-2"></i>"nu exista grupuri de atribute adauga primul grup"</Alert>
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
                        <th>"Acțiuni"</th>
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
                            <td>
                              <strong>{group.name}</strong>
                              {group.titlu && group.titlu !== group.name && (
                                <div className="text-muted small">{group.titlu}</div>
                              )}
                            </td>
                            <td>
                              <Badge bg="info">
                                {getTypeIcon(group.type)} {getTypeLabel(group.type)}
                              </Badge>
                              <div className="small text-muted mt-1">
                                Min: {group.minim ?? 0} | Max: {group.maxim ?? 1}
                              </div>
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
                    <i className="fas fa-plus me-1"></i>"adauga atribut"</Button>
                </div>
              </Card.Header>
              <Card.Body>
                {selectedGroup.attributes && selectedGroup.attributes.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>"nu exista atribute in acest grup adauga primul atr"</Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Disponibilitate</th>
                          <th>Preț 1 (Sala)</th>
                          <th>Preț 2 (Glovo)</th>
                          <th>Preț 3 (Tazz)</th>
                          <th>Preț 4 (Bolt)</th>
                          <th>"Acțiuni"</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroup.attributes
                          ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                          .map((attr) => (
                            <tr key={attr.id}>
                              <td>
                                <strong>{attr.product_name || attr.product_name_full}</strong>
                                {attr.product_base_price !== undefined && (
                                  <div className="text-muted small">
                                    Preț bază: {attr.product_base_price.toFixed(2)} RON
                                  </div>
                                )}
                              </td>
                              <td>
                                {attr.disponibilitate === 1 ? (
                                  <Badge bg="success">Disponibil</Badge>
                                ) : (
                                  <Badge bg="secondary">Indisponibil</Badge>
                                )}
                              </td>
                              <td>{attr.pret1 > 0 ? `${attr.pret1.toFixed(2)} RON` : '-'}</td>
                              <td>{attr.pret2 > 0 ? `${attr.pret2.toFixed(2)} RON` : '-'}</td>
                              <td>{attr.pret3 > 0 ? `${attr.pret3.toFixed(2)} RON` : '-'}</td>
                              <td>{attr.pret4 > 0 ? `${attr.pret4.toFixed(2)} RON` : '-'}</td>
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
      <Modal show={showGroupModal} onHide={handleCloseGroupModal} size="lg" className="attribute-groups-modal">
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
              <Form.Label>"nume grup"<span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={groupFormData.name || ''}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                placeholder="ex dimensiuni culori optiuni"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Titlu <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={groupFormData.titlu || ''}
                onChange={(e) => setGroupFormData({ ...groupFormData, titlu: e.target.value })}
                placeholder="titlul afisat in interfata"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Minim (selecții obligatorii) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={groupFormData.minim ?? 0}
                    onChange={(e) => setGroupFormData({
                      ...groupFormData,
                      minim: parseInt(e.target.value) || 0
                    })}
                    required
                  />
                  <Form.Text className="text-muted">"numar minim de atribute ce trebuie selectate"</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Maxim (selecții maxime) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={groupFormData.maxim ?? 1}
                    onChange={(e) => setGroupFormData({
                      ...groupFormData,
                      maxim: parseInt(e.target.value) || 1
                    })}
                    required
                  />
                  <Form.Text className="text-muted">"numar maxim de atribute ce pot fi selectate"</Form.Text>
                </Form.Group>
              </Col>
            </Row>

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
                placeholder="descriere optionala pentru grup"
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
            <Button variant="secondary" onClick={handleCloseGroupModal}>"Anulează"</Button>
            <Button variant="primary" type="submit">
              {editingGroup ? 'Salvează Modificările' : 'Creează Grup'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal pentru Atribut */}
      <Modal show={showAttributeModal} onHide={handleCloseAttributeModal} size="lg">
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

            {/* Căutare Produs */}
            <Form.Group className="mb-3">
              <Form.Label>
                Caută Produs <span className="text-danger">*</span>
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    if (query.length >= 2) {
                      void handleSearchProducts(query);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  placeholder="introdu numele produsului"
                  required
                />
                {searching && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">"Caută..."</span>
                    </div>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: "Auto" }}>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${selectedProduct?.id === product.id ? 'active' : ''}`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div>
                          <strong>{product.name}</strong>
                          {product.name_en && <small className="text-muted ms-2">({product.name_en})</small>}
                        </div>
                        <small className="text-muted">{product.price.toFixed(2)} RON</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedProduct && (
                <Alert variant="success" className="mt-2 mb-0">
                  <i className="fas fa-check me-2"></i>
                  Produs selectat: <strong>{selectedProduct.name}</strong> ({selectedProduct.price.toFixed(2)} RON)
                </Alert>
              )}
            </Form.Group>

            {/* Disponibilitate */}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Disponibil"
                checked={attributeFormData.disponibilitate === 1}
                onChange={(e) => setAttributeFormData({
                  ...attributeFormData,
                  disponibilitate: e.target.checked ? 1 : 0
                })}
              />
            </Form.Group>

            {/* Prețuri Multiple */}
            <div className="mb-3">
              <h6>"preturi per platforma"</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preț 1 - Sala (RON)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={attributeFormData.pret1 || 0}
                      onChange={(e) => setAttributeFormData({
                        ...attributeFormData,
                        pret1: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preț 2 - Glovo (RON)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={attributeFormData.pret2 || 0}
                      onChange={(e) => setAttributeFormData({
                        ...attributeFormData,
                        pret2: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preț 3 - Tazz (RON)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={attributeFormData.pret3 || 0}
                      onChange={(e) => setAttributeFormData({
                        ...attributeFormData,
                        pret3: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preț 4 - Bolt Food (RON)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={attributeFormData.pret4 || 0}
                      onChange={(e) => setAttributeFormData({
                        ...attributeFormData,
                        pret4: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAttributeModal}>"Anulează"</Button>
            <Button variant="primary" type="submit" disabled={!selectedProduct}>
              {editingAttribute ? 'Salvează' : 'Creează Atribut'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};




