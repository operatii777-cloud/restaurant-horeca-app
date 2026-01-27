// import { useTranslation } from '@/i18n/I18nContext';
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
//   const { t } = useTranslation();
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
          Filtrare & Sortare Avansată Categorii
        </span>
        <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
      </Card.Header>
      {expanded && (
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>"filtrare dupa categorie"</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                >
                  <option value="">"toate categoriile"</option>
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
                <Form.Label>"sortare dupa"</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as 'name' | 'productCount' | 'price', sortOrder)}
                >
                  <option value="name">Nume</option>
                  <option value="productCount">"numar produse"</option>
                  <option value="price">"pret mediu"</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Ordine</Form.Label>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => onSortChange(sortBy, e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">"Crescător"</option>
                  <option value="desc">"Descrescător"</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={onClear}>
              <i className="fas fa-times me-2"></i>"sterge filtrele"</Button>
          </div>
        </Card.Body>
      )}
    </Card>
  );
};




