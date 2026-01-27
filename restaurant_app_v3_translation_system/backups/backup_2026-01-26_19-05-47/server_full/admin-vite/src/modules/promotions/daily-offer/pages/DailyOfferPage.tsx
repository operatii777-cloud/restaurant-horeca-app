// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import './DailyOfferPage.css';

interface Condition {
  category: string;
  quantity: number;
}

interface DailyOffer {
  id?: number;
  title: string;
  description: string;
  title_en?: string;
  description_en?: string;
  is_active: boolean;
  conditions: Condition[];
  benefit_type: 'category' | 'specific';
  benefit_category?: string;
  benefit_quantity?: number;
  benefit_products?: any[]; // Pot fi ID-uri sau obiecte de tip Product
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export const DailyOfferPage: React.FC = () => {
//   const { t } = useTranslation();
  const [currentOffer, setCurrentOffer] = useState<DailyOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<DailyOffer>({
    title: '',
    description: '',
    title_en: '',
    description_en: '',
    is_active: false,
    conditions: [{ category: '', quantity: 2 }],
    benefit_type: 'category',
    benefit_category: '',
    benefit_quantity: 1,
    benefit_products: []
  });

  useEffect(() => {
    loadOffer();
    loadProducts();
  }, []);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/daily-offer');
      if (response.ok) {
        const data = await response.json();
        setCurrentOffer(data.offer || null);
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/menu/all');
      if (response.ok) {
        const data = await response.json();
        const menuItems = data.data || [];
        setProducts(menuItems);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(menuItems.map((p: Product) => p.category))].sort();
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleOpenModal = () => {
    if (currentOffer) {
      // NormalizÄƒm produsele de beneficiu pentru a fi doar ID-uri Ã®n formular
      const benefitProductIds = (currentOffer.benefit_products || []).map(p => 
        (p && typeof p === 'object') ? p.id : p
      );

      setFormData({
        ...currentOffer,
        conditions: currentOffer.conditions && currentOffer.conditions.length > 0 
          ? currentOffer.conditions 
          : [{ category: '', quantity: 2 }],
        benefit_products: benefitProductIds
      });
    } else {
      setFormData({
        title: '',
        description: '',
        title_en: '',
        description_en: '',
        is_active: false,
        conditions: [{ category: '', quantity: 2 }],
        benefit_type: 'category',
        benefit_category: '',
        benefit_quantity: 1,
        benefit_products: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { category: '', quantity: 2 }]
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (formData.conditions.length > 1) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter((_, i) => i !== index)
      });
    } else {
      alert('Trebuie sÄƒ existe cel puÈ›in o condiÈ›ie!');
    }
  };

  const handleConditionChange = (index: number, field: 'category' | 'quantity', value: string | number) => {
    const newConditions = [...formData.conditions];
      newConditions[index] = {
        ...newConditions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      conditions: newConditions
    });
  };

  const handleBenefitTypeChange = (type: 'category' | 'specific') => {
    setFormData({
      ...formData,
      benefit_type: type,
      benefit_category: type === 'category' ? formData.benefit_category : '',
      benefit_products: type === 'specific' ? (formData.benefit_products || []) : []
    });
  };

