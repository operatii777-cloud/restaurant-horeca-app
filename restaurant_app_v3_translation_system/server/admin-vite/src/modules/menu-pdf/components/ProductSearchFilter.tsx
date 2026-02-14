// components/ProductSearchFilter.tsx
import { useState, useMemo } from 'react';
import { Form, InputGroup, Badge } from 'react-bootstrap';
import type { PdfCategory, PdfProduct } from '../hooks/usePdfConfig';

interface ProductSearchFilterProps {
  categories: PdfCategory[];
  onFilterChange?: (filteredCategories: PdfCategory[]) => void;
}

export const ProductSearchFilter = ({ categories, onFilterChange }: ProductSearchFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!searchTerm && !showOnlyVisible) {
      return categories;
    }

    const filtered = categories.map(category => {
      let products = category.products;

      // Filter by visibility
      if (showOnlyVisible) {
        products = products.filter(p => p.display_in_pdf);
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(term) ||
          category.category_name.toLowerCase().includes(term)
        );
      }

      return {
        ...category,
        products,
      };
    }).filter(cat => cat.products.length > 0 || cat.category_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (onFilterChange) {
      onFilterChange(filtered);
    }

    return filtered;
  }, [categories, searchTerm, showOnlyVisible, onFilterChange]);

  const totalProducts = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.products.length, 0);
  }, [categories]);

  const visibleProducts = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.products.length, 0);
  }, [filteredCategories]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleVisibilityToggle = (checked: boolean) => {
    setShowOnlyVisible(checked);
  };

  return (
    <div className="product-search-filter mb-3">
      <InputGroup>
        <InputGroup.Text>
          <i className="fas fa-search" />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Caută produse sau categorii..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => handleSearchChange('')}
            title="Șterge căutarea"
          >
            <i className="fas fa-times" />
          </button>
        )}
      </InputGroup>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <Form.Check
          type="switch"
          id="show-only-visible"
          label="Doar produse vizibile"
          checked={showOnlyVisible}
          onChange={(e) => handleVisibilityToggle(e.target.checked)}
        />

        <div className="text-muted small">
          {visibleProducts !== totalProducts ? (
            <>
              <Badge bg="primary">{visibleProducts}</Badge>
              {' '}din{' '}
              <Badge bg="secondary">{totalProducts}</Badge>
              {' '}produse
            </>
          ) : (
            <>
              <Badge bg="secondary">{totalProducts}</Badge>
              {' '}produse
            </>
          )}
        </div>
      </div>
    </div>
  );
};
