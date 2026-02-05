// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Form, Badge, Button } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import './AllergenSelector.css';

interface Allergen {
  id: number;
  name: string;
  name_en?: string;
  code?: string;
  display_order?: number;
}

interface AllergenSelectorProps {
  value: string; // Comma-separated allergen names or JSON array
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const AllergenSelector = ({ value, onChange, label = 'Alergeni', placeholder = 'Selectează alergeni...' }: AllergenSelectorProps) => {
  //   const { t } = useTranslation();
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllergens();
  }, []);

  useEffect(() => {
    // Parse value to get selected IDs
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setSelectedIds(parsed);
        } else {
          // If it's a comma-separated string, try to match by name
          const names = value.split(',').map(s => s.trim());
          const ids = allergens
            .filter(a => names.includes(a.name) || names.includes(a.name_en || ''))
            .map(a => a.id);
          setSelectedIds(ids);
        }
      } catch {
        // If not JSON, treat as comma-separated string
        const names = value.split(',').map(s => s.trim());
        const ids = allergens
          .filter(a => names.includes(a.name) || names.includes(a.name_en || ''))
          .map(a => a.id);
        setSelectedIds(ids);
      }
    } else {
      setSelectedIds([]);
    }
  }, [value, allergens]);

  const loadAllergens = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/ingredient-catalog/allergens');
      if (response.data.success && response.data.allergens) {
        setAllergens(response.data.allergens);
      }
    } catch (error) {
      console.error('Error loading allergens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (allergenId: number) => {
    const newSelected = selectedIds.includes(allergenId)
      ? selectedIds.filter(id => id !== allergenId)
      : [...selectedIds, allergenId];

    setSelectedIds(newSelected);

    // Update parent with JSON array of IDs
    onChange(JSON.stringify(newSelected));
  };

  const filteredAllergens = allergens.filter(a =>
    (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.name_en && a.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.code && a.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedAllergens = allergens.filter(a => selectedIds.includes(a.id));

  return (
    <div className="allergen-selector">
      <Form.Label>{label}</Form.Label>

      {/* Selected allergens display */}
      {selectedAllergens.length > 0 && (
        <div className="selected-allergens mb-2">
          {selectedAllergens.map(allergen => (
            <Badge
              key={allergen.id}
              bg="primary"
              className="me-2 mb-2"
              style={{ cursor: 'pointer', fontSize: '0.875rem', padding: '0.5rem' }}
              onClick={() => handleToggle(allergen.id)}
            >
              {allergen.name}
              {allergen.code && ` (${allergen.code})`}
              <i className="fas fa-times ms-2"></i>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />

      {/* Allergens list */}
      {loading ? (
        <div className="text-muted text-center py-2">
          <i className="fas fa-spinner fa-spin me-2"></i>"se incarca alergenii"</div>
      ) : (
        <div className="allergens-list">
          {filteredAllergens.length === 0 ? (
            <div className="text-muted text-center py-2">
              {searchTerm ? 'Nu s-au găsit alergeni.' : 'Nu există alergeni în catalog.'}
            </div>
          ) : (
            filteredAllergens.map(allergen => (
              <div
                key={allergen.id}
                className={`allergen-item ${selectedIds.includes(allergen.id) ? 'selected' : ''}`}
                onClick={() => handleToggle(allergen.id)}
              >
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.includes(allergen.id)}
                  onChange={() => handleToggle(allergen.id)}
                  label={
                    <span>
                      <strong>{allergen.name}</strong>
                      {allergen.name_en && <span className="text-muted ms-2">({allergen.name_en})</span>}
                      {allergen.code && <span className="text-muted ms-2">[{allergen.code}]</span>}
                    </span>
                  }
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};




