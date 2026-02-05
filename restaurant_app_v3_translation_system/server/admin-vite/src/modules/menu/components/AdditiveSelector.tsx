// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Form, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import './AdditiveSelector.css';

interface Additive {
  id: number;
  name: string;
  name_en?: string;
  e_code?: string;
  description?: string;
}

interface AdditiveSelectorProps {
  value: string; // JSON array of additive IDs
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const AdditiveSelector = ({ value, onChange, label = 'Aditivi', placeholder = 'Selectează aditivi...' }: AdditiveSelectorProps) => {
  //   const { t } = useTranslation();
  const [additives, setAdditives] = useState<Additive[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAdditives();
  }, []);

  useEffect(() => {
    // Parse value to get selected IDs
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setSelectedIds(parsed);
        }
      } catch {
        setSelectedIds([]);
      }
    } else {
      setSelectedIds([]);
    }
  }, [value]);

  const loadAdditives = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/ingredient-catalog/additives');
      if (response.data.success && response.data.additives) {
        setAdditives(response.data.additives);
      }
    } catch (error) {
      console.error('Error loading additives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (additiveId: number) => {
    const newSelected = selectedIds.includes(additiveId)
      ? selectedIds.filter(id => id !== additiveId)
      : [...selectedIds, additiveId];

    setSelectedIds(newSelected);
    onChange(JSON.stringify(newSelected));
  };

  const filteredAdditives = additives.filter(a =>
    (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.name_en && a.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.e_code && a.e_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedAdditives = additives.filter(a => selectedIds.includes(a.id));

  return (
    <div className="additive-selector">
      <Form.Label>{label}</Form.Label>

      {/* Selected additives display */}
      {selectedAdditives.length > 0 && (
        <div className="selected-additives mb-2">
          {selectedAdditives.map(additive => (
            <Badge
              key={additive.id}
              bg="warning"
              text="dark"
              className="me-2 mb-2"
              style={{ cursor: 'pointer', fontSize: '0.875rem', padding: '0.5rem' }}
              onClick={() => handleToggle(additive.id)}
            >
              {additive.e_code || additive.name}
              {additive.name && additive.e_code && ` - ${additive.name}`}
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

      {/* Additives list */}
      {loading ? (
        <div className="text-muted text-center py-2">
          <i className="fas fa-spinner fa-spin me-2"></i>"se incarca aditivi"</div>
      ) : (
        <div className="additives-list">
          {filteredAdditives.length === 0 ? (
            <div className="text-muted text-center py-2">
              {searchTerm ? 'Nu s-au găsit aditivi.' : 'Nu există aditivi în catalog.'}
            </div>
          ) : (
            filteredAdditives.map(additive => (
              <div
                key={additive.id}
                className={`additive-item ${selectedIds.includes(additive.id) ? 'selected' : ''}`}
                onClick={() => handleToggle(additive.id)}
              >
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.includes(additive.id)}
                  onChange={() => handleToggle(additive.id)}
                  label={
                    <span>
                      <strong>{additive.e_code || additive.name}</strong>
                      {additive.name && additive.e_code && <span className="ms-2">{additive.name}</span>}
                      {additive.name_en && <span className="text-muted ms-2">({additive.name_en})</span>}
                    </span>
                  }
                />
                {additive.description && (
                  <div className="text-muted small ms-4">{additive.description}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};




