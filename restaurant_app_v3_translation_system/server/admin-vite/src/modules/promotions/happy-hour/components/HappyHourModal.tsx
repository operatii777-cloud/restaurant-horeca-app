// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import type { HappyHour } from '../api/happyHourApi';
import { happyHourApi, type Product, type Category } from '../api/happyHourApi';
import 'bootstrap/dist/css/bootstrap.min.css';

interface HappyHourModalProps {
  show: boolean;
  happyHour: HappyHour | null;
  onClose: () => void;
  onSave: (data: Omit<HappyHour, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const HappyHourModal = ({ show, happyHour, onClose, onSave }: HappyHourModalProps) => {
//   const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    days_of_week: [] as string[],
    discount_percentage: 0,
    discount_fixed: 0,
    applicable_categories: [] as string[],
    applicable_products: [] as string[],
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (show) {
      // Load products and categories when modal opens
      loadProductsAndCategories();
    }
    
    if (happyHour) {
      const days = typeof happyHour.days_of_week === 'string' 
        ? JSON.parse(happyHour.days_of_week || '[]') 
        : happyHour.days_of_week || [];
      const categories = typeof happyHour.applicable_categories === 'string'
        ? JSON.parse(happyHour.applicable_categories || '[]')
        : happyHour.applicable_categories || [];
      const products = typeof happyHour.applicable_products === 'string'
        ? JSON.parse(happyHour.applicable_products || '[]')
        : happyHour.applicable_products || [];

      setFormData({
        name: happyHour.name || '',
        start_time: happyHour.start_time || '',
        end_time: happyHour.end_time || '',
        days_of_week: Array.isArray(days) ? days : [],
        discount_percentage: happyHour.discount_percentage || 0,
        discount_fixed: happyHour.discount_fixed || 0,
        applicable_categories: Array.isArray(categories) ? categories : [],
        applicable_products: Array.isArray(products) ? products : [],
        is_active: happyHour.is_active !== undefined ? happyHour.is_active : true,
      });
    } else {
      setFormData({
        name: '',
        start_time: '',
        end_time: '',
        days_of_week: [],
        discount_percentage: 0,
        discount_fixed: 0,
        applicable_categories: [],
        applicable_products: [],
        is_active: true,
      });
    }
    setError(null);
  }, [happyHour, show]);

  const loadProductsAndCategories = async () => {
    setLoadingProducts(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        happyHourApi.getProducts(),
        happyHourApi.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading products/categories:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.start_time || !formData.end_time || formData.days_of_week.length === 0) {
      setError('Numele, orele și zilele sunt obligatorii.');
      return;
    }

    if (!formData.discount_percentage && !formData.discount_fixed) {
      setError('Trebuie să specifici fie discount procentual, fie discount fix.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: JSON.stringify(formData.days_of_week),
        discount_percentage: formData.discount_percentage || 0,
        discount_fixed: formData.discount_fixed || 0,
        applicable_categories: JSON.stringify(formData.applicable_categories),
        applicable_products: JSON.stringify(formData.applicable_products),
        is_active: formData.is_active,
      });
    } catch (err: any) {
      setError(err?.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const days = [
    { value: '0', label: 'Luni' },
    { value: '1', label: 'Marți' },
    { value: '2', label: 'Miercuri' },
    { value: '3', label: 'Joi' },
    { value: '4', label: 'Vineri' },
    { value: '5', label: 'Sâmbătă' },
    { value: '6', label: 'Duminică' },
  ];

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-clock me-2"></i>
          {happyHour ? 'Editează Happy Hour' : 'Happy Hour Nou'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Nume Happy Hour *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              placeholder="ex happy hour dimineata"
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Ora de început *</Form.Label>
              <Form.Control
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Ora de sfârșit *</Form.Label>
              <Form.Control
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Zile săptămânii *</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {days.map((day) => (
                <Button
                  key={day.value}
                  variant={formData.days_of_week.includes(day.value) ? 'warning' : 'outline-warning'}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
            {formData.days_of_week.length === 0 && (
              <Form.Text className="text-danger">"selecteaza cel putin o zi"</Form.Text>
            )}
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Discount Procentual (%)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData((prev) => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                placeholder="ex: 20"
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Discount Fix (RON)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.discount_fixed}
                onChange={(e) => setFormData((prev) => ({ ...prev, discount_fixed: parseFloat(e.target.value) || 0 }))}
                placeholder="ex: 10"
              />
            </Form.Group>
          </div>

          {loadingProducts ? (
            <div className="text-center my-3">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Se încarcă produse și categorii...
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Categorii aplicabile (opțional)</Form.Label>
                  <Form.Select
                    multiple
                    value={formData.applicable_categories}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData((prev) => ({ ...prev, applicable_categories: selected }));
                    }}
                    size={5}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Ține apăsat Ctrl/Cmd pentru selecție multiplă
                  </Form.Text>
                </Form.Group>
              )}

              {products.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Produse aplicabile (opțional)</Form.Label>
                  <Form.Select
                    multiple
                    value={formData.applicable_products}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData((prev) => ({ ...prev, applicable_products: selected }));
                    }}
                    size={8}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id.toString()}>
                        {product.name} {product.category ? `(${product.category})` : ''}
                        {product.price ? ` - ${product.price} RON` : ''}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Ține apăsat Ctrl/Cmd pentru selecție multiplă. Dacă nu selectezi niciun produs, discount-ul se aplică tuturor.
                  </Form.Text>
                </Form.Group>
              )}
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Activ"
              checked={formData.is_active}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
          </Form.Group>

          <Form.Text className="text-muted">
            * Câmpuri obligatorii. Trebuie să specifici fie discount procentual, fie discount fix.
          </Form.Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>"Anulează"</Button>
          <Button variant="warning" type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>"se salveaza"</>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Salvează
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};




