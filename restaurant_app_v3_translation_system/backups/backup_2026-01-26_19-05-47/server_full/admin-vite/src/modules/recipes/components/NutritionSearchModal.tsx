// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/shared/components/Modal';
import { httpClient } from '@/shared/api/httpClient';
import './NutritionSearchModal.css';

interface NutritionData {
  id: number;
  name: string;
  name_en?: string;
  energy_kcal?: number;
  energy_kj?: number;
  protein?: number;
  carbs?: number;
  sugars?: number;
  fat?: number;
  saturated_fat?: number;
  fiber?: number;
  salt?: number;
  unit?: string;
}

interface NutritionSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (nutrition: NutritionData) => void;
  searchTerm?: string;
}

export function NutritionSearchModal({ open, onClose, onSelect, searchTerm = '' }: NutritionSearchModalProps) {
//   const { t } = useTranslation();
  const [search, setSearch] = useState(searchTerm);
  const [ingredients, setIngredients] = useState<NutritionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSearch(searchTerm);
      if (searchTerm) {
        performSearch(searchTerm);
      }
    }
  }, [open, searchTerm]);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setIngredients([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/ingredient-catalog', {
        params: {
          search: term,
          limit: 50,
        },
      });
      const data = response.data;
      if (data.success && data.ingredients) {
        setIngredients(data.ingredients);
      } else {
        setIngredients([]);
      }
    } catch (err: any) {
      console.error('Error searching ingredients:', err);
      setError(err.response?.data?.error || 'Eroare la căutarea ingredientelor.');
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim().length >= 2) {
      performSearch(value);
    } else {
      setIngredients([]);
    }
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const hasNutrition =
        ing.energy_kcal !== null && ing.energy_kcal !== undefined ||
        ing.protein !== null && ing.protein !== undefined ||
        ing.carbs !== null && ing.carbs !== undefined ||
        ing.fat !== null && ing.fat !== undefined;
      return hasNutrition;
    });
  }, [ingredients]);

  const handleSelect = (ingredient: NutritionData) => {
    onSelect(ingredient);
    onClose();
  };

  return (
    <Modal isOpen={open} title='🔍 cautare date nutritionale' size="lg" onClose={onClose}>
      <div className="nutrition-search-modal">
        <div className="nutrition-search-input">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Caută ingredient (min. 2 caractere)..."
            autoFocus
          />
          {loading && <span className="spinner-border spinner-border-sm ms-2" />}
        </div>

        {error && (
          <div className="alert alert-danger mt-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {!loading && !error && search.trim().length < 2 && (
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle me-2"></i>
            Introdu minim 2 caractere pentru a căuta.
          </div>
        )}

        {!loading && !error && search.trim().length >= 2 && filteredIngredients.length === 0 && (
          <div className="alert alert-warning mt-3">
            <i className="fas fa-search me-2"></i>
            Nu s-au găsit ingrediente cu date nutriționale pentru "{search}".
          </div>
        )}

        {filteredIngredients.length > 0 && (
          <div className="nutrition-results mt-3">
            <h6 className="mb-3">Rezultate ({filteredIngredients.length}):</h6>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Calorii (kcal)</th>
                    <th>Proteine (g)</th>
                    <th>Carbo (g)</th>
                    <th>Grăsimi (g)</th>
                    <th>Acțiune</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ing) => (
                    <tr key={ing.id} className="nutrition-result-row">
                      <td>
                        <strong>{ing.name}</strong>
                        {ing.name_en && <div className="text-muted small">{ing.name_en}</div>}
                      </td>
                      <td>{ing.energy_kcal ?? '-'}</td>
                      <td>{ing.protein ?? '-'}</td>
                      <td>{ing.carbs ?? '-'}</td>
                      <td>{ing.fat ?? '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSelect(ing)}
                          title="selecteaza acest ingredient"
                        >
                          <i className="fas fa-check me-1"></i>
                          Selectează
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}