  const handleBenefitProductChange = (index: number, productId: string) => {
    const newProducts = [...(formData.benefit_products || [])];
    while (newProducts.length < 5) {
      newProducts.push(0);
    }
      newProducts[index] = productId ? parseInt(productId, 10) : 0;
    setFormData({
      ...formData,
      benefit_products: newProducts.filter(id => id > 0)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Titlul È™i descrierea sunt obligatorii!');
      return;
    }

    if (formData.conditions.some(c => !c.category || c.quantity <= 0)) {
      alert('Toate condiÈ›iile trebuie sÄƒ aibÄƒ categorie È™i cantitate validÄƒ!');
      return;
    }

    try {
      setSaving(true);
      const offerData = {
        ...formData,
        id: currentOffer?.id,
        conditions: formData.conditions.filter(c => c.category && c.quantity > 0),
        benefit_products: formData.benefit_type === 'specific' 
          ? formData.benefit_products?.filter(id => id > 0) || []
          : []
      };

      const response = await fetch('/api/daily-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Oferta a fost salvatÄƒ cu succes!');
        handleCloseModal();
        loadOffer();
      } else {
        alert(result.error || 'Eroare la salvarea ofertei');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Eroare la salvarea ofertei');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="daily-offer-page">
        <div className="loading">"se incarca"</div>
      </div>
    );
  }

  return (
    <div className="daily-offer-page">
      <div className="page-header">
        <h1>â­ Oferta Zilei</h1>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <span>âž•</span>"configureaza oferta zilei"</button>
          <button className="btn btn-warning" onClick={loadOffer}>
            <span>ðŸ”„</span>"ReÃ®ncarcÄƒ"</button>
        </div>
      </div>

      <div className="daily-offer-container">
        <div className="daily-offer-card">
          <div className="daily-offer-header">
            <h3>Oferta ActivÄƒ</h3>
            <div className="offer-status">
              <span className={`status-indicator ${currentOffer?.is_active ? 'active' : 'inactive'}`}></span>
              <span>{currentOffer?.is_active ? 'ActivÄƒ' : 'InactivÄƒ'}</span>
            </div>
          </div>
          
          <div className="daily-offer-content">
            {currentOffer && currentOffer.is_active ? (
              <div className="offer-details">
                <div className="offer-title">{currentOffer.title}</div>
                <div className="offer-description">{currentOffer.description}</div>
                
                {currentOffer.conditions && currentOffer.conditions.length > 0 && (
                  <div className="offer-conditions">
                    <h4>"conditii pentru oferta"</h4>
                    {currentOffer.conditions.map((condition, index) => (
                      <div key={index} className="condition-item">
                        <span className="condition-category">{condition.category}</span>
                        <span className="condition-quantity">{condition.quantity}x</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="offer-benefits">
                  <h4>Beneficiile Ofertei</h4>
                  {currentOffer.benefit_type === 'category' ? (
                    <div className="benefit-item">
                      <span className="benefit-icon">ðŸŽ</span>
                      <span>
                        {currentOffer.benefit_quantity}x {currentOffer.benefit_category} gratuit
                        {currentOffer.benefit_quantity && currentOffer.benefit_quantity > 1 ? 'e' : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="benefit-item">
                      <span className="benefit-icon">ðŸŽ</span>
                      <span>Produse gratuite disponibile:</span>
                      <div className="free-products-list">
                        {currentOffer.benefit_products && currentOffer.benefit_products.length > 0 ? (
                          currentOffer.benefit_products.map((p, index) => {
                            // GestionÄƒm atÃ¢t ID-uri cÃ¢t È™i obiecte primite de la server
                            const productId = (p && typeof p === 'object') ? p.id : p;
                            const productName = (p && typeof p === 'object') ? p.name : null;
                            const productPrice = (p && typeof p === 'object') ? p.price : null;

                            const product = products.find(prod => prod.id === productId);
                            const displayName = productName || (product ? product.name : `Produs ID: ${productId}`);
                            const displayPrice = productPrice !== null ? productPrice : (product ? product.price : 0);

                            return (
                              <span key={index} className="free-product-tag">
                                {displayName} - {displayPrice.toFixed(2)} RON
                              </span>
                            );
                          })
                        ) : (
                          <span className="no-products">"nu sunt produse configurate"</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-offer">
                <div className="no-offer-icon">ðŸ“‹</div>
                <h3>"nu exista oferta activa"</h3>
                <p>"configureaza o oferta zilnica pentru a atrage clie"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pentru configurare */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>"configureaza oferta zilei"</h2>
              <span className="close" onClick={handleCloseModal}>&times;</span>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Titlu (RO): *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  title="Titlu Ã®n romÃ¢nÄƒ"
                />
              </div>

              <div className="form-group">
                <label>Descriere (RO): *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  title="Descriere Ã®n romÃ¢nÄƒ"
                />
              </div>

              <div className="form-group">
                <label>Titlu (EN):</label>
                <input
                  type="text"
                  value={formData.title_en || ''}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  title="Titlu Ã®n englezÄƒ"
                />
              </div>

              <div className="form-group">
                <label>Descriere (EN):</label>
                <textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  title="Descriere Ã®n englezÄƒ"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />"oferta activa"</label>
              </div>

              {/* CondiÈ›ii */}
              <div className="offer-conditions-section">
                <h4>"conditii pentru oferta"</h4>
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="condition-item">
                    <select
                      className="category-select"
                      value={condition.category}
                      onChange={(e) => handleConditionChange(index, 'category', e.target.value)}
                      required
                      title="SelecteazÄƒ categoria"
                    >
                      <option value="">"selecteaza categoria"</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="quantity-input"
                      min="1"
                      placeholder="Cantitate"
                      value={condition.quantity}
                      onChange={(e) => handleConditionChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                      required
                      title="Cantitate minimÄƒ"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveCondition(index)}
                    >"È˜terge"</button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleAddCondition}
                >
                  âž• AdaugÄƒ CondiÈ›ie
                </button>
              </div>

              {/* Beneficii */}
              <div className="offer-benefits-section">
                <h4>Beneficiile Ofertei</h4>
                <div className="form-group">
                  <label>Tip Beneficiu: *</label>
                  <select
                    value={formData.benefit_type}
                    onChange={(e) => handleBenefitTypeChange(e.target.value as 'category' | 'specific')}
                    required
                    title="Tip beneficiu"
                  >
                    <option value="category">Categorie</option>
                    <option value="specific">"produse specifice"</option>
                  </select>
                </div>

                {formData.benefit_type === 'category' ? (
                  <div id="categoryBenefit">
                    <div className="form-group">
                      <label>Categorie Beneficiu: *</label>
                      <select
                        value={formData.benefit_category || ''}
                        onChange={(e) => setFormData({ ...formData, benefit_category: e.target.value })}
                        required
                        title="Categorie beneficiu"
                      >
                        <option value="">"selecteaza categoria"</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cantitate: *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.benefit_quantity || 1}
                        onChange={(e) => setFormData({ ...formData, benefit_quantity: parseInt(e.target.value, 10) || 1 })}
                        required
                        title="Cantitate beneficiu"
                      />
                    </div>
                  </div>
                ) : (
                  <div id="specificBenefit">
                    <div className="form-group">
                      <label>Produse Gratuite (selecteazÄƒ pÃ¢nÄƒ la 5):</label>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="form-group">
                          <label>Produs Gratuit {num}:</label>
                          <select
                            value={formData.benefit_products?.[num - 1] || ''}
                            onChange={(e) => handleBenefitProductChange(num - 1, e.target.value)}
                            title={`Produs gratuit ${num}`}
                          >
                            <option value="">-- SelecteazÄƒ produsul gratuit --</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.price.toFixed(2)} RON
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>"AnuleazÄƒ"</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Se salveazÄƒ...' : 'ðŸ’¾ SalveazÄƒ Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};





