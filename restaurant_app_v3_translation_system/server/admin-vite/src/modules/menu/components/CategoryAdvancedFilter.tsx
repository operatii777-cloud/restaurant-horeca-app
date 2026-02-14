import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import './CategoryAdvancedFilter.css';

interface CategoryAdvancedFilterProps {
  categories: string[];
  selectedCategory: string;
  sortBy: 'name' | 'productCount' | 'price';
  sortOrder: 'asc' | 'desc';
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: 'name' | 'productCount' | 'price', sortOrder: 'asc' | 'desc') => void;
  onClear: () => void;
}

export const CategoryAdvancedFilter = ({
  categories,
  selectedCategory,
  sortBy,
  sortOrder,
  onCategoryChange,
  onSortChange,
  onClear,
}: CategoryAdvancedFilterProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="category-advanced-filter mb-3">
      <Card.Header
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          <i className="fas fa-filter me-2"></i>
          {t('menu.categoryFilter.title')}
        </span>
        <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
      </Card.Header>
      {expanded && (
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('menu.categoryFilter.category')}</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                >
                  <option value="">{t('menu.categoryFilter.allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('common.name')}</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as 'name' | 'productCount' | 'price', sortOrder)}
                >
                  <option value="name">{t('common.name')}</option>
                  <option value="productCount">{t('menu.categories.products')}</option>
                  <option value="price">{t('common.price')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('common.status')}</Form.Label>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => onSortChange(sortBy, e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">{t('common.active')}</option>
                  <option value="desc">{t('common.inactive')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={onClear}>
              <i className="fas fa-times me-2"></i>Șterge filtrele</Button>
          </div>
        </Card.Body>
      )}
    </Card>
  );
};




